const mongoose = require("mongoose");
const Listing = require("./models/Listing");

mongoose.connect("mongodb+srv://<username>:<password>@cluster0.2rxu8xc.mongodb.net/stayhub?appName=Cluster0")
  .then(async () => {
    console.log("MongoDB connected");

    const sampleListings = [
      {
        title: "Beach Villa",
        location: "Galle",
        price: 50,
        amenities: ["WiFi", "Breakfast"],
        description: "Beautiful villa near the beach in Galle with ocean views.",
        images: ["villa.jpg"]
      },
      {
        title: "Homestay",
        location: "Kandy",
        price: 20,
        amenities: ["Breakfast", "Family-friendly"],
        description: "Affordable homestay near Kandy city center with breakfast included.",
        images: ["homestay.jpg"]
      },
      {
        title: "Eco Lodge",
        location: "Ella",
        price: 35,
        amenities: ["WiFi", "Nature view"],
        description: "Eco-friendly lodge surrounded by tea plantations in Ella.",
        images: ["eco.jpg"]
      },
      {
        title: "Luxury Apartment",
        location: "Colombo",
        price: 80,
        amenities: ["WiFi", "Air Conditioning", "Pool"],
        description: "Modern apartment in Colombo with pool access.",
        images: ["apartment.jpg"]
      },
      {
        title: "Treehouse Stay",
        location: "Sigiriya",
        price: 40,
        amenities: ["Breakfast", "Nature view"],
        description: "Unique treehouse stay near Sigiriya Rock.",
        images: ["treehouse.jpg"]
      }
    ];

    await Listing.deleteMany({});
    await Listing.insertMany(sampleListings);

    console.log("Sample listings seeded!");
    mongoose.connection.close();
  })
  .catch(err => console.error(err));