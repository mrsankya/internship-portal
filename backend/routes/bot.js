const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const Announcement = require('../models/Announcement');

// AI DiGi Bot Internship & Verification Assistant Endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message prompt is required' });
    }

    const query = message.toLowerCase();

    // Fetch live internships & announcements context
    const internships = await Internship.find().sort({ createdAt: -1 }).limit(10);
    const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(5);

    let reply = "";

    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      reply = "👋 Hello! I am **DiGi Bot**, your AI Internship & Verification Assistant! I can help you track your internship progress, review mentor feedback, check completion status, download certificates, or explore open internship roles. What can I assist you with today?";
    } 
    else if (query.includes('progress') || query.includes('track') || query.includes('hours') || query.includes('status')) {
      reply = "📊 **Internship Progress Tracking**:\n\n1. Go to **Intern Dashboard**.\n2. View your live progress bar (0 - 100%) and logged work hours.\n3. Submit your weekly task report or scan your mentor verification QR code.\n4. Complete all milestones to reach 100% and unlock your Verified Certificate!";
    }
    else if (query.includes('feedback') || query.includes('mentor') || query.includes('rating') || query.includes('review')) {
      reply = "📝 **Mentor Feedback Summaries**:\n\n• Company mentors evaluate interns on performance score, technical skills, and punctuality.\n• Feedback is updated after weekly task verification check-ins.\n• Check your **Intern Dashboard** to read comments left by your mentor!";
    }
    else if (query.includes('certificate') || query.includes('verify') || query.includes('seal') || query.includes('completion')) {
      reply = "📜 **Internship Completion Certificate**:\n\n• Required: 100% completion rate + verified mentor sign-off.\n• Contains: Official institutional seal, digital mentor signature, and unique QR verification code.\n• Downloadable as printable PDF from your dashboard upon completion!";
    }
    else if (query.includes('web') || query.includes('ai') || query.includes('cloud') || query.includes('data') || query.includes('role') || query.includes('internship')) {
      const matched = internships.filter(i => 
        i.title.toLowerCase().includes(query) || 
        i.domain.toLowerCase().includes(query) || 
        i.company.toLowerCase().includes(query)
      );

      if (matched.length > 0) {
        reply = `💼 Here are active **Internships** matching your query:\n\n` +
          matched.map(i => `• **${i.title}** at *${i.company}* (${i.domain}) - Stipend: ${i.stipend}`).join('\n') +
          `\n\nClick on any internship card to view full requirements and submit your application!`;
      } else {
        reply = "💼 Active internship positions are available in Web Development, AI/ML, Cloud Computing, Data Science, and UI/UX. Check out the Internships tab!";
      }
    }
    else if (query.includes('analytics') || query.includes('institution') || query.includes('report') || query.includes('csv')) {
      reply = "📈 **Institution Analytics & Export**:\n\n• Institution Admins can access real-time charts showing domain distribution, completion rates, and active vs completed numbers.\n• Full CSV/Excel audit reports can be exported in 1 click from the **Analytics Dashboard**.";
    }
    else {
      reply = `✨ Here are featured active internships currently open for applications:\n\n` +
        internships.slice(0, 4).map(i => `• **${i.title}** (${i.company}) - ${i.domain} [${i.workType}]`).join('\n') +
        `\n\nAsk me about progress tracking, mentor feedback, or completion certificates!`;
    }

    res.json({ reply, timestamp: new Date() });
  } catch (err) {
    console.error('DiGi Bot error:', err);
    res.status(500).json({ message: 'DiGi Bot service unavailable', error: err.message });
  }
});

module.exports = router;
