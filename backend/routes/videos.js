const express = require('express');
const router = express.Router();
const VideoLesson = require('../models/VideoLesson');
const VideoProgress = require('../models/VideoProgress');
const User = require('../models/User');
const Internship = require('../models/Internship');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

// Helper to convert YouTube link to standard embed URL
function sanitizeVideoUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  } else if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

// Get video lessons for an internship + user progress
router.get('/internship/:internshipId', async (req, res) => {
  try {
    const { internshipId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    const lessons = await VideoLesson.find({ internshipId }).sort({ order: 1, createdAt: 1 });
    
    let progressMap = {};
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'digi_internship_hub_super_secret_jwt_key_2026');
        const userProgress = await VideoProgress.find({ userId: decoded.id, internshipId });
        userProgress.forEach(p => {
          progressMap[p.videoLessonId.toString()] = {
            isCompleted: p.isCompleted,
            watchedPercentage: p.watchedPercentage
          };
        });
      } catch (e) {
        // Token optional
      }
    }

    const lessonsWithProgress = lessons.map(lesson => ({
      ...lesson.toObject(),
      videoUrl: sanitizeVideoUrl(lesson.videoUrl),
      userProgress: progressMap[lesson._id.toString()] || { isCompleted: false, watchedPercentage: 0 }
    }));

    const completedCount = lessonsWithProgress.filter(l => l.userProgress.isCompleted).length;
    const totalCount = lessonsWithProgress.length;
    const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    res.json({
      lessons: lessonsWithProgress,
      summary: {
        completedCount,
        totalCount,
        overallProgress
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching video lessons', error: err.message });
  }
});

// Add a video lesson (Admins & Mentors)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { internshipId, title, description, videoUrl, thumbnail, duration, moduleName, order } = req.body;

    if (!internshipId || !title || !videoUrl) {
      return res.status(400).json({ message: 'Internship ID, title, and video URL are required' });
    }

    const newLesson = await VideoLesson.create({
      internshipId,
      title,
      description: description || '',
      videoUrl: sanitizeVideoUrl(videoUrl),
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
      duration: duration || '10:00',
      moduleName: moduleName || 'Module 1: Learning Material',
      order: order || 1,
      createdById: req.user.id
    });

    // Notify registered interns about new video lesson
    const internship = await Internship.findById(internshipId);
    if (internship) {
      await Notification.create({
        userId: null,
        title: `📺 New Video Lesson: ${title}`,
        message: `A new video lecture "${title}" has been published for ${internship.title}. Watch and earn +50 XP!`,
        type: 'video',
        link: `/event/${internshipId}`
      });
    }

    res.status(201).json(newLesson);
  } catch (err) {
    res.status(500).json({ message: 'Error creating video lesson', error: err.message });
  }
});

// Mark video lesson as watched/completed
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const videoLesson = await VideoLesson.findById(req.params.id);
    if (!videoLesson) {
      return res.status(404).json({ message: 'Video lesson not found' });
    }

    const userId = req.user.id;
    let progress = await VideoProgress.findOne({ userId, videoLessonId: videoLesson._id });

    let isNewCompletion = false;

    if (!progress) {
      progress = await VideoProgress.create({
        userId,
        videoLessonId: videoLesson._id,
        internshipId: videoLesson.internshipId,
        watchedPercentage: 100,
        isCompleted: true,
        completedAt: new Date()
      });
      isNewCompletion = true;
    } else if (!progress.isCompleted) {
      progress.isCompleted = true;
      progress.watchedPercentage = 100;
      progress.completedAt = new Date();
      await progress.save();
      isNewCompletion = true;
    }

    // Award +50 XP for new video completion
    let xpEarned = 0;
    if (isNewCompletion) {
      xpEarned = 50;
      const user = await User.findById(userId);
      if (user) {
        user.xpPoints = (user.xpPoints || 0) + xpEarned;
        if (!user.badges.includes('🎬 Video Mastery')) {
          user.badges.push('🎬 Video Mastery');
        }
        await user.save();

        // Create In-App Notification
        await Notification.create({
          userId: user._id,
          title: `🎥 Video Lesson Completed!`,
          message: `You completed "${videoLesson.title}" and earned +50 XP!`,
          type: 'video',
          link: `/event/${videoLesson.internshipId}`
        });
      }
    }

    res.json({
      message: isNewCompletion ? 'Video marked as completed (+50 XP earned!)' : 'Video already completed',
      isCompleted: true,
      xpEarned,
      progress
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating video progress', error: err.message });
  }
});

// Delete video lesson (Admins & Mentors)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await VideoLesson.findByIdAndDelete(req.params.id);
    await VideoProgress.deleteMany({ videoLessonId: req.params.id });
    res.json({ message: 'Video lesson deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting video lesson', error: err.message });
  }
});

module.exports = router;
