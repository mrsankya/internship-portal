const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['Urgent', 'General', 'Venue Update', 'Registration'], default: 'General' },
  authorName: { type: String, default: 'DiGi Campus Admin' },
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
