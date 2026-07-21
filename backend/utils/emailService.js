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

module.exports = {
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendNewInternshipNotificationEmail
};
