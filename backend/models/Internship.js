const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  week: Number,
  title: String,
  description: String,
  deliverable: String,
  status: { type: String, enum: ['Pending', 'In Progress', 'Verified', 'Completed'], default: 'Pending' }
});

const mentorSchema = new mongoose.Schema({
  name: String,
  role: String,
  company: String,
  email: String,
  avatar: String
});

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  companyLogo: { type: String, default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200' },
  description: { type: String, required: true },
  domain: { 
    type: String, 
    required: true, 
    enum: ['Web Development', 'AI & Machine Learning', 'Data Science', 'Cloud & DevOps', 'Cyber Security', 'UI/UX Design', 'Embedded & IoT', 'Software Engineering', 'Business Analytics'] 
  },
  location: { type: String, required: true, default: 'Remote / Online' },
  workType: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], default: 'Remote' },
  duration: { type: String, default: '3 Months' },
  stipend: { type: String, default: '₹15,000 / month' },
  skillsRequired: [{ type: String }],
  totalPositions: { type: Number, default: 10 },
  appliedCount: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  deadline: { type: Date },
  status: { type: String, enum: ['Open', 'Active', 'Ongoing', 'Completed', 'Closed'], default: 'Open' },
  isFeatured: { type: Boolean, default: false },
  milestones: [milestoneSchema],
  mentors: [mentorSchema],
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalStatus: { type: String, enum: ['Approved', 'Pending', 'Rejected'], default: 'Approved' },
  flierUrl: { type: String, default: '' },
  rawTextSource: { type: String, default: '' },
  xpAwarded: { type: Boolean, default: false },
  // Backward compatibility fields for legacy views
  category: { type: String, default: 'Tech' },
  venue: { type: String, default: 'Virtual Workplace' },
  organizer: { type: String, default: 'Company Partner' },
  department: { type: String, default: 'Computer Science' },
  image: { type: String, default: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800' },
  capacity: { type: Number, default: 20 },
  registeredCount: { type: Number, default: 0 }
}, { timestamps: true });

const Internship = mongoose.model('Internship', internshipSchema);
module.exports = Internship;
