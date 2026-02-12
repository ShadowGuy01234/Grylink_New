const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const users = [
  {
    name: 'Super Admin',
    email: 'admin@gryork.com',
    password: 'password123',
    role: 'admin',
    phone: '9999999999'
  },
  {
    name: 'Sales Manager',
    email: 'sales@gryork.com',
    password: 'password123',
    role: 'sales',
    phone: '8888888888'
  },
  {
    name: 'Ops Manager',
    email: 'ops@gryork.com',
    password: 'password123',
    role: 'ops',
    phone: '7777777777'
  },
  {
    name: 'RMT Manager',
    email: 'rmt@gryork.com',
    password: 'password123',
    role: 'rmt',
    phone: '6666666666'
  },
  {
    name: 'Founder',
    email: 'founder@gryork.com',
    password: 'password123',
    role: 'founder',
    phone: '5555555555'
  }
];

const seedUsers = async () => {
  try {
    for (const user of users) {
      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        console.log(`User ${user.email} already exists`);
        // We could update, but for now let's just skip to preserve existing passwords if changed
        continue;
      }
      
      // Password hashing is handled by the model pre-save hook
      const newUser = new User(user);
      await newUser.save();
      console.log(`Created user: ${user.email} (${user.role})`);
    }
    
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeing users:', error);
    process.exit(1);
  }
};

seedUsers();
