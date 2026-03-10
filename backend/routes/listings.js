const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");

// Get all listings
router.get("/", async (req, res) => {
  const listings = await Listing.find();
  res.json(listings);
});

// Add new listing
router.post("/", async (req, res) => {
  const newListing = new Listing(req.body);
  await newListing.save();
  res.json(newListing);
});

// Search listings
router.post("/search", async (req, res) => {
  const { query } = req.body;
  try {
    const results = await Listing.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
      ]
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;