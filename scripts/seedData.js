const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const Bus = require("../models/Bus")
require("dotenv").config()

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Bus.deleteMany({})

    // Create admin user
    const adminPassword = await bcrypt.hash("password123", 10)
    const admin = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      phone: "9876543210",
      role: "admin",
      isVerified: true,
    })
    await admin.save()

    // Create regular user
    const userPassword = await bcrypt.hash("password123", 10)
    const user = new User({
      name: "John Doe",
      email: "user@example.com",
      password: userPassword,
      phone: "9876543211",
      role: "user",
      isVerified: true,
    })
    await user.save()

    // Helper function to calculate arrival date/time
    const calculateArrival = (departureDate, departureTime, travelHours) => {
      const depDateTime = new Date(`${departureDate}T${departureTime}`)
      const arrDateTime = new Date(depDateTime.getTime() + travelHours * 60 * 60 * 1000)
      return {
        arrivalDate: arrDateTime,
        arrivalTime: arrDateTime.toTimeString().slice(0, 5),
      }
    }

    // Create sample buses with proper schedule format
    const buses = [
      {
        busNumber: "MH12AB1234",
        operatorName: "Shivneri Travels",
        busType: "AC",
        totalSeats: 40,
        availableSeats: 40,
        route: {
          from: "Mumbai",
          to: "Pune",
          distance: 150,
        },
        schedule: {
          departureDate: new Date("2024-12-30"),
          departureTime: "08:00",
          travelHours: 3.5,
          duration: "3h 30m",
          ...calculateArrival("2024-12-30", "08:00", 3.5),
        },
        price: 250,
        amenities: ["WiFi", "TV", "Refreshments"],
        rating: 4.5,
        isActive: true,
      },
      {
        busNumber: "DL01CD5678",
        operatorName: "Rajdhani Express",
        busType: "Luxury",
        totalSeats: 36,
        availableSeats: 36,
        route: {
          from: "Delhi",
          to: "Jaipur",
          distance: 280,
        },
        schedule: {
          departureDate: new Date("2024-12-30"),
          departureTime: "09:00",
          travelHours: 5.75,
          duration: "5h 45m",
          ...calculateArrival("2024-12-30", "09:00", 5.75),
        },
        price: 450,
        amenities: ["WiFi", "TV", "Refreshments", "Blanket"],
        rating: 4.8,
        isActive: true,
      },
      {
        busNumber: "KA03EF9012",
        operatorName: "Bangalore Express",
        busType: "Sleeper",
        totalSeats: 32,
        availableSeats: 32,
        route: {
          from: "Bangalore",
          to: "Chennai",
          distance: 350,
        },
        schedule: {
          departureDate: new Date("2024-12-30"),
          departureTime: "22:00",
          travelHours: 6.25,
          duration: "6h 15m",
          ...calculateArrival("2024-12-30", "22:00", 6.25),
        },
        price: 400,
        amenities: ["WiFi", "Blanket", "Pillow"],
        rating: 4.3,
        isActive: true,
      },
      {
        busNumber: "MH14GH3456",
        operatorName: "Konkan Travels",
        busType: "AC",
        totalSeats: 45,
        availableSeats: 45,
        route: {
          from: "Mumbai",
          to: "Goa",
          distance: 460,
        },
        schedule: {
          departureDate: new Date("2024-12-31"),
          departureTime: "20:00",
          travelHours: 8.5,
          duration: "8h 30m",
          ...calculateArrival("2024-12-31", "20:00", 8.5),
        },
        price: 650,
        amenities: ["WiFi", "TV", "Refreshments"],
        rating: 4.6,
        isActive: true,
      },
      {
        busNumber: "UP32IJ7890",
        operatorName: "Taj Express",
        busType: "Non-AC",
        totalSeats: 50,
        availableSeats: 50,
        route: {
          from: "Delhi",
          to: "Agra",
          distance: 200,
        },
        schedule: {
          departureDate: new Date("2024-12-30"),
          departureTime: "07:30",
          travelHours: 3.75,
          duration: "3h 45m",
          ...calculateArrival("2024-12-30", "07:30", 3.75),
        },
        price: 200,
        amenities: ["Music System"],
        rating: 4.0,
        isActive: true,
      },
    ]

    for (const busData of buses) {
      const bus = new Bus(busData)
      await bus.save()
    }

    console.log("Sample data seeded successfully!")
    console.log("Admin login: admin@example.com / password123")
    console.log("User login: user@example.com / password123")

    process.exit(0)
  } catch (error) {
    console.error("Error seeding data:", error)
    process.exit(1)
  }
}

seedData()
