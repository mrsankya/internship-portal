const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Internship = require('../models/Internship');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get Performance Leaderboard (Top Ranked Interns)
router.get('/leaderboard', async (req, res) => {
  try {
    const topInterns = await User.find({ status: 'active' })
      .select('name department avatar xpPoints level badges studentId company position role')
      .sort({ xpPoints: -1 })
      .limit(10);

    res.json(topInterns);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// Apply for an Internship / Event (+150 XP Bonus & Badges)
router.post('/', auth, async (req, res) => {
  try {
    const { internshipId, eventId } = req.body;
    const targetId = internshipId || eventId;

    if (!targetId) {
      return res.status(400).json({ message: 'Internship ID is required' });
    }

    const internship = await Internship.findById(targetId);
    if (!internship) {
      return res.status(404).json({ message: 'Internship position not found' });
    }

    if (internship.appliedCount >= (internship.totalPositions || 100)) {
      return res.status(400).json({ message: 'Internship positions are fully filled' });
    }

    const existingReg = await Registration.findOne({
      $or: [
        { internshipId: targetId, userId: req.user.id },
        { eventId: targetId, userId: req.user.id }
      ]
    });

    if (existingReg && existingReg.status !== 'cancelled' && existingReg.status !== 'Rejected') {
      return res.status(400).json({ message: 'You have already applied for this internship' });
    }

    const verificationCode = `INT-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${verificationCode}`;

    const registration = new Registration({
      internshipId: targetId,
      eventId: targetId,
      userId: req.user.id,
      ticketCode: verificationCode,
      qrCodeUrl,
      status: 'Applied',
      progress: 10,
      hoursLogged: 0,
      checkIns: [],
      progressReports: []
    });

    await registration.save();

    // Increment count
    internship.appliedCount = (internship.appliedCount || 0) + 1;
    internship.registeredCount = (internship.registeredCount || 0) + 1;
    await internship.save();

    // Award +150 XP Gamification Points to Intern User
    const userObj = await User.findById(req.user.id);
    if (userObj) {
      userObj.xpPoints = (userObj.xpPoints || 250) + 150;
      
      if (!userObj.badges.includes('💼 Verified Intern')) {
        userObj.badges.push('💼 Verified Intern');
      }
      if (internship.domain === 'AI & Machine Learning' && !userObj.badges.includes('🤖 AI Pioneer')) {
        userObj.badges.push('🤖 AI Pioneer');
      }
      if (internship.domain === 'Web Development' && !userObj.badges.includes('🚀 Full-Stack Architect')) {
        userObj.badges.push('🚀 Full-Stack Architect');
      }
      if (!userObj.badges.includes('⚡ Campus Pioneer')) {
        userObj.badges.push('⚡ Campus Pioneer');
      }
      await userObj.save();
    }

    const populatedReg = await Registration.findById(registration._id).populate('internshipId').populate('eventId');
    res.status(201).json(populatedReg);
  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ message: 'Error applying for internship', error: err.message });
  }
});

// Get user applications / my internships
router.get('/my', auth, async (req, res) => {
  try {
    const applications = await Registration.find({
      userId: req.user.id,
      status: { $ne: 'cancelled' }
    })
      .populate('internshipId')
      .populate('eventId')
      .sort({ registeredAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ message: 'Error fetching user internship applications' });
  }
});

// Cancel / Withdraw application
router.delete('/:id', auth, async (req, res) => {
  try {
    const registration = await Registration.findOne({ _id: req.params.id, userId: req.user.id });
    if (!registration) {
      return res.status(404).json({ message: 'Application record not found' });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Decrement applied count
    const targetId = registration.internshipId || registration.eventId;
    const internship = await Internship.findById(targetId);
    if (internship && internship.appliedCount > 0) {
      internship.appliedCount -= 1;
      internship.registeredCount = Math.max(0, (internship.registeredCount || 1) - 1);
      await internship.save();
    }

    res.json({ message: 'Application withdrawn successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error withdrawing application' });
  }
});

module.exports = router;
