const express = require("express");
const router = express.Router();

// Mock booking workflow
router.post("/", async (req, res) => {
  const { listingId, userEmail } = req.body;

  // Simulate sending confirmation email
  console.log(`Booking confirmed for listing ${listingId}, email sent to ${userEmail}`);

  // Simulate calendar log
  console.log(`Calendar updated with booking for ${listingId}`);

  res.json({
    message: "Booking successful!",
    listingId,
    userEmail
  });
});

module.exports = router;