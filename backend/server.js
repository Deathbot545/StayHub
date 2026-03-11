const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const { initializeGCS } = require("./services/gcs");

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json());
app.use("/uploads-local", express.static(path.join(__dirname, "uploads")));

// Routes
const listingsRoute = require("./routes/listings");
const bookingsRoute = require("./routes/bookings");
const authRoute = require("./routes/auth");
const adminRoute = require("./routes/admin");
const uploadsRoute = require("./routes/uploads");

app.use("/listings", listingsRoute);
app.use("/bookings", bookingsRoute);
app.use("/book", bookingsRoute);
app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.use("/uploads", uploadsRoute);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Initialize Google Cloud Storage
initializeGCS()
  .then((success) => {
    if (!success) {
      console.warn("⚠️ GCS initialization failed. Cloud uploads are unavailable; local upload fallback is enabled.");
    }
  })
  .catch(err => console.error("GCS init error:", err));

// Simple route
app.get("/", (req, res) => {
  res.send("StayHub backend running...");
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));