# GRYORK PLATFORM - IMPLEMENTATION PLAN
## Complete Workflow Implementation (Monolith Architecture)

**Version:** 2.1  
**Date:** February 13, 2026  
**Status:** Phase 1 - In Progress (NBFC LPS & CWCAF Implementation)

---

## 🆕 RECENT IMPLEMENTATION UPDATE (February 13, 2026)

### ✅ COMPLETED IN LATEST PUSH

#### Backend - NBFC Module (Full)
| Component | Status | Details |
|-----------|--------|---------|
| `models/Nbfc.js` | ✅ DONE | Complete NBFC model with LPS (Lending Preference Sheet) |
| `routes/nbfc.js` | ✅ DONE | Full CRUD + LPS management + matching engine |
| `services/nbfcService.js` | ✅ DONE | Business logic for LPS, matching, quota management |

**LPS Features Implemented:**
- Interest Rate Policy (FLAT_RATE, RISK_BASED, MINIMUM_RATE)
- Risk Appetite (LOW_ONLY, LOW_MEDIUM, ALL_CATEGORIES)
- Ticket Size (min/max amounts)
- Monthly Lending Capacity (total, used, available)
- Tenure Preferences (30, 45, 60, 90 days)
- Sector Preferences
- Geographic Preferences
- `matchesLps()` method for CWCAF matching

#### Backend - Case Model Updates
| Feature | Status | Details |
|---------|--------|---------|
| CWCAF Schema | ✅ DONE | Full CWCAF structure in Case model |
| Seller Profile Summary | ✅ DONE | Business details, KYC status |
| Buyer Approval Snapshot | ✅ DONE | A, B, C verification fields |
| Risk Assessment Details | ✅ DONE | Buyer credibility, payment dependency, invoice aging |
| RMT Recommendation | ✅ DONE | Suggested rates, comments, concerns |
| NBFC Sharing | ✅ DONE | Multi-NBFC sharing with quotation tracking |
| RMT Case Number | ✅ DONE | RMT-CWC-XXXX format auto-generation |

#### Backend - SubContractor Model Updates
| Feature | Status | Details |
|---------|--------|---------|
| Constitution Type | ✅ DONE | PROPRIETORSHIP, PARTNERSHIP, LLP, PVT_LTD, PUBLIC_LTD |
| Registered Address | ✅ DONE | Full address structure |
| Bank Details | ✅ DONE | Account, IFSC, verification status |
| KYC Documents | ✅ DONE | PAN, Aadhaar, GST, Cancelled Cheque with verification tracking |

#### Backend - API Routes Added
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/nbfc` | POST | Create NBFC |
| `/api/nbfc` | GET | List NBFCs |
| `/api/nbfc/dashboard` | GET | NBFC dashboard |
| `/api/nbfc/lps` | GET/PUT | Manage own LPS |
| `/api/nbfc/:id/lps` | GET/PUT | Admin manage LPS |
| `/api/nbfc/match/:caseId` | GET | Tech Engine - match NBFCs for case |
| `/api/nbfc/share/:caseId` | POST | Share case with NBFCs |
| `/api/nbfc/reset-monthly-capacity` | POST | Reset monthly capacity (admin) |

#### Frontend - Partner Portal
| Component | Status | Details |
|-----------|--------|---------|
| LPS API integrated | ✅ DONE | `nbfcApi.getLps()`, `nbfcApi.updateLps()` |
| CWCRF Buyer Verification API | ✅ DONE | `cwcrfApi.verifyCwcrf()`, `cwcrfApi.rejectCwcrf()` |
| NBFC Quote API | ✅ DONE | `cwcrfApi.submitQuotation()` |
| DashboardPage.tsx | ✅ Enhanced | Document upload, sub-contractor management, bidding |

#### Frontend - Official Portal
| Component | Status | Details |
|-----------|--------|---------|
| RmtDashboard.tsx | ✅ DONE | Full RMT dashboard with CWCRF queue |
| CWCAF Generation API | ✅ DONE | `cwcrfApi.generateCwcaf()` |
| NBFC Matching API | ✅ DONE | `cwcrfApi.getMatchingNbfcs()` |
| Share with NBFCs API | ✅ DONE | `cwcrfApi.shareWithNbfcs()` |

---

### 📊 UPDATED GAP STATUS

| Gap | Priority | Previous Status | Current Status |
|-----|----------|-----------------|----------------|
| 3.1 CWCRF Full Form | P0 | 🔴 Not Started | 🟡 Backend Ready, UI Pending |
| 3.2 EPC CWCRF Verification | P0 | 🔴 Not Started | 🟡 API Ready, UI Pending |
| 3.3 NBFC LPS Configuration | P0 | 🔴 Not Started | ✅ COMPLETE |
| 3.4 CWCAF Generation | P0 | 🔴 Not Started | ✅ COMPLETE |
| 3.5 NBFC Quote & Selection | P0 | 🔴 Not Started | 🟡 API Ready, UI Pending |
| 3.6 KYC Chat UI | P1 | 🟡 API Only | 🟡 API Only (unchanged) |
| 3.7 Status Timeline Tracker | P1 | 🔴 Not Started | 🔴 Not Started |
| 3.8 2FA for Internal Users | P2 | 🔴 Not Started | 🔴 Not Started |

---

### 🎯 NEXT PRIORITY ITEMS

1. **subcontractor-portal**: Build CWCRF multi-step form UI (Step 1-6)
2. **partner-portal**: Build EPC verification UI (A, B, C inputs)
3. **partner-portal**: Build NBFC LPS configuration UI
4. **subcontractor-portal**: Build NBFC quote selection UI
5. **All portals**: Add status timeline component

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Gap Analysis](#3-gap-analysis)
4. [Implementation Phases](#4-implementation-phases)
5. [Database Schema Updates](#5-database-schema-updates)
6. [API Endpoints Required](#6-api-endpoints-required)
7. [Frontend Pages Required](#7-frontend-pages-required)
8. [Priority Matrix](#8-priority-matrix)
9. [Timeline](#9-timeline)

---

## 1. EXECUTIVE SUMMARY

### Platform Overview
Gryork is a **Bill Discounting Platform** for the Infrastructure sector, connecting:
- **Sub-Contractors (Sellers)** - Submit bills, request working capital
- **EPC Companies (Buyers)** - Validate bills, approve CWC requests
- **NBFC Partners** - Fund deals based on risk assessment
- **Internal Teams** - Sales, Operations, Risk Management

### Domain Structure
| Subdomain | Portal | Purpose |
|-----------|--------|---------|
| `gryork.com` | Gryork-public | Marketing website |
| `app.gryork.com` | subcontractor-portal | Sub-contractor dashboard |
| `link.gryork.com` | grylink-portal | EPC onboarding |
| `partner.gryork.com` | partner-portal | EPC & NBFC operations |
| `admin.gryork.com` | official_portal | Internal staff operations |
| `api.gryork.com` | backend | API services |

---

## 2. CURRENT STATE ANALYSIS

### ✅ BACKEND - IMPLEMENTED

#### Models (Complete)
| Model | Status | Notes |
|-------|--------|-------|
| User | ✅ Done | Basic user with roles |
| Company | ✅ Done | EPC company with states |
| SubContractor | ✅ Done | Seller with document structure |
| Bill | ✅ Done | Bill with WCC, measurement sheet |
| CwcRf | ✅ Done | CWC request form |
| Case | ✅ Done | Full workflow case |
| Bid | ✅ Done | Commercial bidding |
| GryLink | ✅ Done | Tokenized onboarding |
| ChatMessage | ✅ Done | KYC chat |
| Document | ✅ Done | Document storage |

#### Routes (Implemented)
| Route | Status | Endpoints |
|-------|--------|-----------|
| /api/auth | ✅ Done | login, register |
| /api/sales | ✅ Done | leads, subcontractors, dashboard |
| /api/grylink | ✅ Done | validate, set-password |
| /api/company | ✅ Done | CRUD, docs upload |
| /api/subcontractor | ✅ Done | profile, docs |
| /api/ops | ✅ Done | verify, kyc, chat |
| /api/cases | ✅ Done | review, risk-assessment |
| /api/bids | ✅ Done | place, negotiate, lock |

### ✅ FRONTEND - IMPLEMENTED

#### Portals
| Portal | Pages | Status |
|--------|-------|--------|
| Gryork-public | Landing, About, Services | ✅ Done |
| subcontractor-portal | Login, Register, Dashboard, Onboarding, ProfileCompletion | ✅ Done |
| grylink-portal | HomePage, OnboardingPage | ✅ Done |
| partner-portal | Login, Dashboard, NbfcDashboard | ⚠️ Partial |
| official_portal | Login, Sales, Ops, RMT, Founder dashboards | ⚠️ Partial |

---

## 3. GAP ANALYSIS

### 🔴 CRITICAL GAPS

#### 3.1 CWCRF Full Form (Sub-Contractor Portal)
**Current:** Basic bill upload only  
**Required:** Complete CWCRF form with:
- Section A: Buyer & Project Details (dropdown of partner EPCs)
- Section B: Invoice Details (number, date, amount, expected payment)
- Section C: CWC Request (amount, tenure)
- Section D: Interest Rate Preference (min-max range)
- Platform fee payment integration (₹1000)
- Seller declaration acceptance (mandatory)

#### 3.2 EPC CWCRF Verification (Partner Portal)
**Current:** Basic case review  
**Required:** Three-part mandatory verification:
- A. Approved CWC Amount (may differ from requested)
- B. Repayment Timeline (30/45/60/90 days dropdown)
- C. Repayment Arrangement Logic (source selection + text)

#### 3.3 NBFC LPS Configuration (Partner Portal)
**Current:** Not implemented  
**Required:** Lending Preference Sheet:
- Interest Rate Policy (min/max rates)
- Risk Appetite (Low/Medium/High selection)
- Ticket Size (min/max amounts)
- Monthly Lending Capacity

#### 3.4 CWCAF Generation (Official Portal - RMT)
**Current:** Basic risk assessment  
**Required:** Full CWCAF document:
- Seller Profile Summary
- Buyer Approval Snapshot (A, B, C from EPC)
- Invoice Details
- Risk Assessment (parameters + category)
- RMT Recommendation
- Gryork Disclaimer

#### 3.5 NBFC Quote Submission & Selection
**Current:** Not implemented  
**Required:**
- NBFC receives matching CWCAFs based on LPS
- NBFC submits quote (rate, tenure, remarks)
- Seller views quotes on dashboard
- Seller selects NBFC
- Status: "Moved to NBFC Process"

### 🟡 IMPORTANT GAPS

#### 3.6 KYC Chat UI (Sub-Contractor Portal)
**Current:** API exists, no UI  
**Required:** Real-time chat interface with:
- Document request/response
- File attachment support
- Status indicators

#### 3.7 Status Timeline Tracker
**Current:** Not visible  
**Required:** Visual timeline showing:
- KYC Completed ✓
- CWCRF Submitted ✓
- Buyer Verification Pending ⏳
- Under Risk Review ⏳
- Shared with NBFCs ⏳
- NBFC Quotes Received
- NBFC Selected

#### 3.8 2FA for Internal Users
**Current:** Not implemented  
**Required:** TOTP-based 2FA for:
- Sales (admin.gryork.com)
- Ops (admin.gryork.com)
- RMT (admin.gryork.com)
- NBFC (partner.gryork.com)

#### 3.9 Sales Agent Dashboard Enhancements
**Current:** Basic stats  
**Required:**
- Lead status pipeline view
- GryLink generation & tracking
- Sub-contractor contact tracking
- Commission tracking

#### 3.10 Ops Document Queue
**Current:** Basic list  
**Required:**
- Pending document queue with filters
- Document preview modal
- Approve/Reject with mandatory notes
- Re-upload request workflow

### 🟢 NICE TO HAVE

- Real-time notifications (WebSocket)
- Email notifications for status changes
- SMS OTP for sub-contractor login
- Google OAuth for sub-contractors
- PDF generation for CWCAF
- Audit trail viewer
- SLA tracking dashboard

---

## 4. IMPLEMENTATION PHASES

### PHASE 1: CWCRF COMPLETE FLOW (Week 1-2)
**Priority: P0 - Critical**

#### 4.1.1 Backend Updates
1. **Update CwcRf Model**
   ```javascript
   // Add to CwcRf schema
   sectionA: {
     buyerId: ObjectId,
     buyerName: String,
     projectName: String,
     projectLocation: String,
   },
   sectionB: {
     invoiceNumber: String,
     invoiceDate: Date,
     invoiceAmount: Number,
     expectedPaymentDate: Date,
   },
   sectionC: {
     cwcRequested: Number,
     tenureRequested: Number, // days
   },
   sectionD: {
     interestRateMin: Number,
     interestRateMax: Number,
   },
   sellerDeclaration: {
     accepted: Boolean,
     acceptedAt: Date,
     ipAddress: String,
   }
   ```

2. **Create CWCRF Route**
   - POST /api/cwcrf - Submit full CWCRF
   - GET /api/cwcrf/:id - Get CWCRF details
   - GET /api/cwcrf/my - Get user's CWCRFs

3. **Payment Integration**
   - POST /api/payments/platform-fee - Initiate fee payment
   - POST /api/payments/webhook - Handle payment callback

#### 4.1.2 Frontend Updates (subcontractor-portal)
1. **CWCRFFormPage.tsx** - Multi-step form
   - Step 1: Seller Declaration (checkbox + text)
   - Step 2: Select Buyer (dropdown of partner EPCs)
   - Step 3: Invoice Details
   - Step 4: CWC Request
   - Step 5: Interest Preference
   - Step 6: Payment (₹1000 platform fee)
   - Step 7: Confirmation

2. **ApplicationStatusPage.tsx** - Timeline tracker

---

### PHASE 2: EPC VERIFICATION FLOW (Week 2-3)
**Priority: P0 - Critical**

#### 4.2.1 Backend Updates
1. **Update Case Model**
   ```javascript
   // Add to Case schema
   epcVerification: {
     approvedCwcAmount: Number,      // A
     repaymentTimeline: Number,       // B (days)
     repaymentSource: {               // C
       type: String, // enum
       description: String,
     },
     verifiedAt: Date,
     verifiedBy: ObjectId,
   }
   ```

2. **Create EPC Verification Route**
   - POST /api/cases/:id/epc-verify - Submit verification
   - GET /api/cases/pending-verification - Get pending cases

#### 4.2.2 Frontend Updates (partner-portal)
1. **CaseVerificationPage.tsx**
   - View case details
   - Input A: Approved CWC Amount
   - Input B: Repayment Timeline (dropdown)
   - Input C: Repayment Source (radio + text)
   - Submit verification

2. **EPCDashboard Updates**
   - Pending verifications queue
   - Verified cases list

---

### PHASE 3: NBFC LPS & CWCAF (Week 3-4) ✅ COMPLETE
**Priority: P0 - Critical**  
**Status: ✅ Backend Complete, Frontend API Integration Done**

#### 4.3.1 Backend Updates ✅ DONE
1. **Create NBFC Model** ✅
   ```javascript
   // Implemented in models/Nbfc.js with full LPS structure:
   lendingPreferenceSheet: {
     interestRatePolicy: { policyType, flatRate, riskBasedRates },
     riskAppetite: ['LOW', 'MEDIUM', 'HIGH'],
     ticketSize: { minimum, maximum },
     monthlyCapacity: { totalAmount, usedAmount, availableAmount },
     tenurePreference: { minDays, maxDays, preferredTenures },
     sectorPreferences: [...],
     geographicPreferences: [...],
   }
   ```

2. **NBFC Routes** ✅ - routes/nbfc.js
   - POST /api/nbfc - Create NBFC
   - GET /api/nbfc - List NBFCs
   - GET/PUT /api/nbfc/lps - Manage LPS
   - GET /api/nbfc/match/:caseId - Tech Engine matching
   - POST /api/nbfc/share/:caseId - Share with NBFCs

3. **CWCAF in Case Model** ✅ - models/Case.js
   - sellerProfileSummary
   - buyerApprovalSnapshot (A, B, C)
   - invoiceDetails
   - riskAssessmentDetails
   - rmtRecommendation
   - disclaimer

4. **NBFC Matching Service** ✅ - services/nbfcService.js
   - `matchNbfcsForCase()` - Tech Engine
   - `shareCaseWithNbfcs()` - Multi-NBFC sharing
   - `updateNbfcMetrics()` - Auto metrics
   - `matchesLps()` method on model

#### 4.3.2 Frontend Updates
1. **partner-portal API** ✅
   - `nbfcApi.getLps()`, `nbfcApi.updateLps()`
   - `cwcrfApi.getPendingVerifications()`, `cwcrfApi.verifyCwcrf()`
   - `cwcrfApi.submitQuotation()`

2. **official_portal API** ✅
   - `cwcrfApi.getRmtQueue()`, `cwcrfApi.generateCwcaf()`
   - `cwcrfApi.getMatchingNbfcs()`, `cwcrfApi.shareWithNbfcs()`

3. **RmtDashboard.tsx** ✅ - Full RMT dashboard with CWCRF queue

4. **UI Components** 🟡 PENDING
   - NBFC LPS configuration page
   - CWCAF viewer component
   - NBFC quote submission form

---

### PHASE 3 ORIGINAL (Reference - Superseded)
       monthlyCapacity: Number,
       updatedAt: Date,
     },
     credentials: {
       userId: ObjectId,
       twoFactorEnabled: Boolean,
     }
   }
   ```

2. **Create CWCAF Model**
   ```javascript
   const cwcafSchema = {
     caseId: ObjectId,
     cwcrfId: ObjectId,
     sellerSummary: Object,
     buyerApproval: Object,
     invoiceDetails: Object,
     riskAssessment: Object,
     rmtRecommendation: Object,
     disclaimer: String,
     generatedAt: Date,
     generatedBy: ObjectId,
     sharedWith: [{
       nbfcId: ObjectId,
       sharedAt: Date,
       status: String,
     }]
   }
   ```

3. **NBFC Routes**
   - GET /api/nbfc/lps - Get LPS
   - PUT /api/nbfc/lps - Update LPS
   - GET /api/nbfc/deals - Get matching deals
   - POST /api/nbfc/quote - Submit quote

4. **CWCAF Routes**
   - POST /api/cwcaf/generate - Generate CWCAF
   - POST /api/cwcaf/:id/share - Share with NBFCs
   - GET /api/cwcaf/:id - Get CWCAF details

#### 4.3.2 Frontend Updates

**official_portal - RMT Dashboard:**
1. **CWCAFGeneratorPage.tsx**
   - View case summary
   - Input risk assessment parameters
   - Generate CWCAF button
   - Preview CWCAF
   - Share with matching NBFCs

**partner-portal - NBFC Dashboard:**
1. **LPSConfigPage.tsx**
   - Interest rate range inputs
   - Risk appetite checkboxes
   - Ticket size range
   - Monthly capacity input

2. **DealReviewPage.tsx**
   - View received CWCAFs
   - Submit quote form
   - Track quote status

---

### PHASE 4: NBFC SELECTION & COMPLETION (Week 4-5)
**Priority: P1 - Important**

#### 4.4.1 Backend Updates
1. **Update Case Model**
   ```javascript
   // Add to Case schema
   nbfcQuotes: [{
     nbfcId: ObjectId,
     interestRate: Number,
     tenure: Number,
     remarks: String,
     submittedAt: Date,
     status: String, // PENDING, SELECTED, REJECTED
   }],
   selectedNbfcQuote: {
     nbfcId: ObjectId,
     selectedAt: Date,
     selectedBy: ObjectId,
   }
   ```

2. **Quote Selection Routes**
   - GET /api/cases/:id/quotes - Get quotes for case
   - POST /api/cases/:id/select-nbfc - Select NBFC
   - POST /api/nbfc/complete-deal - Mark deal complete

#### 4.4.2 Frontend Updates (subcontractor-portal)
1. **NBFCQuotesPage.tsx**
   - View all received quotes
   - Compare quotes table
   - Select NBFC button
   - Confirmation modal

2. **DealStatusPage.tsx**
   - Show "Moved to NBFC Process"
   - NBFC contact details
   - Next steps information

---

### PHASE 5: KYC CHAT & STATUS TRACKING (Week 5-6)
**Priority: P1 - Important**

#### 4.5.1 Frontend Updates (subcontractor-portal)
1. **KYCChatPage.tsx**
   - Chat interface with ops team
   - File upload in chat
   - Message status (sent, read)
   - Document request notifications

2. **StatusTimelinePage.tsx**
   - Visual timeline component
   - Status badges (completed, pending, current)
   - Estimated time for each step

#### 4.5.2 Frontend Updates (official_portal)
1. **KYCManagementPage.tsx**
   - Pending KYC queue
   - Chat interface with sub-contractors
   - Document request templates
   - Mark KYC complete button

---

### PHASE 6: SALES & OPS ENHANCEMENTS (Week 6-7)
**Priority: P2 - Nice to Have**

#### 4.6.1 Sales Dashboard Enhancements
1. **Pipeline view** with drag-drop status
2. **GryLink generator** with copy & email
3. **Sub-contractor tracker** with contact status
4. **Commission calculator** (future)

#### 4.6.2 Ops Dashboard Enhancements
1. **Document queue** with filters
2. **Bulk actions** (approve/reject multiple)
3. **Re-upload request** workflow
4. **Audit log viewer**

---

### PHASE 7: 2FA IMPLEMENTATION (Week 7-8)
**Priority: P2 - Nice to Have**

1. **Backend**
   - Install speakeasy for TOTP
   - Add 2FA fields to User model
   - Create 2FA setup/verify routes

2. **Frontend**
   - 2FA setup page with QR code
   - 2FA verification on login
   - Recovery code management

---

## 5. DATABASE SCHEMA UPDATES

### New Models Required
```
NBFC (new)
├── name, rbiRegistration
├── lps (Lending Preference Sheet)
└── credentials

CWCAF (new)
├── caseId, cwcrfId
├── sellerSummary, buyerApproval
├── riskAssessment, recommendation
└── sharedWith[]

Transaction (new)
├── caseId, nbfcId
├── amount, status
└── disbursementDetails
```

### Model Updates Required
```
CwcRf
├── + sectionA, sectionB, sectionC, sectionD
├── + sellerDeclaration
└── + platformFeeDetails

Case
├── + epcVerification
├── + nbfcQuotes[]
└── + selectedNbfcQuote

User
├── + twoFactorSecret
├── + twoFactorEnabled
└── + recoveryCodes[]
```

---

## 6. API ENDPOINTS REQUIRED

### New Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/cwcrf | Submit full CWCRF |
| GET | /api/cwcrf/:id | Get CWCRF details |
| GET | /api/cwcrf/my | Get user's CWCRFs |
| POST | /api/payments/platform-fee | Initiate fee payment |
| POST | /api/cases/:id/epc-verify | EPC verification |
| GET | /api/cases/pending-verification | Pending for EPC |
| POST | /api/nbfc | Create NBFC |
| GET | /api/nbfc/lps | Get LPS config |
| PUT | /api/nbfc/lps | Update LPS |
| GET | /api/nbfc/deals | Get matching deals |
| POST | /api/nbfc/quote | Submit quote |
| POST | /api/cwcaf/generate | Generate CWCAF |
| POST | /api/cwcaf/:id/share | Share with NBFCs |
| GET | /api/cases/:id/quotes | Get quotes |
| POST | /api/cases/:id/select-nbfc | Select NBFC |
| POST | /api/2fa/setup | Setup 2FA |
| POST | /api/2fa/verify | Verify 2FA |

---

## 7. FRONTEND PAGES REQUIRED

### subcontractor-portal (app.gryork.com)
| Page | Priority | Status |
|------|----------|--------|
| CWCRFFormPage | P0 | 🔴 New |
| KYCChatPage | P1 | 🔴 New |
| StatusTimelinePage | P1 | 🔴 New |
| NBFCQuotesPage | P1 | 🔴 New |
| DealStatusPage | P1 | 🔴 New |

### partner-portal (partner.gryork.com)
| Page | Priority | Status |
|------|----------|--------|
| CaseVerificationPage | P0 | 🔴 New |
| LPSConfigPage | P0 | 🔴 New |
| DealReviewPage | P0 | 🔴 New |
| QuoteSubmissionPage | P0 | 🔴 New |

### official_portal (admin.gryork.com)
| Page | Priority | Status |
|------|----------|--------|
| CWCAFGeneratorPage | P0 | 🔴 New |
| KYCManagementPage | P1 | 🔴 New |
| DocumentQueuePage | P1 | 🔴 New |
| PipelineViewPage | P2 | 🔴 New |
| TwoFactorSetupPage | P2 | 🔴 New |

---

## 8. PRIORITY MATRIX

### P0 - CRITICAL (Must Have for Launch)
1. ✅ CWCRF Complete Form
2. ✅ EPC Verification Flow
3. ✅ NBFC LPS Configuration
4. ✅ CWCAF Generation
5. ✅ NBFC Quote & Selection

### P1 - IMPORTANT (Launch + 2 weeks)
6. KYC Chat UI
7. Status Timeline Tracker
8. Dashboard Enhancements

### P2 - NICE TO HAVE (Post-Launch)
9. 2FA Implementation
10. Real-time Notifications
11. SMS OTP Login
12. Google OAuth
13. Audit Trail Viewer

---

## 9. TIMELINE

```
Week 1:  CWCRF Backend + Form UI
Week 2:  CWCRF Complete + Payment Integration
Week 3:  EPC Verification Flow
Week 4:  NBFC LPS + CWCAF Generation
Week 5:  NBFC Quote Submission + Selection
Week 6:  KYC Chat + Status Timeline
Week 7:  Dashboard Enhancements
Week 8:  2FA + Testing + Bug Fixes
```

### Milestones
| Week | Milestone | Deliverable |
|------|-----------|-------------|
| 2 | CWCRF MVP | Sub-contractors can submit full CWCRF |
| 4 | EPC + NBFC MVP | EPCs verify, NBFCs configure LPS |
| 6 | Quote Flow | Full bill-to-funding flow works |
| 8 | Production Ready | All P0 + P1 features complete |

---

## APPENDIX A: WORKFLOW STATE MACHINE

### Sub-Contractor States
```
LEAD_CREATED → PROFILE_INCOMPLETE → PROFILE_COMPLETED → DOCS_SUBMITTED 
    → RMT_PENDING → RMT_APPROVED → EPC_VALIDATION_PENDING 
    → EPC_VALIDATED → ACTIVE
```

### Company (EPC) States
```
LEAD_CREATED → CREDENTIALS_CREATED → DOCS_SUBMITTED 
    → ACTION_REQUIRED → ACTIVE
```

### Case States
```
READY_FOR_COMPANY_REVIEW → EPC_VERIFIED → RMT_APPROVED 
    → PENDING_NBFC_SHARE → SHARED_WITH_NBFC → NBFC_APPROVED 
    → ESCROW_SETUP → DISBURSED → COMPLETED
```

### Bill States
```
UPLOADED → PENDING_WCC → PENDING_MEASUREMENT → UNDER_REVIEW 
    → VERIFIED → SUBMITTED_TO_NBFC
```

### CWCRF States
```
SUBMITTED → KYC_REQUIRED → KYC_IN_PROGRESS → KYC_COMPLETED 
    → ACTION_REQUIRED
```

### Commercial (Bid) States
```
SUBMITTED → NEGOTIATION_IN_PROGRESS → ACCEPTED → COMMERCIAL_LOCKED
```

---

**Document End**
