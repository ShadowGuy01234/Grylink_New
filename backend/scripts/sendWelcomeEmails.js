const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const TechPreneurRegistration = require('../models/TechPreneurRegistration');
const connectDB = require('../config/db');
const createTransporter = require('../config/email');

// Load environment variables
dotenv.config();

// Helper to generate a unique referral code
const generateUniqueReferralCode = async (name) => {
  let code;
  let isUnique = false;
  let tries = 0;
  
  while (!isUnique && tries < 20) {
    const prefix = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase();
    const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    code = `${prefix}${suffix}`;
    
    const existing = await TechPreneurRegistration.findOne({ referralCode: code });
    if (!existing) {
      isUnique = true;
    }
    tries++;
  }
  return code;
};

// Sleep function to prevent rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const run = async () => {
  const isLive = process.argv.includes('--live');
  
  console.log("====================================================");
  console.log("    TECHPRENEUR 2026 WELCOME EMAIL DISPATCH SYSTEM");
  console.log("====================================================");
  console.log(`Current Mode: ${isLive ? '🔴 [LIVE MODE] - Sending to ALL participants' : '🟢 [TEST MODE] - Sending only to priyanshuchaurasiadlw@gmail.com'}`);
  console.log("====================================================\n");

  try {
    // Connect to database
    await connectDB();
    const transporter = createTransporter();
    
    // Strict production portal URL for welcome emails
    const loginUrl = "https://training.gryork.com/login";

    let participants = [];

    if (isLive) {
      // Fetch all confirmed registrations
      participants = await TechPreneurRegistration.find({ status: 'confirmed' });
      console.log(`Found ${participants.length} confirmed participants in the database.`);
      
      if (participants.length === 0) {
        console.log("❌ No confirmed participants found to send email to.");
        mongoose.connection.close();
        return;
      }
    } else {
      // Find the specific test user
      const testEmail = "priyanshuchaurasiadlw@gmail.com";
      const testUser = await TechPreneurRegistration.findOne({ email: testEmail });
      
      if (!testUser) {
        console.log(`❌ Test participant (${testEmail}) not found in the database.`);
        console.log("Please make sure they have a confirmed registration record.");
        mongoose.connection.close();
        return;
      }
      
      participants = [testUser];
      console.log(`Targeting test participant: ${testUser.name} (${testUser.email})`);
    }

    console.log("\nStarting dispatch process...");
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < participants.length; i++) {
      const student = participants[i];
      
      // Ensure the participant has a referral code
      if (!student.referralCode) {
        console.log(`[Referral] Generating code for ${student.name} (${student.email})...`);
        const code = await generateUniqueReferralCode(student.name);
        student.referralCode = code;
        await student.save();
        console.log(`[Referral] Generated and saved code: ${code}`);
      }

      console.log(`[${i + 1}/${participants.length}] Preparing email for ${student.name} <${student.email}>...`);

      // Beautiful responsive HTML Email template with premium branding & colors
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TechPreneur 2026! 🚀</title>
</head>
<body style="background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 0; margin: 0; color: #f3f4f6; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0b0f19; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    
    <!-- Top Decorative Gradient Header -->
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 45px 30px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">Welcome to TechPreneur 2026! 🚀</h1>
      <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px; font-weight: 500;">Your Journey to Master AI, Web Dev & Startup Begins Now</p>
    </div>
    
    <!-- Content Body -->
    <div style="padding: 40px 35px;">
      <div style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 20px;">Hey ${student.name},</div>
      
      <div style="font-size: 15px; line-height: 1.6; color: #d1d5db; margin-bottom: 30px;">
        We are absolutely thrilled to welcome you to the <strong>TechPreneur 2026 Program</strong>! Your payment has been verified, and your registration is officially confirmed. 
        <br/><br/>
        You are now part of an elite cohort of developers and aspiring founders. Over the next few weeks, you will master top industry skills, build real-world products, and receive exclusive mentorship.
      </div>
      
      <!-- Registration Details Card -->
      <div style="background-color: #111827; border: 1px solid #374151; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin-bottom: 15px; border-bottom: 1px solid #1f2937; padding-bottom: 8px;">Your Verified Details</div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #1f2937;">
            <td style="padding: 10px 0; font-size: 14px; color: #9ca3af; font-weight: 500; width: 40%;">Track Preference</td>
            <td style="padding: 10px 0; font-size: 14px; color: #ffffff; font-weight: 600; width: 60%;">${student.trackPreference}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1f2937;">
            <td style="padding: 10px 0; font-size: 14px; color: #9ca3af; font-weight: 500;">College</td>
            <td style="padding: 10px 0; font-size: 14px; color: #ffffff; font-weight: 600;">${student.college}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1f2937;">
            <td style="padding: 10px 0; font-size: 14px; color: #9ca3af; font-weight: 500;">Branch & Year</td>
            <td style="padding: 10px 0; font-size: 14px; color: #ffffff; font-weight: 600;">${student.branch} (${student.year})</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-size: 14px; color: #9ca3af; font-weight: 500;">Registered Phone</td>
            <td style="padding: 10px 0; font-size: 14px; color: #ffffff; font-weight: 600;">${student.phone}</td>
          </tr>
        </table>
      </div>
      
      <!-- Referral Program Card -->
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%); border: 1px solid #4f46e5; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
        <h3 style="margin: 0 0 10px 0; color: #a78bfa; font-size: 18px; font-weight: 700;">✨ Earn While You Learn: Referral Rewards</h3>
        <p style="margin: 0 0 20px 0; color: #d1d5db; font-size: 14px; line-height: 1.5;">
          We want to reward you for bringing your friends on this journey. Share your unique referral code below:
        </p>
        
        <div style="background-color: #030712; border: 2px dashed #7c3aed; border-radius: 8px; padding: 12px 25px; display: inline-block; margin-bottom: 20px;">
          <span style="font-family: monospace; font-size: 24px; font-weight: 800; color: #10b981; letter-spacing: 2px;">${student.referralCode}</span>
        </div>
        
        <div style="text-align: left; background-color: rgba(3, 7, 18, 0.6); border-radius: 8px; padding: 15px; border: 1px solid #1f2937;">
          <div style="font-size: 13px; color: #e5e7eb; margin-bottom: 8px;">
            🎁 <strong>Your Peers Get:</strong> An immediate <strong>₹100 discount</strong> on registration when they use your code.
          </div>
          <div style="font-size: 13px; color: #e5e7eb;">
            💸 <strong>You Get:</strong> A direct cashback reward of <strong>₹50</strong> for <em>every</em> successful registration. Cashbacks will be credited directly to you. No limits!
          </div>
        </div>
      </div>
      
      <!-- Call to Action -->
      <div style="text-align: center; margin: 40px 0 20px 0;">
        <a href="${loginUrl}" target="_blank" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; font-size: 16px; font-weight: 700; border-radius: 8px; display: inline-block; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4); text-align: center;">Access Student Dashboard</a>
      </div>
      
      <div style="font-size: 13px; color: #9ca3af; text-align: center; margin-top: 15px;">
        To log in, simply enter your registered email on the portal and verify via OTP.
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #070a13; padding: 30px; text-align: center; border-top: 1px solid #1f2937;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
        You received this email because your registration is verified for the TechPreneur 2026 Cohort.
      </p>
      <p style="margin: 0; color: #4b5563; font-size: 12px;">
        &copy; 2026 Gryork Consultants Pvt Ltd. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
      `;

      try {
        await transporter.sendMail({
          to: student.email,
          subject: "Official Welcome to TechPreneur 2026! 🚀 Your Dashboard & Referral Details inside",
          html: htmlContent,
          text: `Welcome to TechPreneur 2026, ${student.name}! Your registration is officially confirmed. Track: ${student.trackPreference}. Referral Code: ${student.referralCode}. Log in to your dashboard here: ${loginUrl}`
        });

        console.log(`✅ [SUCCESS] Email sent to ${student.email}`);
        successCount++;
      } catch (err) {
        console.error(`❌ [FAILURE] Failed to send email to ${student.email}:`, err.message);
        failureCount++;
      }

      // 250ms delay between sending to respect SMTP rate limits or API throughput limits
      if (i < participants.length - 1) {
        await sleep(250);
      }
    }

    console.log("\n====================================================");
    console.log("             DISPATCH PROCESS COMPLETED");
    console.log("====================================================");
    console.log(`Success: ${successCount}`);
    console.log(`Failures: ${failureCount}`);
    console.log("====================================================");

    if (!isLive) {
      console.log("\n💡 Test run complete! Please inspect the inbox for priyanshuchaurasiadlw@gmail.com.");
      console.log("If everything looks perfect and you are ready to send emails to the remaining participants, run:");
      console.log("node scripts/sendWelcomeEmails.js --live");
    }

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Fatal error in dispatch system:", err);
    process.exit(1);
  }
};

run();
