# Gryork Platform - Complete System Architecture

## 📋 Executive Summary

**Gryork** is a comprehensive B2B supply chain financing platform that connects EPCs (Engineering, Procurement & Construction companies) with Sub-Contractors through a transparent bidding and bill financing system.

### Core Value Proposition
- Streamline bill verification and payment processes
- Enable competitive financing through transparent bidding
- Reduce working capital constraints for sub-contractors
- Provide EPCs with better vendor management

---

## 🏗️ System Architecture

### Technology Stack

#### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **File Processing**: Multer, XLSX

#### Frontend (GryLink Portal)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Custom CSS with dark theme
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: React Icons (Heroicons)

#### Frontend (Official Portal)
- **Framework**: React with TypeScript
- **Purpose**: Internal portal for Sales, Ops, RMT teams

---

## 🌐 Multi-Domain Architecture

The platform is deployed across multiple subdomains, each serving a specific purpose:

| Domain | Portal | Purpose | Port (Dev) |
|--------|--------|---------|------------|
| `gryork.com` | Gryork-public | Public marketing website | 5176 |
| `app.gryork.com` | subcontractor-portal | Sub-contractor registration & dashboard | 5173 |
| `link.gryork.com` | grylink-portal | Magic link onboarding for EPC/NBFC | 5174 |
| `partner.gryork.com` | partner-portal | EPC & NBFC partner dashboard | 5175 |
| `admin.gryork.com` | official_portal | Internal admin (Sales, Ops, RMT) | 5177 |

### Portal Directory Structure
```
├── Gryork-public/          # Next.js public website
├── subcontractor-portal/   # React + Vite (sub-contractors)
├── grylink-portal/         # React + Vite (magic link onboarding)
├── partner-portal/         # React + Vite (EPC/NBFC)
├── official_portal/        # React + Vite (internal admin)
└── backend/                # Express.js API server
```

### Authentication Flow by Portal

1. **Public Site** → Links to appropriate portal login
2. **GryLink Portal** → Token-based onboarding → Redirects to partner-portal
3. **Partner Portal** → JWT auth, restricted to `epc`/`nbfc` roles
4. **SubContractor Portal** → JWT auth, restricted to `subcontractor` role
5. **Admin Portal** → JWT auth, restricted to `sales`/`ops`/`admin` roles

### CORS Configuration
Backend accepts requests from all `*.gryork.com` subdomains in production.

---

## 👥 User Roles & Permissions

### 1. Sales Team
**Access**: Official Portal
**Responsibilities**:
- Create company leads (Step 3 of workflow)
- Generate GryLink onboarding URLs
- Add sub-contractor leads
- Monitor onboarding progress
- Track commission-eligible accounts

**Key Actions**:
- `POST /api/sales/leads` - Create company lead
- `GET /api/sales/leads` - View my leads
- `GET /api/sales/dashboard` - View statistics

### 2. EPC (Company/Buyer)
**Access**: GryLink Portal
**Responsibilities**:
- Complete self-onboarding
- Upload required documents
- Add and manage sub-contractors
- Review and verify bills
- Place competitive bids

**Key Actions**:
- Document uploads (CIN, GST, PAN, financials, etc.)
- Add sub-contractors (individual or bulk Excel)
- Review cases and bills
- Place financing bids
- Track bid status

### 3. Sub-Contractor (Seller)
**Access**: GryLink Portal
**Responsibilities**:
- Complete profile and KYC
- Upload bills for payment
- Submit CWC (Cash against Work Certificate) requests
- Accept or negotiate bids

**Key Actions**:
- Profile completion
- Bill uploads (image or Excel)
- CWC submission with payment reference
- Bid acceptance/rejection
- Negotiation counter-offers

### 4. Ops Team
**Access**: Official Portal
**Responsibilities**:
- Verify company documents
- Review and validate bills
- Manage KYC process
- Chat-based verification with sub-contractors
- Create cases for verified bills

**Key Actions**:
- `POST /api/ops/companies/:id/verify` - Verify/reject company
- `POST /api/ops/bills/:id/verify` - Verify/reject bill
- `POST /api/ops/kyc/:id/request` - Request additional KYC docs
- `POST /api/ops/kyc/:id/complete` - Complete KYC & create case

### 5. RMT (Risk Management Team)
**Access**: Official Portal (future implementation)
**Responsibilities**:
- Post-commercial risk analysis
- NBFC report generation
- Credit assessment

### 6. Admin
**Access**: Both portals
**Responsibilities**:
- Full system access
- User management
- System configuration

---

## 🔄 Complete Workflow

### Phase 1: Offline Sales Initiation (Mandatory Entry Point)

**Rule**: No company or sub-contractor can enter without sales initiation.

1. Sales team contacts company offline
2. Collects: Company Name, Owner Name, Email, Phone, Address
3. Explains Gryork offering

### Phase 2: Company Lead Creation

**Actor**: Sales Team
**Actions**:
- Login to Official Portal
- Create new company lead via dashboard
- System generates unique Company ID
- Maps company to sales agent

**Status**: `LEAD_CREATED`

### Phase 3: GryLink Generation

**System Actions**:
- Generate secure, single-use GryLink token
- Bind to: Company ID, Sales Agent ID, Email
- Send onboarding email with link

**Email Contains**:
- Unique onboarding URL
- Username (email address)
- Instructions to set password

### Phase 4: Credential Creation

**Actor**: Company Owner
**Actions**:
1. Click GryLink from email
2. Validate token
3. Set password
4. Account activated

**Status**: `CREDENTIALS_CREATED`

### Phase 5: EPC Self-Onboarding

**Documents Required** (platform upload only):
- CIN Certificate
- GST Registration
- PAN Card
- Board Resolution
- Bank Statements (12 months)
- Audited Financials (2 years)
- Project Details (optional)
- Cashflow Details (optional)

**Status**: `DOCS_SUBMITTED`

### Phase 6: Ops Verification

**Actor**: Ops Team
**Actions**:
- Review all uploaded documents
- Check completeness and authenticity
- Add verification notes
- Decision: Approve or Request Action

**Outcomes**:
- ✅ Approve → Status: `ACTIVE`
- ❌ Reject → Status: `ACTION_REQUIRED` (email sent)

### Phase 7: Sub-Contractor Addition

**Methods**:
1. **Individual Entry**: EPC adds SC manually
2. **Bulk Upload**: Excel file with multiple SCs

**Required Fields**:
- Company Name
- Contact Name
- Email (unique identifier)
- Phone

**System Actions**:
- Create SC record
- Link to EPC
- Associate with sales agent
- Send onboarding GryLink

**SC Status**: `LEAD_CREATED`

### Phase 8: Sub-Contractor Onboarding

**Actor**: Sub-Contractor
**Actions**:
1. Receive GryLink email
2. Set password
3. Complete profile:
   - Company Name
   - Owner Name
   - Address
   - Phone
   - Vendor ID (optional)
   - GSTIN (optional)

**Status Progression**:
- `LEAD_CREATED` → `PROFILE_INCOMPLETE` → `PROFILE_COMPLETED`

### Phase 9: Bill Upload

**Actor**: Sub-Contractor
**Upload Modes**:
1. **Image**: Photos/PDFs of physical bills
2. **Excel**: Structured data upload

**Bill Information**:
- Bill Number
- Amount
- Description
- Attached files

**Status**: `UPLOADED`

### Phase 10: Bill Verification by Ops

**Actor**: Ops Team
**Review Criteria**:
- Bill authenticity
- Amount correctness
- Linked to correct EPC
- Supporting documents

**Outcomes**:
- ✅ Approve → Status: `VERIFIED`
- ❌ Reject → Status: `REJECTED` (with notes)

### Phase 11: EPC Bill Review

**Actor**: EPC Company
**Auto-trigger**: Bill status = `VERIFIED` by Ops

**Case Creation**:
- System creates Case record
- Generates unique Case Number (GRY-000001)
- Links: Bill, Sub-Contractor, EPC

**Case Status**: `READY_FOR_COMPANY_REVIEW`

**EPC Actions**:
- Review bill details
- Verify legitimacy with their records
- Decision: Approve or Reject

**Outcomes**:
- ✅ Approve → Status: `EPC_VERIFIED`
- ❌ Reject → Status: `EPC_REJECTED` (SC notified)

### Phase 12: CWC Submission

**Actor**: Sub-Contractor
**Trigger**: Bill status = `VERIFIED`

**CWC RF (Request Form) Submission**:
- Select verified bill
- Provide payment reference
- Submit for Ops review

**CWC RF Status**: `SUBMITTED`

### Phase 13: KYC Process

**Actor**: Ops Team
**Purpose**: Collect additional documents via chat

**Chat System**:
- Request specific documents
- Real-time messaging
- File upload support
- Message history

**Documents May Include**:
- Incorporation Certificate
- Address Proof
- Bank Account Proof
- GST Certificate
- Additional financials

**KYC Statuses**:
- `KYC_REQUIRED` → `KYC_IN_PROGRESS` → `KYC_COMPLETED`

### Phase 14: Competitive Bidding

**Actor**: EPC Company
**Trigger**: Case status = `EPC_VERIFIED`

**Bid Placement**:
- Bid Amount (financing amount)
- Funding Duration (days)

**Case Status**: `BID_PLACED`
**Bid Status**: `SUBMITTED`

### Phase 15: Bid Review & Negotiation

**Actor**: Sub-Contractor
**Actions**:
1. **Accept**: Lock commercial terms
2. **Reject**: Decline bid
3. **Negotiate**: Counter-offer with:
   - Counter Amount
   - Counter Duration
   - Message/reasoning

**Negotiation Cycle**:
- Multiple rounds supported
- Counter-offers from both parties
- Message history maintained

**Status**: `NEGOTIATION_IN_PROGRESS`

### Phase 16: Commercial Lock

**Actors**: EPC or Sub-Contractor
**Actions**: Accept final terms

**Snapshot Captured**:
- Final bid amount
- Final duration
- Locked timestamp
- Both party agreements

**Statuses**:
- Case: `COMMERCIAL_LOCKED`
- Bid: `COMMERCIAL_LOCKED`

### Phase 17: Risk Analysis (Post-Commercial)

**Actor**: RMT (Risk Management Team)
**Purpose**: Prepare NBFC-ready reports

**Analysis Includes**:
- Company financials review
- Credit history check
- Project viability
- Repayment capacity

**Output**: Risk report for NBFC submission

---

## 📊 Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: Enum ['sales', 'epc', 'subcontractor', 'ops', 'rmt', 'admin'],
  isActive: Boolean,
  companyId: ObjectId (ref: Company),
  subContractorId: ObjectId (ref: SubContractor)
}
```

### Company (EPC)
```javascript
{
  companyName: String,
  ownerName: String,
  email: String (unique),
  phone: String,
  address: String,
  status: Enum ['LEAD_CREATED', 'CREDENTIALS_CREATED', 'DOCS_SUBMITTED', 'ACTION_REQUIRED', 'ACTIVE'],
  role: Enum ['BUYER', 'PENDING'],
  salesAgentId: ObjectId (ref: User),
  userId: ObjectId (ref: User),
  verificationNotes: String,
  verifiedBy: ObjectId (ref: User),
  verifiedAt: Date,
  statusHistory: [StatusChange]
}
```

### SubContractor
```javascript
{
  companyName: String,
  ownerName: String,
  email: String (unique),
  phone: String,
  address: String,
  vendorId: String,
  gstin: String,
  status: Enum ['LEAD_CREATED', 'PROFILE_INCOMPLETE', 'PROFILE_COMPLETED'],
  linkedEpcId: ObjectId (ref: Company),
  salesAgentId: ObjectId (ref: User),
  userId: ObjectId (ref: User),
  statusHistory: [StatusChange]
}
```

### Bill
```javascript
{
  subContractorId: ObjectId (ref: SubContractor),
  uploadedBy: ObjectId (ref: User),
  linkedEpcId: ObjectId (ref: Company),
  billNumber: String,
  amount: Number,
  description: String,
  fileName: String,
  fileUrl: String (Cloudinary),
  cloudinaryPublicId: String,
  uploadMode: Enum ['image', 'excel'],
  status: Enum ['UPLOADED', 'VERIFIED', 'REJECTED'],
  verificationNotes: String,
  verifiedBy: ObjectId (ref: User),
  verifiedAt: Date,
  statusHistory: [StatusChange]
}
```

### Case
```javascript
{
  billId: ObjectId (ref: Bill),
  subContractorId: ObjectId (ref: SubContractor),
  epcId: ObjectId (ref: Company),
  cwcRfId: ObjectId (ref: CwcRf),
  caseNumber: String (unique, auto-generated),
  status: Enum [
    'READY_FOR_COMPANY_REVIEW',
    'EPC_REJECTED',
    'EPC_VERIFIED',
    'BID_PLACED',
    'NEGOTIATION_IN_PROGRESS',
    'COMMERCIAL_LOCKED'
  ],
  epcReviewNotes: String,
  epcReviewedBy: ObjectId (ref: User),
  epcReviewedAt: Date,
  commercialSnapshot: Mixed,
  lockedAt: Date,
  statusHistory: [StatusChange]
}
```

### Bid
```javascript
{
  caseId: ObjectId (ref: Case),
  epcId: ObjectId (ref: Company),
  placedBy: ObjectId (ref: User),
  bidAmount: Number,
  fundingDurationDays: Number,
  status: Enum [
    'SUBMITTED',
    'ACCEPTED',
    'REJECTED',
    'NEGOTIATION_IN_PROGRESS',
    'COMMERCIAL_LOCKED'
  ],
  negotiations: [NegotiationRound],
  lockedTerms: {
    finalAmount: Number,
    finalDuration: Number,
    lockedAt: Date
  },
  statusHistory: [StatusChange]
}
```

### CwcRf (Cash against Work Certificate Request Form)
```javascript
{
  billId: ObjectId (ref: Bill),
  subContractorId: ObjectId (ref: SubContractor),
  epcId: ObjectId (ref: Company),
  paymentReference: String,
  status: Enum [
    'SUBMITTED',
    'KYC_REQUIRED',
    'KYC_IN_PROGRESS',
    'KYC_COMPLETED',
    'ACTION_REQUIRED'
  ],
  kycMessages: [ChatMessage],
  statusHistory: [StatusChange]
}
```

---

## 🔐 Security Features

### Authentication
- JWT-based stateless authentication
- Password hashing with bcrypt (12 rounds)
- Token expiration and refresh

### Authorization
- Role-based access control (RBAC)
- Route-level middleware protection
- Resource ownership validation

### Data Protection
- HTTPS/TLS encryption in transit
- Environment variables for secrets
- SQL injection prevention (Mongoose)
- XSS protection via React

### File Security
- Cloudinary secure storage
- File type validation
- Size limitations
- Virus scanning (recommended for production)

---

## 🚀 Deployment Architecture

### Recommended Setup

#### Development
```
Frontend:  http://localhost:5173
Backend:   http://localhost:5000
Database:  mongodb://localhost:27017/gryork
```

#### Production
```
Frontend:  https://grylink.gryork.com (CDN)
Backend:   https://api.gryork.com (Load Balanced)
Database:  MongoDB Atlas (Cluster)
Files:     Cloudinary CDN
Email:     SendGrid/AWS SES
```

### Infrastructure
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: AWS EC2/ECS, DigitalOcean, or Heroku
- **Database**: MongoDB Atlas (managed)
- **Files**: Cloudinary
- **Email**: SendGrid, AWS SES, or Mailgun

---

## 📈 Scalability Considerations

### Current Architecture
- Monolithic API server
- Single MongoDB instance
- Synchronous processing

### Future Enhancements
- **Microservices**: Split into auth, billing, document, notification services
- **Message Queue**: RabbitMQ/Redis for async processing
- **Caching**: Redis for frequently accessed data
- **CDN**: CloudFront for static assets
- **Load Balancing**: NGINX or AWS ALB
- **Database**: Read replicas, sharding
- **Search**: Elasticsearch for advanced queries
- **Monitoring**: DataDog, New Relic, or Prometheus

---

## 🧪 Testing Strategy

### Backend Testing
- Unit tests for services (Jest)
- Integration tests for routes (Supertest)
- Database mocking (mongodb-memory-server)

### Frontend Testing
- Component tests (React Testing Library)
- E2E tests (Playwright/Cypress)
- Visual regression (Percy/Chromatic)

### Manual Testing Checklist
- [ ] Sales creates company lead
- [ ] Company completes onboarding
- [ ] Ops verifies documents
- [ ] EPC adds sub-contractors
- [ ] SC completes profile
- [ ] SC uploads bills
- [ ] Ops verifies bills
- [ ] EPC reviews cases
- [ ] SC submits CWC
- [ ] Ops completes KYC
- [ ] EPC places bid
- [ ] SC accepts/negotiates bid
- [ ] Commercial lock

---

## 📞 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /register` - Register internal users
- `POST /login` - Login all users
- `GET /me` - Get current user

### Sales (`/api/sales`)
- `POST /leads` - Create company lead
- `GET /leads` - Get my leads
- `GET /subcontractors` - Get SC leads
- `GET /dashboard` - Dashboard stats

### GryLink (`/api/grylink`)
- `GET /validate/:token` - Validate GryLink token
- `POST /set-password` - Set password for new account

### Company (`/api/company`)
- `GET /profile` - Get company profile
- `POST /documents` - Upload documents
- `POST /subcontractors` - Add sub-contractors
- `POST /subcontractors/bulk` - Bulk add (Excel)
- `GET /subcontractors` - List sub-contractors

### Sub-Contractor (`/api/subcontractor`)
- `PUT /profile` - Update profile
- `POST /bills` - Upload bills
- `POST /cwc` - Submit CWC request
- `POST /bids/:id/respond` - Respond to bid
- `GET /dashboard` - Dashboard data

### Ops (`/api/ops`)
- `GET /pending` - Get pending items
- `POST /companies/:id/verify` - Verify company
- `POST /bills/:id/verify` - Verify bill
- `POST /kyc/:id/request` - Request KYC docs
- `POST /kyc/:id/chat` - Send KYC message
- `POST /kyc/:id/complete` - Complete KYC
- `GET /kyc/:id/chat` - Get chat history

### Cases (`/api/cases`)
- `GET /` - List cases
- `GET /:id` - Get case details
- `POST /:id/review` - Review case (EPC)

### Bids (`/api/bids`)
- `POST /` - Place bid
- `POST /:id/negotiate` - Submit counter-offer
- `POST /:id/lock` - Lock commercial terms
- `GET /case/:caseId` - Get bids for case

---

## 🎯 Success Metrics

### Business KPIs
- Number of active EPCs
- Number of active sub-contractors
- Total bills processed
- Average processing time
- Bid acceptance rate
- Total financing volume

### Technical KPIs
- API response time (< 200ms)
- System uptime (99.9%)
- Error rate (< 0.1%)
- User satisfaction score

---

## 📚 Additional Documentation

- **Backend README**: `/backend/README.md`
- **Frontend README**: `/frontend/FRONTEND_README.md`
- **Workflow Details**: `/doc/workflow.md`
- **API Specification**: Generate with Swagger/Postman

---

## 🤝 Development Team Roles

### Full-Stack Developer
- End-to-end feature development
- API design and implementation
- Frontend components
- Database schema

### Frontend Developer
- React components
- UI/UX implementation
- State management
- Responsive design

### Backend Developer
- REST API development
- Database design
- Business logic
- Integration with third-party services

### DevOps Engineer
- CI/CD pipelines
- Infrastructure management
- Monitoring and alerting
- Security hardening

---

**Version**: 1.0.0  
**Last Updated**: February 12, 2026  
**Maintained by**: Gryork Development Team
