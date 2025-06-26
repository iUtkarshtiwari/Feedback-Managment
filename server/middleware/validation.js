const { body, param, query, validationResult } = require("express-validator")

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    })
  }
  next()
}

const validateSignup = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number"),

  handleValidationErrors,
]

const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
]

const validateFeedback = [
  body("title").trim().isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 100 characters"),

  body("feedbackText")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Feedback text must be between 10 and 2000 characters"),

  body("category")
    .isIn(["suggestion", "bug-report", "feature-request", "general", "complaint", "compliment"])
    .withMessage("Invalid category selected"),

  body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Priority must be low, medium, or high"),

  handleValidationErrors,
]

const validateFeedbackUpdate = [
  param("feedbackId").isUUID().withMessage("Invalid feedback ID format"),

  body("status").optional().isIn(["open", "in-progress", "completed", "closed"]).withMessage("Invalid status"),

  body("adminResponse")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Admin response cannot exceed 1000 characters"),

  handleValidationErrors,
]

const validateRating = [
  param("feedbackId").isUUID().withMessage("Invalid feedback ID format"),

  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),

  body("comment").optional().trim().isLength({ max: 500 }).withMessage("Comment cannot exceed 500 characters"),

  handleValidationErrors,
]

const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "updatedAt", "title", "priority", "status"])
    .withMessage("Invalid sort field"),

  query("sortOrder").optional().isIn(["asc", "desc"]).withMessage("Sort order must be asc or desc"),

  query("status").optional().isIn(["open", "in-progress", "completed", "closed"]).withMessage("Invalid status filter"),

  query("category")
    .optional()
    .isIn(["suggestion", "bug-report", "feature-request", "general", "complaint", "compliment"])
    .withMessage("Invalid category filter"),

  query("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority filter"),

  handleValidationErrors,
]

module.exports = {validateSignup,validateLogin,validateFeedback,validateFeedbackUpdate,validateRating,validatePagination,handleValidationErrors}
