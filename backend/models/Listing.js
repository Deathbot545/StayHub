const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  title: String,
  location: String,
  price: Number,
  amenities: [String],
  description: String,
  images: [String],
});

module.exports = mongoose.model("Listing", ListingSchema);