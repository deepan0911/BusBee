"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { Calendar, MapPin, Clock, Users, X, Eye } from "lucide-react"
import toast from "react-hot-toast"
import Chatbot from "../components/ChatBot"

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingBooking, setCancellingBooking] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null })

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      const response = await axios.get(`${baseURL}/api/bookings/my-bookings`)
      setBookings(response.data)
      setLoading(false)
    } catch (error) {
      toast.error("Failed to fetch bookings")
      setLoading(false)
    }
  }

  const handleCancelBooking = (bookingId) => {
    setConfirmModal({ show: true, id: bookingId })
  }

  const confirmCancelBooking = async () => {
    const bookingId = confirmModal.id
    setCancellingBooking(bookingId)
    setConfirmModal({ show: false, id: null }) // Close modal immediately

    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      await axios.put(`${baseURL}/api/bookings/${bookingId}/cancel`)
      toast.success("Booking cancelled successfully")
      fetchBookings() // Refresh bookings
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking")
    } finally {
      setCancellingBooking(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const canCancelBooking = (booking) => {
    // Extract journey date (without time)
    const journeyDateOnly = new Date(booking.journeyDate)

    // Parse departure time (e.g., "10:30")
    const [hours, minutes] = booking.bus?.schedule?.departureTime?.split(":").map(Number) || [0, 0]

    // Create a full Date object for journey datetime
    const journeyDateTime = new Date(
      journeyDateOnly.getFullYear(),
      journeyDateOnly.getMonth(),
      journeyDateOnly.getDate(),
      hours,
      minutes,
    )

    const now = new Date()
    const timeDiff = journeyDateTime.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)

    return booking.status === "confirmed" && hoursDiff > 4
  }



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your bus ticket bookings</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">You haven't made any bus bookings yet</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors duration-200"
            >
              Book Your First Ticket
            </Link>

          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{booking.bus?.operatorName || 'Unknown Operator'}</h3>
                      <p className="text-gray-600">Booking ID: {booking.bookingId}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-blue-600">₹{booking.totalAmount}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium">{booking.bus?.route?.from || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">From</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium">{booking.bus?.route?.to || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">To</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium">{new Date(booking.journeyDate).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">Journey Date</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium">{booking.bus?.schedule?.departureTime || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">Departure</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        {booking.passengers.length} passenger{booking.passengers.length > 1 ? "s" : ""}
                      </div>
                      <div className="text-sm text-gray-600">
                        Seats: {booking.passengers.map((p) => p.seatNumber).join(", ")}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/booking-confirmation/${booking._id}`} className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>

                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancellingBooking === booking._id}
                          className={`
                              flex items-center gap-2
                              px-4 py-1.5
                              border border-red-300
                              text-red-600 font-medium text-sm
                              rounded-md
                              hover:bg-red-50 hover:text-red-700
                              focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1
                              disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
                              transition-all duration-200 ease-in-out
                            `}
                        >
                          {cancellingBooking === booking._id ? (
                            <div className="spinner h-4 w-4 animate-spin text-red-500" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Chatbot />

      {/* Cancellation Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Cancellation</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this ticket? 10% will be deducted.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmModal({ show: false, id: null })}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                No, Keep
              </button>
              <button
                onClick={confirmCancelBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBookings