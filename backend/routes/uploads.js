const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { uploadImage } = require("../services/gcs");

// Store files in memory before uploading to GCS
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

async function uploadImageWithFallback(file) {
  try {
    const result = await uploadImage(file);
    return {
      url: result.publicUrl,
      fileName: result.fileName,
      size: result.size,
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

    console.warn(`GCS upload failed, saved locally instead: ${err.message}`);

    return {
      url: `/uploads-local/listings/${fileName}`,
      fileName: `listings/${fileName}`,
      size: file.size,
      storage: "local",
    };
  }
}

// Upload single image (authenticated hosts/admins)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("host", "admin"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const result = await uploadImageWithFallback(req.file);
      res.status(201).json({
        url: result.url,
        fileName: result.fileName,
        size: result.size,
        storage: result.storage,
      });
    } catch (err) {
      res.status(400).json({ error: err.message || "Upload failed" });
    }
  }
);

// Upload multiple images (authenticated hosts/admins)
router.post(
  "/batch",
  authenticateToken,
  authorizeRoles("host", "admin"),
  upload.array("images", 10), // Max 10 files per request
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No image files provided" });
      }

      const results = await Promise.all(req.files.map((file) => uploadImageWithFallback(file)));
      res.status(201).json({
        images: results.map((r) => ({
          url: r.url,
          fileName: r.fileName,
          size: r.size,
          storage: r.storage,
        })),
      });
    } catch (err) {
      res.status(400).json({ error: err.message || "Batch upload failed" });
    }
  }
);

module.exports = router;
