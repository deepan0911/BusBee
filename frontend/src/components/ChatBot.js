import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send } from 'lucide-react'; // Only importing necessary icons

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi there! I'm BusBee Assistant. I can help you with bookings, seat selection, cancellations, refunds, features, and more. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Function to handle sending a message
  const handleSend = () => {
    if (!input.trim()) return; // Prevent sending empty messages

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput(""); // Clear the input field

    // Get bot's reply using the predefined logic after a short delay
    setTimeout(() => {
      const reply = getBotReply(input);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 600);
  };

  // Enhanced bot reply logic with comprehensive project knowledge
  const getBotReply = (msg) => {
    msg = msg.toLowerCase();

    // Greetings
    if (msg.includes("hi") || msg.includes("hello")) return "Hello! I'm BusBee Assistant. Ask me about bookings, features, cancellations, or anything else!";
    if (msg.includes("vanakkam") || msg.includes("vanakam")) return "வணக்கம் தம்பி! சொல்லுங்க நான் என்ன பண்ணனும்?";

    // Booking Process
    if (msg.includes("how to book") || msg.includes("booking process")) return "To book: 1) Search buses by entering source, destination & date 2) Select a bus 3) Choose your seats visually 4) Pick boarding/dropping points 5) Enter passenger details 6) Confirm booking. You'll get instant confirmation via email!";
    if (msg.includes("book ticket") || msg.includes("make booking")) return "Click 'Search' on homepage, enter your route and date, select a bus, choose seats, and complete passenger details. Instant confirmation!";

    // Seat Selection
    if (msg.includes("seat") && (msg.includes("select") || msg.includes("choose"))) return "We have an interactive seat map! Green seats are available, blue are selected by you, gray are already booked. Click to select/deselect. We support both seater and sleeper buses with dual decks.";
    if (msg.includes("seat layout") || msg.includes("seat map")) return "Our visual seat layout shows the exact bus configuration. You can see lower and upper decks for sleeper buses, with real-time availability. Just click on available seats to select!";

    // Cancellation
    if (msg.includes("cancel")) return "Cancel from 'My Bookings' section. You must cancel at least 4 hours before departure. You'll get 90% refund (10% cancellation fee). Seats are automatically released.";
    if (msg.includes("cancellation policy") || msg.includes("cancel policy")) return "Cancellation allowed up to 4 hours before departure. 10% cancellation fee applies. Refund is 90% of booking amount, processed within 3-5 business days.";

    // Refunds
    if (msg.includes("refund")) return "Refunds are 90% of booking amount (10% cancellation fee). Processing takes 3-5 business days to your original payment method.";

    // My Bookings
    if (msg.includes("my booking") || msg.includes("view booking")) return "Go to 'My Bookings' from the navbar. You can view all your past and upcoming bookings, download tickets, and cancel if needed.";
    if (msg.includes("booking history")) return "Access your complete booking history from 'My Bookings'. See confirmed, cancelled, and completed trips with full details.";

    // Tickets
    if (msg.includes("ticket") || msg.includes("download")) return "Your ticket is available in 'My Bookings' section and sent to your email. You can download or show it on mobile - no printout needed!";
    if (msg.includes("e-ticket") || msg.includes("mobile ticket")) return "Yes! We support mobile tickets. Just show the SMS or email confirmation at boarding. No need to print.";

    // Payment
    if (msg.includes("payment") && !msg.includes("failed")) return "Currently, bookings are confirmed instantly without payment gateway. Payment integration is ready for future activation.";
    if (msg.includes("payment failed")) return "If payment fails but amount is deducted, it will be auto-refunded within 24-48 hours. Contact support if not received.";

    // Boarding & Dropping
    if (msg.includes("boarding point") || msg.includes("pickup")) return "Select your convenient boarding point during booking. Location and time are shown in your ticket and sent via SMS 1 hour before departure.";
    if (msg.includes("dropping point") || msg.includes("drop")) return "Choose your preferred dropping point during booking. Multiple drop-off locations available with specific times.";

    // Search & Routes
    if (msg.includes("search") && msg.includes("bus")) return "Enter source city, destination city, and travel date on homepage. We'll show all available buses with real-time seat availability!";
    if (msg.includes("route") || msg.includes("available cities")) return "We have dynamic routes loaded from our database. Start typing in the search box to see autocomplete suggestions of available cities.";

    // Features
    if (msg.includes("feature") || msg.includes("what can")) return "BusBee offers: Visual seat selection, instant booking, email/SMS notifications, booking management, cancellation, multiple boarding points, operator ratings, amenities info, and 24/7 chat support!";
    if (msg.includes("amenities") || msg.includes("facilities")) return "Buses may have: WiFi, charging points, water bottles, blankets, reading lights, GPS tracking, CCTV, emergency exits, first aid kits, and more. Check bus details when booking!";

    // User Roles
    if (msg.includes("admin") || msg.includes("operator")) return "BusBee has 3 roles: Users (book tickets), Operators (manage their buses & bookings), and Admins (manage entire platform). Each has a dedicated dashboard.";
    if (msg.includes("become operator") || msg.includes("add bus")) return "Contact admin to become an operator. Operators can add buses, manage schedules, set pricing, view bookings, and track revenue.";

    // Account & Profile
    if (msg.includes("profile") || msg.includes("account")) return "Access your profile from the navbar. Update name, email, phone, and profile picture. View your account details and booking history.";
    if (msg.includes("register") || msg.includes("sign up")) return "Click 'Register' to create an account with email/password, or use Google Sign-In for instant access!";
    if (msg.includes("login") || msg.includes("sign in")) return "Click 'Login' and use your email/password, or sign in with Google for quick access.";
    if (msg.includes("google") && msg.includes("login")) return "Yes! We support Google OAuth. Click the Google Sign-In button for instant authentication.";

    // Email & Notifications
    if (msg.includes("email") || msg.includes("confirmation")) return "You'll receive email confirmations for bookings and cancellations with all details. Also SMS notifications 1 hour before departure!";
    if (msg.includes("notification") || msg.includes("sms")) return "We send SMS and email notifications for booking confirmations, cancellations, and boarding reminders.";

    // Safety & Security
    if (msg.includes("safe") || msg.includes("secure")) return "Your safety is our priority! We use JWT authentication, encrypted passwords, secure sessions, and all buses follow safety protocols with regular sanitization.";
    if (msg.includes("covid") || msg.includes("mask") || msg.includes("sanitize")) return "We follow strict COVID safety protocols. Masks are mandatory, buses are sanitized after every trip, and safety features are standard.";

    // Pricing & Discounts
    if (msg.includes("price") || msg.includes("cost")) return "Prices vary by bus type, operator, and route. See exact pricing when searching. We show per-seat prices clearly.";
    if (msg.includes("discount") || msg.includes("offer") || msg.includes("coupon")) return "Check the homepage for current offers! We regularly provide discount coupons. Subscribe to our newsletter for exclusive deals.";

    // Bus Types
    if (msg.includes("bus type") || msg.includes("ac") || msg.includes("sleeper")) return "We have AC, Non-AC, Sleeper, Semi-Sleeper, and Luxury buses. Each has different pricing and amenities. Choose based on your comfort preference!";

    // Passenger Details
    if (msg.includes("passenger") || msg.includes("traveler")) return "Enter passenger name, age, and gender for each seat. You can book for multiple passengers in one booking.";
    if (msg.includes("multiple passenger") || msg.includes("group booking")) return "Yes! Book multiple seats in one booking. Enter details for each passenger separately.";

    // Luggage
    if (msg.includes("luggage") || msg.includes("baggage")) return "Most buses allow one suitcase (up to 15kg) and one small bag. For extra luggage, confirm with the operator beforehand.";

    // Timing & Schedule
    if (msg.includes("delay") || msg.includes("late")) return "If your bus is delayed, you'll be notified via SMS/email with updated departure time. Track your bus in real-time if GPS tracking is available.";
    if (msg.includes("schedule") || msg.includes("timing")) return "All buses show departure and arrival times, journey duration, and travel hours. Choose the schedule that suits you best!";

    // Reschedule
    if (msg.includes("reschedule") || msg.includes("change date")) return "To reschedule, cancel your current booking (if within time limit) and make a new booking for your preferred date.";

    // Contact & Support
    if (msg.includes("contact") || msg.includes("support") || msg.includes("help")) return "Email us at deepann2004@gmail.com or call +91-9876543210. I'm also here 24/7 to help!";

    // About BusBee
    if (msg.includes("about") || msg.includes("busbee")) return "BusBee is a comprehensive bus reservation platform with visual seat selection, instant booking, operator & admin dashboards, and excellent customer support. Book your journey with confidence!";

    // Default
    return "I'm not sure about that. Try asking about: bookings, seat selection, cancellation, refunds, features, bus types, or contact support at deepann2004@gmail.com.";
  }

  // Auto-scroll to the latest message whenever messages array updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages])

  return (
    // Main container for the chatbot, fixed at the bottom right
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {open ? (
        // Chat window when open
        <div className="w-80 sm:w-96 max-h-[500px] bg-white shadow-xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-3 flex justify-between items-center rounded-t-2xl shadow-md">
            <span className="font-semibold text-lg flex items-center gap-2">
              <MessageSquare size={20} /> Chat Assistant
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-gray-200 transition"
              aria-label="Close chat"
            >
              <X size={24} />
            </button>
          </div>

          {/* Messages display area */}
          <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto bg-blue-50 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 text-sm rounded-xl shadow-md max-w-[80%] ${msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none" // User message style
                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-none" // Bot message style
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* Ref for auto-scrolling */}
          </div>

          {/* Input area */}
          <div className="flex items-center px-4 py-3 border-t border-gray-200 bg-white">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()} // Send on Enter key press
              aria-label="Message input"
            />
            <button
              onClick={handleSend}
              className="ml-3 bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      ) : (
        // Chat toggle button when closed
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-xl transition-all duration-300 ease-in-out transform hover:scale-110"
          aria-label="Open chat"
        >
          <MessageSquare size={28} />
        </button>
      )}
    </div>
  )
}

export default Chatbot
