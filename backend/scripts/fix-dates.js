const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const TechPreneurJoiningLetter = require("../models/TechPreneurJoiningLetter");
const TechPreneurCertificate = require("../models/TechPreneurCertificate");

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is missing.");
    }
    console.log("Connecting to database...");
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    // Update all Selection Letters joiningDate to 30 May 2026
    const letterDate = new Date("2026-05-30");
    const letterResult = await TechPreneurJoiningLetter.updateMany(
      {},
      { $set: { joiningDate: letterDate } }
    );
    console.log(`Updated ${letterResult.modifiedCount} selection letters to joiningDate: 30 May 2026`);

    // Update all Certificates issuedAt to 30 June 2026
    const certDate = new Date("2026-06-30");
    const certResult = await TechPreneurCertificate.updateMany(
      {},
      { $set: { issuedAt: certDate } }
    );
    console.log(`Updated ${certResult.modifiedCount} certificates to issuedAt: 30 June 2026`);

  } catch (err) {
    console.error("Error during migration:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

run();
