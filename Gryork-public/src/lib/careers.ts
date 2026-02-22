export interface RoleDetail {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  /** What you'll do */
  responsibilities: string[];
  /** What we're looking for */
  requirements: string[];
  /** Nice to have */
  niceToHave?: string[];
}

export const ROLES: RoleDetail[] = [
  {
    slug: "graphic-designer-photo-editor",
    title: "Graphic Designer & Photo Editor",
    department: "Design",
    location: "Bangalore (Hybrid)",
    type: "Full-time / Internship",
    experience: "1–3 years",
    description:
      "Create compelling visual assets, social media graphics, infographics, and marketing collateral for Gryork's brand. Proficiency in Adobe Photoshop, Illustrator, and video/photo editing tools required.",
    responsibilities: [
      "Design social media creatives, banners, infographics, and brand collateral for all Gryork channels",
      "Edit and retouch photographs for marketing campaigns and product listings",
      "Produce short-form video edits (Reels, YouTube Shorts, explainer clips)",
      "Maintain and evolve Gryork's visual identity and brand guidelines",
      "Collaborate with the content and marketing team on campaign assets",
      "Deliver print-ready files for offline materials when required",
    ],
    requirements: [
      "Proficiency in Adobe Photoshop and Adobe Illustrator",
      "Strong portfolio demonstrating graphic design and photo editing work",
      "Eye for layout, typography, and colour — especially in fintech or B2B contexts",
      "Ability to handle multiple projects simultaneously under tight deadlines",
      "Basic understanding of dimensions and specs for social platforms (Instagram, LinkedIn, YouTube)",
    ],
    niceToHave: [
      "Experience with Adobe Premiere Pro or Canva Pro",
      "Motion graphics or After Effects skills",
      "Prior work in fintech, finance, or startup environments",
    ],
  },
  {
    slug: "full-stack-developer",
    title: "Full Stack Developer",
    department: "Engineering",
    location: "Bangalore (Hybrid)",
    type: "Full-time / Internship",
    experience: "1–3 years",
    description:
      "Build and maintain features across our web platform using React, Node.js, MongoDB, and REST APIs. Work closely with the founding team to ship fast and iterate on product features.",
    responsibilities: [
      "Develop and maintain frontend features using React and TypeScript",
      "Build and maintain backend APIs with Node.js and Express",
      "Work with MongoDB for data modelling and queries",
      "Integrate third-party services (cloud storage, email, payment gateways)",
      "Write clean, well-tested, and documented code",
      "Collaborate with product and design to ship features end-to-end",
      "Participate in code reviews and contribute to engineering best practices",
    ],
    requirements: [
      "Solid hands-on experience with React.js and Node.js",
      "Familiarity with MongoDB and REST API design",
      "Understanding of authentication patterns (JWT, session-based)",
      "Experience deploying to cloud platforms (Vercel, AWS, or similar)",
      "Good problem-solving skills and ability to work independently",
    ],
    niceToHave: [
      "Familiarity with TypeScript",
      "Experience with real-time features (WebSockets)",
      "Knowledge of fintech domains (payments, KYC, lending)",
      "Contributions to open-source projects",
    ],
  },
  {
    slug: "risk-analyst",
    title: "Risk Analyst",
    department: "Risk & Compliance",
    location: "Bangalore",
    type: "Full-time / Internship",
    experience: "1–3 years",
    description:
      "Analyse credit and operational risk for infrastructure bill discounting deals. Build and maintain risk assessment frameworks, review CWCRF applications, and support NBFC due diligence processes.",
    responsibilities: [
      "Review and assess CWCRF and RA Bill applications for credit risk",
      "Develop and maintain risk scoring frameworks for sub-contractor profiles",
      "Coordinate with NBFC partners during due diligence processes",
      "Monitor portfolio performance and flag early-warning indicators",
      "Prepare risk reports and summaries for internal and external stakeholders",
      "Ensure compliance with RBI guidelines relevant to invoice discounting",
    ],
    requirements: [
      "Understanding of credit risk fundamentals and financial statement analysis",
      "Familiarity with MSME lending, invoice financing, or supply chain finance",
      "Strong analytical and data skills — Excel proficiency at minimum",
      "Attention to detail and ability to work with structured and unstructured data",
      "Good written communication for preparing risk memos and reports",
    ],
    niceToHave: [
      "Knowledge of RBI regulations around NBFC lending and bill discounting",
      "Experience with CWC (Custody & Warehouse Certificate) or commodity finance",
      "Background in CA, MBA Finance, or CFA",
    ],
  },
];

export function getRoleBySlug(slug: string): RoleDetail | undefined {
  return ROLES.find((r) => r.slug === slug);
}
