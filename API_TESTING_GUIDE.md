# Gryork API Testing Guide

Complete API testing commands for all endpoints.

---

## Deployed URLs

| Portal | URL | Description |
|--------|-----|-------------|
| **Backend API** | https://grylink-backend.vercel.app | REST API Server |
| **Gryork Public** | https://gryork-public.vercel.app | Public Marketing Website |
| **Sub-Contractor Portal** | https://app-gryork.vercel.app | Sub-Contractor Dashboard |
| **GryLink Portal** | https://link-gryork.vercel.app | EPC/NBFC Onboarding Portal |
| **Partner Portal** | https://partner-gryork.vercel.app | EPC & NBFC Partner Dashboard |
| **Official Portal** | https://official-gryork.vercel.app | Internal Admin (Sales, Ops, RMT) |

---

## Setup

### Local Development

```powershell
# Set base URL for local development
$BASE = "http://localhost:5000/api"

# Login function
function Login($email) {
    $body = @{ email = $email; password = "password123" } | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$BASE/auth/login" -Method POST -Body $body -ContentType "application/json"
    return $result.token
}

# Tokens for each role
$ADMIN_TOKEN = Login "admin@gryork.com"
$SALES_TOKEN = Login "sales@gryork.com"
$OPS_TOKEN = Login "ops@gryork.com"
$RMT_TOKEN = Login "rmt@gryork.com"
$FOUNDER_TOKEN = Login "founder@gryork.com"
```

### Production Testing

```powershell
# Set base URL for production
$BASE = "https://grylink-backend.vercel.app/api"

# Login function (same as above)
function Login($email) {
    $body = @{ email = $email; password = "password123" } | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$BASE/auth/login" -Method POST -Body $body -ContentType "application/json"
    return $result.token
}

# Tokens for each role
$ADMIN_TOKEN = Login "admin@gryork.com"
$SALES_TOKEN = Login "sales@gryork.com"
$OPS_TOKEN = Login "ops@gryork.com"
$RMT_TOKEN = Login "rmt@gryork.com"
$FOUNDER_TOKEN = Login "founder@gryork.com"
```

### Quick Health Check

```powershell
# Local
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

# Production
Invoke-RestMethod -Uri "https://grylink-backend.vercel.app/api/health"
```

---

## Test Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@gryork.com | password123 | Full system access |
| Sales | sales@gryork.com | password123 | Lead management, contacts |
| Operations | ops@gryork.com | password123 | KYC verification, documents |
| Risk Management | rmt@gryork.com | password123 | Risk assessment |
| Founder | founder@gryork.com | password123 | Approvals, oversight |

---

## 1. Health & Auth Endpoints

### Health Check
```powershell
Invoke-RestMethod -Uri "$BASE/health"
```

### Login
```powershell
$body = @{ email = "admin@gryork.com"; password = "password123" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### Get Current User
```powershell
$headers = @{ Authorization = "Bearer $ADMIN_TOKEN" }
Invoke-RestMethod -Uri "$BASE/auth/me" -Headers $headers
```

---

## 2. Sales Endpoints

### Get Dashboard
```powershell
$headers = @{ Authorization = "Bearer $SALES_TOKEN" }
Invoke-RestMethod -Uri "$BASE/sales/dashboard" -Headers $headers
```

### Create Lead
```powershell
$body = @{
    companyName = "Test Construction Ltd"
    ownerName = "Test Owner"
    email = "test@company.com"
    phone = "9876543210"
    gstin = "22AAAAA0000A1Z5"
    companyType = "epc"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/sales/leads" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

### Get All Sub-Contractors
```powershell
Invoke-RestMethod -Uri "$BASE/sales/subcontractors" -Headers $headers
```

### Get Contacts
```powershell
Invoke-RestMethod -Uri "$BASE/sales/contacts" -Headers $headers
```

### Mark Contact as Contacted
```powershell
Invoke-RestMethod -Uri "$BASE/sales/contacts/{contactId}/contacted" -Method PATCH -Headers $headers
```

---

## 3. Ops Endpoints

### Get Dashboard
```powershell
$headers = @{ Authorization = "Bearer $OPS_TOKEN" }
Invoke-RestMethod -Uri "$BASE/ops/dashboard" -Headers $headers
```

### Get Pending Verifications
```powershell
Invoke-RestMethod -Uri "$BASE/ops/pending" -Headers $headers
```

### Verify Company
```powershell
$body = @{ decision = "approve"; notes = "All documents verified" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/ops/companies/{companyId}/verify" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

### KYC Chat Messages
```powershell
# Get messages
Invoke-RestMethod -Uri "$BASE/ops/kyc/{subcontractorId}/messages" -Headers $headers

# Send message
$body = @{ message = "Please upload PAN card" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/ops/kyc/{subcontractorId}/messages" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

---

## 4. Cases Endpoints

### Get All Cases
```powershell
$headers = @{ Authorization = "Bearer $ADMIN_TOKEN" }
Invoke-RestMethod -Uri "$BASE/cases" -Headers $headers
```

### Get Case by ID
```powershell
Invoke-RestMethod -Uri "$BASE/cases/{caseId}" -Headers $headers
```

### Update Case Status
```powershell
$body = @{ status = "EPC_VERIFIED" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/cases/{caseId}/status" -Method PATCH -Headers $headers -Body $body -ContentType "application/json"
```

---

## 5. Bids Endpoints

### Get All Bids
```powershell
$headers = @{ Authorization = "Bearer $ADMIN_TOKEN" }
Invoke-RestMethod -Uri "$BASE/bids" -Headers $headers
```

### Create Bid
```powershell
$body = @{
    caseId = "case_id_here"
    amount = 1000000
    discountPercent = 5
    paymentTerms = "30 days"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/bids" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

### Counter Bid
```powershell
$body = @{ counterAmount = 950000; counterTerms = "45 days" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/bids/{bidId}/counter" -Method PATCH -Headers $headers -Body $body -ContentType "application/json"
```

### Lock Bid
```powershell
Invoke-RestMethod -Uri "$BASE/bids/{bidId}/lock" -Method POST -Headers $headers
```

---

## 6. GryLink Endpoints

### Verify GryLink Token
```powershell
Invoke-RestMethod -Uri "$BASE/grylink/verify/{token}"
```

### Set Password (EPC/NBFC Onboarding)
```powershell
$body = @{ token = "grylink_token"; password = "newpassword123" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/grylink/set-password" -Method POST -Body $body -ContentType "application/json"
```

---

## 7. Subcontractor Endpoints

### Get Dashboard
```powershell
$headers = @{ Authorization = "Bearer $SC_TOKEN" }
Invoke-RestMethod -Uri "$BASE/subcontractor/dashboard" -Headers $headers
```

### Complete Profile
```powershell
$body = @{
    businessName = "My Construction Co"
    gstin = "22AAAAA0000A1Z5"
    pan = "AAAAA0000A"
    address = "123 Main Street"
    city = "Mumbai"
    state = "Maharashtra"
    pincode = "400001"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/subcontractor/profile" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

### Get Bills
```powershell
Invoke-RestMethod -Uri "$BASE/subcontractor/bills" -Headers $headers
```

### Get Incoming Bids
```powershell
Invoke-RestMethod -Uri "$BASE/subcontractor/bids" -Headers $headers
```

### Respond to Bid
```powershell
$body = @{ response = "accept" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/subcontractor/bids/{bidId}/respond" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

---

## 8. Company Endpoints (EPC/NBFC)

### Get Company Profile
```powershell
$headers = @{ Authorization = "Bearer $EPC_TOKEN" }
Invoke-RestMethod -Uri "$BASE/company/profile" -Headers $headers
```

### Add Subcontractor
```powershell
$body = @{
    name = "New Subcontractor"
    email = "sc@example.com"
    phone = "9876543210"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/company/subcontractors" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

### Get Subcontractors
```powershell
Invoke-RestMethod -Uri "$BASE/company/subcontractors" -Headers $headers
```

---

## 9. Agent Endpoints

### Get All Agents
```powershell
$headers = @{ Authorization = "Bearer $FOUNDER_TOKEN" }
Invoke-RestMethod -Uri "$BASE/agents" -Headers $headers
```

### Create Agent
```powershell
$body = @{
    name = "Agent Name"
    email = "agent@example.com"
    phone = "9876543210"
    commissionPercent = 2
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/agents" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

### Get Agent by ID
```powershell
Invoke-RestMethod -Uri "$BASE/agents/{agentId}" -Headers $headers
```

### Handle Misconduct
```powershell
$body = @{ action = "suspend"; reason = "Policy violation" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/agents/{agentId}/misconduct" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

---

## 10. NBFC Endpoints

### Get Dashboard
```powershell
$headers = @{ Authorization = "Bearer $NBFC_TOKEN" }
Invoke-RestMethod -Uri "$BASE/nbfc/dashboard" -Headers $headers
```

### Get Shared Cases
```powershell
Invoke-RestMethod -Uri "$BASE/nbfc/cases" -Headers $headers
```

### Respond to Case
```powershell
$body = @{
    decision = "approve"
    terms = "8% discount, 60 days"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/nbfc/cases/{caseId}/respond" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

---

## 11. Blacklist Endpoints

### Get Blacklist
```powershell
$headers = @{ Authorization = "Bearer $OPS_TOKEN" }
Invoke-RestMethod -Uri "$BASE/blacklist" -Headers $headers
```

### Add to Blacklist
```powershell
$body = @{
    entityType = "company"
    entityId = "company_id"
    reason = "Fraudulent documents"
    pan = "AAAAA0000A"
    gstin = "22AAAAA0000A1Z5"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/blacklist" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

### Check if Blacklisted
```powershell
Invoke-RestMethod -Uri "$BASE/blacklist/check?pan=AAAAA0000A" -Headers $headers
```

---

## 12. Transaction Endpoints

### Get Transactions
```powershell
$headers = @{ Authorization = "Bearer $ADMIN_TOKEN" }
Invoke-RestMethod -Uri "$BASE/transactions" -Headers $headers
```

### Create Transaction
```powershell
$body = @{
    caseId = "case_id"
    bidId = "bid_id"
    amount = 1000000
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/transactions" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

### Update Transaction Status
```powershell
$body = @{ status = "COMPLETED" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/transactions/{transactionId}/status" -Method PATCH -Headers $headers -Body $body -ContentType "application/json"
```

---

## 13. SLA Endpoints

### Get SLA Status
```powershell
$headers = @{ Authorization = "Bearer $OPS_TOKEN" }
Invoke-RestMethod -Uri "$BASE/sla" -Headers $headers
```

### Get Breached SLAs
```powershell
Invoke-RestMethod -Uri "$BASE/sla/breached" -Headers $headers
```

### Get SLA by Case
```powershell
Invoke-RestMethod -Uri "$BASE/sla/case/{caseId}" -Headers $headers
```

---

## 14. Approval Endpoints

### Get Pending Approvals
```powershell
$headers = @{ Authorization = "Bearer $FOUNDER_TOKEN" }
Invoke-RestMethod -Uri "$BASE/approvals/pending" -Headers $headers
```

### Approve/Reject
```powershell
$body = @{ decision = "approve"; comments = "Approved after review" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/approvals/{approvalId}/respond" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

---

## 15. Risk Assessment Endpoints

### Get Risk Assessments
```powershell
$headers = @{ Authorization = "Bearer $RMT_TOKEN" }
Invoke-RestMethod -Uri "$BASE/risk-assessment" -Headers $headers
```

### Create Assessment
```powershell
$body = @{
    subContractorId = "sc_id"
    checklistScores = @{
        financialStability = 8
        pastPerformance = 7
        documentVerification = 9
        marketCondition = 6
    }
    notes = "Generally good profile"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/risk-assessment" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

---

## 16. Re-KYC Endpoints

### Get Re-KYC Queue
```powershell
$headers = @{ Authorization = "Bearer $OPS_TOKEN" }
Invoke-RestMethod -Uri "$BASE/rekyc/queue" -Headers $headers
```

### Trigger Re-KYC
```powershell
$body = @{
    subContractorId = "sc_id"
    reason = "Bank account change"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/rekyc/trigger" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

### Complete Re-KYC
```powershell
$body = @{ status = "verified"; notes = "All documents re-verified" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/rekyc/{rekycId}/complete" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

---

## 17. Cron Endpoints

### Get Cron Status
```powershell
$headers = @{ Authorization = "Bearer $FOUNDER_TOKEN" }
Invoke-RestMethod -Uri "$BASE/cron/status" -Headers $headers
```

### Trigger Cron Manually
```powershell
Invoke-RestMethod -Uri "$BASE/cron/trigger/dormant-marking" -Method POST -Headers $headers
Invoke-RestMethod -Uri "$BASE/cron/trigger/sla-reminders" -Method POST -Headers $headers
Invoke-RestMethod -Uri "$BASE/cron/trigger/kyc-expiry" -Method POST -Headers $headers
```

---

## Testing Workflow (Full Flow)

```powershell
# 1. Start fresh - Login as Sales
$SALES = Login "sales@gryork.com"
$salesHeaders = @{ Authorization = "Bearer $SALES" }

# 2. Create EPC Lead
$epcBody = @{
    companyName = "Mumbai Builders Ltd"
    ownerName = "Amit Shah"
    email = "amit@mumbaibuilders.com"
    phone = "9876543210"
    gstin = "27AABCM1234E1ZP"
    companyType = "epc"
} | ConvertTo-Json
$epc = Invoke-RestMethod -Uri "$BASE/sales/leads" -Method POST -Headers $salesHeaders -Body $epcBody -ContentType "application/json"
Write-Host "Created EPC: $($epc._id)"

# 3. Login as Ops - Verify Company
$OPS = Login "ops@gryork.com"
$opsHeaders = @{ Authorization = "Bearer $OPS" }
$verifyBody = @{ decision = "approve"; notes = "Verified" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE/ops/companies/$($epc._id)/verify" -Method POST -Headers $opsHeaders -Body $verifyBody -ContentType "application/json"

# 4. Login as RMT - Check Risk
$RMT = Login "rmt@gryork.com"
$rmtHeaders = @{ Authorization = "Bearer $RMT" }
Invoke-RestMethod -Uri "$BASE/risk-assessment" -Headers $rmtHeaders

# 5. Login as Founder - Check Approvals
$FOUNDER = Login "founder@gryork.com"
$founderHeaders = @{ Authorization = "Bearer $FOUNDER" }
Invoke-RestMethod -Uri "$BASE/approvals/pending" -Headers $founderHeaders

Write-Host "Full flow completed successfully!"
```

---

*Generated for Gryork Platform v1.0*
