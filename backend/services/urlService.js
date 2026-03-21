const getOnboardingBaseUrl = () => {
  const explicitUrl =
    process.env.GRYLINK_PORTAL_URL ||
    process.env.SUBCONTRACTOR_PORTAL_URL ||
    process.env.GRYLINK_FRONTEND_URL;

  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    return "https://link.gryork.com";
  }

  return "http://localhost:5174";
};

const buildOnboardingLink = (token) =>
  `${getOnboardingBaseUrl()}/onboarding/${token}`;

module.exports = {
  getOnboardingBaseUrl,
  buildOnboardingLink,
};
