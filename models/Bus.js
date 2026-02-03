const mongoose = require("mongoose")

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["seater", "sleeper"],
    default: "seater",
  },
  deck: {
    type: String, // 'lower' or 'upper'
    default: "lower",
  },
  row: Number,
  col: Number,
  isBooked: {
    type: Boolean,
    default: false,
  },
  gender: {
    type: String, // 'male' or 'female' (for strict booking)
    enum: ["male", "female", null],
    default: null
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
    },
    operatorName: {
      type: String,
      required: true,
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    // Enhanced Fields for Operator Dashboard
    priceSeater: Number,
    priceSleeper: Number,
    amenities: {
      wifi: { type: Boolean, default: false },
      chargingPoint: { type: Boolean, default: false },
      waterBottle: { type: Boolean, default: false },
      blanket: { type: Boolean, default: false },
      readingLight: { type: Boolean, default: false },
      emergencyExit: { type: Boolean, default: false },
      gpsTracking: { type: Boolean, default: false },
      cctv: { type: Boolean, default: false }
    },
    boardingPoints: [{
      location: String,
      time: String
    }],
    droppingPoints: [{
      location: String,
      time: String
    }],
    cancellationPolicy: {
      allowed: { type: Boolean, default: true },
      chargeType: { type: String, default: "percentage" },
      chargeAmount: Number,
      refundPolicy: String,
      timeLimit: String
    },
    operatorInfo: {
      contactNumber: String,
      emergencyContact: String,
      supportEmail: String
    },
    additionalDetails: {
      restStops: String,
      restStopDuration: String,
      liveTracking: { type: Boolean, default: false },
      partialBooking: { type: Boolean, default: true }
    },
    safetyFeatures: {
      fireExtinguisher: { type: Boolean, default: false },
      firstAidKit: { type: Boolean, default: false },
      seatBelts: { type: Boolean, default: false }
    },
    driverDetails: {
      name: String,
      phone: String,
      license: String
    },
    images: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    layoutConfig: {
      rows: Number,
      colsLeft: Number,
      colsRight: Number,
      upperDeck: Boolean
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
