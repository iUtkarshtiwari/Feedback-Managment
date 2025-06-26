// backend/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Updated filename
const { createFeedback, getMyFeedbacks } = require('../controllers/feedbackController');
// backend/routes/feedbackRoutes.js

router.post('/create', auth, createFeedback);
router.get('/my', auth, getMyFeedbacks);

module.exports = router;
