"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import axios from "axios"
import { MapPin, User, Phone } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"


const Booking = () => {
  const { id } = useParams()
  const [bus, setBus] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [route, setRoute] = useState({ from: "", to: "" })
  const [journeyDate, setJourneyDate] = useState("")
  const [selectedBoarding, setSelectedBoarding] = useState(null)
  const [selectedDropping, setSelectedDropping] = useState(null)

  const [loading, setLoading] = useState(true)
  const [bookingLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm()

  const fetchBusDetails = useCallback(async () => {
    try {
      console.log("🚌 Fetching bus details for ID:", id)
      const response = await axios.get(`/api/buses/${id}`)
      console.log("✅ Bus details fetched:", response.data.operatorName)
      setBus(response.data)
      setLoading(false)
    } catch (error) {
      console.error("❌ Failed to fetch bus details:", error)
      toast.error("Failed to fetch bus details")
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    console.log("🔄 Component mounted, checking session storage...")

    const seats = JSON.parse(sessionStorage.getItem("selectedSeats") || "[]")
    const routeData = JSON.parse(sessionStorage.getItem("route") || "{}")
    const date = sessionStorage.getItem("journeyDate")
    const storedBoarding = sessionStorage.getItem("selectedBoarding")
    const storedDropping = sessionStorage.getItem("selectedDropping")

    console.log("📦 Session data:", { seats, routeData, date })

    if (seats.length === 0) {
      console.log("❌ No seats selected, redirecting to search")
      toast.error("No seats selected")
      navigate("/search")
      return
    }

    setSelectedSeats(seats)
    setRoute(routeData)
    setJourneyDate(date)
    if (storedBoarding) setSelectedBoarding(JSON.parse(storedBoarding))
    if (storedDropping) setSelectedDropping(JSON.parse(storedDropping))

    if (user) {
      console.log("👤 Pre-filling user data:", user.email)
      setValue("contactEmail", user.email)
      setValue("contactPhone", user.phone)
    }

    fetchBusDetails()
  }, [id, user, setValue, navigate, fetchBusDetails])

  const onSubmit = async (data) => {
    const passengers = selectedSeats.map((seat, index) => ({
      name: data[`passenger_${index}_name`],
      age: Number.parseInt(data[`passenger_${index}_age`]),
      gender: data[`passenger_${index}_gender`],
      seatNumber: seat,
    }));

    const bookingData = {
      busId: id,
      passengers,
      journeyDate,
      contactDetails: {
        email: data.contactEmail,
        phone: data.contactPhone,
      },
      boardingPoint: selectedBoarding,
      droppingPoint: selectedDropping
    };

    const totalAmount = selectedSeats.length * bus.price;

    // ✅ Redirect to /payment with necessary data
    navigate("/payment", {
      state: {
        amount: totalAmount,
        bookingData,
        token: localStorage.getItem("token"),
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!bus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Bus not found</p>
          <button onClick={() => navigate("/search")} className="btn btn-primary mt-4">
            Back to Search
          </button>
        </div>
      </div>
    )
  }

  const totalAmount = selectedSeats.length * bus.price

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-800 mr-4 font-medium">
                  ← Back
                </button>
                <div className="flex items-center text-lg font-semibold">
                  <MapPin size={20} className="mr-2 text-blue-600" />

                  {route.from} → {route.to}
                </div>
                <div className="text-gray-600">
                  {new Date(journeyDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Boarding and Dropping Points Display */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Boarding & Dropping</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500 mb-1">Boarding Point</p>
                    <p className="font-semibold">{selectedBoarding?.location || 'Not Selected'}</p>
                    <p className="text-sm font-medium text-blue-600">{selectedBoarding?.time}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500 mb-1">Dropping Point</p>
                    <p className="font-semibold">{selectedDropping?.location || 'Not Selected'}</p>
                    <p className="text-sm font-medium text-blue-600">{selectedDropping?.time}</p>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      {...register("contactEmail", { required: "Email is required" })}
                      className="input w-full"
                    />
                    {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      {...register("contactPhone", { required: "Phone is required" })}
                      className="input w-full"
                    />
                    {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone.message}</p>}
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Passenger Details
                </h3>
                <div className="space-y-6">
                  {selectedSeats.map((seat, index) => (
                    <div key={seat} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-3">
                        Passenger {index + 1} - Seat {seat}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <input
                            type="text"
                            {...register(`passenger_${index}_name`, { required: "Name is required" })}
                            className="input w-full"
                          />
                          {errors[`passenger_${index}_name`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`passenger_${index}_name`].message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            {...register(`passenger_${index}_age`, { required: "Age is required" })}
                            className="input w-full"
                          />
                          {errors[`passenger_${index}_age`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`passenger_${index}_age`].message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                          <select
                            {...register(`passenger_${index}_gender`, { required: "Gender is required" })}
                            className="input w-full"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          {errors[`passenger_${index}_gender`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`passenger_${index}_gender`].message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bus</span>
                  <span className="font-medium">{bus.operatorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Route</span>
                  <span className="font-medium">
                    {route.from} → {route.to}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{new Date(journeyDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Departure</span>
                  <span className="font-medium">{bus.schedule.departureTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seats</span>
                  <span className="font-medium">{selectedSeats.join(", ")}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Fare ({selectedSeats.length} seats)</span>
                    <span className="font-medium">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-blue-600">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit(onSubmit)}
                disabled={bookingLoading}
                className={`w-full h-12 px-5 rounded-md text-lg font-semibold flex items-center justify-center transition duration-200
                    ${bookingLoading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"}
                  `}
              >
                {bookingLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm Booking
                  </>
                )}
              </button>


              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">Your booking will be confirmed instantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div >
  )
}

export default Booking
