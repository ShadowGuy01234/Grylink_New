# Gryork Platform — Workflow Audit Report

**Audit Date:** February 20, 2026  
**Audited Against:** `doc/GRYORK_PLATFORM_WORKFLOW.md` (v1.0, Feb 19 2026)  
**Auditor:** Automated codebase analysis

---

## Executive Summary

| Phase | Description | Doc Status | Audit Result | Notes |
|-------|-------------|-----------|--------------|-------|
| **Phase 1** | EPC Company Onboarding | Complete | **IMPLEMENTED** | All steps verified. Sales form fields (city, state, gstNumber, notes) confirmed present in frontend but **missing in backend `createCompanyLead`**. |
| **Phase 2** | EPC Document Verification | Complete | **IMPLEMENTED** | All steps verified. |
| **Phase 3** | SC Registration via EPC | Complete | **IMPLEMENTED** | All steps verified. |
| **Phase 4** | SC Onboarding & KYC | Complete | **IMPLEMENTED** | All steps verified. |
| **Phase 5** | CWCRF Submission | Partial | **PARTIAL** | Form + submit work. Bill is selected-not-uploaded. Payment not implemented. |
| **Phase 6** | Ops CWCRF Review (Super Access) | Not built | **PARTIAL** (was not built) | **NEW:** CWCRF tab + section verify + Forward to RMT now exist in OpsDashboardNew. Detach/edit/re-request still missing. |
| **Phase 7** | RMT Risk Assessment | Partial | **PARTIAL** | Queue, checklist, CWCAF gen exist. PDF download not implemented. Forward to Ops now exists. |
| **Phase 8** | Ops Risk Triage & Forward to EPC | Not built | **PARTIAL** (was not built) | **NEW:** Risk Triage sub-tab in CWCRF tab exists with forward/reject. Low/Med/High branching is basic. Founder approval trigger not implemented. |
| **Phase 9** | EPC Case Review & Bid | Partial | **PARTIAL** | Buyer declaration in DashboardPage. SC doc review not implemented. Full RMT report not implemented. Sequential flow not implemented. |
| **Phase 10** | CWCAF Generation & NBFC Selection | Partial | **PARTIAL** | CWCAF gen (wrong actor  still in RMT). NBFC selection UI not implemented. Share endpoint exists, no dedicated UI page. |
| **Phase 11** | NBFC Review | Partial | **PARTIAL** | NBFC sees available CWCAFs. Quotation available. LPS available. Post-quotation (due diligence, sanction, disbursement) not implemented. |

---

## Phase-by-Phase Detailed Audit

---

## Phase 1 — EPC Company Onboarding

### Step 1.1 — Sales Creates EPC Lead
- **Backend**: EXISTS — `POST /api/sales/leads` in `backend/routes/sales.js:9`. Calls `salesService.createCompanyLead()`.
- **Frontend**: EXISTS — `SalesDashboard.tsx` has Create Lead modal with fields: `companyName`, `ownerName`, `email`, `phone`, `address`, **`gstNumber`**, **`city`**, **`state`**, **`notes`** (line 13-15). Form renders all fields including GST, City (text), State (dropdown with all Indian states/UTs), and Notes (textarea).
- **API Connection**: EXISTS — `salesApi.createLead(formData)` at line 42 sends all form data.
- **Status**:  PARTIAL
- **Gap Details**: The frontend sends `gstNumber`, `city`, `state`, `notes`  but the backend `salesService.createCompanyLead()` at line 42 only destructures `{ companyName, ownerName, email, phone, address }` and **ignores** the other fields. The Company model has `gstin` field but no `city`/`state` fields. The data is sent from the frontend but silently dropped by the backend. **Action needed:** Update `createCompanyLead` to save `gstNumber  gstin`, `city`, `state`, and initial `salesNotes` from the `notes` field.

### Step 1.2  GryLink Generated & Sent
- **Backend**: EXISTS  GryLink creation happens automatically inside `salesService.createCompanyLead()` (lines 62-80). Also `POST /api/sales/leads/:id/resend-link` for resend.
- **Frontend**: EXISTS  `SalesDashboard.tsx` shows leads. GryLinks page referenced in the codebase.
- **API Connection**: EXISTS  `salesApi.resendLink(id)` available.
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 1.3 — EPC Onboards at link.gryork.com
- **Backend**: EXISTS — `GET /api/grylink/validate/:token` (grylink.js:6), `POST /api/grylink/set-password` (grylink.js:21)
- **Frontend**: EXISTS — `grylink-portal/src/pages/OnboardingPage.tsx`
- **API Connection**:  EXISTS
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 1.4 — EPC Uploads Company Documents
- **Backend**: EXISTS — `POST /api/company/documents` (company.js:8)
- **Frontend**: EXISTS — `partner-portal/src/components/dashboard/DocumentsSection.tsx`
- **API Connection**: EXISTS — `companyApi.uploadDocuments(data)`
- **Status**:  IMPLEMENTED
- **Gap Details**: None

---

## Phase 2 — EPC Document Verification

### Step 2.1 — Ops Reviews EPC Documents
- **Backend**: EXISTS — `GET /api/ops/pending` (ops.js:148), document preview/verification endpoints
- **Frontend**: EXISTS — `OpsDashboardNew.tsx` → Companies tab (line 476)
- **API Connection**: EXISTS — `opsApi.getCompanyDocuments(id)`
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 2.2 — Ops Approves/Rejects EPC
- **Backend**: EXISTS — `POST /api/ops/companies/:id/verify` (ops.js:9)
- **Frontend**:  EXISTS — Companies tab in OpsDashboardNew
- **API Connection**:  EXISTS
- **Status**:  IMPLEMENTED
- **Gap Details**: None

---

## Phase 3 — Sub-Contractor Registration via EPC

### Step 3.1 — EPC Uploads SC List
- **Backend**: EXISTS — `POST /api/company/subcontractors` (company.js:60) + `POST /api/company/subcontractors/bulk` (company.js:85)
- **Frontend**: EXISTS — `partner-portal/src/components/dashboard/SubContractorsSection.tsx`
- **API Connection**:  EXISTS
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 3.2 — Sales Contacts SC, Logs Contact
- **Backend**: EXISTS — `POST /api/sales/subcontractors/:id/contact-log` (sales.js:105), `PATCH /api/sales/subcontractors/:id/contacted` (sales.js:95)
- **Frontend**: EXISTS — `SalesDashboard.tsx` → sub-contractors table with "Mark Contacted" button + contact notes modal
- **API Connection**: EXISTS — `salesApi.markContacted()`, `salesApi.addContactLog()`
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 3.3 — SC Self-Registers
- **Backend**: EXISTS — Registration via auth routes (`POST /api/auth/register-subcontractor`)
- **Frontend**: EXISTS — `subcontractor-portal/src/pages/RegisterPage.tsx`
- **API Connection**:  EXISTS
- **Status**:  IMPLEMENTED
- **Gap Details**: None

---

## Phase 4 — Sub-Contractor Onboarding & KYC

### Step 4.1 — SC Completes Basic Profile
- **Backend**: EXISTS — `PUT /api/subcontractor/profile` (subcontractor.js:23)
- **Frontend**: EXISTS — `subcontractor-portal/src/pages/ProfileCompletionPage.tsx`
- **API Connection**:  EXISTS
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 4.2 — SC Uploads KYC Documents
- **Backend**: EXISTS — `POST /api/subcontractor/kyc` (subcontractor.js:41 area)
- **Frontend**: EXISTS — `subcontractor-portal/src/pages/KycUploadPage.tsx`
- **API Connection**: EXISTS — `scApi.uploadKyc(formData)`
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 4.3 — SC Submits Bank Details
- **Backend**: EXISTS — Bank details section in subcontractor routes
- **Frontend**: EXISTS — Bank details section in `KycUploadPage.tsx`
- **API Connection**:  EXISTS
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 4.4 — SC Accepts Seller Declaration
- **Backend**: EXISTS — `POST /api/subcontractor/declaration/accept` (subcontractor.js:325-327), `GET /api/subcontractor/declaration/status` (subcontractor.js:340-342)
- **Frontend**:  EXISTS — `subcontractor-portal/src/pages/SellerDeclarationPage.tsx`
- **API Connection**:  EXISTS — `scApi.acceptDeclaration()`, `scApi.getDeclarationStatus()`
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 4.5 — Ops KYC Review via Chat
- **Backend**:  EXISTS — `GET /api/ops/kyc/pending` (ops.js:189), `GET /api/ops/kyc/:id` (ops.js:199), `POST /api/ops/kyc/:id/verify` (ops.js:209), `POST /api/ops/kyc/documents/:id/verify` (ops.js:223), `POST /api/ops/kyc/:id/complete` (ops.js:54), `GET+POST /api/ops/kyc/:id/chat` (ops.js:268-295), `POST /api/ops/kyc/:id/chat/read` (ops.js:305), reaction endpoints
- **Frontend**:  EXISTS — OpsDashboardNew.tsx → KYC tab (line 497)
- **API Connection**:  EXISTS
- **Status**:  IMPLEMENTED
- **Gap Details**: None

---

## Phase 5 — CWCRF Submission (with Bill)  PARTIALLY BUILT

### Step 5.1 — SC Fills CWCRF Form (4 Sections)
- **Backend**:  EXISTS — `POST /api/cwcrf` (cwcrf.js:19). `cwcrfService.submitCwcRf()` accepts all 4 sections (sellerDetails, invoiceDetails/buyerDetails, cwcRequest, interestPreference).
- **Frontend**:  EXISTS — `subcontractor-portal/src/pages/CwcrfSubmissionPage.tsx` (multi-step form). Steps match: Bill Selection → Section A → Section B → Section C → Section D → Review & Submit.
- **API Connection**:  EXISTS — `scApi.submitCwcrf(data)`
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 5.2 — Bill Uploaded INSIDE CWCRF
- **Backend**:  EXISTS but unused — `POST /api/subcontractor/bill-with-cwcrf` (subcontractor.js:107-109) exists. The SC API has `scApi.submitBillWithCwcrf(formData)` in `subcontractor-portal/src/api/index.ts:49`.
- **Frontend**:  PARTIAL — `CwcrfSubmissionPage.tsx` Step 1 is "Bill Selection" which loads pre-uploaded **verified** bills (line 116: `b.status === 'VERIFIED'`) and lets SC select one. It does NOT upload a new bill inline.
- **API Connection**:  PARTIAL — The `submitBillWithCwcrf` API exists in `subcontractor-portal/src/api/index.ts:49-50` but is **not used** by `CwcrfSubmissionPage.tsx`.
- **Status**:  PARTIAL
- **Gap Details**: Doc says bill should be uploaded as part of CWCRF form. Currently: bill is uploaded separately (via Bills tab), must be verified first, then selected in CWCRF Step 1. Backend endpoint for combined upload exists but frontend doesn't use it. WCC and Measurement Sheet upload during CWCRF is also not implemented (they're tied to the bill).

### Step 5.3 — SC Pays ₹1,000 Platform Fee
- **Backend**:  PARTIAL — The `CwcRf` model has fields: `platformFeePaid` (Boolean, default false), `platformFeeAmount` (Number, default 1000), `paymentReference` (String) at CwcRf.js:246-248. The `submitCwcRf` service accepts `paymentReference` from data (cwcrfService.js:112). BUT there is **no dedicated payment route** — no `POST /api/cwcrf/:id/payment`, no Razorpay/payment gateway integration.
- **Frontend**:  MISSING — No payment UI in `CwcrfSubmissionPage.tsx`. No payment step between Section D and Submit.
- **API Connection**:  MISSING — No payment API call.
- **Status**:  NOT IMPLEMENTED
- **Gap Details**: Model fields exist for recording payment, but no payment gateway integration, no payment processing route, no frontend payment step.

### Step 5.4 — SC Submits CWCRF
- **Backend**:  EXISTS — `POST /api/cwcrf` (cwcrf.js:19)
- **Frontend**:  EXISTS — Review & Submit step in CwcrfSubmissionPage.tsx
- **API Connection**:  EXISTS
- **Status**:  IMPLEMENTED
- **Gap Details**: None

---

## Phase 6 — Ops Review & Verification (Super Access)  PARTIALLY BUILT

### Step 6.1 — Ops Sees CWCRF Queue
- **Backend**:  EXISTS — `GET /api/cwcrf/ops/queue` (cwcrf.js:186-202). `cwcrfService.getCwcRfsForOps()` at cwcrfService.js:169.
- **Frontend**:  EXISTS — **NEW:** `OpsDashboardNew.tsx` now has a **"cwcrf" tab** (line 135, 346, 530). The `CwcrfOpsTab` component (line 3529) renders with sub-tabs: "Section Verify (Phase 6)" and "Risk Triage (Phase 8)".
- **API Connection**:  EXISTS — `opsApi.getCwcrfQueue()` at official_portal/src/api/index.ts:112.
- **Status**:  IMPLEMENTED
- **Gap Details**: None — the CWCRF queue tab has been built.

### Step 6.2 — Ops Section-by-Section Verification + Super Access
- **Backend**:  EXISTS — `POST /api/cwcrf/:id/ops/verify-section` (cwcrf.js:203-228). Accepts `section` parameter (sectionA/sectionB/sectionC/sectionD/raBill/wcc/measurementSheet). `cwcrfService.opsVerifySection()` at cwcrfService.js:187.
- **Frontend**:  EXISTS — `CwcrfOpsTab` (OpsDashboardNew.tsx:3529+) shows CWCRF SECTIONS with verify checkboxes for each section (sectionA, sectionB, sectionC, sectionD, raBill, wcc, measurementSheet) with notes fields and verify buttons.
- **API Connection**:  EXISTS — `opsApi.verifyCwcrfSection(id, { section, verified, notes })` at official_portal/src/api/index.ts:116-117.
- **Super Access Powers**:
  -  Verify each section individually
  -  **Detach Document** — No `PATCH /api/ops/cwcrf/:id/sections/:section/detach` endpoint exists. No UI for detaching.
  -  **Edit Field** — No edit field endpoint. No inline editing UI.
  -  **Re-request from SC** — No CWCRF-specific chat channel. KYC chat exists but not linked to CWCRF items.
  -  **Add Internal Notes per CWCRF** — Only per-section notes exist, no global CWCRF internal notes panel.
  -  **Flag for Review** — No escalation/flag endpoint to Admin/Founder.
- **Status**:  PARTIAL
- **Gap Details**: Section-by-section verify works (both backend and frontend). Super Access powers (detach, edit, re-request, flag) are entirely missing.

### Step 6.3 — Ops Verifies Bill
- **Backend**:  EXISTS — `POST /api/ops/bills/:id/verify` (ops.js:34)
- **Frontend**:  EXISTS — Bills tab in OpsDashboardNew.tsx (line 487)
- **API Connection**:  EXISTS
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 6.4 — Ops Forwards to RMT
- **Backend**:  EXISTS — `POST /api/cwcrf/:id/rmt/move-to-queue` (cwcrf.js:228-252)
- **Frontend**:  EXISTS — **NEW:** The `CwcrfOpsTab` in OpsDashboardNew.tsx has a "Forward to RMT" button per CWCRF when all sections are verified. The `onForwardToRmt` handler calls `opsApi.forwardCwcrfToRmt(id)`.
- **API Connection**:  EXISTS — `opsApi.forwardCwcrfToRmt(id, notes)` at official_portal/src/api/index.ts:114-115.
- **Status**:  IMPLEMENTED
- **Gap Details**: None — this was previously marked as missing but is now built.

---

## Phase 7 — RMT Risk Assessment  PARTIALLY BUILT

### Step 7.1 — RMT Receives Case with Full Details
- **Backend**:  EXISTS — `GET /api/cwcrf/rmt/queue` (cwcrf.js:257-273). Also `GET /api/rmt/dashboard` (rmt.js:12).
- **Frontend**:  EXISTS — `official_portal/src/pages/RmtDashboard.tsx` (1309 lines). Queue view with case details.
- **API Connection**:  EXISTS — `cwcrfApi.getRmtQueue()`
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 7.2 — Download Full Case as PDF
- **Backend**:  MISSING — No PDF generation endpoint. No server-side PDF library (puppeteer/pdfkit).
- **Frontend**:  MISSING — No download button in RmtDashboard.tsx. No client-side PDF generation (jsPDF/react-pdf).
- **API Connection**:  MISSING
- **Status**:  NOT IMPLEMENTED
- **Gap Details**: Entire PDF download feature is missing. RMT can view case data in the UI only.

### Step 7.3 — 12-Point Risk Checklist & Scoring
- **Backend**:  EXISTS — `POST /api/cases/:id/risk-assessment` (cases.js:73+). Accepts riskScore, riskLevel, assessment, recommendation, notes.
- **Frontend**:  EXISTS — RmtDashboard.tsx has assessment form (Complete Assessment button at line 506).
- **API Connection**:  EXISTS — `rmtApi.submitRiskAssessment(caseId, data)`
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 7.4 — Upload/Create Assessment Report
- **Backend**:  EXISTS — Same endpoint as 7.3. CWCAF generation includes `riskAssessmentDetails` with `sellerProfileSummary`, individual risk scores (invoiceAging, buyerCreditworthiness, sellerTrackRecord).
- **Frontend**:  EXISTS — Generate CWCAF modal in RmtDashboard.tsx (line 821+) with full assessment form.
- **API Connection**:  EXISTS
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 7.5 — RMT Forwards to Ops
- **Backend**:  EXISTS — `POST /api/cwcrf/:id/rmt/forward-to-ops` (cwcrf.js:274-297). `cwcrfService.rmtForwardToOps()` at cwcrfService.js:233.
- **Frontend**:  EXISTS — **NEW:** RmtDashboard.tsx now has a "Forward to Ops" button (line 518-528) that appears when `cwcrf.status === "CWCAF_READY"`. Calls `cwcrfApi.rmtForwardToOps(cwcrf._id, "Risk assessment complete")`.
- **API Connection**:  EXISTS — `cwcrfApi.rmtForwardToOps(cwcrfId, notes)` at official_portal/src/api/index.ts:180-181.
- **Status**:  IMPLEMENTED
- **Gap Details**: The "Forward to Ops" button only appears for status `CWCAF_READY`, meaning RMT must generate CWCAF first, then forward to Ops. Per the doc: RMT should forward to Ops **with just the risk assessment**, and then Ops should generate CWCAF after EPC verifies. The current flow still has RMT generating the CWCAF before forwarding, which is architecturally inverted from the doc. However, the forward-to-ops action itself works.

---

## Phase 8 — Ops Risk Triage & Forward to EPC  PARTIALLY BUILT

### Step 8.1 — Ops Reviews RMT Report
- **Backend**:  EXISTS — `GET /api/cwcrf/ops/queue?phase=triage` returns RMT_APPROVED CWCRFs. `cwcrfService.getCwcRfsForOps()` filters accordingly.
- **Frontend**:  EXISTS — **NEW:** `CwcrfOpsTab` in OpsDashboardNew.tsx has a "Risk Triage (Phase 8)" sub-tab (line 3556) that shows `triageCwcrfs`. Expanded view shows RMT recommendation banner, risk category badge (LOW/MEDIUM/HIGH with color coding), invoice amount, tenure, and submission date.
- **API Connection**:  EXISTS — `opsApi.getCwcrfTriageQueue()` at official_portal/src/api/index.ts:113.
- **Status**:  IMPLEMENTED
- **Gap Details**: None — the triage queue now exists.

### Step 8.2A — LOW Risk → Direct Forward to EPC
- **Backend**:  EXISTS — `POST /api/cwcrf/:id/ops/triage` with `action: "forward_to_epc"` (cwcrf.js:297-318). `cwcrfService.opsTriage()` at cwcrfService.js:256.
- **Frontend**:  EXISTS — **NEW:** Triage expanded view in `CwcrfOpsTab` has a " Forward to EPC" button (line ~3838). Works for any risk level.
- **API Connection**:  EXISTS — `opsApi.triageCwcrf(id, { action: "forward_to_epc", notes })`.
- **Status**:  IMPLEMENTED
- **Gap Details**: The forward button works for ALL risk levels uniformly — no distinct UX for LOW vs MEDIUM vs HIGH.

### Step 8.2B — MEDIUM Risk → Ops Analysis then Forward
- **Backend**:  PARTIAL — Same endpoint as 8.2A. No separate medium-risk analysis workflow.
- **Frontend**:  PARTIAL — Notes field exists for adding analysis. No dedicated "Ops Analysis" section for medium risk.
- **API Connection**:  PARTIAL — Same as 8.2A
- **Status**:  PARTIAL
- **Gap Details**: Medium-risk cases can be forwarded or rejected with notes, but there's no distinct medium-risk analysis flow (e.g., request additional docs, internal discussion thread).

### Step 8.2C — HIGH Risk → Contact SC or Override Forward
- **Backend**:  PARTIAL — `ApprovalRequest` model exists. Forward/reject works. But no dedicated HIGH-risk override-with-reason flow or Founder approval trigger from this screen.
- **Frontend**:  PARTIAL — **NEW:** A warning banner appears for HIGH risk cases: " High-risk case: Ensure Founder / Senior Ops approval has been obtained before forwarding to EPC" (line ~3810). But there's no button to **trigger** Founder approval — it's just informational text.
- **API Connection**:  MISSING — No Founder approval trigger from triage screen.
- **Status**:  PARTIAL
- **Gap Details**: HIGH risk warning exists but the actual Founder approval workflow (create ApprovalRequest, wait for approval, then proceed) is not wired in. Ops can still override-forward HIGH risk cases without a formal approval step. "Contact SC" flow (chat from triage screen) not implemented.

---

## Phase 9 — EPC Case Review & Bid  PARTIALLY BUILT

### Step 9.1 — EPC Sees Case Notification
- **Backend**:  EXISTS — `GET /api/cases` (cases.js:23) scoped to `epc` role by `companyId`. Also `GET /api/cwcrf/buyer/pending` (cwcrf.js:103-127).
- **Frontend**:  EXISTS — `partner-portal/src/pages/DashboardPage.tsx` → "Cases & Bills" tab (line 366). `CasesAndBillsSection.tsx` component shows case list.
- **API Connection**:  EXISTS — `casesApi.getCases()`, `cwcrfApi.getPendingVerifications()`
- **Status**:  PARTIAL
- **Gap Details**: Cases are listed but there's no **notification system** (no push/email/in-app notification when a case arrives — EPC must manually check the tab).

### Step 9.2 — EPC Verifies SC Documents
- **Backend**:  MISSING — No endpoint for EPC to view/approve individual SC KYC documents within a case context.
- **Frontend**:  MISSING — `CasesAndBillsSection.tsx` shows basic case info (risk badge, bill document). There's no SC KYC document review tab, no SC bank details view, no SC profile display within the case detail.
- **API Connection**:  MISSING
- **Status**:  NOT IMPLEMENTED
- **Gap Details**: EPC cannot review SC documents (PAN, Aadhaar, GST cert, cancelled cheque), bank details, or full profile within the case view.

### Step 9.3 — EPC Reviews RMT Risk Report
- **Backend**:  PARTIAL — Case data includes `cwcaf.riskCategory` and `cwcaf.riskAssessmentDetails?.totalScore` but not full checklist.
- **Frontend**:  PARTIAL — `CasesAndBillsSection.tsx` shows risk category badge (line 91-98) and total risk score (line 275-280). But does NOT display the full 12-item checklist, individual section scores, RMT recommendation, or assessment report text.
- **API Connection**:  PARTIAL — Data comes with case payload.
- **Status**:  PARTIAL
- **Gap Details**: Only risk category badge + total score shown. Full RMT assessment report (checklist scores, findings, red flags, recommendation) is not displayed.

### Step 9.4 — EPC Accepts Buyer Declaration
- **Backend**:  EXISTS — `buyerVerification.buyerDeclaration` object in CwcRf model (CwcRf.js:175-179) with `accepted`, `acceptedAt`, `ipAddress` fields. `POST /api/cwcrf/:id/buyer/verify` accepts declaration data.
- **Frontend**:  EXISTS — **NEW:** `DashboardPage.tsx` has a buyer declaration checkbox (line 1270-1279) with declaration text. `cwcrfVerifyForm.buyerDeclarationAccepted` must be checked before approval (line 1292 disables button if unchecked). Sent as `buyerDeclaration: { accepted: true }` in the verify payload (line 227).
- **API Connection**:  EXISTS — Included in `cwcrfApi.verifyCwcrf()` call.
- **Status**:  IMPLEMENTED
- **Gap Details**: Buyer declaration exists but is **embedded in the approval form** — it's not a separate dedicated step/tab as the doc envisions. The sequential 4-step flow (9.2→9.3→9.4→9.5) is not modelled; these are all on one screen.

### Step 9.5 — EPC Enters Bid Terms (Amount + Timeline)
- **Backend**:  EXISTS — `POST /api/cwcrf/:id/buyer/verify` (cwcrf.js:128-152). Accepts `approvedAmount`, `repaymentTimeline`, `repaymentArrangement`.
- **Frontend**:  EXISTS — Two implementations exist:
  1. `partner-portal/src/pages/CwcrfVerificationPage.tsx` (550 lines) — standalone page at `/cwcrf-verification` with full bid form (approved amount, timeline dropdown, arrangement select, notes).
  2. `partner-portal/src/pages/DashboardPage.tsx` — integrated in the dashboard modal (line 220+) with same form fields plus buyer declaration.
- **API Connection**:  EXISTS — `cwcrfApi.verifyCwcrf(cwcrfId, data)`
- **Status**:  IMPLEMENTED
- **Gap Details**: The bid form works but is not part of a sequential guided flow (Steps 9.2→9.5 should be sequential). Two separate implementations exist (standalone page + dashboard modal) which could cause confusion.

---

## Phase 10 — CWCAF Generation & NBFC Selection  PARTIALLY BUILT

### Step 10.1 — Ops Generates CWCAF
- **Backend**:  EXISTS — `POST /api/cwcrf/:id/rmt/generate-cwcaf` (cwcrf.js:318-342). Authorized for both `rmt` and `ops` roles.
- **Frontend**:  WRONG ACTOR — CWCAF generation modal is in `RmtDashboard.tsx` (line 232, 821+), NOT in `OpsDashboardNew.tsx`. The doc says **Ops** should generate the CWCAF after receiving the EPC-verified case. Currently, RMT generates it.
- **API Connection**:  EXISTS — `cwcrfApi.generateCwcaf(cwcrfId, data)` in official_portal/src/api/index.ts.
- **Status**:  PARTIAL
- **Gap Details**: Backend endpoint allows both Ops and RMT. But the UI is only in the RMT dashboard. Need to add CWCAF generation capability to OpsDashboardNew.tsx for the correct workflow. Per current flow: RMT generates CWCAF → forwards to Ops → Ops triages. Doc says: RMT assesses → forwards to Ops → Ops triages → EPC verifies → Ops generates CWCAF.

### Step 10.2 — Ops Selects NBFCs to Share With
- **Backend**:  EXISTS — `GET /api/cwcrf/:id/matching-nbfcs` (cwcrf.js:342-358). `cwcrfService.getMatchingNbfcs()` at cwcrfService.js:288 returns eligible NBFCs with match scoring based on risk appetite, ticket size, tenure, etc. Also `GET /api/nbfc/match/:caseId` (nbfc.js:132).
- **Frontend**:  MISSING — No dedicated NBFC Selection page in `official_portal`. The `opsApi.getMatchingNbfcs(cwcrfId)` and `opsApi.shareWithNbfcs(cwcrfId, nbfcIds)` API calls exist (official_portal/src/api/index.ts:120-123) but **no UI page uses them**. There is an `NbfcInviteTab` in OpsDashboardNew.tsx (line 514) but this is for NBFC onboarding, not for case-level NBFC selection.
- **API Connection**:  PARTIAL — API calls defined but not wired to any UI.
- **Status**:  NOT IMPLEMENTED (UI missing)
- **Gap Details**: Backend is fully ready (matching algorithm + share endpoint). Frontend API wrappers are ready. But there is NO UI page where Ops can see matched NBFCs, view match scores, select checkboxes, and click "Send CWCAF". This is a critical missing page.

### Step 10.3 — CWCAF Sent to Selected NBFCs
- **Backend**:  EXISTS — `POST /api/cwcrf/:id/share-with-nbfcs` (cwcrf.js:359-385). `cwcrfService.shareWithNbfcs()` records sharing, updates status to `SHARED_WITH_NBFC`.
- **Frontend**:  MISSING — No trigger button. Same gap as 10.2.
- **API Connection**:  PARTIAL — `opsApi.shareWithNbfcs(cwcrfId, nbfcIds)` exists but unused.
- **Status**:  NOT IMPLEMENTED (UI missing)
- **Gap Details**: Backend fully works. Frontend trigger missing because the NBFC Selection page doesn't exist.

---

## Phase 11 — NBFC Review  PARTIALLY BUILT

### Step 11.1 — NBFC Sees Available CWCAFs
- **Backend**:  EXISTS — `GET /api/cwcrf/nbfc/available` (cwcrf.js:386-408)
- **Frontend**:  EXISTS — `partner-portal/src/pages/NbfcDashboard.tsx` fetches `cwcrfApi.getAvailableCwcrfs()` (line 57) and shows count.
- **API Connection**:  EXISTS
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 11.2 — NBFC Submits Quotation
- **Backend**:  EXISTS — `POST /api/cwcrf/:id/nbfc/quote` (cwcrf.js:409-445). Also `POST /api/nbfc/:caseId/respond` (nbfc.js:195-226).
- **Frontend**:  EXISTS — `partner-portal/src/pages/NbfcQuotationPage.tsx` with interest rate, tenure, terms form. Pre-populates from LPS preferred rate.
- **API Connection**:  EXISTS — `cwcrfApi.submitQuotation(cwcrfId, data)`
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 11.3 — NBFC Manages LPS
- **Backend**:  EXISTS — `GET /api/nbfc/lps` (nbfc.js:50), `PUT /api/nbfc/lps` (nbfc.js:63)
- **Frontend**:  EXISTS — `partner-portal/src/pages/LpsManagementPage.tsx` with full LPS form (interestRatePolicy, riskAppetite, ticketSize, monthlyCapacity, tenurePreference, sectorPreferences).
- **API Connection**:  EXISTS — `nbfcApi.getLps()`, `nbfcApi.updateLps(data)`
- **Status**:  IMPLEMENTED
- **Gap Details**: None

### Step 11.4 — Post-Quotation NBFC Process (Due Diligence, Sanction, Disbursement)
- **Backend**:  MISSING — No endpoints for due diligence checklist, sanction letter, disbursement instruction.
- **Frontend**:  MISSING — No post-quotation UI.
- **API Connection**:  MISSING
- **Status**:  NOT IMPLEMENTED
- **Gap Details**: Entire post-quotation workflow not built. This is documented as "in progress / to be specified".

---

## Cross-Cutting Concerns

### Notification System
- **Status**:  NOT IMPLEMENTED
- **Details**: `config/email.js` exists for email sending. Email is used for GryLink onboarding. But there are **no automated notifications** at workflow transitions (e.g., when CWCRF is submitted, when case is forwarded to RMT, when EPC has pending review, when NBFC receives CWCAF). No in-app notification system.

### PDF Generation Capability
- **Status**:  NOT IMPLEMENTED
- **Details**: No PDF generation library (puppeteer, pdfkit, jsPDF, react-pdf) is installed or used anywhere in the codebase.

### Payment Gateway Integration
- **Status**:  NOT IMPLEMENTED
- **Details**: No Razorpay/Stripe/PayU integration. No payment routes. Model has placeholder fields only.

---

## Updated Status vs Documentation (Corrections to Workflow Doc)

The workflow doc (written Feb 19, 2026) has some **stale assessments** that don't reflect recent code additions:

| Item | Doc Says | Actual Status | Delta |
|------|----------|--------------|-------|
| Phase 6 — CWCRF tab in Ops |  "No CWCRF tab" |  CWCRF tab exists with verify + triage sub-tabs | **Improved** |
| Phase 6 — Section-by-section verify |  "Not built" |  Backend + frontend for section verify | **Improved** |
| Phase 6 — Forward to RMT button |  "No button in Ops UI" |  Button exists in CwcrfOpsTab | **Improved** |
| Phase 7 — RMT → Ops Forward |  "Goes directly to CWCAF_READY" |  "Forward to Ops" button exists | **Improved** |
| Phase 8 — Risk Triage Queue |  "Not built" |  Risk Triage sub-tab exists | **Improved** |
| Phase 8 — Forward to EPC |  "No UI trigger" |  "Forward to EPC" button in triage | **Improved** |
| Phase 9 — Buyer Declaration |  "Not built" |  Buyer declaration checkbox in DashboardPage | **Improved** |
| Phase 1 — Sales form fields |  "Complete" |  Frontend has fields but backend ignores them | **Regressed finding** |

---

## Priority Action Items

###  Critical (Workflow Blockers)

1. **Fix Phase 1.1 backend** — `salesService.createCompanyLead()` must save `gstNumber`, `city`, `state`, `notes` from request body.
2. **Build Phase 10.2 NBFC Selection Page** — New page in `official_portal` for Ops to see matched NBFCs and send CWCAF. Backend is ready.
3. **Move CWCAF generation to Ops** — Either duplicate the CWCAF modal in OpsDashboardNew or refactor the flow so CWCAF is generated after EPC verification (not during RMT phase).

###  Important (Feature Completeness)

4. **Build Phase 6 Super Access powers** — Detach document, edit field, re-request from SC.
5. **Build Phase 5.3 Payment Gateway** — Razorpay integration + payment route + payment step in CWCRF form.
6. **Build Phase 7.2 PDF Download** — Server-side or client-side PDF generation.
7. **Build Phase 9.2 SC Document Review** — EPC should see SC KYC docs, bank details, profile in case detail.
8. **Build Phase 9.3 Full RMT Report Display** — Show full checklist with scores, not just badge.
9. **Wire Phase 8.2C Founder Approval** — Connect HIGH risk → ApprovalRequest → Founder approval flow.

###  Lower Priority

10. **Build Phase 11.4 Post-Quotation NBFC Flow** — Due diligence, sanction, disbursement.
11. **Build Notification System** — Email + in-app at each status transition.
12. **Redesign Phase 9 into Sequential Flow** — 4-step guided case review in partner portal.
13. **Unify Phase 5.2 Bill Upload** — Use `submitBillWithCwcrf` endpoint for inline bill upload in CWCRF form.




