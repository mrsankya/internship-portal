const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Internship = require('../models/Internship');
const Registration = require('../models/Registration');
const { auth, authorizeRoles } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Protect admin endpoints for company mentors, institution admins, and legacy roles
router.use(auth, authorizeRoles('institution_admin', 'company_mentor', 'admin', 'coordinator'));

// Primary Root Super Admin Emails (Immune to demotion or deactivation)
const ROOT_SUPER_ADMIN_EMAILS = ['mr.sankya@digicampus.edu', 'mr.sankya@campuspulse.edu'];

// Analytics Summary Dashboard Data
router.get('/analytics', async (req, res) => {
  try {
    const totalInternships = await Internship.countDocuments();
    const activeInternships = await Internship.countDocuments({ status: { $in: ['Open', 'Active', 'Ongoing'] } });
    const completedInternships = await Internship.countDocuments({ status: 'Completed' });
    const totalUsers = await User.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    
    // Domain Breakdown
    const categoryStats = await Internship.aggregate([
      { $group: { _id: '$domain', count: { $sum: 1 }, totalSeats: { $sum: '$appliedCount' } } }
    ]);

    // Top internships by applications
    const topEvents = await Internship.find().sort({ appliedCount: -1 }).limit(5);

    res.json({
      totalEvents: totalInternships,
      upcomingEvents: activeInternships,
      completedEvents: completedInternships,
      totalUsers,
      totalRegistrations,
      categoryStats,
      topEvents
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Error loading analytics', error: err.message });
  }
});

// Live QR Scanner Check-in & Task Verification Endpoint
router.post('/scan-qr', async (req, res) => {
  try {
    const { ticketCode, registrationId } = req.body;
    if (!ticketCode && !registrationId) {
      return res.status(400).json({ message: 'Verification Code or Registration ID is required' });
    }

    let query = {};
    if (ticketCode) query.ticketCode = ticketCode.trim();
    if (registrationId) query._id = registrationId.trim();

    const registration = await Registration.findOne(query)
      .populate('userId', 'name email department studentId avatar')
      .populate('internshipId', 'title company domain duration');

    if (!registration) {
      return res.status(404).json({ message: 'Invalid Verification Code! Intern application record not found.' });
    }

    // Mark attendance / task verified
    registration.attendanceStatus = 'Verified';
    registration.progress = Math.min(100, registration.progress + 20);
    registration.hoursLogged += 8;
    if (registration.progress >= 100) {
      registration.status = 'Completed';
      registration.certificateIssued = true;
    }
    await registration.save();

    res.json({
      success: true,
      message: `Verified! ${registration.userId.name}'s task check-in completed.`,
      studentName: registration.userId.name,
      studentEmail: registration.userId.email,
      studentId: registration.userId.studentId,
      department: registration.userId.department,
      avatar: registration.userId.avatar,
      eventTitle: registration.internshipId?.title || 'Internship Task',
      eventDate: registration.createdAt,
      ticketCode: registration.ticketCode,
      attendanceStatus: 'Verified',
      progress: registration.progress
    });
  } catch (err) {
    console.error('Scan QR error:', err);
    res.status(500).json({ message: 'Error scanning verification code', error: err.message });
  }
});

// Get Intern Application Roster for an Internship
router.get('/events/:eventId/participants', async (req, res) => {
  try {
    const { eventId } = req.params;
    const internship = await Internship.findById(eventId);

    const registrations = await Registration.find({
      $or: [{ internshipId: eventId }, { eventId: eventId }]
    })
      .populate('userId', 'name email department studentId avatar role position company')
      .sort({ registeredAt: -1 });

    res.json({
      event: internship,
      participants: registrations
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching intern roster' });
  }
});

// Update Intern Application Status / Verification
router.put('/registrations/:id/attendance', async (req, res) => {
  try {
    const { attendanceStatus, status, progress, mentorFeedback, certificateIssued } = req.body;
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Application record not found' });
    }

    if (attendanceStatus) registration.attendanceStatus = attendanceStatus;
    if (status) registration.status = status;
    if (progress !== undefined) registration.progress = progress;
    if (mentorFeedback) registration.mentorFeedback = mentorFeedback;
    if (certificateIssued !== undefined) {
      registration.certificateIssued = certificateIssued;
      if (certificateIssued && !registration.certificateId) {
        registration.certificateId = `CERT-INT-${Math.floor(100000 + Math.random() * 900000)}`;
      }
    }

    await registration.save();
    res.json(registration);
  } catch (err) {
    res.status(500).json({ message: 'Error updating intern application status' });
  }
});

// List all registered users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role, position, company } = req.body;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (ROOT_SUPER_ADMIN_EMAILS.includes(targetUser.email.toLowerCase())) {
      return res.status(403).json({ message: 'Forbidden: Primary Super Admin account role cannot be modified.' });
    }

    if (role) targetUser.role = role;
    if (position) targetUser.position = position;
    if (company) targetUser.company = company;

    await targetUser.save();
    res.json(targetUser);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user role' });
  }
});

// Toggle User Status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (ROOT_SUPER_ADMIN_EMAILS.includes(targetUser.email.toLowerCase())) {
      return res.status(403).json({ message: 'Forbidden: Primary Super Admin account cannot be deactivated.' });
    }

    targetUser.status = status;
    await targetUser.save();
    res.json(targetUser);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

// GET /api/admin/pending-internships - List student-submitted internships awaiting approval
router.get('/pending-internships', async (req, res) => {
  try {
    const pending = await Internship.find({ approvalStatus: 'Pending' })
      .populate('submittedById', 'name email department studentId avatar')
      .sort({ createdAt: -1 });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending submissions', error: err.message });
  }
});

// PATCH /api/admin/internships/:id/approve - Approve student submission, award +200 XP & Talent Scout Badge
router.post('/internships/:id/approve', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship position not found' });
    }

    internship.approvalStatus = 'Approved';
    internship.status = 'Open';
    await internship.save();

    // Award +200 XP to the submitting student if not awarded yet
    let xpEarned = 0;
    if (internship.submittedById && !internship.xpAwarded) {
      const student = await User.findById(internship.submittedById);
      if (student) {
        xpEarned = 200;
        student.xpPoints = (student.xpPoints || 0) + xpEarned;
        if (!student.badges.includes('🌟 Talent Scout')) {
          student.badges.push('🌟 Talent Scout');
        }
        await student.save();

        // Create In-App Notification for student
        const Notification = require('../models/Notification');
        await Notification.create({
          userId: student._id,
          title: '🌟 Internship Submission Approved (+200 XP)!',
          message: `Your submitted position "${internship.title}" at ${internship.company} was approved by Admin! You earned +200 XP & unlocked the 🌟 Talent Scout badge!`,
          type: 'success',
          link: `/event/${internship._id}`
        });

        // Email Student via Resend
        const { sendNotificationEmail } = require('../utils/emailService');
        sendNotificationEmail({
          email: student.email,
          name: student.name,
          title: '🎉 Submission Approved (+200 XP & Badge Earned)',
          message: `Congratulations! Your submitted internship position "${internship.title}" at ${internship.company} has been approved by the placement office and is now live for all students. +200 XP has been added to your profile!`
        }).catch(e => console.error('Email error:', e.message));
      }

      internship.xpAwarded = true;
      await internship.save();
    }

    res.json({
      message: 'Internship approved and published to student directory!',
      internship,
      xpAwarded: xpEarned
    });
  } catch (err) {
    console.error('Approve internship error:', err);
    res.status(500).json({ message: 'Error approving internship', error: err.message });
  }
});

// POST /api/admin/internships/:id/reject - Reject student submission
router.post('/internships/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship position not found' });
    }

    internship.approvalStatus = 'Rejected';
    await internship.save();

    if (internship.submittedById) {
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: internship.submittedById,
        title: '⚠️ Internship Submission Update',
        message: `Your submission "${internship.title}" was not approved by placement office. ${reason ? `Reason: ${reason}` : ''}`,
        type: 'warning'
      });
    }

    res.json({ message: 'Internship submission rejected', internship });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting internship', error: err.message });
  }
});

module.exports = router;

