const mongoose = require("mongoose");

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

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  location: { type: String, required: true, trim: true },
  category: { type: String, enum: LISTING_CATEGORIES, default: "other", trim: true },
  pricePerNight: { type: Number, required: true },
  amenities: { type: [String], default: [] },
  images: { type: [String], default: [] },
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

listingSchema.virtual("price")
  .get(function getPrice() {
    return this.pricePerNight;
  })
  .set(function setPrice(value) {
    this.pricePerNight = value;
  });

listingSchema.set("toJSON", { virtuals: true });
listingSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Listing", listingSchema);