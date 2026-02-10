const express = require("express")
const Bus = require("../models/Bus")
const User = require("../models/User")
const { auth, adminAuth, operatorAuth } = require("../middleware/auth")
const router = express.Router()

// Search buses
router.get("/search", async (req, res) => {
  try {
    // console.log("Bus search query:", req.query)
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

    // console.log("Final search query:", JSON.stringify(query, null, 2))

    const buses = await Bus.find(query).populate("reviews.user", "name").sort({ "schedule.departureTime": 1 })

    // console.log(`Found ${buses.length} buses`)
    res.json(buses)
  } catch (error) {
    // console.error("Bus search error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all unique routes
router.get("/routes/available", async (req, res) => {
  try {
    const buses = await Bus.find({ isActive: true }).select("route")

    // Extract unique routes
    const routesSet = new Set()
    buses.forEach(bus => {
      if (bus.route && bus.route.from && bus.route.to) {
        routesSet.add(JSON.stringify({ from: bus.route.from, to: bus.route.to }))
      }
    })

    // Convert back to array of objects
    const uniqueRoutes = Array.from(routesSet).map(route => JSON.parse(route))

    res.json(uniqueRoutes)
  } catch (error) {
    // console.error("Get routes error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get buses for the logged-in operator
router.get("/operator/my-buses", operatorAuth, async (req, res) => {
  try {
    const operatorId = req.user._id;
    // If admin is requesting, they might want all or specific? 
    // For now, if admin accesses this, it returns buses WHERE THEY are the operator (which might be none).
    // Let's allow query param for admin?
    // KEEP IT SIMPLE: This endpoint is for "My Buses". 

    // Check if admin wants to see a specific operator's buses? 
    // Usually Admin uses /admin/all. 
    // So this is strictly for the Operator Dashboard.

    const buses = await Bus.find({ operatorId }).sort({ createdAt: -1 });
    res.json(buses);
  } catch (error) {
    // console.error("Get operator buses error:", error);
    res.status(500).json({ message: "Server error" });
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
    // console.error("Get bus error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Create bus (Operator or Admin)
router.post("/", operatorAuth, async (req, res) => {
  try {
    // console.log("Creating bus with data:", req.body)

    const { busNumber, operatorName, busType, totalSeats, route, schedule, price } = req.body

    // Basic validation
    if (!busNumber || !busType || !totalSeats || !route || !schedule || !price) {
      return res.status(400).json({
        message: "Missing required fields",
      })
    }

    // Role-based logic
    let operatorId = req.user._id;
    let finalOperatorName = req.body.operatorName;

    if (req.user.role === 'operator') {
      operatorId = req.user._id;
      finalOperatorName = req.user.name; // Enforce operator name matches profile
      if (req.body.operatorName) finalOperatorName = req.body.operatorName; // Allow them to specify a business name
    } else if (req.user.role === 'admin') {
      if (req.body.operatorId) operatorId = req.body.operatorId;
      if (!req.body.operatorName) return res.status(400).json({ message: "Operator Name required for Admin created bus" });
    }

    // Validate schedule fields
    if (!schedule.departureDate || !schedule.departureTime || !schedule.travelHours) {
      return res.status(400).json({
        message: "Missing schedule fields",
        required: ["departureDate", "departureTime", "travelHours"],
      })
    }

    // Calculate arrival details
    const departureDateTimeString = `${schedule.departureDate.split('T')[0]}T${schedule.departureTime}:00`;
    const departureDateObj = new Date(departureDateTimeString);

    // travelHours is in hours (e.g., 10.5)
    // Add hours to the date object
    const arrivalDateObj = new Date(departureDateObj.getTime() + schedule.travelHours * 60 * 60 * 1000);

    // Format arrivalTime as HH:mm
    const arrivalHours = arrivalDateObj.getHours().toString().padStart(2, '0');
    const arrivalMinutes = arrivalDateObj.getMinutes().toString().padStart(2, '0');
    const calculatedArrivalTime = `${arrivalHours}:${arrivalMinutes}`;

    // Calculate duration string (e.g., "10h 30m")
    const hours = Math.floor(schedule.travelHours);
    const minutes = Math.round((schedule.travelHours - hours) * 60);
    const calculatedDuration = `${hours}h ${minutes}m`;

    const updatedSchedule = {
      ...schedule,
      arrivalDate: arrivalDateObj,
      arrivalTime: calculatedArrivalTime,
      duration: calculatedDuration
    };

    // Check if bus number already exists
    // Check if bus number already exists for the same date
    const existingBus = await Bus.findOne({
      busNumber,
      "schedule.departureDate": {
        $gte: new Date(departureDateObj.setHours(0, 0, 0, 0)),
        $lt: new Date(departureDateObj.setHours(23, 59, 59, 999))
      }
    })
    if (existingBus) {
      return res.status(400).json({ message: "Bus already scheduled for this date" })
    }

    // Set available seats equal to total seats for new bus
    const busData = {
      ...req.body,
      operatorId,
      operatorName: finalOperatorName,
      availableSeats: totalSeats,
      schedule: updatedSchedule
    }

    const bus = new Bus(busData)
    await bus.save()

    // Auto-verify operator if they are pending (first bus added)
    if (operatorId) {
      const operatorUser = await User.findById(operatorId);
      if (operatorUser && !operatorUser.isVerified) {
        operatorUser.isVerified = true;
        await operatorUser.save();
      }
    }

    // console.log("Bus created successfully:", bus._id)
    res.status(201).json(bus)
  } catch (error) {
    // console.error("Create bus error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update bus (Operator or Admin)
router.put("/:id", operatorAuth, async (req, res) => {
  try {
    // console.log("Updating bus:", req.params.id, "with data:", req.body)

    let bus = await Bus.findById(req.params.id)

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" })
    }

    // Ownership check
    if (req.user.role !== 'admin' && bus.operatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. You can only update your own buses." })
    }

    bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true })

    // console.log("Bus updated successfully:", bus._id)
    res.json(bus)
  } catch (error) {
    // console.error("Update bus error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete bus (Operator or Admin)
router.delete("/:id", operatorAuth, async (req, res) => {
  try {
    // console.log("Deleting bus:", req.params.id)

    const bus = await Bus.findById(req.params.id)

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" })
    }

    // Ownership check
    if (req.user.role !== 'admin' && bus.operatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. You can only delete your own buses." })
    }

    await Bus.findByIdAndDelete(req.params.id)

    // console.log("Bus deleted successfully:", req.params.id)
    res.json({ message: "Bus deleted successfully" })
  } catch (error) {
    // console.error("Delete bus error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get all buses (Admin only)
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    // console.log("Fetching all buses for admin")
    const buses = await Bus.find().sort({ createdAt: -1 })
    // console.log(`Found ${buses.length} buses`)
    res.json(buses)
  } catch (error) {
    // console.error("Get all buses error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
