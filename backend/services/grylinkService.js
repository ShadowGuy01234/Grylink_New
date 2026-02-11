const GryLink = require('../models/GryLink');
const Company = require('../models/Company');
const User = require('../models/User');
const authService = require('./authService');

// Validate a GryLink token
const validateLink = async (token) => {
  const gryLink = await GryLink.findOne({ token })
    .populate('companyId', 'companyName ownerName email status');

  if (!gryLink) throw new Error('Invalid onboarding link');
  if (!gryLink.isValid()) throw new Error('This onboarding link has expired or already been used');

  return gryLink;
};

// Set password via GryLink (Step 4 completion)
const setPassword = async (token, password) => {
  const gryLink = await GryLink.findOne({ token });
  if (!gryLink) throw new Error('Invalid onboarding link');
  if (!gryLink.isValid()) throw new Error('This onboarding link has expired or already been used');

  const company = await Company.findById(gryLink.companyId);
  if (!company) throw new Error('Company not found');

  // Find the EPC user and set password
  const user = await User.findOne({ email: gryLink.email, role: 'epc' });
  if (!user) throw new Error('User not found');

  await authService.setPasswordViaGryLink(user._id, password);

  // Update statuses
  gryLink.status = 'used';
  gryLink.usedAt = new Date();
  await gryLink.save();

  company.status = 'CREDENTIALS_CREATED';
  company.statusHistory.push({ status: 'CREDENTIALS_CREATED', changedBy: user._id });
  await company.save();

  // Generate JWT for immediate login
  const jwtToken = authService.generateToken(user);

  return { user, token: jwtToken, company };
};

module.exports = {
  validateLink,
  setPassword,
};
