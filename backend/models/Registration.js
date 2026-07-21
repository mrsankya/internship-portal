const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  taskSummary: { type: String, required: true },
  verifiedBy: { type: String, default: 'Company Mentor' },
  qrToken: { type: String },
  status: { type: String, enum: ['Verified', 'Pending'], default: 'Verified' }
});

const progressReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  hoursLogged: { type: Number, default: 8 },
  submissionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Approved', 'Revision Required'], default: 'Pending' },
  mentorFeedback: { type: String, default: '' },
  score: { type: Number, default: 90 }
});

const registrationSchema = new mongoose.Schema({
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }, // legacy compatibility
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketCode: { type: String, required: true },
  qrCodeUrl: { type: String },
  status: { type: String, enum: ['Applied', 'Accepted', 'Ongoing', 'Completed', 'Rejected', 'registered', 'attended'], default: 'Applied' },
  progress: { type: Number, default: 35 },
  hoursLogged: { type: Number, default: 45 },
  checkIns: [checkInSchema],
  progressReports: [progressReportSchema],
  attendanceStatus: { type: String, enum: ['Pending', 'Verified', 'Present', 'Absent'], default: 'Pending' },
  certificateIssued: { type: Boolean, default: false },
  certificateId: { type: String },
  mentorRating: { type: Number, default: 5 },
  mentorFeedback: { type: String, default: '' },
  registeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

registrationSchema.pre('save', function(next) {
  if (!this.internshipId && this.eventId) {
    this.internshipId = this.eventId;
  }
  if (!this.eventId && this.internshipId) {
    this.eventId = this.internshipId;
  }
  next();
});

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;
