const mongoose = require("mongoose")

const passengerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  seatNumber: {
    type: String,
    required: true,
  },
})

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },
    passengers: [passengerSchema],
    journeyDate: {
      type: Date,
      required: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    contactDetails: {
      email: String,
      phone: String,
    },
  },
  {
    timestamps: true,
  },
)

// Generate booking ID
bookingSchema.pre("save", function (next) {
  if (this.isNew && !this.bookingId) {
    this.bookingId = "BK" + Date.now() + Math.floor(Math.random() * 1000)
  }
  next()
})

module.exports = mongoose.model("Booking", bookingSchema)
