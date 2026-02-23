const createTransporter = require("../config/email");

const sendEmail = async (to, subject, html) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`Email send failed: ${error.message}`);
    // Don't throw - email failure shouldn't block workflows
  }
};

const sendOnboardingLink = async (email, ownerName, link) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to Gryork!</h2>
      <p>Dear ${ownerName},</p>
      <p>Your company has been registered on the Gryork platform. Please click the link below to set up your password and complete your onboarding:</p>
      <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Complete Onboarding
      </a>
      <p style="color: #666; font-size: 14px;">This link expires in 7 days. If you did not expect this email, please ignore it.</p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Gryork Platform</p>
    </div>
  `;
  await sendEmail(email, "Welcome to Gryork - Complete Your Onboarding", html);
};

const sendNbfcOnboardingLink = async (email, ownerName, nbfcName, link) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e3a5f, #2563eb); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Gryork</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 14px;">NBFC Partner Onboarding</p>
      </div>
      <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1f2937;">Dear ${ownerName},</p>
        <p style="color: #4b5563; line-height: 1.6;">
          <strong>${nbfcName}</strong> has been registered as an NBFC lending partner on the Gryork platform by our operations team.
        </p>
        <p style="color: #4b5563; line-height: 1.6;">To get started, please set up your account password by clicking the button below:</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${link}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb, #1e40af); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
            Set Up Your Account →
          </a>
        </div>
        <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0;">
          <p style="color: #1e40af; font-weight: 600; margin: 0 0 8px 0; font-size: 14px;">What happens next?</p>
          <ol style="color: #4b5563; margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
            <li>Set your secure password</li>
            <li>Log in to your NBFC partner dashboard</li>
            <li>Configure your Lending Preference Sheet (LPS)</li>
            <li>Start receiving and bidding on cases</li>
          </ol>
        </div>
        <p style="color: #9ca3af; font-size: 13px;">This link expires in 7 days. If you did not expect this email, please ignore it.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">Gryork Platform — Empowering Infrastructure Finance</p>
      </div>
    </div>
  `;
  await sendEmail(
    email,
    `Welcome to Gryork — ${nbfcName} NBFC Partner Onboarding`,
    html,
  );
};

const sendStatusUpdate = async (email, name, entityType, newStatus, notes) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Status Update</h2>
      <p>Dear ${name},</p>
      <p>Your ${entityType} status has been updated to: <strong>${newStatus}</strong></p>
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
      <p>Please log in to the platform for more details.</p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Gryork Platform</p>
    </div>
  `;
  await sendEmail(
    email,
    `Gryork - ${entityType} Status Update: ${newStatus}`,
    html,
  );
};

const sendBidNotification = async (
  email,
  name,
  caseNumber,
  bidAmount,
  duration,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Bid Received</h2>
      <p>Dear ${name},</p>
      <p>A new bid has been placed on case <strong>${caseNumber}</strong>:</p>
      <ul>
        <li><strong>Bid Amount:</strong> ₹${bidAmount.toLocaleString()}</li>
        <li><strong>Funding Duration:</strong> ${duration} days</li>
      </ul>
      <p>Please log in to review and respond to this bid.</p>
      <p style="color: #dc2626; font-size: 14px;"><strong>⚠️ Note:</strong> Negotiation may reduce the offered amount.</p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Gryork Platform</p>
    </div>
  `;
  await sendEmail(email, `Gryork - New Bid on Case ${caseNumber}`, html);
};

const sendKycRequest = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">KYC Documents Required</h2>
      <p>Dear ${name},</p>
      <p>Our verification team requires additional documents for your KYC process. Please log in to the platform and upload the requested documents via the chat.</p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Gryork Platform</p>
    </div>
  `;
  await sendEmail(email, "Gryork - KYC Documents Required", html);
};

const sendSalesNotification = async (email, name, message) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Sales Notification</h2>
      <p>Dear ${name},</p>
      <p>${message}</p>
      <p>Please log in to your dashboard for more details.</p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Gryork Platform</p>
    </div>
  `;
  await sendEmail(email, "Gryork - Sales Notification", html);
};

/**
 * SOP-related email notifications
 */

// Re-KYC notification
const sendReKycNotification = async (entity, trigger, details) => {
  const email = entity.email || entity.ownerEmail;
  const name = entity.companyName || entity.name;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">Re-KYC Required</h2>
      <p>Dear ${name},</p>
      <p>A re-verification of your KYC documents has been triggered due to: <strong>${trigger}</strong></p>
      <p>Please log in to the platform and submit the required updated documents.</p>
      ${details.previousBank ? `<p><strong>Bank Change Detected:</strong> ${details.previousBank} → ${details.newBank}</p>` : ""}
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Gryork Platform</p>
    </div>
  `;
  await sendEmail(email, "Gryork - Re-KYC Required", html);
};

// SLA reminder
const sendSlaReminder = async (sla, milestone) => {
  // Would need case and recipient info from SLA
  const daysLeft = Math.ceil(
    (new Date(milestone.targetDate) - new Date()) / (1000 * 60 * 60 * 24),
  );
  console.log(
    `[EMAIL] SLA Reminder: Milestone "${milestone.name}" due in ${daysLeft} days`,
  );
  // Implementation depends on SLA recipient structure
};

// KYC expiry reminder
const sendKycExpiryReminder = async (company) => {
  const email = company.ownerEmail;
  const name = company.companyName;
  const validUntil = new Date(
    company.kycVerification.validUntil,
  ).toLocaleDateString("en-IN");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f59e0b;">KYC Expiring Soon</h2>
      <p>Dear ${name},</p>
      <p>Your KYC verification is expiring on <strong>${validUntil}</strong>.</p>
      <p>Please log in to the platform and submit updated documents to maintain your active status.</p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Gryork Platform</p>
    </div>
  `;
  await sendEmail(email, "Gryork - KYC Expiring Soon", html);
};

// Overdue upcoming notification (1 month before CWC due)
const sendOverdueUpcomingNotification = async (transaction) => {
  const dueDate = new Date(transaction.cwcDueDate).toLocaleDateString("en-IN");

  // Send to SC
  if (transaction.seller?.email) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Payment Due Date Reminder</h2>
        <p>Dear ${transaction.seller.name},</p>
        <p>This is a reminder that the CWC payment for your transaction is due on <strong>${dueDate}</strong>.</p>
        <p>Please ensure timely payment to maintain your good standing.</p>
        <p><strong>Amount:</strong> ₹${transaction.amount?.toLocaleString()}</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="color: #999; font-size: 12px;">Gryork Platform</p>
      </div>
    `;
    await sendEmail(
      transaction.seller.email,
      "Gryork - Payment Due Date Reminder",
      html,
    );
  }
};

// Overdue alert (past due)
const sendOverdueAlert = async (transaction) => {
  // Internal notification to ops team
  console.log(
    `[EMAIL] Overdue Alert: Transaction ${transaction._id} is past due`,
  );
  // Would send to ops team email
};

// Critical overdue alert (30+ days past due)
const sendCriticalOverdueAlert = async (transaction) => {
  // Internal notification to founders
  console.log(
    `[EMAIL] CRITICAL Overdue Alert: Transaction ${transaction._id} is 30+ days past due`,
  );
  // Would send to founder email
};

module.exports = {
  sendEmail,
  sendOnboardingLink,
  sendNbfcOnboardingLink,
  sendStatusUpdate,
  sendBidNotification,
  sendKycRequest,
  sendSalesNotification,
  // SOP notifications
  sendReKycNotification,
  sendSlaReminder,
  sendKycExpiryReminder,
  sendOverdueUpcomingNotification,
  sendOverdueAlert,
  sendCriticalOverdueAlert,
};
