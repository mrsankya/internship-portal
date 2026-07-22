const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;
const resend = new Resend(apiKey);
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

/**
 * Send Welcome Email on Registration / First Login
 */
async function sendWelcomeEmail({ email, name, role }) {
  try {
    if (!email) return;
    const formattedRole = role === 'company_mentor' ? 'Company Mentor' : role === 'institution_admin' ? 'Institution Admin' : 'Verified Intern';

    const data = await resend.emails.send({
      from: `DiGi Campus Internship Hub <${FROM_EMAIL}>`,
      to: [email],
      subject: `🎉 Welcome to DiGi Campus Internship Hub, ${name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6fb; padding: 30px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #2563eb; font-size: 24px; margin: 0;">💼 DiGi Campus Internship Hub</h1>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Verification, Monitoring & Analytics Platform</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <h2 style="color: #0f172a; font-size: 18px;">Welcome, ${name}! 👋</h2>
            <p style="line-height: 1.6; color: #334155;">
              Your account has been successfully created with the role of <strong>${formattedRole}</strong>.
            </p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #cbd5e1; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #1e293b;">⚡ What you can do next:</p>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569;">
                <li>Explore open internship positions across Web Dev, AI/ML, and Cyber Security</li>
                <li>Track live completion progress bars and log practical work hours</li>
                <li>Scan QR codes for task verification check-ins</li>
                <li>Earn official institutional completion certificates</li>
              </ul>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://digi-internship-hub.pages.dev" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Access Internship Hub</a>
            </div>
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px;">
              DiGi Campus • School of Engineering & Placement Office
            </p>
          </div>
        </div>
      `
    });

    console.log(`✉️ Welcome email sent successfully to ${email} (ID: ${data.id})`);
    return data;
  } catch (err) {
    console.error('❌ Resend Welcome Email Error:', err.message);
  }
}

/**
 * Send Security Notification Email on Login
 */
async function sendLoginNotificationEmail({ email, name }) {
  try {
    if (!email) return;
    const loginTime = new Date().toLocaleString();

    const data = await resend.emails.send({
      from: `DiGi Campus Security <${FROM_EMAIL}>`,
      to: [email],
      subject: `🔒 Security Alert: New Login to DiGi Campus`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6fb; padding: 30px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; font-size: 18px;">Hello, ${name} 👋</h2>
            <p style="line-height: 1.6; color: #334155;">
              We noticed a new successful sign-in to your <strong>DiGi Campus Internship Hub</strong> account.
            </p>
            <div style="background-color: #eff6ff; padding: 15px; border-radius: 12px; border: 1px solid #bfdbfe; margin: 20px 0; font-size: 13px;">
              <p style="margin: 0 0 6px 0;"><strong>Timestamp:</strong> ${loginTime}</p>
              <p style="margin: 0;"><strong>Account Email:</strong> ${email}</p>
            </div>
            <p style="font-size: 12px; color: #64748b;">
              If this was you, no action is required. If you did not log in, please reset your password immediately.
            </p>
          </div>
        </div>
      `
    });

    console.log(`✉️ Login notification email sent to ${email}`);
    return data;
  } catch (err) {
    console.error('❌ Resend Login Email Error:', err.message);
  }
}

/**
 * Send New Internship / Event Notification Email
 */
async function sendNewInternshipNotificationEmail({ email, name, internshipTitle, company, domain, stipend, workType }) {
  try {
    if (!email) return;

    const data = await resend.emails.send({
      from: `DiGi Campus Opportunities <${FROM_EMAIL}>`,
      to: [email],
      subject: `💼 New Internship Opportunity: ${internshipTitle} at ${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6fb; padding: 30px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="background-color: #dcfce7; color: #166534; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;">New Internship Posted</span>
            </div>
            <h2 style="color: #0f172a; font-size: 20px; margin-top: 10px;">${internshipTitle}</h2>
            <p style="color: #2563eb; font-weight: bold; font-size: 14px;">Company: ${company}</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0; font-size: 13px;">
              <p style="margin: 0 0 8px 0;"><strong>Domain:</strong> ${domain}</p>
              <p style="margin: 0 0 8px 0;"><strong>Work Mode:</strong> ${workType || 'Remote'}</p>
              <p style="margin: 0;"><strong>Monthly Stipend:</strong> ${stipend || 'Stipend Provided'}</p>
            </div>

            <div style="text-align: center; margin-top: 25px;">
              <a href="https://digi-internship-hub.pages.dev" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Apply Now</a>
            </div>
          </div>
        </div>
      `
    });

    console.log(`✉️ New Internship notification email sent to ${email}`);
    return data;
  } catch (err) {
    console.error('❌ Resend New Internship Email Error:', err.message);
  }
}

/**
 * Send Quiz Results Email
 */
async function sendQuizResultEmail({ email, name, quizTitle, internshipTitle, score, maxScore, percentage, passed, xpEarned }) {
  try {
    if (!email) return;
    const statusColor = passed ? '#16a34a' : '#dc2626';
    const statusBadge = passed ? '🎉 PASSED' : '⚠️ RETAKE RECOMMENDED';

    const data = await resend.emails.send({
      from: `DiGi Campus Quizzes <${FROM_EMAIL}>`,
      to: [email],
      subject: `${passed ? '🏆 Quiz Completed' : '📝 Quiz Result'}: ${quizTitle} - ${percentage}%`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6fb; padding: 30px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="background-color: ${passed ? '#dcfce7' : '#fee2e2'}; color: ${statusColor}; font-size: 12px; font-weight: bold; padding: 6px 16px; border-radius: 20px; text-transform: uppercase;">${statusBadge}</span>
            </div>
            <h2 style="color: #0f172a; font-size: 20px; text-align: center; margin: 10px 0 4px 0;">${quizTitle}</h2>
            <p style="text-align: center; color: #64748b; font-size: 13px; margin-bottom: 24px;">Internship: ${internshipTitle || 'DiGi Campus Skill Assessment'}</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 14px; border: 1px solid #e2e8f0; text-align: center; margin: 20px 0;">
              <div style="font-size: 38px; font-weight: 800; color: ${statusColor};">${percentage}%</div>
              <p style="margin: 4px 0 0 0; color: #475569; font-size: 14px;">Score: <strong>${score} / ${maxScore}</strong> Points</p>
              ${passed ? `<div style="display: inline-block; margin-top: 12px; background-color: #fef3c7; color: #b45309; font-weight: bold; padding: 4px 14px; border-radius: 20px; font-size: 12px;">+${xpEarned} XP Earned ⚡</div>` : ''}
            </div>

            <p style="line-height: 1.6; color: #334155; font-size: 14px;">
              Hello ${name}, your quiz submission for <strong>${quizTitle}</strong> has been evaluated.
              ${passed ? 'Congratulations on mastering this skill checkpoint! Your experience points have been updated.' : 'Keep practicing and feel free to review the learning material and retake the quiz to improve your score!'}
            </p>

            <div style="text-align: center; margin-top: 28px;">
              <a href="https://digi-internship-hub.pages.dev" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">View Internship Dashboard</a>
            </div>
          </div>
        </div>
      `
    });

    console.log(`✉️ Quiz result email sent to ${email} (Score: ${percentage}%)`);
    return data;
  } catch (err) {
    console.error('❌ Resend Quiz Result Email Error:', err.message);
  }
}

/**
 * Send Application Status Update Email
 */
async function sendApplicationStatusEmail({ email, name, internshipTitle, company, status, feedback }) {
  try {
    if (!email) return;
    const isAccepted = status === 'Accepted' || status === 'Ongoing' || status === 'Completed';

    const data = await resend.emails.send({
      from: `DiGi Campus Admissions <${FROM_EMAIL}>`,
      to: [email],
      subject: `📌 Internship Status Update: ${internshipTitle} - ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6fb; padding: 30px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; font-size: 18px;">Hello, ${name} 👋</h2>
            <p style="line-height: 1.6; color: #334155;">
              Your application status for <strong>${internshipTitle}</strong> at <strong>${company}</strong> has been updated to:
            </p>
            <div style="background-color: ${isAccepted ? '#eff6ff' : '#f8fafc'}; padding: 16px; border-radius: 12px; border: 1px solid ${isAccepted ? '#bfdbfe' : '#cbd5e1'}; margin: 20px 0; text-align: center;">
              <span style="font-size: 18px; font-weight: bold; color: ${isAccepted ? '#1d4ed8' : '#475569'};">${status.toUpperCase()}</span>
              ${feedback ? `<p style="margin: 10px 0 0 0; font-size: 13px; color: #475569;">" ${feedback} "</p>` : ''}
            </div>
            <div style="text-align: center; margin-top: 25px;">
              <a href="https://digi-internship-hub.pages.dev" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Open Student Dashboard</a>
            </div>
          </div>
        </div>
      `
    });

    console.log(`✉️ Application status email sent to ${email} (${status})`);
    return data;
  } catch (err) {
    console.error('❌ Resend Application Status Email Error:', err.message);
  }
}

/**
 * Send General In-App & Email Notification Dispatcher
 */
async function sendNotificationEmail({ email, name, title, message, actionUrl }) {
  try {
    if (!email) return;

    const data = await resend.emails.send({
      from: `DiGi Campus Alerts <${FROM_EMAIL}>`,
      to: [email],
      subject: `🔔 Notification: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6fb; padding: 30px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0f172a; font-size: 18px;">Hello ${name || 'User'},</h2>
            <p style="line-height: 1.6; color: #334155;">${message}</p>
            ${actionUrl ? `
              <div style="text-align: center; margin-top: 25px;">
                <a href="${actionUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">View Details</a>
              </div>
            ` : ''}
          </div>
        </div>
      `
    });

    console.log(`✉️ Notification email dispatched to ${email}`);
    return data;
  } catch (err) {
    console.error('❌ Resend Notification Email Error:', err.message);
  }
}

/**
 * Send 6-Digit Verification OTP Email
 */
async function sendOTPEmail({ email, name, otpCode }) {
  try {
    if (!email || !otpCode) return;

    const data = await resend.emails.send({
      from: `DiGi Campus Security <${FROM_EMAIL}>`,
      to: [email],
      subject: `🔐 ${otpCode} is your DiGi Campus Verification Code`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6fb; padding: 30px; color: #1e293b;">
          <div style="max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #2563eb; font-size: 22px; margin: 0;">💼 DiGi Campus Security</h1>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Account Verification & Anti-Fake Security</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <h2 style="color: #0f172a; font-size: 18px;">Hello, ${name || 'User'} 👋</h2>
            <p style="line-height: 1.6; color: #334155; font-size: 14px;">
              Please use the following 6-digit One-Time Password (OTP) to verify your account and activate your internship access:
            </p>
            
            <div style="background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8;">${otpCode}</span>
              <p style="margin: 8px 0 0 0; color: #64748b; font-size: 12px;">Valid for 10 minutes • Do not share this code</p>
            </div>

            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
              If you did not request this verification, please ignore this email.
            </p>
          </div>
        </div>
      `
    });

    console.log(`✉️ Verification OTP email sent to ${email} (OTP: ${otpCode})`);
    return data;
  } catch (err) {
    console.error('❌ Resend OTP Email Error:', err.message);
  }
}

module.exports = {
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendNewInternshipNotificationEmail,
  sendQuizResultEmail,
  sendApplicationStatusEmail,
  sendNotificationEmail,
  sendOTPEmail
};


