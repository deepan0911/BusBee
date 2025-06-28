"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { Filter, MapPin, Clock, Users, Star, Wifi, Tv, Coffee, Calendar } from "lucide-react"
import toast from "react-hot-toast"

const BusSearch = () => {
  const [searchParams] = useSearchParams()
  const [buses, setBuses] = useState([])
  const [filteredBuses, setFilteredBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    busType: "",
    priceRange: "",
    departureTime: "",
    amenities: [],
  })
  const navigate = useNavigate()

  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const date = searchParams.get("date")

  useEffect(() => {
    fetchBuses()
  }, [from, to, date])

  useEffect(() => {
    applyFilters()
  }, [buses, filters])

  const fetchBuses = async () => {
    try {
      console.log("Searching buses with params:", { from, to, date })
      const response = await axios.get("/api/buses/search", {
        params: { from, to, date },
      })
      console.log("Found buses:", response.data.length)
      setBuses(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Bus search error:", error)
      toast.error("Failed to fetch buses")
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...buses]

    if (filters.busType) {
      filtered = filtered.filter((bus) => bus.busType === filters.busType)
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number)
      filtered = filtered.filter((bus) => bus.price >= min && bus.price <= max)
    }

    if (filters.departureTime) {
      const [start, end] = filters.departureTime.split("-")
      filtered = filtered.filter((bus) => {
        const depTime = Number.parseInt(bus.schedule.departureTime.split(":")[0])
        const startTime = Number.parseInt(start)
        const endTime = Number.parseInt(end)
        return depTime >= startTime && depTime < endTime
      })
    }

    setFilteredBuses(filtered)
  }

  const handleBookNow = (busId) => {
    navigate(`/bus/${busId}?from=${from}&to=${to}&date=${date}`)
  }

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "tv":
        return <Tv className="h-4 w-4" />
      case "refreshments":
        return <Coffee className="h-4 w-4" />
      default:
        return null
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p>Searching for buses...</p>
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
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="text-sm text-gray-600">{filteredBuses.length} buses found</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h3>

              {/* Bus Type Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Bus Type</h4>
                <div className="space-y-2">
                  {["AC", "Non-AC", "Sleeper", "Semi-Sleeper", "Luxury"].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="radio"
                        name="busType"
                        value={type}
                        checked={filters.busType === type}
                        onChange={(e) => setFilters({ ...filters, busType: e.target.value })}
                        className="mr-2"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-2">
                  {[
                    { label: "Under ₹300", value: "0-300" },
                    { label: "₹300 - ₹500", value: "300-500" },
                    { label: "₹500 - ₹800", value: "500-800" },
                    { label: "Above ₹800", value: "800-10000" },
                  ].map((range) => (
                    <label key={range.value} className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        value={range.value}
                        checked={filters.priceRange === range.value}
                        onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                        className="mr-2"
                      />
                      {range.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Departure Time Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Departure Time</h4>
                <div className="space-y-2">
                  {[
                    { label: "Morning (6AM - 12PM)", value: "6-12" },
                    { label: "Afternoon (12PM - 6PM)", value: "12-18" },
                    { label: "Evening (6PM - 12AM)", value: "18-24" },
                    { label: "Night (12AM - 6AM)", value: "0-6" },
                  ].map((time) => (
                    <label key={time.value} className="flex items-center">
                      <input
                        type="radio"
                        name="departureTime"
                        value={time.value}
                        checked={filters.departureTime === time.value}
                        onChange={(e) => setFilters({ ...filters, departureTime: e.target.value })}
                        className="mr-2"
                      />
                      {time.label}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setFilters({ busType: "", priceRange: "", departureTime: "", amenities: [] })}
                className="w-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-2 px-4 rounded transition"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Bus List */}
          <div className="lg:col-span-3">
            {filteredBuses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No buses found for your search criteria</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search for a different date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBuses.map((bus) => (
                  <div key={bus._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{bus.operatorName}</h3>
                          <p className="text-gray-600">
                            {bus.busNumber} • {bus.busType}
                          </p>
                          {bus.schedule.departureDate && (
                            <p className="text-sm text-blue-600 font-medium">
                              {formatDate(bus.schedule.departureDate)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="text-sm">{bus.rating || 4.2}</span>
                          </div>
                          <p className="text-sm text-gray-500">{bus.reviews?.length || 0} reviews</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium">{bus.schedule.departureTime}</p>
                            <p className="text-sm text-gray-500">{from}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="w-full border-t-2 border-dashed border-gray-300 mx-4"></div>
                          <span className="text-sm text-gray-500 whitespace-nowrap">{bus.schedule.duration}</span>
                          <div className="w-full border-t-2 border-dashed border-gray-300 mx-4"></div>
                        </div>

                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium">{bus.schedule.arrivalTime}</p>
                            <p className="text-sm text-gray-500">{to}</p>
                            {bus.schedule.arrivalDate &&
                              new Date(bus.schedule.arrivalDate).toDateString() !==
                                new Date(bus.schedule.departureDate).toDateString() && (
                                <p className="text-xs text-orange-600">+1 day</p>
                              )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">₹{bus.price}</p>
                          <p className="text-sm text-gray-500">per seat</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-1" />
                            {bus.availableSeats} seats available
                          </div>

                          <div className="flex items-center space-x-2">
                            {bus.amenities?.slice(0, 3).map((amenity, index) => (
                              <div key={index} className="flex items-center text-xs text-gray-500">
                                {getAmenityIcon(amenity)}
                                <span className="ml-1">{amenity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                              onClick={() => handleBookNow(bus._id)}
                              disabled={bus.availableSeats === 0}
                              className={`px-4 py-1.5 rounded text-sm font-medium transition 
                                ${bus.availableSeats === 0
                                  ? "bg-gray-400 text-white cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"}
                              `}
                            >
                              {bus.availableSeats === 0 ? "Bus Full" : "Select Seats"}
                            </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusSearch
