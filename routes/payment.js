const express = require("express")
const Razorpay = require("razorpay")
const crypto = require("crypto")
const Booking = require("../models/Booking")
const { auth } = require("../middleware/auth")
const { sendBookingConfirmation } = require("../services/emailService")
const router = express.Router()

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Create order
router.post("/create-order", auth, async (req, res) => {
  try {
    const { bookingId, amount } = req.body

    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `booking_${bookingId}`,
    }

    const order = await razorpay.orders.create(options)

    // Update booking with order ID
    await Booking.findByIdAndUpdate(bookingId, {
      razorpayOrderId: order.id,
    })

    res.json({
      orderId: order.id,
      amount: amount,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Verify payment
router.post("/verify-payment", auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex")

    if (razorpay_signature === expectedSign) {
      // Payment verified successfully
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          paymentStatus: "completed",
          razorpayPaymentId: razorpay_payment_id,
          paymentId: razorpay_payment_id,
        },
        { new: true },
      ).populate("bus user")

      // Send confirmation email
      await sendBookingConfirmation(booking.user.email, {
        bookingId: booking.bookingId,
        busNumber: booking.bus.busNumber,
        route: booking.bus.route,
        journeyDate: booking.journeyDate,
        departureTime: booking.bus.schedule.departureTime,
        seats: booking.passengers.map((p) => p.seatNumber),
        totalAmount: booking.totalAmount,
        passengers: booking.passengers,
      })

      res.json({
        message: "Payment verified successfully",
        booking,
      })
    } else {
      // Payment verification failed
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "failed",
      })

      res.status(400).json({ message: "Payment verification failed" })
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
