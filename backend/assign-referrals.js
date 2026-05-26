const mongoose = require("mongoose");
const crypto = require("crypto");
const dns = require("dns");
dns.setServers(['8.8.8.8', '8.8.4.4']);
require("dotenv").config();

const TechPreneurRegistration = require("./models/TechPreneurRegistration");

async function assignReferrals() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://doadmin:q37D56oT9p1K2bI8@db-mongodb-blr1-20909-b68df4ce.mongo.ondigitalocean.com/admin?tls=true&authSource=admin");
    console.log("Connected to DB");

    const usersWithoutCode = await TechPreneurRegistration.find({ referralCode: { $exists: false } });
    console.log(`Found ${usersWithoutCode.length} users without referral codes.`);

    for (const user of usersWithoutCode) {
      const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
      const code = `TECH${suffix}`;
      
      user.referralCode = code;
      await user.save();
      console.log(`Assigned ${code} to ${user.name}`);
    }

    console.log("Done.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

assignReferrals();
