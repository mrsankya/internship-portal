const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth, optionalAuth } = require('../middleware/auth');

// Get all events with filtering & search
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, department, status } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status) {
      query.status = status;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Error fetching events', error: err.message });
  }
});

// Get single event details
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching event details' });
  }
});

// Create new event
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, date, time, location, venue, organizer, department, image, capacity, price, isFeatured, agenda, speakers } = req.body;

    if (!title || !description || !category || !date || !time || !location || !venue || !organizer) {
      return res.status(400).json({ message: 'Please provide all required event fields' });
    }

    const newEvent = new Event({
      title,
      description,
      category,
      date: new Date(date),
      time,
      location,
      venue,
      organizer,
      department: department || 'General',
      image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      capacity: capacity || 100,
      price: price || 0,
      isFeatured: isFeatured || false,
      agenda: agenda || [],
      speakers: speakers || [],
      createdById: req.user.id
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Error creating event', error: err.message });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ message: 'Error updating event' });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting event' });
  }
});

module.exports = router;
