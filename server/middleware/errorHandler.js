const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  console.error("Error:", err)

  if (err.name === "CastError") {
    const message = "Resource not found"
    error = { message, statusCode: 404 }
  }

  if (err.code === 11000) {
    let message = "Duplicate field value entered"

    const field = Object.keys(err.keyValue)[0]
    if (field === "email") {
      message = "Email address is already registered"
    } else if (field === "userId") {
      message = "User ID already exists"
    } else if (field === "feedbackId") {
      message = "Feedback ID already exists"
    }

    error = { message, statusCode: 400 }
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")
    error = { message, statusCode: 400 }
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token"
    error = { message, statusCode: 401 }
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired"
    error = { message, statusCode: 401 }
  }

  if (err.status === 429) {
    const message = "Too many requests, please try again later"
    error = { message, statusCode: 429 }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

module.exports = errorHandler
