const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    avatar: {
      type: String,
      default: function () {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.name}`
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    feedbackCount: {
      type: Number,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password
        delete ret.__v
        return ret
      },
    },
  },
)

userSchema.index({ email: 1 })
userSchema.index({ userId: 1 })
userSchema.index({ createdAt: -1 })

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw new Error("Password comparison failed")
  }
}

userSchema.methods.updateLoginInfo = async function () {
  this.lastLogin = new Date()
  this.loginCount += 1
  return await this.save()
}

userSchema.methods.incrementFeedbackCount = async function () {
  this.feedbackCount += 1
  return await this.save()
}

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() })
}

userSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId })
}

userSchema.virtual("profile").get(function () {
  return {
    userId: this.userId,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    joinedDate: this.createdAt,
    lastLogin: this.lastLogin,
    loginCount: this.loginCount,
    feedbackCount: this.feedbackCount,
    isActive: this.isActive,
    isAdmin: this.isAdmin,
  }
})

module.exports = mongoose.model("User", userSchema)
