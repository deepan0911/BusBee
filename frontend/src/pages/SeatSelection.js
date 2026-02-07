"use client"

import React, { useState, useEffect } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { MapPin, Users } from "lucide-react"
import toast from "react-hot-toast"
import Chatbot from "../components/ChatBot"
import SeatLayout from "../components/SeatLayout"

const SeatSelection = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [bus, setBus] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(true)
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

  const handleSeatSelect = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber))
    } else {
      if (selectedSeats.length < 6) {
        // Maximum 6 seats per booking
        setSelectedSeats([...selectedSeats, seatNumber])
      } else {
        toast.error("You can select maximum 6 seats")
      }
    }
  }

  const handleProceedToBooking = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat")
      return
    }

    // Store selected seats in sessionStorage
    sessionStorage.setItem("selectedSeats", JSON.stringify(selectedSeats))
    sessionStorage.setItem("busId", id)
    sessionStorage.setItem("journeyDate", date)
    sessionStorage.setItem("route", JSON.stringify({ from, to }))

    navigate(`/boarding-dropping/${id}?from=${from}&to=${to}&date=${date}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p>Loading seat layout...</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Layout */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">

              {/* Integrated Header with Back Button */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-800 mr-2 font-medium">
                    ← Back
                  </button>
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <div className="flex flex-col">
                    <div className="flex items-center text-lg font-bold text-gray-800">
                      <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                      {from} <span className="mx-2 text-gray-400">→</span> {to}
                    </div>
                    <div className="text-sm text-gray-500 ml-6">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{bus.operatorName}</h2>
                  <p className="text-gray-600">
                    {bus.busNumber} • {bus.busType}
                  </p>
                </div>
              </div>

              <SeatLayout
                bus={bus}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                onProceed={handleProceedToBooking}
              />
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
                  <span className="text-gray-600">Bus</span>
                  <span className="font-medium">{bus.operatorName}</span>
                </div>
              </div>

              {selectedSeats.length > 0 && (
                <div className="border-t pt-4 mb-6">
                  <h4 className="font-medium mb-3">Selected Seats</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSeats.map((seat) => (
                      <span key={seat} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  <Users className="h-3 w-3 inline mr-1" />
                  {selectedSeats.length} of 6 seats selected
                </p>
              </div>
            </div>
          </div>


        </div>
      </div>
      <Chatbot />
    </div>
  )
}

export default SeatSelection
