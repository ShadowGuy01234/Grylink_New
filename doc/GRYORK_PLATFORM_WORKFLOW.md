# Gryork Platform — Official Workflow Documentation

**Version:** 1.0  
**Date:** February 19, 2026  
**Classification:** Internal — Product & Engineering Reference

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Actors & Portals](#2-actors--portals)
3. [Phase 1 — EPC Company Onboarding](#phase-1--epc-company-onboarding)
4. [Phase 2 — EPC Document Verification](#phase-2--epc-document-verification)
5. [Phase 3 — Sub-Contractor Registration via EPC](#phase-3--sub-contractor-registration-via-epc)
6. [Phase 4 — Sub-Contractor Onboarding & KYC](#phase-4--sub-contractor-onboarding--kyc)
7. [Phase 5 — CWCRF Submission (with Bill)](#phase-5--cwcrf-submission-with-bill)
8. [Phase 6 — Ops Review & Verification (Super Access)](#phase-6--ops-review--verification-super-access)
9. [Phase 7 — RMT Risk Assessment](#phase-7--rmt-risk-assessment)
10. [Phase 8 — Ops Risk Triage & Forward to EPC](#phase-8--ops-risk-triage--forward-to-epc)
11. [Phase 9 — EPC Case Review & Bid](#phase-9--epc-case-review--bid)
12. [Phase 10 — CWCAF Generation & NBFC Selection](#phase-10--cwcaf-generation--nbfc-selection)
13. [Phase 11 — NBFC Review (In Progress)](#phase-11--nbfc-review-in-progress)
14. [Status Reference Tables](#14-status-reference-tables)
15. [API Endpoint Map by Phase](#15-api-endpoint-map-by-phase)

---

## 1. Platform Overview

Gryork is a **supply-chain finance platform** for the Indian construction sector. It enables Sub-Contractors (sellers who perform work) to access short-term working capital by discounting verified invoices, with EPC companies (buyers) confirming the work and NBFCs (lenders) providing the funding.

**Core Value Proposition:**
- Sub-contractors get paid faster (instead of waiting 60-90 days)
- EPC companies get structured supplier financing
- NBFCs get vetted, Gryork-verified invoice assets to fund
- Gryork earns a platform fee (₹1,000 submission fee + percentage-based transaction fee)

---

## 2. Actors & Portals

| Actor | Role Code | Login Portal | Internal Portal | Description |
|-------|-----------|-------------|-----------------|-------------|
| **Sales Agent** | `sales` | — | `official_portal` | Gryork employee who creates EPC and SC leads |
| **EPC Company** | `epc` | `link.gryork.com` (onboarding) → `partner-portal` | — | Construction company that hires sub-contractors |
| **Sub-Contractor** | `subcontractor` | `subcontractor-portal` | — | Vendor/contractor that performs work and raises bills |
| **Ops Team** | `ops` | — | `official_portal` | Gryork operations team — verifies documents, manages cases |
| **RMT** | `rmt` | — | `official_portal` | Gryork Risk Management Team — assesses seller risk |
| **NBFC** | `nbfc` | `partner-portal` | — | Non-Banking Financial Company that funds invoices |
| **Admin** | `admin` | — | `official_portal` | Platform administrator — manages users and system |
| **Founder** | `founder` | — | `official_portal` | Founder oversight — approves high-risk cases and agents |

---

## Phase 1 — EPC Company Onboarding

### Step 1.1 — Sales Creates EPC Lead

**Actor:** Sales Agent  
**Portal:** official_portal → Sales → Companies

Sales agent creates a new EPC company lead by entering:
- Company Name
- Owner Name
- Email Address
- Phone Number
- City / State
- GST Number (optional at this stage)
- Any initial notes

**Result:** Company record created in the database with status `LEAD_CREATED`.

---

### Step 1.2 — GryLink Generated & Sent

**Actor:** Sales Agent  
**Portal:** official_portal → Sales → Company Detail → GryLink Panel

Sales generates a **GryLink** — a one-time secure token tied to the company's email address. The system:
- Creates a GryLink record (7-day expiry)
- Sends an onboarding email to the EPC owner with a unique link in the format:  
  `https://link.gryork.com/onboarding/{token}`

**Result:** Company status changes to `CREDENTIALS_CREATED`. GryLink status is `active`.  
Sales can resend the link if not opened within 7 days.

---

### Step 1.3 — EPC Completes Onboarding at link.gryork.com

**Actor:** EPC Company Owner  
**Portal:** `link.gryork.com` (grylink-portal)

The EPC owner opens the link received in their email. The portal:
1. Validates the token (checks it hasn't expired or been used)
2. Displays the company name and owner email (pre-filled, non-editable)
3. Asks EPC owner to **set their password** for the partner portal
4. Accepts Terms & Conditions
5. Submits → password is saved, GryLink marked as `used`

**Result:** EPC user account is activated. EPC owner is redirected to `partner.gryork.com` (partner-portal) and can now log in.

---

### Step 1.4 — EPC Uploads Company Documents

**Actor:** EPC Company  
**Portal:** partner-portal → Documents Tab

After first login, EPC must upload all required company documents to gain full access:

| Document | Required |
|----------|----------|
| Certificate of Incorporation / MoA | ✅ |
| GST Registration Certificate | ✅ |
| PAN Card (Company) | ✅ |
| Latest Audited Balance Sheet | ✅ |
| Bank Statement (6 months) | ✅ |
| Owner KYC (Aadhaar / Passport) | ✅ |
| Board Resolution (if applicable) | Optional |

**Result:** Company status changes to `DOCS_SUBMITTED`.

---

## Phase 2 — EPC Document Verification

### Step 2.1 — Ops Reviews EPC Documents

**Actor:** Ops Team  
**Portal:** official_portal → Ops Dashboard → EPC Verification

Ops team receives the pending EPC verification task. For each company document:
- Ops can **preview** the document inline
- Ops can **approve** or **reject** each document individually
- If rejected, Ops adds a rejection reason — EPC is notified to re-upload

Once all documents are approved, Ops performs final company verification.

---

### Step 2.2 — Ops Approves / Rejects EPC

**Actor:** Ops Team  
**Portal:** official_portal → Ops Dashboard → EPC Verification

- **Approve:** Company status changes to `ACTIVE`. EPC gains full partner-portal access.
- **Reject:** Company status changes to `ACTION_REQUIRED`. EPC receives notification with reasons.

**Result after approval:** EPC can now access all partner-portal features including Sub-Contractor management, Cases, and Bids.

---

## Phase 3 — Sub-Contractor Registration via EPC

### Step 3.1 — EPC Uploads Sub-Contractor List

**Actor:** EPC Company  
**Portal:** partner-portal → Sub-Contractors Tab

The EPC company uploads a list of their registered sub-contractors (vendors who work on their projects). For each sub-contractor, EPC provides:
- Sub-Contractor Company Name
- Owner / Contact Person Name
- Email Address
- Phone Number
- Nature of work / trade category

**Result:** Sub-Contractor records are created in the system with status `LEAD_CREATED`, linked to that EPC company.

---

### Step 3.2 — Sales Contacts & Onboards Sub-Contractors

**Actor:** Sales Agent  
**Portal:** official_portal → Sales → Sub-Contractors

Sales receives the list of SC leads linked to each EPC. For each SC:
- Sales agent reviews the SC profile
- Contacts the SC (phone/email) and logs the contact in the **Contact Log** (method, outcome, notes)
- Explains the Gryork platform and the benefits for the SC
- Guides the SC to register on the subcontractor portal

**Result:** SC status updated to `PROFILE_INCOMPLETE`. Contact log entry saved.

---

### Step 3.3 — Sub-Contractor Self-Registration

**Actor:** Sub-Contractor  
**Portal:** subcontractor-portal

The SC receives an invitation or registers using the **same email address** that the EPC company used when submitting the SC list. This email is their login identity and links them to the correct EPC company automatically.

Registration requires:
- Full Name
- Email (must match the email provided by EPC)
- Phone Number
- Password (set by SC)

**Result:** SC user account created, linked to EPC company via `linkedEpcId`.

---

## Phase 4 — Sub-Contractor Onboarding & KYC

### Step 4.1 — SC Completes Basic Profile

**Actor:** Sub-Contractor  
**Portal:** subcontractor-portal → Profile Tab

SC fills in their complete business profile:
- Company Name (trading name)
- Owner Name
- Phone Number
- Vendor ID (if any, assigned by EPC)
- GST Number
- Constitution Type: `PROPRIETORSHIP | PARTNERSHIP | LLP | PVT LTD | PUBLIC LTD`
- Registered Address (Street, City, State, Pincode)

**Result:** SC status changes to `PROFILE_COMPLETED`.

---

### Step 4.2 — SC Uploads KYC Documents

**Actor:** Sub-Contractor  
**Portal:** subcontractor-portal → KYC Tab → Documents

SC must upload the following documents:

| Document | Field Name | Notes |
|----------|-----------|-------|
| PAN Card | `panCard` | Company PAN or Proprietor PAN |
| Aadhaar Card | `aadhaarCard` | Owner Aadhaar |
| GST Registration Certificate | `gstCertificate` | Must match GSTIN on profile |
| Cancelled Cheque | `cancelledCheque` | Must match bank details submitted |

Each document is uploaded individually. Supported formats: PDF, JPG, PNG.

---

### Step 4.3 — SC Submits Bank Details

**Actor:** Sub-Contractor  
**Portal:** subcontractor-portal → KYC Tab → Bank Details

SC provides bank account details where disbursements will be made:
- Account Number
- IFSC Code
- Bank Name
- Branch Name
- Account Type: `SAVINGS | CURRENT`

**Result:** Bank details saved with verification status `PENDING`.

---

### Step 4.4 — SC Accepts Seller Declaration

**Actor:** Sub-Contractor  
**Portal:** subcontractor-portal → KYC Tab → Declaration

SC reads and accepts the **Seller Declaration** which includes:
- Confirmation that all documents submitted are genuine
- Consent for Gryork to share data with partner NBFCs
- Agreement to Gryork's platform terms and fee structure
- Agreement that the invoice/bill submitted for funding is legitimate and not already discounted elsewhere

SC checks the checkbox and submits with timestamp recorded.

**Result:** `sellerDeclaration.accepted = true`, `sellerDeclaration.acceptedAt = timestamp`.  
SC KYC status changes to `DOCUMENTS_PENDING`.

---

### Step 4.5 — Ops KYC Review (via Chat)

**Actor:** Ops Team ↔ Sub-Contractor  
**Portal:** official_portal → Ops Dashboard → KYC Verification (Ops side)  
**Portal:** subcontractor-portal → Chat Tab (SC side)

Ops receives the KYC review task. The KYC review is conducted via a **real-time chat system** that allows:
- Ops to send text messages and file requests to the SC
- SC to respond and upload additional documents within the chat
- Ops to mark specific messages as "Action Required"
- Both parties to reply to specific messages, add reactions

**Ops actions during KYC chat:**
- Request clarification on any document
- Ask SC to re-upload a specific document if unclear/invalid
- Verify individual documents:
  - `POST /api/ops/kyc/documents/:id/verify` — approve or reject each document
- Verify the overall KYC: `POST /api/ops/kyc/:id/verify`

**Result:** SC KYC status changes through:  
`DOCUMENTS_PENDING → UNDER_REVIEW → COMPLETED` (or `REJECTED` if failed)

Once KYC is `COMPLETED`, the SC is **eligible to submit a CWCRF**.

---

## Phase 5 — CWCRF Submission (with Bill)

> **CWCRF** = Credit on Working Capital Request Form  
> This is the core financing application submitted by the Sub-Contractor.

### Step 5.1 — SC Fills CWCRF Form

**Actor:** Sub-Contractor  
**Portal:** subcontractor-portal → CWCRF Tab → New CWCRF

The CWCRF form has 4 sections:

**Section A — Buyer Details**
- Buyer (EPC) Company Name (auto-filled from linked EPC)
- Buyer GSTIN (auto-filled)
- Nature of relationship / project description

**Section B — Invoice / Bill Details**
- Invoice Number
- Invoice Date
- Invoice Amount (₹)
- Work Completion Period (Start Date → End Date)
- Project Name / Location

**Section C — Credit Request Details**
- Requested Funding Amount (₹)
- Requested Tenure (days): 30 / 45 / 60 / 90
- Urgency Level: `NORMAL | URGENT | CRITICAL`
- Reason for funding request

**Section D — Interest Preference**
- Preferred Interest Rate Range (Min % to Max %)
- Repayment Frequency: `MONTHLY | BULLET | MILESTONE_BASED`
- Any special conditions or notes

---

### Step 5.2 — SC Uploads Bill Inside CWCRF

**Actor:** Sub-Contractor  
**Portal:** subcontractor-portal → CWCRF Tab → Bill Upload Section

**The bill is uploaded as part of the CWCRF form** (not separately). SC uploads:
- **RA Bill / Invoice** (PDF or Image) — mandatory
- **Work Completion Certificate (WCC)** — if available
- **Measurement Sheet** — if applicable
- **Joint Measurement Certificate** — if applicable

> **Note:** If WCC or Measurement Sheet is not available at time of submission, SC can note it and upload later. However, Ops will hold verification until these are received.

---

### Step 5.3 — SC Pays Platform Fee (₹1,000)

**Actor:** Sub-Contractor  
**Portal:** subcontractor-portal → CWCRF Tab → Payment

Before the CWCRF can be submitted, the SC must pay the **Gryork Platform Processing Fee of ₹1,000**.

- Payment gateway is displayed
- SC completes payment
- Payment confirmation and transaction reference are recorded against the CWCRF
- This fee is **non-refundable** and covers Gryork's processing and verification costs

**Result:** Payment recorded. SC can now submit the CWCRF.

---

### Step 5.4 — SC Submits CWCRF

**Actor:** Sub-Contractor  
**Portal:** subcontractor-portal

SC reviews all filled sections and clicks **Submit**.

**Result:**
- CWCRF created in database with unique `cwcrfNumber`
- Status: `SUBMITTED`
- Ops team notified of new CWCRF submission
- SC receives confirmation with CWCRF number for tracking

---

## Phase 6 — Ops Review & Verification (Super Access)

### Step 6.1 — Ops Receives CWCRF

**Actor:** Ops Team  
**Portal:** official_portal → Ops Dashboard → CWCRF Queue

Ops sees all newly submitted CWCRFs in their queue. Each item shows:
- CWCRF Number
- Sub-Contractor Name
- EPC Company Name
- Invoice Amount
- Submission Date
- Current Status

---

### Step 6.2 — Ops Super Access Review

**Actor:** Ops Team  
**Portal:** official_portal → Ops Dashboard → CWCRF Detail

Ops has **super access** (elevated permissions) on each CWCRF. This means:

#### Ops can verify each part individually:

| Item | Action Available |
|------|----------------|
| Section A (Buyer Details) | ✅ Verify / ❌ Reject with reason |
| Section B (Invoice Details) | ✅ Verify / ❌ Reject with reason |
| Section C (Credit Request) | ✅ Verify / ❌ Reject with reason |
| Section D (Interest Preference) | ✅ Verify / ❌ Reject with reason |
| RA Bill / Invoice | ✅ Verify / ❌ Reject with reason |
| WCC (Work Completion Certificate) | ✅ Verify / ❌ Reject with reason |
| Measurement Sheet | ✅ Verify / ❌ Reject with reason |
| Payment Confirmation | ✅ Verify / ❌ Flag issue |

#### Ops Super Access Powers:

1. **Detach Document / Field** — Remove a specific uploaded document or field value that is incorrect, forcing the SC to re-upload or re-fill only that item
2. **Edit Field** — Directly correct minor data entry errors (e.g. wrong invoice number format, typo in GSTIN) with change log recorded
3. **Re-request from SC** — Send a chat message to the SC requesting a specific correction or re-upload (using the KYC chat channel)
4. **Add Internal Notes** — Add notes visible only to Ops / RMT team members
5. **Flag for Review** — Escalate any suspicious item to Admin/Founder for review

---

### Step 6.3 — Ops Verifies Bill

**Actor:** Ops Team  
**Portal:** official_portal → Ops Dashboard → Bill Verification

The bill is verified as part of the CWCRF:
- Ops previews the RA Bill document
- Confirms: `billNumber`, `amount`, `invoiceDate` match CWCRF Section B
- Verifies WCC is in order (if uploaded)
- Verifies Measurement Sheet (if applicable)
- Records verification decision: `POST /api/ops/bills/:id/verify`

---

### Step 6.4 — Ops Forwards to RMT

**Actor:** Ops Team  
**Portal:** official_portal → Ops Dashboard → CWCRF Detail → Forward to RMT

Once Ops has verified:
- ✅ All 4 CWCRF sections
- ✅ RA Bill + supporting documents
- ✅ SC KYC is completed
- ✅ EPC company is active

Ops clicks **"Forward to RMT"** → `POST /api/cwcrf/:id/rmt/move-to-queue`

**Result:** CWCRF status changes to `KYC_COMPLETED` → `BUYER_VERIFICATION_PENDING` →  forwarded to `RMT_QUEUE`.  
RMT team is notified of new case in their queue.

---

## Phase 7 — RMT Risk Assessment

### Step 7.1 — RMT Receives Case

**Actor:** RMT (Risk Management Team)  
**Portal:** official_portal → RMT Dashboard → Queue

RMT sees the case in their queue with a **fully compiled case view** containing:

| Section | Contents |
|---------|----------|
| Sub-Contractor Profile | Company name, constitution type, address, contact, GSTIN, PAN |
| SC KYC Documents | Pan, Aadhaar, GST cert, cancelled cheque (with verification status) |
| SC Bank Details | Account number, IFSC, bank name (verified status) |
| Seller Declaration | Accepted date and declaration text |
| EPC Company Details | Company name, CIN, GSTIN, status, verified date |
| Invoice / Bill | RA bill, amount, date, WCC, measurement sheet |
| CWCRF Form | All 4 sections (A, B, C, D) |
| Gryork Verification | Ops verification stamps on each section + bill |
| Payment Confirmation | ₹1,000 fee receipt |

---

### Step 7.2 — RMT Downloads Case Document

**Actor:** RMT  
**Portal:** official_portal → RMT Dashboard → Case Detail → Download

RMT has the option to **download the entire case as a PDF document**. This document is a formatted report containing all the information listed in Step 7.1 in a printable, shareable format — used for offline analysis, team discussion, or archival.

---

### Step 7.3 — RMT Conducts Risk Assessment

**Actor:** RMT  
**Portal:** offline analysis + official_portal → RMT Dashboard → Risk Assessment Form

RMT analyses the case — offline or in the portal — against a standardised **12-point risk checklist**:

| # | Checklist Item | Weight |
|---|---------------|--------|
| 1 | Business is registered (valid registration proof exists) | High |
| 2 | GST is active and matches submitted number | High |
| 3 | PAN verified and matches business entity | High |
| 4 | Address verified (matches documents) | Medium |
| 5 | Bank statement provided (if requested) | Medium |
| 6 | Bank account shows positive balance | Medium |
| 7 | Regular business transactions visible in bank statement | Medium |
| 8 | Has past projects with the EPC company | High |
| 9 | EPC relationship is valid and active | High |
| 10 | No blacklist match found | Critical |
| 11 | All required documents are complete | High |
| 12 | Documents appear authentic (no forgery indicators) | Critical |

**Scoring:**
- Each item is marked: Pass / Fail / Not Applicable
- Weighted scoring produces a **Risk Score from 0 to 100**
- Score maps to risk category:
  - **0–40 → LOW RISK**
  - **41–70 → MEDIUM RISK**
  - **71–100 → HIGH RISK**

---

### Step 7.4 — RMT Creates & Uploads Assessment Report

**Actor:** RMT  
**Portal:** official_portal → RMT Dashboard → Case Detail → Assessment Report

After completing the analysis, RMT:
1. Fills in the **Assessment Report** in the portal (or uploads an externally prepared PDF)
2. The report includes:
   - Seller Profile Summary (business age, transaction history, avg invoice value)
   - Risk Assessment Details (scoring per section with remarks)
   - Key Findings and Red Flags (if any)
   - RMT Recommendation: `PROCEED | REVIEW | REJECT`
3. Assigns the **Risk Category**: `LOW | MEDIUM | HIGH`
4. Writes RMT recommendation notes

---

### Step 7.5 — RMT Forwards to Ops

**Actor:** RMT  
**Portal:** official_portal → RMT Dashboard → Case Detail → Forward to Ops

RMT clicks **"Forward to Ops"**. The case is sent back to Ops with:
- Completed checklist (12 items)
- Risk Score
- Risk Category (Low / Medium / High)
- Assessment Report (uploaded document)
- RMT Recommendation

**Result:** Case status changes to → `RMT_APPROVED` (with risk category attached).

---

## Phase 8 — Ops Risk Triage & Forward to EPC

### Step 8.1 — Ops Reviews RMT Report

**Actor:** Ops Team  
**Portal:** official_portal → Ops Dashboard → Risk Triage Queue

Ops receives the case back from RMT with the risk classification. The workflow now branches based on **risk category**:

---

### Step 8.2A — LOW RISK → Direct Forward to EPC

**Actor:** Ops Team

If the RMT risk category is **LOW**:
- Ops reviews the assessment briefly to confirm no obvious issues
- Ops clicks **"Forward to EPC"** directly — no additional analysis required
- EPC company is notified that a case is pending their review

**Result:** Case status → `READY_FOR_COMPANY_REVIEW`

---

### Step 8.2B — MEDIUM RISK → Ops Analysis then Forward

**Actor:** Ops Team

If the RMT risk category is **MEDIUM**:
- Ops must conduct their own review of the risk assessment
- Ops may:
  - Request additional documents from SC via chat
  - Discuss internally with team
  - Add internal notes and observations
- Once satisfied, Ops makes the call to **Forward to EPC** or **Reject**
- If forwarding: EPC is notified

**Result:** Case status → `READY_FOR_COMPANY_REVIEW` (after Ops approves)

---

### Step 8.2C — HIGH RISK → Ops Decision Required

**Actor:** Ops Team (with escalation option)

If the RMT risk category is **HIGH**:
- Ops **must take action** — cannot auto-forward
- Options available:
  1. **Contact Sub-Contractor:** Ops reaches out to SC directly (phone, email) to clarify or resolve the high-risk factors. After satisfactory response, Ops may downgrade risk or proceed.
  2. **Super Access Forward to EPC:** Ops has the authority to override and forward to EPC even for HIGH risk cases, with a mandatory note explaining the override reason. EPC will see the HIGH risk flag and RMT report.
  3. **Reject Case:** Ops can reject the CWCRF entirely with documented reason. SC is notified.

**HIGH RISK additional requirement (Year 1 policy):** Any HIGH-risk case that is approved requires **Founder approval** via the ApprovalRequest workflow before reaching EPC.

**Result:** Case status → `READY_FOR_COMPANY_REVIEW` (if forwarded) or `RMT_REJECTED` (if rejected)

---

## Phase 9 — EPC Case Review & Bid

### Step 9.1 — EPC Receives Case Notification

**Actor:** EPC Company  
**Portal:** partner-portal → Cases Tab

EPC receives a notification that a new case is pending their review. They can see:
- Sub-Contractor name and profile
- Invoice details (from CWCRF Section B)
- Requested funding amount and tenure
- Gryork Ops verification stamps
- RMT Risk Category (LOW / MEDIUM / HIGH) and Assessment Report

---

### Step 9.2 — EPC Verifies Sub-Contractor Documents

**Actor:** EPC Company  
**Portal:** partner-portal → Cases → Case Detail → SC Documents Tab

EPC reviews all SC documents to confirm they recognise and trust this vendor:
- SC KYC documents (PAN, Aadhaar, GST cert, cancelled cheque)
- SC bank details
- SC profile (company name, address, constitution type)
- EPC marks each document as reviewed

---

### Step 9.3 — EPC Reviews RMT Risk Report

**Actor:** EPC Company  
**Portal:** partner-portal → Cases → Case Detail → Risk Report Tab

EPC reviews the RMT Assessment Report:
- Risk Category badge (Low / Medium / High)
- Checklist scores
- RMT recommendation
- Any red flags noted

---

### Step 9.4 — EPC Accepts Declaration

**Actor:** EPC Company  
**Portal:** partner-portal → Cases → Case Detail → Declaration Tab

EPC reads and accepts the **Buyer Declaration** which includes:
- Confirmation that the SC is a registered vendor on their projects
- Confirmation that the invoice/work described in the CWCRF is legitimate
- Agreement to the repayment terms
- Consent for Gryork to share the verified details with NBFCs

EPC checks the checkbox and signs off with timestamp.

---

### Step 9.5 — EPC Places Bid (Funding Terms)

**Actor:** EPC Company  
**Portal:** partner-portal → Cases → Case Detail → Bid Tab

EPC enters their **approved funding terms** for this case:

| Field | Description |
|-------|-------------|
| Approved Amount (₹) | Amount EPC is willing to have funded (≤ Invoice Amount) |
| Repayment Timeline | Duration within which EPC will repay NBFC: `30 | 45 | 60 | 90` days |
| Repayment Arrangement | How repayment is structured: e.g. `DIRECT_DEBIT | ESCROW | MILESTONE` |
| Notes | Any conditions or remarks |

EPC clicks **"Confirm & Forward"**.

**Result:**
- CWCRF `buyerVerification` fields populated
- Bid record created: status `SUBMITTED`
- Case status → `EPC_VERIFIED`
- Ops team notified that EPC has completed their review

---

## Phase 10 — CWCAF Generation & NBFC Selection

### Step 10.1 — Ops Generates CWCAF

**Actor:** Ops Team  
**Portal:** official_portal → Ops Dashboard → Case Detail → Generate CWCAF

Ops receives the EPC-verified case. Ops now **compiles the complete CWCAF document** — the Credit on Working Capital Analysis Form — which is the final, comprehensive dossier of the case sent to NBFCs.

The CWCAF is generated by the system combining all verified data:

| CWCAF Section | Source |
|--------------|--------|
| Seller Profile Summary | SC profile + RMT analysis |
| Buyer (EPC) Profile | Company profile + verification status |
| Invoice Details | CWCRF Section B + Ops-verified bill |
| Risk Assessment | RMT complete assessment report + scores |
| Credit Request Parameters | CWCRF Sections C & D + EPC bid terms |
| Gryork Verification Summary | All Ops verification stamps and sign-offs |
| Payment Confirmation | ₹1,000 fee receipt |
| Declaration Records | SC seller declaration + EPC buyer declaration |

Ops confirms the CWCAF is ready: `POST /api/cwcrf/:id/rmt/generate-cwcaf`

**Result:** CWCAF document generated. Case status → `CWCAF_READY`.

---

### Step 10.2 — Ops Selects NBFCs to Share With

**Actor:** Ops Team  
**Portal:** official_portal → Ops Dashboard → Case Detail → NBFC Selection Page

Ops sees a **dedicated NBFC Selection page** where they can:
1. View all **eligible NBFCs** — filtered automatically by:
   - NBFC's risk appetite (must accept the case's risk category)
   - NBFC's minimum/maximum ticket size (must cover the funding amount)
   - NBFC's monthly remaining capacity (must have enough funds available)
   - NBFC's sector preferences (must include Construction / Infrastructure)
   - NBFC's tenure preference (must accept the EPC's repayment timeline)
2. See each NBFC's **Match Score** (0–100%) and key LPS parameters
3. **Manually select** which NBFCs to send the CWCAF to (one or multiple)
4. Add a covering note for the NBFC (optional)

---

### Step 10.3 — CWCAF Sent to Selected NBFCs

**Actor:** Ops Team → System → NBFCs  
**Portal:** official_portal → Ops → Case → NBFC Selection → Send

Ops clicks **"Send CWCAF to Selected NBFCs"** → `POST /api/cwcrf/:id/share-with-nbfcs`

The system:
- Records each selected NBFC in `nbfcSharing[]` with `sharedAt` timestamp
- Sends notification to each selected NBFC
- Updates NBFC's `usedMonthlyCapacity` (reserved)

**Result:** Case status → `SHARED_WITH_NBFC`. Each selected NBFC can now access the CWCAF.

---

## Phase 11 — NBFC Review (In Progress)

> **This phase is currently being documented. The following is a high-level outline pending full specification.**

### Step 11.1 — NBFC Reviews CWCAF

**Actor:** NBFC  
**Portal:** partner-portal → NBFC Dashboard → Available Cases

NBFC logs into the partner portal and sees all CWCAFs shared with them. For each:
- Full CWCAF document is accessible
- Risk rating and Gryork verification status visible
- SC profile and EPC profile visible

---

### Step 11.2 — NBFC Submits Quotation

**Actor:** NBFC  
**Portal:** partner-portal → NBFC Dashboard → Case Detail → Submit Quote

NBFC reviews the case and submits a quotation:
- Interest Rate offered (% per month or per annum)
- Funding Duration (days)
- Additional terms or conditions
- Accept or Reject the case

---

*[Phase 11 onwards — NBFC processing, disbursement, repayment, and monitoring phases to be documented separately]*

---

## 14. Status Reference Tables

### CWCRF Status Flow

```
SUBMITTED
  ↓ Ops receives
KYC_COMPLETED  (or KYC_REQUIRED → KYC_IN_PROGRESS → KYC_COMPLETED)
  ↓ Ops forwards to RMT
RMT_QUEUE
  ↓ RMT analyses
UNDER_RISK_REVIEW
  ↓ RMT forwards back to Ops
RMT_APPROVED  (with Risk Category: LOW / MEDIUM / HIGH)
  ↓ Ops triages + forwards to EPC
BUYER_VERIFICATION_PENDING
  ↓ EPC reviews + bids
BUYER_APPROVED
  ↓ Ops generates CWCAF
CWCAF_READY
  ↓ Ops selects and sends to NBFCs
SHARED_WITH_NBFC
  ↓ NBFCs respond
QUOTES_RECEIVED
  ↓ ...continues
```

### Company (EPC) Status Flow

```
LEAD_CREATED → CREDENTIALS_CREATED → DOCS_SUBMITTED → ACTIVE
                                                     ↓
                                          ACTION_REQUIRED (docs rejected)
                                                     ↓
                                          DORMANT / SUSPENDED / BLACKLISTED
```

### Sub-Contractor Status Flow

```
LEAD_CREATED → PROFILE_INCOMPLETE → PROFILE_COMPLETED →
KYC_PENDING → KYC_IN_PROGRESS → KYC_COMPLETED →
DOCS_SUBMITTED → RMT_PENDING → RMT_APPROVED / RMT_REJECTED →
EPC_VALIDATION_PENDING → EPC_VALIDATED / EPC_REJECTED →
ACTIVE → DORMANT → COOLING_PERIOD → BLACKLISTED
```

### SC KYC Status Flow

```
NOT_STARTED → DOCUMENTS_PENDING → UNDER_REVIEW → COMPLETED / REJECTED
```

---

## 15. API Endpoint Map by Phase

| Phase | Action | Method | Endpoint | Role |
|-------|--------|--------|----------|------|
| 1.2 | Generate GryLink | `POST` | `/api/sales/companies/:id/grylink` | sales |
| 1.3 | Validate token | `GET` | `/api/grylink/validate/:token` | public |
| 1.3 | Set password | `POST` | `/api/grylink/set-password/:token` | public |
| 1.4 | Upload EPC docs | `POST` | `/api/company/documents` | epc |
| 2.2 | Verify EPC company | `POST` | `/api/ops/companies/:id/verify` | ops |
| 3.1 | EPC adds SC list | `POST` | `/api/company/subcontractors` | epc |
| 4.4 | Accept declaration | `POST` | `/api/subcontractor/declaration` | subcontractor |
| 4.5 | KYC chat (Ops) | `POST` | `/api/ops/kyc/:id/chat` | ops |
| 4.5 | KYC chat (SC) | `POST` | `/api/ops/kyc/:id/chat` | subcontractor |
| 4.5 | Verify KYC document | `POST` | `/api/ops/kyc/documents/:id/verify` | ops |
| 4.5 | Complete KYC | `POST` | `/api/ops/kyc/:id/complete` | ops |
| 5.4 | Submit CWCRF | `POST` | `/api/cwcrf` | subcontractor |
| 6.3 | Verify bill | `POST` | `/api/ops/bills/:id/verify` | ops |
| 6.4 | Forward to RMT | `POST` | `/api/cwcrf/:id/rmt/move-to-queue` | ops |
| 7.4 | Upload RMT report | `POST` | `/api/cases/:id/risk-assessment` | rmt |
| 8.2 | Forward to EPC | `POST` | `/api/cases/:id/review` | ops |
| 9.5 | EPC bid + verify | `POST` | `/api/cwcrf/:id/buyer/verify` | epc |
| 9.5 | EPC reject | `POST` | `/api/cwcrf/:id/buyer/reject` | epc |
| 10.1 | Generate CWCAF | `POST` | `/api/cwcrf/:id/rmt/generate-cwcaf` | ops/rmt |
| 10.2 | Match NBFCs for case | `GET` | `/api/nbfc/match/:caseId` | ops/rmt |
| 10.3 | Share with NBFCs | `POST` | `/api/cwcrf/:id/share-with-nbfcs` | ops/rmt |
| 11.1 | NBFC views available | `GET` | `/api/cwcrf/nbfc/available` | nbfc |
| 11.2 | NBFC submits quote | `POST` | `/api/cwcrf/:id/nbfc/quote` | nbfc |
| 11.2 | NBFC responds to case | `POST` | `/api/nbfc/:caseId/respond` | nbfc |

---

*Document maintained by: Gryork Product & Engineering Team*  
*Last updated: February 19, 2026*
