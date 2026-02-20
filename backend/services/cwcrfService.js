const CwcRf = require("../models/CwcRf");
const SubContractor = require("../models/SubContractor");
const Company = require("../models/Company");
const Bill = require("../models/Bill");
const Case = require("../models/Case");
const Nbfc = require("../models/Nbfc");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const emailService = require("./emailService");

/**
 * CWCRF Service - Handles all CWC Request Form operations
 * Based on Gryork Platform Workflow Document
 */
class CwcRfService {
  /**
   * Create a new CWCRF submission (Seller workflow - Phase 2, Step 5)
   */
  async submitCwcRf(userId, subContractorId, data) {
    const subContractor = await SubContractor.findById(subContractorId);
    if (!subContractor) {
      throw new Error("Sub-contractor not found");
    }

    // Hard Gate: Check KYC completion (Workflow Step 3)
    if (subContractor.kycStatus !== "COMPLETED") {
      throw new Error("KYC must be completed before submitting CWCRF");
    }

    // Hard Gate: Check Seller Declaration (Workflow Step 4)
    if (!subContractor.sellerDeclaration?.accepted) {
      throw new Error(
        "Seller declaration must be accepted before submitting CWCRF",
      );
    }

    // Validate bill exists and is verified
    const bill = await Bill.findById(data.billId);
    if (!bill) {
      throw new Error("Bill not found");
    }
    if (bill.status !== "EPC_VERIFIED" && bill.status !== "VERIFIED") {
      throw new Error(
        "Bill must be verified by ops and EPC before CWC request",
      );
    }

    // Get buyer (EPC) details
    const buyer = await Company.findById(
      data.buyerDetails?.buyerId || bill.companyId,
    );
    if (!buyer || buyer.status !== "ACTIVE") {
      throw new Error("Buyer must be an active Gryork partner");
    }

    const cwcRf = new CwcRf({
      subContractorId,
      userId,
      billId: data.billId,
      epcId: buyer._id,

      // Section A: Buyer & Project Details
      buyerDetails: {
        buyerId: buyer._id,
        buyerName: buyer.companyName,
        projectName: data.buyerDetails?.projectName || "",
        projectLocation: data.buyerDetails?.projectLocation || "",
      },

      // Section B: Invoice Details
      invoiceDetails: {
        invoiceNumber: data.invoiceDetails?.invoiceNumber || bill.billNumber,
        invoiceDate: data.invoiceDetails?.invoiceDate || bill.createdAt,
        invoiceAmount: data.invoiceDetails?.invoiceAmount || bill.amount,
        expectedPaymentDate: data.invoiceDetails?.expectedPaymentDate,
        workDescription:
          data.invoiceDetails?.workDescription || bill.description,
        purchaseOrderNumber: data.invoiceDetails?.purchaseOrderNumber,
        purchaseOrderDate: data.invoiceDetails?.purchaseOrderDate,
        workCompletionDate: data.invoiceDetails?.workCompletionDate,
        gstAmount: data.invoiceDetails?.gstAmount,
        netInvoiceAmount: data.invoiceDetails?.netInvoiceAmount,
      },

      // Section C: CWC Request
      cwcRequest: {
        invoiceAmount: data.invoiceDetails?.invoiceAmount || bill.amount,
        requestedAmount: data.cwcRequest?.requestedAmount,
        requestedTenure: data.cwcRequest?.requestedTenure,
        urgencyLevel: data.cwcRequest?.urgencyLevel || 'NORMAL',
        reasonForFunding: data.cwcRequest?.reasonForFunding,
        preferredDisbursementDate: data.cwcRequest?.preferredDisbursementDate,
        collateralOffered: data.cwcRequest?.collateralOffered,
        existingLoanDetails: data.cwcRequest?.existingLoanDetails,
      },

      // Section D: Interest Rate Preference
      interestPreference: {
        preferenceType: data.interestPreference?.preferenceType || "RANGE",
        minRate: data.interestPreference?.minRate,
        maxRate: data.interestPreference?.maxRate,
        maxAcceptableRate: data.interestPreference?.maxAcceptableRate,
        preferredRepaymentFrequency: data.interestPreference?.preferredRepaymentFrequency || 'ONE_TIME',
        processingFeeAcceptance: data.interestPreference?.processingFeeAcceptance ?? true,
        maxProcessingFeePercent: data.interestPreference?.maxProcessingFeePercent,
        prepaymentPreference: data.interestPreference?.prepaymentPreference || 'WITHOUT_PENALTY',
      },

      // Copy seller declaration
      sellerDeclaration: subContractor.sellerDeclaration,

      status: "SUBMITTED",
      platformFeePaid: data.platformFeePaid || false,
      paymentReference: data.paymentReference,
    });

    // Add to status history
    cwcRf.statusHistory.push({
      status: "SUBMITTED",
      changedBy: userId,
      notes: "CWCRF submitted by seller",
    });

    await cwcRf.save();

    // Notify Ops about new CWCRF submission
    this._notifyOpsTeam("New CWCRF Submitted", `CWCRF ${cwcRf.cwcRfNumber || cwcRf._id} has been submitted and needs review.`);

    return cwcRf;
  }

  /**
   * Get CWCRF by ID with populated references
   */
  async getCwcRfById(id) {
    return CwcRf.findById(id)
      .populate("subContractorId")
      .populate("epcId")
      .populate("billId")
      .populate("buyerDetails.buyerId")
      .populate("nbfcQuotations.nbfcId")
      .populate("selectedNbfc.nbfcId");
  }

  /**
   * Get all CWCRFs for a sub-contractor
   */
  async getCwcRfsForSubContractor(subContractorId) {
    return CwcRf.find({ subContractorId })
      .populate("epcId", "companyName")
      .populate("billId", "billNumber amount")
      .sort({ createdAt: -1 });
  }

  /**
   * Get CWCRFs pending buyer verification (EPC workflow)
   */
  async getPendingBuyerVerification(epcId) {
    return CwcRf.find({
      "buyerDetails.buyerId": epcId,
      status: {
        $in: ["SUBMITTED", "KYC_COMPLETED", "BUYER_VERIFICATION_PENDING"],
      },
    })
      .populate("subContractorId", "companyName ownerName")
      .populate("billId", "billNumber amount")
      .sort({ createdAt: -1 });
  }

  /**
   * Get CWCRFs for Ops review queue
   * Phase 6: SUBMITTED + OPS_REVIEW  (initial Ops review)
   * Phase 8: RMT_APPROVED           (Ops risk triage after RMT)
   */
  async getCwcRfsForOps(query = {}) {
    const filter = {
      status: { $in: ["SUBMITTED", "OPS_REVIEW", "RMT_APPROVED"] },
    };
    if (query.status) filter.status = query.status;
    if (query.phase === "triage") filter.status = { $in: ["RMT_APPROVED"] };
    if (query.phase === "epc_verified") filter.status = { $in: ["BUYER_APPROVED", "CWCAF_READY", "SHARED_WITH_NBFC"] };

    return CwcRf.find(filter)
      .populate("subContractorId", "companyName ownerName")
      .populate("epcId", "companyName")
      .populate("billId", "billNumber amount")
      .sort({ createdAt: -1 });
  }

  /**
   * Ops verifies individual CWCRF section (Phase 6.2 super access)
   * section: 'sectionA' | 'sectionB' | 'sectionC' | 'sectionD' | 'raBill' | 'wcc' | 'measurementSheet'
   */
  async opsVerifySection(cwcRfId, userId, { section, verified, notes }) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");

    if (!cwcRf.opsVerification) cwcRf.opsVerification = {};

    const sectionMap = {
      sectionA: 'sectionA',
      sectionB: 'sectionB',
      sectionC: 'sectionC',
      sectionD: 'sectionD',
      raBill: null,
      wcc: null,
      measurementSheet: null,
    };

    if (!Object.keys(sectionMap).includes(section)) {
      throw new Error(`Invalid section: ${section}`);
    }

    if (['sectionA', 'sectionB', 'sectionC', 'sectionD'].includes(section)) {
      cwcRf.opsVerification[section] = { verified, notes, verifiedBy: userId, verifiedAt: new Date() };
    } else if (section === 'raBill') {
      cwcRf.opsVerification.raBillVerified = verified;
    } else if (section === 'wcc') {
      cwcRf.opsVerification.wccVerified = verified;
    } else if (section === 'measurementSheet') {
      cwcRf.opsVerification.measurementSheetVerified = verified;
    }

    // If all 4 sections verified, advance status to OPS_REVIEW
    const allSections = ['sectionA', 'sectionB', 'sectionC', 'sectionD'].every(
      (s) => cwcRf.opsVerification[s]?.verified
    );
    if (allSections && cwcRf.status === 'SUBMITTED') {
      cwcRf.status = 'OPS_REVIEW';
      cwcRf.statusHistory.push({ status: 'OPS_REVIEW', changedBy: userId, notes: 'All sections verified by Ops' });
    }

    await cwcRf.save();
    return cwcRf;
  }

  // ========================================
  // OPS SUPER ACCESS POWERS (Phase 6.2)
  // ========================================

  /**
   * Ops detaches a document or field, forcing SC to re-upload/re-fill
   */
  async opsDetachField(cwcRfId, userId, { section, field, reason }) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");

    // Validate section/field path exists
    const allowedSections = ['buyerDetails', 'invoiceDetails', 'cwcRequest', 'interestPreference'];
    if (!allowedSections.includes(section)) {
      throw new Error(`Invalid section: ${section}. Allowed: ${allowedSections.join(', ')}`);
    }

    // Record the detachment
    if (!cwcRf.opsDetachedFields) cwcRf.opsDetachedFields = [];
    cwcRf.opsDetachedFields.push({
      section,
      field,
      detachedBy: userId,
      detachedAt: new Date(),
      reason: reason || '',
      resolved: false,
    });

    // Clear the field value
    if (cwcRf[section] && field && cwcRf[section][field] !== undefined) {
      cwcRf[section][field] = undefined;
      cwcRf.markModified(section);
    }

    // If a section was verified, un-verify it
    const sectionKeyMap = {
      buyerDetails: 'sectionA',
      invoiceDetails: 'sectionB',
      cwcRequest: 'sectionC',
      interestPreference: 'sectionD',
    };
    const verifyKey = sectionKeyMap[section];
    if (verifyKey && cwcRf.opsVerification?.[verifyKey]?.verified) {
      cwcRf.opsVerification[verifyKey].verified = false;
      cwcRf.opsVerification[verifyKey].notes = `Detached: ${field} — ${reason}`;
      cwcRf.markModified('opsVerification');
    }

    // Set status to ACTION_REQUIRED so SC knows to fix
    if (cwcRf.status === 'SUBMITTED' || cwcRf.status === 'OPS_REVIEW') {
      cwcRf.status = 'ACTION_REQUIRED';
      cwcRf.statusHistory.push({
        status: 'ACTION_REQUIRED',
        changedBy: userId,
        notes: `Ops detached ${section}.${field}: ${reason}`,
      });
    }

    await cwcRf.save();
    return cwcRf;
  }

  /**
   * Ops directly edits a minor field with change log
   */
  async opsEditField(cwcRfId, userId, { section, field, newValue, reason }) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");

    const allowedSections = ['buyerDetails', 'invoiceDetails', 'cwcRequest', 'interestPreference'];
    if (!allowedSections.includes(section)) {
      throw new Error(`Invalid section: ${section}`);
    }

    if (!field || newValue === undefined) {
      throw new Error("field and newValue are required");
    }

    const oldValue = cwcRf[section]?.[field];

    // Record the edit
    if (!cwcRf.opsEditLog) cwcRf.opsEditLog = [];
    cwcRf.opsEditLog.push({
      section,
      field,
      oldValue,
      newValue,
      editedBy: userId,
      editedAt: new Date(),
      reason: reason || '',
    });

    // Apply the edit
    if (!cwcRf[section]) cwcRf[section] = {};
    cwcRf[section][field] = newValue;
    cwcRf.markModified(section);

    await cwcRf.save();
    return cwcRf;
  }

  /**
   * Ops sends a re-request message to SC via chat channel
   */
  async opsReRequest(cwcRfId, userId, { message, section }) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");

    if (!message || !message.trim()) {
      throw new Error("Message is required for re-request");
    }

    // Create a chat message of type action_required
    const chatMessage = new ChatMessage({
      cwcRfId: cwcRf._id,
      senderId: userId,
      senderRole: 'ops',
      messageType: 'action_required',
      content: message.trim(),
      actionType: 'REQUEST_DOCUMENT',
      actionResolved: false,
    });
    await chatMessage.save();

    // If status is SUBMITTED or OPS_REVIEW, move to ACTION_REQUIRED
    if (['SUBMITTED', 'OPS_REVIEW'].includes(cwcRf.status)) {
      cwcRf.status = 'ACTION_REQUIRED';
      cwcRf.statusHistory.push({
        status: 'ACTION_REQUIRED',
        changedBy: userId,
        notes: `Ops re-request: ${section ? `[${section}] ` : ''}${message.trim().substring(0, 100)}`,
      });
      await cwcRf.save();
    }

    return { cwcRf, chatMessage };
  }

  /**
   * RMT forwards completed risk assessment to Ops (Phase 7.5)
   */
  async rmtForwardToOps(cwcRfId, rmtUserId, data) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");

    if (!['UNDER_RISK_REVIEW', 'CWCAF_READY'].includes(cwcRf.status)) {
      throw new Error("CWCRF must be under risk review or have CWCAF ready");
    }

    cwcRf.status = "RMT_APPROVED";
    cwcRf.statusHistory.push({
      status: "RMT_APPROVED",
      changedBy: rmtUserId,
      notes: data?.notes || "RMT assessment complete — forwarded to Ops for risk triage",
    });

    await cwcRf.save();
    return cwcRf;
  }

  /**
   * Ops risk triage after RMT review (Phase 8)
   * action: 'forward_to_epc' | 'reject'
   */
  async opsTriage(cwcRfId, opsUserId, { action, notes }) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");

    if (cwcRf.status !== "RMT_APPROVED") {
      throw new Error("CWCRF must be in RMT_APPROVED status for triage");
    }

    if (action === "forward_to_epc") {
      cwcRf.status = "BUYER_VERIFICATION_PENDING";
      cwcRf.statusHistory.push({
        status: "BUYER_VERIFICATION_PENDING",
        changedBy: opsUserId,
        notes: notes || "Ops triaged — forwarded to EPC for buyer verification",
      });
    } else if (action === "reject") {
      cwcRf.status = "REJECTED";
      cwcRf.statusHistory.push({
        status: "REJECTED",
        changedBy: opsUserId,
        notes: notes || "Ops rejected after risk triage",
      });
    }

    await cwcRf.save();

    // Notify EPC about buyer verification request
    if (action === "forward_to_epc") {
      this._notifyEpc(cwcRf, "A CWCRF requires your buyer verification");
    }
    // Notify SC about rejection
    if (action === "reject") {
      this._notifyStatusChange(cwcRf, "REJECTED", notes || "Your CWCRF was rejected after risk triage");
    }

    return cwcRf;
  }

  /**
   * Get eligible NBFCs for a CWCRF (Phase 10.2)
   * Filters by LPS: risk appetite, ticket size, tenure, sector, monthly capacity
   */
  async getMatchingNbfcs(cwcRfId) {
    const cwcRf = await this.getCwcRfById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");

    const requestedAmount = cwcRf.buyerVerification?.approvedAmount || cwcRf.cwcRequest?.requestedAmount || 0;
    const tenure = cwcRf.buyerVerification?.repaymentTimeline || cwcRf.cwcRequest?.requestedTenure || 30;

    // Get risk category from CWCAF (via case) if available
    const caseDoc = cwcRf.caseId ? await Case.findById(cwcRf.caseId) : null;
    const riskCategory = caseDoc?.cwcaf?.riskCategory || "MEDIUM";

    const nbfcs = await Nbfc.find({ status: "ACTIVE", activeLendingStatus: true });

    const results = [];
    for (const nbfc of nbfcs) {
      const lps = nbfc.lendingPreferenceSheet;
      if (!lps) continue;

      let score = 0;
      let reasons = [];

      // Check ticket size
      const minTicket = lps.ticketSize?.minimum || 0;
      const maxTicket = lps.ticketSize?.maximum || Infinity;
      if (requestedAmount < minTicket || requestedAmount > maxTicket) { reasons.push('ticket_size'); continue; }
      score += 25;

      // Check risk appetite
      const accepted = lps.riskAppetite?.acceptedCategories || [];
      if (!accepted.includes(riskCategory)) { reasons.push('risk_appetite'); continue; }
      score += 25;

      // Check tenure
      const minDays = lps.tenurePreference?.minDays || 0;
      const maxDays = lps.tenurePreference?.maxDays || 365;
      if (tenure < minDays || tenure > maxDays) { reasons.push('tenure'); continue; }
      score += 25;

      // Check available monthly capacity
      const available = (lps.monthlyCapacity?.totalLimit || 0) - (lps.monthlyCapacity?.utilized || 0);
      if (available < requestedAmount) { reasons.push('capacity'); continue; }
      score += 25;

      results.push({
        nbfcId: nbfc._id,
        name: nbfc.name,
        companyName: nbfc.companyName,
        matchScore: score,
        lps: {
          interestRatePolicy: lps.interestRatePolicy,
          riskAppetite: { acceptedCategories: lps.riskAppetite?.acceptedCategories },
          ticketSize: lps.ticketSize,
          tenurePreference: lps.tenurePreference,
        },
      });
    }

    results.sort((a, b) => b.matchScore - a.matchScore);
    return { cwcRf, matchingNbfcs: results };
  }

  /**
   * EPC verifies CWCRF with A, B, C inputs (Workflow Section 5)
   */
  async verifyByBuyer(cwcRfId, userId, verificationData) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) {
      throw new Error("CWCRF not found");
    }

    // Validate all mandatory fields
    if (!verificationData.approvedAmount) {
      throw new Error("Approved CWC Amount (A) is mandatory");
    }
    if (!verificationData.repaymentTimeline) {
      throw new Error("Repayment Timeline (B) is mandatory");
    }
    if (!verificationData.repaymentArrangement?.source) {
      throw new Error("Repayment Arrangement Logic (C) is mandatory");
    }

    // Validate buyer declaration is accepted (Step 9.4)
    if (!verificationData.buyerDeclaration?.accepted) {
      throw new Error("Buyer declaration must be accepted before verifying");
    }

    // Update buyer verification
    cwcRf.buyerVerification = {
      approvedAmount: verificationData.approvedAmount,
      repaymentTimeline: verificationData.repaymentTimeline,
      repaymentArrangement: {
        source: verificationData.repaymentArrangement.source,
        otherDetails: verificationData.repaymentArrangement.otherDetails,
        remarks: verificationData.repaymentArrangement.remarks,
      },
      buyerDeclaration: {
        accepted: true,
        acceptedAt: new Date(),
      },
      notes: verificationData.notes,
      verifiedBy: userId,
      verifiedAt: new Date(),
    };

    cwcRf.status = "BUYER_APPROVED";
    cwcRf.statusHistory.push({
      status: "BUYER_APPROVED",
      changedBy: userId,
      notes: `Buyer approved CWC amount: ₹${verificationData.approvedAmount}, Timeline: ${verificationData.repaymentTimeline} days`,
    });

    await cwcRf.save();
    return cwcRf;
  }

  /**
   * EPC rejects CWCRF
   */
  async rejectByBuyer(cwcRfId, userId, reason) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) {
      throw new Error("CWCRF not found");
    }

    cwcRf.status = "BUYER_REJECTED";
    cwcRf.buyerVerification = {
      ...cwcRf.buyerVerification,
      verifiedBy: userId,
      verifiedAt: new Date(),
      rejectionReason: reason,
    };
    cwcRf.statusHistory.push({
      status: "BUYER_REJECTED",
      changedBy: userId,
      notes: `Buyer rejected: ${reason}`,
    });

    await cwcRf.save();
    return cwcRf;
  }

  /**
   * Move CWCRF to RMT queue (after buyer approval)
   */
  async moveToRmtQueue(cwcRfId, userId) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) {
      throw new Error("CWCRF not found");
    }

    if (cwcRf.status !== "BUYER_APPROVED") {
      throw new Error("CWCRF must be buyer-approved before moving to RMT");
    }

    cwcRf.status = "UNDER_RISK_REVIEW";
    cwcRf.statusHistory.push({
      status: "UNDER_RISK_REVIEW",
      changedBy: userId,
      notes: "Moved to RMT queue for risk analysis",
    });

    // Create a case if not exists
    if (!cwcRf.caseId) {
      const newCase = new Case({
        billId: cwcRf.billId,
        subContractorId: cwcRf.subContractorId,
        epcId: cwcRf.epcId,
        cwcRfId: cwcRf._id,
        status: "RMT_QUEUE",
        dealValue: cwcRf.buyerVerification?.approvedAmount,
      });
      await newCase.save();
      cwcRf.caseId = newCase._id;
    }

    await cwcRf.save();
    return cwcRf;
  }

  /**
   * Generate CWCAF from CWCRF (RMT workflow)
   */
  async generateCwcaf(cwcRfId, rmtUserId, riskAssessmentData) {
    const cwcRf = await this.getCwcRfById(cwcRfId);
    if (!cwcRf) {
      throw new Error("CWCRF not found");
    }

    // Get the associated case
    let caseDoc = await Case.findById(cwcRf.caseId);
    if (!caseDoc) {
      throw new Error("Case not found for this CWCRF");
    }

    const subContractor = cwcRf.subContractorId;

    // Build CWCAF structure
    caseDoc.cwcaf = {
      // 1. Seller Profile Summary
      sellerProfileSummary: {
        businessName: subContractor.companyName,
        constitutionType: subContractor.constitutionType,
        pan: subContractor.pan,
        gstin: subContractor.gstin,
        bankDetails: {
          bankName: subContractor.bankDetails?.bankName,
          accountNumber: subContractor.bankDetails?.accountNumber,
          ifsc: subContractor.bankDetails?.ifscCode,
        },
        kycStatus: subContractor.kycStatus,
        kycCompletedAt: subContractor.kycCompletedAt,
      },

      // 2. Buyer Approval Snapshot
      buyerApprovalSnapshot: {
        approvedCwcAmount: cwcRf.buyerVerification?.approvedAmount,
        repaymentTimeline: cwcRf.buyerVerification?.repaymentTimeline,
        repaymentArrangement: {
          source: cwcRf.buyerVerification?.repaymentArrangement?.source,
          remarks: cwcRf.buyerVerification?.repaymentArrangement?.remarks,
        },
        verifiedBy: cwcRf.buyerVerification?.verifiedBy?.name || "EPC User",
        verifiedAt: cwcRf.buyerVerification?.verifiedAt,
      },

      // 3. Invoice Details
      invoiceDetails: {
        invoiceNumber: cwcRf.invoiceDetails?.invoiceNumber,
        invoiceAmount: cwcRf.invoiceDetails?.invoiceAmount,
        invoiceDate: cwcRf.invoiceDetails?.invoiceDate,
        expectedPaymentDate: cwcRf.invoiceDetails?.expectedPaymentDate,
        workDescription: cwcRf.invoiceDetails?.workDescription,
        projectName: cwcRf.buyerDetails?.projectName,
        projectLocation: cwcRf.buyerDetails?.projectLocation,
      },

      // 4. Risk Assessment Details
      riskAssessmentDetails: riskAssessmentData?.details || {},

      // Risk Category (calculated)
      riskCategory: riskAssessmentData?.riskCategory || "MEDIUM",

      // 5. RMT Recommendation
      rmtRecommendation: {
        suggestedInterestRateMin: riskAssessmentData?.suggestedInterestRateMin,
        suggestedInterestRateMax: riskAssessmentData?.suggestedInterestRateMax,
        comments: riskAssessmentData?.comments,
        observations: riskAssessmentData?.observations || [],
        flaggedConcerns: riskAssessmentData?.flaggedConcerns || [],
      },

      // Generation metadata
      generatedAt: new Date(),
      generatedBy: rmtUserId,
    };

    caseDoc.status = "CWCAF_READY";
    caseDoc.statusHistory.push({
      status: "CWCAF_READY",
      changedBy: rmtUserId,
      notes: `CWCAF generated with risk category: ${riskAssessmentData?.riskCategory}`,
    });

    await caseDoc.save();

    // Update CWCRF status
    cwcRf.status = "CWCAF_READY";
    cwcRf.statusHistory.push({
      status: "CWCAF_READY",
      changedBy: rmtUserId,
      notes: "Risk analysis completed, CWCAF generated",
    });
    await cwcRf.save();

    return { cwcRf, case: caseDoc };
  }

  /**
   * Share CWCAF with matching NBFCs (based on LPS criteria)
   */
  async shareWithNbfcs(cwcRfId, rmtUserId) {
    const cwcRf = await this.getCwcRfById(cwcRfId);
    if (!cwcRf) {
      throw new Error("CWCRF not found");
    }

    const caseDoc = await Case.findById(cwcRf.caseId);
    if (!caseDoc || caseDoc.status !== "CWCAF_READY") {
      throw new Error("CWCAF must be ready before sharing with NBFCs");
    }

    // Find matching NBFCs based on LPS criteria
    const nbfcs = await Nbfc.find({
      status: "ACTIVE",
      activeLendingStatus: true,
    });

    const cwcafData = {
      riskCategory: caseDoc.cwcaf?.riskCategory,
      approvedAmount: cwcRf.buyerVerification?.approvedAmount,
      interestPreference: cwcRf.interestPreference,
    };

    const matchingNbfcs = [];
    const nbfcQuotations = [];

    for (const nbfc of nbfcs) {
      if (nbfc.matchesLps && nbfc.matchesLps(cwcafData)) {
        matchingNbfcs.push(nbfc._id);
        nbfcQuotations.push({
          nbfcId: nbfc._id,
          sharedAt: new Date(),
          status: "PENDING",
        });

        // Add to case nbfcSharing
        caseDoc.nbfcSharing.push({
          nbfc: nbfc._id,
          sharedAt: new Date(),
          sharedBy: rmtUserId,
          status: "PENDING",
        });
      }
    }

    if (matchingNbfcs.length === 0) {
      throw new Error("No NBFCs match the LPS criteria for this CWCAF");
    }

    // Update CWCRF
    cwcRf.nbfcQuotations = nbfcQuotations;
    cwcRf.status = "SHARED_WITH_NBFC";
    cwcRf.statusHistory.push({
      status: "SHARED_WITH_NBFC",
      changedBy: rmtUserId,
      notes: `Shared with ${matchingNbfcs.length} NBFCs`,
    });

    await cwcRf.save();

    // Update Case
    caseDoc.status = "SHARED_WITH_NBFC";
    caseDoc.statusHistory.push({
      status: "SHARED_WITH_NBFC",
      changedBy: rmtUserId,
      notes: `CWCAF shared with ${matchingNbfcs.length} NBFCs`,
    });

    await caseDoc.save();

    return { cwcRf, matchingNbfcs: matchingNbfcs.length };
  }

  /**
   * NBFC submits quotation (Workflow Section 6)
   */
  async submitNbfcQuotation(cwcRfId, nbfcId, userId, quotationData) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) {
      throw new Error("CWCRF not found");
    }

    // Find the NBFC's quotation entry
    const quotationIndex = cwcRf.nbfcQuotations.findIndex(
      (q) => q.nbfcId.toString() === nbfcId.toString(),
    );

    if (quotationIndex === -1) {
      throw new Error("CWCAF not shared with this NBFC");
    }

    // Update quotation
    cwcRf.nbfcQuotations[quotationIndex].quotation = {
      interestRate: quotationData.interestRate,
      tenure: quotationData.tenure,
      terms: quotationData.terms,
      remarks: quotationData.remarks,
    };
    cwcRf.nbfcQuotations[quotationIndex].quotedAt = new Date();
    cwcRf.nbfcQuotations[quotationIndex].status = "QUOTED";

    // Check if all NBFCs have responded
    const allQuoted = cwcRf.nbfcQuotations.every(
      (q) => q.status === "QUOTED" || q.status === "WITHDRAWN",
    );

    if (
      allQuoted ||
      cwcRf.nbfcQuotations.filter((q) => q.status === "QUOTED").length > 0
    ) {
      cwcRf.status = "QUOTES_RECEIVED";
    }

    await cwcRf.save();
    return cwcRf;
  }

  /**
   * Seller selects an NBFC (Workflow Step 10)
   */
  async selectNbfc(cwcRfId, userId, nbfcId) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) {
      throw new Error("CWCRF not found");
    }

    // Find the NBFC's quotation
    const quotation = cwcRf.nbfcQuotations.find(
      (q) => q.nbfcId.toString() === nbfcId.toString() && q.status === "QUOTED",
    );

    if (!quotation) {
      throw new Error("No quotation found from this NBFC");
    }

    // Mark selected NBFC
    cwcRf.selectedNbfc = {
      nbfcId,
      selectedAt: new Date(),
      finalInterestRate: quotation.quotation?.interestRate,
      finalTenure: quotation.quotation?.tenure,
    };

    // Update quotation statuses
    cwcRf.nbfcQuotations = cwcRf.nbfcQuotations.map((q) => ({
      ...q.toObject(),
      status:
        q.nbfcId.toString() === nbfcId.toString() ? "SELECTED" : "NOT_SELECTED",
    }));

    cwcRf.status = "NBFC_SELECTED";
    cwcRf.statusHistory.push({
      status: "NBFC_SELECTED",
      changedBy: userId,
      notes: `Seller selected NBFC for funding`,
    });

    await cwcRf.save();

    // Update associated case
    const caseDoc = await Case.findById(cwcRf.caseId);
    if (caseDoc) {
      caseDoc.selectedNbfc = nbfcId;
      caseDoc.status = "NBFC_SELECTED";
      caseDoc.statusHistory.push({
        status: "NBFC_SELECTED",
        changedBy: userId,
        notes: "Seller selected NBFC",
      });
      await caseDoc.save();
    }

    return cwcRf;
  }

  /**
   * Move to NBFC process (final handoff)
   */
  async moveToNbfcProcess(cwcRfId, userId) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) {
      throw new Error("CWCRF not found");
    }

    if (!cwcRf.selectedNbfc?.nbfcId) {
      throw new Error("No NBFC selected");
    }

    cwcRf.status = "MOVED_TO_NBFC_PROCESS";
    cwcRf.statusHistory.push({
      status: "MOVED_TO_NBFC_PROCESS",
      changedBy: userId,
      notes: "Handed off to NBFC for escrow and disbursal",
    });

    await cwcRf.save();

    // Update associated case
    const caseDoc = await Case.findById(cwcRf.caseId);
    if (caseDoc) {
      caseDoc.status = "MOVED_TO_NBFC_PROCESS";
      caseDoc.statusHistory.push({
        status: "MOVED_TO_NBFC_PROCESS",
        changedBy: userId,
        notes:
          "Moved to NBFC process for final verification, escrow setup, and disbursal",
      });
      await caseDoc.save();
    }

    // Update NBFC monthly capacity
    const nbfc = await Nbfc.findById(cwcRf.selectedNbfc.nbfcId);
    if (nbfc && nbfc.updateMonthlyCapacity) {
      await nbfc.updateMonthlyCapacity(cwcRf.buyerVerification?.approvedAmount);
    }

    return cwcRf;
  }

  /**
   * Get CWCRFs for RMT dashboard
   */
  async getCwcRfsForRmt(filters = {}) {
    const query = {};
    if (filters.status) {
      query.status = filters.status;
    } else {
      query.status = {
        $in: ["BUYER_APPROVED", "UNDER_RISK_REVIEW", "CWCAF_READY"],
      };
    }

    return CwcRf.find(query)
      .populate("subContractorId", "companyName ownerName pan gstin")
      .populate("epcId", "companyName")
      .populate("billId", "billNumber amount")
      .sort({ createdAt: -1 });
  }

  /**
   * Get CWCRFs for NBFC dashboard
   */
  async getCwcRfsForNbfc(nbfcId) {
    return CwcRf.find({
      "nbfcQuotations.nbfcId": nbfcId,
      status: {
        $in: [
          "SHARED_WITH_NBFC",
          "QUOTES_RECEIVED",
          "NBFC_SELECTED",
          "MOVED_TO_NBFC_PROCESS",
          "NBFC_DUE_DILIGENCE",
          "NBFC_SANCTIONED",
          "DISBURSEMENT_INITIATED",
          "DISBURSED",
        ],
      },
    })
      .populate("subContractorId", "companyName")
      .populate("epcId", "companyName")
      .populate("caseId")
      .sort({ createdAt: -1 });
  }

  // =========================================================
  // PHASE 5.3 — PLATFORM FEE PAYMENT
  // =========================================================

  /**
   * Record platform fee payment for a CWCRF (standalone endpoint).
   * Called when SC pays the ₹1,000 platform fee.
   */
  async recordPlatformFee(cwcRfId, userId, { paymentReference, amount }) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");
    if (cwcRf.platformFeePaid) throw new Error("Platform fee already recorded");

    cwcRf.platformFeePaid = true;
    cwcRf.paymentReference = paymentReference || `PAY-${Date.now()}`;
    cwcRf.platformFeeAmount = amount || 1000;
    cwcRf.statusHistory.push({
      status: cwcRf.status,
      changedBy: userId,
      notes: `Platform fee ₹${cwcRf.platformFeeAmount} paid. Ref: ${cwcRf.paymentReference}`,
    });
    await cwcRf.save();

    return cwcRf;
  }

  // =========================================================
  // PHASE 11.4 — NBFC POST-QUOTATION PROCESS
  // =========================================================

  /**
   * NBFC starts due diligence on a CWCRF they were selected for.
   */
  async nbfcStartDueDiligence(cwcRfId, nbfcUserId) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");

    if (!["MOVED_TO_NBFC_PROCESS", "NBFC_SELECTED"].includes(cwcRf.status)) {
      throw new Error("CWCRF must be in MOVED_TO_NBFC_PROCESS or NBFC_SELECTED status");
    }

    cwcRf.status = "NBFC_DUE_DILIGENCE";
    if (!cwcRf.nbfcProcess) cwcRf.nbfcProcess = {};
    cwcRf.nbfcProcess.dueDiligence = {
      ...(cwcRf.nbfcProcess.dueDiligence || {}),
      started: true,
      startedAt: new Date(),
      checklist: {
        kycVerified: false,
        bankStatementReviewed: false,
        invoiceAuthenticated: false,
        epcConfirmationReceived: false,
        creditScoreChecked: false,
        collateralAssessed: false,
      },
    };
    cwcRf.statusHistory.push({
      status: "NBFC_DUE_DILIGENCE",
      changedBy: nbfcUserId,
      notes: "NBFC started due diligence process",
    });
    cwcRf.markModified("nbfcProcess");
    await cwcRf.save();

    // Notify SC that due diligence has started
    await this._notifyStatusChange(cwcRf, "NBFC_DUE_DILIGENCE", "NBFC has started due diligence on your CWCRF");

    return cwcRf;
  }

  /**
   * NBFC completes due diligence — approve, reject, or mark conditional.
   */
  async nbfcCompleteDueDiligence(cwcRfId, nbfcUserId, data) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");
    if (cwcRf.status !== "NBFC_DUE_DILIGENCE") throw new Error("CWCRF is not in due diligence");

    const { result, checklist, notes, conditions } = data;
    if (!["APPROVED", "REJECTED", "CONDITIONAL"].includes(result)) {
      throw new Error("result must be APPROVED, REJECTED, or CONDITIONAL");
    }

    if (!cwcRf.nbfcProcess) cwcRf.nbfcProcess = {};
    cwcRf.nbfcProcess.dueDiligence = {
      ...cwcRf.nbfcProcess.dueDiligence,
      checklist: checklist || cwcRf.nbfcProcess.dueDiligence?.checklist || {},
      notes: notes || "",
      completedAt: new Date(),
      completedBy: nbfcUserId,
      result,
      conditions: conditions || "",
    };

    if (result === "REJECTED") {
      cwcRf.status = "REJECTED";
      cwcRf.statusHistory.push({
        status: "REJECTED",
        changedBy: nbfcUserId,
        notes: `NBFC due diligence rejected. ${notes || ""}`,
      });
    } else {
      // APPROVED or CONDITIONAL — keep status, NBFC can now issue sanction
      cwcRf.statusHistory.push({
        status: "NBFC_DUE_DILIGENCE",
        changedBy: nbfcUserId,
        notes: `Due diligence completed: ${result}. ${notes || ""}`,
      });
    }

    cwcRf.markModified("nbfcProcess");
    await cwcRf.save();

    await this._notifyStatusChange(cwcRf, result === "REJECTED" ? "REJECTED" : "DUE_DILIGENCE_COMPLETE",
      result === "REJECTED" ? "NBFC due diligence was not successful" : "Due diligence completed successfully");

    return cwcRf;
  }

  /**
   * NBFC issues a sanction letter.
   */
  async nbfcIssueSanctionLetter(cwcRfId, nbfcUserId, data) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");

    if (cwcRf.status !== "NBFC_DUE_DILIGENCE") {
      throw new Error("Due diligence must be completed before issuing sanction");
    }

    const dd = cwcRf.nbfcProcess?.dueDiligence;
    if (!dd || !dd.completedAt || dd.result === "REJECTED") {
      throw new Error("Due diligence must be completed and approved/conditional");
    }

    const { sanctionAmount, sanctionedInterestRate, sanctionedTenure, specialConditions, letterUrl } = data;
    if (!sanctionAmount || !sanctionedInterestRate || !sanctionedTenure) {
      throw new Error("sanctionAmount, sanctionedInterestRate, and sanctionedTenure are required");
    }

    cwcRf.status = "NBFC_SANCTIONED";
    if (!cwcRf.nbfcProcess) cwcRf.nbfcProcess = {};
    cwcRf.nbfcProcess.sanctionLetter = {
      issued: true,
      issuedAt: new Date(),
      issuedBy: nbfcUserId,
      sanctionAmount,
      sanctionedInterestRate,
      sanctionedTenure,
      specialConditions: specialConditions || "",
      letterUrl: letterUrl || "",
      acceptedBySc: false,
    };

    cwcRf.statusHistory.push({
      status: "NBFC_SANCTIONED",
      changedBy: nbfcUserId,
      notes: `Sanction letter issued: ₹${sanctionAmount} at ${sanctionedInterestRate}% for ${sanctionedTenure} days`,
    });

    cwcRf.markModified("nbfcProcess");
    await cwcRf.save();

    // Update case status
    await this._updateCaseStatus(cwcRf, "NBFC_SANCTIONED", nbfcUserId, "Sanction letter issued by NBFC");

    // Notify SC about the sanction letter
    await this._notifyStatusChange(cwcRf, "NBFC_SANCTIONED",
      `Sanction letter issued: ₹${sanctionAmount} at ${sanctionedInterestRate}% p.a. for ${sanctionedTenure} days`);

    return cwcRf;
  }

  /**
   * SC accepts the sanction letter from NBFC.
   */
  async scAcceptSanctionLetter(cwcRfId, userId) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");
    if (cwcRf.status !== "NBFC_SANCTIONED") throw new Error("No sanction letter to accept");

    if (!cwcRf.nbfcProcess?.sanctionLetter?.issued) {
      throw new Error("Sanction letter has not been issued");
    }

    cwcRf.nbfcProcess.sanctionLetter.acceptedBySc = true;
    cwcRf.nbfcProcess.sanctionLetter.acceptedAt = new Date();

    cwcRf.statusHistory.push({
      status: "NBFC_SANCTIONED",
      changedBy: userId,
      notes: "Sub-contractor accepted the sanction letter",
    });

    cwcRf.markModified("nbfcProcess");
    await cwcRf.save();

    // Notify NBFC that SC accepted
    const nbfc = await Nbfc.findById(cwcRf.selectedNbfc?.nbfcId);
    if (nbfc) {
      const nbfcUser = await User.findOne({ nbfcId: nbfc._id });
      if (nbfcUser?.email) {
        emailService.sendStatusUpdate(nbfcUser.email, nbfc.companyName || nbfc.name || "NBFC",
          "CWCRF", "SANCTION_ACCEPTED", "The sub-contractor has accepted the sanction letter. You may proceed with disbursement.");
      }
    }

    return cwcRf;
  }

  /**
   * NBFC initiates disbursement.
   */
  async nbfcInitiateDisbursement(cwcRfId, nbfcUserId, data) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");
    if (cwcRf.status !== "NBFC_SANCTIONED") throw new Error("Sanction letter must be issued first");

    if (!cwcRf.nbfcProcess?.sanctionLetter?.acceptedBySc) {
      throw new Error("Sub-contractor must accept the sanction letter before disbursement");
    }

    const { amount, disbursementMode, escrowAccountId } = data;
    if (!amount) throw new Error("Disbursement amount is required");

    cwcRf.status = "DISBURSEMENT_INITIATED";
    if (!cwcRf.nbfcProcess) cwcRf.nbfcProcess = {};
    cwcRf.nbfcProcess.disbursement = {
      initiated: true,
      initiatedAt: new Date(),
      initiatedBy: nbfcUserId,
      amount,
      disbursementMode: disbursementMode || "NEFT",
      escrowAccountId: escrowAccountId || "",
      confirmed: false,
    };

    cwcRf.statusHistory.push({
      status: "DISBURSEMENT_INITIATED",
      changedBy: nbfcUserId,
      notes: `Disbursement initiated: ₹${amount} via ${disbursementMode || "NEFT"}`,
    });

    cwcRf.markModified("nbfcProcess");
    await cwcRf.save();

    await this._updateCaseStatus(cwcRf, "DISBURSEMENT_INITIATED", nbfcUserId, "NBFC initiated disbursement");
    await this._notifyStatusChange(cwcRf, "DISBURSEMENT_INITIATED", `Disbursement of ₹${amount} has been initiated`);

    return cwcRf;
  }

  /**
   * NBFC confirms disbursement is complete (funds sent).
   */
  async nbfcConfirmDisbursement(cwcRfId, nbfcUserId, data) {
    const cwcRf = await CwcRf.findById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");
    if (cwcRf.status !== "DISBURSEMENT_INITIATED") throw new Error("Disbursement must be initiated first");

    const { utrNumber, disbursedAt } = data;
    if (!utrNumber) throw new Error("UTR number is required");

    cwcRf.status = "DISBURSED";
    cwcRf.nbfcProcess.disbursement = {
      ...cwcRf.nbfcProcess.disbursement,
      utrNumber,
      disbursedAt: disbursedAt ? new Date(disbursedAt) : new Date(),
      confirmed: true,
      confirmedAt: new Date(),
    };

    cwcRf.statusHistory.push({
      status: "DISBURSED",
      changedBy: nbfcUserId,
      notes: `Funds disbursed. UTR: ${utrNumber}`,
    });

    cwcRf.markModified("nbfcProcess");
    await cwcRf.save();

    // Update case to COMPLETED
    await this._updateCaseStatus(cwcRf, "COMPLETED", nbfcUserId, `Funds disbursed. UTR: ${utrNumber}`);

    // Notify all parties
    await this._notifyStatusChange(cwcRf, "DISBURSED", `Funds have been disbursed. UTR: ${utrNumber}`);

    return cwcRf;
  }

  /**
   * Get CWCRFs with NBFC process data for a specific NBFC.
   * Includes all active NBFC processes (due diligence, sanction, disbursement).
   */
  async getCwcRfsInNbfcProcess(nbfcId) {
    return CwcRf.find({
      "selectedNbfc.nbfcId": nbfcId,
      status: {
        $in: [
          "MOVED_TO_NBFC_PROCESS",
          "NBFC_DUE_DILIGENCE",
          "NBFC_SANCTIONED",
          "DISBURSEMENT_INITIATED",
          "DISBURSED",
        ],
      },
    })
      .populate("subContractorId", "companyName ownerName pan gstin phone")
      .populate("epcId", "companyName")
      .populate("billId", "billNumber amount")
      .populate("caseId")
      .sort({ updatedAt: -1 });
  }

  // =========================================================
  // SHARED HELPERS — Email notifications & case updates
  // =========================================================

  /**
   * Send email notification for CWCRF status changes.
   * Non-blocking — failures are logged but don't break the flow.
   */
  async _notifyStatusChange(cwcRf, newStatus, notes) {
    try {
      // Notify Sub-Contractor (SC)
      const sc = await SubContractor.findById(cwcRf.subContractorId);
      if (sc) {
        const scUser = await User.findOne({ subContractorId: sc._id });
        if (scUser?.email) {
          emailService.sendStatusUpdate(scUser.email, sc.companyName || sc.ownerName || "Seller",
            "CWCRF", newStatus.replace(/_/g, " "), notes);
        }
      }
    } catch (err) {
      console.error("[EMAIL] Failed to send status notification:", err.message);
    }
  }

  /**
   * Notify Ops team users about important events.
   */
  async _notifyOpsTeam(subject, message) {
    try {
      const opsUsers = await User.find({ role: "ops", isActive: true }).select("email name").limit(10);
      for (const u of opsUsers) {
        if (u.email) {
          emailService.sendSalesNotification(u.email, u.name || "Ops Team", message);
        }
      }
    } catch (err) {
      console.error("[EMAIL] Failed to notify ops team:", err.message);
    }
  }

  /**
   * Notify EPC company about a CWCRF that needs buyer verification.
   */
  async _notifyEpc(cwcRf, message) {
    try {
      if (!cwcRf.epcId) return;
      const epcId = typeof cwcRf.epcId === "object" ? cwcRf.epcId._id : cwcRf.epcId;
      const epcUsers = await User.find({ companyId: epcId, role: "epc", isActive: true }).select("email name").limit(5);
      for (const u of epcUsers) {
        if (u.email) {
          emailService.sendStatusUpdate(u.email, u.name || "EPC", "CWCRF", "BUYER_VERIFICATION_PENDING", message);
        }
      }
    } catch (err) {
      console.error("[EMAIL] Failed to notify EPC:", err.message);
    }
  }

  /**
   * Update the associated case document status.
   */
  async _updateCaseStatus(cwcRf, status, userId, notes) {
    try {
      const caseDoc = await Case.findById(cwcRf.caseId);
      if (caseDoc) {
        caseDoc.status = status;
        caseDoc.statusHistory.push({ status, changedBy: userId, notes });
        await caseDoc.save();
      }
    } catch (err) {
      console.error("[CASE] Failed to update case status:", err.message);
    }
  }

  // =========================================================
  // PHASE 7.2 — PDF CASE DOWNLOAD
  // =========================================================

  /**
   * Generate a formatted PDF document containing the full case data.
   * Returns a pdfkit document stream that can be piped to the HTTP response.
   */
  async generateCasePdf(cwcRfId) {
    const cwcRf = await this.getCwcRfById(cwcRfId);
    if (!cwcRf) throw new Error("CWCRF not found");

    const sc = cwcRf.subContractorId || {};
    const epc = cwcRf.epcId || {};
    const bill = cwcRf.billId || {};
    const buyer = cwcRf.buyerDetails || {};
    const inv = cwcRf.invoiceDetails || {};
    const req = cwcRf.cwcRequest || {};
    const intPref = cwcRf.interestPreference || {};
    const opsV = cwcRf.opsVerification || {};
    const buyerV = cwcRf.buyerVerification || {};

    const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });

    // ── Helper functions ──
    const COLORS = { primary: "#B45309", heading: "#1e293b", muted: "#6b7280", accent: "#059669", line: "#e2e8f0" };

    const drawLine = () => {
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(COLORS.line);
      doc.moveDown(0.5);
    };

    const sectionTitle = (title) => {
      doc.moveDown(0.5);
      doc.fontSize(13).font("Helvetica-Bold").fillColor(COLORS.primary).text(title);
      doc.moveDown(0.3);
      drawLine();
    };

    const row = (label, value) => {
      const y = doc.y;
      doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.muted).text(label, 50, y, { width: 180 });
      doc.fontSize(10).font("Helvetica").fillColor(COLORS.heading).text(String(value ?? "—"), 235, y, { width: 310 });
      doc.moveDown(0.4);
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
    const fmtCurrency = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

    // ── Header ──
    doc.rect(0, 0, 595.28, 80).fill("#fffbeb");
    doc.fontSize(22).font("Helvetica-Bold").fillColor(COLORS.primary).text("GRYORK", 50, 22);
    doc.fontSize(9).font("Helvetica").fillColor(COLORS.muted).text("CWC Request Form — Full Case Report", 50, 48);
    doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.heading).text(cwcRf.cwcRfNumber || "—", 400, 22, { align: "right", width: 145 });
    doc.fontSize(8).font("Helvetica").fillColor(COLORS.muted).text(`Status: ${(cwcRf.status || "").replace(/_/g, " ")}`, 400, 40, { align: "right", width: 145 });
    doc.fontSize(8).text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 400, 52, { align: "right", width: 145 });

    doc.y = 95;

    // ── Sub-Contractor Profile ──
    sectionTitle("Sub-Contractor (Seller) Profile");
    row("Company Name", sc.companyName);
    row("Owner / Proprietor", sc.ownerName);
    row("PAN", sc.pan);
    row("GSTIN", sc.gstin);
    row("Email", sc.email || sc.userId?.email);
    row("Phone", sc.phone);
    row("Account Type", sc.accountType);

    // ── Buyer / Project Details (Section A) ──
    sectionTitle("Section A — Buyer & Project Details");
    row("Buyer Name", buyer.buyerName || epc.companyName);
    row("Buyer GSTIN", buyer.buyerGstin);
    row("Project Name", buyer.projectName);
    row("Project Location", buyer.projectLocation);

    // ── Invoice Details (Section B) ──
    sectionTitle("Section B — Invoice Details");
    row("Invoice Number", inv.invoiceNumber);
    row("Invoice Date", fmtDate(inv.invoiceDate));
    row("Invoice Amount", fmtCurrency(inv.invoiceAmount));
    row("GST Amount", fmtCurrency(inv.gstAmount));
    row("Net Invoice Amount", fmtCurrency(inv.netInvoiceAmount));
    row("Expected Payment Date", fmtDate(inv.expectedPaymentDate));
    row("Work Description", inv.workDescription);
    row("PO Number", inv.purchaseOrderNumber);
    row("PO Date", fmtDate(inv.purchaseOrderDate));
    row("Work Completion Date", fmtDate(inv.workCompletionDate));

    // ── CWC Request (Section C) ──
    sectionTitle("Section C — CWC Request");
    row("Requested Amount", fmtCurrency(req.requestedAmount));
    row("Requested Tenure", req.requestedTenure ? `${req.requestedTenure} days` : "—");
    row("Urgency Level", req.urgencyLevel);
    row("Reason for Funding", req.reasonForFunding);
    row("Preferred Disbursement", fmtDate(req.preferredDisbursementDate));
    row("Collateral Offered", req.collateralOffered);
    row("Existing Loan Details", req.existingLoanDetails);

    // ── Interest Preference (Section D) ──
    sectionTitle("Section D — Interest Rate Preference");
    row("Preference Type", intPref.preferenceType);
    if (intPref.preferenceType === "RANGE") {
      row("Rate Range", `${intPref.minRate || "—"}% – ${intPref.maxRate || "—"}% p.a.`);
    } else {
      row("Max Acceptable Rate", intPref.maxAcceptableRate ? `${intPref.maxAcceptableRate}% p.a.` : "—");
    }
    row("Repayment Frequency", intPref.preferredRepaymentFrequency);
    row("Processing Fee Accepted", intPref.processingFeeAcceptance ? "Yes" : "No");
    row("Max Processing Fee", intPref.maxProcessingFeePercent ? `${intPref.maxProcessingFeePercent}%` : "—");
    row("Prepayment Preference", intPref.prepaymentPreference);

    // ── Seller Declaration ──
    sectionTitle("Seller Declaration");
    row("Accepted", cwcRf.sellerDeclaration?.accepted ? "Yes" : "No");
    row("Accepted At", fmtDate(cwcRf.sellerDeclaration?.acceptedAt));

    // ── Ops Verification ──
    doc.addPage();
    sectionTitle("Ops Verification (Phase 6)");
    const secs = ["sectionA", "sectionB", "sectionC", "sectionD"];
    const secLabels = { sectionA: "Section A", sectionB: "Section B", sectionC: "Section C", sectionD: "Section D" };
    secs.forEach((s) => {
      const v = opsV[s] || {};
      row(`${secLabels[s]} Verified`, v.verified ? "✓ Yes" : "✗ No");
      if (v.notes) row(`${secLabels[s]} Notes`, v.notes);
    });
    row("RA Bill Verified", opsV.raBillVerified ? "✓ Yes" : "✗ No");
    row("WCC Verified", opsV.wccVerified ? "✓ Yes" : "✗ No");
    row("Meas. Sheet Verified", opsV.measurementSheetVerified ? "✓ Yes" : "✗ No");
    if (opsV.opsNotes) row("Ops Notes", opsV.opsNotes);
    row("Ops Verified At", fmtDate(opsV.opsVerifiedAt));

    // ── EPC / Buyer Verification ──
    sectionTitle("EPC Buyer Verification (Phase 9)");
    row("Approved Amount", fmtCurrency(buyerV.approvedAmount));
    row("Repayment Timeline", buyerV.repaymentTimeline ? `${buyerV.repaymentTimeline} days` : "—");
    row("Repayment Source", buyerV.repaymentArrangement?.source?.replace(/_/g, " "));
    if (buyerV.repaymentArrangement?.otherDetails) row("Other Details", buyerV.repaymentArrangement.otherDetails);
    if (buyerV.repaymentArrangement?.remarks) row("Remarks", buyerV.repaymentArrangement.remarks);
    row("Buyer Declaration", buyerV.buyerDeclaration?.accepted ? "Accepted" : "Not accepted");
    row("Verified At", fmtDate(buyerV.verifiedAt));
    if (buyerV.notes) row("Notes", buyerV.notes);

    // ── NBFC Quotations (if any) ──
    if (cwcRf.nbfcQuotations && cwcRf.nbfcQuotations.length > 0) {
      sectionTitle("NBFC Quotations");
      cwcRf.nbfcQuotations.forEach((q, i) => {
        row(`NBFC ${i + 1}`, q.nbfcId?.companyName || q.nbfcId?.name || "—");
        row(`  Interest Rate`, q.quotation?.interestRate ? `${q.quotation.interestRate}% p.a.` : "—");
        row(`  Tenure`, q.quotation?.tenure ? `${q.quotation.tenure} days` : "—");
        row(`  Status`, q.status);
        if (q.quotation?.terms) row(`  Terms`, q.quotation.terms);
        doc.moveDown(0.3);
      });
    }

    // ── Selected NBFC ──
    if (cwcRf.selectedNbfc?.nbfcId) {
      sectionTitle("Selected NBFC");
      row("NBFC", cwcRf.selectedNbfc.nbfcId?.companyName || "—");
      row("Final Interest Rate", cwcRf.selectedNbfc.finalInterestRate ? `${cwcRf.selectedNbfc.finalInterestRate}% p.a.` : "—");
      row("Final Tenure", cwcRf.selectedNbfc.finalTenure ? `${cwcRf.selectedNbfc.finalTenure} days` : "—");
      row("Selected At", fmtDate(cwcRf.selectedNbfc.selectedAt));
    }

    // ── Status History ──
    if (cwcRf.statusHistory && cwcRf.statusHistory.length > 0) {
      sectionTitle("Status History");
      cwcRf.statusHistory.forEach((h) => {
        row(fmtDate(h.changedAt), `${(h.status || "").replace(/_/g, " ")}${h.notes ? " — " + h.notes : ""}`);
      });
    }

    // ── Footer on every page ──
    const pages = doc.bufferedPageRange();
    for (let i = pages.start; i < pages.start + pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(7).font("Helvetica").fillColor(COLORS.muted);
      doc.text(`Gryork Platform — Confidential | Page ${i + 1} of ${pages.count}`, 50, 780, { width: 495, align: "center" });
    }

    doc.end();
    return doc;
  }
}

module.exports = new CwcRfService();
