const CwcRf = require("../models/CwcRf");
const SubContractor = require("../models/SubContractor");
const Company = require("../models/Company");
const Bill = require("../models/Bill");
const Case = require("../models/Case");
const Nbfc = require("../models/Nbfc");
const mongoose = require("mongoose");

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
      },

      // Section C: CWC Request
      cwcRequest: {
        invoiceAmount: data.invoiceDetails?.invoiceAmount || bill.amount,
        requestedAmount: data.cwcRequest?.requestedAmount,
        requestedTenure: data.cwcRequest?.requestedTenure,
      },

      // Section D: Interest Rate Preference
      interestPreference: {
        preferenceType: data.interestPreference?.preferenceType || "RANGE",
        minRate: data.interestPreference?.minRate,
        maxRate: data.interestPreference?.maxRate,
        maxAcceptableRate: data.interestPreference?.maxAcceptableRate,
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

    // Update buyer verification
    cwcRf.buyerVerification = {
      approvedAmount: verificationData.approvedAmount,
      repaymentTimeline: verificationData.repaymentTimeline,
      repaymentArrangement: {
        source: verificationData.repaymentArrangement.source,
        otherDetails: verificationData.repaymentArrangement.otherDetails,
        remarks: verificationData.repaymentArrangement.remarks,
      },
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
        ],
      },
    })
      .populate("subContractorId", "companyName")
      .populate("epcId", "companyName")
      .populate("caseId")
      .sort({ createdAt: -1 });
  }
}

module.exports = new CwcRfService();
