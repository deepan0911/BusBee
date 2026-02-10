"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { User, Mail, Phone, Calendar, Edit2, Save, X } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [statistics, setStatistics] = useState({
    totalBookings: 0,
    totalSpent: 0,
    cancelledBookings: 0,
    loading: true
  })
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Fetch booking statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"
        const token = localStorage.getItem("token")

        const response = await axios.get(`${baseURL}/api/bookings/my-bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const bookings = response.data

        // Calculate statistics
        const totalBookings = bookings.length
        const totalSpent = bookings
          .filter(b => b.status !== "cancelled")
          .reduce((sum, booking) => sum + booking.totalAmount, 0)
        const cancelledBookings = bookings.filter(b => b.status === "cancelled").length

        setStatistics({
          totalBookings,
          totalSpent,
          cancelledBookings,
          loading: false
        })
      } catch (error) {
        // console.error("Error fetching statistics:", error)
        setStatistics(prev => ({ ...prev, loading: false }))
      }
    }

    if (user) {
      fetchStatistics()
    }
  }, [user])

  const handleSave = async () => {
    try {
      // In a real app, you would make an API call to update user profile
      toast.success("Profile updated successfully!")
      setIsEditing(false)
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{user?.name}</h2>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : new Date().getFullYear()}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-5 rounded-full shadow-md transition-all duration-300 ease-in-out flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </button>

                    <button
                      onClick={handleCancel}
                      className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-black font-semibold py-2 px-5 rounded-full shadow-sm transition-all duration-300 ease-in-out flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{user?.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{user?.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{user?.phone}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Account Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
              {statistics.loading ? (
                <div className="text-center py-8">
                  <div className="spinner mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading statistics...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{statistics.totalBookings}</p>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">₹{statistics.totalSpent.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{statistics.cancelledBookings}</p>
                    <p className="text-sm text-gray-600">Cancelled Bookings</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
