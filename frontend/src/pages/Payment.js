import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

// ✅ Razorpay Script Loader
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(false);
    document.body.appendChild(script);
  });
};

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Receiving state from Booking.js
  const { amount, bookingData, token } = location.state || {};

  useEffect(() => {
    const initiatePayment = async () => {
      console.log("💳 Payment initiated with:");
      console.log("📦 bookingData:", bookingData);
      console.log("💰 amount:", amount);
      console.log("🔑 token:", token);

      if (!amount || !bookingData || !token) {
        alert("Invalid payment session. Please try again.");
        navigate("/");
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

      try {
        const { data: order } = await axios.post("/api/payment/create-order", { amount });

        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "Bus Ticket Reservation",
          description: "Bus booking payment",
          order_id: order.id,
          handler: async function (response) {
            try {
              const res = await axios.post("/api/payment/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (res.data.success) {
                // ✅ Final Booking after Payment Verification
                const bookingRes = await axios.post("/api/bookings", bookingData, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                });

                console.log("📦 Booking Response:", bookingRes.data);
                if (bookingRes.data && bookingRes.data.booking && bookingRes.data.booking._id) {
                  alert("✅ Booking confirmed!");
                  navigate(`/booking-confirmation/${bookingRes.data.booking._id}`);
                } else {
                  alert("⚠️ Payment succeeded, but booking failed.");
                  navigate("/");
                }
              } else {
                alert("❌ Payment verification failed");
                navigate("/");
              }
            } catch (err) {
              console.error("❌ Payment or booking error:", err);
              alert("❌ Payment verification failed");
              navigate("/");
            }
          },
          modal: {
            ondismiss: () => {
              alert("❌ Payment was cancelled");
              navigate("/");
            },
          },
          theme: { color: "#3399cc" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error) {
        console.error("❌ Razorpay order error:", error);
        alert("Payment could not be initiated");
        navigate("/");
      }
    };

    initiatePayment();
  }, [amount, bookingData, token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center mt-32">
  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid border-r-transparent mb-4" />
  <p className="text-gray-600 text-lg">Processing your payment...</p>
</div>

  );
};

export default Payment;
