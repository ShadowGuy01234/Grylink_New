# Gryork Platform - Complete Technical Documentation

**Version:** 1.0  
**Last Updated:** February 12, 2026  
**Project Type:** Bill Discounting Platform for Construction Industry

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Backend Models](#backend-models)
4. [API Routes](#api-routes)
5. [Backend Services](#backend-services)
6. [Frontend Portals](#frontend-portals)
7. [Configuration](#configuration)
8. [Authentication & Authorization](#authentication--authorization)
9. [File Upload Handling](#file-upload-handling)
10. [Email Notifications](#email-notifications)
11. [Workflow Mapping](#workflow-mapping)

---

## System Overview

Gryork is a comprehensive **bill discounting platform** designed for the construction industry. It connects:

- **EPC Companies (Buyers)** - Large contractors who need to pay sub-contractors
- **Sub-Contractors (Sellers)** - Smaller contractors who need earlier payment for their invoices
- **NBFCs (Financiers)** - Financial institutions that fund the bill discounting

### Core Value Proposition

Sub-contractors upload their verified bills, and EPC companies can bid on them to provide early payment (at a discount). This creates a marketplace for invoice financing in the construction sector.

---

## Architecture

### Multi-Domain Structure

| Domain | Purpose | Portal |
|--------|---------|--------|
| `gryork.com` | Public Website | Gryork-public (Next.js) |
| `app.gryork.com` | Sub-Contractor Portal | subcontractor-portal (Vite/React) |
| `link.gryork.com` | GryLink Onboarding | grylink-portal (Vite/React) |
| `partner.gryork.com` | EPC & NBFC Portal | partner-portal (Vite/React) |
| `admin.gryork.com` | Internal Admin Portal | official_portal (Vite/React) |
| Legacy/Dev | Combined Frontend | frontend (Vite/React) |

### Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| File Storage | Cloudinary |
| Email | Nodemailer (SMTP) |
| Auth | JWT (JSON Web Tokens) |
| Frontend | React, TypeScript, Vite |
| Public Site | Next.js |

---

## Backend Models

### 1. User Model

**File:** `backend/models/User.js`  
**Purpose:** All system users including internal staff and external users

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Required, trimmed |
| `email` | String | Required, unique, lowercase |
| `password` | String | Hashed with bcrypt (12 rounds) |
| `phone` | String | Optional |
| `role` | Enum | `sales`, `epc`, `subcontractor`, `ops`, `rmt`, `admin` |
| `isActive` | Boolean | Default: true |
| `companyId` | ObjectId → Company | For EPC users |
| `subContractorId` | ObjectId → SubContractor | For sub-contractor users |
| `createdAt/updatedAt` | Date | Timestamps |

**Methods:**
- `comparePassword(candidatePassword)` - Bcrypt password comparison

---

### 2. Company Model

**File:** `backend/models/Company.js`  
**Purpose:** EPC/Buyer companies that onboard to the platform

| Field | Type | Description |
|-------|------|-------------|
| `companyName` | String | Required |
| `ownerName` | String | Required |
| `email` | String | Required, unique |
| `phone` | String | Required |
| `address` | String | Required |
| `status` | Enum | Company lifecycle status |
| `role` | Enum | `BUYER`, `PENDING` |
| `salesAgentId` | ObjectId → User | Who created this lead |
| `userId` | ObjectId → User | The EPC user account |
| `verificationNotes` | String | Ops verification notes |
| `verifiedBy` | ObjectId → User | |
| `verifiedAt` | Date | |
| `statusHistory` | Array | Audit trail |

**Status Enum Values:**
- `LEAD_CREATED` - Initial state after sales creates
- `CREDENTIALS_CREATED` - After password set via GryLink
- `DOCS_SUBMITTED` - After EPC uploads documents
- `ACTION_REQUIRED` - Ops requests more info
- `ACTIVE` - Fully verified and active

---

### 3. SubContractor Model

**File:** `backend/models/SubContractor.js`  
**Purpose:** Sub-contractor/seller organizations

| Field | Type | Description |
|-------|------|-------------|
| `companyName` | String | Optional initially |
| `contactName` | String | |
| `ownerName` | String | |
| `email` | String | Required |
| `phone` | String | |
| `address` | String | |
| `vendorId` | String | Vendor ID from EPC |
| `gstin` | String | GST Number |
| `status` | Enum | `LEAD_CREATED`, `PROFILE_INCOMPLETE`, `PROFILE_COMPLETED` |
| `linkedEpcId` | ObjectId → Company | Required - which EPC added them |
| `salesAgentId` | ObjectId → User | Inherited from EPC |
| `userId` | ObjectId → User | Their user account |
| `selectedEpcId` | ObjectId → Company | Optional selection during profile |
| `contactedAt` | Date | When sales contacted them |
| `contactedBy` | ObjectId → User | |
| `contactNotes` | String | |
| `statusHistory` | Array | Audit trail |

---

### 4. Bill Model

**File:** `backend/models/Bill.js`  
**Purpose:** Bills/invoices uploaded by sub-contractors

| Field | Type | Description |
|-------|------|-------------|
| `subContractorId` | ObjectId → SubContractor | Required |
| `uploadedBy` | ObjectId → User | Required |
| `linkedEpcId` | ObjectId → Company | Required |
| `billNumber` | String | |
| `amount` | Number | |
| `description` | String | |
| `fileName` | String | Required |
| `fileUrl` | String | Cloudinary URL |
| `cloudinaryPublicId` | String | Required |
| `fileSize` | Number | |
| `mimeType` | String | |
| `uploadMode` | Enum | `image`, `excel` |
| `status` | Enum | `UPLOADED`, `VERIFIED`, `REJECTED` |
| `verificationNotes` | String | |
| `verifiedBy` | ObjectId → User | |
| `verifiedAt` | Date | |
| `statusHistory` | Array | |

---

### 5. Document Model

**File:** `backend/models/Document.js`  
**Purpose:** Company KYC/verification documents

| Field | Type | Description |
|-------|------|-------------|
| `companyId` | ObjectId → Company | Required |
| `uploadedBy` | ObjectId → User | Required |
| `documentType` | Enum | See below |
| `fileName` | String | Required |
| `fileUrl` | String | Cloudinary URL |
| `cloudinaryPublicId` | String | Required |
| `fileSize` | Number | |
| `mimeType` | String | |
| `status` | Enum | `pending`, `verified`, `rejected` |
| `verificationNotes` | String | |
| `verifiedBy` | ObjectId → User | |
| `verifiedAt` | Date | |

**Document Types:**
- `CIN` - Company Incorporation Number
- `GST` - GST Registration
- `PAN` - PAN Card
- `BOARD_RESOLUTION`
- `BANK_STATEMENTS`
- `AUDITED_FINANCIALS`
- `PROJECT_DETAILS`
- `CASHFLOW_DETAILS`
- `OTHER`

---

### 6. Case Model

**File:** `backend/models/Case.js`  
**Purpose:** A funding case created after KYC completion

| Field | Type | Description |
|-------|------|-------------|
| `billId` | ObjectId → Bill | Required |
| `subContractorId` | ObjectId → SubContractor | Required |
| `epcId` | ObjectId → Company | Required |
| `cwcRfId` | ObjectId → CwcRf | |
| `caseNumber` | String | Auto-generated: `GRY-000001` |
| `status` | Enum | See below |
| `epcReviewNotes` | String | |
| `epcReviewedBy` | ObjectId → User | |
| `epcReviewedAt` | Date | |
| `riskAssessment` | Object | Risk scoring data |
| `commercialSnapshot` | Mixed | Locked terms snapshot |
| `lockedAt` | Date | |
| `statusHistory` | Array | |

**Case Status Enum:**
- `READY_FOR_COMPANY_REVIEW` - Initial after KYC
- `EPC_REJECTED` - EPC rejected the bill
- `EPC_VERIFIED` - EPC approved the bill
- `RMT_APPROVED` - Risk team approved
- `RMT_REJECTED` - Risk team rejected
- `RMT_NEEDS_REVIEW` - Needs more info
- `BID_PLACED` - A bid has been placed
- `NEGOTIATION_IN_PROGRESS` - Active negotiation
- `COMMERCIAL_LOCKED` - Final agreement locked

**Risk Assessment Object:**
```javascript
{
  riskScore: Number,
  riskLevel: 'low' | 'medium' | 'high' | 'critical',
  assessment: String,
  recommendation: 'approve' | 'reject' | 'needs_review',
  notes: String,
  assessedBy: ObjectId,
  assessedAt: Date
}
```

---

### 7. Bid Model

**File:** `backend/models/Bid.js`  
**Purpose:** Commercial bids placed by EPC companies

| Field | Type | Description |
|-------|------|-------------|
| `caseId` | ObjectId → Case | Required |
| `epcId` | ObjectId → Company | Required |
| `placedBy` | ObjectId → User | Required |
| `bidAmount` | Number | Required |
| `fundingDurationDays` | Number | Required |
| `status` | Enum | See below |
| `negotiations` | Array | Negotiation history |
| `lockedTerms` | Object | Final locked terms |
| `statusHistory` | Array | |

**Bid Status Enum:**
- `SUBMITTED` - Initial bid placed
- `ACCEPTED` - Sub-contractor accepted
- `REJECTED` - Sub-contractor rejected
- `NEGOTIATION_IN_PROGRESS` - Counter-offers active
- `COMMERCIAL_LOCKED` - Agreement finalized

**Negotiation Object:**
```javascript
{
  counterAmount: Number,
  counterDuration: Number,
  proposedBy: ObjectId,
  proposedByRole: 'epc' | 'subcontractor',
  message: String,
  createdAt: Date
}
```

**Locked Terms Object:**
```javascript
{
  finalAmount: Number,
  finalDuration: Number,
  lockedAt: Date
}
```

---

### 8. CwcRf Model

**File:** `backend/models/CwcRf.js`  
**Purpose:** Cash Working Capital Request Form

| Field | Type | Description |
|-------|------|-------------|
| `subContractorId` | ObjectId → SubContractor | Required |
| `userId` | ObjectId → User | Required |
| `billId` | ObjectId → Bill | Required |
| `epcId` | ObjectId → Company | |
| `status` | Enum | See below |
| `platformFeePaid` | Boolean | Default: false |
| `platformFeeAmount` | Number | Default: 1000 |
| `paymentReference` | String | |
| `kycNotes` | String | |
| `kycCompletedBy` | ObjectId → User | |
| `kycCompletedAt` | Date | |
| `statusHistory` | Array | |

**CwcRf Status Enum:**
- `SUBMITTED` - Initial submission
- `KYC_REQUIRED` - Needs KYC documents
- `KYC_IN_PROGRESS` - KYC being processed
- `KYC_COMPLETED` - KYC done
- `ACTION_REQUIRED` - More info needed

---

### 9. ChatMessage Model

**File:** `backend/models/ChatMessage.js`  
**Purpose:** KYC chat messages between Ops and Sub-contractors

| Field | Type | Description |
|-------|------|-------------|
| `cwcRfId` | ObjectId → CwcRf | Required |
| `senderId` | ObjectId → User | Required |
| `senderRole` | Enum | `ops`, `subcontractor` |
| `messageType` | Enum | `text`, `file`, `system` |
| `content` | String | |
| `fileUrl` | String | Cloudinary URL |
| `cloudinaryPublicId` | String | |
| `fileName` | String | |
| `isRead` | Boolean | Default: false |
| `createdAt` | Date | |

---

### 10. GryLink Model

**File:** `backend/models/GryLink.js`  
**Purpose:** Secure onboarding links for password setup

| Field | Type | Description |
|-------|------|-------------|
| `token` | String | UUID, unique |
| `companyId` | ObjectId → Company | |
| `subContractorId` | ObjectId → SubContractor | |
| `salesAgentId` | ObjectId → User | Required |
| `email` | String | Required |
| `linkType` | Enum | `company`, `subcontractor` |
| `status` | Enum | `active`, `used`, `expired` |
| `expiresAt` | Date | Default: 7 days |
| `usedAt` | Date | |

**Methods:**
- `isValid()` - Checks if link is active and not expired

---

## API Routes

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/register` | No | - | Register internal users (sales, ops, rmt, admin) |
| POST | `/login` | No | - | Login for all users, returns JWT |
| GET | `/me` | Yes | All | Get current user info |
| POST | `/register-subcontractor` | No | - | Sub-contractor self-registration (Step 9) |
| GET | `/check-email/:email` | No | - | Check if email is valid SC lead |

---

### Sales Routes (`/api/sales`)

| Method | Endpoint | Auth | Roles | Description | Workflow Step |
|--------|----------|------|-------|-------------|---------------|
| POST | `/leads` | Yes | sales, admin | Create company lead | Step 3 |
| GET | `/leads` | Yes | sales, admin | Get all leads for sales agent | - |
| GET | `/subcontractors` | Yes | sales, admin | Get sub-contractor leads | Step 8 |
| PATCH | `/subcontractors/:id/contacted` | Yes | sales, admin | Mark SC as contacted | Step 8 |
| GET | `/dashboard` | Yes | sales, admin | Get dashboard stats | - |

---

### Company Routes (`/api/company`)

| Method | Endpoint | Auth | Roles | Description | Workflow Step |
|--------|----------|------|-------|-------------|---------------|
| POST | `/documents` | Yes | epc | Upload company documents | Step 5 |
| GET | `/profile` | Yes | epc | Get company profile with docs | - |
| POST | `/subcontractors` | Yes | epc | Add sub-contractors manually | Step 7A |
| POST | `/subcontractors/bulk` | Yes | epc | Bulk upload via Excel | Step 7B |
| GET | `/subcontractors` | Yes | epc | Get all sub-contractors | - |
| GET | `/active` | Yes | All | Get active EPC companies | - |
| GET | `/info/:id` | Yes | All | Get company info by ID | - |

---

### Sub-Contractor Routes (`/api/subcontractor`)

| Method | Endpoint | Auth | Roles | Description | Workflow Step |
|--------|----------|------|-------|-------------|---------------|
| GET | `/profile` | Yes | subcontractor | Get profile and dashboard | - |
| PUT | `/profile` | Yes | subcontractor | Complete profile | Step 10 |
| POST | `/bills` | Yes | subcontractor | Upload bills | Step 11 |
| GET | `/bills` | Yes | subcontractor | Get all bills | - |
| POST | `/bill` | Yes | subcontractor | Upload bill (alias) | Step 11 |
| GET | `/cases` | Yes | subcontractor | Get all cases | - |
| POST | `/cwc` | Yes | subcontractor | Submit CWC RF | Step 13 |
| POST | `/bids/:id/respond` | Yes | subcontractor | Respond to bid | Step 18 |
| GET | `/bids` | Yes | subcontractor | Get incoming bids | Step 18 |
| GET | `/dashboard` | Yes | subcontractor | Get dashboard data | - |

---

### Ops Routes (`/api/ops`)

| Method | Endpoint | Auth | Roles | Description | Workflow Step |
|--------|----------|------|-------|-------------|---------------|
| POST | `/companies/:id/verify` | Yes | ops, admin | Verify company docs | Step 6 |
| POST | `/bills/:id/verify` | Yes | ops, admin | Verify bill | Step 12 |
| POST | `/kyc/:id/request` | Yes | ops, admin | Request KYC docs | Step 14 |
| POST | `/kyc/:id/complete` | Yes | ops, admin | Complete KYC | Step 14-15 |
| GET | `/pending` | Yes | ops, admin | Get pending verifications | - |
| GET | `/kyc/:id/chat` | Yes | ops, admin, subcontractor | Get chat messages | Step 14 |
| POST | `/kyc/:id/chat` | Yes | ops, admin, subcontractor | Send chat message | Step 14 |
| GET | `/companies/:id/documents` | Yes | ops, admin | Get company documents | - |
| POST | `/documents/:id/verify` | Yes | ops, admin | Verify single document | - |

---

### Cases Routes (`/api/cases`)

| Method | Endpoint | Auth | Roles | Description | Workflow Step |
|--------|----------|------|-------|-------------|---------------|
| GET | `/rmt/pending` | Yes | rmt, admin | Get cases pending risk assessment | - |
| GET | `/` | Yes | All | Get all cases (scoped by role) | - |
| GET | `/:id` | Yes | All | Get single case details | - |
| POST | `/:id/review` | Yes | epc | EPC reviews case | Step 16 |
| POST | `/:id/risk-assessment` | Yes | rmt, admin | RMT risk assessment | - |

---

### Bids Routes (`/api/bids`)

| Method | Endpoint | Auth | Roles | Description | Workflow Step |
|--------|----------|------|-------|-------------|---------------|
| POST | `/` | Yes | epc | Place a bid | Step 17 |
| POST | `/:id/negotiate` | Yes | epc, subcontractor | Negotiate a bid | Step 19 |
| POST | `/:id/lock` | Yes | epc, subcontractor | Lock commercial agreement | Step 19 |
| GET | `/case/:caseId` | Yes | All | Get bids for a case | - |
| GET | `/my` | Yes | epc, nbfc | Get my bids | - |
| GET | `/:id` | Yes | All | Get specific bid | - |

---

### GryLink Routes (`/api/grylink`)

| Method | Endpoint | Auth | Roles | Description | Workflow Step |
|--------|----------|------|-------|-------------|---------------|
| GET | `/validate/:token` | No | - | Validate onboarding token | Step 4 |
| POST | `/set-password` | No | - | Set password via GryLink | Step 4 |

---

### Admin Routes (`/api/admin`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/users` | Yes | admin | Get all users (with filters) |
| GET | `/users/:id` | Yes | admin | Get single user |
| POST | `/users` | Yes | admin | Create internal user |
| PUT | `/users/:id` | Yes | admin | Update user |
| DELETE | `/users/:id` | Yes | admin | Soft delete (deactivate) |
| POST | `/users/:id/restore` | Yes | admin | Restore deactivated user |
| GET | `/stats` | Yes | admin | Get dashboard stats |

---

## Backend Services

### 1. authService.js

**Purpose:** Authentication and user management

| Function | Description |
|----------|-------------|
| `register({ name, email, password, phone, role })` | Register internal users |
| `login(email, password)` | Authenticate user, return JWT |
| `generateToken(user)` | Generate JWT token |
| `setPasswordViaGryLink(userId, password)` | Set password for GryLink users |
| `createEpcUser({ name, email, phone, companyId })` | Create EPC user (no password) |
| `createSubContractorUser({ name, email, phone, subContractorId })` | Create SC user (no password) |
| `registerSubcontractor({ name, email, password, phone, companyName })` | SC self-registration matching EPC leads |

---

### 2. salesService.js

**Purpose:** Sales team operations

| Function | Description |
|----------|-------------|
| `createCompanyLead(data, salesAgentId)` | Create company, user, GryLink, send email |
| `getLeads(salesAgentId)` | Get all company leads for agent |
| `getSubContractorLeads(salesAgentId)` | Get SC leads for agent |
| `markSubContractorContacted(scId, salesAgentId, notes)` | Record contact with SC |
| `getDashboardStats(salesAgentId)` | Aggregate stats by status |

---

### 3. companyService.js

**Purpose:** EPC company operations

| Function | Description |
|----------|-------------|
| `uploadDocuments(companyId, files, documentTypes, userId)` | Upload docs to Cloudinary |
| `getCompanyProfile(companyId)` | Get company with documents |
| `addSubContractors(companyId, subContractors, userId)` | Add SCs manually, send GryLinks |
| `bulkAddSubContractors(companyId, fileBuffer, userId)` | Parse Excel, add SCs |
| `getSubContractors(companyId)` | Get company's sub-contractors |

---

### 4. subContractorService.js

**Purpose:** Sub-contractor operations

| Function | Description |
|----------|-------------|
| `completeProfile(userId, data)` | Complete SC profile (Step 10) |
| `uploadBill(userId, files, data)` | Upload bills to Cloudinary |
| `submitCwcRf(userId, data)` | Submit CWC request |
| `respondToBid(userId, bidId, decision, counterOffer)` | Accept/reject/negotiate bid |
| `getDashboard(userId)` | Get full dashboard data |
| `getIncomingBids(userId)` | Get bids on SC's cases |
| `getCases(userId)` | Get SC's cases |
| `getBills(userId)` | Get SC's bills |

---

### 5. opsService.js

**Purpose:** Operations team workflows

| Function | Description |
|----------|-------------|
| `verifyCompanyDocs(companyId, decision, notes, opsUserId)` | Approve/reject company docs |
| `verifyBill(billId, decision, notes, opsUserId)` | Verify uploaded bill |
| `requestKycDocs(cwcRfId, message, opsUserId)` | Request docs via chat |
| `completeKyc(cwcRfId, opsUserId)` | Complete KYC, create Case |
| `getPendingVerifications()` | Get all pending items |
| `getChatMessages(cwcRfId)` | Get KYC chat history |
| `sendChatMessage(cwcRfId, senderId, senderRole, content, file)` | Send chat message |
| `getCompanyDocuments(companyId)` | Get company's documents |
| `verifyDocument(docId, decision, notes, opsUserId)` | Verify single document |

---

### 6. caseService.js

**Purpose:** Case management

| Function | Description |
|----------|-------------|
| `getCases(filters)` | Get cases with optional filters |
| `getCaseById(caseId)` | Get single case with populates |
| `epcReviewCase(caseId, decision, notes, userId)` | EPC reviews/approves case |
| `rmtRiskAssessment(caseId, assessmentData, userId)` | RMT risk scoring |

---

### 7. bidService.js

**Purpose:** Bid management and negotiation

| Function | Description |
|----------|-------------|
| `placeBid(caseId, epcId, userId, amount, duration)` | Place new bid, notify SC |
| `negotiate(bidId, userId, counterOffer)` | Add counter-offer |
| `lockCommercial(bidId, userId)` | Finalize agreement |
| `getBidsForCase(caseId)` | Get all bids for a case |
| `getMyBids(companyId, role)` | Get user's placed bids |
| `getBid(bidId)` | Get single bid |

---

### 8. grylinkService.js

**Purpose:** Onboarding link management

| Function | Description |
|----------|-------------|
| `validateLink(token)` | Validate GryLink token |
| `setPassword(token, password)` | Set password, update statuses |

---

### 9. emailService.js

**Purpose:** Email notifications

| Function | Description |
|----------|-------------|
| `sendEmail(to, subject, html)` | Generic email sender |
| `sendOnboardingLink(email, ownerName, link)` | Welcome email with GryLink |
| `sendStatusUpdate(email, name, entityType, status, notes)` | Status change notification |
| `sendBidNotification(email, name, caseNumber, amount, duration)` | New bid alert |
| `sendKycRequest(email, name)` | KYC documents request |
| `sendSalesNotification(email, name, message)` | Sales team alerts |

---

### 10. cloudinaryService.js

**Purpose:** File storage on Cloudinary

| Function | Description |
|----------|-------------|
| `uploadToCloudinary(fileBuffer, folder, resourceType, mimeType)` | Upload file |
| `deleteFromCloudinary(publicId)` | Delete file |

---

## Frontend Portals

### 1. official_portal (Admin Portal)

**URL:** `admin.gryork.com`  
**Roles:** sales, ops, rmt, admin  
**Tech:** Vite + React + TypeScript

**Pages:**
| Page | Path | Access | Features |
|------|------|--------|----------|
| LoginPage | `/login` | Public | Login for internal users |
| SalesDashboard | `/sales` | sales, admin | Create leads, view SCs, mark contacted |
| OpsDashboard | `/ops` | ops, admin | Verify companies, bills, KYC, chat |
| CasesPage | `/cases` | All | View all cases |
| AdminDashboard | `/admin` | admin | User management CRUD |

**API Integration:**
- `authApi` - Login, get current user
- `salesApi` - Leads, sub-contractors, dashboard
- `opsApi` - Verifications, documents, KYC chat
- `casesApi` - Cases listing
- `bidsApi` - View bids for cases
- `rmtApi` - Risk assessments
- `adminApi` - User management

---

### 2. frontend (Legacy Combined Portal)

**URL:** Development only  
**Roles:** epc, subcontractor  
**Tech:** Vite + React + TypeScript

**Pages:**
| Page | Path | Access | Features |
|------|------|--------|----------|
| HomePage | `/` | Public | Landing page |
| LoginPage | `/login` | Public | Login |
| OnboardingPage | `/onboarding/:token` | Public | GryLink password setup |
| EpcDashboardNew | `/epc` | epc | Full EPC dashboard |
| SubContractorDashboardNew | `/subcontractor` | subcontractor | Full SC dashboard |

**API Integration:**
- `authApi`, `grylinkApi`, `companyApi`, `subContractorApi`, `casesApi`, `bidsApi`, `kycApi`

---

### 3. subcontractor-portal

**URL:** `app.gryork.com`  
**Roles:** subcontractor  
**Tech:** Vite + React + TypeScript

**Pages:**
| Page | Path | Access | Features |
|------|------|--------|----------|
| LoginPage | `/login` | Public | SC Login |
| RegisterPage | `/register` | Public | SC Self-registration |
| OnboardingPage | `/onboarding/:token` | Public | GryLink password setup |
| ProfileCompletionPage | `/complete-profile` | Auth | Complete profile form |
| DashboardPage | `/` | Auth | Full dashboard |

**Dashboard Features:**
- Profile management (vendor ID, GSTIN, address)
- Bill upload with preview
- CWC RF submission
- Cases tracking
- Bid responses (accept/reject/negotiate)
- KYC chat with Ops

**API Integration:**
- `authApi`, `grylinkApi`, `scApi`, `kycApi`

---

### 4. partner-portal

**URL:** `partner.gryork.com`  
**Roles:** epc, nbfc  
**Tech:** Vite + React + TypeScript

**Pages:**
| Page | Path | Access | Features |
|------|------|--------|----------|
| LoginPage | `/login` | Public | Partner login |
| DashboardPage | `/` | Auth | Full partner dashboard |

**Dashboard Tabs:**
- **Documents** (EPC only) - Upload company documents
- **Sub-Contractors** (EPC only) - Add/bulk upload SCs
- **Cases & Bills** - Review, approve, bid
- **My Bids** - Track placed bids, negotiate, lock

**API Integration:**
- `authApi`, `companyApi`, `casesApi`, `bidsApi`

---

### 5. grylink-portal

**URL:** `link.gryork.com`  
**Purpose:** GryLink onboarding only  
**Tech:** Vite + React + TypeScript

**Pages:**
| Page | Path | Access | Features |
|------|------|--------|----------|
| OnboardingPage | `/onboarding/:token` | Public | Validate token, set password |
| InvalidLinkPage | `*` | Public | Error page for invalid links |

**API Integration:**
- `grylinkApi` - validate, setPassword

---

### 6. Gryork-public (Public Website)

**URL:** `gryork.com`  
**Purpose:** Marketing website  
**Tech:** Next.js + TypeScript + Tailwind CSS

**Pages:**
| Page | Path | Description |
|------|------|-------------|
| HomePage | `/` | Hero, Features, How It Works, Testimonials, CTA |
| About | `/about` | Company information |
| Careers | `/careers` | Job listings |
| Contact | `/contact` | Contact form |
| For EPC | `/for-epc` | EPC-specific landing |
| For NBFC | `/for-nbfc` | NBFC-specific landing |
| For Sub-Contractors | `/for-subcontractors` | SC-specific landing |
| How It Works | `/how-it-works` | Process explanation |
| Privacy | `/privacy` | Privacy policy |
| Terms | `/terms` | Terms of service |

---

## Configuration

### Database (config/db.js)

```javascript
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};
```

**Environment:**
- `MONGODB_URI` - MongoDB connection string

---

### Cloudinary (config/cloudinary.js)

```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

**Folders Used:**
- `gryork/documents` - Company documents
- `gryork/bills` - Bill uploads
- `gryork/kyc` - KYC chat files

---

### Email (config/email.js)

```javascript
nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

**From Address:** `process.env.SMTP_FROM`

---

### CORS Configuration (index.js)

Allowed origins:
- `process.env.PUBLIC_SITE_URL` - gryork.com
- `process.env.SUBCONTRACTOR_PORTAL_URL` - app.gryork.com
- `process.env.GRYLINK_PORTAL_URL` - link.gryork.com
- `process.env.PARTNER_PORTAL_URL` - partner.gryork.com
- `process.env.ADMIN_PORTAL_URL` - admin.gryork.com
- All `*.gryork.com` subdomains in production
- All `localhost:*` in development

---

## Authentication & Authorization

### JWT Token

```javascript
jwt.sign(
  { id: user._id, role: user.role, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);
```

### Middleware (middleware/auth.js)

**authenticate:**
- Extracts Bearer token from Authorization header
- Verifies JWT signature
- Loads user from database
- Attaches `req.user`

**authorize(...roles):**
- Checks `req.user.role` against allowed roles
- Returns 403 if not authorized

### Role Hierarchy

| Role | Access |
|------|--------|
| `admin` | All routes and features |
| `sales` | Sales routes, create leads |
| `ops` | Operations routes, verifications |
| `rmt` | Risk management routes |
| `epc` | Company routes, case review, bidding |
| `subcontractor` | Sub-contractor routes, bills, CWC |

---

## File Upload Handling

### Middleware (middleware/upload.js)

All uploads use `multer.memoryStorage()` for Cloudinary upload.

**uploadDocuments:**
- Max size: 10MB
- Types: PDF, JPG, PNG, DOC, DOCX

**uploadBills:**
- Max size: 10MB
- Types: PDF, JPG, PNG

**uploadChat:**
- Max size: 5MB
- All types allowed

**uploadExcel:**
- Max size: 5MB
- Types: XLS, XLSX

### Cloudinary Upload Pattern

```javascript
const uploadToCloudinary = async (fileBuffer, mimeType, options) => {
  const b64 = Buffer.from(fileBuffer).toString('base64');
  const dataUri = `data:${mimeType};base64,${b64}`;
  return cloudinary.uploader.upload(dataUri, {
    folder: options.folder || 'gryork/documents',
    resource_type: 'auto',
  });
};
```

---

## Email Notifications

| Email Type | Trigger | Recipients |
|------------|---------|------------|
| Onboarding Link | Lead created | Company owner / SC contact |
| Status Update | Status change | Affected party |
| Bid Notification | New bid placed | Sub-contractor |
| KYC Request | Ops requests docs | Sub-contractor |
| Sales Notification | SC selects new company | Sales agent |

---

## Workflow Mapping

### Complete 20-Step Workflow

| Step | Action | Actor | API | Status Change |
|------|--------|-------|-----|---------------|
| 1 | Offline sales contact | Sales | - | - |
| 2 | Collect company details | Sales | - | - |
| 3 | Create company lead | Sales | `POST /api/sales/leads` | Company: `LEAD_CREATED` |
| 4 | Set password via GryLink | EPC | `POST /api/grylink/set-password` | Company: `CREDENTIALS_CREATED` |
| 5 | Upload company documents | EPC | `POST /api/company/documents` | Company: `DOCS_SUBMITTED` |
| 6 | Ops verifies documents | Ops | `POST /api/ops/companies/:id/verify` | Company: `ACTIVE` or `ACTION_REQUIRED` |
| 7 | Add sub-contractors | EPC | `POST /api/company/subcontractors` | SC: `LEAD_CREATED` |
| 8 | Contact sub-contractors | Sales | `PATCH /api/sales/subcontractors/:id/contacted` | - |
| 9 | SC signup/registration | SC | `POST /api/auth/register-subcontractor` | SC: `PROFILE_INCOMPLETE` |
| 10 | Complete SC profile | SC | `PUT /api/subcontractor/profile` | SC: `PROFILE_COMPLETED` |
| 11 | Upload bills | SC | `POST /api/subcontractor/bills` | Bill: `UPLOADED` |
| 12 | Ops verifies bill | Ops | `POST /api/ops/bills/:id/verify` | Bill: `VERIFIED` or `REJECTED` |
| 13 | Submit CWC RF | SC | `POST /api/subcontractor/cwc` | CwcRf: `SUBMITTED` |
| 14 | KYC via chat | Ops/SC | `POST /api/ops/kyc/:id/chat` | CwcRf: `ACTION_REQUIRED` → `KYC_COMPLETED` |
| 15 | Case created | System | Auto after KYC | Case: `READY_FOR_COMPANY_REVIEW` |
| 16 | EPC reviews case | EPC | `POST /api/cases/:id/review` | Case: `EPC_VERIFIED` or `EPC_REJECTED` |
| 17 | EPC places bid | EPC | `POST /api/bids` | Case: `BID_PLACED`, Bid: `SUBMITTED` |
| 18 | SC responds to bid | SC | `POST /api/subcontractor/bids/:id/respond` | Various |
| 19 | Negotiate & lock | Both | `POST /api/bids/:id/negotiate`, `POST /api/bids/:id/lock` | Case: `COMMERCIAL_LOCKED` |
| 20 | Post-lock handoff | System | - | To RMT, NBFC routing |

---

## State Flow Summary

```
COMPANY FLOW:
LEAD_CREATED → CREDENTIALS_CREATED → DOCS_SUBMITTED → [ACTION_REQUIRED ↔] → ACTIVE

SUBCONTRACTOR FLOW:
LEAD_CREATED → PROFILE_INCOMPLETE → PROFILE_COMPLETED

BILL FLOW:
UPLOADED → [VERIFIED | REJECTED]

CWC RF FLOW:
SUBMITTED → [KYC_REQUIRED → KYC_IN_PROGRESS →] → [ACTION_REQUIRED ↔] → KYC_COMPLETED

CASE FLOW:
READY_FOR_COMPANY_REVIEW → [EPC_REJECTED | EPC_VERIFIED] → 
[RMT_APPROVED | RMT_REJECTED | RMT_NEEDS_REVIEW] → 
BID_PLACED → [NEGOTIATION_IN_PROGRESS →] → COMMERCIAL_LOCKED

BID FLOW:
SUBMITTED → [ACCEPTED | REJECTED | NEGOTIATION_IN_PROGRESS →] → COMMERCIAL_LOCKED
```

---

## Environment Variables Summary

```bash
# Server
PORT=5000
NODE_ENV=development|production

# Database
MONGODB_URI=mongodb://...

# JWT
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx
SMTP_FROM=noreply@gryork.com

# Frontend URLs
PUBLIC_SITE_URL=https://gryork.com
SUBCONTRACTOR_PORTAL_URL=https://app.gryork.com
GRYLINK_PORTAL_URL=https://link.gryork.com
PARTNER_PORTAL_URL=https://partner.gryork.com
ADMIN_PORTAL_URL=https://admin.gryork.com
GRYLINK_FRONTEND_URL=https://link.gryork.com
```

---

**End of Documentation**
