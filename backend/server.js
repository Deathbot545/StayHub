const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const listingsRoute = require("./routes/listings");
const bookingsRoute = require("./routes/bookings");
app.use("/listings", listingsRoute);
app.use("/book", bookingsRoute);


// Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://mohamedraaedbucksimiar_db_user:wqCXWkw3QqCvCd4P@cluster0.2rxu8xc.mongodb.net/stayhub?appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Simple route
app.get("/", (req, res) => {
  res.send("StayHub backend running...");
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));