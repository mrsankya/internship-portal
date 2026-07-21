const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { auth, authorizeRoles } = require('../middleware/auth');

// Public: Get all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(10);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching announcements' });
  }
});

// Admin/Coordinator: Create announcement
router.post('/', auth, authorizeRoles('admin', 'coordinator'), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const newAnnouncement = new Announcement({
      title,
      content,
      category: category || 'General',
      authorName: req.user.name || 'Campus Office',
      createdById: req.user.id
    });

    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (err) {
    res.status(500).json({ message: 'Error creating announcement' });
  }
});

// Admin/Coordinator: Delete announcement
router.delete('/:id', auth, authorizeRoles('admin', 'coordinator'), async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting announcement' });
  }
});

module.exports = router;
