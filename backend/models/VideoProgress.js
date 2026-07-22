const mongoose = require('mongoose');

const videoProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoLessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoLesson', required: true },
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  watchedPercentage: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { timestamps: true });

videoProgressSchema.index({ userId: 1, videoLessonId: 1 }, { unique: true });

module.exports = mongoose.model('VideoProgress', videoProgressSchema);
