const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userAvatar: { type: String },
  mentorName: { type: String, default: 'Company Mentor' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  performanceScore: { type: Number, default: 90 },
  technicalSkillScore: { type: Number, default: 95 },
  punctualityScore: { type: Number, default: 88 },
  comment: { type: String, required: true }
}, { timestamps: true });

feedbackSchema.pre('save', function(next) {
  if (!this.internshipId && this.eventId) {
    this.internshipId = this.eventId;
  }
  if (!this.eventId && this.internshipId) {
    this.eventId = this.internshipId;
  }
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);
