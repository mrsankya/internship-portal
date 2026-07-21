const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get feedback for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const feedbackList = await Feedback.find({ eventId: req.params.eventId }).sort({ createdAt: -1 });
    
    let avgRating = 0;
    if (feedbackList.length > 0) {
      const sum = feedbackList.reduce((acc, curr) => acc + curr.rating, 0);
      avgRating = Number((sum / feedbackList.length).toFixed(1));
    }

    res.json({
      avgRating,
      totalCount: feedbackList.length,
      feedbacks: feedbackList
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching feedback' });
  }
});

// Submit feedback for an event
router.post('/', auth, async (req, res) => {
  try {
    const { eventId, rating, comment } = req.body;
    if (!eventId || !rating || !comment) {
      return res.status(400).json({ message: 'Event ID, rating (1-5), and comment are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Upsert feedback
    const feedback = await Feedback.findOneAndUpdate(
      { eventId, userId: req.user.id },
      {
        eventId,
        userId: req.user.id,
        userName: user.name,
        userAvatar: user.avatar,
        rating: Number(rating),
        comment
      },
      { new: true, upsert: true }
    );

    res.status(201).json(feedback);
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ message: 'Error submitting feedback', error: err.message });
  }
});

module.exports = router;
