const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['intern', 'company_mentor', 'institution_admin', 'student', 'coordinator', 'admin', 'organizer'], 
    default: 'intern' 
  },
  position: { type: String, default: 'Intern Trainee' },
  department: { type: String, default: 'Computer Science & Engineering' },
  studentId: { type: String },
  company: { type: String, default: 'TechCorp Solutions' },
  designation: { type: String, default: 'Senior Mentor' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  yearOfStudy: { type: String, default: '3rd Year' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  status: { type: String, enum: ['active', 'deactivated'], default: 'active' },
  xpPoints: { type: Number, default: 250 },
  level: { type: Number, default: 1 },
  badges: [{ type: String }],
  savedInternships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }]
}, { timestamps: true });

userSchema.pre('save', function(next) {
  if (!this.studentId) {
    this.studentId = `INT-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  // Auto calculate level based on XP
  if (this.xpPoints < 300) this.level = 1;
  else if (this.xpPoints < 700) this.level = 2;
  else if (this.xpPoints < 1500) this.level = 3;
  else if (this.xpPoints < 3000) this.level = 4;
  else this.level = 5;

  next();
});

module.exports = mongoose.model('User', userSchema);
