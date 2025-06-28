"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { CheckCircle, Download, MapPin, Users, Mail } from "lucide-react"
import toast from "react-hot-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const BookingConfirmation = () => {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef()

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      const response = await axios.get(`/api/bookings/${bookingId}`)
      setBooking(response.data)
      setLoading(false)
    } catch (error) {
      toast.error("Failed to fetch booking details")
      setLoading(false)
    }
  }

  const handleDownloadTicket = async () => {
    if (!printRef.current) return

    try {
      const element = printRef.current

      const canvas = await html2canvas(element, { scale: 2 })
      const imgData = canvas.toDataURL("image/png")

      const pdf = new jsPDF("p", "pt", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Booking-${booking.bookingId}.pdf`)

      toast.success("Ticket downloaded!")
    } catch (error) {
      console.error("Failed to download ticket", error)
      toast.error("Failed to download ticket")
    }
  }

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

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Booking not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-sm p-8"
        ref={printRef}
      >
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">Your bus ticket has been booked successfully</p>
        </div>

        {/* Booking Details */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Details</h2>
            <p className="text-gray-600">
              Booking ID: <span className="font-medium">{booking.bookingId}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Booking Date</p>
            <p className="font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Journey Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Journey Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">From</span>
                <span className="font-medium">{booking.bus.route.from}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To</span>
                <span className="font-medium">{booking.bus.route.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Journey Date</span>
                <span className="font-medium">{new Date(booking.journeyDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Departure Time</span>
                <span className="font-medium">{booking.bus.schedule.departureTime}</span>
              </div>
            </div>
          </div>

          {/* Bus Information */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Bus Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Operator</span>
                <span className="font-medium">{booking.bus.operatorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bus Number</span>
                <span className="font-medium">{booking.bus.busNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bus Type</span>
                <span className="font-medium">{booking.bus.busType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium text-blue-600">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Passenger Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Seat</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Age</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Gender</th>
                </tr>
              </thead>
              <tbody>
                {booking.passengers.map((passenger, index) => (
                  <tr key={index}>
                    <td className="border border-gray-200 px-4 py-2 font-medium">{passenger.seatNumber}</td>
                    <td className="border border-gray-200 px-4 py-2">{passenger.name}</td>
                    <td className="border border-gray-200 px-4 py-2">{passenger.age}</td>
                    <td className="border border-gray-200 px-4 py-2">{passenger.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-600" />
            Contact Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Email: </span>
              <span className="font-medium">{booking.contactDetails.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone: </span>
              <span className="font-medium">{booking.contactDetails.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleDownloadTicket}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Ticket
          </button>

          <Link
            to="/my-bookings"
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded flex items-center justify-center"
          >
            View All Bookings
          </Link>

          <Link
            to="/"
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center"
          >
            Book Another Ticket
          </Link>

      </div>

      {/* Important Information */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="font-semibold text-yellow-800 mb-3">Important Information</h3>
        <ul className="text-sm text-yellow-700 space-y-2">
          <li>• Please arrive at the boarding point 15 minutes before departure time</li>
          <li>• Carry a valid ID proof during your journey</li>
          <li>• Cancellation is allowed up to 4 hours before departure</li>
          <li>• A confirmation email has been sent to your registered email address</li>
        </ul>
      </div>
    </div>
  )
}

export default BookingConfirmation
