const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const Internship = require('../models/Internship');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');
const { sendQuizResultEmail } = require('../utils/emailService');

// Get quizzes (optionally filter by internshipId)
router.get('/', async (req, res) => {
  try {
    const { internshipId } = req.query;
    const query = {};
    if (internshipId) query.internshipId = internshipId;

    const quizzes = await Quiz.find(query)
      .populate('internshipId', 'title company domain')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quizzes', error: err.message });
  }
});

// Get user's past quiz attempts
router.get('/attempts/my', authMiddleware, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user.id })
      .populate('quizId', 'title moduleName durationMinutes passingScore')
      .populate('internshipId', 'title company')
      .sort({ completedAt: -1 });

    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quiz attempts', error: err.message });
  }
});

// Get single quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('internshipId', 'title company');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching quiz details', error: err.message });
  }
});

// Create a new quiz (Admins & Mentors)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { internshipId, title, description, moduleName, durationMinutes, passingScore, xpReward, questions } = req.body;

    if (!internshipId || !title || !questions || !questions.length) {
      return res.status(400).json({ message: 'Internship ID, title, and at least 1 question are required' });
    }

    const newQuiz = await Quiz.create({
      internshipId,
      title,
      description: description || '',
      moduleName: moduleName || 'General Assessment',
      durationMinutes: durationMinutes || 15,
      passingScore: passingScore || 70,
      xpReward: xpReward || 100,
      questions,
      createdById: req.user.id
    });

    // Notify registered interns about new quiz
    const internship = await Internship.findById(internshipId);
    if (internship) {
      await Notification.create({
        userId: null,
        title: `📝 New Quiz Added: ${title}`,
        message: `A new assessment "${title}" has been posted for ${internship.title}. Test your knowledge and earn +${newQuiz.xpReward} XP!`,
        type: 'quiz',
        link: `/event/${internshipId}`
      });
    }

    res.status(201).json(newQuiz);
  } catch (err) {
    res.status(500).json({ message: 'Error creating quiz', error: err.message });
  }
});

// Submit quiz answers and evaluate
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body; // Array of { questionIndex, selectedOption }
    const quiz = await Quiz.findById(req.params.id).populate('internshipId', 'title company');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let correctCount = 0;
    const evaluatedAnswers = quiz.questions.map((q, index) => {
      const userAns = (answers || []).find(a => a.questionIndex === index);
      const selected = userAns ? userAns.selectedOption : -1;
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionIndex: index,
        selectedOption: selected,
        isCorrect,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || ''
      };
    });

    const maxScore = quiz.questions.length;
    const score = correctCount;
    const percentage = Math.round((score / maxScore) * 100);
    const passed = percentage >= (quiz.passingScore || 70);
    const xpEarned = passed ? quiz.xpReward : 10; // 10 XP consolation for participating

    // Save Quiz Attempt
    const attempt = await QuizAttempt.create({
      quizId: quiz._id,
      userId: req.user.id,
      internshipId: quiz.internshipId._id,
      score,
      maxScore,
      percentage,
      passed,
      answers: evaluatedAnswers,
      xpEarned
    });

    // Update User XP & Level
    const user = await User.findById(req.user.id);
    if (user) {
      user.xpPoints = (user.xpPoints || 0) + xpEarned;
      
      // Auto-unlock badge if passed with 100%
      if (passed && percentage === 100 && !user.badges.includes('🎯 Quiz Perfectionist')) {
        user.badges.push('🎯 Quiz Perfectionist');
      } else if (passed && !user.badges.includes('🧠 Knowledge Master')) {
        user.badges.push('🧠 Knowledge Master');
      }

      await user.save();

      // Send Email Notification via Resend
      sendQuizResultEmail({
        email: user.email,
        name: user.name,
        quizTitle: quiz.title,
        internshipTitle: quiz.internshipId.title,
        score,
        maxScore,
        percentage,
        passed,
        xpEarned
      }).catch(e => console.error('Quiz email error:', e.message));

      // Create In-App Notification
      await Notification.create({
        userId: user._id,
        title: `${passed ? '🏆 Quiz Passed' : '📝 Quiz Completed'}: ${quiz.title}`,
        message: `You scored ${percentage}% (${score}/${maxScore}) on "${quiz.title}". Earned +${xpEarned} XP!`,
        type: 'quiz',
        link: `/event/${quiz.internshipId._id}`
      });
    }

    res.json({
      attemptId: attempt._id,
      score,
      maxScore,
      percentage,
      passed,
      passingScore: quiz.passingScore,
      xpEarned,
      evaluatedAnswers
    });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting quiz', error: err.message });
  }
});

// Delete quiz (Admins & Mentors)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    await QuizAttempt.deleteMany({ quizId: req.params.id });
    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting quiz', error: err.message });
  }
});

module.exports = router;
