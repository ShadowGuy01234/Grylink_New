const mongoose = require('mongoose');
const dotenv = require('dotenv');
const TechPreneurRegistration = require('../models/TechPreneurRegistration');
const connectDB = require('../config/db');

dotenv.config();

const check = async () => {
  try {
    await connectDB();
    
    const count = await TechPreneurRegistration.countDocuments();
    console.log(`Total registrations: ${count}`);
    
    const statuses = await TechPreneurRegistration.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    console.log("Status breakdown:", statuses);

    const verifiedCount = await TechPreneurRegistration.countDocuments({ paymentVerified: true });
    console.log(`Payment Verified registrations: ${verifiedCount}`);

    const testUser = await TechPreneurRegistration.findOne({ email: "priyanshuchaurasiadlw@gmail.com" });
    if (testUser) {
      console.log("Test user found:", {
        id: testUser._id,
        name: testUser.name,
        email: testUser.email,
        status: testUser.status,
        paymentVerified: testUser.paymentVerified,
        referralCode: testUser.referralCode,
        college: testUser.college,
        branch: testUser.branch,
        trackPreference: testUser.trackPreference
      });
    } else {
      console.log("Test user priyanshuchaurasiadlw@gmail.com NOT found in database.");
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
