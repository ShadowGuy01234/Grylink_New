export interface User {
  _id: string;
  name: string;
  email: string;
  role: "epc" | "nbfc" | "admin" | "sales" | "ops";
}

export interface Document {
  documentType: string;
  status: "pending" | "verified" | "rejected";
  fileName?: string;
  fileUrl?: string;
  verificationNotes?: string;
  uploadedAt?: string;
}

export interface Company {
  _id: string;
  companyName: string;
  status:
    | "LEAD_CREATED"
    | "CREDENTIALS_CREATED"
    | "DOCS_SUBMITTED"
    | "ACTION_REQUIRED"
    | "ACTIVE";
  email: string;
  phone?: string;
}

export interface CompanyProfile {
  company: Company;
  documents: Document[];
}

export interface SubContractor {
  _id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: string;
  kycStatus?: string;
}

export interface Bill {
  _id: string;
  billNumber: string;
  amount: number;
  status: string;
  uploadedAt: string;
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  billType?: string;
  description?: string;
  wcc?: {
    uploaded: boolean;
    fileUrl?: string;
    fileName?: string;
  };
  measurementSheet?: {
    uploaded: boolean;
    fileUrl?: string;
    fileName?: string;
  };
}

export interface Case {
  _id: string;
  caseNumber: string;
  status: string;
  subContractorId: SubContractor;
  billId: Bill;
  cwcaf?: {
    riskCategory: string;
    riskAssessmentDetails?: {
      totalScore: number;
    };
  };
}

export interface Bid {
  _id: string;
  caseId: Case;
  bidAmount: number;
  fundingDurationDays: number;
  status:
    | "SUBMITTED"
    | "ACCEPTED"
    | "REJECTED"
    | "NEGOTIATION_IN_PROGRESS"
    | "COMMERCIAL_LOCKED";
  createdAt: string;
  negotiations?: any[];
}
