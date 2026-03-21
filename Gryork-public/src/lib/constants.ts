export type NavChild = { href: string; label: string; description: string; emoji: string };
export type NavLink =
  | { href: string; label: string; children?: undefined }
  | { href?: undefined; label: string; children: NavChild[] };

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  {
    label: "Solutions",
    children: [
      {
        href: "/for-subcontractors",
        label: "For Sub-Contractors",
        description: "Upload bills & get funded in 48 hours",
        emoji: "",
      },
      {
        href: "/for-nbfc",
        label: "For NBFCs",
        description: "Discover & fund verified infrastructure bills",
        emoji: "",
      },
      {
        href: "/for-epc",
        label: "For EPCs",
        description: "Manage sub-contractor payments digitally",
        emoji: "",
      },
    ],
  },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const STATS = [
  { value: "500+", label: "Contractors Funded", num: 500, prefix: "", suffix: "+" },
  { value: "₹50 Cr+", label: "Processed Through Platform", num: 50, prefix: "", suffix: " Cr+" },
  { value: "99%", label: "Approval Rate", num: 99, prefix: "", suffix: "%" },
  { value: "48 hrs", label: "Average Funding Time", num: 48, prefix: "", suffix: " hrs" },
];

export const FEATURES = [
  {
    icon: "Zap",
    title: "48-Hour Bank Transfer",
    description:
      "From NBFC approval to your account in under 2 business days. Stop chasing payments and start planning your next project.",
  },
  {
    icon: "Building2",
    title: "Multiple NBFCs Competing for Your Bill",
    description:
      "Multiple RBI-registered lenders bid on your invoice — you choose the best rate. Never be stuck with a single bank's terms again.",
  },
  {
    icon: "BarChart3",
    title: "Track Every Rupee in Real-Time",
    description:
      "Live status updates from submission to disbursement. Full visibility — know exactly where your money is at every step.",
  },

  {
    icon: "Shield",
    title: "100% Secure & Compliant",
    description:
      "End-to-end encrypted platform. All NBFCs are RBI-registered. Your KYC and financial data is fully protected.",
  },
  {
    icon: "Smartphone",
    title: "Fully Digital — No Paperwork",
    description:
      "Complete KYC once, upload bills from anywhere. No branch visits, no couriers. The entire process fits in your phone.",
  },
  {
    icon: "CheckCircle2",
    title: "Instant Quote & Decision",
    description:
      "Get instant quotes from multiple NBFCs based on your bill. No waiting for approval decisions. Choose and fund within minutes.",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Register & Complete KYC",
    description: "One-time onboarding: PAN, GST, Aadhaar, and bank details. Takes under 30 minutes.",
    time: "30 min",
    icon: "UserCheck",
  },
  {
    step: 2,
    title: "Submit Bill + CWCRF",
    description: "Upload your RA Bill, Work Completion Certificate, and Measurement Sheet digitally.",
    time: "10 min",
    icon: "FileText",
  },
  {
    step: 3,
    title: "EPC Verifies Work",
    description: "Your EPC partner confirms work completion and bill authenticity online.",
    time: "1–2 days",
    icon: "CheckCircle2",
  },
  {
    step: 4,
    title: "NBFCs Submit Offers",
    description: "Multiple NBFCs review your verified bill and compete with their best discount rates.",
    time: "24–48 hrs",
    icon: "Landmark",
  },
  {
    step: 5,
    title: "Accept & Get Funded",
    description: "Choose the best NBFC offer. Funds are transferred directly to your bank account.",
    time: "48 hrs",
    icon: "Banknote",
  },
];

export const PAIN_POINTS = [
  {
    before: "Wait 60–90 days for EPC payment",
    after: "Get funded in 48 hours",
    beforeIcon: "Clock",
    afterIcon: "Zap",
  },
  {
    before: "Only one bank, take it or leave it",
    after: "50+ NBFCs competing for your bill",
    beforeIcon: "X",
    afterIcon: "TrendingUp",
  },
  {
    before: "Piles of paperwork & branch visits",
    after: "100% digital, upload from phone",
    beforeIcon: "FileX",
    afterIcon: "Smartphone",
  },
  {
    before: "No visibility on where your money is",
    after: "Real-time status at every step",
    beforeIcon: "EyeOff",
    afterIcon: "BarChart3",
  },
];

export const SC_ELIGIBILITY = [
  "GST-registered business (preferred)",
  "Active work contract with a registered EPC on Gryork",
  "Valid work completion bill / RA Bill",
  "KYC documents: PAN, Aadhaar, cancelled cheque",
  "Minimum 6 months of business operation",
];

export const TRUST_BADGES = [
  "RBI-Registered NBFCs Only",
  "End-to-End Encrypted",
  "100% Digital Process",
  "Competitive Bidding",
  "Direct Bank Transfer",
  "Zero Collateral Required",
  "One-Time KYC",
  "Real-Time Status Updates",
  "Fully Compliant",
  "Secure Document Storage",
  "RBI-Registered NBFCs Only",
  "End-to-End Encrypted",
];

// Testimonials intentionally empty — no mock/fabricated reviews
export const TESTIMONIALS: Array<{ quote: string; author: string; company: string; role: string; rating: number }> = [];

export const FAQS = [
  {
    question: "What is the minimum bill amount?",
    answer:
      "The minimum bill amount for discounting is ₹5 lakhs. There is no maximum limit as long as the EPC validates the bill.",
  },
  {
    question: "How long does it take to get funded?",
    answer:
      "Typically 3–5 business days from bill submission. Once your EPC verifies the bill and an NBFC approves your application, funds are disbursed within 48 hours.",
  },
  {
    question: "What documents are needed for KYC?",
    answer:
      "PAN card, Aadhaar card, GST registration certificate, and a cancelled cheque matching your bank account. One-time submission — no re-verification for subsequent bills.",
  },
  {
    question: "Is there any collateral required?",
    answer:
      "No collateral required. Gryork uses your verified work completion bills as the financing basis. The invoice itself is the asset being discounted.",
  },
  {
    question: "What are the charges involved?",
    answer:
      "We charge a small percentage-based transaction fee only on the funded amount when your bill gets discounted. No hidden charges. Details are shared during the submission process.",
  },
  {
    question: "My EPC is not on Gryork. Can I still apply?",
    answer:
      "Your EPC needs to be registered on the Gryork platform. You can ask your EPC to contact our sales team or refer them through our onboarding link. We onboard new EPCs quickly.",
  },
];

export const FOOTER_LINKS = {
  platform: [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/for-subcontractors", label: "For Sub-Contractors" },
    { href: "/for-nbfc", label: "For NBFCs" },
    { href: "/for-epc", label: "For EPCs" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/community", label: "Community" },
    { href: "/contact", label: "Contact" },
    { href: "/careers", label: "Careers" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};
