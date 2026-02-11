const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
};

const register = async ({ name, email, password, phone, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
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
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
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
  if (!user) throw new Error("User not found");

  user.password = password;
  await user.save();
  return user;
};

// Create EPC user (no password - set later via GryLink)
const createEpcUser = async ({ name, email, phone, companyId }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const user = new User({
    name,
    email,
    phone,
    role: "epc",
    companyId,
  });
  await user.save();
  return user;
};

// Create NBFC user (no password - set later via GryLink)
const createNbfcUser = async ({ name, email, phone, companyId }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const user = new User({
    name,
    email,
    phone,
    role: "nbfc",
    companyId,
  });
  await user.save();
  return user;
};

// Register Sub-Contractor (Step 9 - matches EPC-added leads)
const registerSubcontractor = async ({ name, email, password, phone, companyName }) => {
  const SubContractor = require("../models/SubContractor");

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  let subContractor = await SubContractor.findOne({ email: email.toLowerCase() });

  if (!subContractor) {
    throw new Error("No matching sub-contractor lead found. Please contact your EPC company to add you to their vendor list first.");
  }

  const user = new User({
    name,
    email,
    password,
    phone,
    role: "subcontractor",
  });
  await user.save();

  subContractor.userId = user._id;
  subContractor.contactName = subContractor.contactName || name;
  subContractor.companyName = subContractor.companyName || companyName;
  subContractor.phone = subContractor.phone || phone;
  subContractor.status = "PROFILE_INCOMPLETE";
  subContractor.statusHistory.push({
    status: "PROFILE_INCOMPLETE",
    changedAt: new Date(),
    notes: "User account created",
  });
  await subContractor.save();

  user.subContractorId = subContractor._id;
  await user.save();

  const token = generateToken(user);
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subContractorId: subContractor._id,
    },
    token,
    subContractor: {
      id: subContractor._id,
      status: subContractor.status,
      linkedEpcId: subContractor.linkedEpcId,
    },
  };
};

// Create SubContractor user (no password - set later via GryLink)
const createSubContractorUser = async ({ name, email, phone, subContractorId }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return existingUser; // SC may already have an account
  }

  const user = new User({
    name,
    email,
    phone,
    role: "subcontractor",
    subContractorId,
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
  createNbfcUser,
  registerSubcontractor,
  createSubContractorUser,
};
