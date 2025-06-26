const express = require("express")
const Feedback = require("../models/Feedback")
const User = require("../models/User")
const { auth } = require("../middleware/auth")
const {
  validateFeedback,
  validateFeedbackUpdate,
  validateRating,
  validatePagination,
} = require("../middleware/validation")

const router = express.Router()

router.post("/", auth, validateFeedback, async (req, res) => {
  try {
    const { title, feedbackText, category, priority = "medium" } = req.body

    const feedback = new Feedback({
      userId: req.user.userId,
      userName: req.user.name,
      userEmail: req.user.email,
      title: title.trim(),
      feedbackText: feedbackText.trim(),
      category,
      priority,
    })

    await feedback.save()

    const user = await User.findByUserId(req.user.userId)
    if (user) {
      await user.incrementFeedbackCount()
    }

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: {
        feedback,
      },
    })
  } catch (error) {
    if (error.errors) {
      // Mongoose validation error
      const errors = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      })
    }
    res.status(500).json({
      success: false,
      message: "Error submitting feedback",
      error: error.message,
    })
  }
})

router.get("/", auth, validatePagination, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      category,
      priority,
      search,
      all
    } = req.query;

    let query = { userId: req.user.userId };
    if (all === "true" && req.user.isAdmin) {
      query = {};
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { feedbackText: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [feedback, totalCount] = await Promise.all([
      Feedback.find(query).sort(sortOptions).skip(skip).limit(Number.parseInt(limit)),
      Feedback.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / Number.parseInt(limit));
    const hasNextPage = Number.parseInt(page) < totalPages;
    const hasPrevPage = Number.parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: Number.parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching feedback",
    });
  }
})

// @route   GET /api/feedback/stats
// @desc    Get user's feedback statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const [userStats, categoryStats] = await Promise.all([
      Feedback.getUserStats(req.user.userId),
      Feedback.getCategoryStats(req.user.userId),
    ])

    res.json({
      success: true,
      data: {
        userStats,
        categoryStats,
      },
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
    })
  }
})


router.get("/:feedbackId", auth, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      feedbackId: req.params.feedbackId,
      userId: req.user.userId,
    })

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      })
    }

    res.json({
      success: true,
      data: {
        feedback,
      },
    })
  } catch (error) {
    console.error("Get feedback by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching feedback",
    })
  }
})


router.put("/:feedbackId", auth, validateFeedbackUpdate, async (req, res) => {
  try {
    const { title, feedbackText, category, priority } = req.body

    const feedback = await Feedback.findOne({
      feedbackId: req.params.feedbackId,
      userId: req.user.userId,
    })

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      })
    }

    // Only allow updates if feedback is still open
    if (feedback.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "Cannot update feedback that is already being processed",
      })
    }

    // Update allowed fields
    if (title) feedback.title = title.trim()
    if (feedbackText) feedback.feedbackText = feedbackText.trim()
    if (category) feedback.category = category
    if (priority) feedback.priority = priority

    await feedback.save()

    res.json({
      success: true,
      message: "Feedback updated successfully",
      data: {
        feedback,
      },
    })
  } catch (error) {
    console.error("Update feedback error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating feedback",
    })
  }
})

router.post("/:feedbackId/rating", auth, validateRating, async (req, res) => {
  try {
    const { rating, comment } = req.body

    const feedback = await Feedback.findOne({
      feedbackId: req.params.feedbackId,
      userId: req.user.userId,
    })

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      })
    }

    if (feedback.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only rate completed feedback",
      })
    }

    if (feedback.rating) {
      return res.status(400).json({
        success: false,
        message: "Feedback has already been rated",
      })
    }

    await feedback.addRating(rating, comment)

    res.json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        feedback,
      },
    })
  } catch (error) {
    console.error("Add rating error:", error)
    res.status(500).json({
      success: false,
      message: "Error submitting rating",
    })
  }
})

router.delete("/:feedbackId", auth, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      feedbackId: req.params.feedbackId,
      userId: req.user.userId,
    })

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      })
    }

    if (feedback.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete feedback that is already being processed",
      })
    }

    await Feedback.findByIdAndDelete(feedback._id)

    const user = await User.findByUserId(req.user.userId)
    if (user && user.feedbackCount > 0) {
      user.feedbackCount -= 1
      await user.save()
    }

    res.json({
      success: true,
      message: "Feedback deleted successfully",
    })
  } catch (error) {
    console.error("Delete feedback error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting feedback",
    })
  }
})

module.exports = router
