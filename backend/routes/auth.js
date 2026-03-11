const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function buildAuthPayload(user) {
  return {
    token: jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" }),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = ["guest", "host", "admin"].includes(role) ? role : "guest";

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    if (!name || !normalizedEmail || !password || password.length < 6) {
      return res.status(400).json({ error: "Name, email, and a 6 character password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole
    });
    await newUser.save();

    res.status(201).json({
      message: "Signup successful",
      ...buildAuthPayload(newUser)
    });
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json(buildAuthPayload(user));
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout (client just deletes token)
router.post("/logout", (req, res) => {
  res.json({ message: "Logout successful" });
});

module.exports = router;