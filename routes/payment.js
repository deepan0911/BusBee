const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// Create order route
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: "receipt_order_" + Math.random(),
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    // console.error("❌ Error creating Razorpay order:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// Verify payment route
router.post("/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    return res.json({ success: true });
  } else {
    return res.json({ success: false });
  }
});

module.exports = router;
