const mongoose = require('mongoose');
require('dotenv').config();
const TechPreneurReferral = require('../models/TechPreneurReferral');
const connectDB = require('../config/db');

async function fix() {
  await connectDB();
  const res = await TechPreneurReferral.updateMany(
    { status: { $in: ['verified', 'paid'] }, cashbackStatus: 'not_eligible' },
    { $set: { cashbackStatus: 'eligible' } }
  );
  console.log('Updated:', res.modifiedCount);
  process.exit(0);
}
fix();
