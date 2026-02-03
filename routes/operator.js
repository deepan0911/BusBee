const express = require("express")
const router = express.Router()
const Bus = require("../models/Bus")
const Booking = require("../models/Booking")
const { operatorAuth } = require("../middleware/auth")

// Get operator dashboard stats
router.get("/dashboard", operatorAuth, async (req, res) => {
    try {
        const operatorId = req.user._id

        // 1. Get stats
        const buses = await Bus.find({ operatorId })
        const busIds = buses.map(bus => bus._id)

        const totalBuses = buses.length
        const totalBookings = await Booking.countDocuments({ bus: { $in: busIds } })

        // Calculate total revenue from confirmed bookings
        const bookings = await Booking.find({ bus: { $in: busIds }, status: 'confirmed' })
        const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0)

        // Unique routes count
        const activeRoutes = new Set(buses.map(bus => `${bus.route.from}-${bus.route.to}`)).size

        // 2. Get recent bookings
        const recentBookings = await Booking.find({ bus: { $in: busIds } })
            .populate("user", "name email")
            .populate("bus", "busNumber route")
            .sort({ createdAt: -1 })
            .limit(5)

        res.json({
            stats: {
                totalBuses,
                totalBookings,
                totalRevenue,
                activeRoutes
            },
            recentBookings
        })
    } catch (error) {
        console.error("Dashboard error:", error)
        res.status(500).json({ message: "Server error", error: error.message })
    }
})

module.exports = router
