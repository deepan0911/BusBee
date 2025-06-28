const mongoose = require("mongoose")

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
})

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: true,
      unique: true,
    },
    operatorName: {
      type: String,
      required: true,
    },
    busType: {
      type: String,
      enum: ["AC", "Non-AC", "Sleeper", "Semi-Sleeper", "Luxury"],
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    seats: [seatSchema],
    route: {
      from: {
        type: String,
        required: true,
      },
      to: {
        type: String,
        required: true,
      },
      distance: {
        type: Number,
        required: true,
      },
    },
    schedule: {
      departureDate: {
        type: Date,
        required: true,
      },
      departureTime: {
        type: String,
        required: true,
      },
      arrivalDate: {
        type: Date,
        required: true,
      },
      arrivalTime: {
        type: String,
        required: true,
      },
      duration: {
        type: String,
        required: true,
      },
      travelHours: {
        type: Number,
        required: true,
      },
    },
    price: {
      type: Number,
      required: true,
    },
    amenities: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: Number,
        comment: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Initialize seats when creating a bus
busSchema.pre("save", function (next) {
  if (this.isNew && this.seats.length === 0) {
    for (let i = 1; i <= this.totalSeats; i++) {
      this.seats.push({
        seatNumber: `S${i}`,
        isBooked: false,
      })
    }
  }
  next()
})

module.exports = mongoose.model("Bus", busSchema)
