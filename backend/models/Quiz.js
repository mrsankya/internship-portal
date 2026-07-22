const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index 0-3
  explanation: { type: String, default: '' }
});

const quizSchema = new mongoose.Schema({
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  moduleName: { type: String, default: 'General Assessment' },
  durationMinutes: { type: Number, default: 15 },
  passingScore: { type: Number, default: 70 }, // Percentage
  xpReward: { type: Number, default: 100 },
  questions: [questionSchema],
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
