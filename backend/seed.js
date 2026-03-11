const mongoose = require("mongoose");
const Listing = require("./models/Listing");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    const host = await User.findOneAndUpdate(
      { email: "host@stayhub.lk" },
      {
        name: "StayHub Host",
        email: "host@stayhub.lk",
        password: "$2b$10$gMS8hZckhV3sI5Yucs5cjux96D65gis6pZeRAEIJ5zsxFrqxbPjz6",
        role: "host"
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const sampleListings = [
      {
        title: "Palm Horizon Villa",
        location: "Galle",
        pricePerNight: 185,
        amenities: ["WiFi", "Breakfast", "Ocean View", "Pool"],
        description: "A design-led beach villa minutes from Unawatuna with open-air dining and direct sunset views.",
        images: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"],
        host: host._id
      },
      {
        title: "Temple Street Courtyard",
        location: "Kandy",
        pricePerNight: 72,
        amenities: ["Breakfast", "Family Friendly", "Garden", "Parking"],
        description: "A quiet hill-country courtyard stay near the lake, suited to slow mornings and city walks.",
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"],
        host: host._id
      },
      {
        title: "Tea Trail Eco Lodge",
        location: "Ella",
        pricePerNight: 98,
        amenities: ["WiFi", "Nature View", "Balcony", "Breakfast"],
        description: "Timber cabins tucked into tea country with ridge-line views and easy access to hiking trails.",
        images: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"],
        host: host._id
      },
      {
        title: "Colombo Harbour Residences",
        location: "Colombo",
        pricePerNight: 140,
        amenities: ["WiFi", "Air Conditioning", "Pool", "Workspace"],
        description: "A polished apartment for business or leisure stays, close to cafes, the coast, and major transit.",
        images: ["https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"],
        host: host._id
      },
      {
        title: "Sigiriya Canopy Retreat",
        location: "Sigiriya",
        pricePerNight: 110,
        amenities: ["Breakfast", "Nature View", "Safari Access", "WiFi"],
        description: "A tree-level retreat with jungle breezes, ideal for sunrise trips to Sigiriya Rock and village cycling.",
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"],
        host: host._id
      }
    ];

    await Listing.deleteMany({});
    await Listing.insertMany(sampleListings);

    console.log("Sample listings seeded!");
    mongoose.connection.close();
  })
  .catch(err => console.error(err));