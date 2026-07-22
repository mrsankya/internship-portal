const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { sendNotificationEmail } = require('../utils/emailService');

// Get all notifications for logged-in user (including broadcast notifications)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch notifications where userId matches or is null (broadcast)
    const notifications = await Notification.find({
      $or: [
        { userId: userId },
        { userId: null }
      ]
    }).sort({ createdAt: -1 }).limit(30);

    // Format response to calculate isRead for broadcast notifications
    const formatted = notifications.map(notif => {
      const isBroadcast = !notif.userId;
      const isRead = isBroadcast ? (notif.readBy && notif.readBy.includes(userId)) : notif.isRead;
      return {
        _id: notif._id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        link: notif.link,
        isRead: isRead,
        createdAt: notif.createdAt
      };
    });

    const unreadCount = formatted.filter(n => !n.isRead).length;

    res.json({ notifications: formatted, unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
});

// Mark single notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId) {
      notification.isRead = true;
    } else {
      if (!notification.readBy) notification.readBy = [];
      if (!notification.readBy.includes(userId)) {
        notification.readBy.push(userId);
      }
    }

    await notification.save();
    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(500).json({ message: 'Error marking notification as read', error: err.message });
  }
});

// Mark all as read
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Mark user specific notifications
    await Notification.updateMany({ userId: userId, isRead: false }, { $set: { isRead: true } });

    // Mark broadcast notifications
    await Notification.updateMany(
      { userId: null, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking all notifications read', error: err.message });
  }
});

// Clear read notifications
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.deleteMany({ userId: userId, isRead: true });
    res.json({ message: 'Cleared read notifications' });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing notifications', error: err.message });
  }
});

// Send custom email/notification (Admins & Mentors)
router.post('/send-email', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, title, message, actionUrl } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    let targetUsers = [];
    if (targetUserId) {
      const u = await User.findById(targetUserId);
      if (u) targetUsers.push(u);
    } else {
      targetUsers = await User.find({ status: 'active' });
    }

    // Create In-App Notification
    await Notification.create({
      userId: targetUserId || null,
      title,
      message,
      type: 'info',
      link: actionUrl || ''
    });

    // Send emails asynchronously
    for (const u of targetUsers) {
      if (u.email) {
        sendNotificationEmail({
          email: u.email,
          name: u.name,
          title,
          message,
          actionUrl
        }).catch(e => console.error('Error sending notification email:', e.message));
      }
    }

    res.json({ message: `Notification dispatched to ${targetUsers.length} user(s)` });
  } catch (err) {
    res.status(500).json({ message: 'Error sending notification', error: err.message });
  }
});

module.exports = router;
