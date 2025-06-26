const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided or invalid format.",
      })
    }

    const token = authHeader.substring(7) 

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token is missing.",
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findByUserId(decoded.userId)

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token. User not found.",
        })
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated. Please contact support.",
        })
      }

      req.user = {
        userId: user.userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        id: user._id,
        isAdmin: user.isAdmin,
      }

      next()
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
        })
      } else if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token format.",
        })
      } else {
        throw jwtError
      }
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    })
  }
}

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next()
    }

    const token = authHeader.substring(7)

    if (!token) {
      return next()
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findByUserId(decoded.userId)

      if (user && user.isActive) {
        req.user = {
          userId: user.userId,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          id: user._id,
          isAdmin: user.isAdmin,
        }
      }
    } catch (jwtError) {
    }

    next()
  } catch (error) {
    console.error("Optional auth middleware error:", error)
    next()
  }
}

module.exports = {
  auth,
  optionalAuth,
}
