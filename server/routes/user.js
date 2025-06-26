const express = require("express")
const User = require("../models/User")
const Feedback = require("../models/Feedback")
const { auth } = require("../middleware/auth")
const { body, validationResult } = require("express-validator")

const router = express.Router()

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findByUserId(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const feedbackStats = await Feedback.getUserStats(req.user.userId)
    const categoryStats = await Feedback.getCategoryStats(req.user.userId)

    const recentFeedback = await Feedback.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("feedbackId title category status createdAt")

    res.json({
      success: true,
      data: {
        user: user.profile,
        statistics: {
          feedback: feedbackStats,
          categories: categoryStats,
        },
        recentFeedback,
      },
    })
  } catch (error) {
    console.error("Get user profile error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
    })
  }
})


router.put(
  "/profile",
  [
    auth,
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("Name can only contain letters and spaces"),

    body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { name, email } = req.body

      const user = await User.findByUserId(req.user.userId)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      if (email && email !== user.email) {
        const existingUser = await User.findByEmail(email)
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email is already taken by another user",
          })
        }
      }

      if (name) user.name = name.trim()
      if (email) user.email = email.toLowerCase().trim()

      await user.save()

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: user.profile,
        },
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({
        success: false,
        message: "Error updating profile",
      })
    }
  },
)

router.get("/dashboard", auth, async (req, res) => {
  try {
    const user = await User.findByUserId(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const [feedbackStats, categoryStats] = await Promise.all([
      Feedback.getUserStats(req.user.userId),
      Feedback.getCategoryStats(req.user.userId),
    ])

    const recentFeedback = await Feedback.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("feedbackId title category status priority createdAt updatedAt rating")

    const pendingRatings = await Feedback.find({
      userId: req.user.userId,
      status: "completed",
      rating: null,
    }).select("feedbackId title category completedAt")

    res.json({
      success: true,
      data: {
        user: user.profile,
        statistics: {
          overview: feedbackStats,
          categories: categoryStats,
        },
        recentActivity: recentFeedback,
        pendingRatings,
        summary: {
          totalFeedback: feedbackStats.total,
          activeIssues: feedbackStats.open + feedbackStats.inProgress,
          completionRate:
            feedbackStats.total > 0
              ? Math.round(((feedbackStats.completed + feedbackStats.closed) / feedbackStats.total) * 100)
              : 0,
          averageRating: feedbackStats.avgRating || 0,
        },
      },
    })
  } catch (error) {
    console.error("Get dashboard error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
    })
  }
})

// @route   POST /api/user/deactivate
// @desc    Deactivate user account
// @access  Private
router.post("/deactivate", auth, async (req, res) => {
  try {
    const user = await User.findByUserId(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    user.isActive = false
    await user.save()

    res.json({
      success: true,
      message: "Account deactivated successfully",
    })
  } catch (error) {
    console.error("Deactivate account error:", error)
    res.status(500).json({
      success: false,
      message: "Error deactivating account",
    })
  }
})

module.exports = router
