const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { validateSignup, validateLogin } = require("../middleware/validation")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Generate JWT token here
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  })
}

router.post("/signup", validateSignup, async (req, res) => {
  try {
    const { name, email, password } = req.body

    console.log("Signup attempt:", { name, email })

    const existingUser = await User.findByEmail(email)
    console.log("Existing user found:", existingUser)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    })

    await user.save()

    const token = generateToken(user.userId)

    await user.updateLoginInfo()

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: user.profile,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating user account",
      error: error.message,
    })
  }
})

router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findByEmail(email).select("+password")
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    const token = generateToken(user.userId)

    await user.updateLoginInfo()

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: user.profile,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Error during login process",
    })
  }
})


router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findByUserId(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: {
        user: user.profile,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
    })
  }
})

router.post("/verify-token", auth, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    data: {
      user: req.user,
    },
  })
})


router.post("/logout", auth, (req, res) => {
  res.json({
    success: true,
    message: "Logout successful",
  })
})

module.exports = router
