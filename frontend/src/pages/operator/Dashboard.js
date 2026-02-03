"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Bus, BookOpen, DollarSign, TrendingUp } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"

const OperatorDashboard = () => {
    const [stats, setStats] = useState({
        totalBuses: 0,
        totalBookings: 0,
        totalRevenue: 0,
        activeRoutes: 0,
    })
    const [recentBookings, setRecentBookings] = useState([])
    const [loading, setLoading] = useState(true)

    const { user, loading: authLoading } = useAuth()

    useEffect(() => {
        if (!authLoading && user) {
            fetchDashboardData()
        }
    }, [user, authLoading])

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get("/api/operator/dashboard")
            setStats(response.data.stats)
            setRecentBookings(response.data.recentBookings)
            setLoading(false)
        } catch (error) {
            toast.error("Failed to fetch dashboard data")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Operator Dashboard</h1>
                    <p className="text-gray-600">Manage your buses and bookings</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Buses', value: stats.totalBuses, icon: Bus, color: 'text-blue-600' },
                        { label: 'Active Routes', value: stats.activeRoutes, icon: TrendingUp, color: 'text-emerald-600' },
                        { label: 'Total Bookings', value: stats.totalBookings, icon: BookOpen, color: 'text-purple-600' },
                        { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: DollarSign, color: 'text-amber-600' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center">
                                <div className={`p-3 bg-gray-50 rounded-xl`}>
                                    <item.icon className={`h-6 w-6 ${item.color}`} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">{item.label}</p>
                                    {loading ? (
                                        <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1"></div>
                                    ) : (
                                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
                        <button className="text-sm text-emerald-600 font-semibold hover:text-emerald-700">View All</button>
                    </div>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-xl"></div>
                            ))}
                        </div>
                    ) : recentBookings.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <BookOpen className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500">No recent bookings found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentBookings.slice(0, 5).map((booking) => (
                                <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl border border-gray-100">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm text-emerald-600 font-bold">
                                            {booking.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="ml-4">
                                            <p className="font-bold text-gray-900">{booking.user?.name}</p>
                                            <p className="text-xs text-gray-500">{booking.bookingId}</p>
                                            <p className="text-xs font-medium text-gray-600">{booking.bus?.busNumber} • {booking.route?.from} → {booking.route?.to}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600 font-mono">₹{booking.totalAmount}</p>
                                        <p className="text-[10px] text-gray-500 mb-1">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                            booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-rose-100 text-rose-700'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default OperatorDashboard
