# Gryork Complete Tech Flow Video Script (3-4 Minutes)

**Recommended total duration:** 3 minutes 45 seconds (target range: 3-4 minutes)  
**Video style:** Complete technical flow walkthrough (architecture + workflow + controls)

---

## 1) Time Split Overview

1. **00:00-00:20 (20s):** Problem and technical promise
2. **00:20-00:50 (30s):** Multi-portal architecture and actors
3. **00:50-01:20 (30s):** Core stack, security, and data layer
4. **01:20-01:55 (35s):** Onboarding flow (Phase 1-4)
5. **01:55-02:35 (40s):** CWCRF processing flow (Phase 5-6)
6. **02:35-03:05 (30s):** Risk and decision flow (Phase 7-8)
7. **03:05-03:30 (25s):** EPC and NBFC routing flow (Phase 9-10)
8. **03:30-03:45 (15s):** NBFC completion flow + closure (Phase 11)

---

## 2) Full Voiceover Script (Complete Tech Flow)

### 00:00-00:20 - Opening
Construction vendors usually wait 60 to 90 days for payment.  
Gryork solves this with a complete, status-driven finance workflow where every handoff is verified, logged, and traceable.

### 00:20-00:50 - Architecture and Actors
Gryork runs as a multi-portal platform: public site, GryLink onboarding, subcontractor portal, partner portal for EPC and NBFC, and internal operations portal.  
Sales, Ops, RMT, EPC, Sub-contractor, NBFC, and Admin operate in separate role-based interfaces, while all actions sync into one workflow lifecycle.

### 00:50-01:20 - Stack, Security, and Data
The system uses React, TypeScript, and Vite on the frontend, with Node.js and Express APIs on the backend.  
MongoDB stores users, companies, subcontractors, CWCRF cases, risk data, bids, and status history.  
JWT-based authentication and role authorization control access, Cloudinary manages document files, and every key transition writes audit logs.

### 01:20-01:55 - Phase 1 to 4: Onboarding Data Flow
Sales creates an EPC lead, system generates GryLink, and the EPC sets credentials.  
EPC uploads KYC and company documents, Ops verifies and activates the account.  
EPC then adds subcontractors manually or in bulk, subcontractors self-register, complete KYC, bank details, and declaration acceptance.  
Ops final approval transitions the seller into case-ready state.

### 01:55-02:35 - Phase 5 and 6: CWCRF Processing Flow
The subcontractor submits CWCRF with RA Bill, WCC, and measurement sheet through one structured request.  
Platform fee reference is recorded, and the case enters Ops queue.  
Ops verifies section-wise and uses super access for controlled correction paths: detach field, edit value with reason, or re-request data from seller.  
When required sections are complete, workflow status moves forward to RMT.

### 02:35-03:05 - Phase 7 and 8: Risk and Decision Flow
RMT runs a structured checklist, assigns risk score and recommendation, and generates CWCAF.  
Ops triage consumes this output, applies risk guardrails, and chooses one of two system actions: forward to EPC or reject with mandatory notes.

### 03:05-03:30 - Phase 9 and 10: Commercial and Lender Routing
EPC completes a guided 4-step review: seller documents, risk report, declaration, and bid terms.  
After buyer approval, Ops executes NBFC matching, selects suitable financiers, and shares CWCAF through targeted dispatch.

### 03:30-03:45 - Phase 11 and Close
NBFC submits quotation, seller selects lender, due diligence and sanction are completed, and disbursement is confirmed with UTR tracking.  
Result: one complete technical flow from lead creation to funded disbursement with full auditability.

---

## 3) Recording Notes For Technical Clarity

1. Keep narration pace between 130 and 140 words per minute.
2. Display each status transition for at least one second so viewers can read the state change.
3. Use overlays for API action labels at each major handoff: create, verify, forward, triage, approve, dispatch, confirm.
4. Highlight three control points: role-based access, super access reason tracking, and UTR-based disbursement confirmation.

---

## 4) What To Record At Each Segment

### 00:00-00:20 (Problem + Promise)
**Record this:**
- Title card with delay problem statement
- Quick dashboard montage with "status-driven workflow" overlay

**Screen focus:**
- Full screen — show a static title slide or motion graphic centered on screen
- Then cut to a wide shot of the Ops dashboard (internal portal) showing the case list with status columns visible — keep the entire browser window in frame, do not zoom in yet

---

### 00:20-00:50 (Architecture)
**Record this:**
- Multi-portal map with actor labels
- End-to-end phase bar from Phase 1 to Phase 11

**Screen focus:**
- Full screen — show a diagram or slide (Figma/Canva/PowerPoint) with all 5 portals laid out side-by-side with actor names below each portal icon
- Keep the phase bar (Phase 1 → Phase 11) at the bottom of the slide in small text so it stays visible throughout this segment
- Do not record an actual browser here — use a graphic/slide only

---

### 00:50-01:20 (Stack + Security)
**Record this:**
- Stack visual: React/TypeScript/Vite -> Express API -> MongoDB/Cloudinary
- Security visual: JWT auth + role guard + audit trail

**Screen focus:**
- Full screen — use a tech stack diagram slide
- First half: highlight the frontend layer (React/TypeScript/Vite box) and draw an arrow right to the backend layer (Express API box), then arrow to the data layer (MongoDB + Cloudinary)
- Second half: zoom into the security layer strip at the bottom of the diagram showing JWT → Role Guard → Audit Log chain in sequence
- No live browser recording needed for this segment

---

### 01:20-01:55 (Onboarding — Phases 1–4)
**Record this:**
- Sales creates EPC lead and sends GryLink
- EPC onboarding document upload
- Subcontractor registration and KYC completion
- Ops approval screen and activation status

**Screen focus:**
- **Sales step:** Record the internal Ops portal — zoom into the "Create Lead" form in the center of the screen, fill in company name and contact fields, then click Submit. After submission, zoom into the GryLink URL that appears in the confirmation banner at the top center.
- **EPC step:** Switch to the GryLink portal browser tab — record the full-page onboarding form. Scroll slowly down the left side of the document upload section so viewers can see each upload field (KYC, GST, company docs).
- **Subcontractor step:** Switch to the Subcontractor portal — record the registration form (center of screen). Then scroll down to show the bank details section and the declaration checkbox at the bottom.
- **Ops approval step:** Switch back to the internal Ops portal — zoom into the right-side action panel where the Approve / Reject buttons appear. Click Approve and capture the status badge in the top-right of the seller card changing from "Pending" to "Active".

---

### 01:55-02:35 (CWCRF + Ops — Phases 5–6)
**Record this:**
- CWCRF submission with all three documents
- Ops section verify cards and notes
- One super access correction and forward to RMT

**Screen focus:**
- **CWCRF submission:** Record the Subcontractor portal — show the full CWCRF form page. Zoom into the three upload slots (RA Bill, WCC, Measurement Sheet) one at a time as each file is attached. Then zoom to the Submit button at the bottom center and click it.
- **Ops verify cards:** Switch to the internal Ops portal CWCRF detail page — record the center panel showing section cards (each with a Verify button). Click one Verify button and zoom into the notes text field that appears below it.
- **Super access correction:** Stay on the same Ops page — click the Super Access button (top-right area of the case detail view). Zoom into the Detach / Edit / Re-request dropdown that appears. Select Edit, type a reason in the reason field (center of screen), and save. The change indicator should be visible on that section card.
- **Forward to RMT:** Zoom into the status action button at the bottom-right of the case page. Click "Forward to RMT" and capture the status indicator at the top of the case card updating.

---

### 02:35-03:05 (Risk + Triage — Phases 7–8)
**Record this:**
- RMT risk scoring panel and CWCAF generation
- Ops triage decision with forward/reject path

**Screen focus:**
- **RMT panel:** Log into the internal portal under the RMT role — record the full risk scoring checklist panel in the center of the screen. Slowly scroll through the checklist items. Then zoom into the risk score field (numeric input, center-right of panel) and the recommendation dropdown below it.
- **CWCAF generation:** After submitting the risk form, zoom into the CWCAF document preview that opens — show the top section (case reference, score, recommendation) for at least 2 seconds.
- **Ops triage:** Switch to the Ops triage view — zoom into the two action buttons: "Forward to EPC" (green, bottom-right) and "Reject" (red, bottom-left). Hover over Reject first to show the mandatory notes field appearing, then click Forward to EPC to show the success transition.

---

### 03:05-03:30 (EPC + NBFC Dispatch — Phases 9–10)
**Record this:**
- EPC 4-step review modal and bid entry
- NBFC match scores, lender selection, and share confirmation

**Screen focus:**
- **EPC 4-step modal:** Log into the Partner portal under the EPC role — click on the case to open the review modal. Record the modal in full-screen center focus. Use the step indicator at the top of the modal (Step 1 of 4 → Step 2 of 4 → ...) as the visual cue, pausing 1–2 seconds on each step. Zoom into the bid terms input fields on Step 4 (amount, tenure, interest range).
- **NBFC dispatch:** Switch to the Ops portal NBFC matching screen — zoom into the lender match score list (center panel, score percentages visible next to each NBFC name). Select 2–3 lenders using the checkboxes on the left of each row. Then zoom into the "Share CWCAF" button (top-right of the panel) and click it. Capture the confirmation toast/banner that appears.

---

### 03:30-03:45 (NBFC Completion — Phase 11 + Close)
**Record this:**
- Quote submission, due diligence, sanction acceptance, UTR confirmation
- Final status card: Disbursed

**Screen focus:**
- **Quote submission:** Log into the Partner portal under NBFC role — record the quote form in center screen. Zoom into the interest rate, tenure, and processing fee fields. Then click Submit Quote.
- **UTR confirmation:** Switch to the Ops portal disbursement confirmation screen — zoom into the UTR number input field (center of form). Type the UTR and click Confirm. Capture the final status badge on the case card changing to **"Disbursed"** in green — hold this on screen for at least 3 seconds before fading out.
- **Closing frame:** Cut to a full-screen outro slide showing "Lead → GryLink → KYC → CWCRF → Risk → EPC → NBFC → Disbursed" as a single horizontal flow line.

