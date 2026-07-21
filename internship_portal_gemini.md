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
   - API Key: Configured securely via `RESEND_API_KEY` in `backend/.env` (environment variable only).
   - Automatic Welcome Emails on Registration / Google Sign-Up.
   - Login Security Alert Emails on Sign-In.
   - Broadcast Notification Emails when new Internship positions are posted.
3. **Google OAuth Authentication**:
   - Google Client ID configured: `269277017328-2arusrutp62kd4trujdgrmlse07mhs0c.apps.googleusercontent.com`
   - One-tap Google Sign-In with automatic role assignment and Resend welcome emails.
4. **Rate Limiting Protection**:
   - Global rate limiter: 200 requests / 15 minutes.
   - Auth rate limiter: 30 login/register/Google attempts / 15 minutes.

## Key Capabilities & Features
1. **Internship Directory & Application**:
   - Filter internships by domain (Web Dev, AI/ML, Cloud, Data Science, Cyber Security, etc.), work type (Remote, On-site, Hybrid), and duration.
   - Live progress bars showing overall internship completion %, total hours logged, and milestones achieved.
2. **Task & Check-In Verification**:
   - QR Code Check-In for intern daily/weekly task verification.
   - Live camera QR scanner modal with audio chime and instant verification status.
3. **Progress Reporting & Mentor Feedback**:
   - Intern submit progress reports (hours logged, tasks completed, proof/link).
   - Mentors review, score (0-100), and leave qualitative feedback.
4. **Institution Analytics & Monitoring**:
   - Interactive domain distribution charts, overall completion rate %, average performance scores, active vs completed internships.
   - One-click CSV/Excel report generation for institutional audits and accreditation.
5. **Performance Dashboard & Badges**:
   - XP Leaderboard & Level progression for interns.
   - Unlockable skill badges (e.g. Top Performer, Fast Learner, Verified Contributor, 100% Attendance).
6. **Digital Certificates**:
   - Repurposed participation certificates into Verified Internship Completion Certificates with digital mentor signature, institutional seal, and QR verification code (`CERT-INT-XXXXXX`).
7. **DiGi Bot AI Assistant**:
   - AI assistant supporting internship progress tracking queries, mentor feedback summaries, and completion requirements.
