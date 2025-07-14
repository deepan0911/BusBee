require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const cookieSession = require("cookie-session");

// Passport config
require("./middleware/passport"); // Make sure this file exists and is set up

// Route imports
const authRoutes = require("./routes/auth");
const busRoutes = require("./routes/bus");
const bookingRoutes = require("./routes/booking");
const adminRoutes = require("./routes/admin");
const paymentRoutes = require("./routes/payment");



const app = express();

// ─── Middleware ───────────────────────────
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Serve Static Files ───────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Database Connection ──────────────────
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ─── API Routes ────────────────────────────
app.use("/api/auth", authRoutes);        // Includes Google Auth
app.use("/api/buses", busRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);

// ─── Serve Frontend in Production ─────────
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
  });
}

// ─── Global Error Handler ─────────────────
app.use((err, req, res, next) => {
  console.error("❗", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// ─── Start Server ─────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
