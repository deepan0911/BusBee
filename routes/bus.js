const express = require("express")
const Bus = require("../models/Bus")
const { auth, adminAuth } = require("../middleware/auth")
const router = express.Router()

// Search buses
router.get("/search", async (req, res) => {
  try {
    console.log("Bus search query:", req.query)
    const { from, to, date, busType } = req.query

    const query = {}

    if (from && to) {
      query["route.from"] = new RegExp(from, "i")
      query["route.to"] = new RegExp(to, "i")
    }

    if (busType) {
      query.busType = busType
    }

    // Filter by departure date if provided
    if (date) {
      const searchDate = new Date(date)
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0))
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999))

      query["schedule.departureDate"] = {
        $gte: startOfDay,
        $lte: endOfDay,
      }
    }

    query.isActive = true

    console.log("Final search query:", JSON.stringify(query, null, 2))

    const buses = await Bus.find(query).populate("reviews.user", "name").sort({ "schedule.departureTime": 1 })

    console.log(`Found ${buses.length} buses`)
    res.json(buses)
  } catch (error) {
    console.error("Bus search error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get bus by ID
router.get("/:id", async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate("reviews.user", "name")

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" })
    }

    res.json(bus)
  } catch (error) {
    console.error("Get bus error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create bus (Admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    console.log("Creating bus with data:", req.body)

    // Validate required fields
    const { busNumber, operatorName, busType, totalSeats, route, schedule, price } = req.body

    if (!busNumber || !operatorName || !busType || !totalSeats || !route || !schedule || !price) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["busNumber", "operatorName", "busType", "totalSeats", "route", "schedule", "price"],
      })
    }

    // Validate schedule fields
    if (!schedule.departureDate || !schedule.departureTime || !schedule.travelHours) {
      return res.status(400).json({
        message: "Missing schedule fields",
        required: ["departureDate", "departureTime", "travelHours"],
      })
    }

    // Check if bus number already exists
    const existingBus = await Bus.findOne({ busNumber })
    if (existingBus) {
      return res.status(400).json({ message: "Bus number already exists" })
    }

    // Set available seats equal to total seats for new bus
    const busData = {
      ...req.body,
      availableSeats: totalSeats,
    }

    const bus = new Bus(busData)
    await bus.save()

    console.log("Bus created successfully:", bus._id)
    res.status(201).json(bus)
  } catch (error) {
    console.error("Create bus error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update bus (Admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    console.log("Updating bus:", req.params.id, "with data:", req.body)

    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true })

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" })
    }

    console.log("Bus updated successfully:", bus._id)
    res.json(bus)
  } catch (error) {
    console.error("Update bus error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete bus (Admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    console.log("Deleting bus:", req.params.id)

    const bus = await Bus.findByIdAndDelete(req.params.id)

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" })
    }

    console.log("Bus deleted successfully:", req.params.id)
    res.json({ message: "Bus deleted successfully" })
  } catch (error) {
    console.error("Delete bus error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all buses (Admin only)
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    console.log("Fetching all buses for admin")
    const buses = await Bus.find().sort({ createdAt: -1 })
    console.log(`Found ${buses.length} buses`)
    res.json(buses)
  } catch (error) {
    console.error("Get all buses error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
