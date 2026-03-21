# Gryork End-to-End Website Recording Workflow (EPC Onboarding to Disbursement)

**Version:** 1.0  
**Date:** March 16, 2026  
**Purpose:** Complete, detailed recording script for the full Gryork workflow from EPC (sometimes called EBC in discussions) onboarding to NBFC disbursement confirmation.

---

## 1) Recording Goal

Record one continuous business flow showing how a case moves through all platform stages:

1. EPC lead creation and GryLink onboarding
2. EPC KYC and Ops verification
3. Subcontractor onboarding and KYC
4. CWCRF submission and Ops section verification
5. RMT risk assessment and CWCAF generation
6. Ops triage and EPC commercial approval
7. NBFC matching, quotation, selection, due diligence, sanction, and disbursement
8. Final DISBURSED state with UTR proof

---

## 2) Final Video Duration and Structure

**Target duration:** 4 minutes 45 seconds (must stay under 5:00)  
**Style:** Fast live walkthrough + hard cuts + only critical proof moments on screen

1. 00:00-00:20: Problem statement + actor map
2. 00:20-01:05: EPC onboarding (lead, GryLink, docs, Ops approval)
3. 01:05-01:45: Subcontractor registration + KYC completion
4. 01:45-02:25: CWCRF submission + Ops section verification + one super-access action
5. 02:25-02:55: RMT risk scoring + CWCAF generation
6. 02:55-03:25: Ops triage + forward to EPC
7. 03:25-03:55: EPC 4-step review compressed + buyer approval
8. 03:55-04:30: NBFC matching, quotation, lender selection, DD, sanction
9. 04:30-04:45: UTR confirmation + final `DISBURSED` close frame

### Sub-5-Minute Editing Rules (Mandatory)

1. Show only one representative example per repeated task (one doc verification card, one KYC card, one quote card).
2. Keep every status badge shot between 1.5 and 2.0 seconds.
3. Use jump cuts between portals; avoid scroll-heavy captures.
4. Keep email cutaways to 2 seconds each and include only major checkpoints:
   - GryLink sent
   - EPC approved
   - CWCRF submitted
   - Forwarded to EPC
   - NBFC dispatch
   - Disbursed confirmation
5. If runtime exceeds 4:45 in rough cut, remove non-critical shots in this order:
   - Sales contact log screen
   - optional action-required email examples
   - extra due diligence form details

---

## 3) Portals, Roles, and Browser Tabs

Keep separate browser profiles or tab groups open before recording.

1. **Internal Ops Portal:** `admin.gryork.com` (or your official portal host)
2. **GryLink Onboarding Portal:** `link.gryork.com`
3. **Partner Portal (EPC + NBFC):** `partner.gryork.com`
4. **Subcontractor Portal:** `app.gryork.com`
5. **Email Inbox Tab:** test mailbox for EPC + subcontractor + internal notifications

### Login Matrix to Prepare

1. Sales user
2. Ops user
3. RMT user
4. EPC user (new onboarding target)
5. Subcontractor user
6. NBFC user

---

## 4) Test Data Setup (Do This Before Recording)

1. One fresh EPC lead not yet onboarded
2. One subcontractor linked to the EPC (or ready to be added)
3. Dummy docs ready on desktop:
   - EPC docs: CIN, GST, PAN, bank statement, project docs
   - Subcontractor docs: KYC, bank proof, declaration
   - CWCRF docs: RA Bill, WCC, Measurement Sheet
4. One case path with status progression enabled through all 11 phases
5. Email service working in test/staging so notifications are visible
6. Stable internet and no pop-up blockers

---

## 5) Screen Recording Standards

1. Resolution: 1920x1080 minimum
2. Zoom only when field-level detail matters
3. Keep each status change visible for at least 2 seconds
4. Capture top bar with role name, case ID, and status badges whenever possible
5. Use cursor highlight to make clicks easy to follow
6. Speak at 125 to 140 words per minute
7. Keep transitions clean: hard cut is preferred over fancy animation

---

## 6) Master Flow Table (What to Record, Where to Focus, What to Say)

## Phase 1: EPC Company Onboarding

### Step 1.1 - Sales creates EPC lead

- **Portal/Role:** Internal portal, Sales login
- **Action:** Open Companies > Create Lead > fill company details > submit
- **Record this part of screen:** Center create-lead modal and final success banner at top
- **Voiceover script:** "Sales starts by creating an EPC lead in the internal portal. This creates the buyer entity and initializes the onboarding lifecycle."
- **Proof to capture:** New company row with `LEAD_CREATED` status

### Step 1.2 - GryLink generation and onboarding link dispatch

- **Portal/Role:** Internal portal, Sales
- **Action:** Open company detail > Generate GryLink
- **Record this part of screen:** GryLink token/link area and copy/send action
- **Voiceover script:** "System generates a secure GryLink onboarding token and dispatches the onboarding path to the EPC user."
- **Email checkpoint:** Open test EPC inbox tab and show onboarding email with link
- **Proof to capture:** Company status or event log showing link generated

### Step 1.3 - EPC sets credentials via GryLink

- **Portal/Role:** GryLink portal, EPC
- **Action:** Open link from email > set password > continue
- **Record this part of screen:** Full page form, especially password submit button and success state
- **Voiceover script:** "EPC validates the token and sets credentials, moving the company from lead state into active onboarding."
- **Proof to capture:** `CREDENTIALS_CREATED` style status movement in internal portal

### Step 1.4 - EPC uploads company documents

- **Portal/Role:** Partner portal, EPC
- **Action:** Documents tab > upload required docs > submit
- **Record this part of screen:** Upload components and completed checklist/status chips
- **Voiceover script:** "EPC uploads KYC and business compliance documents for Ops review."
- **Email checkpoint:** Optional notification email to Ops inbox if configured
- **Proof to capture:** Company status moves to `DOCS_SUBMITTED`

---

## Phase 2: EPC Document Verification by Ops

### Step 2.1 - Ops reviews each document

- **Portal/Role:** Internal portal, Ops
- **Action:** Companies queue > open company > review doc cards one by one
- **Record this part of screen:** Document cards with verify/reject controls
- **Voiceover script:** "Ops reviews every company document individually, ensuring completeness and consistency."
- **Proof to capture:** Per-document verification indicators

### Step 2.2 - Ops approves EPC account

- **Portal/Role:** Internal portal, Ops
- **Action:** Approve company with notes
- **Record this part of screen:** Right action panel with Approve button and notes field
- **Voiceover script:** "After document checks, Ops activates the EPC account and unlocks downstream supplier onboarding."
- **Email checkpoint:** Show approval email in EPC inbox
- **Proof to capture:** Company status becomes `ACTIVE`

---

## Phase 3: Subcontractor Registration via EPC

### Step 3.1 - EPC adds subcontractors (manual or bulk)

- **Portal/Role:** Partner portal, EPC
- **Action:** Subcontractors section > add one manually, then show bulk template flow
- **Record this part of screen:** Add form and uploaded list table with row statuses
- **Voiceover script:** "EPC registers subcontractors manually or in bulk, linking each seller to the buyer account."
- **Proof to capture:** New subcontractor entry visible in list

### Step 3.2 - Sales contact log update

- **Portal/Role:** Internal portal, Sales
- **Action:** Open subcontractor detail > add contact log note
- **Record this part of screen:** Contact log panel and save confirmation
- **Voiceover script:** "Sales outreach is tracked through contact logs to maintain accountability before seller activation."
- **Proof to capture:** Timestamped contact log entry

### Step 3.3 - Subcontractor self-registration

- **Portal/Role:** Subcontractor portal, new user
- **Action:** Register using linked email > verify account flow
- **Record this part of screen:** Registration form and success redirect
- **Voiceover script:** "The subcontractor self-registers using the same mapped identity, binding the seller profile to the EPC network."
- **Email checkpoint:** Show registration confirmation email if enabled
- **Proof to capture:** Subcontractor status enters profile onboarding state

---

## Phase 4: Subcontractor Onboarding and KYC

### Step 4.1 - Basic profile completion

- **Portal/Role:** Subcontractor portal
- **Action:** Fill profile fields and save
- **Record this part of screen:** Main profile form and completion banner
- **Voiceover script:** "Seller completes profile data required for risk and eligibility checks."
- **Proof to capture:** Profile completion indicator

### Step 4.2 - KYC document upload

- **Portal/Role:** Subcontractor portal
- **Action:** Upload KYC docs across required sections
- **Record this part of screen:** Document upload grid and uploaded file states
- **Voiceover script:** "KYC documents are uploaded and attached to the seller identity for Ops validation."
- **Proof to capture:** KYC checklist reaches complete state

### Step 4.3 - Bank details submission

- **Portal/Role:** Subcontractor portal
- **Action:** Fill bank account details and save
- **Record this part of screen:** Bank details panel and save success
- **Voiceover script:** "Bank details are submitted to support future sanction and disbursement workflow."
- **Proof to capture:** Bank details status marked complete

### Step 4.4 - Seller declaration acceptance

- **Portal/Role:** Subcontractor portal
- **Action:** Open declaration page > accept checkbox > submit
- **Record this part of screen:** Declaration checklist and consent button
- **Voiceover script:** "Seller accepts the declaration terms, completing onboarding compliance."
- **Proof to capture:** Declaration accepted timestamp

### Step 4.5 - Ops KYC review and completion

- **Portal/Role:** Internal portal, Ops
- **Action:** KYC queue > verify documents or request additional docs > complete KYC
- **Record this part of screen:** KYC review cards and request-additional-document action
- **Voiceover script:** "Ops validates KYC artifacts and can request additional proofs before final completion."
- **Email checkpoint:** Show action-required email in subcontractor inbox if docs are re-requested, then completion email after approval
- **Proof to capture:** Seller marked KYC complete and case-ready

---

## Phase 5: CWCRF Submission

### Step 5.1 - Seller fills CWCRF form

- **Portal/Role:** Subcontractor portal
- **Action:** Create new CWCRF > fill section A/B/C/D data
- **Record this part of screen:** Section progress bar and save/next controls
- **Voiceover script:** "Seller enters a structured CWCRF request with full transaction and invoice context."
- **Proof to capture:** Form reaches submit-ready state

### Step 5.2 - Upload RA Bill, WCC, and Measurement Sheet

- **Portal/Role:** Subcontractor portal
- **Action:** Upload all 3 docs in CWCRF submission block
- **Record this part of screen:** Three upload slots and file attached statuses
- **Voiceover script:** "All required billing proofs are uploaded within CWCRF: RA Bill, WCC, and Measurement Sheet."
- **Proof to capture:** Each file slot shows uploaded state

### Step 5.3 - Record platform fee reference

- **Portal/Role:** Subcontractor portal
- **Action:** Enter payment reference and confirm
- **Record this part of screen:** Payment reference field and confirmation state
- **Voiceover script:** "Platform fee reference is captured and linked to the CWCRF transaction trail."
- **Proof to capture:** Fee/payment reference visible in case details

### Step 5.4 - Submit CWCRF

- **Portal/Role:** Subcontractor portal
- **Action:** Final submit
- **Record this part of screen:** Submit button click and post-submit status banner
- **Voiceover script:** "CWCRF enters the Ops queue for section-wise validation and control checks."
- **Email checkpoint:** Show Ops notification email for new CWCRF submission
- **Proof to capture:** Status enters Ops review queue

---

## Phase 6: Ops CWCRF Review and Super Access Controls

### Step 6.1 - Ops opens CWCRF queue

- **Portal/Role:** Internal portal, Ops
- **Action:** CWCRF tab > Section Verify queue
- **Record this part of screen:** Queue table with case IDs, seller name, and status
- **Voiceover script:** "Ops receives CWCRF in a structured queue for section-by-section verification."
- **Proof to capture:** Case row present in queue

### Step 6.2 - Section verification

- **Portal/Role:** Internal portal, Ops
- **Action:** Open case > verify sections with notes
- **Record this part of screen:** Section cards and verify toggles
- **Voiceover script:** "Ops verifies each CWCRF section independently and records review notes."
- **Proof to capture:** All required sections marked verified

### Step 6.3 - Super access correction demonstration

- **Portal/Role:** Internal portal, Ops
- **Action:** Use one control path: Detach Field or Edit Field or Re-request
- **Record this part of screen:** Super access control panel and mandatory reason field
- **Voiceover script:** "Controlled corrections are enabled through Super Access, with mandatory reason tracking for every override."
- **Email checkpoint:** If Re-request is used, show action-required email to subcontractor
- **Proof to capture:** Action logged in case history/audit trail

### Step 6.4 - Forward to RMT

- **Portal/Role:** Internal portal, Ops
- **Action:** Click Forward to RMT after all checks
- **Record this part of screen:** Forward button and resulting status badge update
- **Voiceover script:** "Once section checks are complete, Ops moves the case to RMT for risk analysis."
- **Proof to capture:** Status changes to RMT queue state

---

## Phase 7: RMT Risk Assessment

### Step 7.1 - RMT opens case and risk checklist

- **Portal/Role:** Internal portal, RMT
- **Action:** RMT queue > open case > complete 12-point risk checklist
- **Record this part of screen:** Risk checklist panel and scoring fields
- **Voiceover script:** "RMT runs a structured risk model and assigns score, category, and recommendation."
- **Proof to capture:** Saved risk assessment with score and recommendation

### Step 7.2 - Generate CWCAF

- **Portal/Role:** Internal portal, RMT
- **Action:** Click Generate CWCAF
- **Record this part of screen:** CWCAF generation modal and success state
- **Voiceover script:** "CWCAF is generated as the lender-facing risk and case summary package."
- **Proof to capture:** CWCAF ready status

### Step 7.3 - Forward back to Ops

- **Portal/Role:** Internal portal, RMT
- **Action:** Forward to Ops
- **Record this part of screen:** Forward button and queue movement indicator
- **Voiceover script:** "RMT returns the case to Ops triage for final routing decisions."
- **Proof to capture:** Status visible in Ops triage queue

---

## Phase 8: Ops Risk Triage

### Step 8.1 - Ops reviews risk output

- **Portal/Role:** Internal portal, Ops
- **Action:** CWCRF tab > Risk Triage sub-tab > open case
- **Record this part of screen:** Recommendation banner + risk category badge
- **Voiceover script:** "Ops triage consumes RMT output and applies policy guardrails before buyer handoff."
- **Proof to capture:** Triage screen with RMT recommendation

### Step 8.2 - Forward to EPC or reject

- **Portal/Role:** Internal portal, Ops
- **Action:** Show reject path note requirement, then execute Forward to EPC
- **Record this part of screen:** Reject button (disabled without notes) and Forward button
- **Voiceover script:** "Ops can reject with mandatory notes or forward approved risk cases to EPC for commercial review."
- **Email checkpoint:** Show EPC notification email that case is ready for review
- **Proof to capture:** Status updates to EPC/buyer review state

---

## Phase 9: EPC Case Review and Bid (4-Step Flow)

### Step 9.1 - EPC opens review modal

- **Portal/Role:** Partner portal, EPC
- **Action:** CWC requests list > Review case
- **Record this part of screen:** Table row status and Review button
- **Voiceover script:** "EPC receives the case and enters a guided 4-step verification and bid process."
- **Proof to capture:** Review modal opens

### Step 9.2 - Step 1: Seller docs review

- **Portal/Role:** Partner portal, EPC
- **Action:** Validate profile + KYC + bill docs
- **Record this part of screen:** Doc links/status badges and seller summary block
- **Voiceover script:** "Step one validates seller identity, document integrity, and invoice support artifacts."
- **Proof to capture:** Step progression control enabled

### Step 9.3 - Step 2: Risk report review

- **Portal/Role:** Partner portal, EPC
- **Action:** Review RMT recommendation and risk category
- **Record this part of screen:** Risk category banner and assessment breakdown grid
- **Voiceover script:** "Step two reviews risk intelligence generated by Gryork RMT and CWCAF."
- **Proof to capture:** Recommendation visible with notes

### Step 9.4 - Step 3: Declaration acceptance

- **Portal/Role:** Partner portal, EPC
- **Action:** Accept buyer declaration checkbox
- **Record this part of screen:** Declaration checklist and acceptance checkbox
- **Voiceover script:** "Step three captures formal buyer declaration prior to commercial commitment."
- **Proof to capture:** Next button unlocked only after declaration acceptance

### Step 9.5 - Step 4: Bid terms and final approval

- **Portal/Role:** Partner portal, EPC
- **Action:** Enter approved amount, timeline, repayment source, notes > Approve
- **Record this part of screen:** Bid input fields and Approve button
- **Voiceover script:** "Step four captures commercial terms and confirms buyer-side approval for lender routing."
- **Email checkpoint:** Optional status email to subcontractor about buyer approval
- **Proof to capture:** Status becomes buyer approved

---

## Phase 10: Ops NBFC Matching and Dispatch

### Step 10.1 - Ops confirms CWCAF package for dispatch

- **Portal/Role:** Internal portal, Ops
- **Action:** NBFC Dispatch sub-tab > open case
- **Record this part of screen:** CWCAF card and dispatch readiness panel
- **Voiceover script:** "Ops prepares the lender packet and confirms dispatch readiness."
- **Proof to capture:** Case appears in NBFC dispatch queue

### Step 10.2 - Matching NBFCs and selecting lenders

- **Portal/Role:** Internal portal, Ops
- **Action:** Load matching NBFCs > select best-fit lenders by score
- **Record this part of screen:** Match score list and lender checkboxes
- **Voiceover script:** "System suggests matching NBFCs; Ops selects financiers based on fit and score."
- **Proof to capture:** Selected lender count visible

### Step 10.3 - Share CWCAF to selected NBFCs

- **Portal/Role:** Internal portal, Ops
- **Action:** Click Share with NBFCs
- **Record this part of screen:** Share action and success toast/banner
- **Voiceover script:** "CWCAF and case package are dispatched to selected NBFCs for quotation."
- **Email checkpoint:** Show NBFC notification email for new case availability
- **Proof to capture:** Status enters NBFC quotation stage

---

## Phase 11: NBFC Quotation to Disbursement Completion

### Step 11.1 - NBFC reviews available cases

- **Portal/Role:** Partner portal, NBFC
- **Action:** Open available CWCAF list and select case
- **Record this part of screen:** NBFC dashboard list and case summary
- **Voiceover script:** "NBFC receives curated cases and opens the CWCAF-backed financing opportunity."
- **Proof to capture:** Case visible in NBFC queue

### Step 11.2 - NBFC submits quotation

- **Portal/Role:** Partner portal, NBFC
- **Action:** Fill quote details (rate, tenure, fee) and submit
- **Record this part of screen:** Quotation form and submit confirmation
- **Voiceover script:** "NBFC submits financing quotation with lender terms for seller decision."
- **Email checkpoint:** Show subcontractor quote-available notification email if enabled
- **Proof to capture:** Quote card appears in subcontractor view

### Step 11.3 - Subcontractor selects lender

- **Portal/Role:** Subcontractor portal
- **Action:** Open case > compare quotes > click Select
- **Record this part of screen:** Quote cards and selected lender indicator
- **Voiceover script:** "Seller reviews lender options and selects the preferred NBFC offer."
- **Proof to capture:** Case status reflects lender selected

### Step 11.4 - NBFC due diligence workflow

- **Portal/Role:** Partner portal, NBFC
- **Action:** Start due diligence > complete checklist > submit decision
- **Record this part of screen:** Due diligence checklist and completion action
- **Voiceover script:** "NBFC executes due diligence through a tracked checklist before sanction issuance."
- **Proof to capture:** DD completed state

### Step 11.5 - NBFC issues sanction letter

- **Portal/Role:** Partner portal, NBFC
- **Action:** Fill sanction form and issue letter
- **Record this part of screen:** Sanction details panel (amount/rate/tenure)
- **Voiceover script:** "Sanction terms are formalized and issued for seller acceptance."
- **Email checkpoint:** Show sanction notification email to subcontractor
- **Proof to capture:** Sanction issued status

### Step 11.6 - Subcontractor accepts sanction

- **Portal/Role:** Subcontractor portal
- **Action:** Review sanction details > accept
- **Record this part of screen:** Sanction banner and Accept button
- **Voiceover script:** "Seller accepts sanction terms, authorizing disbursement initiation."
- **Proof to capture:** Sanction accepted status with timestamp

### Step 11.7 - NBFC initiates and confirms disbursement (UTR)

- **Portal/Role:** Partner portal, NBFC
- **Action:** Initiate disbursement > enter UTR > confirm
- **Record this part of screen:** UTR input field and final confirm action
- **Voiceover script:** "NBFC completes disbursement and confirms transaction using UTR, closing the case lifecycle."
- **Email checkpoint:** Show disbursement confirmation email
- **Proof to capture:** Final case status `DISBURSED` in green badge

---

## 7) Email and Notification Capture Plan (Mandatory Inserts)

After each major transition, insert a 3 to 6 second cutaway to the inbox tab.

1. GryLink onboarding mail to EPC
2. EPC approval or action-required mail from Ops
3. Subcontractor KYC action-required or completion mail
4. CWCRF submitted mail to Ops (or internal team notification)
5. Ops triage forward mail to EPC
6. NBFC dispatch mail to selected lenders
7. Quote availability mail to subcontractor
8. Sanction issue mail to subcontractor
9. Disbursement confirmation mail with UTR context

If any notification is disabled in your environment, replace the email cutaway with the in-app status history panel.

---

## 8) Exact Screen Regions to Prioritize Throughout

1. Top header: role identity, case ID, and status chip
2. Center working area: forms, checklists, risk cards, bid fields
3. Right action column: approve/reject/forward buttons
4. Bottom audit/status history area when available
5. Toasts/banners after each submit/forward/share/confirm action

---

## 9) Continuity and Editing Guidance

1. Use one real case ID across all phases to keep narrative continuity
2. Keep tab names visible briefly when switching roles
3. Add lower-third labels on each cut:
   - "Portal: Internal Ops | Role: Ops"
   - "Portal: Partner | Role: EPC"
   - "Portal: Partner | Role: NBFC"
   - "Portal: Subcontractor"
4. Never skip a status update screen between role handoffs
5. Keep final `DISBURSED` screen visible for 3 to 5 seconds

---

## 10) Final Closing Script (Use Verbatim)

"This completes Gryork's end-to-end technical workflow: from EPC onboarding and seller KYC, through CWCRF verification, risk scoring, buyer approval, lender matching, and NBFC disbursement with UTR confirmation. Every transition is role-controlled, traceable, and audit-ready across the full lifecycle."

---

## 11) Full 4:45 Narration Script (Start to End, Step-by-Step)

Use this as your exact readout while recording. Keep pace near 130 words per minute.

### 00:00-00:20 - Opening and Context

- **On-screen step:** Show title card, then quick actor map (Sales, Ops, RMT, EPC, Subcontractor, NBFC).
- **Record focus:** Title card frame and actor map labels.
- **Say this:**
   "In construction financing, vendors often wait 60 to 90 days for payment. Gryork solves this through a role-based digital workflow that tracks every step from onboarding to disbursement, with complete status visibility and audit logs."

### 00:20-00:30 - Step 1.1 Sales Creates EPC Lead

- **On-screen step:** Internal portal, Sales login, create lead modal.
- **Record focus:** Create-lead modal and success banner/status row.
- **Say this:**
   "Step one begins with Sales creating a new EPC lead in the internal portal. This initializes the buyer lifecycle and creates a structured onboarding record."

### 00:30-00:40 - Step 1.2 GryLink Generation and Email

- **On-screen step:** Generate GryLink, then cut to EPC inbox showing onboarding email.
- **Record focus:** GryLink token/link area and EPC onboarding email subject preview.
- **Say this:**
   "Next, GryLink is generated and sent by email. The secure tokenized link ensures controlled onboarding and identity mapping for the EPC account."

### 00:40-00:50 - Step 1.3 EPC Sets Credentials

- **On-screen step:** GryLink portal set-password page.
- **Record focus:** Password form and success/continue state.
- **Say this:**
   "Using the link, EPC sets credentials and activates onboarding access. The system now transitions the company from lead to credentials-created state."

### 00:50-01:05 - Step 1.4 + Phase 2 Ops Verification

- **On-screen step:** EPC document upload in partner portal, then Ops verifies and approves company.
- **Record focus:** EPC upload checklist and Ops doc cards with Approve action + status badge.
- **Say this:**
   "EPC uploads compliance documents, and Ops reviews each card before final approval. Once approved, the EPC account moves to active status and can onboard subcontractors."

### 01:05-01:18 - Step 3.1 EPC Adds Subcontractor

- **On-screen step:** EPC adds subcontractor in partner portal.
- **Record focus:** Add subcontractor form and new row in the list.
- **Say this:**
   "EPC now adds subcontractors manually or through bulk upload, linking seller identities to the buyer organization."

### 01:18-01:30 - Step 3.3 Subcontractor Self-Registration

- **On-screen step:** Subcontractor registration form and success redirect.
- **Record focus:** Registration form submit and success/redirect state.
- **Say this:**
   "The subcontractor self-registers using the mapped email identity, which binds the profile to the same EPC network."

### 01:30-01:45 - Phase 4 KYC Completion

- **On-screen step:** Profile completion, KYC uploads, bank details, declaration, then Ops KYC completion.
- **Record focus:** Profile completion banner, KYC upload grid, bank save confirmation, declaration accept, Ops KYC complete badge.
- **Say this:**
   "The seller completes profile, KYC, bank details, and declaration. Ops validates the submission, requests corrections if needed, and marks the seller case-ready after completion."

### 01:45-02:00 - Step 5.1 and 5.2 CWCRF + Documents

- **On-screen step:** CWCRF sections and three uploads: RA Bill, WCC, Measurement Sheet.
- **Record focus:** CWCRF section progress and three upload slots in uploaded state.
- **Say this:**
   "The seller submits CWCRF with structured section data and mandatory billing proofs, including RA Bill, WCC, and Measurement Sheet."

### 02:00-02:10 - Step 5.3 and 5.4 Platform Fee Reference and Submit

- **On-screen step:** Payment reference field, final submit, Ops notification email.
- **Record focus:** Fee reference field, submit banner, and Ops notification email preview.
- **Say this:**
   "Platform fee reference is recorded, then CWCRF is submitted into the Ops verification queue with status and notification tracking."

### 02:10-02:25 - Phase 6 Ops Section Verification + Super Access

- **On-screen step:** Ops verifies section cards, performs one super-access edit with reason, forwards to RMT.
- **Record focus:** Section verify toggles, Super Access reason field, and Forward to RMT action.
- **Say this:**
   "Ops verifies section by section. If correction is required, Super Access allows controlled detach, edit, or re-request with mandatory reason capture. After completion, the case is forwarded to RMT."

### 02:25-02:40 - Phase 7 RMT Risk Assessment

- **On-screen step:** 12-point risk checklist and score entry.
- **Record focus:** Risk checklist panel and saved score/recommendation fields.
- **Say this:**
   "RMT evaluates the case using a structured risk checklist, assigns score and recommendation, and locks the risk outcome."

### 02:40-02:55 - Step 7.2 and 7.3 CWCAF Generation + Forward to Ops

- **On-screen step:** Generate CWCAF and forward to Ops.
- **Record focus:** CWCAF generation modal success and forward status update.
- **Say this:**
   "CWCAF is generated as the lender-ready assessment package, and the case is moved back to Ops for triage and buyer routing."

### 02:55-03:10 - Phase 8 Ops Risk Triage

- **On-screen step:** Risk triage screen, show reject-with-notes condition, then forward to EPC.
- **Record focus:** Recommendation badge, reject notes requirement, and Forward to EPC button.
- **Say this:**
   "Ops triage enforces policy controls. Cases can be rejected with mandatory notes or forwarded to EPC for commercial approval."

### 03:10-03:25 - Step 9.1 to 9.5 EPC 4-Step Review

- **On-screen step:** EPC modal steps 1 to 4 in sequence.
- **Record focus:** Stepper header, key doc/risk panels, declaration check, and bid approval action.
- **Say this:**
   "EPC performs a guided four-step review: seller documents, risk report, buyer declaration, and bid terms. After approval, the case becomes ready for lender dispatch."

### 03:25-03:40 - Phase 10 NBFC Matching and Dispatch

- **On-screen step:** Ops NBFC match list, select lenders, share CWCAF, show dispatch email.
- **Record focus:** Match score list, lender selection checkbox count, share success toast, dispatch email preview.
- **Say this:**
   "Ops loads matching NBFCs, selects suitable lenders by score, and dispatches CWCAF to the selected financing partners."

### 03:40-03:55 - Step 11.1 and 11.2 NBFC Quotation

- **On-screen step:** NBFC available queue and quotation form submission.
- **Record focus:** NBFC case list entry and quotation form submit confirmation.
- **Say this:**
   "NBFC reviews the available case and submits a quotation including financing rate, tenure, and terms for seller selection."

### 03:55-04:10 - Step 11.3 Seller Selects Lender

- **On-screen step:** Subcontractor compares quotes and selects one.
- **Record focus:** Quote cards and selected lender indicator.
- **Say this:**
   "The seller compares quoted offers and selects the preferred NBFC, moving the case into lender-controlled processing."

### 04:10-04:20 - Step 11.4 Due Diligence

- **On-screen step:** NBFC due diligence checklist completed.
- **Record focus:** Due diligence checklist completion state.
- **Say this:**
   "NBFC completes due diligence through a tracked checklist before sanction issuance."

### 04:20-04:30 - Step 11.5 and 11.6 Sanction and Acceptance

- **On-screen step:** NBFC issues sanction, then subcontractor accepts.
- **Record focus:** Sanction details panel and acceptance confirmation.
- **Say this:**
   "NBFC issues sanction terms, and the seller accepts, authorizing the final disbursement stage."

### 04:30-04:40 - Step 11.7 Disbursement and UTR Confirmation

- **On-screen step:** NBFC enters UTR and confirms disbursement, then show disbursement email.
- **Record focus:** UTR entry field, confirm action, and disbursement email preview.
- **Say this:**
   "NBFC initiates disbursement and confirms with UTR reference, creating final payment proof in the case timeline."

### 04:40-04:45 - Final Close

- **On-screen step:** Case card with green `DISBURSED` badge, hold for 3 to 5 seconds.
- **Record focus:** Case card with final `DISBURSED` badge.
- **Say this:**
   "End result: a complete, auditable financing workflow from onboarding to funded disbursement on Gryork."

---

## 12) Rapid Shot Checklist (Tick While Recording)

1. Title card + actor map
2. Sales create EPC lead
3. GryLink generated
4. EPC onboarding email visible
5. EPC set password
6. EPC uploads docs
7. Ops approves EPC
8. EPC approval email
9. EPC adds subcontractor
10. Subcontractor registers
11. Subcontractor KYC complete
12. Ops marks KYC complete
13. CWCRF section form
14. RA Bill + WCC + Measurement Sheet uploaded
15. Payment reference entered
16. CWCRF submitted
17. CWCRF submitted notification
18. Ops section verification
19. Super access action with reason
20. Forward to RMT
21. RMT risk score entered
22. CWCAF generated
23. Forward to Ops triage
24. Ops triage forward to EPC
25. EPC 4-step review modal
26. EPC bid and approval
27. Ops NBFC match scores
28. Share to selected NBFCs
29. NBFC dispatch email
30. NBFC quote submission
31. Seller quote selection
32. NBFC due diligence complete
33. Sanction issued
34. Seller sanction accepted
35. UTR entered and disbursement confirmed
36. Final green `DISBURSED` status

---

## 13) Backup Short Lines (If You Need Retakes)

1. "Sales creates EPC lead and starts the workflow."
2. "GryLink secures EPC onboarding through token-based access."
3. "Ops verifies and activates EPC."
4. "Seller completes KYC and becomes case-ready."
5. "CWCRF is submitted with all mandatory billing proofs."
6. "Ops verifies sections and logs any super-access correction."
7. "RMT assigns risk and generates CWCAF."
8. "Ops triages and forwards approved cases to EPC."
9. "EPC reviews, accepts declaration, and confirms bid terms."
10. "Ops matches and dispatches to NBFCs."
11. "NBFC quotes, seller selects, due diligence completes."
12. "Sanction is accepted and disbursement is confirmed with UTR."
13. "Case closes in DISBURSED state with complete auditability."

---

## 14) Final Delivery Note

For this sub-5-minute version, prioritize status transitions and approvals over deep form-filling visuals. If any screen takes too long to load, cut directly to the success state as long as the status badge and role context are clearly visible.
