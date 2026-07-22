# DiGi Internship - Verification, Monitoring & Analytics Platform - Project Memory

## Project Overview
- **Project Name:** DiGi Internship (Verification, Monitoring & Analytics Platform)
- **Location:** `C:\Users\sanke\internship portal`
- **Cloudflare Pages Production URL:** `https://digi-internship-hub.pages.dev`
- **Render Production Backend API:** `https://internship-portal-it90.onrender.com/api`
- **Native Android Package:** [DiGi_Internship.apk](file:///C:/Users/sanke/internship%20portal/DiGi_Internship.apk) (5.38 MB)
- **Isolated MongoDB Database:** `digi_internship_db` (Separated from old `campuspulse` database)
- **Architecture:** Node.js Express Backend (`/backend`), React + TypeScript + Vite Frontend (`/frontend`), Capacitor Android Native Wrapper (`/frontend/android`), MongoDB Atlas

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
4. **Capacitor Native Android Build**:
   - Package Name: `com.digicampus.internship`
   - App Display Name: **DiGi Internship**
   - Configured with Android Studio JBR Java 17 & Android SDK.
   - Generates executable debug APK directly to root: `DiGi_Internship.apk`.

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
4. **App-Like Mobile Navigation & Header Optimization**:
   - **Clean Top Header**: Logo + Dark/Light Theme Toggle + Notification Bell + User Profile Avatar / Login. Zero off-screen clipping on phone displays.
   - **Fixed Bottom Navigation Bar**: 5 mobile tabs (**Internships, Explore, Dashboard, Ranks, Profile/Admin**) fixed at bottom on mobile/tablet viewports ([Navbar.tsx](file:///C:/Users/sanke/internship%20portal/frontend/src/components/Navbar.tsx)).
   - **Shifted Floating AI Button**: Shifted up to `bottom-20` on mobile to float cleanly above the bottom navbar without overlaying buttons ([DiGiBotModal.tsx](file:///C:/Users/sanke/internship%20portal/frontend/src/components/DiGiBotModal.tsx)).
5. **AI Resume & Skill Compatibility Matcher**:
   - Backend endpoint `POST /api/internships/:id/resume-match` calculates `matchPercentage`, `matchingSkills`, `missingSkills`, `readinessLevel`, and `aiRecommendations`.
   - Modal component [ResumeMatcherModal.tsx](file:///C:/Users/sanke/internship%20portal/frontend/src/components/ResumeMatcherModal.tsx) featuring interactive skill chips, custom skill adder, resume text input, animated SVG ring progress gauge (Green/Indigo/Amber), matched vs missing skill breakdown, and step-by-step actionable AI recommendations.
6. **Academic & Performance PDF Report Generator**:
   - [pdfReportGenerator.ts](file:///C:/Users/sanke/internship%20portal/frontend/src/utils/pdfReportGenerator.ts): High-resolution institutional PDF summary generator using `jspdf`. Includes institution header & seal, verification code (`REPORT-INT-XXXXXX`), student & internship profile info, progress & attendance metrics, quiz evaluation table, video watch progress, mentor score & qualitative feedback, and digital signature line.
   - [PDFReportModal.tsx](file:///C:/Users/sanke/internship%20portal/frontend/src/components/PDFReportModal.tsx): Interactive modal component to preview all academic metrics and download/open official PDF reports.
7. **Task & Check-In Verification**:
   - QR Code Check-In for intern daily/weekly task verification.
   - Live camera QR scanner modal with audio chime and instant verification status.
8. **Interactive Skill Assessment Quizzes**:
   - Quizzes attached per internship/module with countdown timer, question step indicators, and instant score evaluation.
   - Automatic XP rewards (+150 XP for passing), level-up progression, and unlockable badges (`🎯 Quiz Perfectionist`, `🧠 Knowledge Master`).
9. **Video Tutorials & Lesson Integrations**:
   - Dedicated "Video Lessons" tab in internship details page.
   - YouTube iframe embed parser, Vimeo, and direct MP4 playback support with custom thumbnail and duration badges.
   - Interactive "Mark as Watched (+50 XP)" button with playlist watch progress bar.
10. **Digital Certificates**:
    - Repurposed participation certificates into Verified Internship Completion Certificates with digital mentor signature, institutional seal, and QR verification code (`CERT-INT-XXXXXX`).

## Next Steps / Proposed Future Upgrades
1. **🎙️ AI Mock Technical Interview Simulator**: 3-question WebRTC/audio interview with AI scoring on technical accuracy & keyword coverage.
2. **🐙 GitHub & Code Activity Tracker**: Automatic commit & pull request verification for tech internships.
3. **📍 GPS Geofenced On-Site Attendance Check-In**: Verify physical presence within ~100m radius of office buildings for hybrid/on-site check-ins.
4. **🗺️ Personalised Skill-Gap Learning Pathways**: Auto-convert missing skills from Resume Matcher into 4-week learning roadmaps.
5. **💼 Corporate Recruiter & Placement Portal**: Allow corporate HR recruiters to browse verified top interns on the XP Leaderboard and send direct interview invites.
