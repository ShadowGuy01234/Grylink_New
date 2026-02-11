const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async ({ name, email, password, phone, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const user = new User({ name, email, password, phone, role });
  await user.save();

  const token = generateToken(user);
  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  };
};

const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user);
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      subContractorId: user.subContractorId,
    },
    token,
  };
};

// Set password via GryLink (EPC onboarding)
const setPasswordViaGryLink = async (userId, password) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.password = password;
  await user.save();
  return user;
};

// Create EPC user (no password - set later via GryLink)
const createEpcUser = async ({ name, email, phone, companyId }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const user = new User({
    name,
    email,
    phone,
    role: 'epc',
    companyId,
  });
  await user.save();
  return user;
};

module.exports = {
  register,
  login,
  generateToken,
  setPasswordViaGryLink,
  createEpcUser,
};
