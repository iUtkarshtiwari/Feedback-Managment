const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI

    if (!mongoURI) {
      console.error("❌ MongoDB URI is not defined. Please check your .env file.")
      process.exit(1)
    }

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, 
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false, 
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📁 Database Name: ${conn.connection.name}`)

    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB connection error: ${err}`)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected")
    })

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected")
    })
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`)
    process.exit(1)
  }
}

const disconnectDB = async () => {
  try {
    await mongoose.connection.close()
    console.log("✅ MongoDB connection closed")
  } catch (error) {
    console.error(`❌ Error closing MongoDB connection: ${error.message}`)
  }
}

module.exports = {
  connectDB,
  disconnectDB,
}