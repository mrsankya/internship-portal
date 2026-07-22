const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Null for broadcast to all users
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'quiz', 'video', 'application', 'certificate', 'announcement'], 
    default: 'info' 
  },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For broadcast notifications
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
