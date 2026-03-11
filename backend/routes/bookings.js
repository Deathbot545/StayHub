const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Create a booking (Guest only)
router.post("/", authenticateToken, authorizeRoles("guest"), async (req, res) => {
  const { listingId, checkIn, checkOut } = req.body;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing || !listing.available) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const nightCount = Math.ceil((endDate - startDate) / millisecondsPerDay);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || nightCount <= 0) {
      return res.status(400).json({ error: "Invalid booking dates" });
    }

    const totalPrice = nightCount * listing.pricePerNight;

    const newBooking = new Booking({
      guest: req.user.id, // logged-in guest ID
      listing: listingId,
      checkIn: startDate,
      checkOut: endDate,
      totalPrice,
      status: "confirmed"
    });

    await newBooking.save();

    // Simulate workflow (email + calendar)
    console.log(`Booking confirmed for listing ${listingId}, guest ${req.user.id}`);
    console.log(`Calendar updated with booking from ${checkIn} to ${checkOut}`);

    res.status(201).json({
      message: "Booking confirmed",
      booking: newBooking,
      summary: {
        listingTitle: listing.title,
        checkIn,
        checkOut,
        totalPrice,
        nights: nightCount
      }
    });
  } catch (err) {
    res.status(400).json({ error: "Booking failed" });
  }
});

module.exports = router;