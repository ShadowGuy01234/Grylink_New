# GRYORK CONSULTANTS PRIVATE LIMITED  
# Lending Service Provider (LSP)  
## COMPLETE TECHNOLOGY ARCHITECTURE  

**CTO Reference Document**  
Version v1.0 — Initial Release  
Classification: CONFIDENTIAL — Internal Only  

---

## 1. SYSTEM OVERVIEW & GUIDING PRINCIPLES

### 1.1 What GRYORK Is — and Is Not

**GRYORK IS RESPONSIBLE FOR**
- Borrower onboarding & KYC data collection  
- Consent capture and AA journey orchestration  
- Risk data aggregation and scoring signals  
- Loan application UI and journey  
- Passing enriched data to NBFC via secure API  
- Grievance redressal (first level)  
- Audit logs, consent records, DLP  

**GRYORK IS NOT RESPONSIBLE FOR**
- Loan sanction/rejection  
- Holding funds  
- Disbursing money  
- Collecting repayments  
- Credit risk  
- NBFC loan account storage  
- Recovery communications  

🚨 **CRITICAL**  
Payment flow must always be: **NBFC → Borrower**

---

### 1.2 Core Architecture Principles

- Consent-first  
- Stateless API gateway  
- Data minimization  
- Immutable audit trail  
- Graceful degradation  
- Zero-trust internal access  

---

### 1.3 Phasing Model

| Phase | Timeline | Objective |
|------|---------|----------|
| Phase 1 | Day 1 → Month 3 | MVP compliant system |
| Phase 2 | Month 4 → Month 8 | Risk + automation |
| Phase 3 | Month 9+ | Scale & intelligence |

---

## 2. END-TO-END USER JOURNEY

### Borrower Flow

1. Registration (OTP)
2. Business onboarding (GST, PAN)
3. KYC (Aadhaar, PAN, Liveness)
4. Business document upload
5. Consent capture (mandatory)
6. AA integration
7. GST data pull
8. Invoice verification
9. Risk scoring
10. NBFC handoff
11. NBFC underwriting
12. Loan offer display
13. KFS display (mandatory)
14. Disbursement (NBFC only)
15. Monitoring
16. Grievance handling
17. Loan closure

⚠ All states must be logged + audited

---

## 3. SYSTEM ARCHITECTURE

### 3.1 Components

| Layer | Components | Tech |
|------|-----------|------|
| Frontend | Web + Mobile | Next.js / React Native |
| API Gateway | Auth + Rate limit | AWS API Gateway |
| Core Services | KYC, Consent, Docs | Node.js / Python |
| Integration | AA, NBFC, GST | Adapter-based |
| Risk Engine | ML + Rules | Python |
| Data Layer | DB + Cache | PostgreSQL, Redis |
| Compliance | Consent vault | Custom |
| Observability | Logs + Metrics | ELK / Grafana |
| Infra | Cloud | AWS ap-south-1 |

---

### 3.2 Data Flow

Borrower → WAF → API Gateway → Core Services → Integrations → NBFC  

⚠ Funds NEVER pass through LSP

---

### 3.3 Tech Stack

- Frontend: Next.js + React Native  
- Backend: Node.js (TypeScript)  
- DB: PostgreSQL  
- Queue: SQS  
- Storage: S3  
- Security: JWT + TLS 1.3  
- Infra: AWS Mumbai  

---

## 4. CONSENT MANAGEMENT SYSTEM

🚨 **MOST CRITICAL SYSTEM**

### Consent Model Fields

- consent_id  
- user_id  
- consent_type  
- version  
- language  
- hash  
- IP  
- device  
- timestamp  
- status  

---

### APIs

- POST /consent/capture  
- GET /consent/{id}  
- POST /consent/withdraw  
- POST /consent/verify  

---

### AA Flow

1. Generate consent  
2. User selects accounts  
3. Bank authentication  
4. Fetch encrypted data  
5. Extract features  
6. Delete raw data within 24h  

🚨 Raw bank statements MUST NOT be stored

---

## 5. KYC SYSTEM

### KYC State Machine

INITIATED → OTP → PAN → AADHAAR → BUSINESS → LIVENESS → COMPLETE  

---

### Vendors

- OTP: MSG91  
- PAN: NSDL  
- Aadhaar: DigiLocker  
- Liveness: Jumio  
- GST: Karza  

---

### PII Rules

- Aadhaar → hash only  
- PAN → masked  
- Bank → last 4 digits  
- Encryption mandatory  

---

## 6. RISK ENGINE

⚠ Only signals, NOT decisions

### Signals

- GST health  
- Banking behavior  
- Receivables  
- Business vintage  
- Fraud signals  

---

### Rule-Based Scoring

| Score | Tier |
|------|------|
| 80–100 | Green |
| 60–79 | Amber |
| 40–59 | Orange |
| <40 | Red |

---

### ML Engine (Phase 2)

- XGBoost / LightGBM  
- FastAPI serving  
- SHAP explainability  

---

## 7. AUDIT & COMPLIANCE

### Audit Fields

- event_id  
- actor  
- resource  
- action  
- old/new state  
- timestamp  
- hash chain  

---

### Mandatory Logs

- Consent  
- KYC  
- NBFC calls  
- Risk scoring  
- Loan events  

---

### Data Retention

- Audit logs: 7 years  
- AA raw data: 24h delete  
- S3 lifecycle enabled  

---

### DPDP Compliance

- Access  
- Correction  
- Erasure  
- Portability  
- Breach notification  

---

## 8. NBFC INTEGRATION

### Principles

- Adapter-based design  
- mTLS required  
- Signed payloads  
- Idempotency  

---

### APIs

- submitApplication  
- getStatus  
- getOffer  
- confirmAcceptance  
- getKFS  
- handleWebhook  

---

### Payload Structure

Includes:
- borrower data  
- consent  
- risk signals  
- documents  

⚠ Use pre-signed URLs (no raw docs)

---

## 9. SECURITY

### Controls

- WAF + DDoS protection  
- JWT auth  
- RBAC  
- AES-256 encryption  
- TLS 1.3  

---

### Secrets

- AWS Secrets Manager  
- Rotation every 90 days  

---

### Incident Response

1. Detect  
2. Contain  
3. Fix  
4. Recover  
5. Notify  

---

## 10. GRIEVANCE SYSTEM

### Fields

- ticket_id  
- category  
- status  
- SLA  
- resolution  

---

### SLA Engine

- Auto escalation  
- 30-day RBI limit  
- Alerts + tracking  

---

## 11. MVP CHECKLIST

Must-have:

- OTP auth  
- KYC  
- Consent system  
- AA integration  
- Risk engine  
- NBFC integration  
- Audit logs  
- Security  

---

## 12. RISKS & ANTI-PATTERNS

🚨 Avoid:

- Handling funds  
- Making credit decisions  
- Storing bank statements  
- Missing consent  
- Breaking KFS rules  

---

## 13. IMPLEMENTATION ROADMAP

### 14 Sprints

- Infra  
- Auth  
- KYC  
- Consent  
- AA  
- Risk  
- NBFC  
- Audit  
- Grievance  
- Dashboard  

---

## 14. APIs & INTEGRATIONS

### External APIs

- DigiLocker  
- Anumati (AA)  
- GST APIs  
- PAN APIs  
- OCR  
- OTP  

---

### Internal Standards

- /api/v1 versioning  
- OpenAPI docs  
- Request ID tracking  

---

# END OF DOCUMENT