const express = require("express");
const multer = require("multer");
const router = express.Router();
const Listing = require("../models/Listing");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { uploadImage, deleteImage } = require("../services/gcs");

const MAX_IMAGES_PER_LISTING = 3;
const LISTING_CATEGORIES = [
  "beach",
  "mountain",
  "city",
  "villa",
  "apartment",
  "cabin",
  "boutique",
  "other",
];

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
  const rawCategory = typeof body.category === "string" ? body.category.trim().toLowerCase() : "";
  const normalizedCategory = LISTING_CATEGORIES.includes(rawCategory) ? rawCategory : "other";

  return {
    title: typeof body.title === "string" ? body.title.trim() : "",
    location: typeof body.location === "string" ? body.location.trim() : "",
    description: typeof body.description === "string" ? body.description.trim() : "",
    category: normalizedCategory,
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

  if (!payload.category || !LISTING_CATEGORIES.includes(payload.category)) {
    return "Please select a valid category";
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

function extractGcsObjectName(imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl.trim()) {
    return null;
  }

  const bucketName = process.env.GCS_BUCKET;
  if (!bucketName) {
    return null;
  }

  try {
    const parsed = new URL(imageUrl);
    if (!parsed.hostname.includes("storage.googleapis.com")) {
      return null;
    }

    const directPrefix = `/${bucketName}/`;
    if (parsed.pathname.startsWith(directPrefix)) {
      return decodeURIComponent(parsed.pathname.slice(directPrefix.length));
    }

    const apiPathMatch = parsed.pathname.match(/^\/download\/storage\/v1\/b\/([^/]+)\/o\/(.+)$/);
    if (apiPathMatch && apiPathMatch[1] === bucketName) {
      return decodeURIComponent(apiPathMatch[2]);
    }

    return null;
  } catch (_err) {
    return null;
  }
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

// Get single listing details (public)
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, available: true })
      .populate("host", "name email role");

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json(listing);
  } catch (err) {
    res.status(404).json({ error: "Listing not found" });
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
      const uploaded = await Promise.all(req.files.map((file) => uploadImage(file)));
      payload.images = uploaded.map((item) => item.publicUrl);
      console.log(`[listings:create] uploaded ${payload.images.length} image(s): {\"gcs\":${payload.images.length}}`);
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
    res.status(400).json({ error: `GCS upload failed: ${err.message}` });
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
    const deletedListing = await Listing.findOne(
      buildOwnedListingFilter(req.user, req.params.id)
    );

    if (!deletedListing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const imageUrls = Array.isArray(deletedListing.images) ? deletedListing.images : [];
    const gcsObjectNames = imageUrls
      .map((url) => extractGcsObjectName(url))
      .filter(Boolean);

    if (gcsObjectNames.length > 0) {
      const deleteResults = await Promise.allSettled(gcsObjectNames.map((name) => deleteImage(name)));
      const failedDeletes = deleteResults.filter((result) => result.status === "rejected");
      if (failedDeletes.length > 0) {
        console.warn(
          `[listings:delete] listingId=${deletedListing._id} failed to remove ${failedDeletes.length} GCS image(s)`
        );
      }
    }

    await deletedListing.deleteOne();

    res.json({ message: "Listing deleted successfully", id: deletedListing._id });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete listing" });
  }
});

// Search listings (public)
router.post("/search", async (req, res) => {
  const query = (req.body.query || "").trim();
  const selectedCategory = typeof req.body.category === "string" ? req.body.category.trim().toLowerCase() : "all";
  const hasCategoryFilter = selectedCategory !== "all" && LISTING_CATEGORIES.includes(selectedCategory);

  try {
    const filter = { available: true };
    const andClauses = [];

    if (hasCategoryFilter) {
      if (selectedCategory === "other") {
        andClauses.push({
          $or: [
            { category: "other" },
            { category: { $exists: false } },
            { category: null },
            { category: "" },
          ]
        });
      } else {
        andClauses.push({ category: selectedCategory });
      }
    }

    if (query) {
      andClauses.push({
        $or: [
        { title: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { amenities: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
        ]
      });
    }

    if (andClauses.length > 0) {
      filter.$and = andClauses;
    }

    const results = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .populate("host", "name email");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;