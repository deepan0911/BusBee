"use client"

import React, { useState, useEffect } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { MapPin, Clock, Users, Star, Wifi, Tv, Coffee, Shield, Disc } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import Chatbot from "../components/ChatBot"

const BusDetails = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [bus, setBus] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const date = searchParams.get("date")

  const fetchBusDetails = React.useCallback(async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      const response = await axios.get(`${baseURL}/api/buses/${id}`)
      setBus(response.data)
      setLoading(false)
    } catch (error) {
      toast.error("Failed to fetch bus details")
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchBusDetails()
  }, [fetchBusDetails])

  const handleSelectSeats = () => {
    if (!user) {
      toast.error("Please login to book seats")
      navigate("/login")
      return
    }
    navigate(`/select-seats/${id}?from=${from}&to=${to}&date=${date}`)
  }

  const getAmenityIcon = (amenity) => {
    const key = amenity.toLowerCase()
    if (key.includes("wifi")) return <Wifi className="h-5 w-5" />
    if (key.includes("charging")) return <Clock className="h-5 w-5" />
    if (key.includes("water")) return <Coffee className="h-5 w-5" />
    if (key.includes("blanket")) return <Shield className="h-5 w-5" />
    if (key.includes("tv")) return <Tv className="h-5 w-5" />
    if (key.includes("coffee") || key.includes("refreshment")) return <Coffee className="h-5 w-5" />
    return <Disc className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p>Loading bus details...</p>
        </div>
      </div>
    )
  }

  if (!bus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Bus not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-lg font-semibold">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  {from} → {to}
                </div>
                <div className="text-gray-600">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-800">
                ← Back to Search
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bus Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{bus.operatorName}</h1>
                  <p className="text-gray-600 mb-1">{bus.busNumber}</p>
                  <div className="flex items-center space-x-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {bus.busType}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{bus.rating || 4.2}</span>
                      <span className="text-sm text-gray-500 ml-1">({bus.reviews?.length || 0} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">₹{bus.price}</p>
                  <p className="text-sm text-gray-500">per seat</p>
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-lg font-semibold">{bus.schedule.departureTime}</span>
                  </div>
                  <p className="text-gray-600">{from}</p>
                  <p className="text-sm text-gray-500">Departure</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-full border-t-2 border-dashed border-gray-300 mx-4"></div>
                    <span className="text-sm text-gray-500 whitespace-nowrap px-2">{bus.schedule.duration}</span>
                    <div className="w-full border-t-2 border-dashed border-gray-300 mx-4"></div>
                  </div>
                  <p className="text-sm text-gray-500">{bus.route.distance} km</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-lg font-semibold">{bus.schedule.arrivalTime}</span>
                  </div>
                  <p className="text-gray-600">{to}</p>
                  <p className="text-sm text-gray-500">Arrival</p>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {bus.amenities && !Array.isArray(bus.amenities) ? (
                    Object.entries(bus.amenities)
                      .filter(([_, value]) => value)
                      .map(([key], index) => (
                        <div key={index} className="flex items-center space-x-2 text-gray-700">
                          {getAmenityIcon(key)}
                          <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        </div>
                      ))
                  ) : Array.isArray(bus.amenities) ? (
                    bus.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 text-gray-700">
                        {getAmenityIcon(amenity)}
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No amenities listed</p>
                  )}
                </div>
              </div>

              {/* Seat Availability */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">Seat Availability</span>
                  </div>
                  <span className="text-lg font-semibold text-green-600">
                    {bus.availableSeats} / {bus.totalSeats} available
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Route</span>
                  <span className="font-medium">
                    {from} → {to}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Departure</span>
                  <span className="font-medium">{bus.schedule.departureTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{bus.schedule.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bus Type</span>
                  <span className="font-medium">{bus.busType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per seat</span>
                  <span className="font-medium">₹{bus.price}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Available Seats</span>
                  <span className="text-lg font-bold text-green-600">{bus.availableSeats}</span>
                </div>
              </div>

              <button
                onClick={handleSelectSeats}
                disabled={bus.availableSeats === 0}
                className={`w-full h-12 px-4 rounded-md text-lg font-semibold transition duration-200
                  ${bus.availableSeats === 0
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"}
                `}
              >
                {bus.availableSeats === 0 ? "Bus Full" : "Select Seats"}
              </button>


              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">Secure booking • Instant confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Chatbot />
    </div>
  )
}

export default BusDetails
