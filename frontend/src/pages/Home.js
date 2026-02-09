"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Search, MapPin, Calendar, Shield, Clock, Star } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import Chatbot from "../components/ChatBot"
import toast from "react-hot-toast"
import axios from "axios"

const Home = () => {

  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: new Date(),
  })

  const [fromFocused, setFromFocused] = useState(false)
  const [toFocused, setToFocused] = useState(false)
  const [fromActiveIndex, setFromActiveIndex] = useState(-1)
  const [toActiveIndex, setToActiveIndex] = useState(-1)
  const [openFAQ, setOpenFAQ] = useState(null)
  const [routes, setRoutes] = useState([])
  const [loadingRoutes, setLoadingRoutes] = useState(true)

  const navigate = useNavigate()
  const location = useLocation();
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (location.state?.googleLoginSuccess && !toastShownRef.current) {
      toast.success("Login successful!");
      toastShownRef.current = true; // ✅ Block further toasts
      window.history.replaceState({}, document.title); // clear state
    }
  }, [location.state]);

  // Fetch available routes from backend
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"
        const response = await axios.get(`${baseURL}/api/buses/routes/available`)
        setRoutes(response.data)
        setLoadingRoutes(false)
      } catch (error) {
        console.error("Error fetching routes:", error)
        // Fallback to empty array if fetch fails
        setRoutes([])
        setLoadingRoutes(false)
      }
    }

    fetchRoutes()
  }, [])

  const faqList = [
    {
      question: "How do I book a bus ticket?",
      answer:
        "Simply enter your origin, destination, and travel date, click 'Search', choose your bus and seat, then proceed to payment.",
    },
    {
      question: "Can I cancel or reschedule my ticket?",
      answer:
        "Yes, most tickets can be canceled or rescheduled as per the operator's policy. You’ll find options in your booking history or confirmation email.",
    },
    {
      question: "Will I receive a confirmation after booking?",
      answer:
        "Absolutely! You'll get an instant email and SMS confirmation with your ticket details and boarding point.",
    },
    {
      question: "Is it safe to book tickets online?",
      answer:
        "Yes! We use secure payment gateways and encrypted data to ensure all your transactions are safe and private.",
    },
    {
      question: "Do I need to carry a printout of the ticket?",
      answer:
        "Not necessarily. Most operators accept mobile tickets. Just show the SMS or email at boarding.",
    },
  ]

  const allCities = Array.from(new Set(routes.flatMap((r) => [r.from, r.to])))

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchData.from && searchData.to) {
      const params = new URLSearchParams({
        from: searchData.from,
        to: searchData.to,
        date: searchData.date.toISOString().split("T")[0],
      })
      navigate(`/search?${params.toString()}`)
    }
  }

  const filteredFromCities = allCities.filter(
    (city) =>
      city.toLowerCase().includes(searchData.from.toLowerCase()) &&
      city !== searchData.from
  )

  const filteredToCities = allCities.filter(
    (city) =>
      city.toLowerCase().includes(searchData.to.toLowerCase()) &&
      city !== searchData.to &&
      city !== searchData.from  // Exclude the "From" city
  )

  const handleKeyDown = (e, field) => {
    if (field === "from" && fromFocused && filteredFromCities.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setFromActiveIndex((prev) => (prev + 1) % filteredFromCities.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setFromActiveIndex(
          (prev) => (prev - 1 + filteredFromCities.length) % filteredFromCities.length
        )
      } else if (e.key === "Enter" && fromActiveIndex >= 0) {
        e.preventDefault()
        setSearchData({ ...searchData, from: filteredFromCities[fromActiveIndex] })
        setFromFocused(false)
        setFromActiveIndex(-1)
      } else if (e.key === "Escape") {
        setFromFocused(false)
        setFromActiveIndex(-1)
      }
    }

    if (field === "to" && toFocused && filteredToCities.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setToActiveIndex((prev) => (prev + 1) % filteredToCities.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setToActiveIndex(
          (prev) => (prev - 1 + filteredToCities.length) % filteredToCities.length
        )
      } else if (e.key === "Enter" && toActiveIndex >= 0) {
        e.preventDefault()
        setSearchData({ ...searchData, to: filteredToCities[toActiveIndex] })
        setToFocused(false)
        setToActiveIndex(-1)
      } else if (e.key === "Escape") {
        setToFocused(false)
        setToActiveIndex(-1)
      }
    }
  }

  const toggleFAQ = (index) => setOpenFAQ(openFAQ === index ? null : index)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-100 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Book Your Bus Tickets</h1>
            <p className="text-xl md:text-2xl opacity-90">Safe, Reliable & Comfortable Journey</p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* From Input */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    From
                  </label>
                  <input
                    type="text"
                    value={searchData.from}
                    onChange={(e) => {
                      setSearchData({ ...searchData, from: e.target.value })
                      setFromActiveIndex(-1)
                    }}
                    onFocus={() => setFromFocused(true)}
                    onBlur={() => setTimeout(() => setFromFocused(false), 100)}
                    onKeyDown={(e) => handleKeyDown(e, "from")}
                    className="w-full input border border-gray-300 rounded px-3 py-2 text-gray-900"
                    placeholder="Enter origin city"
                    required
                  />
                  {fromFocused && filteredFromCities.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-300 mt-1 rounded w-full max-h-40 overflow-auto shadow text-gray-900 text-sm">
                      {filteredFromCities.map((city, idx) => (
                        <li
                          key={idx}
                          className={`px-4 py-1 cursor-pointer ${fromActiveIndex === idx ? "bg-blue-100" : "hover:bg-blue-50"
                            }`}
                          onMouseDown={() => {
                            setSearchData({ ...searchData, from: city })
                            setFromFocused(false)
                          }}
                        >
                          {city}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* To Input */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    To
                  </label>
                  <input
                    type="text"
                    value={searchData.to}
                    onChange={(e) => {
                      setSearchData({ ...searchData, to: e.target.value })
                      setToActiveIndex(-1)
                    }}
                    onFocus={() => setToFocused(true)}
                    onBlur={() => setTimeout(() => setToFocused(false), 100)}
                    onKeyDown={(e) => handleKeyDown(e, "to")}
                    className="w-full input border border-gray-300 rounded px-3 py-2 text-gray-900"
                    placeholder="Enter destination city"
                    required
                  />
                  {toFocused && filteredToCities.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-300 mt-1 rounded w-full max-h-40 overflow-auto shadow text-gray-900 text-sm">
                      {filteredToCities.map((city, idx) => (
                        <li
                          key={idx}
                          className={`px-4 py-1 cursor-pointer ${toActiveIndex === idx ? "bg-blue-100" : "hover:bg-blue-50"
                            }`}
                          onMouseDown={() => {
                            setSearchData({ ...searchData, to: city })
                            setToFocused(false)
                          }}
                        >
                          {city}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Date Picker */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Journey Date
                  </label>
                  <DatePicker
                    selected={searchData.date}
                    onChange={(date) => setSearchData({ ...searchData, date })}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    className="w-full input border border-gray-300 rounded px-3 py-2 text-gray-900"
                    required
                  />
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BusBee?</h2>
            <p className="text-lg text-gray-600">
              Experience the best bus booking service with these amazing features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-gray-600">
                Your safety is our priority. All our buses are regularly maintained and sanitized.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">On-Time Service</h3>
              <p className="text-gray-600">Punctual departures and arrivals. Track your bus in real-time.</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing with exclusive offers and discounts.</p>
            </div>
          </div>
        </div>
      </section>


      {/* FAQs Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">🚌 FAQs – Bus Ticket Booking</h2>

          <div className="space-y-4">
            {faqList.map((faq, index) => (
              <div key={index} className="bg-white rounded shadow-md overflow-hidden">
                <button
                  className="w-full text-left px-6 py-4 flex justify-between items-center font-semibold text-gray-800 focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  {faq.question}
                  <span className="text-xl">{openFAQ === index ? "−" : "+"}</span>
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4 text-gray-700 text-sm transition-all duration-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <Chatbot />
    </div>

  )

}

export default Home
