const Feedback = require('../models/Feedback');

exports.createFeedback = async (req, res) => {
  try {
    const { title, description, type, rating } = req.body;
    const feedback = await Feedback.create({
      userId: req.user.id,
      title,
      description,
      type,
      rating,
      status: 'open'
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Feedback creation failed' });
  }
};

exports.getMyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.id });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: 'Fetching feedbacks failed' });
  }
};
