# Gryork Platform Analysis: Workflow vs Implementation

## Executive Summary

This document compares the defined workflow (doc/workflow.md) against the current implementation across all portals and backend services.

**Implementation Status: ~90% Complete** (Updated after refinements)

---

## Workflow Steps Analysis

### ✅ Step 1 – Core Actors & Roles
**Status: IMPLEMENTED**

| Role | Portal | Backend Auth |
|------|--------|--------------|
| Sales Team | `official_portal` (admin.gryork.com) | ✅ `sales` role |
| Ops Team | `official_portal` (admin.gryork.com) | ✅ `ops` role |
| EPC/Company | `partner-portal` (partner.gryork.com) | ✅ `epc` role |
| Sub-Contractor | `subcontractor-portal` (app.gryork.com) | ✅ `subcontractor` role |
| NBFC | `partner-portal` (partner.gryork.com) | ✅ `nbfc` role |
| RMT | `official_portal` | ⚠️ `rmt` role exists but no UI |
| Admin | Both portals | ✅ `admin` role |

---

### ✅ Step 2 – Offline Sales Initiation
**Status: DESIGN COMPLETE (Offline Process)**

- This is an offline step
- Sales contacts company, collects details
- No system implementation needed

---

### ✅ Step 3 – Company Lead Creation (Sales Dashboard)
**Status: IMPLEMENTED**

**Backend:**
- `POST /api/sales/leads` ✅
- `GET /api/sales/leads` ✅
- `GET /api/sales/dashboard` ✅
- `salesService.createCompanyLead()` ✅

**Frontend (official_portal - SalesDashboard.tsx):**
- Create Company Lead form ✅
- Company leads table ✅
- Status badges ✅

---

### ✅ Step 4 – GryLink Generation & Credential Creation
**Status: IMPLEMENTED**

**Backend:**
- `GET /api/grylink/validate/:token` ✅
- `POST /api/grylink/set-password` ✅
- `grylinkService.generateLink()` ✅

**Frontend (grylink-portal - OnboardingPage.tsx):**
- Token validation ✅
- Password setup form ✅
- Redirect to partner-portal ✅

---

### ✅ Step 5 – EPC Self-Onboarding (Documents)
**Status: IMPLEMENTED**

**Backend:**
- `POST /api/company/documents` ✅
- `GET /api/company/profile` ✅
- Cloudinary file storage ✅

**Frontend (partner-portal - DashboardPage.tsx):**
- Document upload form ✅
- Document type selection ✅
- Document grid display ✅

---

### ✅ Step 6 – Ops Verification of EPC
**Status: IMPLEMENTED**

**Backend:**
- `POST /api/ops/companies/:id/verify` ✅
- `GET /api/ops/pending` ✅

**Frontend (official_portal - OpsDashboard.tsx):**
- Pending companies table ✅
- Approve/Reject actions ✅

---

### ✅ Step 7 – Sub-Contractor Intake by EPC
**Status: IMPLEMENTED**

**Backend:**
- `POST /api/company/subcontractors` ✅
- `POST /api/company/subcontractors/bulk` ✅

**Frontend (partner-portal - DashboardPage.tsx):**
- Add Sub-Contractor form ✅
- Bulk Excel upload ✅
- Sub-contractors table ✅

---

### ✅ Step 8 – Sales Contact with Sub-Contractor
**Status: IMPLEMENTED** (NEW)

**Backend:**
- `GET /api/sales/subcontractors` ✅
- `PATCH /api/sales/subcontractors/:id/contacted` ✅ (NEW)
- `salesService.markSubContractorContacted()` ✅ (NEW)

**Frontend (official_portal - SalesDashboard.tsx):**
- Contact status badges ✅ (NEW)
- "Mark as Contacted" button ✅ (NEW)
- Contact notes modal ✅ (NEW)
- Pending contact counter ✅ (NEW)

**Model (SubContractor):**
- `contactedAt` field ✅ (NEW)
- `contactedBy` field ✅ (NEW)
- `contactNotes` field ✅ (NEW)

---

### ✅ Step 9 – Sub-Contractor Signup
**Status: IMPLEMENTED**

**Backend:**
- `POST /api/auth/login` ✅

**Frontend (subcontractor-portal):**
- Login page ✅
- Register page ✅

**Deferred:**
- Google OAuth (future)
- Phone + OTP (future)

---

### ✅ Step 10 – Sub-Contractor Profile Completion
**Status: IMPLEMENTED**

**Backend:**
- `PUT /api/subcontractor/profile` ✅

**Frontend (subcontractor-portal - DashboardPage.tsx):**
- Profile form ✅
- All required fields ✅

---

### ✅ Step 11 – Bill Upload by Sub-Contractor
**Status: IMPLEMENTED**

**Backend:**
- `POST /api/subcontractor/bill` ✅
- Cloudinary storage ✅

**Frontend (subcontractor-portal - DashboardPage.tsx):**
- Bill upload form ✅
- Bills table ✅

---

### ✅ Step 12 – Ops Bill Verification
**Status: IMPLEMENTED**

**Backend:**
- `POST /api/ops/bills/:id/verify` ✅

**Frontend (official_portal - OpsDashboard.tsx):**
- Pending bills table ✅
- Approve/Reject ✅

---

### ✅ Step 13 – CWC RF Submission
**Status: IMPLEMENTED** (NEW)

**Backend:**
- `POST /api/subcontractor/cwc` ✅

**Frontend (subcontractor-portal - DashboardPage.tsx):**
- CWC tab ✅ (NEW)
- Select verified bill ✅ (NEW)
- Submit CWC RF ✅ (NEW)
- CWC history table ✅ (NEW)

**Deferred:**
- ₹1,000 platform fee payment integration (future)

---

### ✅ Step 14 – Chat-Based KYC
**Status: IMPLEMENTED**

**Backend:**
- `POST /api/ops/kyc/:id/request` ✅
- `POST /api/ops/kyc/:id/complete` ✅
- Chat APIs ✅

**Frontend (official_portal - OpsDashboard.tsx):**
- KYC tab ✅
- Request docs button ✅
- Complete KYC button ✅

---

### ✅ Step 15 – Case Ready for Company Review
**Status: IMPLEMENTED**

**Backend:**
- Case auto-created when KYC completes ✅

---

### ✅ Step 16 – EPC Bill Verification
**Status: IMPLEMENTED**

**Backend:**
- `POST /api/cases/:id/review` ✅

**Frontend (partner-portal - DashboardPage.tsx):**
- Cases table ✅
- Approve/Reject buttons ✅

---

### ✅ Step 17 – EPC Bid Placement
**Status: IMPLEMENTED**

**Backend:**
- `POST /api/bids` ✅

**Frontend (partner-portal - DashboardPage.tsx):**
- Place Bid modal ✅
- Bid Amount, Duration ✅

---

### ✅ Step 18 – Sub-Contractor Decision
**Status: IMPLEMENTED** (NEW)

**Backend:**
- `POST /api/subcontractor/bids/:id/respond` ✅
- `GET /api/subcontractor/bids` ✅ (NEW)

**Frontend (subcontractor-portal - DashboardPage.tsx):**
- Bids tab ✅ (NEW)
- Incoming bids list ✅ (NEW)
- Accept/Reject/Negotiate buttons ✅ (NEW)
- Counter-offer form ✅ (NEW)
- Negotiation history ✅ (NEW)
- Pending bids notification ✅ (NEW)

---

### ✅ Step 19 – Negotiation & Agreement
**Status: IMPLEMENTED** (NEW)

**Backend:**
- `POST /api/bids/:id/negotiate` ✅
- `POST /api/bids/:id/lock` ✅
- `GET /api/bids/my` ✅ (NEW)

**Frontend (partner-portal - DashboardPage.tsx):**
- My Bids tab (for both EPC and NBFC) ✅ (NEW)
- Negotiation history ✅ (NEW)
- Counter-offer form ✅ (NEW)
- Lock Agreement button ✅ (NEW)
- Locked terms display ✅ (NEW)

---

### ⚠️ Step 20 – Post-Agreement Handoff (RMT)
**Status: NOT IMPLEMENTED**

**Missing:**
- RMT dashboard
- Risk analysis workflow
- NBFC report generation

---

## Portal Feature Matrix (Updated)

| Feature | subcontractor-portal | partner-portal | official_portal |
|---------|---------------------|----------------|-----------------|
| Login | ✅ | ✅ | ✅ |
| Register | ✅ | ❌ (via GryLink) | ❌ (manual) |
| Profile | ✅ | ✅ | N/A |
| Documents | ❌ | ✅ | View only |
| Bill Upload | ✅ | ❌ | ❌ |
| Bill Verify | ❌ | ❌ | ✅ |
| Add SCs | ❌ | ✅ | ❌ |
| Contact SCs | ❌ | ❌ | ✅ (NEW) |
| Case Review | ❌ | ✅ | View |
| Place Bid | ❌ | ✅ | ❌ |
| View Bids | ✅ (NEW) | ✅ (NEW) | ❌ |
| Respond Bids | ✅ (NEW) | ❌ | ❌ |
| Negotiate | ✅ (NEW) | ✅ (NEW) | ❌ |
| CWC Submit | ✅ (NEW) | ❌ | ❌ |
| KYC Chat | ❌ | ❌ | ✅ |
| Company Verify | ❌ | ❌ | ✅ |
| Create Lead | ❌ | ❌ | ✅ |

---

## Remaining Gaps

### Low Priority / Future
1. **RMT Dashboard** - Post-commercial risk analysis (Step 20)
2. **OAuth/OTP signup** - Alternative auth methods
3. **Platform fee integration** - ₹1,000 CWC fee payment
4. **Full Chat UI** - Real-time chat for KYC

---

## Conclusion

**Overall Implementation: ~90% Complete** (up from ~80%)

The platform now covers Steps 1-19 of the workflow. Key improvements made:
1. ✅ Sub-contractor bid response UI (Step 18)
2. ✅ Full negotiation interface (Step 19)
3. ✅ CWC RF submission (Step 13)
4. ✅ Sales contact tracking (Step 8)
5. ✅ My Bids tab for EPC/NBFC

Only Step 20 (RMT post-agreement) remains unimplemented.
