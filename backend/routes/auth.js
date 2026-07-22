const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendWelcomeEmail, sendLoginNotificationEmail, sendOTPEmail } = require('../utils/emailService');

// Helper to generate 6-digit numeric OTP code
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, role, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() }).select('+otpCode +otpExpiresAt');
    
    // If user exists and is already verified, reject registration
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const assignedRole = (role === 'company_mentor' || role === 'institution_admin' || role === 'intern' || role === 'organizer' || role === 'student' || role === 'coordinator') ? role : 'intern';

    let userToSave = existingUser;
    if (!userToSave) {
      userToSave = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: assignedRole,
        company: company || 'Partner Firm',
        department: department || 'Computer Science & AI',
        isVerified: false,
        otpCode: otp,
        otpExpiresAt: otpExpires
      });
    } else {
      // Re-registering unverified user: update credentials and send fresh OTP
      userToSave.name = name;
      userToSave.password = hashedPassword;
      userToSave.otpCode = otp;
      userToSave.otpExpiresAt = otpExpires;
    }

    await userToSave.save();

    // Send Verification OTP Email via Resend
    sendOTPEmail({ email: userToSave.email, name: userToSave.name, otpCode: otp }).catch(console.error);

    res.status(201).json({
      requiresVerification: true,
      email: userToSave.email,
      message: '🎉 Registration initiated! A 6-digit verification OTP has been sent to your email.'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
});

// Verify Email OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ message: 'Email and 6-digit OTP code are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otpCode +otpExpiresAt');

    if (!user) {
      return res.status(404).json({ message: 'Account not found. Please register first.' });
    }

    if (user.isVerified) {
      // Already verified
      const token = jwt.sign(
        { id: user._id, role: user.role, name: user.name, email: user.email },
        process.env.JWT_SECRET || 'campuspulse_super_secret_jwt_key_2026',
        { expiresIn: '7d' }
      );
      return res.json({ message: 'Account already verified', token, user });
    }

    // Validate OTP Code and Expiry
    if (!user.otpCode || user.otpCode !== otpCode.trim()) {
      return res.status(400).json({ message: 'Invalid OTP code! Please check your email inbox and try again.' });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP code has expired! Please click Resend OTP for a fresh code.' });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Send Welcome Email & Security Alert via Resend
    sendWelcomeEmail({ email: user.email, name: user.name, role: user.role }).catch(console.error);
    sendLoginNotificationEmail({ email: user.email, name: user.name }).catch(console.error);

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET || 'campuspulse_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Email Verified Successfully! Welcome to DiGi Campus.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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
    console.error('Verify OTP Error:', err);
    res.status(500).json({ message: 'Error verifying OTP code', error: err.message });
  }
});

// Resend OTP Code
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otpCode +otpExpiresAt');

    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This email is already verified. You can log in directly.' });
    }

    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    sendOTPEmail({ email: user.email, name: user.name, otpCode: otp }).catch(console.error);

    res.json({ message: '✉️ Fresh 6-digit OTP code sent to your email inbox!' });
  } catch (err) {
    console.error('Resend OTP Error:', err);
    res.status(500).json({ message: 'Error resending OTP', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +otpCode +otpExpiresAt');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is verified
    if (user.isVerified === false) {
      // Send fresh OTP email
      const otp = generateOTP();
      user.otpCode = otp;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      sendOTPEmail({ email: user.email, name: user.name, otpCode: otp }).catch(console.error);

      return res.status(403).json({
        requiresVerification: true,
        email: user.email,
        message: '⚠️ Email not verified! A 6-digit verification OTP code has been sent to your email.'
      });
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

// Google OAuth Login / Signup (Google accounts pre-verified)
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
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        isVerified: true // Google OAuth pre-verifies email
      });

      await user.save();
    } else if (!user.isVerified) {
      user.isVerified = true;
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
