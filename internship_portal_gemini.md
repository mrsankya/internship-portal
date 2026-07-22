# DiGi Campus - Internship Verification, Monitoring & Analytics Platform - Project Memory

## Project Overview
- **Project Name:** DiGi Campus Internship Hub (Internship Verification, Monitoring & Analytics Platform)
- **Location:** `C:\Users\sanke\internship portal`
- **Cloudflare Pages Production URL:** `https://digi-internship-hub.pages.dev`
- **Isolated MongoDB Database:** `digi_internship_db` (Separated from old `campuspulse` database)
- **Architecture:** Node.js Express Backend (`/backend`), React + TypeScript + Vite Frontend (`/frontend`), MongoDB Atlas

## Roles & Terms Mapping
1. **Student** → **Intern**
2. **Event Coordinator / Organizer** → **Company Mentor**
3. **Super Admin / Admin** → **Institution Admin**
4. **Events** → **Internships**

## Integrated Services
1. **Isolated Database**:
   - Separate MongoDB database: `digi_internship_db`
   - Dedicated JWT Secret: `digi_internship_hub_super_secret_jwt_key_2026`
2. **Resend Email Service Platform**:
   - API Key: Configured securely via `RESEND_API_KEY` in `backend/.env`.
   - **6-Digit Email Verification OTPs** (Dispatched on Registration & Unverified Logins).
   - Automatic Welcome Emails on Registration / Google Sign-Up.
   - Login Security Alert Emails on Sign-In.
   - Broadcast Notification Emails when new Internship positions are posted.
   - **Interactive Quiz Result Email Receipts** with percentage, pass/fail status, and XP badges.
   - **Application Status Update Email Notifications** when intern applications are accepted/approved/reviewed.
   - **Custom Admin & Mentor Notification Email Dispatcher** for direct communications.
3. **Google OAuth Authentication**:
   - Google Client ID: `1017306337957-vlfdit0hq2v1hf6vca825m8t00v7rcs7.apps.googleusercontent.com`
   - Render Backend API: `https://internship-portal-it90.onrender.com/api`
   - One-tap Google Sign-In with automatic role assignment and Resend welcome emails (pre-verified).
4. **Rate Limiting Protection**:
   - Global rate limiter: 200 requests / 15 minutes.
   - Auth rate limiter: 30 login/register/Google attempts / 15 minutes.

## Key Capabilities & Features
1. **Anti-Fake Email 6-Digit OTP Verification**:
   - Protects the portal from fake/disposable email signups (`POST /api/auth/register`, `/verify-otp`, `/resend-otp`).
   - Generates a secure 6-digit numeric OTP code with 10-minute expiry.
   - Dispatches a branded HTML email via Resend.
   - Interactive 6-digit auto-advancing OTP Modal ([OTPModal.tsx](file:///C:/Users/sanke/internship%20portal/frontend/src/components/OTPModal.tsx)) blocks unverified accounts from logging in.
2. **AI Flier & WhatsApp Internship Importer**:
   - Post/Upload flier images or paste raw WhatsApp/Telegram messages (`POST /api/internships/parse-ai`).
   - Intelligent NLP pattern extractor automatically identifies Job Title, Company, Domain, Work Mode, Stipend, Duration, Required Tech Stack, and Location.
   - Auto-fills the submission form for review before publishing ([SubmitInternshipModal.tsx](file:///C:/Users/sanke/internship%20portal/frontend/src/components/SubmitInternshipModal.tsx)).
3. **Student Community Submissions & Admin Approval Queue**:
   - Students can submit external internship opportunities found on social media or WhatsApp.
   - Submissions are queued for Admin verification (`approvalStatus: 'Pending'`).
   - **Reward System**: Upon Admin approval, the submitting student is awarded **+200 XP**, unlocks the `🌟 Talent Scout` badge, receives a Resend confirmation email, and is featured on the Campus Leaderboard!
   - Admins manage pending submissions via the "Pending Student Submissions" queue in [AdminDashboardPage.tsx](file:///C:/Users/sanke/internship%20portal/frontend/src/pages/AdminDashboardPage.tsx).
4. **Internship Directory & Application**:
   - Filter internships by domain (Web Dev, AI/ML, Cloud, Data Science, Cyber Security, etc.), work type (Remote, On-site, Hybrid), and duration.
   - Live progress bars showing overall internship completion %, total hours logged, and milestones achieved.
5. **Task & Check-In Verification**:
   - QR Code Check-In for intern daily/weekly task verification.
   - Live camera QR scanner modal with audio chime and instant verification status.
6. **Progress Reporting & Mentor Feedback**:
   - Intern submit progress reports (hours logged, tasks completed, proof/link).
   - Mentors review, score (0-100), and leave qualitative feedback.
7. **Email & In-App Notification System**:
   - Real-time Bell icon notification drawer in Navbar with unread badge counter.
   - Filters for All / Unread, Mark Read, and Clear Read notifications.
   - Real-time notifications for quiz achievements, video completions, application status changes, certificates, and announcements.
8. **Interactive Skill Assessment Quizzes**:
   - Quizzes attached per internship/module with countdown timer, question step indicators, and instant score evaluation.
   - Automatic XP rewards (+150 XP for passing), level-up progression, and unlockable badges (`🎯 Quiz Perfectionist`, `🧠 Knowledge Master`).
   - Detailed question-by-question explanations during post-quiz review.
   - Mentor/Admin Quiz Builder modal with question creator, custom passing score %, duration, and XP rewards.
9. **Video Tutorials & Lesson Integrations**:
   - Dedicated "Video Lessons" tab in internship details page.
   - YouTube iframe embed parser, Vimeo, and direct MP4 playback support with custom thumbnail and duration badges.
   - Fullscreen video modal with lesson playlist sidebar and watch status.
   - Interactive "Mark as Watched (+50 XP)" button with playlist watch progress bar.
   - Mentor/Admin Video Builder modal to attach video lectures to internships.
10. **Institution Analytics & Monitoring**:
    - Interactive domain distribution charts, overall completion rate %, average performance scores, active vs completed internships.
    - One-click CSV/Excel report generation for institutional audits and accreditation.
11. **Performance Dashboard & Badges**:
    - XP Leaderboard & Level progression for interns.
    - Unlockable skill badges (e.g. Top Performer, Fast Learner, Verified Contributor, 🎬 Video Mastery, 🎯 Quiz Perfectionist, 🌟 Talent Scout).
12. **Digital Certificates**:
    - Repurposed participation certificates into Verified Internship Completion Certificates with digital mentor signature, institutional seal, and QR verification code (`CERT-INT-XXXXXX`).
13. **DiGi Bot AI Assistant**:
    - AI assistant supporting internship progress tracking queries, mentor feedback summaries, and completion requirements.
14. **AI Resume & Skill Compatibility Matcher**:
    - Backend endpoint `POST /api/internships/:id/resume-match` calculates `matchPercentage`, `matchingSkills`, `missingSkills`, `readinessLevel`, and `aiRecommendations`.
    - Modal component `ResumeMatcherModal.tsx` (`frontend/src/components/ResumeMatcherModal.tsx`) featuring interactive skill chips, custom skill adder, resume text input, animated SVG ring progress gauge (Green/Indigo/Amber), matched vs missing skill breakdown, and step-by-step actionable AI recommendations.
15. **Academic & Performance PDF Report Generator**:
    - `frontend/src/utils/pdfReportGenerator.ts`: High-resolution institutional PDF summary generator using `jspdf`. Includes institution header & seal, verification code (`REPORT-INT-XXXXXX`), student & internship profile info, progress & attendance metrics, quiz evaluation table, video watch progress, mentor score & qualitative feedback, and digital signature line.
    - `frontend/src/components/PDFReportModal.tsx`: Interactive modal component to preview all academic metrics and download/open official PDF reports.
