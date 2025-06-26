const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid")

const feedbackSchema = new mongoose.Schema(
  {
    feedbackId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
      required: true,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      ref: "User",
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
    },
    userEmail: {
      type: String,
      required: [true, "User email is required"],
    },
    title: {
      type: String,
      required: [true, "Feedback title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    feedbackText: {
      type: String,
      required: [true, "Feedback text is required"],
      trim: true,
      minlength: [10, "Feedback must be at least 10 characters long"],
      maxlength: [2000, "Feedback cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["suggestion", "bug-report", "feature-request", "general", "complaint", "compliment"],
        message: "Category must be one of: suggestion, bug-report, feature-request, general, complaint, compliment",
      },
    },
    priority: {
      type: String,
      required: [true, "Priority is required"],
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be one of: low, medium, high",
      },
      default: "medium",
    },
    status: {
      type: String,
      enum: {
        values: ["open", "in-progress", "completed", "closed"],
        message: "Status must be one of: open, in-progress, completed, closed",
      },
      default: "open",
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      default: null,
    },
    ratingComment: {
      type: String,
      trim: true,
      maxlength: [500, "Rating comment cannot exceed 500 characters"],
      default: null,
    },
    adminResponse: {
      type: String,
      trim: true,
      maxlength: [1000, "Admin response cannot exceed 1000 characters"],
      default: null,
    },
    adminId: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    attachments: [
      {
        filename: String,
        originalName: String,
        mimeType: String,
        size: Number,
        url: String,
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v
        return ret
      },
    },
  },
)

// Indexes for better query performance
feedbackSchema.index({ userId: 1, createdAt: -1 })
feedbackSchema.index({ feedbackId: 1 })
feedbackSchema.index({ status: 1 })
feedbackSchema.index({ category: 1 })
feedbackSchema.index({ priority: 1 })
feedbackSchema.index({ createdAt: -1 })

// Compound indexes
feedbackSchema.index({ userId: 1, status: 1 })
feedbackSchema.index({ userId: 1, category: 1 })
feedbackSchema.index({ status: 1, priority: 1 })

// Pre-save middleware to set completion/closure dates
feedbackSchema.pre("save", function (next) {
  // Set completedAt when status changes to completed
  if (this.isModified("status") && this.status === "completed" && !this.completedAt) {
    this.completedAt = new Date()
  }

  // Set closedAt when status changes to closed
  if (this.isModified("status") && this.status === "closed" && !this.closedAt) {
    this.closedAt = new Date()
  }

  next()
})

// Static method to get user's feedback statistics
feedbackSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
        avgRating: { $avg: "$rating" },
        highPriority: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
        mediumPriority: { $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] } },
        lowPriority: { $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] } },
      },
    },
  ])

  return (
    stats[0] || {
      total: 0,
      open: 0,
      inProgress: 0,
      completed: 0,
      closed: 0,
      avgRating: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
    }
  )
}

// Static method to get category-wise statistics
feedbackSchema.statics.getCategoryStats = async function (userId) {
  return await this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        avgRating: { $avg: "$rating" },
        statuses: {
          $push: "$status",
        },
      },
    },
    {
      $project: {
        category: "$_id",
        count: 1,
        avgRating: { $round: ["$avgRating", 1] },
        openCount: {
          $size: {
            $filter: {
              input: "$statuses",
              cond: { $eq: ["$$this", "open"] },
            },
          },
        },
        completedCount: {
          $size: {
            $filter: {
              input: "$statuses",
              cond: { $eq: ["$$this", "completed"] },
            },
          },
        },
      },
    },
  ])
}

// Instance method to update status
feedbackSchema.methods.updateStatus = async function (newStatus, adminId = null, adminResponse = null) {
  this.status = newStatus
  if (adminId) this.adminId = adminId
  if (adminResponse) this.adminResponse = adminResponse
  return await this.save()
}

// Instance method to add rating
feedbackSchema.methods.addRating = async function (rating, comment = null) {
  this.rating = rating
  this.ratingComment = comment
  this.status = "closed"
  return await this.save()
}

module.exports = mongoose.model("Feedback", feedbackSchema)
