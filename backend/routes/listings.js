const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const Listing = require("../models/Listing");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { uploadImage } = require("../services/gcs");

const MAX_IMAGES_PER_LISTING = 3;

const listingUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

async function uploadImageWithFallback(file) {
  try {
    const uploaded = await uploadImage(file);
    return {
      url: uploaded.publicUrl,
      storage: "gcs",
    };
  } catch (err) {
    const uploadsDir = path.join(__dirname, "..", "uploads", "listings");
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const safeOriginalName = String(file.originalname || "image")
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "-");
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeOriginalName}`;
    const localPath = path.join(uploadsDir, fileName);

    await fs.promises.writeFile(localPath, file.buffer);
    console.warn(`[listings:create] GCS upload failed, saved locally: ${err.message}`);

    return {
      url: `/uploads-local/listings/${fileName}`,
      storage: "local",
    };
  }
}

function parseStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeListingPayload(body) {
  const numericPrice = Number(body.pricePerNight ?? body.price);

  return {
    title: typeof body.title === "string" ? body.title.trim() : "",
    location: typeof body.location === "string" ? body.location.trim() : "",
    description: typeof body.description === "string" ? body.description.trim() : "",
    pricePerNight: numericPrice,
    amenities: parseStringArray(body.amenities),
    images: parseStringArray(body.images),
    available: body.available !== false
  };
}

function validateListingPayload(payload) {
  if (!payload.title || !payload.location || !payload.description) {
    return "Title, location, and description are required";
  }

  if (!Number.isFinite(payload.pricePerNight) || payload.pricePerNight <= 0) {
    return "Price per night must be a positive number";
  }

  if (payload.images.length > MAX_IMAGES_PER_LISTING) {
    return `You can upload up to ${MAX_IMAGES_PER_LISTING} images per listing`;
  }

  return null;
}

function buildOwnedListingFilter(user, listingId) {
  if (user.role === "admin") {
    return { _id: listingId };
  }

  return { _id: listingId, host: user.id };
}

// Get all listings (public)
router.get("/", async (req, res) => {
  try {
    const listings = await Listing.find({ available: true })
      .sort({ createdAt: -1 })
      .populate("host", "name email");
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// Get listings for the logged-in host
router.get("/mine", authenticateToken, authorizeRoles("host", "admin"), async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { host: req.user.id };
    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .populate("host", "name email");
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch host listings" });
  }
});

// Add new listing (Host/Admin)
router.post("/", authenticateToken, authorizeRoles("host", "admin"), listingUpload.array("images", MAX_IMAGES_PER_LISTING), async (req, res) => {
  try {
    console.log(
      `[listings:create] userId=${req.user.id} role=${req.user.role} files=${Array.isArray(req.files) ? req.files.length : 0}`
    );

    const payload = normalizeListingPayload(req.body);

    if (req.files && req.files.length > 0) {
      const uploaded = await Promise.all(req.files.map((file) => uploadImageWithFallback(file)));
      payload.images = uploaded.map((item) => item.url);
      const storageSummary = uploaded.reduce((acc, item) => {
        acc[item.storage] = (acc[item.storage] || 0) + 1;
        return acc;
      }, {});
      console.log(`[listings:create] uploaded ${payload.images.length} image(s): ${JSON.stringify(storageSummary)}`);
    }

    if (!Array.isArray(payload.images) || payload.images.length === 0) {
      console.warn("[listings:create] rejected - no images provided");
      return res.status(400).json({ error: "At least one image is required to publish a listing" });
    }

    const validationError = validateListingPayload(payload);

    if (validationError) {
      console.warn(`[listings:create] rejected - validation error: ${validationError}`);
      return res.status(400).json({ error: validationError });
    }

    const newListing = new Listing({
      ...payload,
      host: req.user.id // attach logged-in host ID
    });
    await newListing.save();

    const createdListing = await Listing.findById(newListing._id).populate("host", "name email");
    console.log(`[listings:create] success listingId=${newListing._id}`);
    res.status(201).json(createdListing);
  } catch (err) {
    console.error("[listings:create] failed:", err.message);
    res.status(400).json({ error: err.message || "Failed to create listing" });
  }
});

// Update listing (Host owner or admin)
router.patch("/:id", authenticateToken, authorizeRoles("host", "admin"), async (req, res) => {
  try {
    const payload = normalizeListingPayload(req.body);
    const validationError = validateListingPayload(payload);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const updatedListing = await Listing.findOneAndUpdate(
      buildOwnedListingFilter(req.user, req.params.id),
      payload,
      { new: true, runValidators: true }
    ).populate("host", "name email");

    if (!updatedListing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json(updatedListing);
  } catch (err) {
    res.status(400).json({ error: "Failed to update listing" });
  }
});

// Delete listing (Host owner or admin)
router.delete("/:id", authenticateToken, authorizeRoles("host", "admin"), async (req, res) => {
  try {
    const deletedListing = await Listing.findOneAndDelete(
      buildOwnedListingFilter(req.user, req.params.id)
    );

    if (!deletedListing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ message: "Listing deleted successfully", id: deletedListing._id });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete listing" });
  }
});

// Search listings (public)
router.post("/search", async (req, res) => {
  const query = (req.body.query || "").trim();
  try {
    const filter = query
      ? {
          available: true,
          $or: [
            { title: { $regex: query, $options: "i" } },
            { location: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { amenities: { $regex: query, $options: "i" } }
          ]
        }
      : { available: true };

    const results = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .populate("host", "name email");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;