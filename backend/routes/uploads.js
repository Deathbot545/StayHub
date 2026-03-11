const express = require("express");
const multer = require("multer");
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

      const result = await uploadImage(req.file);
      res.status(201).json({
        url: result.publicUrl,
        fileName: result.fileName,
        size: result.size,
        storage: "gcs",
      });
    } catch (err) {
      res.status(400).json({ error: `GCS upload failed: ${err.message}` });
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

      const results = await Promise.all(req.files.map((file) => uploadImage(file)));
      res.status(201).json({
        images: results.map((r) => ({
          url: r.publicUrl,
          fileName: r.fileName,
          size: r.size,
          storage: "gcs",
        })),
      });
    } catch (err) {
      res.status(400).json({ error: `GCS upload failed: ${err.message}` });
    }
  }
);

module.exports = router;
