const mongoose = require('mongoose');

const videoLessonSchema = new mongoose.Schema({
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, required: true }, // YouTube, Vimeo, or direct MP4 URL
  thumbnail: { type: String, default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600' },
  duration: { type: String, default: '10:00' },
  moduleName: { type: String, default: 'Module 1: Orientation' },
  order: { type: Number, default: 1 },
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('VideoLesson', videoLessonSchema);
