require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const internshipRoutes = require('./routes/internships');
const registrationRoutes = require('./routes/registrations');
const adminRoutes = require('./routes/admin');
const announcementRoutes = require('./routes/announcements');
const feedbackRoutes = require('./routes/feedback');
const botRoutes = require('./routes/bot');
const notificationRoutes = require('./routes/notifications');
const quizRoutes = require('./routes/quizzes');
const videoRoutes = require('./routes/videos');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate Limiting Security
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again in 15 minutes' }
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/google', authLimiter);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI && !MONGODB_URI.includes('<db_password>')) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB Atlas Database');
    })
    .catch((err) => {
      console.error('❌ MongoDB Connection Error:', err.message);
    });
} else {
  console.log('⚠️ MONGODB_URI contains placeholder <db_password>. Operating in memory seed mode.');
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DiGi Campus Internship Verification, Monitoring & Analytics Platform',
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/events', internshipRoutes); // Legacy alias for backward compatibility
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/videos', videoRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 DiGi Campus Internship Platform Backend running on http://localhost:${PORT}`);
});
