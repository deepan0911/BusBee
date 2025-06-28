const express = require("express")
const Booking = require("../models/Booking")
const Bus = require("../models/Bus")
const User = require("../models/User")
const { adminAuth } = require("../middleware/auth")
const router = express.Router()

// Dashboard stats
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" })
    const totalBuses = await Bus.countDocuments()
    const totalBookings = await Booking.countDocuments()
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate("user", "name email")
      .populate("bus", "busNumber operatorName")
      .sort({ createdAt: -1 })
      .limit(10)

    // Monthly revenue
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "completed",
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    res.json({
      stats: {
        totalUsers,
        totalBuses,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentBookings,
      monthlyRevenue,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all bookings
router.get("/bookings", adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email phone")
      .populate("bus", "busNumber operatorName route")
      .sort({ createdAt: -1 })

    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all users
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 })

    res.json(users)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
