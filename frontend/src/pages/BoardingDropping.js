"use client"

import React, { useState, useEffect } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { ArrowRight } from "lucide-react"
import toast from "react-hot-toast"

const BoardingDropping = () => {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [bus, setBus] = useState(null)
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState('boarding') // 'boarding' or 'dropping'
    const [selectedBoarding, setSelectedBoarding] = useState(null)
    const [selectedDropping, setSelectedDropping] = useState(null)

    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const date = searchParams.get("date")

    const fetchBusDetails = React.useCallback(async () => {
        try {
            const response = await axios.get(`/api/buses/${id}`)
            setBus(response.data)
            setLoading(false)
        } catch (error) {
            toast.error("Failed to fetch bus details")
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchBusDetails()
        // Restore selections if available in session
        const storedBoarding = sessionStorage.getItem("selectedBoarding")
        const storedDropping = sessionStorage.getItem("selectedDropping")
        if (storedBoarding) setSelectedBoarding(JSON.parse(storedBoarding))
        if (storedDropping) setSelectedDropping(JSON.parse(storedDropping))
    }, [id, fetchBusDetails])

    const handleBoardingSelect = (point) => {
        setSelectedBoarding(point)
        // Auto-advance logic could go here, but let's keep it manual for clarity or auto after short delay
    }

    const handleDroppingSelect = (point) => {
        setSelectedDropping(point)
    }

    const handleContinue = () => {
        if (step === 'boarding') {
            if (!selectedBoarding) {
                toast.error("Please select a boarding point")
                return
            }
            setStep('dropping')
            window.scrollTo(0, 0)
        } else {
            if (!selectedDropping) {
                toast.error("Please select a dropping point")
                return
            }
            // Save to session and navigate
            sessionStorage.setItem("selectedBoarding", JSON.stringify(selectedBoarding))
            sessionStorage.setItem("selectedDropping", JSON.stringify(selectedDropping))
            navigate(`/booking/${id}?from=${from}&to=${to}&date=${date}`)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        )
    }

    if (!bus) return <div>Bus not found</div>

    const points = step === 'boarding' ? bus.boardingPoints : bus.droppingPoints
    const selectedPoint = step === 'boarding' ? selectedBoarding : selectedDropping
    const title = step === 'boarding' ? `Select Boarding Point` : `Select Dropping Point`
    const city = step === 'boarding' ? from : to

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    {step === 'boarding' ? 'Select Boarding Point' : 'Select Dropping Point'}
                                </h1>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-sm font-medium text-gray-700">{city}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-sm text-gray-600">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Progress Indicator */}
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2">
                                <div className={`flex items-center gap-2 ${step === 'boarding' || selectedBoarding ? 'text-gray-900' : 'text-gray-400'}`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'boarding' || selectedBoarding ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {selectedBoarding ? '✓' : '1'}
                                    </div>
                                    <span className="text-xs font-medium hidden sm:inline">Boarding</span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-gray-300" />
                                <div className={`flex items-center gap-2 ${step === 'dropping' ? 'text-gray-900' : 'text-gray-400'}`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'dropping' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {selectedDropping ? '✓' : '2'}
                                    </div>
                                    <span className="text-xs font-medium hidden sm:inline">Dropping</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Points Selection Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-white border-b border-gray-200 p-5">
                                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                                <p className="text-sm text-gray-600 mt-1">Choose your preferred {step} location</p>
                            </div>

                            <div className="p-5">
                                {points && points.length > 0 ? (
                                    <div className="space-y-2">
                                        {points.map((point, index) => {
                                            const isSelected = selectedPoint && selectedPoint.location === point.location && selectedPoint.time === point.time
                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() => step === 'boarding' ? handleBoardingSelect(point) : handleDroppingSelect(point)}
                                                    className={`
                                                        group relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                                                        ${isSelected
                                                            ? 'border-gray-900 bg-gray-50'
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4 flex-1">
                                                            {/* Radio Button */}
                                                            <div className={`
                                                                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                                                                ${isSelected
                                                                    ? 'border-gray-900 bg-gray-900'
                                                                    : 'border-gray-300 group-hover:border-gray-400 bg-white'
                                                                }
                                                            `}>
                                                                {isSelected && (
                                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                                )}
                                                            </div>

                                                            {/* Time Badge */}
                                                            <div className={`
                                                                px-3 py-1.5 rounded font-semibold text-sm min-w-[70px] text-center
                                                                ${isSelected
                                                                    ? 'bg-gray-900 text-white'
                                                                    : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                                                                }
                                                            `}>
                                                                {point.time}
                                                            </div>

                                                            {/* Location Info */}
                                                            <div className="flex-1">
                                                                <h3 className={`font-semibold text-base ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                                                                    {point.location}
                                                                </h3>
                                                                <p className={`text-sm ${isSelected ? 'text-gray-600' : 'text-gray-500'} mt-0.5`}>
                                                                    {city}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Selected Badge */}
                                                        {isSelected && (
                                                            <div className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-semibold">
                                                                Selected
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
                                        <p className="font-medium text-gray-600">No {step} points available</p>
                                        <p className="text-sm text-gray-500 mt-1">Please contact support</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sticky top-8">
                            <h3 className="text-base font-bold text-gray-900 mb-5">
                                Journey Summary
                            </h3>

                            <div className="space-y-4">
                                {/* Route Info */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Route</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-900">
                                        <div className="flex-1">
                                            <div className="font-bold text-base">{from}</div>
                                            <div className="text-xs text-gray-600 mt-0.5">Origin</div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <div className="flex-1 text-right">
                                            <div className="font-bold text-base">{to}</div>
                                            <div className="text-xs text-gray-600 mt-0.5">Destination</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Selected Boarding Point */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Boarding Point</span>
                                        {selectedBoarding && <span className="text-xs text-gray-600">✓</span>}
                                    </div>
                                    {selectedBoarding ? (
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">{selectedBoarding.location}</div>
                                            <div className="text-sm font-medium text-gray-700 mt-1">{selectedBoarding.time}</div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Not selected</p>
                                    )}
                                </div>

                                {/* Selected Dropping Point */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Dropping Point</span>
                                        {selectedDropping && <span className="text-xs text-gray-600">✓</span>}
                                    </div>
                                    {selectedDropping ? (
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">{selectedDropping.location}</div>
                                            <div className="text-sm font-medium text-gray-700 mt-1">{selectedDropping.time}</div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Not selected</p>
                                    )}
                                </div>

                                {/* Bus Info */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Bus Details</div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Operator</span>
                                            <span className="text-sm font-semibold text-gray-900">{bus.operatorName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Bus Type</span>
                                            <span className="text-sm font-semibold text-gray-900">{bus.busType}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Continue Button */}
                            <button
                                onClick={handleContinue}
                                disabled={!selectedPoint}
                                className={`
                                    w-full mt-5 py-3 px-5 rounded-lg font-semibold text-sm
                                    transition-all flex items-center justify-center gap-2
                                    ${!selectedPoint
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-900 text-white hover:bg-gray-800'
                                    }
                                `}
                            >
                                {step === 'boarding' ? (
                                    <>Continue to Dropping <ArrowRight className="w-4 h-4" /></>
                                ) : (
                                    <>Proceed to Booking <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BoardingDropping
