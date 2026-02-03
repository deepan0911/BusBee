"use client"
import { useState, useEffect, useCallback } from "react"
import { Plus, Edit, Trash2, Calendar, X, Armchair, Bed, Disc, MapPin, Clock, Hash, IndianRupee, Bus } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"

const OperatorBuses = () => {
    const [buses, setBuses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingBus, setEditingBus] = useState(null)

    const [confirmModal, setConfirmModal] = useState({
        show: false,
        id: null
    })

    // Form State
    const [selectedDates, setSelectedDates] = useState([])
    const [recurring, setRecurring] = useState({
        startDate: "",
        endDate: "",
        days: [] // 0-6
    })

    // Drag and Drop Logic State
    const [dragItem, setDragItem] = useState(null) // { type: 'new'|'move', value: 'seater'|'sleeper'|key }

    const handleDragStart = (e, type, value) => {
        setDragItem({ type, value })
        e.dataTransfer.effectAllowed = 'move'
        // Required for Firefox
        e.dataTransfer.setData('text/plain', JSON.stringify({ type, value }))
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e, targetDeck, targetRow, targetCol) => {
        e.preventDefault()
        const targetKey = `${targetDeck}-${targetRow}-${targetCol}`

        if (!dragItem) {
            // Try to parse from dataTransfer (for cross-browser safety if state failed usually not needed in React but valid)
            try {
                const data = JSON.parse(e.dataTransfer.getData('text/plain'))
                if (data) {
                    // Logic same as below
                }
            } catch (err) { }
            // Relying on state usually works in React event loop
        }

        // Use local var or state
        const item = dragItem

        if (!item) return

        setSeatMap(prev => {
            const next = { ...prev }

            if (item.type === 'new') {
                // Placing a new seat from palette
                next[targetKey] = { type: item.value }
            } else if (item.type === 'move') {
                // Moving an existing seat
                const sourceKey = item.value
                const seatData = next[sourceKey]

                if (seatData) {
                    delete next[sourceKey] // Remove from old location
                    next[targetKey] = seatData // Place in new location
                }
            }

            return next
        })
        setDragItem(null)
    }

    const removeSeat = (key) => {
        setSeatMap(prev => {
            const next = { ...prev }
            delete next[key]
            return next
        })
    }

    // fallback for click
    const toggleSeat = (deck, row, col) => {
        const key = `${deck}-${row}-${col}`
        setSeatMap(prev => {
            const current = prev[key]
            const next = { ...prev }

            if (!current) {
                next[key] = { type: 'seater' }
            } else if (current.type === 'seater') {
                next[key] = { type: 'sleeper' }
            } else {
                delete next[key]
            }
            return next
        })
    }


    // Seat Layout State
    const [layoutConfig, setLayoutConfig] = useState({
        rows: 10,
        colsLeft: 2,
        colsRight: 2,
        upperDeck: false
    })
    const [seatMap, setSeatMap] = useState({}) // Key: "deck-row-col", Value: { type: 'seater'|'sleeper', label: '1A' }
    const [missingFields, setMissingFields] = useState([]) // Track missing required fields

    // Initialize default seat map when modal opens or config updates
    useEffect(() => {
        if (!showModal) return;
        // Clear validation errors when modal opens
        setMissingFields([])
        // Don't overwrite if editing (logic to be added later for edit mode)
    }, [showModal])

    const WEEKDAYS = [
        { id: 0, label: 'Sun' },
        { id: 1, label: 'Mon' },
        { id: 2, label: 'Tue' },
        { id: 3, label: 'Wed' },
        { id: 4, label: 'Thu' },
        { id: 5, label: 'Fri' },
        { id: 6, label: 'Sat' }
    ]

    // Form State
    const [scheduleType, setScheduleType] = useState('single')
    const [formData, setFormData] = useState({
        busNumber: "",
        busType: "AC",
        totalSeats: 0,
        priceSeater: "",
        priceSleeper: "",
        operatorName: "",
        route: { from: "", to: "", distance: "" },
        schedule: {
            departureDate: "",
            departureTime: "",
            arrivalDate: "",
            arrivalTime: "",
            duration: "",
            travelHours: "",
        },
        // Amenities
        amenities: {
            wifi: false,
            chargingPoint: false,
            waterBottle: false,
            blanket: false,
            readingLight: false,
            emergencyExit: false,
            gpsTracking: false,
            cctv: false
        },
        // Boarding & Dropping Points
        boardingPoints: [{ location: "", time: "" }],
        droppingPoints: [{ location: "", time: "" }],
        // Cancellation Policy
        cancellationPolicy: {
            allowed: true,
            chargeType: "percentage", // percentage or fixed
            chargeAmount: "",
            refundPolicy: "",
            timeLimit: "24" // hours before departure
        },
        // Operator Information
        operatorInfo: {
            contactNumber: "",
            emergencyContact: "",
            supportEmail: ""
        },
        // Additional Details
        additionalDetails: {
            restStops: "",
            restStopDuration: "",
            liveTracking: false,
            partialBooking: true
        },
        // Safety Features
        safetyFeatures: {
            fireExtinguisher: false,
            firstAidKit: false,
            seatBelts: false
        },
        // Driver Details
        driverDetails: {
            name: "",
            license: "",
            experience: ""
        },
        // Seat Preferences
        seatPreferences: {
            windowSeats: 0,
            aisleSeats: 0,
            ladiesOnlySeats: 0
        },
        // Dynamic Pricing
        dynamicPricing: {
            weekendSurcharge: "",
            peakSeasonSurcharge: "",
            earlyBirdDiscount: "",
            lastMinuteSurcharge: ""
        },
        seats: [] // Added seats array
    })

    const { user, loading: authLoading } = useAuth()

    const fetchBuses = useCallback(async () => {
        try {
            const response = await axios.get("/api/buses/operator/my-buses")
            setBuses(response.data)
            setLoading(false)
        } catch (error) {
            toast.error("Failed to fetch buses")
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!authLoading && user) {
            fetchBuses()
        }
    }, [user, authLoading, fetchBuses])


    // specific grouping logic
    const getGroupedBuses = () => {
        const groups = {}
        buses.forEach(bus => {
            if (!groups[bus.busNumber]) {
                groups[bus.busNumber] = {
                    ...bus,
                    schedules: []
                }
            }
            groups[bus.busNumber].schedules.push({
                id: bus._id,
                date: bus.schedule.departureDate,
                time: bus.schedule.departureTime
            })
        })
        return Object.values(groups)
    }

    const handleDelete = (id) => {
        setConfirmModal({
            show: true,
            id,
            type: 'single'
        })
    }

    const handleDeleteGroup = (busNumber) => {
        // Find all IDs for this bus number
        const ids = buses.filter(b => b.busNumber === busNumber).map(b => b._id)
        setConfirmModal({
            show: true,
            ids,
            type: 'group'
        })
    }

    const confirmDelete = async () => {
        const { id, ids, type } = confirmModal

        try {
            if (type === 'group' && ids) {
                await Promise.all(ids.map(busId => axios.delete(`/api/buses/${busId}`)))
                toast.success("All trips for this bus deleted successfully")
            } else if (id) {
                await axios.delete(`/api/buses/${id}`)
                toast.success("Bus trip deleted successfully")
            }

            fetchBuses()
            setConfirmModal({ show: false, id: null, ids: null, type: null })
        } catch (error) {
            toast.error("Failed to delete")
        }
    }

    const generateSeatsFromMap = () => {
        const seats = []
        // Process seatMap to array
        let seatCounter = 1;

        // Helper to process a specific deck
        const processDeck = (deckName) => {
            const rows = layoutConfig.rows
            const cols = layoutConfig.colsLeft + layoutConfig.colsRight

            // CRITICAL: Column mapping must match exactly with customer view
            // Left side seats: col = 0 to (colsLeft-1)
            // Right side seats: col = colsLeft to (colsLeft+colsRight-1)
            // The aisle is at position colsLeft, so we skip it in the loop
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols + 1; c++) { // +1 for aisle
                    // Skip aisle column (assumed middle, at position colsLeft)
                    if (c === layoutConfig.colsLeft) continue;

                    // Calculate the actual column index to save
                    // Left side (c < colsLeft): col = c (0 to colsLeft-1)
                    // Right side (c > colsLeft): col = c - 1 (because we skip aisle)
                    // This ensures: left cols 0..colsLeft-1, right cols colsLeft..colsLeft+colsRight-1
                    let mapC = c
                    if (c > layoutConfig.colsLeft) mapC = c - 1

                    const key = `${deckName}-${r}-${mapC}`
                    const seatData = seatMap[key]

                    if (seatData) {
                        // CRITICAL: Save seat with exact row/col that matches customer view expectations
                        seats.push({
                            seatNumber: `S${seatCounter++}`,
                            type: seatData.type,
                            deck: deckName,
                            row: r,  // Row index (0-based)
                            col: mapC,  // Column index: 0..colsLeft-1 for left, colsLeft..colsLeft+colsRight-1 for right
                            isBooked: false
                        })
                    }
                }
            }
        }

        processDeck('lower')
        if (layoutConfig.upperDeck) processDeck('upper')
        return seats
    }

    const generateDatesFromRecurring = () => {
        if (!recurring.startDate || !recurring.endDate || recurring.days.length === 0) return []
        const dates = []
        let current = new Date(recurring.startDate)
        const end = new Date(recurring.endDate)

        while (current <= end) {
            if (recurring.days.includes(current.getDay())) {
                dates.push(new Date(current).toISOString().split('T')[0])
            }
            current.setDate(current.getDate() + 1)
        }
        return dates
    }

    const getSeatCounts = () => {
        let seater = 0
        let sleeper = 0
        Object.values(seatMap).forEach(s => {
            if (s.type === 'seater') seater++
            if (s.type === 'sleeper') sleeper++
        })
        return { seater, sleeper, total: seater + sleeper }
    }

    const validateForm = () => {
        const missing = []

        // Basic Info
        if (!formData.busNumber) missing.push("Bus Number")
        if (!formData.route?.from) missing.push("From Location")
        if (!formData.route?.to) missing.push("To Location")
        if (!formData.route?.distance) missing.push("Distance")
        if (!formData.priceSeater) missing.push("Seater Price")

        // Check if sleeper seats exist and price is missing
        const { sleeper } = getSeatCounts()
        if (sleeper > 0 && !formData.priceSleeper) missing.push("Sleeper Price")

        // Schedule
        if (scheduleType === 'single' && !formData.schedule?.departureDate) missing.push("Departure Date")
        if (!formData.schedule?.departureTime) missing.push("Departure Time")
        if (!formData.schedule?.travelHours) missing.push("Duration")

        // Multiple dates
        if (scheduleType === 'multiple' && selectedDates.length === 0) {
            missing.push("At least one date for Multiple Dates")
        }

        // Recurring
        if (scheduleType === 'recurring') {
            if (!recurring.startDate) missing.push("Start Date")
            if (!recurring.endDate) missing.push("End Date")
            if (recurring.days.length === 0) missing.push("At least one day for Recurring Schedule")
        }

        // Boarding & Dropping Points
        const hasEmptyBoarding = formData.boardingPoints.some(p => !p.location || !p.time)
        const hasEmptyDropping = formData.droppingPoints.some(p => !p.location || !p.time)
        if (hasEmptyBoarding) missing.push("All Boarding Point locations and times")
        if (hasEmptyDropping) missing.push("All Dropping Point locations and times")

        // Seats - CRITICAL: Ensure layout is designed
        const { total } = getSeatCounts()
        if (total === 0) missing.push("At least one seat in the layout")
        
        // CRITICAL: Ensure layoutConfig is set when seats are designed
        if (total > 0 && (!layoutConfig.rows || !layoutConfig.colsLeft || !layoutConfig.colsRight)) {
            missing.push("Seat layout configuration is incomplete")
        }

        // Operator Info
        if (!formData.operatorInfo?.contactNumber) missing.push("Contact Number")

        setMissingFields(missing)
        return missing.length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate form first
        if (!validateForm()) {
            toast.error("Please fill in all required fields")
            return
        }

        let targetDates = []
        if (scheduleType === 'single') {
            targetDates = [formData.schedule.departureDate]
        } else if (scheduleType === 'multiple') {
            targetDates = selectedDates
        } else if (scheduleType === 'recurring') {
            targetDates = generateDatesFromRecurring()
        }

        if (targetDates.length === 0) {
            toast.error("Please select at least one date")
            return
        }

        try {
            const generatedSeats = generateSeatsFromMap()
            // Auto-update total seats based on visual editor
            const totalSeatsCount = generatedSeats.length

            // CRITICAL: Ensure layoutConfig is always included when seats are designed
            if (!layoutConfig || !layoutConfig.rows || !layoutConfig.colsLeft || !layoutConfig.colsRight) {
                toast.error("Seat layout configuration is missing. Please configure the seat layout.")
                return
            }

            const promises = targetDates.map(date => {
                const submissionData = {
                    ...formData,
                    totalSeats: totalSeatsCount,
                    availableSeats: totalSeatsCount,
                    seats: generatedSeats,
                    // CRITICAL: Always include the exact layoutConfig designed by operator
                    layoutConfig: {
                        rows: layoutConfig.rows,
                        colsLeft: layoutConfig.colsLeft,
                        colsRight: layoutConfig.colsRight,
                        upperDeck: layoutConfig.upperDeck || false
                    },
                    price: Number(formData.priceSeater || formData.priceSleeper || 0),
                    route: {
                        ...formData.route,
                        distance: Number(formData.route.distance)
                    },
                    schedule: {
                        ...formData.schedule,
                        departureDate: date,
                        travelHours: Number(formData.schedule.travelHours)
                    }
                }

                if (editingBus) {
                    return axios.put(`/api/buses/${editingBus._id}`, submissionData)
                } else {
                    return axios.post("/api/buses", submissionData)
                }
            })

            await Promise.all(promises)

            toast.success(editingBus ? "Bus updated successfully" : `Successfully created ${targetDates.length} bus trips`)

            setShowModal(false)
            setEditingBus(null)
            fetchBuses()
            // Reset form
            setFormData({
                busNumber: "",
                busType: "AC",
                totalSeats: 40,
                price: "",
                operatorName: "",
                route: { from: "", to: "", distance: "" },
                schedule: {
                    departureDate: "",
                    departureTime: "",
                    arrivalDate: "",
                    arrivalTime: "",
                    duration: "",
                    travelHours: "",
                },
                seats: [] // Added seats array
            })
            setScheduleType('single')
            setSelectedDates([])
            setRecurring({ startDate: "", endDate: "", days: [] })
            setMissingFields([]) // Clear validation errors
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed")
        }
    }

    const handleRecurringDayToggle = (dayId) => {
        setRecurring(prev => {
            const days = prev.days.includes(dayId)
                ? prev.days.filter(d => d !== dayId)
                : [...prev.days, dayId]
            return { ...prev, days }
        })
    }

    const addSelectedDate = (e) => {
        const date = e.target.value
        if (date && !selectedDates.includes(date)) {
            setSelectedDates([...selectedDates, date])
        }
    }

    const removeSelectedDate = (dateToRemove) => {
        setSelectedDates(selectedDates.filter(d => d !== dateToRemove))
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Buses</h1>
                    <button
                        onClick={() => {
                            setEditingBus(null);
                            setShowModal(true);
                        }}
                        className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Bus
                    </button>
                </div>

                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Info</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Seats</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
                                        <p className="mt-2 text-gray-500">Fetching your buses...</p>
                                    </td>
                                </tr>
                            ) : getGroupedBuses().length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <Bus className="h-12 w-12 text-gray-300 mb-2" />
                                            <p className="text-lg">No buses found</p>
                                            <p className="text-sm">Click "Add Bus" to create your first bus trip.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                getGroupedBuses().map((bus) => (
                                    <tr key={bus.busNumber}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{bus.busNumber}</div>
                                            <div className="text-sm text-gray-500">{bus.busType}</div>
                                            <div className="text-sm text-gray-500">{bus.operatorName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{bus.route.from} → {bus.route.to}</div>
                                            <div className="text-sm text-gray-500">{bus.route.distance} km</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {bus.schedules
                                                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                                                    .map(schedule => (
                                                        <div key={schedule.id} className="inline-flex items-center bg-gray-100 rounded px-2 py-1 text-xs">
                                                            <span>{new Date(schedule.date).toLocaleDateString()} ({schedule.time})</span>
                                                            <button
                                                                onClick={() => handleDelete(schedule.id)}
                                                                className="ml-2 text-gray-400 hover:text-red-600"
                                                                title="Delete this specific trip"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">₹{bus.price}</div>
                                            <div className="text-sm text-gray-500">{bus.availableSeats}/{bus.totalSeats} seats</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    const populateSeatMap = (seats) => {
                                                        const newMap = {}
                                                        seats.forEach(s => {
                                                            const key = `${s.deck}-${s.row}-${s.col}`
                                                            newMap[key] = { type: s.type }
                                                        })
                                                        return newMap
                                                    }

                                                    setFormData({
                                                        ...bus,
                                                        schedule: {
                                                            ...bus.schedule,
                                                            departureDate: '', // Clear date to force selection
                                                        }
                                                    });

                                                    if (bus.layoutConfig) setLayoutConfig(bus.layoutConfig);
                                                    if (bus.seats) setSeatMap(populateSeatMap(bus.seats));

                                                    setEditingBus(null); // Treat as new for now to avoid complexity of updating groups
                                                    setShowModal(true);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                title="Use as template for new dates"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => handleDeleteGroup(bus.busNumber)} className="text-red-600 hover:text-red-900" title="Delete ALL trips for this bus">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal would go here - simplified for this step. Ideally create a BusForm component. */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-[95vw] lg:max-w-[1200px] w-full p-6 max-h-[90vh] overflow-y-auto transition-all shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">{editingBus ? 'Edit Bus' : 'Add New Bus'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Simplified form fields */}
                            {/* Professional Form Layout */}
                            <div className="space-y-5">
                                {/* Section 1: Basic Info & Route */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Bus Details</label>
                                        <div className="space-y-3">
                                            <div className="relative group">
                                                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                                <input
                                                    placeholder="Bus Number"
                                                    className="pl-9 input w-full bg-gray-50 border-gray-200 focus:bg-white transition-all hover:bg-white text-sm h-9"
                                                    value={formData.busNumber}
                                                    onChange={e => setFormData({ ...formData, busNumber: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="relative group">
                                                <Bus className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                                <select
                                                    className="pl-9 input w-full bg-gray-50 border-gray-200 focus:bg-white transition-all hover:bg-white appearance-none text-sm h-9"
                                                    value={formData.busType}
                                                    onChange={e => setFormData({ ...formData, busType: e.target.value })}
                                                >
                                                    <option value="AC">AC Seater/Sleeper</option>
                                                    <option value="Non-AC">Non-AC</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Route</label>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="relative group">
                                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                                    <input
                                                        placeholder="From"
                                                        className="pl-9 input w-full bg-gray-50 border-gray-200 focus:bg-white transition-all hover:bg-white text-sm h-9"
                                                        value={formData.route?.from}
                                                        onChange={e => setFormData({ ...formData, route: { ...formData.route, from: e.target.value } })}
                                                        required
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                                    <input
                                                        placeholder="To"
                                                        className="pl-9 input w-full bg-gray-50 border-gray-200 focus:bg-white transition-all hover:bg-white text-sm h-9"
                                                        value={formData.route?.to}
                                                        onChange={e => setFormData({ ...formData, route: { ...formData.route, to: e.target.value } })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <input
                                                placeholder="Total Distance (km)"
                                                type="number"
                                                className="input w-full bg-gray-50 border-gray-200 focus:bg-white text-sm h-9"
                                                value={formData.route?.distance}
                                                onChange={e => setFormData({ ...formData, route: { ...formData.route, distance: e.target.value } })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Pricing</label>
                                        <div className="space-y-3">
                                            <div className="relative group">
                                                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                                <input
                                                    placeholder="Seater Price"
                                                    type="number"
                                                    className="pl-9 input w-full bg-green-50/50 border-green-200 focus:bg-white focus:border-green-500 transition-all text-sm h-9"
                                                    value={formData.priceSeater}
                                                    onChange={e => setFormData({ ...formData, priceSeater: e.target.value })}
                                                />
                                            </div>
                                            {getSeatCounts().sleeper > 0 && (
                                                <div className="relative group">
                                                    <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                                                    <input
                                                        placeholder="Sleeper Price"
                                                        type="number"
                                                        className="pl-9 input w-full bg-purple-50/50 border-purple-200 focus:bg-white focus:border-purple-500 transition-all text-sm h-9"
                                                        value={formData.priceSleeper}
                                                        onChange={e => setFormData({ ...formData, priceSleeper: e.target.value })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Schedule & Amenities */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Schedule */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <h3 className="font-semibold text-gray-800 mb-3 text-xs uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                                            Schedule & Timing
                                        </h3>

                                        {!editingBus && (
                                            <div className="flex space-x-4 mb-4">
                                                {['single', 'multiple', 'recurring'].map(type => (
                                                    <label key={type} className="flex items-center cursor-pointer group">
                                                        <div className={`w-3.5 h-3.5 rounded-full border-2 mr-1.5 flex items-center justify-center transition-all ${scheduleType === type ? 'border-emerald-600' : 'border-gray-400 group-hover:border-emerald-400'}`}>
                                                            {scheduleType === type && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                                                        </div>
                                                        <span className={`capitalize text-xs font-medium transition-colors ${scheduleType === type ? 'text-emerald-900' : 'text-gray-600'}`}>
                                                            {type} Date{type !== 'single' && 's'}
                                                        </span>
                                                        <input
                                                            type="radio"
                                                            name="scheduleType"
                                                            checked={scheduleType === type}
                                                            onChange={() => setScheduleType(type)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-3">
                                            {/* Dynamic Date Input based on Type */}
                                            {scheduleType === 'single' && (
                                                <div className="relative group">
                                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Departure Date</label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600" />
                                                        <input
                                                            type="date"
                                                            className="pl-9 input w-full border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 text-xs h-9"
                                                            value={formData.schedule?.departureDate ? new Date(formData.schedule.departureDate).toISOString().split('T')[0] : ''}
                                                            onChange={e => setFormData({ ...formData, schedule: { ...formData.schedule, departureDate: e.target.value } })}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="relative group">
                                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Departure Time</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-emerald-600" />
                                                    <input
                                                        type="time"
                                                        className="pl-9 input w-full border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 text-xs h-9"
                                                        value={formData.schedule?.departureTime}
                                                        onChange={e => setFormData({ ...formData, schedule: { ...formData.schedule, departureTime: e.target.value } })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="relative group">
                                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Duration (Hours)</label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 8.5"
                                                    className="input w-full border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 text-xs h-9"
                                                    value={formData.schedule?.travelHours}
                                                    onChange={e => setFormData({ ...formData, schedule: { ...formData.schedule, travelHours: e.target.value } })}
                                                    required
                                                />
                                            </div>

                                            {/* Multiple Dates Section */}
                                            {scheduleType === 'multiple' && (
                                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                                    <label className="block text-xs font-semibold text-gray-600">Select Dates</label>
                                                    <input
                                                        type="date"
                                                        className="input w-full text-xs h-9"
                                                        onChange={addSelectedDate}
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {selectedDates.map(date => (
                                                            <div key={date} className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full flex items-center">
                                                                {date}
                                                                <button type="button" onClick={() => removeSelectedDate(date)} className="ml-1 text-emerald-600 hover:text-emerald-900">
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recurring Schedule Section */}
                                            {scheduleType === 'recurring' && (
                                                <div className="space-y-3 pt-2 border-t border-gray-100">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                                                            <input
                                                                type="date"
                                                                className="input w-full text-xs h-9"
                                                                value={recurring.startDate}
                                                                onChange={e => setRecurring({ ...recurring, startDate: e.target.value })}
                                                                required={scheduleType === 'recurring'}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                                                            <input
                                                                type="date"
                                                                className="input w-full text-xs h-9"
                                                                value={recurring.endDate}
                                                                onChange={e => setRecurring({ ...recurring, endDate: e.target.value })}
                                                                required={scheduleType === 'recurring'}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-2">Available Days</label>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {WEEKDAYS.map(day => (
                                                                <button
                                                                    type="button"
                                                                    key={day.id}
                                                                    onClick={() => handleRecurringDayToggle(day.id)}
                                                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${recurring.days.includes(day.id)
                                                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {day.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amenities */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <h3 className="font-semibold text-gray-800 mb-3 text-xs uppercase tracking-wide border-b border-gray-100 pb-2">
                                            Amenities & Facilities
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { key: 'wifi', label: 'WiFi' },
                                                { key: 'chargingPoint', label: 'Charging' },
                                                { key: 'waterBottle', label: 'Water' },
                                                { key: 'blanket', label: 'Blanket' },
                                                { key: 'readingLight', label: 'Reading Light' },
                                                { key: 'emergencyExit', label: 'Emergency Exit' },
                                                { key: 'gpsTracking', label: 'GPS' },
                                                { key: 'cctv', label: 'CCTV' }
                                            ].map(amenity => (
                                                <label key={amenity.key} className="flex items-center space-x-1.5 cursor-pointer group p-1.5 rounded hover:bg-gray-50 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.amenities[amenity.key]}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            amenities: { ...formData.amenities, [amenity.key]: e.target.checked }
                                                        })}
                                                        className="w-3.5 h-3.5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                                                    />
                                                    <span className="text-xs text-gray-700">{amenity.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>


                                {/* Section 3: Boarding & Dropping Points + Cancellation Policy */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Boarding & Dropping Points */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <h3 className="font-semibold text-gray-800 mb-3 text-xs uppercase tracking-wide border-b border-gray-100 pb-2">
                                            Boarding & Dropping Points
                                        </h3>
                                        <div className="space-y-4">
                                            {/* Boarding Points */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Boarding Points</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            boardingPoints: [...formData.boardingPoints, { location: "", time: "" }]
                                                        })}
                                                        className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded hover:bg-emerald-700 transition-colors flex items-center gap-1"
                                                    >
                                                        <Plus className="h-3 w-3" /> Add
                                                    </button>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {formData.boardingPoints.map((point, index) => (
                                                        <div key={index} className="flex gap-1.5 items-start">
                                                            <input
                                                                type="text"
                                                                placeholder="Location"
                                                                className="input flex-1 text-xs h-9"
                                                                value={point.location}
                                                                onChange={e => {
                                                                    const updated = [...formData.boardingPoints];
                                                                    updated[index].location = e.target.value;
                                                                    setFormData({ ...formData, boardingPoints: updated });
                                                                }}
                                                            />
                                                            <input
                                                                type="time"
                                                                className="input w-24 text-xs h-9"
                                                                value={point.time}
                                                                onChange={e => {
                                                                    const updated = [...formData.boardingPoints];
                                                                    updated[index].time = e.target.value;
                                                                    setFormData({ ...formData, boardingPoints: updated });
                                                                }}
                                                            />
                                                            {formData.boardingPoints.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const updated = formData.boardingPoints.filter((_, i) => i !== index);
                                                                        setFormData({ ...formData, boardingPoints: updated });
                                                                    }}
                                                                    className="text-red-600 hover:text-red-800 p-1.5"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Dropping Points */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Dropping Points</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            droppingPoints: [...formData.droppingPoints, { location: "", time: "" }]
                                                        })}
                                                        className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded hover:bg-emerald-700 transition-colors flex items-center gap-1"
                                                    >
                                                        <Plus className="h-3 w-3" /> Add
                                                    </button>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {formData.droppingPoints.map((point, index) => (
                                                        <div key={index} className="flex gap-1.5 items-start">
                                                            <input
                                                                type="text"
                                                                placeholder="Location"
                                                                className="input flex-1 text-xs h-9"
                                                                value={point.location}
                                                                onChange={e => {
                                                                    const updated = [...formData.droppingPoints];
                                                                    updated[index].location = e.target.value;
                                                                    setFormData({ ...formData, droppingPoints: updated });
                                                                }}
                                                            />
                                                            <input
                                                                type="time"
                                                                className="input w-24 text-xs h-9"
                                                                value={point.time}
                                                                onChange={e => {
                                                                    const updated = [...formData.droppingPoints];
                                                                    updated[index].time = e.target.value;
                                                                    setFormData({ ...formData, droppingPoints: updated });
                                                                }}
                                                            />
                                                            {formData.droppingPoints.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const updated = formData.droppingPoints.filter((_, i) => i !== index);
                                                                        setFormData({ ...formData, droppingPoints: updated });
                                                                    }}
                                                                    className="text-red-600 hover:text-red-800 p-1.5"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cancellation Policy */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <h3 className="font-semibold text-gray-800 mb-3 text-xs uppercase tracking-wide border-b border-gray-100 pb-2">
                                            Cancellation Policy
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.cancellationPolicy.allowed}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        cancellationPolicy: { ...formData.cancellationPolicy, allowed: e.target.checked }
                                                    })}
                                                    className="w-3.5 h-3.5 text-emerald-600 rounded border-gray-300"
                                                />
                                                <label className="text-xs font-medium text-gray-700">Cancellation Allowed</label>
                                            </div>
                                            {formData.cancellationPolicy.allowed && (
                                                <div className="space-y-3 pl-5">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Charge Type</label>
                                                        <select
                                                            className="input w-full text-xs h-9"
                                                            value={formData.cancellationPolicy.chargeType}
                                                            onChange={e => setFormData({
                                                                ...formData,
                                                                cancellationPolicy: { ...formData.cancellationPolicy, chargeType: e.target.value }
                                                            })}
                                                        >
                                                            <option value="percentage">Percentage (%)</option>
                                                            <option value="fixed">Fixed Amount (₹)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Charge Amount</label>
                                                        <input
                                                            type="number"
                                                            placeholder={formData.cancellationPolicy.chargeType === 'percentage' ? 'e.g., 10' : 'e.g., 100'}
                                                            className="input w-full text-xs h-9"
                                                            value={formData.cancellationPolicy.chargeAmount}
                                                            onChange={e => setFormData({
                                                                ...formData,
                                                                cancellationPolicy: { ...formData.cancellationPolicy, chargeAmount: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Time Limit (hours)</label>
                                                        <input
                                                            type="number"
                                                            placeholder="e.g., 24"
                                                            className="input w-full text-xs h-9"
                                                            value={formData.cancellationPolicy.timeLimit}
                                                            onChange={e => setFormData({
                                                                ...formData,
                                                                cancellationPolicy: { ...formData.cancellationPolicy, timeLimit: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 6: Operator Information & Safety */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Operator Info */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <h3 className="font-semibold text-gray-800 mb-3 text-xs uppercase tracking-wide border-b border-gray-100 pb-2">
                                            Operator Information
                                        </h3>
                                        <div className="space-y-2">
                                            <input
                                                type="tel"
                                                placeholder="Contact Number"
                                                className="input w-full text-xs h-9"
                                                value={formData.operatorInfo.contactNumber}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    operatorInfo: { ...formData.operatorInfo, contactNumber: e.target.value }
                                                })}
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Emergency Contact"
                                                className="input w-full text-xs h-9"
                                                value={formData.operatorInfo.emergencyContact}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    operatorInfo: { ...formData.operatorInfo, emergencyContact: e.target.value }
                                                })}
                                            />
                                            <input
                                                type="email"
                                                placeholder="Support Email"
                                                className="input w-full text-xs h-9"
                                                value={formData.operatorInfo.supportEmail}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    operatorInfo: { ...formData.operatorInfo, supportEmail: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>

                                    {/* Safety Features */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <h3 className="font-semibold text-gray-800 mb-3 text-xs uppercase tracking-wide border-b border-gray-100 pb-2">
                                            Safety Features
                                        </h3>
                                        <div className="space-y-2">
                                            {[
                                                { key: 'fireExtinguisher', label: 'Fire Extinguisher' },
                                                { key: 'firstAidKit', label: 'First Aid Kit' },
                                                { key: 'seatBelts', label: 'Seat Belts' }
                                            ].map(safety => (
                                                <label key={safety.key} className="flex items-center space-x-1.5 cursor-pointer p-1.5 rounded hover:bg-gray-50 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.safetyFeatures[safety.key]}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            safetyFeatures: { ...formData.safetyFeatures, [safety.key]: e.target.checked }
                                                        })}
                                                        className="w-3.5 h-3.5 text-emerald-600 rounded border-gray-300"
                                                    />
                                                    <span className="text-xs text-gray-700">{safety.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 7: Driver Details & Dynamic Pricing */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Driver Details */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <h3 className="font-semibold text-gray-800 mb-3 text-xs uppercase tracking-wide border-b border-gray-100 pb-2">
                                            Driver Details
                                        </h3>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Driver Name"
                                                className="input w-full text-xs h-9"
                                                value={formData.driverDetails.name}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    driverDetails: { ...formData.driverDetails, name: e.target.value }
                                                })}
                                            />
                                            <input
                                                type="text"
                                                placeholder="License Number"
                                                className="input w-full text-xs h-9"
                                                value={formData.driverDetails.license}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    driverDetails: { ...formData.driverDetails, license: e.target.value }
                                                })}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Experience (years)"
                                                className="input w-full text-xs h-9"
                                                value={formData.driverDetails.experience}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    driverDetails: { ...formData.driverDetails, experience: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>

                                    {/* Dynamic Pricing */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <h3 className="font-semibold text-gray-800 mb-3 text-xs uppercase tracking-wide border-b border-gray-100 pb-2">
                                            Dynamic Pricing
                                        </h3>
                                        <div className="space-y-2">
                                            <input
                                                type="number"
                                                placeholder="Weekend Surcharge (₹)"
                                                className="input w-full text-xs h-9"
                                                value={formData.dynamicPricing.weekendSurcharge}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    dynamicPricing: { ...formData.dynamicPricing, weekendSurcharge: e.target.value }
                                                })}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Peak Season Surcharge (₹)"
                                                className="input w-full text-xs h-9"
                                                value={formData.dynamicPricing.peakSeasonSurcharge}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    dynamicPricing: { ...formData.dynamicPricing, peakSeasonSurcharge: e.target.value }
                                                })}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Early Bird Discount (₹)"
                                                className="input w-full text-xs h-9"
                                                value={formData.dynamicPricing.earlyBirdDiscount}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    dynamicPricing: { ...formData.dynamicPricing, earlyBirdDiscount: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-4"></div>

                                {/* Seat Layout Editor */}
                                <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                        <h4 className="font-semibold text-lg text-gray-800">Seat Layout Designer</h4>
                                        <p className="text-xs text-gray-500 mt-1">Configure the bus layout by dragging seats onto the grid.</p>
                                    </div>

                                    <div className="flex flex-col lg:flex-row h-full">
                                        {/* LEFT SIDEBAR: Controls & Palette */}
                                        <div className="w-full lg:w-80 bg-gray-50 p-6 border-r border-gray-200 flex flex-col gap-6">

                                            {/* Palette */}
                                            <div className="space-y-3">
                                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Components</h5>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, 'new', 'seater')}
                                                        className="flex flex-col items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-green-500 hover:shadow-md transition-all active:cursor-grabbing"
                                                    >
                                                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center border border-green-300">
                                                            <Armchair className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <span className="text-xs font-medium text-gray-600">Seater</span>
                                                    </div>

                                                    <div
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, 'new', 'sleeper')}
                                                        className="flex flex-col items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-purple-500 hover:shadow-md transition-all active:cursor-grabbing"
                                                    >
                                                        <div className="w-8 h-12 bg-purple-100 rounded flex items-center justify-center border border-purple-300">
                                                            <Bed className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <span className="text-xs font-medium text-gray-600">Sleeper</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Grid Controls */}
                                            <div className="space-y-3">
                                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Grid Configuration</h5>
                                                <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                                                    <div>
                                                        <div className="flex justify-between mb-1">
                                                            <label className="text-xs font-medium text-gray-600">Rows</label>
                                                            <span className="text-xs text-gray-400">{layoutConfig.rows}</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="5" max="20"
                                                            value={layoutConfig.rows}
                                                            onChange={e => setLayoutConfig({ ...layoutConfig, rows: parseInt(e.target.value) })}
                                                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-600 block mb-1">Left Cols</label>
                                                            <select
                                                                className="w-full text-sm border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                                                value={layoutConfig.colsLeft}
                                                                onChange={e => setLayoutConfig({ ...layoutConfig, colsLeft: parseInt(e.target.value) })}
                                                            >
                                                                {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-600 block mb-1">Right Cols</label>
                                                            <select
                                                                className="w-full text-sm border-gray-200 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                                                value={layoutConfig.colsRight}
                                                                onChange={e => setLayoutConfig({ ...layoutConfig, colsRight: parseInt(e.target.value) })}
                                                            >
                                                                {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 border-t border-gray-100">
                                                        <label className="flex items-center cursor-pointer">
                                                            <input type="checkbox" className="sr-only peer" checked={layoutConfig.upperDeck} onChange={e => setLayoutConfig({ ...layoutConfig, upperDeck: e.target.checked })} />
                                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                                                            <span className="ml-3 text-sm font-medium text-gray-700">Upper Deck</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Summary */}
                                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                                <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Summary</h5>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-emerald-700">Seaters:</span>
                                                    <span className="font-bold text-emerald-900">{getSeatCounts().seater}</span>
                                                </div>
                                                <div className="flex justify-between text-sm border-b border-emerald-200 pb-2 mb-2">
                                                    <span className="text-emerald-700">Sleepers:</span>
                                                    <span className="font-bold text-emerald-900">{getSeatCounts().sleeper}</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-bold">
                                                    <span className="text-emerald-800">Total Capacity:</span>
                                                    <span className="text-emerald-900">{getSeatCounts().total}</span>
                                                </div>
                                            </div>

                                        </div>

                                        {/* RIGHT CANVAS: Bus Grid */}
                                        <div className="flex-1 p-8 bg-gray-100 min-h-[500px] overflow-auto flex justify-center items-start">
                                            <div className="flex gap-8">
                                                {['lower', ...(layoutConfig.upperDeck ? ['upper'] : [])].map(deck => {
                                                    // Render helper specifically for this deck's grid
                                                    const renderSideGrid = (side) => {
                                                        const cols = side === 'left' ? layoutConfig.colsLeft : layoutConfig.colsRight;
                                                        const startCol = side === 'left' ? 0 : layoutConfig.colsLeft;
                                                        const gridItems = [];
                                                        const skipMap = {}; // Format: "r-c": true

                                                        for (let r = 0; r < layoutConfig.rows; r++) {
                                                            for (let c = 0; c < cols; c++) {
                                                                const actualCol = startCol + c;
                                                                const key = `${deck}-${r}-${actualCol}`;

                                                                if (skipMap[`${r}-${c}`]) continue;

                                                                const seat = seatMap[key];
                                                                const isSleeper = seat?.type === 'sleeper';

                                                                if (isSleeper) {
                                                                    skipMap[`${r + 1}-${c}`] = true;
                                                                }

                                                                gridItems.push(
                                                                    <div
                                                                        key={key}
                                                                        onDragOver={handleDragOver}
                                                                        onDrop={(e) => handleDrop(e, deck, r, actualCol)}
                                                                        onDoubleClick={() => removeSeat(key)}
                                                                        onClick={() => toggleSeat(deck, r, actualCol)}
                                                                        className={`
                                                                            border rounded flex items-center justify-center transition-all duration-200 shadow-sm
                                                                            ${isSleeper ? 'row-span-2' : 'row-span-1'}
                                                                            ${!seat ? 'border-dashed border-gray-300 bg-gray-50 h-full hover:bg-gray-100 hover:border-gray-400' : ''}
                                                                        `}
                                                                        style={seat ? {
                                                                            height: '100%',
                                                                            backgroundColor: seat.type === 'seater' ? '#dcfce7' : '#f3e8ff', // Green/Purple bg
                                                                            borderColor: seat.type === 'seater' ? '#22c55e' : '#a855f7', // Color border
                                                                            borderWidth: '1px',
                                                                            borderStyle: 'solid',
                                                                            borderRadius: '0.375rem',
                                                                            cursor: 'move',
                                                                            position: 'relative',
                                                                            zIndex: 10
                                                                        } : {}}
                                                                    >
                                                                        {seat && (
                                                                            <div
                                                                                draggable
                                                                                onDragStart={(e) => handleDragStart(e, 'move', key)}
                                                                                className="w-full h-full flex items-center justify-center"
                                                                            >
                                                                                {seat.type === 'seater' ?
                                                                                    <Armchair className="w-5 h-5 text-green-600 fill-green-50" /> :
                                                                                    <Bed className="w-5 h-5 text-purple-600 fill-purple-50 rotate-90" />
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            }
                                                        }

                                                        return (
                                                            <div
                                                                className="grid gap-2"
                                                                style={{
                                                                    gridTemplateColumns: `repeat(${cols}, 2.5rem)`,
                                                                    gridAutoRows: '2.5rem'
                                                                }}
                                                            >
                                                                {gridItems}
                                                            </div>
                                                        );
                                                    };

                                                    return (
                                                        <div key={deck} className="flex flex-col items-center">
                                                            <h5 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                                                                {deck} Deck
                                                            </h5>

                                                            <div className="bg-white border-2 border-gray-300 rounded-[3rem] p-5 relative shadow-xl min-h-[400px]">
                                                                {/* Front/Driver Indicators */}
                                                                {deck === 'lower' && (
                                                                    <div className="absolute top-5 right-5 text-gray-400 flex flex-col items-center z-10">
                                                                        <div className="border-[3px] border-gray-400 rounded-full p-1.5 mb-1 bg-gray-50">
                                                                            <Disc className="w-4 h-4 rotate-90 text-gray-600" />
                                                                        </div>
                                                                        <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Driver</span>
                                                                    </div>
                                                                )}

                                                                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-300 uppercase tracking-widest font-bold border-b border-gray-100 pb-1 w-20 text-center">Front</div>

                                                                <div className="flex gap-5 mt-14 px-2">
                                                                    {renderSideGrid('left')}
                                                                    <div className="flex items-center justify-center w-8 text-gray-200">
                                                                        <span className="text-[10px] font-bold rotate-90 whitespace-nowrap tracking-[0.5em]">AISLE</span>
                                                                    </div>
                                                                    {renderSideGrid('right')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>



                            </div>

                            {/* Missing Fields Alert */}
                            {missingFields.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <h3 className="text-sm font-semibold text-red-800">
                                                Please fill in the following required fields:
                                            </h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                <ul className="list-disc list-inside space-y-1">
                                                    {missingFields.map((field, index) => (
                                                        <li key={index}>{field}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md">Save Bus</button>
                            </div>
                        </form>
                    </div>
                </div >
            )}

            {/* Confirmation Modal */}
            {
                confirmModal.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-sm w-full p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h3>
                            <p className="text-gray-600 mb-6">
                                {confirmModal.type === 'group'
                                    ? "Are you sure you want to delete ALL trips for this bus? This will remove every scheduled date."
                                    : "Are you sure you want to delete this specific scheduled trip?"
                                }
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setConfirmModal({ show: false, id: null })}
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default OperatorBuses
