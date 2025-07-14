const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

// ─────── JWT BASED ─────────────────────

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role = "user" } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ name, email, password, phone, role });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─────── GOOGLE OAUTH ─────────────────────

// @route GET /api/auth/google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account", // 👈 This line forces account chooser every time
  })
)
// @route GET /api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  async (req, res) => {
    try {
      // ✅ `req.user` is already the Mongoose user
      const user = req.user;

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });

      // ✅ Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL}/google-success?token=${token}`);
    } catch (err) {
      res.redirect(`${process.env.CLIENT_URL}/login?error=OAuthFailed`);
    }
  }
);

// Optional: logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect(`${process.env.CLIENT_URL}/`);
  });
});

module.exports = router;
