"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Search, Filter } from "lucide-react"
import toast from "react-hot-toast"

const AdminBuses = () => {
  const [buses, setBuses] = useState([])
  const [filteredBuses, setFilteredBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")

  const fetchBuses = useCallback(async () => {
    try {
      const response = await axios.get("/api/buses/admin/all")
      setBuses(response.data)
      setLoading(false)
    } catch (error) {
      toast.error("Failed to fetch buses")
      setLoading(false)
    }
  }, [])

  const filterBuses = useCallback(() => {
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

    // DEDUPLICATE BUSES based on busNumber
    const uniqueBusesMap = new Map();

    filtered.forEach(bus => {
      if (!uniqueBusesMap.has(bus.busNumber)) {
        uniqueBusesMap.set(bus.busNumber, { ...bus, tripCount: 1 });
      } else {
        // Increment trip count for existing bus
        const existing = uniqueBusesMap.get(bus.busNumber);
        existing.tripCount += 1;
      }
    });

    setFilteredBuses(Array.from(uniqueBusesMap.values()));
  }, [buses, searchTerm, filterType])

  useEffect(() => {
    fetchBuses()
  }, [fetchBuses])

  useEffect(() => {
    filterBuses()
  }, [filterBuses])

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
            <div className="text-sm text-gray-600 flex items-center">Total: {filteredBuses.length} distinct buses</div>
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
                    Operator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Trips
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBuses.map((bus) => (
                  <tr key={bus._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{bus.busNumber}</div>
                      <div className="text-xs text-gray-500">{bus.busType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {bus.route.from} to {bus.route.to}
                      </div>
                      <div className="text-xs text-gray-500">Duration: {bus.route.duration}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{bus.operatorName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {bus.tripCount} Trips
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${bus.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                      >
                        {bus.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminBuses
