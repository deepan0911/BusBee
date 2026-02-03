const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      console.log("No token provided")
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      console.log("User not found for token")
      return res.status(401).json({ message: "Token is not valid" })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      console.warn(`Auth failed: ${error.message}`)
    } else {
      console.error("Auth middleware error:", error)
    }
    res.status(401).json({ message: "Token is not valid" })
  }
}

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      console.log("User role:", req.user?.role)
      if (req.user.role !== "admin") {
        console.log("Access denied - not admin")
        return res.status(403).json({ message: "Access denied. Admin only." })
      }
      console.log("Admin access granted")
      next()
    })
  } catch (error) {
    console.error("Admin auth error:", error)
    res.status(401).json({ message: "Authorization failed" })
  }
}

const operatorAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== "operator" && req.user.role !== "admin") {
        // Admins can often do operator actions, or we strictly separate.
        // Let's allow Admins to act as Operators for debugging/supervision.
        return res.status(403).json({ message: "Access denied. Operator only." })
      }
      next()
    })
  } catch (error) {
    res.status(401).json({ message: "Authorization failed" })
  }
}

module.exports = { auth, adminAuth, operatorAuth }
