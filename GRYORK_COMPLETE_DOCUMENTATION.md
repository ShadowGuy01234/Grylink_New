# Gryork Platform - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Test Accounts](#test-accounts)
5. [Complete Workflow](#complete-workflow)
6. [Portal Guide](#portal-guide)
7. [API Testing Guide](#api-testing-guide)
8. [Feature Reference](#feature-reference)

---

## System Overview

Gryork is a **bill discounting platform** for the construction industry. It connects:
- **Sub-Contractors (Sellers)** - Who have pending invoices with EPC companies
- **EPC Companies (Buyers)** - Large construction firms who owe money to sub-contractors
- **NBFCs (Financiers)** - Who provide early payment to sub-contractors at a discount
- **Gryork Team** - Sales, Ops, RMT, and Founders who manage the platform

### Business Model
1. Sub-contractor has a ₹10L invoice due in 90 days from EPC
2. NBFC pays sub-contractor ₹9.5L today (5% discount)
3. EPC pays ₹10L to NBFC on due date
4. Everyone wins: Sub-contractor gets cash now, NBFC earns interest, EPC maintains payment timeline

---

## Architecture

### Multi-Portal Structure

| Domain | Portal | Users | Port (Dev) |
|--------|--------|-------|------------|
| `app.gryork.com` | Subcontractor Portal | Sub-contractors | 5173 |
| `link.gryork.com` | GryLink Portal | EPC/NBFC (onboarding) | 5174 |
| `partner.gryork.com` | Partner Portal | EPC, NBFC | 5175 |
| `admin.gryork.com` | Official Portal | Sales, Ops, RMT, Admin, Founder | 5177 |

### Tech Stack
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Frontend**: React + TypeScript + Vite
- **Auth**: JWT Bearer Tokens
- **Storage**: Cloudinary (documents, bills)
- **Email**: Nodemailer (SMTP)

---

## User Roles & Permissions

### Internal Team Roles

| Role | Capabilities |
|------|--------------|
| **Sales** | Create leads, view subcontractors, track contacts |
| **Ops** | Verify documents, KYC management, company verification |
| **RMT** | Risk assessment, seller evaluation, checklist scoring |
| **Admin** | User management, system config, all access |
| **Founder** | Strategic approvals, agent misconduct, high-value deals |

### External Roles

| Role | Capabilities |
|------|--------------|
| **EPC** | Add subcontractors, validate sellers, place bids on cases |
| **Sub-Contractor** | Upload bills, submit CWC-RF, respond to bids |
| **NBFC** | View shared cases, approve/reject, set terms |

---

## Test Accounts

All test accounts use password: `password123`

### Internal Team (Official Portal - admin.gryork.com)

| Email | Role | Access |
|-------|------|--------|
| `admin@gryork.com` | Admin | Full system access |
| `sales@gryork.com` | Sales | Lead creation, subcontractor tracking |
| `ops@gryork.com` | Ops | Document verification, KYC |
| `rmt@gryork.com` | RMT | Risk assessment |
| `founder@gryork.com` | Founder | Strategic approvals, agent management |

### Creating Test Accounts
```bash
cd backend
node scripts/seedUsers.js
```

---

## Complete Workflow

### Phase 1: EPC (Buyer) Onboarding

```
Step 1: Sales creates EPC lead
  └─> POST /api/sales/leads
  └─> EPC receives GryLink email

Step 2: EPC clicks GryLink, sets password
  └─> POST /api/grylink/set-password
  └─> Status: CREDENTIALS_CREATED

Step 3: EPC uploads documents
  └─> POST /api/company/documents
  └─> Status: DOCS_SUBMITTED

Step 4: Ops verifies documents
  └─> POST /api/ops/companies/:id/verify
  └─> Status: ACTIVE (or ACTION_REQUIRED)
```

### Phase 2: Sub-Contractor Onboarding

```
Step 5: EPC adds sub-contractors
  └─> POST /api/company/subcontractors
  └─> SC receives onboarding email

Step 6: SC signs up/registers
  └─> POST /api/auth/register-subcontractor
  └─> Status: PROFILE_INCOMPLETE

Step 7: SC completes profile
  └─> POST /api/subcontractor/profile
  └─> Status: PROFILE_COMPLETED
```

### Phase 3: Bill Submission & Risk Assessment

```
Step 8: SC uploads bills
  └─> POST /api/subcontractor/bills
  └─> Bill Status: UPLOADED

Step 9: SC submits CWC-RF (work completion request)
  └─> POST /api/subcontractor/cwc
  └─> CwcRf Status: SUBMITTED

Step 10: System creates Case
  └─> Case Status: READY_FOR_COMPANY_REVIEW

Step 11: RMT performs risk assessment
  └─> POST /api/risk-assessment
  └─> Generates risk score & category
```

### Phase 4: EPC Validation & Bidding

```
Step 12: EPC reviews case
  └─> GET /api/cases/:id
  └─> EPC verifies seller legitimacy

Step 13: EPC validates seller
  └─> Case Status: EPC_VERIFIED

Step 14: EPC places bid
  └─> POST /api/bids
  └─> Case Status: BID_PLACED
  └─> Bid Status: SUBMITTED
```

### Phase 5: Negotiation & Commercial Lock

```
Step 15: SC reviews bid
  └─> GET /api/subcontractor/bids

Step 16: Negotiation (if needed)
  └─> PATCH /api/bids/:id/counter
  └─> Case Status: NEGOTIATION_IN_PROGRESS

Step 17: Commercial lock
  └─> POST /api/bids/:id/lock
  └─> Case Status: COMMERCIAL_LOCKED
  └─> Bid Status: COMMERCIAL_LOCKED
```

### Phase 6: NBFC Processing (Post-MVP)

```
Step 18: Case shared with NBFCs
  └─> POST /api/nbfc/share/:caseId

Step 19: NBFC reviews & approves
  └─> POST /api/nbfc/cases/:id/respond

Step 20: Transaction created
  └─> POST /api/transactions
  └─> Escrow setup & disbursement
```

---

## Portal Guide

### Official Portal (Internal Team)

**URL**: http://localhost:5177 (dev) | https://admin.gryork.com (prod)

#### Sales Dashboard
- View all leads and sub-contractors
- Create new company leads
- Track contact status
- Actions: Create Lead, Mark Contacted

#### Ops Dashboard
- Pending verifications
- Document review
- KYC chat with sub-contractors
- Actions: Verify/Reject Company, Request KYC docs

#### RMT Dashboard
- Pending risk assessments
- Checklist-based evaluation
- Generate risk scores
- Actions: Complete Assessment, Approve/Reject

#### Founder Dashboard
- Pending approvals (high-value, high-risk)
- Agent management
- Re-KYC oversight
- Cron job controls
- Actions: Approve/Reject, Handle Misconduct

### Partner Portal (EPC/NBFC)

**URL**: http://localhost:5175 (dev) | https://partner.gryork.com (prod)

#### EPC Dashboard
- View linked sub-contractors
- Review pending cases
- Place and negotiate bids
- Actions: Add SC, Validate Seller, Place Bid

#### NBFC Dashboard
- View shared cases
- Respond to case requests
- Track transactions
- Actions: Approve/Reject Case, Set Terms

### Subcontractor Portal

**URL**: http://localhost:5173 (dev) | https://app.gryork.com (prod)

#### Dashboard
- Profile completion status
- Bill upload interface
- CWC-RF submission
- Incoming bids
- Actions: Upload Bill, Submit CWC, Respond to Bid

### GryLink Portal (Onboarding)

**URL**: http://localhost:5174 (dev) | https://link.gryork.com (prod)

- One-time onboarding for EPC/NBFC
- Set password flow
- Document upload wizard

---

## API Testing Guide

### Starting the Backend

```bash
cd backend
npm install
npm run dev
```

Server runs on: http://localhost:5000

### Health Check
```bash
curl http://localhost:5000/api/health
# Response: {"status":"OK","timestamp":"..."}
```

### Authentication

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gryork.com","password":"password123"}'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": { "id": "...", "name": "Super Admin", "role": "admin" }
}
```

#### Using the Token
```bash
curl http://localhost:5000/api/sales/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Complete API Test Flow

#### 1. Login as Sales
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sales@gryork.com","password":"password123"}' | jq -r '.token')
```

#### 2. Create EPC Lead
```bash
curl -X POST http://localhost:5000/api/sales/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "ABC Construction Pvt Ltd",
    "ownerName": "Raj Kumar",
    "email": "raj@abcconstruction.com",
    "phone": "9876543210",
    "gstin": "22AAAAA0000A1Z5"
  }'
```

#### 3. Login as Ops
```bash
OPS_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ops@gryork.com","password":"password123"}' | jq -r '.token')
```

#### 4. View Pending Companies
```bash
curl http://localhost:5000/api/ops/pending \
  -H "Authorization: Bearer $OPS_TOKEN"
```

#### 5. Verify Company
```bash
curl -X POST http://localhost:5000/api/ops/companies/COMPANY_ID/verify \
  -H "Authorization: Bearer $OPS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"decision":"approve","notes":"All documents verified"}'
```

### PowerShell Testing (Windows)

```powershell
# Login and save token
$body = @{ email = "admin@gryork.com"; password = "password123" } | ConvertTo-Json
$result = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $result.token

# Use token for authenticated requests
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:5000/api/agents" -Headers $headers
```

---

## Feature Reference

### SLA Milestones

| Milestone | SLA Days | Description |
|-----------|----------|-------------|
| EPC Validation | 7 days | EPC must validate seller |
| Bill Verification | 3 days | Ops reviews uploaded bill |
| Risk Assessment | 2 days | RMT completes assessment |
| NBFC Response | 5 days | NBFC responds to shared case |

### Status Flows

#### Company Status
```
LEAD_CREATED → CREDENTIALS_CREATED → DOCS_SUBMITTED → ACTIVE
                                                    → ACTION_REQUIRED
```

#### SubContractor Status
```
LEAD_CREATED → PROFILE_INCOMPLETE → PROFILE_COMPLETED → DORMANT (90 days inactive)
```

#### Bill Status
```
UPLOADED → VERIFIED → CASE_CREATED → FUNDED
                    → REJECTED
```

#### Case Status
```
READY_FOR_COMPANY_REVIEW → EPC_VERIFIED → BID_PLACED → NEGOTIATION_IN_PROGRESS → COMMERCIAL_LOCKED
                        → REJECTED
```

#### Bid Status
```
SUBMITTED → NEGOTIATION_IN_PROGRESS → COMMERCIAL_LOCKED
          → REJECTED
```

### Risk Categories

| Score | Category | Action |
|-------|----------|--------|
| 1-30 | Low | Auto-proceed |
| 31-60 | Medium | Proceed with monitoring |
| 61-80 | High | Requires Ops Manager approval |
| 81-100 | Critical | Requires Founder approval |

### Agent Commission

- Commission on **first CWC only** per EPC
- Lifetime eligibility
- If EPC switches agent, commission goes to final onboarding agent

### Blacklist Rules

- **Fraud/Fake Documents**: Lifetime blacklist (Company PAN + GST)
- **Platform-level block**: Cannot re-apply ever
- **Scope**: Applies to all associated entities

### Re-KYC Triggers

| Trigger | Action |
|---------|--------|
| Bank account change | Re-verify documents |
| Board change | Full re-assessment |
| Credit rating downgrade | RMT review |
| NBFC request | Priority re-verification |
| 12-month expiry | Standard renewal |

### Cron Jobs

| Job | Schedule | Function |
|-----|----------|----------|
| Dormant Marking | Daily midnight | Mark inactive SCs (90 days) |
| SLA Reminders | Every 6 hours | Send milestone reminders |
| KYC Expiry | Weekly Monday | Check expiring KYC |
| Overdue Notifications | Daily 10 AM | 1-month CWC reminders |
| Actual Overdue | Daily 11 AM | Escalate overdue transactions |

---

## Quick Start Commands

### Start Everything (Development)

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Official Portal
cd official_portal
npm run dev

# Terminal 3: Subcontractor Portal
cd subcontractor-portal
npm run dev

# Terminal 4: Partner Portal
cd partner-portal
npm run dev

# Terminal 5: GryLink Portal
cd grylink-portal
npm run dev
```

### Seed Test Data

```bash
cd backend
node scripts/seedUsers.js
```

### Environment Setup

Backend `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gryork
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx
```

---

## Troubleshooting

### Common Issues

**1. "Cannot find module" errors**
```bash
cd backend
npm install
```

**2. MongoDB connection failed**
- Check MONGODB_URI in .env
- Ensure MongoDB is running

**3. CORS errors**
- Check if backend is running on port 5000
- Verify frontend is using correct API_URL

**4. Token expired**
- Re-login to get new token
- Default expiry is 7 days

**5. 403 Forbidden**
- Check user role has permission for the route
- Verify token is included in Authorization header

---

## Contact & Support

- **Technical Issues**: Check console logs & network tab
- **SOP Questions**: Refer to `doc/GryorkSOP.md`
- **Architecture**: See `SYSTEM_ARCHITECTURE.md`

---

*Last Updated: February 2026*
*Version: 1.0*
