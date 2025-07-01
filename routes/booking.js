const express = require("express")
const Booking = require("../models/Booking")
const Bus = require("../models/Bus")
const { auth } = require("../middleware/auth")
const { sendBookingConfirmation, sendCancellationEmail } = require("../services/emailService")
const router = express.Router()

// Create booking
router.post("/", auth, async (req, res) => {
  try {
    console.log("📦 Booking request received:", req.body)
    console.log("👤 User:", req.user.name, req.user.email)

    const { busId, passengers, journeyDate, contactDetails } = req.body

    // Validate required fields
    if (!busId || !passengers || !journeyDate || !contactDetails) {
      console.log("❌ Missing required fields")
      return res.status(400).json({
        message: "Missing required fields",
        received: {
          busId: !!busId,
          passengers: !!passengers,
          journeyDate: !!journeyDate,
          contactDetails: !!contactDetails,
        },
      })
    }

    // Get bus details
    console.log("🚌 Fetching bus:", busId)
    const bus = await Bus.findById(busId)
    if (!bus) {
      console.log("❌ Bus not found:", busId)
      return res.status(404).json({ message: "Bus not found" })
    }

    console.log("✅ Bus found:", bus.operatorName, bus.busNumber)

    // Check seat availability
    const requestedSeats = passengers.map((p) => p.seatNumber)
    console.log("🪑 Requested seats:", requestedSeats)

    const unavailableSeats = bus.seats.filter((seat) => requestedSeats.includes(seat.seatNumber) && seat.isBooked)

    if (unavailableSeats.length > 0) {
      console.log(
        "❌ Seats unavailable:",
        unavailableSeats.map((s) => s.seatNumber),
      )
      return res.status(400).json({
        message: "Some seats are already booked",
        unavailableSeats: unavailableSeats.map((s) => s.seatNumber),
      })
    }

    // Calculate total amount
    const totalAmount = passengers.length * bus.price
    console.log("💰 Total amount:", totalAmount)

    // Generate unique booking ID
    const bookingId = "BK" + Date.now() + Math.floor(Math.random() * 1000)
    console.log("🆔 Generated booking ID:", bookingId)

    // Create booking
    const booking = new Booking({
      bookingId: bookingId, // Explicitly set the booking ID
      user: req.user._id,
      bus: busId,
      passengers,
      journeyDate,
      totalAmount,
      contactDetails,
      status: "confirmed", // Directly confirm booking without payment
    })

    console.log("💾 Saving booking...")
    await booking.save()
    console.log("✅ Booking saved:", booking.bookingId)

    // Update bus seats
    bus.seats.forEach((seat) => {
      if (requestedSeats.includes(seat.seatNumber)) {
        seat.isBooked = true
        seat.bookedBy = req.user._id
        seat.bookingId = booking._id
      }
    })

    bus.availableSeats -= passengers.length
    await bus.save()
    console.log("✅ Bus seats updated")

    // Populate booking for response
    await booking.populate("bus user")

    // Send confirmation email
    try {
      await sendBookingConfirmation(req.user.email, {
        bookingId: booking.bookingId,
        operatorName: booking.bus.operatorName,
        busNumber: booking.bus.busNumber,
        route: booking.bus.route,
        journeyDate: booking.journeyDate,
        departureTime: booking.bus.schedule.departureTime,
        seats: booking.passengers.map((p) => p.seatNumber),
        totalAmount: booking.totalAmount,
        passengers: booking.passengers,
      })
      console.log("📧 Confirmation email sent")
    } catch (emailError) {
      console.log("⚠️ Email sending failed:", emailError.message)
      // Don't fail the booking if email fails
    }

    console.log("🎉 Booking completed successfully")
   res.status(201).json({
  success: true,
  message: "Booking confirmed successfully!",
  booking,
})

  } catch (error) {
    console.error("💥 Booking error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get user bookings
router.get("/my-bookings", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("bus").sort({ createdAt: -1 })

    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get booking by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("bus user")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json(booking)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Cancel booking
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("bus")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Check if booking can be cancelled
     const journeyDateOnly = new Date(booking.journeyDate)
    const [hours, minutes] = booking.bus.schedule.departureTime.split(":").map(Number)

    const journeyDateTime = new Date(
      journeyDateOnly.getFullYear(),
      journeyDateOnly.getMonth(),
      journeyDateOnly.getDate(),
      hours,
      minutes
    )

    const now = new Date()
    const timeDiff = journeyDateTime.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)

    if (hoursDiff < 4) {
      return res.status(400).json({
        message: "Booking cannot be cancelled less than 2 hours before journey",
      })
    }

    // Update booking status
    booking.status = "cancelled"
    await booking.save()

    // Free up seats
    const bus = booking.bus
    const passengerSeats = booking.passengers.map((p) => p.seatNumber)

    bus.seats.forEach((seat) => {
      if (passengerSeats.includes(seat.seatNumber)) {
        seat.isBooked = false
        seat.bookedBy = null
        seat.bookingId = null
      }
    })

    bus.availableSeats += booking.passengers.length
    await bus.save()

    // Send cancellation email
    await sendCancellationEmail(req.user.email, {
      bookingId: booking.bookingId,
      refundAmount: booking.totalAmount * 0.9, // 10% cancellation fee
    })

    res.json({ message: "Booking cancelled successfully", booking })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
