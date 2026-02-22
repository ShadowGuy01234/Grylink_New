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
        emoji: "🏗️",
      },
      {
        href: "/for-nbfc",
        label: "For NBFCs",
        description: "Discover & fund verified infrastructure bills",
        emoji: "🏦",
      },
      {
        href: "/for-epc",
        label: "For EPCs",
        description: "Manage sub-contractor payments digitally",
        emoji: "⚡",
      },
    ],
  },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const STATS = [
  { value: "₹500+Cr", label: "Transactions Facilitated", num: 500, prefix: "₹", suffix: "+Cr" },
  { value: "200+", label: "EPC Partners", num: 200, prefix: "", suffix: "+" },
  { value: "50+", label: "RBI-Registered NBFC Partners", num: 50, prefix: "", suffix: "+" },
  { value: "99%", label: "Repayment Rate", num: 99, prefix: "", suffix: "%" },
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
    title: "50+ NBFCs Competing for Your Bill",
    description:
      "Multiple lenders bid on your invoice — you choose the best rate. Never be stuck with a single bank's terms again.",
  },
  {
    icon: "BarChart3",
    title: "Track Every Rupee in Real-Time",
    description:
      "Live status updates from submission to disbursement. Full visibility — know exactly where your money is at every step.",
  },
  {
    icon: "Banknote",
    title: "₹1,000 Flat Platform Fee",
    description:
      "No hidden charges. One small flat fee gives you full platform access per submission. Competitive percentage fee only on funded amount.",
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

export const NBFC_NAMES = [
  "Tata Capital",
  "Bajaj Finserv",
  "Mahindra Finance",
  "Aditya Birla Finance",
  "IIFL Finance",
  "Cholamandalam",
  "Muthoot Finance",
  "Shriram Finance",
  "HDB Financial",
  "L&T Finance",
  "Piramal Finance",
  "IndiaBulls",
];

export const TESTIMONIALS = [
  {
    quote:
      "As a sub-contractor, getting paid within days instead of months has completely changed how we run our business. We can take on bigger projects now because we're not waiting for cash.",
    author: "Managing Director",
    company: "Infrastructure Sub-contractor, Maharashtra",
    role: "subcontractor",
    rating: 5,
  },
  {
    quote:
      "The KYC was done in a day, the bill was approved by our EPC in 2 days, and we had money in our account by day 5. I didn't believe it would be this fast until I saw it myself.",
    author: "Proprietor",
    company: "Civil Works Contractor, Gujarat",
    role: "subcontractor",
    rating: 5,
  },
  {
    quote:
      "Gryork has transformed how we manage our working capital. Fast, reliable, and completely digital. We've onboarded 40+ of our sub-contractors.",
    author: "CFO",
    company: "Leading EPC Company, Delhi",
    role: "epc",
    rating: 5,
  },
  {
    quote:
      "Access to pre-verified deals with comprehensive RMT risk assessment has improved our lending portfolio significantly.",
    author: "Head of Lending",
    company: "Top NBFC Partner",
    role: "nbfc",
    rating: 5,
  },
];

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
    question: "What is the platform fee?",
    answer:
      "A one-time ₹1,000 submission fee per CWCRF application, plus a small percentage-based transaction fee on the funded amount. No hidden charges.",
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
