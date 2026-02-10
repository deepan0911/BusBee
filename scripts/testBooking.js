const axios = require("axios")

const testBooking = async () => {
  try {
    // First login to get a token
    // console.log("Logging in...")
    const loginResponse = await axios.post("http://localhost:5000/api/auth/login", {
      email: "user@example.com",
      password: "password123",
    })

    const token = loginResponse.data.token
    // console.log("Login successful, token received")

    // Get buses
    // console.log("Fetching buses...")
    const busesResponse = await axios.get("http://localhost:5000/api/buses/search?from=Mumbai&to=Pune")

    if (busesResponse.data.length === 0) {
      // console.log("No buses found")
      return
    }

    const bus = busesResponse.data[0]
    // console.log("Found bus:", bus.busNumber)

    // Test booking
    // console.log("Testing booking...")
    const bookingData = {
      busId: bus._id,
      passengers: [
        {
          name: "Test User",
          age: 25,
          gender: "Male",
          seatNumber: "S1",
        },
      ],
      journeyDate: bus.schedule.departureDate,
      contactDetails: {
        email: "test@example.com",
        phone: "9876543210",
      },
    }

    const bookingResponse = await axios.post("http://localhost:5000/api/bookings", bookingData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // console.log("Booking successful:", bookingResponse.data.booking.bookingId)
  } catch (error) {
    // console.error("Test failed:", error.response?.data || error.message)
  }
}

testBooking()
