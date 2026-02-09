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
const operatorRoutes = require("./routes/operator");



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

const allowedOrigins = [
  "http://localhost:3000",
  "https://bus-bee.vercel.app",
  "https://bus-bee-deepan0911.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-rtb-fingerprint-id"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Serve Static Files ───────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Database Connection ──────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ Connected to MongoDB Atlas");
    console.log(`📍 Database Host: ${conn.connection.host}`);

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    console.error("📋 Connection Details:");
    console.error("   - Check if your IP is whitelisted in MongoDB Atlas");
    console.error("   - Verify your MongoDB credentials");
    console.error("   - Ensure your internet connection is stable");

    // Retry connection after 5 seconds
    console.log("🔄 Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// ─── API Routes ────────────────────────────
app.use("/api/auth", authRoutes);        // Includes Google Auth
app.use("/api/buses", busRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/operator", operatorRoutes);

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
