const createTransporter = require('../config/email');

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
  await sendEmail(email, 'Welcome to Gryork - Complete Your Onboarding', html);
};

const sendStatusUpdate = async (email, name, entityType, newStatus, notes) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Status Update</h2>
      <p>Dear ${name},</p>
      <p>Your ${entityType} status has been updated to: <strong>${newStatus}</strong></p>
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      <p>Please log in to the platform for more details.</p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Gryork Platform</p>
    </div>
  `;
  await sendEmail(email, `Gryork - ${entityType} Status Update: ${newStatus}`, html);
};

const sendBidNotification = async (email, name, caseNumber, bidAmount, duration) => {
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
  await sendEmail(email, 'Gryork - KYC Documents Required', html);
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
  await sendEmail(email, 'Gryork - Sales Notification', html);
};

module.exports = {
  sendEmail,
  sendOnboardingLink,
  sendStatusUpdate,
  sendBidNotification,
  sendKycRequest,
  sendSalesNotification,
};
