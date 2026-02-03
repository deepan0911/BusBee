"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { Users, Calendar, Bus as BusIcon } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

const OperatorBookings = () => {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [showModal, setShowModal] = useState(false)

    const { user, loading: authLoading } = useAuth()

    useEffect(() => {
        if (!authLoading && user) {
            fetchBookings()
        }
    }, [user, authLoading])

    const fetchBookings = async () => {
        try {
            const response = await axios.get("/api/bookings/operator/my-bookings")
            setBookings(response.data)
            setLoading(false)
        } catch (error) {
            toast.error("Failed to fetch bookings")
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Booking Management</h1>

                <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Passenger</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Journey Details</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Seats</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                                        <p className="mt-2 font-medium">Fetching bookings...</p>
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-lg font-medium">No bookings found yet.</p>
                                        <p className="text-sm">New bookings will appear here as they come in.</p>
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                                            {booking.bookingId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="font-bold">{booking.user?.name || "Guest User"}</div>
                                            <div className="text-gray-500 text-xs">{booking.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-1 font-medium text-gray-700">
                                                <Calendar className="h-3 w-3 text-indigo-500" />
                                                {new Date(booking.journeyDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 text-gray-600">
                                                <BusIcon className="h-3 w-3 text-emerald-500" />
                                                {booking.bus?.busNumber}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {booking.bus?.route?.from} - {booking.bus?.route?.to}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="font-bold">{booking.passengers.length}</span> {booking.passengers.length > 1 ? 'seats' : 'seat'}
                                            <div className="text-[10px] text-gray-500 mt-0.5 font-mono">
                                                {booking.passengers.map(p => p.seatNumber).join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-bold rounded-full uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setShowModal(true);
                                                }}
                                                className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-bold"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Details Modal */}
            {showModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                                <p className="text-sm text-gray-500">ID: {selectedBooking.bookingId}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                                <span className="text-2xl">×</span>
                            </button>
                        </div>

                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">PASSENGER MANIFEST</h3>
                            <div className="space-y-3">
                                {selectedBooking.passengers.map((passenger, index) => (
                                    <div key={index} className="flex justify-between items-center border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                                        <div>
                                            <p className="font-medium text-gray-900">{passenger.name}</p>
                                            <p className="text-sm text-gray-500">{passenger.age} yrs • {passenger.gender}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                                Seat {passenger.seatNumber}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-sm text-gray-500">Contact Info</p>
                                <p className="font-medium">{selectedBooking.contactDetails?.phone}</p>
                                <p className="font-medium">{selectedBooking.contactDetails?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="font-medium text-xl text-green-600">₹{selectedBooking.totalAmount}</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OperatorBookings
