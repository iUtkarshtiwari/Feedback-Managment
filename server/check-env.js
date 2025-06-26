require("dotenv").config()

console.log("Environment Variables Check:")
console.log("---------------------------")
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✅ Defined" : "❌ Not defined")
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Defined" : "❌ Not defined")
console.log("PORT:", process.env.PORT ? "✅ Defined" : "❌ Not defined")
console.log("FRONTEND_URL:", process.env.FRONTEND_URL ? "✅ Defined" : "❌ Not defined")
console.log("NODE_ENV:", process.env.NODE_ENV ? "✅ Defined" : "❌ Not defined")
console.log("---------------------------")

if (!process.env.MONGODB_URI) {
  console.log("\n⚠️ MONGODB_URI is not defined. Please make sure you have a .env file with this variable.")
  console.log("Example MONGODB_URI: mongodb://localhost:27017/feedback_system")
}

if (!process.env.JWT_SECRET) {
  console.log("\n⚠️ JWT_SECRET is not defined. Please make sure you have a .env file with this variable.")
  console.log("Example JWT_SECRET: your_super_secret_jwt_key_here_make_it_very_long_and_secure")
}
