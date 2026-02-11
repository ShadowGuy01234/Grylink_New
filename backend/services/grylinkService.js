const GryLink = require("../models/GryLink");
const Company = require("../models/Company");
const SubContractor = require("../models/SubContractor");
const User = require("../models/User");
const authService = require("./authService");

// Validate a GryLink token
const validateLink = async (token) => {
  const gryLink = await GryLink.findOne({ token })
    .populate("companyId", "companyName ownerName email status")
    .populate("subContractorId", "companyName contactName email status");

  if (!gryLink) throw new Error("Invalid onboarding link");
  if (!gryLink.isValid())
    throw new Error("This onboarding link has expired or already been used");

  if (gryLink.linkType === "subcontractor") {
    return {
      ...gryLink.toObject(),
      companyName: gryLink.subContractorId?.companyName,
      ownerName: gryLink.subContractorId?.contactName,
    };
  }

  return gryLink;
};

// Set password via GryLink (Step 4 completion for EPC, Step 9 for SubContractor)
const setPassword = async (token, password) => {
  const gryLink = await GryLink.findOne({ token });
  if (!gryLink) throw new Error("Invalid onboarding link");
  if (!gryLink.isValid())
    throw new Error("This onboarding link has expired or already been used");

  let user;

  if (gryLink.linkType === "subcontractor") {
    // Sub-contractor onboarding
    const subContractor = await SubContractor.findById(gryLink.subContractorId);
    if (!subContractor) throw new Error("Sub-contractor not found");

    user = await User.findOne({ email: gryLink.email, role: "subcontractor" });
    if (!user) throw new Error("User not found");

    await authService.setPasswordViaGryLink(user._id, password);

    // Update sub-contractor status
    subContractor.status = "PROFILE_INCOMPLETE";
    subContractor.statusHistory.push({
      status: "PROFILE_INCOMPLETE",
      changedBy: user._id,
    });
    await subContractor.save();

    // Mark GryLink as used
    gryLink.status = "used";
    gryLink.usedAt = new Date();
    await gryLink.save();

    const jwtToken = authService.generateToken(user);
    return { user, token: jwtToken, subContractor };
  } else {
    // EPC company onboarding
    const company = await Company.findById(gryLink.companyId);
    if (!company) throw new Error("Company not found");

    user = await User.findOne({ email: gryLink.email, role: "epc" });
    if (!user) throw new Error("User not found");

    await authService.setPasswordViaGryLink(user._id, password);

    // Update statuses
    gryLink.status = "used";
    gryLink.usedAt = new Date();
    await gryLink.save();

    company.status = "CREDENTIALS_CREATED";
    company.statusHistory.push({
      status: "CREDENTIALS_CREATED",
      changedBy: user._id,
    });
    await company.save();

    const jwtToken = authService.generateToken(user);
    return { user, token: jwtToken, company };
  }
};

module.exports = {
  validateLink,
  setPassword,
};
