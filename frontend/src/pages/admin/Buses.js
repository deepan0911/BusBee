"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Plus, Edit2, Trash2, Search, Filter, Calendar, Clock } from "lucide-react"
import toast from "react-hot-toast"

const allCities = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Goa", "Agra"
]

const AdminBuses = () => {
  const [buses, setBuses] = useState([])
  const [filteredBuses, setFilteredBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBus, setEditingBus] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")
  const [focusedField, setFocusedField] = useState(null)

  const [formData, setFormData] = useState({
    busNumber: "",
    operatorName: "",
    busType: "AC",
    totalSeats: 40,
    route: {
      from: "",
      to: "",
      distance: 0,
    },
    schedule: {
      departureDate: "",
      departureTime: "",
      arrivalDate: "",
      arrivalTime: "",
      duration: "",
      travelHours: 0,
    },
    price: 0,
    amenities: [],
  })


  const handleInputChange1 = (e) => {
    const { name, value } = e.target
    const [section, key] = name.split(".")
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }


  const handleAutoSuggestChange = (e, field) => {
    setFormData((prev) => ({
      ...prev,
      route: {
        ...prev.route,
        [field]: e.target.value,
      },
    }))
  } 

  const handleCitySelect = (field, city) => {
    setFormData((prev) => ({
      ...prev,
      route: {
        ...prev.route,
        [field]: city,
      },
    }))
    setFocusedField(null)
  }


  const filteredCities = (input) => {
    return allCities.filter(
      (city) =>
        city.toLowerCase().includes(input.toLowerCase()) &&
        city.toLowerCase() !== input.toLowerCase()
    )
  }


  useEffect(() => {
    fetchBuses()
  }, [])

  useEffect(() => {
    const filterBuses = () => {
      let filtered = buses

      if (searchTerm) {
        filtered = filtered.filter(
          (bus) =>
            bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bus.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bus.route.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bus.route.to.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      if (filterType) {
        filtered = filtered.filter((bus) => bus.busType === filterType)
      }

      setFilteredBuses(filtered)
    }

    filterBuses()
  }, [buses, searchTerm, filterType])

  // Calculate arrival date and time based on departure and travel hours
  const calculateArrival = (departureDate, departureTime, travelHours) => {
    if (!departureDate || !departureTime || !travelHours) return { arrivalDate: "", arrivalTime: "" }

    const depDateTime = new Date(`${departureDate}T${departureTime}`)
    const arrDateTime = new Date(depDateTime.getTime() + travelHours * 60 * 60 * 1000)

    const arrivalDate = arrDateTime.toISOString().split("T")[0]
    const arrivalTime = arrDateTime.toTimeString().slice(0, 5)

    return { arrivalDate, arrivalTime }
  }

  // Format duration from hours
  const formatDuration = (hours) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m > 0 ? m + "m" : ""}`
  }

  const fetchBuses = async () => {
    try {
      const response = await axios.get("/api/buses/admin/all")
      setBuses(response.data)
      setLoading(false)
    } catch (error) {
      toast.error("Failed to fetch buses")
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Calculate arrival details before submitting
      const { arrivalDate, arrivalTime } = calculateArrival(
        formData.schedule.departureDate,
        formData.schedule.departureTime,
        formData.schedule.travelHours,
      )

      const submitData = {
        ...formData,
        schedule: {
          ...formData.schedule,
          arrivalDate,
          arrivalTime,
          duration: formatDuration(formData.schedule.travelHours),
        },
      }

      if (editingBus) {
        await axios.put(`/api/buses/${editingBus._id}`, submitData)
        toast.success("Bus updated successfully")
      } else {
        await axios.post("/api/buses", submitData)
        toast.success("Bus created successfully")
      }
      setShowModal(false)
      setEditingBus(null)
      resetForm()
      fetchBuses()
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed")
    }
  }

  const handleEdit = (bus) => {
    setEditingBus(bus)
    // Convert dates for form inputs
    const formattedBus = {
      ...bus,
      schedule: {
        ...bus.schedule,
        departureDate: bus.schedule.departureDate
          ? new Date(bus.schedule.departureDate).toISOString().split("T")[0]
          : "",
        arrivalDate: bus.schedule.arrivalDate ? new Date(bus.schedule.arrivalDate).toISOString().split("T")[0] : "",
      },
    }
    setFormData(formattedBus)
    setShowModal(true)
  }

  const handleDelete = async (bus) => {
    const confirmMessage = `Are you sure you want to delete this bus?\n\nBus: ${bus.operatorName}\nNumber: ${bus.busNumber}\nRoute: ${bus.route.from} → ${bus.route.to}\n\nThis action cannot be undone.`

    if (!window.confirm(confirmMessage)) return

    try {
      await axios.delete(`/api/buses/${bus._id}`)
      toast.success("Bus deleted successfully")
      fetchBuses()
    } catch (error) {
      toast.error("Failed to delete bus")
    }
  }

  const resetForm = () => {
    setFormData({
      busNumber: "",
      operatorName: "",
      busType: "AC",
      totalSeats: 40,
      route: {
        from: "",
        to: "",
        distance: 0,
      },
      schedule: {
        departureDate: "",
        departureTime: "",
        arrivalDate: "",
        arrivalTime: "",
        duration: "",
        travelHours: 0,
      },
      price: 0,
      amenities: [],
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      const newFormData = {
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      }

      // Auto-calculate arrival when departure or travel hours change
      if (
        parent === "schedule" &&
        (child === "departureDate" || child === "departureTime" || child === "travelHours")
      ) {
        const { arrivalDate, arrivalTime } = calculateArrival(
          child === "departureDate" ? value : newFormData.schedule.departureDate,
          child === "departureTime" ? value : newFormData.schedule.departureTime,
          child === "travelHours" ? Number.parseFloat(value) : newFormData.schedule.travelHours,
        )
        newFormData.schedule.arrivalDate = arrivalDate
        newFormData.schedule.arrivalTime = arrivalTime
        newFormData.schedule.duration = formatDuration(
          child === "travelHours" ? Number.parseFloat(value) : newFormData.schedule.travelHours,
        )
      }

      setFormData(newFormData)
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p>Loading buses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Buses</h1>
            <p className="text-gray-600">Add, edit, and manage your bus fleet</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setEditingBus(null)
              setShowModal(true)
            }}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Bus
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search buses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input w-full pl-10">
                <option value="">All Bus Types</option>
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
                <option value="Sleeper">Sleeper</option>
                <option value="Semi-Sleeper">Semi-Sleeper</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>
            <div className="text-sm text-gray-600 flex items-center">Total: {filteredBuses.length} buses</div>
          </div>
        </div>

        {/* Buses Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBuses.map((bus) => (
                  <tr key={bus._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bus.operatorName}</div>
                        <div className="text-sm text-gray-500">
                          {bus.busNumber} • {bus.busType}
                        </div>
                        <div className="text-sm text-gray-500">{bus.totalSeats} seats</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bus.route.from} → {bus.route.to}
                      </div>
                      <div className="text-sm text-gray-500">{bus.route.distance} km</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bus.schedule.departureDate && new Date(bus.schedule.departureDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {bus.schedule.departureTime} - {bus.schedule.arrivalTime}
                      </div>
                      <div className="text-sm text-gray-500">{bus.schedule.duration}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{bus.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          bus.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {bus.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(bus)} className="text-blue-600 hover:text-blue-900">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(bus)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editingBus ? "Edit Bus" : "Add New Bus"}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Bus Information */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bus Number *</label>
                      <input
                        type="text"
                        name="busNumber"
                        value={formData.busNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., MH12AB1234"
                        className="input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Operator Name *</label>
                      <input
                        type="text"
                        name="operatorName"
                        value={formData.operatorName}
                        onChange={handleInputChange}
                        placeholder="e.g., Shivneri Travels"
                        className="input w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bus Type *</label>
                      <select
                        name="busType"
                        value={formData.busType}
                        onChange={handleInputChange}
                        className="input w-full"
                        required
                      >
                        <option value="AC">AC</option>
                        <option value="Non-AC">Non-AC</option>
                        <option value="Sleeper">Sleeper</option>
                        <option value="Semi-Sleeper">Semi-Sleeper</option>
                        <option value="Luxury">Luxury</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Seats *</label>
                      <select
                        name="totalSeats"
                        value={formData.totalSeats}
                        onChange={handleInputChange}
                        className="input w-full"
                        required
                      >
                        <option value={32}>32 Seats</option>
                        <option value={36}>36 Seats</option>
                        <option value={40}>40 Seats</option>
                        <option value={45}>45 Seats</option>
                        <option value={50}>50 Seats</option>
                      </select>
                    </div>
                  </div>
                </div>

                                {/* Route Information */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Route Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">From City *</label>
                      <input
                        type="text"
                        name="route.from"
                        value={formData.route.from}
                        onChange={(e) => handleAutoSuggestChange(e, 'from')}
                        onFocus={() => setFocusedField('from')}
                        onBlur={() => setTimeout(() => setFocusedField(null), 100)}
                        placeholder="Enter origin city"
                        className="input w-full"
                        required
                      />
                      {focusedField === 'from' && formData.route.from.trim() && (
                        <ul className="absolute z-10 bg-white border border-gray-300 mt-1 rounded w-full max-h-40 overflow-auto shadow text-sm text-gray-900">
                          {filteredCities('from').map((city, idx) => (
                            <li
                              key={idx}
                              className="px-4 py-1 hover:bg-blue-100 cursor-pointer"
                              onMouseDown={() => handleCitySelect(city, 'from')}
                            >
                              {city}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">To City *</label>
                      <input
                        type="text"
                        name="route.to"
                        value={formData.route.to}
                        onChange={(e) => handleAutoSuggestChange(e, 'to')}
                        onFocus={() => setFocusedField('to')}
                        onBlur={() => setTimeout(() => setFocusedField(null), 100)}
                        placeholder="Enter destination city"
                        className="input w-full"
                        required
                      />
                      {focusedField === 'to' && formData.route.to.trim() && (
                        <ul className="absolute z-10 bg-white border border-gray-300 mt-1 rounded w-full max-h-40 overflow-auto shadow text-sm text-gray-900">
                          {filteredCities('to').map((city, idx) => (
                            <li
                              key={idx}
                              className="px-4 py-1 hover:bg-blue-100 cursor-pointer"
                              onMouseDown={() => handleCitySelect(city, 'to')}
                            >
                              {city}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km) *</label>
                      <input
                        type="number"
                        name="route.distance"
                        value={formData.route.distance}
                        onChange={handleInputChange1}
                        placeholder="e.g., 150"
                        className="input w-full"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>


                {/* Schedule Information */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Departure Section */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Departure Details
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date *</label>
                          <input
                            type="date"
                            name="schedule.departureDate"
                            value={formData.schedule.departureDate}
                            onChange={handleInputChange}
                            className="input w-full"
                            min={new Date().toISOString().split("T")[0]}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Departure Time *</label>
                          <input
                            type="time"
                            name="schedule.departureTime"
                            value={formData.schedule.departureTime}
                            onChange={handleInputChange}
                            className="input w-full"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Travel Duration (hours) *
                          </label>
                          <input
                            type="number"
                            name="schedule.travelHours"
                            value={formData.schedule.travelHours}
                            onChange={handleInputChange}
                            placeholder="e.g., 3.5 for 3 hours 30 minutes"
                            className="input w-full"
                            min="0.5"
                            max="24"
                            step="0.5"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter decimal hours (e.g., 3.5 = 3h 30m, 6.25 = 6h 15m)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Arrival Section (Auto-calculated) */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-3 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Arrival Details (Auto-calculated)
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Arrival Date</label>
                          <input
                            type="date"
                            value={formData.schedule.arrivalDate}
                            className="input w-full bg-gray-100"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Arrival Time</label>
                          <input
                            type="time"
                            value={formData.schedule.arrivalTime}
                            className="input w-full bg-gray-100"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                          <input
                            type="text"
                            value={formData.schedule.duration}
                            className="input w-full bg-gray-100"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing and Amenities */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price per Seat (₹) *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="e.g., 250"
                        className="input w-full"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["WiFi", "TV", "Refreshments", "Blanket", "Pillow", "Music System"].map((amenity) => (
                          <label key={amenity} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.amenities.includes(amenity)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    amenities: [...formData.amenities, amenity],
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    amenities: formData.amenities.filter((a) => a !== amenity),
                                  })
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm">{amenity}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg transition-all duration-150"
                    >Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 font-semibold rounded-lg transition-all duration-150"
                    >
                      {editingBus ? " Update Bus" : " Add Bus"}
                    </button>
                  </div>

              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBuses
