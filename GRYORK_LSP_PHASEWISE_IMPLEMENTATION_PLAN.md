# GRYORK LSP Phasewise Implementation Plan

## 1) Purpose

This document converts the full diagnostic in Gryork_LSP_Technical_Diagnostic_Report.md into an execution-grade, phasewise implementation plan for the LSP Compliance Transformation Programme.

Primary objective:
- Make Gryork NBFC-ready under RBI Digital Lending Guidelines (DLG), DPDPA-aligned consent architecture, and regulated audit/document standards.

Time horizon:
- Phase 1 (Weeks 1-12): Minimum NBFC-Ready State
- Phase 2 (Weeks 13-28): Compliance Maturity
- Phase 3 (Weeks 29-52): Scale Infrastructure

## 2) Non-Negotiable Compliance Principles (Apply In All Phases)

1. Compliance is architectural, not manual.
2. No disbursement without CEE gate pass.
3. No data sharing without purpose-specific valid consent.
4. No legal reliance on mutable logs.
5. NBFC operations must remain possible even if Gryork core systems are degraded.
6. Borrower rights (KFS disclosure, cooling-off, exit) must be system-enforced.
7. All API failures must enter auditable fallback states.
8. Separation of borrower, NBFC, and Gryork data/identity/access domains is mandatory.

## 3) Coverage Matrix (Source Section -> Plan Coverage)

- Section 1 (Executive Diagnostic): Program baseline, risk mitigation sequencing, readiness gates.
- Section 2 (LSP Requirements): Target controls embedded in architecture and backlog.
- Section 3 (Gap A-H): Each gap mapped to mandatory implementation tracks.
- Section 4 (Target Architecture): Multi-interface + GRYLINK Core + API Gateway design implemented in phases.
- Section 5 (Core Modules): Module-by-module engineering backlog and acceptance criteria.
- Section 6 (API Integration Layer): Integration catalog, trigger points, standards, resilience, and test requirements.
- Section 7 (CEE): Hard-gate enforcement for DLG controls, direct disbursement, fee separation, consent checks.
- Section 8 (IDR + Platform Failure): Independent WORM/TSA repository and 30-minute NBFC access SLA.
- Section 9 (Audit): Hash-chain + WORM + TSA architecture, event completeness, retention requirements.
- Section 10 (Escrow): Real-time monitoring, reconciliation, mismatch alerts, NBFC visibility.
- Section 11 (Security): RBAC, data segregation, encryption, mTLS, key rotation, consent-gated data flow.
- Section 12 (CTO Responsibility): certification checkpoints and audit-readiness governance.
- Section 13 (Roadmap): Phase-by-phase implementation schedule aligned to diagnostic.
- Section 14 (Team Instructions): backend/frontend/devops/product execution rules and quality bars.

## 4) Gap-to-Workstream Mapping (A-H)

- Gap A (No Compliance Enforcement Engine) -> Workstream WS-CEE
- Gap B (Non-Immutable Audit Log) -> Workstream WS-AUDIT
- Gap C (No Independent Document Repository) -> Workstream WS-IDR
- Gap D (Absent Consent Management) -> Workstream WS-CONSENT
- Gap E (No DLG Workflow Controls) -> Workstream WS-DLG
- Gap F (Weak Escrow Monitoring) -> Workstream WS-ESCROW
- Gap G (No Independent NBFC Access Layer) -> Workstream WS-NBFC
- Gap H (Incomplete API Integration Architecture) -> Workstream WS-API

## 5) Program Structure

### 5.1 Workstreams

- WS-ARCH: Target architecture and service boundaries.
- WS-CEE: Compliance Enforcement Engine and hard gates.
- WS-CONSENT: Consent capture, storage, revocation, validation.
- WS-KFS: KFS generation, delivery proof, cooling-off orchestration.
- WS-IDR: Independent Document Repository with WORM + TSA.
- WS-AUDIT: Immutable audit engine and evidence exports.
- WS-API: External integrations and fallback/error architecture.
- WS-KYC: CKYC/Aadhaar/PAN/MCA21 and identity controls.
- WS-GST: GSTN validation and duplicate invoice checks.
- WS-EPC: EPC confirmation with digital signatures.
- WS-DOC: OCR + document validation + fraud detection.
- WS-ESCROW: Escrow/NPCI monitoring and reconciliation.
- WS-NBFC: Independent NBFC dashboard and APIs.
- WS-SEC: RBAC, segregation, encryption, mTLS, key/secrets lifecycle.
- WS-SRE: Reliability, observability, DR/BCP, SLA operations.
- WS-PRODUCT: Regulatory communication, UX compliance, RIA governance.

### 5.2 Milestone Gates

- Gate G0 (Week 2): Architecture and control blueprint approved.
- Gate G1 (Week 12): Minimum NBFC-ready controls live and certified.
- Gate G2 (Week 28): Compliance maturity stack complete and walkthrough passed.
- Gate G3 (Week 52): Scale, security certification, inspection readiness achieved.

## 6) Phase 1 - Minimum NBFC-Ready State (Weeks 1-12)

## 6.1 Phase Goal

Deliver the minimum enforceable compliance architecture before onboarding any NBFC.

## 6.2 Mandatory Outcomes (From Diagnostic)

1. Independent Document Repository live (WORM + TSA + NBFC direct credentials).
2. Consent Management System live (purpose-specific capture and revocation).
3. KFS generation and delivery proof live in RBI-compliant format.
4. Cooling-off enforcement as hard workflow stop.
5. Bank account verification integrated for disbursement routing.
6. Audit Trail Engine live with hash-chain and first TSA anchors.
7. Independent NBFC Access Dashboard live.
8. DLG direct-disbursement routing validation enforced.
9. CKYC/PAN/Aadhaar integrations live in KYC module.
10. CEE gate checks for KFS/cooling-off/consent live.
11. Internal compliance walkthrough and CTO sign-off completed.

## 6.3 Detailed Backlog (By Sprint)

### Sprint 1 (Weeks 1-2): Foundation and control architecture

- P1-ARCH-01: Define service boundaries for GRYLINK Core services.
- P1-ARCH-02: Finalize event taxonomy for end-to-end audit logging.
- P1-ARCH-03: Define authoritative state machine and transition contract.
- P1-SEC-01: Define identity domains (Borrower/NBFC/Gryork/Admin).
- P1-SEC-02: Secrets vault baseline, certificate policy, key rotation schedules.
- P1-SRE-01: Environments separation policy (dev/stage/prod), deployment approvals.
- P1-PROD-01: Regulatory communication templates and content governance model.

Acceptance criteria:
- Architecture decision records approved.
- Transition catalog includes all regulated steps.
- No direct state mutation path bypassing orchestrator.

### Sprint 2 (Weeks 3-4): CEE + Consent + KFS foundations

- P1-CEE-01: Implement CEE as mandatory pre-transition gate service.
- P1-CEE-02: Enforce consent validity check before any cross-context data transfer.
- P1-CEE-03: Implement direct-disbursement account validation gate.
- P1-CEE-04: Implement fee-separation disbursement amount check.
- P1-CMS-01: Purpose-specific consent schema with timestamp, IP, device/session.
- P1-CMS-02: Consent revocation API with immediate effect.
- P1-KFS-01: KFS template engine per RBI-required fields.
- P1-KFS-02: Delivery proof ingestion (email/SMS/in-app acknowledgement).

Acceptance criteria:
- Disbursement cannot proceed when consent/KFS/cooling-off gates fail.
- Consent revocation instantly blocks future sharing for that purpose.
- KFS payload completeness validation implemented.

### Sprint 3 (Weeks 5-6): IDR + Audit core

- P1-IDR-01: Stand up independent IDR infra domain, auth, metadata store.
- P1-IDR-02: Enable WORM policy and immutable retention controls.
- P1-IDR-03: Implement document SHA-256 fingerprinting pipeline.
- P1-IDR-04: Integrate TSA RFC 3161 timestamp token generation at upload.
- P1-IDR-05: NBFC credentialed read APIs independent of Gryork auth.
- P1-IDR-06: Enforce minimum 8-year retention policy with lifecycle controls.
- P1-IDR-07: Implement indexed retrieval and delivery workflow to meet <=30-minute NBFC access SLA.
- P1-AUD-01: Hash-chain append-only event store.
- P1-AUD-02: TSA anchoring job for audit batches.
- P1-AUD-03: Event integrity verifier tool (chain + TSA checks).
- P1-AUD-04: Implement retention/search/archive policy enabling <=48-hour retrieval across retention window.

Acceptance criteria:
- Document modification/delete attempts are blocked and audited.
- NBFC can retrieve documents directly without Gryork admin involvement.
- Audit chain verification passes end-to-end test.
- IDR retention, retrieval, and access SLAs validated in controlled test runs.

### Sprint 4 (Weeks 7-8): KYC and mandatory API integrations

- P1-KYC-01: CKYC integration with consent checks and refresh logic.
- P1-KYC-02: Aadhaar authentication integration (masked storage only).
- P1-KYC-03: PAN verification integration and mismatch handling.
- P1-KYC-04: KYC signed result record pushed to IDR.
- P1-API-01: Bank account verification integration and verified-account registry.
- P1-API-02: API circuit breaker, timeout/retry, fallback state framework.
- P1-API-03: API request/response metadata logging to audit engine.

Acceptance criteria:
- Raw PII responses not persisted in plain logs.
- All integration failures create auditable fallback states.
- Verified account registry used by CEE disbursement gate.

### Sprint 5 (Weeks 9-10): NBFC independent access and DLG enforcement

- P1-NBFC-01: Launch independent NBFC dashboard auth and role model.
- P1-NBFC-02: Portfolio view, document fetch, event notifications.
- P1-DLG-01: Cooling-off countdown and immutable start trigger from KFS confirmation.
- P1-DLG-02: Exit request flow that hard-cancels disbursement path.
- P1-DLG-03: Disbursement routing proof record and signed compliance certificate.
- P1-DLG-04: CEE enforcement for KFS term mismatch vs disbursement payload.

Acceptance criteria:
- NBFC can perform core review actions without Gryork operator support.
- Any non-compliant disbursement instruction is blocked.
- Exit during cooling-off immediately transitions to cancellation state.

### Sprint 6 (Weeks 11-12): Hardening, walkthrough, certification

- P1-QA-01: Compliance regression suite for all CEE hard gates.
- P1-QA-02: Audit completeness validation against event taxonomy.
- P1-QA-03: IDR access SLA drill and failure-mode tests.
- P1-CTO-01: Internal compliance walkthrough with evidence pack.
- P1-CTO-02: CTO readiness certification for minimum NBFC onboarding state.

Evidence required at Gate G1:
- CEE pass/fail logs for controlled test scenarios.
- KFS delivery evidence and cooling-off enforcement logs.
- Consent lifecycle evidence (capture/revoke/deny).
- IDR independent access demonstration logs.
- Audit chain integrity verification report.

## 7) Phase 2 - Compliance Maturity (Weeks 13-28)

## 7.1 Phase Goal

Complete full regulated operating capabilities required for scaled NBFC due diligence.

## 7.2 Mandatory Outcomes (From Diagnostic)

1. Account Aggregator consent-gated integration.
2. Credit bureau integrations with consent gate enforcement.
3. GSTN validation with duplicate detection.
4. EPC confirmation engine with digital signatures.
5. CERSAI search/registration integration.
6. Document Validation Engine (OCR + cross-reference).
7. Fraud Rule Engine with escalation workflows.
8. MCA21 entity verification integration.
9. Escrow Monitoring Engine with real-time reconciliation.
10. Field-level PII encryption and mTLS rollout.
11. Quarterly internal audit review process operational.
12. First full NBFC compliance walkthrough completed.

## 7.3 Detailed Backlog (By Capability Track)

### Track A: Integration completion and reliability

- P2-API-01: Implement Account Aggregator data pull and consent linkage.
- P2-API-02: Integrate CIBIL/Equifax/CRIF with stage-gated triggers.
- P2-API-03: Integrate GSTN APIs and invoice cross-match checks.
- P2-API-04: Integrate MCA21 entity/charge lookup and refresh policy.
- P2-API-05: Integrate CERSAI pre-decision search and post-sanction registration.
- P2-API-06: Expand e-sign/DSC/eStamp service orchestration.
- P2-API-07: Standardize integration telemetry, error classes, and operational dashboards.

Acceptance criteria:
- Each API has success, timeout, malformed, and partial-data test coverage.
- All API output artifacts are traceable in audit + IDR references.

### Track B: Document, fraud, and underwriting quality

- P2-DOC-01: OCR extraction pipeline for invoices/certificates/statements.
- P2-DOC-02: Data consistency rules (GSTIN, dates, amounts, entity links).
- P2-DOC-03: Fraud Rules Engine with anomaly scoring and escalation queues.
- P2-DOC-04: Duplicate invoice detection within Gryork platform context.
- P2-EPC-01: EPC confirmation workflow with legally valid digital signatures.

Acceptance criteria:
- Document acceptance requires validation report artifact.
- Fraud flags generate traceable workflow states and escalation events.

### Track C: Escrow integrity and NBFC transparency

- P2-ESC-01: Integrate escrow/bank/NPCI webhooks for debit/credit events.
- P2-ESC-02: Matching engine vs expected transaction schedule.
- P2-ESC-03: Unmatched/late transaction alerts to NBFC and Gryork ops.
- P2-ESC-04: Daily reconciliation report generation and IDR archival.
- P2-NBFC-01: NBFC dashboard expansion for escrow views and compliance reports.

Acceptance criteria:
- NBFC can independently download daily reconciliations from IDR.
- Alerting SLOs defined and monitored for transaction mismatch events.

### Track D: Security and governance maturity

- P2-SEC-01: Field-level encryption rollout for Aadhaar/PAN/account/mobile PII.
- P2-SEC-02: mTLS between internal microservices.
- P2-SEC-03: RBAC hardening with least privilege and privileged action approvals.
- P2-SEC-04: Consent gate enforced in all cross-context data access paths.
- P2-GOV-01: Quarterly internal audit process (engineering + compliance + ops).

Acceptance criteria:
- No unencrypted PII fields in primary stores.
- Inter-service traffic without mTLS is blocked.
- Privilege escalation is dual-authorized and fully audited.

### Track E: Controlled readiness and assurance

- P2-QA-01: End-to-end compliance test harness across full loan lifecycle.
- P2-QA-02: Failure-injection tests for API/provider outages.
- P2-QA-03: First NBFC compliance walkthrough with evidence closure.

Evidence required at Gate G2:
- API integration conformance matrix and failover test results.
- Escrow reconciliation completeness metrics.
- Security control verification (field encryption + mTLS + RBAC).
- Internal audit report and closure logs.

## 8) Phase 3 - Scale Infrastructure (Weeks 29-52)

## 8.1 Phase Goal

Scale from compliant platform to inspection-ready, high-resilience, multi-NBFC infrastructure.

## 8.2 Mandatory Outcomes (From Diagnostic)

1. Video KYC for high-value/non-OTP scenarios.
2. Multi-NBFC portfolio segregation and controls.
3. Advanced ML fraud detection with retraining pipeline.
4. Automated RBI-format regulatory reporting.
5. Cross-region DR for IDR and Audit with tested recovery.
6. ISO 27001 certification completion.
7. Rate limiting, DDoS protection, and WAF on external endpoints.
8. Borrower consent dashboard with full history and revocation.
9. Portfolio-level risk analytics for NBFC credit committees.
10. Bug bounty and external penetration testing.
11. Certified BCP/DR procedures.
12. RBI inspection readiness evidence pack complete.

## 8.3 Detailed Backlog (By Quarter)

### Q3 (Weeks 29-40): Scale capability build-out

- P3-KYC-01: Video KYC orchestration and evidence retention.
- P3-NBFC-01: Tenant-aware, fully segregated multi-NBFC architecture.
- P3-DOC-01: ML fraud model pipeline with drift detection/retraining.
- P3-REP-01: Automated regulatory report generator (RBI-aligned formats).
- P3-SEC-01: Edge security stack (WAF, DDoS controls, API rate limits).
- P3-CONSENT-01: Borrower self-service consent dashboard.
- P3-ANALYTICS-01: NBFC portfolio risk insights and committee views.

Acceptance criteria:
- Multi-tenant segregation tests pass for data and access boundaries.
- Regulatory reports are reproducible and audit-linked.
- Fraud model retraining events are logged and reviewable.

### Q4 (Weeks 41-52): Resilience, certification, and inspection readiness

- P3-SRE-01: Cross-region replication for IDR and audit stores.
- P3-SRE-02: DR drills with RTO/RPO measurement and remediation.
- P3-GRC-01: ISO 27001 control implementation and certification audit.
- P3-GRC-02: Bug bounty launch and external penetration test remediation.
- P3-GRC-03: BCP/DR documentation finalization and sign-offs.
- P3-CTO-01: RBI inspection evidence pack assembly and dry-run review.

Acceptance criteria:
- DR test results meet target RTO/RPO commitments.
- External assessment findings closed or risk-accepted via governance.
- Inspection package includes traceable evidence for all mandatory controls.

Evidence required at Gate G3:
- ISO 27001 certification artifacts.
- DR and failover evidence.
- Pen-test and bug bounty closure report.
- End-to-end compliance evidence index for regulator/NBFC review.

## 9) External API Integration Plan (From Section 6)

## 9.1 API Catalog and Trigger Points

- GST/GSTN API: invoice submission and pre-committee re-validation.
- CKYC Registry: onboarding and 12-month refresh.
- UIDAI Aadhaar Auth: individual KYC and threshold-based requirements.
- NSDL PAN Verify: onboarding, pre-assessment, pre-execution checks.
- Account Aggregator: post-credit-assessment consented data pull.
- Credit Bureau (CIBIL/Equifax/CRIF): post-KYC and consented pre-sanction checks.
- MCA21: entity onboarding and pre-disbursement refresh.
- CERSAI: pre-decision search and post-execution registration.
- E-Sign/DSC/eStamp: KFS/loan/consent execution events.
- TSA (RFC 3161): document upload and audit batch anchoring.
- Bank Account Verify: onboarding and mandatory disbursement routing validation.
- Escrow/NPCI APIs: pre-disbursement and continuous reconciliation events.
- OCR/Document AI: document ingestion and lifecycle validation.
- Fraud Detection Engine: KYC/doc/data inconsistency events.

## 9.2 Integration Engineering Standards (Mandatory)

- Credentials only in secrets vault; never in source code or committed env files.
- Certificate-based auth where possible; shared secrets rotate <= 90 days.
- Circuit breakers, retries, timeout budgets, and explicit fallback states.
- Full audit records for request metadata, response status, trigger context, and timestamps.
- PII-safe logging and encrypted partition storage.
- Test suites: success, provider error, timeout, malformed response, partial-data handling.

## 10) Team-Wise Responsibilities (From Section 14)

## 10.1 Backend Engineering

- Enforce authN/authZ/input validation/audit logging/error discipline on all endpoints.
- Keep workflow orchestrator as sole state-transition authority.
- Ensure no silent failures on external API errors.
- Implement schema-level data sovereignty and field-level PII encryption.

## 10.2 Frontend/Mobile

- Build plain-language consent UX with symmetric accept/reject paths.
- Ensure KFS disclosure readability and delivery acknowledgement integrity.
- Display cooling-off countdown and accessible exit actions.
- Emit frontend action events for critical NBFC and borrower actions.

## 10.3 DevOps/Infrastructure

- Enforce strict environment isolation and production deployment approvals.
- Deploy dedicated infra domains for IDR and Audit engines.
- Maintain 99.99% reliability posture for compliance-critical components.
- Operate secrets management, monitoring, alerting, and DR drills.

## 10.4 Product

- Run Regulatory Impact Assessment for every feature.
- Prioritize compliance controls above UX enhancements when conflict exists.
- Co-own regulated borrower communications with compliance sign-off.
- Treat KFS/consent/cooling-off messages as controlled regulatory artifacts.

## 11) Definition of Done (DoD) for Regulated Features

A feature is complete only when all are true:

1. Functional behavior implemented and validated.
2. Compliance gate logic encoded and passing required checks.
3. Audit events emitted with required identity/session/context fields.
4. Artifacts persisted to IDR/audit references where required.
5. Security controls (RBAC, encryption, consent gate) verified.
6. Failure modes tested with auditable fallback behavior.
7. Monitoring and alerting configured with ownership.
8. Compliance and product sign-off captured for regulated user communication changes.

## 12) Program Risk Register and Mitigations

- Risk: Delayed external API onboarding.
  - Mitigation: Sandbox-first integration, provider SLAs, fallback manual-review queues with audit coverage.

- Risk: Partial compliance implementation mistaken as ready state.
  - Mitigation: Hard gate checklists for G1/G2/G3 and CTO written certifications.

- Risk: Data leakage via logs or cross-context queries.
  - Mitigation: PII redaction pipeline, field-level encryption, consent-guarded data access middleware.

- Risk: IDR/Audit availability gaps undermine trust.
  - Mitigation: Dedicated infra, independent auth, cross-region replication, regular failover tests.

- Risk: Team drift from regulated build practices.
  - Mitigation: Section-14-aligned engineering standards baked into PR checks, release gates, and architecture review.

## 13) Readiness Gate Checklists

## 13.1 Gate G1 (Week 12) - NBFC Onboarding Eligibility

Must be live and validated:
- CEE
- CMS
- KFS + Cooling-off enforcement
- IDR with NBFC direct access
- Audit hash-chain + TSA anchors
- Independent NBFC dashboard
- Critical APIs: KYC, bank verification, e-sign
- CTO certification and internal walkthrough evidence

## 13.2 Gate G2 (Week 28) - Compliance Maturity

Must be live and validated:
- AA, bureau, GSTN, MCA21, CERSAI
- Document validation + fraud rules
- Escrow monitoring + daily reconciliation
- Field-level encryption + mTLS + RBAC hardening
- Quarterly internal audit operation
- First full NBFC walkthrough closure

## 13.3 Gate G3 (Week 52) - Scale and Inspection Readiness

Must be live and validated:
- Video KYC
- Multi-NBFC segregation
- Advanced ML fraud and retraining governance
- Automated RBI-format reporting
- DR/BCP and cross-region resilience
- ISO 27001 certification
- WAF/DDoS/rate limiting controls
- Pen-test and bug bounty closure
- Full regulator-ready evidence pack

## 14) Immediate Execution Plan (Next 14 Days)

1. Approve architecture and control blueprint (WS-ARCH, WS-SEC, WS-CEE).
2. Freeze authoritative workflow state machine and transition gate contract.
3. Create compliance event taxonomy and evidence index schema.
4. Stand up IDR and audit infrastructure foundations in staging.
5. Implement first CEE gate bundle (consent + KFS + cooling-off placeholders).
6. Start KYC integration adapters (CKYC/PAN/Aadhaar) with audit wrappers.
7. Define CTO readiness dashboard with Gate G1 criteria status.

## 15) Final Instruction

If any design choice creates ambiguity between speed and compliance, choose the stricter compliance path and escalate to compliance review before implementation.
