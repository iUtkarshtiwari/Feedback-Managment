const User = require("../models/User")
const Feedback = require("../models/Feedback")
const { connectDB, disconnectDB } = require("../config/database")
require('dotenv').config();
const seedUsers = [
  {
    name: "Demo User",
    email: "demo@example.com",
    password: "demo123",
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
  },
]

const seedFeedbackTemplates = [
  {
    title: "Improve loading speed",
    feedbackText:
      "The application takes too long to load on mobile devices. It would be great if this could be optimized for better performance.",
    category: "suggestion",
    priority: "medium",
  },
  {
    title: "Bug in login form",
    feedbackText:
      "When I try to login with my credentials, sometimes the form doesn't respond and I have to refresh the page.",
    category: "bug-report",
    priority: "high",
  },
  {
    title: "Add dark mode",
    feedbackText: "It would be awesome to have a dark mode option for better user experience during night time usage.",
    category: "feature-request",
    priority: "low",
  },
  {
    title: "Great user interface",
    feedbackText: "I love the clean and intuitive design of the application. It's very easy to navigate and use.",
    category: "compliment",
    priority: "low",
  },
  {
    title: "Server downtime issue",
    feedbackText:
      "The server was down for about 2 hours yesterday evening. This caused significant disruption to our workflow.",
    category: "complaint",
    priority: "high",
  },
]

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...")

    await connectDB()

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await User.deleteMany({})
    await Feedback.deleteMany({})

    // Create users
    console.log("👥 Creating users...")
    const createdUsers = []

    for (const userData of seedUsers) {
      const user = new User(userData)
      await user.save()
      createdUsers.push(user)
      console.log(`✅ Created user: ${user.name} (${user.email})`)
    }

    // Create feedback for each user
    console.log("📝 Creating feedback...")

    for (const user of createdUsers) {
      // Create 2-3 feedback entries per user
      const feedbackCount = Math.floor(Math.random() * 2) + 2 // 2-3 feedback per user

      for (let i = 0; i < feedbackCount; i++) {
        const template = seedFeedbackTemplates[Math.floor(Math.random() * seedFeedbackTemplates.length)]

        const feedback = new Feedback({
          userId: user.userId,
          userName: user.name,
          userEmail: user.email,
          ...template,
          status: ["open", "in-progress", "completed"][Math.floor(Math.random() * 3)],
        })

        // Add rating for completed feedback
        if (feedback.status === "completed" && Math.random() > 0.5) {
          feedback.rating = Math.floor(Math.random() * 5) + 1
          feedback.ratingComment = "Thank you for resolving this issue!"
          feedback.status = "closed"
        }

        await feedback.save()
        console.log(`✅ Created feedback: ${feedback.title} for ${user.name}`)
      }

      // Update user's feedback count
      await user.incrementFeedbackCount()
    }

    console.log("🎉 Database seeding completed successfully!")
    console.log(`👥 Created ${createdUsers.length} users`)
    console.log(`📝 Created feedback entries`)
    console.log("\n📋 Demo Credentials:")
    console.log("Email: demo@example.com")
    console.log("Password: demo123")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    await disconnectDB()
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }
