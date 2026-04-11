# GRYORK Systems Specification (BDF + FPDF)

---

# GRYORK | Business Discovery Framework (BDF) | CONFIDENTIAL

## Business Discovery Framework  
**BDF System — Complete SOP & Product Specification**  
Engineering Build Document | Version 1.0 | Confidential  

---

## 1. Objective

The BDF system is purpose-built to help GRYORK identify, qualify, and prioritise EPC companies and developers with genuine working capital or financing pain points. It replaces ad-hoc outreach with a structured, signal-driven qualification process.

**Core objectives:**
- Identify and qualify EPC companies and developers with active, financeable projects  
- Validate project suitability and detect payment stress signals through ground intelligence  
- Execute structured ground validation via direct calls using approved question scripts  
- Automate partner scoring and classification using the Conversion Meter engine  
- Ensure founders engage only with high-probability EPC partners with real financing need  

---

## 2. System Architecture Overview

The BDF system is composed of eight integrated modules:

| # | Module | Purpose |
|--|--------|--------|
| 1 | BDF Input Dashboard | Form-based structured data entry |
| 2 | Project Qualification Engine | Filters and scores project fit |
| 3 | Ground Intelligence Layer | Captures call insights |
| 4 | Scoring & Decision Engine | Calculates weighted scores |
| 5 | Conversion Meter | Semi-circular classification UI |
| 6 | Automated Routing System | Routes submissions |
| 7 | Founder Dashboard | Prioritised pipeline view |
| 8 | Hold & Archive Pipelines | Stores rejected entries |

---

## 3. BDF Form Structure

All inputs must be structured (dropdown / radio / yes-no).

### Section A — Project Qualification

| Field | Input |
|------|------|
| Company Name | Text |
| Company Type | EPC / Developer |
| Project Name | Text |
| Location | Text / Dropdown |
| Project Type | Residential |
| Project Value | <₹100 Cr / ₹100–500 Cr / ₹500–1500 Cr / ₹1500 Cr+ |
| Project Stage | 0–30% / 30–60% / 60%+ |

⚠️ **Rule:** If stage > 30%, cannot be Green Flag.

---

### Section B — Company Validation

| Field | Options |
|------|--------|
| Website Available | Yes / No |
| LinkedIn Presence | Yes / No |
| Company Size | Small / Mid / Large |

---

### Section C — Accessibility

| Field | Options |
|------|--------|
| Employees Identified | Yes / No |
| Phone Number | Yes / No |
| Reachability | Easy / Moderate / Difficult |

---

### Section D — Ground Intelligence (Mandatory)

Minimum 3 conversations required.

| Signal | Options |
|--------|--------|
| Billing Flow | Smooth / Slight Delay / Noticeable Delay |
| Subcontractor Usage | Low / Medium / High |
| Execution Pressure | Low / Medium / High |
| Sentiment | Positive / Neutral / Slightly Negative |

---

## 4. Outreach SOP

### Channels

- WhatsApp / Calls (Primary)
- LinkedIn (Secondary)
- Site Visits (Selective)

### Approved Questions

1. Project stage?
2. Billing delays?
3. Execution challenges?
4. Subcontractor usage?
5. Overall pressure?

**Rules:**
- Minimum 3 conversations  
- All 5 questions covered  
- Zero calls → invalid  

---

## 5. Scoring Engine

| Dimension | Weight |
|----------|--------|
| Project Fit | 30% |
| Ground Signals | 30% |
| Accessibility | 20% |
| Engagement | 20% |

---

## 6. Conversion Meter

| Zone | Range | Label |
|------|------|------|
| 🔴 Red | 0–45° | Reject |
| 🟠 Orange | 45–90° | Hold |
| 🟡 Yellow | 90–135° | Strategic |
| 🟢 Green | 135–180° | Priority |

---

## 7. Automated Routing

| Classification | Pipeline |
|---------------|---------|
| Green | Priority |
| Light Green | Strategic |
| Light Red | Hold |
| Red | Archive |

---

## 8. Founder Dashboard

Displays:
- Company Name  
- Project Summary  
- Key Signals  
- Conversion Meter  
- Accessibility  

---

## 9. Data Flow

1. Create record  
2. Save draft  
3. Outreach  
4. Update  
5. Complete  
6. Score  
7. Submit  

---

## 10. Validation Rules

- ≥3 conversations  
- All Section D complete  
- Section A complete  
- Accessibility filled  

---

## 11. Design Principles

1. Project Fit (Highest)  
2. Ground Signals  
3. Access  

---

# GRYORK | Financial Partner Discovery Framework (FPDF) | CONFIDENTIAL

## Financial Partner Discovery Framework  
**FPDF System — Complete SOP & Product Specification**

---

## 1. Objective

The FPDF system streamlines identifying and converting financial institution partnerships.

**Core objectives:**
- Identify NBFCs and institutions  
- Validate lending compatibility  
- Execute structured outreach  
- Automate scoring  
- Ensure high-fit partnerships  

---

## 2. System Architecture

| # | Module |
|--|--------|
| 1 | Input Dashboard |
| 2 | Outreach Tracking |
| 3 | Scoring Engine |
| 4 | Conversion Meter |
| 5 | Routing System |
| 6 | Founder Dashboard |
| 7 | Hold & Archive |

---

## 3. FPDF Form Structure

### Section A — Basic Information

| Field | Input Type / Options |
|------|--------|
| Company Name | Text input (free text) |
| Institution Type | Dropdown: NBFC / Bank / Fintech |
| Headquarters Location | Radio: Delhi NCR / Non-NCR |

---

### Section B — Lending Fit (Core Filter)

**Sub-section: Lending Segment**

| Field | Input Options |
|------|--------|
| MSME Lending | Yes / No |
| Vendor / Contractor Financing | Yes / No |
| Infrastructure Exposure | Yes / No |

**Sub-section: Product Type**

| Field | Input Options |
|------|--------|
| Working Capital Loans | Yes / No |
| Invoice / Receivable Financing | Yes / No |

**Sub-section: Ticket Size Fit**

| Field | Input Options |
|------|--------|
| Ticket Size Compatibility | Radio: Matches Rs10L-<2Cr / Higher Only |

**Sub-section: Geographic Preference**

| Field | Input Options |
|------|--------|
| Delhi NCR Active | Yes / No |
| Pan India Coverage | Yes / No |
| Region Restricted | Yes / No |

---

### Section C — Outreach Tracking

**Sub-section: LinkedIn Outreach**

| Field | Options |
|------|--------|
| Outreach Attempted | Yes / No |
| Response Received | Yes / No |

**Sub-section: Call Interaction**

| Field | Options |
|------|--------|
| Call Attempted | Yes / No |
| Connected Successfully | Yes / No |

**Sub-section: Conversation Quality**

| Field | Options |
|------|--------|
| Conversation Quality | Radio: No Conversation / Basic Conversation / Meaningful Conversation |

---

### Section D — Engagement Status

| Field | Options |
|------|--------|
| Meeting Status | Radio: Offline Meeting Confirmed / Online Meeting Confirmed / Not Confirmed |
| Partnership Willingness | Radio: Open / Maybe / Not Interested |

---

## 4. Outreach SOP

**3-step process:**
1. LinkedIn  
2. Call  
3. Meeting  

**Rules:**
- ≥2 outreach attempts  
- ≥1 human interaction  
- Otherwise blocked  

---

## 5. Scoring Engine

| Dimension | Weight |
|----------|--------|
| Lending Fit | 40% |
| Ticket Size | 15% |
| Engagement | 25% |
| Accessibility | 10% |
| Geography | 10% |

---

## 6. Conversion Meter

| Zone | Range | Label |
|------|------|------|
| 🔴 Red | 0–45° | Reject |
| 🟠 Orange | 45–90° | Hold |
| 🟡 Yellow | 90–135° | Strategic |
| 🟢 Green | 135–180° | Priority |

---

## 7. Routing

| Classification | Pipeline |
|---------------|---------|
| Green | Priority |
| Light Green | Strategic |
| Light Red | Hold |
| Red | Archive |

---

## 8. Founder Dashboard

Displays:
- Company Name  
- Location  
- Lending Fit  
- Engagement  
- Conversion Meter  
- Key Signals  

---

## 9. Data Flow

1. Create  
2. Draft  
3. Outreach  
4. Update  
5. Complete  
6. Score  
7. Submit  

---

## 10. Validation Rules

- ≥2 outreach attempts  
- ≥1 interaction  
- All required fields filled  

---

## 11. Design Principles

1. Fit (Highest)  
2. Intent  
3. Access  

---

# END OF DOCUMENT