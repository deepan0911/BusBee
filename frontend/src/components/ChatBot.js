import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send } from 'lucide-react'; // Only importing necessary icons

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi there! How can I assist you today?" },
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

  // Simple keyword-based bot reply logic (no emojis)
  const getBotReply = (msg) => {
    msg = msg.toLowerCase(); // Convert message to lowercase for case-insensitive matching
    if (msg.includes("hi") || msg.includes("hello") ) return "Hello! Ask Your Queries";
    if (msg.includes("vanakkam") || msg.includes("vanakam")) return "வணக்கம் தம்பி! சொல்லுங்க நான் என்ன பண்ணனும்?";
    if (msg.includes("cancel")) return "You can cancel your ticket from the 'My Bookings' section before departure.";
    if (msg.includes("refund")) return "Refunds are usually processed within 3-5 business days to your original payment method.";
    if (msg.includes("contact") || msg.includes("support")) return "You can reach us at deepann2004@gmail.com or call +91-9876543210.";
    if (msg.includes("reschedule") || msg.includes("change date")) return "You can reschedule your ticket from your booking history if the operator allows changes.";
    if (msg.includes("delay") || msg.includes("late")) return "If your bus is delayed, you'll be notified via SMS or email with the updated departure time.";
    if (msg.includes("payment failed")) return "If your payment failed but was deducted, it will be automatically refunded within 24-48 hours.";
    if (msg.includes("boarding point")) return "Your boarding point is mentioned in your ticket and will also be sent to you via SMS 1 hour before departure.";
    if (msg.includes("discount") || msg.includes("offer") || msg.includes("coupon")) return "We regularly provide discount coupons! Check the home page or subscribe to our newsletter.";
    if (msg.includes("ticket")) return "You can view and download your ticket from the 'My Bookings' section or check your email inbox.";
    if (msg.includes("luggage")) return "Most buses allow one suitcase (up to 15kg) and one small bag. Please confirm with the operator for extra luggage.";
    if (msg.includes("covid") || msg.includes("mask") || msg.includes("safety")) return "We follow strict safety protocols. Masks are mandatory and buses are sanitized after every trip.";

    return "I'm not sure about that. Please try asking in a different way or email us at deepann2004@gmail.com.";
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
                  className={`px-4 py-2 text-sm rounded-xl shadow-md max-w-[80%] ${
                    msg.sender === "user"
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
