"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { MapPin, DollarSign, Bus } from "lucide-react"
import toast from "react-hot-toast"

const AdminRoutes = () => {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await axios.get("/api/buses/admin/all")
      // Group buses by route
      const routeMap = new Map()

      response.data.forEach((bus) => {
        const routeKey = `${bus.route.from}-${bus.route.to}`
        if (!routeMap.has(routeKey)) {
          routeMap.set(routeKey, {
            from: bus.route.from,
            to: bus.route.to,
            distance: bus.route.distance,
            buses: [],
            minPrice: bus.price,
            maxPrice: bus.price,
          })
        }

        const route = routeMap.get(routeKey)
        route.buses.push(bus)
        route.minPrice = Math.min(route.minPrice, bus.price)
        route.maxPrice = Math.max(route.maxPrice, bus.price)
      })

      setRoutes(Array.from(routeMap.values()))
      setLoading(false)
    } catch (error) {
      toast.error("Failed to fetch routes")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p>Loading routes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bus Routes</h1>
          <p className="text-gray-600">Overview of all available routes and buses</p>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {route.from} → {route.to}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-medium">{route.distance} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Available Buses</span>
                  <span className="font-medium flex items-center">
                    <Bus className="h-4 w-4 mr-1" />
                    {route.buses.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price Range</span>
                  <span className="font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />₹{route.minPrice} - ₹{route.maxPrice}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Operators:</h4>
                <div className="space-y-1">
                  {route.buses.slice(0, 3).map((bus, busIndex) => (
                    <div key={busIndex} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{bus.operatorName}</span>
                      <span className="text-gray-500">{bus.busType}</span>
                    </div>
                  ))}
                  {route.buses.length > 3 && (
                    <div className="text-sm text-blue-600">+{route.buses.length - 3} more operators</div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-green-600">
                      {route.buses.reduce((sum, bus) => sum + bus.availableSeats, 0)}
                    </p>
                    <p className="text-sm text-gray-500">Available Seats</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-blue-600">
                      {route.buses.reduce((sum, bus) => sum + bus.totalSeats, 0)}
                    </p>
                    <p className="text-sm text-gray-500">Total Seats</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {routes.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
            <p className="text-gray-500">Add some buses to see routes here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminRoutes
