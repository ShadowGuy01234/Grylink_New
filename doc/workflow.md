# Gryork End-to-End Technical Workflow

This document describes the complete, end-to-end technical workflow of the Gryork platform. It covers **roles, responsibilities, system states, decision points, and handoffs** from the very first offline sales contact to final commercial agreement and funding readiness.

This is written as a **system-facing workflow** suitable for product, engineering, ops, and risk teams.

---

## 1. Core Actors & Roles

### Sales Team

* Initiates all onboarding **offline**
* Owns company relationships
* Creates company leads
* Contacts and educates Sub-Contractors
* Maintains first-touch control and commission ownership

### EPC (Company / Buyer)

* Completes self-onboarding
* Uploads and maintains company documents
* Adds Sub-Contractors
* Verifies bills
* Places commercial bids

### Sub-Contractor (Seller)

* Signs up after sales contact
* Uploads bills
* Requests CWC
* Completes KYC
* Accepts / negotiates bids

### Support / Ops Team

* Verifies documents
* Reviews bills
* Manages KYC
* Handles chat-based verification
* Controls state transitions

### Risk Management Team (RMT)

* Performs risk analysis (post-commercial)
* Prepares NBFC-shareable reports

### System (Gryork Platform)

* Enforces flows, states, SLAs
* Generates onboarding links
* Handles auth, uploads, payments, chat

---

## 2. Offline Sales Initiation (Mandatory Entry Point)

### Key Rule

> **No company or Sub-Contractor can enter the system without Sales initiation.**

### Sales Actions (Offline)

* Contact company
* Explain Gryork offering
* Collect basic details:

  * Company Name
  * Owner Name
  * Email
  * Phone
  * Address

---

## 3. Company Lead Creation (Sales Dashboard)

### Actor

* Sales Team

### Actions

* Sales logs into internal dashboard
* Creates a new company lead

### Data Captured

* Company Name
* Owner Name
* Email (primary identifier)
* Phone
* Address

### System Effects

* Company Lead ID generated
* Company mapped to Sales Agent

```
Company.status = LEAD_CREATED
Company.sales_agent_id = current_agent
```

---

## 4. GryLink Generation & Credential Creation

### System Actions

* Generate secure, single-use GryLink
* Bind link to:

  * Company ID
  * Sales Agent ID
  * Email

### Email Sent

* Contains onboarding link
* Username is implicitly the email address

### Company Actions

* Open link
* Set password

### Result

```
Company.status = CREDENTIALS_CREATED
```

---

## 5. EPC Self-Onboarding on GryLink (Documents)

### Upload Rules

* Platform-only uploads
* No email or offline documents allowed

### Mandatory Documents

* CIN
* GST
* PAN
* Board Resolution
* Bank Statements (12 months)
* Audited Financials (2 years)
* Project details
* Cash-flow details

```
Company.status = DOCS_SUBMITTED
```

---

## 6. Ops Verification of EPC

### Actor

* Support / Ops Team

### Ops Actions

* Validate completeness
* Check consistency
* Flag discrepancies

### Outcomes

**If issues found**

```
Company.status = ACTION_REQUIRED
```

**If verified**

```
Company.status = ACTIVE
Company.role = BUYER
```

---

## 7. Sub-Contractor Intake by EPC

Triggered immediately after EPC activation.

### Two Input Modes

#### Option A: Manual Entry

* Company Name
* Contact Name
* Email
* Phone

#### Option B: Excel Upload

* Bulk upload using template
* Row-level validation

### System Result

```
Seller.status = LEAD_CREATED
Seller.linked_epc_id = EPC.id
Seller.sales_agent_id = EPC.sales_agent_id
```

Visible on Sales dashboard.

---

## 8. Sales Contact with Sub-Contractor

### Actor

* Sales Team

### Actions

* Contact Sub-Contractor
* Explain bill discounting
* Guide them to signup

---

## 9. Sub-Contractor Signup (Website)

### Auth Methods

* Google OAuth
* Phone + OTP

```
SubContractor.account = CREATED
SubContractor.status = PROFILE_INCOMPLETE
```

---

## 10. Sub-Contractor Profile Completion

### Mandatory Details

* Company Name
* Owner Name
* Address
* Phone
* Email
* Vendor ID
* GSTIN

### Company Selection

* Select from onboarded EPC list

**If new company selected**

```
NewCompanyLead.status = CREATED
Sales notified
```

```
SubContractor.status = PROFILE_COMPLETED
```

---

## 11. Bill Upload by Sub-Contractor

### Upload Modes

* Bill image
* Excel sheet

```
Bill.status = UPLOADED
```

---

## 12. Ops Bill Verification

### Ops Actions

* Verify authenticity
* Validate amounts and mapping

**Rejected**

```
Bill.status = REJECTED
```

**Approved**

```
Bill.status = VERIFIED
```

---

## 13. CWC RF Submission

### Sub-Contractor Actions

* Fill CWC Request Form
* Pay ₹1,000 platform fee

```
CWC_RF.status = SUBMITTED
```

---

## 14. Chat-Based KYC (Sub-Contractor)

### System

* In-platform chat

### Flow

* Ops requests documents
* Sub-Contractor uploads via chat

### States

**Incomplete**

```
CWC_RF.status = ACTION_REQUIRED
```

**Verified**

```
CWC_RF.status = KYC_COMPLETED
```

---

## 15. Case Ready for Company Review

```
Case.status = READY_FOR_COMPANY_REVIEW
```

---

## 16. EPC Bill Verification

### EPC Actions

* Review bills
* Approve or reject

**Rejected**

```
Case.status = EPC_REJECTED
```

**Approved**

```
Case.status = EPC_VERIFIED
```

---

## 17. EPC Bid Placement

### EPC Inputs

* Bid Amount
* Funding Duration (days)

```
Bid.status = SUBMITTED
Case.status = BID_PLACED
```

---

## 18. Sub-Contractor Decision

### Options

* Accept
* Reject
* Negotiate

Negotiation warning is mandatory:

> Negotiation may reduce the offered amount

---

## 19. Negotiation & Agreement

### States

```
NEGOTIATION_IN_PROGRESS
→ COMMERCIAL_LOCKED
```

On lock:

* Terms immutable
* Audit snapshot created

---

## 20. Post-Agreement Handoff

After commercial lock, the case proceeds to:

* RMT risk analysis
* NBFC routing
* Escrow / TRA
* Disbursement

(Handled in later pipeline stages)

---

## 21. Global Design Principles

* Sales-controlled entry
* Platform-only documents
* Clear ownership at every stage
* Strong audit trail
* Explicit state transitions
* No silent approvals

---

## 22. High-Level State Flow Summary

```
LEAD_CREATED
→ CREDENTIALS_CREATED
→ DOCS_SUBMITTED
→ ACTIVE
→ SELLER_ADDED
→ SELLER_SIGNUP
→ BILL_VERIFIED
→ CWC_SUBMITTED
→ KYC_COMPLETED
→ EPC_VERIFIED
→ BID_PLACED
→ COMMERCIAL_LOCKED
```

---

**End of Document**
