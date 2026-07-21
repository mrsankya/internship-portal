const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendWelcomeEmail, sendLoginNotificationEmail } = require('../utils/emailService');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, role, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const assignedRole = (role === 'company_mentor' || role === 'institution_admin' || role === 'intern' || role === 'organizer' || role === 'student' || role === 'coordinator') ? role : 'intern';

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
      company: company || 'Partner Firm',
      department: department || 'Computer Science & AI'
    });

    await newUser.save();

    // Trigger Resend Emails in background
    sendWelcomeEmail({ email: newUser.email, name: newUser.name, role: newUser.role }).catch(console.error);
    sendLoginNotificationEmail({ email: newUser.email, name: newUser.name }).catch(console.error);

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, name: newUser.name, email: newUser.email },
      process.env.JWT_SECRET || 'campuspulse_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        company: newUser.company,
        department: newUser.department,
        studentId: newUser.studentId,
        avatar: newUser.avatar,
        phone: newUser.phone,
        bio: newUser.bio,
        yearOfStudy: newUser.yearOfStudy,
        github: newUser.github,
        linkedin: newUser.linkedin
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Trigger Resend Login Alert Email in background
    sendLoginNotificationEmail({ email: user.email, name: user.name }).catch(console.error);

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET || 'campuspulse_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        company: user.company,
        department: user.department,
        studentId: user.studentId,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        yearOfStudy: user.yearOfStudy,
        github: user.github,
        linkedin: user.linkedin
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// Google OAuth Login / Signup
router.post('/google', async (req, res) => {
  try {
    const { email, name, avatar, role, department } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Google authentication payload missing email or name' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const salt = await bcrypt.genSalt(10);
      const randomPassword = await bcrypt.hash(`google_${Math.random()}_secret`, salt);

      user = new User({
        name,
        email: email.toLowerCase(),
        password: randomPassword,
        role: role || 'intern',
        department: department || 'Computer Science & AI',
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      });

      await user.save();
    }

    // Trigger Resend Emails
    if (isNewUser) {
      sendWelcomeEmail({ email: user.email, name: user.name, role: user.role }).catch(console.error);
    }
    sendLoginNotificationEmail({ email: user.email, name: user.name }).catch(console.error);

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET || 'campuspulse_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        company: user.company,
        department: user.department,
        studentId: user.studentId,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        yearOfStudy: user.yearOfStudy,
        github: user.github,
        linkedin: user.linkedin
      }
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ message: 'Google login failed', error: err.message });
  }
});

// Get Profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, department, phone, bio, yearOfStudy, avatar, github, linkedin, studentId, company } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (company) user.company = company;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (yearOfStudy) user.yearOfStudy = yearOfStudy;
    if (avatar) user.avatar = avatar;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (studentId) user.studentId = studentId;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});

module.exports = router;
