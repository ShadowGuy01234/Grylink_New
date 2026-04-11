export type ChecklistResponse = 'YES' | 'NO' | 'TO_CHECK_CONFIRM';

export interface FpdfChecklistQuestion {
  code: string;
  serial: string;
  text: string;
  requiresNotes?: boolean;
  notesHint?: string;
}

export const FPDF_CHECKLIST_RESPONSE_VALUES: ChecklistResponse[] = ['YES', 'NO', 'TO_CHECK_CONFIRM'];

export const CHECKLIST_RESPONSE_LABELS: Record<ChecklistResponse, string> = {
  YES: 'Yes',
  NO: 'No',
  TO_CHECK_CONFIRM: 'To check and confirm',
};

export const FPDF_CHECKLIST_QUESTIONS: FpdfChecklistQuestion[] = [
  { code: 'q01', serial: '1', text: 'Does the subcontractor onboarding checklist include a step for the Key Fact Statement (KFS)?' },
  { code: 'q02', serial: '2', text: 'Is there a comprehensive Grievance Redressal Policy as well as a Data Security Policy?' },
  { code: 'q03', serial: '3', text: 'Has the company appointed a specific person as Nodal Officer for grievance redressal?' },
  { code: 'q04', serial: '4', text: 'Has the company displayed the name and contact details of the Nodal Officer on its website and in Terms of Use?' },
  { code: 'q05', serial: '5', text: 'For fund flow, can you confirm that Gryork never touches the loan principal?' },
  { code: 'q06', serial: '6', text: 'Does money move directly from the NBFC account to the subcontractor Aadhaar-linked bank account?' },
  { code: 'q07', serial: '7', text: 'In your Master Service Agreement, is there any clause where Gryork guarantees the loan or provides First Loss Default Guarantee (FLDG)?' },
  { code: 'q08', serial: '8', text: 'Can you confirm that Gryork does not act as a lender, and all credit underwriting, sanctioned amounts, and interest rates are determined solely by the lender?' },
  { code: 'q09a', serial: '9A', text: 'Can you confirm that all servers are physically located in India?' },
  { code: 'q09b', serial: '9B', text: 'Can you confirm that no data is shared with third-party marketing firms?' },
  { code: 'q10', serial: '10', text: 'Is there a reporting system in the digital platform when disbursement is made by NBFC to the subcontractor?' },
  { code: 'q11', serial: '11', text: 'Does your system currently allow deduction of a 1% success fee from NBFC disbursement before credit to the eligible subcontractor?' },
  { code: 'q12', serial: '12', text: 'Does Gryork digital system provide a cooling-off period to exit the loan without penalty for borrowers?' },
  { code: 'q13', serial: '13', text: 'Does the NBFC deduct your 1% and send 99% to the borrower subcontractor?' },
  { code: 'q14', serial: '14', text: 'Do users provide explicit consent for Gryork to share data with obligors for validation and lenders for credit evaluation?' },
  { code: 'q15', serial: '15', text: 'Is data usage purpose strictly limited to facilitation of the requested transaction?' },
  { code: 'q16', serial: '16', text: 'Do users have the right to withdraw consent and request data deletion, subject to statutory retention requirements for active loans under DPDP Act 2023 and RBI DLG directions?' },
  { code: 'q17', serial: '17', text: 'Have partner NBFCs been given rights to conduct annual or semi-annual onsite or offsite audits of Gryork systems, accounts, books, operational logs, and DR drills?' },
  { code: 'q18', serial: '18', text: 'Does your contract with NBFCs explicitly and irrevocably allow RBI to audit and inspect your books, accounts, digital infrastructure, and security framework as if you were the regulated entity?' },
  {
    code: 'q19',
    serial: '19',
    text: 'Does the NoA contain a No Set Off and Irrevocable Payment undertaking?',
    notesHint: 'If needed, add context about liquidated and undisputed debt and waiver of set-off rights.',
  },
  { code: 'q20', serial: '20', text: 'As a multi-lender LSP framework, does your platform display all matching offers from all partner NBFCs without bias or dark patterns?' },
  { code: 'q21', serial: '21', text: 'For every shown offer, does the system display NBFC name, loan amount, tenor, APR, and a direct link to KFS?' },
  { code: 'q22', serial: '22', text: 'Does your digital platform display a link to NBFC KFS at the offer stage, not only at disbursal?' },
  { code: 'q23', serial: '23', text: 'Does each NBFC partner have an outsourcing policy agreement with your company as LSP?' },
  { code: 'q24', serial: '24', text: 'Do you maintain information about the scale base of all NBFC partners (Base, Middle, or Upper Layer)?' },
  { code: 'q25', serial: '25', text: 'Has Gryork put in place a system for annual system audit by a CERT-In empaneled auditor?' },
  { code: 'q26', serial: '26', text: 'Has Gryork put in place a system for sharing final IS Audit Report with all partner NBFCs within 30 days of completion?' },
  { code: 'q27', serial: '27', text: 'Do you have a protocol to report cyber incidents to NBFC within one hour of detection?' },
  { code: 'q28', serial: '28', text: 'Has your company ensured that all loan documents (KFS, sanction letters, and others) are signed using IT Act compliant digital signatures such as Aadhaar eSign or DSC?' },
  { code: 'q29', serial: '29', text: 'Is the methodology for matching borrowers to lenders documented, consistently applied, and available for audit?' },
  { code: 'q30', serial: '30', text: 'In the event of systemic failure or fraud investigation, can Gryork extract and provide raw data in a format required by RBI supervisory team?' },
  { code: 'q31', serial: '31', text: 'Has Gryork platform provided dashboard access to users and NBFC partners?' },
  { code: 'q32', serial: '32', text: 'Is access provided through creation of unique user ID and password or passcode?' },
  {
    code: 'q33',
    serial: '33',
    text: 'Has Gryork prepared a detailed checklist for onboarding subcontractors as users of the digital platform?',
    requiresNotes: true,
    notesHint: 'Provide full write-up for onboarding checklist details.',
  },
  {
    code: 'q34',
    serial: '34',
    text: 'Has Gryork system implemented mechanism for monitoring, tracking, repayment, and closure from end to end, including offline mode controls where applicable?',
    requiresNotes: true,
    notesHint: 'Provide write-up describing online and offline control mechanism and workflow.',
  },
  {
    code: 'q35',
    serial: '35',
    text: 'Do you have primary and secondary data centers aligned with RBI regulatory instructions?',
    requiresNotes: true,
    notesHint: 'Provide write-up with data center details and physical locations.',
  },
];
