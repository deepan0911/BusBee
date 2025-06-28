const express = require("express")
const User = require("../models/User")
const { auth } = require("../middleware/auth")
const router = express.Router()

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, phone } = req.body

    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true }).select("-password")

    res.json({ message: "Profile updated successfully", user })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Change password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)

    // Check current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({ message: "Password changed successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete user account
router.delete("/account", auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id)
    res.json({ message: "Account deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
