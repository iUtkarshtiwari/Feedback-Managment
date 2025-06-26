# Feedback System Backend API

A comprehensive Node.js/Express.js backend system with MongoDB integration for the User Feedback System.

## 🚀 Features

### 🔐 Authentication System
- **JWT-based authentication** with secure token generation
- **User registration and login** with password hashing (bcrypt)
- **Token verification** and protected routes
- **User session management** with login tracking

### 📊 Database Models
- **User Model**: Complete user management with profile data
- **Feedback Model**: Comprehensive feedback system with status tracking
- **MongoDB integration** with Mongoose ODM
- **Data validation** and schema enforcement

### 🛡️ Security Features
- **Password hashing** with bcrypt (salt rounds: 12)
- **JWT token security** with configurable expiration
- **Rate limiting** to prevent abuse
- **CORS configuration** for frontend integration
- **Input validation** with express-validator
- **Helmet.js** for security headers

### 📝 API Endpoints

#### Authentication Routes (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - User authentication
- `GET /me` - Get current user profile
- `POST /verify-token` - Verify JWT token
- `POST /logout` - User logout

#### Feedback Routes (`/api/feedback`)
- `POST /` - Submit new feedback
- `GET /` - Get user's feedback (with pagination & filtering)
- `GET /stats` - Get user's feedback statistics
- `GET /:feedbackId` - Get specific feedback
- `PUT /:feedbackId` - Update feedback (limited)
- `POST /:feedbackId/rating` - Add rating to completed feedback
- `DELETE /:feedbackId` - Delete feedback (if open)

#### User Routes (`/api/user`)
- `GET /profile` - Get detailed user profile
- `PUT /profile` - Update user profile
- `GET /dashboard` - Get dashboard data
- `POST /deactivate` - Deactivate account

## 🏗️ Project Structure

\`\`\`
server/
├── config/
│   └── database.js          # MongoDB connection configuration
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   ├── validation.js       # Input validation middleware
│   └── errorHandler.js     # Global error handling
├── models/
│   ├── User.js             # User schema and methods
│   └── Feedback.js         # Feedback schema and methods
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── feedback.js         # Feedback management routes
│   └── user.js             # User profile routes
├── utils/
│   └── seedData.js         # Database seeding utility
├── .env                    # Environment variables
├── server.js               # Main server file
└── package.json            # Dependencies and scripts
\`\`\`

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Install Dependencies
\`\`\`bash
cd server
npm install
\`\`\`

### 2. Environment Configuration
Create a \`.env\` file in the server directory:

\`\`\`env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/feedback_system
DB_NAME=feedback_system

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_secure
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
\`\`\`

### 3. Start MongoDB
Make sure MongoDB is running on your system:

\`\`\`bash
# For local MongoDB installation
mongod

# Or use MongoDB service
sudo systemctl start mongod
\`\`\`

### 4. Seed Database (Optional)
\`\`\`bash
node utils/seedData.js
\`\`\`

### 5. Start Server
\`\`\`bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
\`\`\`

The server will start on \`http://localhost:5000\`

## 📊 Database Schema

### User Schema
\`\`\`javascript
{
  userId: String (UUID, unique),
  name: String (required, 2-50 chars),
  email: String (required, unique, validated),
  password: String (required, hashed, min 6 chars),
  avatar: String (auto-generated),
  isActive: Boolean (default: true),
  lastLogin: Date,
  loginCount: Number (default: 0),
  feedbackCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Feedback Schema
\`\`\`javascript
{
  feedbackId: String (UUID, unique),
  userId: String (required, ref: User),
  userName: String (required),
  userEmail: String (required),
  title: String (required, 3-100 chars),
  feedbackText: String (required, 10-2000 chars),
  category: String (enum: suggestion, bug-report, feature-request, general, complaint, compliment),
  priority: String (enum: low, medium, high),
  status: String (enum: open, in-progress, completed, closed),
  rating: Number (1-5, optional),
  ratingComment: String (optional, max 500 chars),
  adminResponse: String (optional, max 1000 chars),
  adminId: String (optional),
  completedAt: Date (optional),
  closedAt: Date (optional),
  tags: [String] (optional),
  attachments: [Object] (optional),
  isArchived: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## 🔧 API Usage Examples

### Authentication
\`\`\`javascript
// Register new user
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "userId": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      // ... other user data
    }
  }
}
\`\`\`

### Feedback Submission
\`\`\`javascript
// Submit feedback (requires Authorization header)
POST /api/feedback
Headers: { "Authorization": "Bearer jwt_token" }
{
  "title": "Bug in login form",
  "feedbackText": "The login form doesn't respond sometimes...",
  "category": "bug-report",
  "priority": "high"
}
\`\`\`

### Get User Feedback
\`\`\`javascript
// Get paginated feedback with filters
GET /api/feedback?page=1&limit=10&status=open&category=bug-report&search=login
Headers: { "Authorization": "Bearer jwt_token" }
\`\`\`

## 🔒 Security Features

### Password Security
- **bcrypt hashing** with salt rounds of 12
- **Password validation** with complexity requirements
- **Secure password comparison** using bcrypt.compare()

### JWT Security
- **Configurable token expiration** (default: 7 days)
- **Secure token generation** with strong secret keys
- **Token verification** on protected routes
- **Automatic token invalidation** on logout

### API Security
- **Rate limiting** to prevent brute force attacks
- **CORS configuration** for cross-origin requests
- **Helmet.js** for security headers
- **Input validation** and sanitization
- **Error handling** without sensitive data exposure

### Database Security
- **MongoDB connection security** with proper configuration
- **Schema validation** to prevent invalid data
- **User data isolation** (users only see their own data)
- **Secure queries** to prevent injection attacks

## 📈 Performance Features

### Database Optimization
- **Indexed fields** for faster queries
- **Compound indexes** for complex queries
- **Aggregation pipelines** for statistics
- **Connection pooling** for better performance

### API Optimization
- **Pagination** for large datasets
- **Filtering and sorting** capabilities
- **Selective field projection** to reduce payload
- **Caching strategies** for frequently accessed data

## 🧪 Testing

### API Testing
\`\`\`bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run tests
npm test
\`\`\`

### Manual Testing with curl
\`\`\`bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
\`\`\`

## 🚀 Deployment

### Environment Setup
1. Set \`NODE_ENV=production\`
2. Use strong JWT secrets
3. Configure MongoDB Atlas for cloud database
4. Set up proper CORS origins
5. Configure rate limiting for production

### Production Considerations
- Use process managers like PM2
- Set up proper logging
- Configure SSL/HTTPS
- Implement monitoring and health checks
- Set up backup strategies for MongoDB

## 🔄 Frontend Integration

### API Base URL
\`\`\`javascript
const API_BASE_URL = 'http://localhost:5000/api';
\`\`\`

### Authentication Headers
\`\`\`javascript
const token = localStorage.getItem('token');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': \`Bearer \${token}\`
};
\`\`\`

### Example Frontend Integration
\`\`\`javascript
// Login function
const login = async (email, password) => {
  const response = await fetch(\`\${API_BASE_URL}/auth/login\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  return data;
};

// Submit feedback function
const submitFeedback = async (feedbackData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(\`\${API_BASE_URL}/feedback\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify(feedbackData)
  });
  
  return await response.json();
};
\`\`\`

## 📝 API Response Format

### Success Response
\`\`\`javascript
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
\`\`\`

### Error Response
\`\`\`javascript
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "value": ""
    }
  ]
}
\`\`\`

### Pagination Response
\`\`\`javascript
{
  "success": true,
  "data": {
    "feedback": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
\`\`\`

## 🎯 Key Features Summary

✅ **Complete Authentication System** with JWT
✅ **User Registration & Login** with validation
✅ **Unique User ID Generation** (UUID)
✅ **Feedback Submission** with unique feedback IDs
✅ **User-specific Data Isolation**
✅ **MongoDB Integration** with proper schemas
✅ **RESTful API Design** with proper HTTP methods
✅ **Input Validation** and error handling
✅ **Security Best Practices** implemented
✅ **Pagination & Filtering** for large datasets
✅ **Statistics & Analytics** endpoints
✅ **Rating System** for completed feedback
✅ **Modular Architecture** with clean separation

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify database permissions

2. **JWT Token Issues**
   - Check JWT_SECRET in .env
   - Verify token format in requests
   - Ensure token hasn't expired

3. **CORS Errors**
   - Update FRONTEND_URL in .env
   - Check CORS configuration
   - Verify request headers

4. **Validation Errors**
   - Check request body format
   - Verify required fields
   - Review validation rules

This backend system provides a complete, production-ready API for the User Feedback System with robust authentication, comprehensive data management, and seamless frontend integration capabilities.
