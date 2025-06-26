const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['bug', 'request', 'complaint', 'compliment'], required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  status: { type: String, default: 'open', enum: ['open', 'in progress', 'closed'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
