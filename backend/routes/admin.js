const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const User = require("../models/User");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Admin: Get all users
router.get("/users", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password"); // hide password
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Admin: Approve a listing
router.put("/listings/:id/approve", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    listing.available = true; // mark as approved/available
    await listing.save();

    res.json({ message: "Listing approved", listing });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve listing" });
  }
});

// Admin: Reject a listing
router.put("/listings/:id/reject", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    listing.available = false; // mark as rejected/unavailable
    await listing.save();

    res.json({ message: "Listing rejected", listing });
  } catch (err) {
    res.status(500).json({ error: "Failed to reject listing" });
  }
});

// Admin: Delete a user
router.delete("/users/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;