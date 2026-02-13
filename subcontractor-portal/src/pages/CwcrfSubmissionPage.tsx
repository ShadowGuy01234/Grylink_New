import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { scApi, cwcrfApi } from "../api";
import toast from "react-hot-toast";

interface CwcrfFormData {
  // Section A - Buyer Details (Auto-populated from EPC mapping)
  sectionA: {
    buyerName: string;
    buyerGstin: string;
    buyerAddress: string;
    buyerContactPerson: string;
    buyerContactPhone: string;
    buyerContactEmail: string;
    buyerCreditRating: string;
  };
  // Section B - Invoice Details
  sectionB: {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceAmount: number;
    invoiceDueDate: string;
    purchaseOrderNumber: string;
    purchaseOrderDate: string;
    workDescription: string;
    workCompletionDate: string;
    gstAmount: number;
    netInvoiceAmount: number;
  };
  // Section C - CWC Request Details
  sectionC: {
    requestedAmount: number;
    requestedTenure: number;
    urgencyLevel: "NORMAL" | "URGENT" | "CRITICAL";
    reasonForFunding: string;
    preferredDisbursementDate: string;
    collateralOffered: string;
    existingLoanDetails: string;
  };
  // Section D - Interest Preference
  sectionD: {
    acceptableInterestRateMin: number;
    acceptableInterestRateMax: number;
    preferredRepaymentFrequency: "ONE_TIME" | "MONTHLY" | "QUARTERLY";
    processingFeeAcceptance: boolean;
    maxProcessingFeePercent: number;
    prepaymentPreference: "WITH_PENALTY" | "WITHOUT_PENALTY" | "NO_PREPAYMENT";
  };
}

const initialFormData: CwcrfFormData = {
  sectionA: {
    buyerName: "",
    buyerGstin: "",
    buyerAddress: "",
    buyerContactPerson: "",
    buyerContactPhone: "",
    buyerContactEmail: "",
    buyerCreditRating: "",
  },
  sectionB: {
    invoiceNumber: "",
    invoiceDate: "",
    invoiceAmount: 0,
    invoiceDueDate: "",
    purchaseOrderNumber: "",
    purchaseOrderDate: "",
    workDescription: "",
    workCompletionDate: "",
    gstAmount: 0,
    netInvoiceAmount: 0,
  },
  sectionC: {
    requestedAmount: 0,
    requestedTenure: 30,
    urgencyLevel: "NORMAL",
    reasonForFunding: "",
    preferredDisbursementDate: "",
    collateralOffered: "",
    existingLoanDetails: "",
  },
  sectionD: {
    acceptableInterestRateMin: 12,
    acceptableInterestRateMax: 24,
    preferredRepaymentFrequency: "ONE_TIME",
    processingFeeAcceptance: true,
    maxProcessingFeePercent: 2,
    prepaymentPreference: "WITHOUT_PENALTY",
  },
};

const CwcrfSubmissionPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CwcrfFormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eligibilityStatus, setEligibilityStatus] = useState<{
    canSubmit: boolean;
    declarationAccepted: boolean;
    kycCompleted: boolean;
    bankDetailsVerified: boolean;
    reasons: string[];
  } | null>(null);
  const [verifiedBills, setVerifiedBills] = useState<any[]>([]);
  const [selectedBillId, setSelectedBillId] = useState("");

  useEffect(() => {
    checkEligibilityAndLoadData();
  }, []);

  const checkEligibilityAndLoadData = async () => {
    try {
      // Check declaration status
      const declRes = await scApi.getDeclarationStatus();
      const kycRes = await scApi.getKycStatus();
      const profileRes = await scApi.getProfile();

      const sc = profileRes.data.subContractor;
      const bills =
        profileRes.data.bills?.filter((b: any) => b.status === "VERIFIED") ||
        [];

      const eligibility = {
        canSubmit: false,
        declarationAccepted: declRes.data.declarationAccepted || false,
        kycCompleted: kycRes.data.kycStatus === "VERIFIED",
        bankDetailsVerified: kycRes.data.bankDetailsVerified || false,
        reasons: [] as string[],
      };

      if (!eligibility.declarationAccepted) {
        eligibility.reasons.push("Seller Declaration not accepted");
      }
      if (!eligibility.kycCompleted) {
        eligibility.reasons.push("KYC verification pending");
      }
      if (!eligibility.bankDetailsVerified) {
        eligibility.reasons.push("Bank details not verified");
      }
      if (bills.length === 0) {
        eligibility.reasons.push("No verified bills available");
      }

      eligibility.canSubmit = eligibility.reasons.length === 0;

      setEligibilityStatus(eligibility);
      setVerifiedBills(bills);

      if (sc?.company) {
        setFormData((prev) => ({
          ...prev,
          sectionA: {
            ...prev.sectionA,
            buyerName: sc.company.name || "",
            buyerGstin: sc.company.gstin || "",
            buyerAddress: sc.company.address || "",
            buyerContactPerson: sc.company.contactPerson || "",
            buyerContactPhone: sc.company.contactPhone || "",
            buyerContactEmail: sc.company.contactEmail || "",
            buyerCreditRating: sc.company.creditRating || "NOT_RATED",
          },
        }));
      }
    } catch (err: any) {
      toast.error("Failed to load eligibility data");
    } finally {
      setLoading(false);
    }
  };

  const handleBillSelection = (billId: string) => {
    setSelectedBillId(billId);
    const bill = verifiedBills.find((b) => b._id === billId);
    if (bill) {
      const gstAmount = bill.gstAmount || bill.amount * 0.18;
      setFormData((prev) => ({
        ...prev,
        sectionB: {
          ...prev.sectionB,
          invoiceNumber: bill.billNumber || "",
          invoiceDate: bill.billDate ? bill.billDate.split("T")[0] : "",
          invoiceAmount: bill.amount || 0,
          invoiceDueDate: bill.dueDate ? bill.dueDate.split("T")[0] : "",
          purchaseOrderNumber: bill.poNumber || "",
          purchaseOrderDate: bill.poDate ? bill.poDate.split("T")[0] : "",
          workDescription: bill.description || "",
          workCompletionDate: bill.workCompletionDate
            ? bill.workCompletionDate.split("T")[0]
            : "",
          gstAmount: gstAmount,
          netInvoiceAmount: bill.amount - gstAmount,
        },
        sectionC: {
          ...prev.sectionC,
          requestedAmount: bill.amount || 0,
        },
      }));
    }
  };

  const updateSection = (
    section: keyof CwcrfFormData,
    field: string,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!selectedBillId) {
          toast.error("Please select a verified bill");
          return false;
        }
        return true;
      case 2:
        const { invoiceNumber, invoiceAmount, invoiceDate } = formData.sectionB;
        if (!invoiceNumber || !invoiceAmount || !invoiceDate) {
          toast.error("Please fill all required invoice details");
          return false;
        }
        return true;
      case 3:
        const { requestedAmount, requestedTenure, reasonForFunding } =
          formData.sectionC;
        if (!requestedAmount || !requestedTenure || !reasonForFunding) {
          toast.error("Please fill all required CWC request details");
          return false;
        }
        if (requestedAmount > formData.sectionB.invoiceAmount) {
          toast.error("Requested amount cannot exceed invoice amount");
          return false;
        }
        return true;
      case 4:
        const { acceptableInterestRateMin, acceptableInterestRateMax } =
          formData.sectionD;
        if (acceptableInterestRateMin >= acceptableInterestRateMax) {
          toast.error("Minimum interest rate must be less than maximum");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setSubmitting(true);
    try {
      const selectedBill = verifiedBills.find((b) => b._id === selectedBillId);

      const payload = {
        billId: selectedBillId,
        buyerDetails: {
          buyerId: selectedBill?.epcCompany?._id,
          projectName: selectedBill?.workOrderNumber || "N/A",
          projectLocation: formData.sectionA.buyerAddress || "N/A",
        },
        invoiceDetails: {
          invoiceNumber: formData.sectionB.invoiceNumber,
          invoiceDate: formData.sectionB.invoiceDate,
          invoiceAmount: formData.sectionB.invoiceAmount,
          expectedPaymentDate: formData.sectionB.invoiceDueDate,
          workDescription: formData.sectionB.workDescription,
        },
        cwcRequest: {
          requestedAmount: formData.sectionC.requestedAmount,
          requestedTenure: formData.sectionC.requestedTenure,
        },
        interestPreference: {
          preferenceType: "RANGE" as const,
          minRate: formData.sectionD.acceptableInterestRateMin,
          maxRate: formData.sectionD.acceptableInterestRateMax,
        },
      };

      await cwcrfApi.submit(payload);
      toast.success("CWCRF submitted successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit CWCRF");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Checking eligibility...</div>;
  }

  if (!eligibilityStatus?.canSubmit) {
    return (
      <div className="cwcrf-page">
        <div className="eligibility-block">
          <h2>CWCRF Submission Not Available</h2>
          <p>
            You need to complete the following before submitting a CWC Request
            Form:
          </p>
          <ul className="eligibility-reasons">
            {eligibilityStatus?.reasons.map((reason, idx) => (
              <li key={idx} className="reason-item">
                {reason}
              </li>
            ))}
          </ul>
          <div className="action-buttons">
            <button onClick={() => navigate("/")} className="btn-secondary">
              Back to Dashboard
            </button>
            {!eligibilityStatus?.declarationAccepted && (
              <button
                onClick={() => navigate("/declaration")}
                className="btn-primary"
              >
                Accept Declaration
              </button>
            )}
            {!eligibilityStatus?.kycCompleted && (
              <button onClick={() => navigate("/kyc")} className="btn-primary">
                Complete KYC
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cwcrf-page">
      <div className="cwcrf-header">
        <h1>CWC Request Form (CWCRF)</h1>
        <p>Complete all sections to submit your bill discounting request</p>
      </div>

      {/* Progress Steps */}
      <div className="step-progress">
        {[
          "Bill Selection",
          "Section A & B",
          "Section C",
          "Section D",
          "Review & Submit",
        ].map((label, idx) => (
          <div
            key={idx}
            className={`step ${currentStep === idx + 1 ? "active" : ""} ${currentStep > idx + 1 ? "completed" : ""}`}
          >
            <span className="step-number">{idx + 1}</span>
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Bill Selection */}
      {currentStep === 1 && (
        <div className="step-content">
          <h2>Step 1: Select Verified Bill</h2>
          <p>Select a verified bill to initiate the CWCRF submission</p>

          {verifiedBills.length === 0 ? (
            <div className="no-bills">
              <p>
                No verified bills available. Please upload and get your bills
                verified first.
              </p>
              <button onClick={() => navigate("/")} className="btn-secondary">
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="bills-grid">
              {verifiedBills.map((bill: any) => (
                <div
                  key={bill._id}
                  className={`bill-card ${selectedBillId === bill._id ? "selected" : ""}`}
                  onClick={() => handleBillSelection(bill._id)}
                >
                  <div className="bill-header">
                    <span className="bill-number">{bill.billNumber}</span>
                    <span className="bill-status verified">Verified</span>
                  </div>
                  <div className="bill-details">
                    <div className="detail-row">
                      <span>Amount:</span>
                      <strong>₹{bill.amount?.toLocaleString()}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Date:</span>
                      <span>
                        {bill.billDate
                          ? new Date(bill.billDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Description:</span>
                      <span>{bill.description || "N/A"}</span>
                    </div>
                  </div>
                  {selectedBillId === bill._id && (
                    <div className="selected-indicator">✓ Selected</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Section A (Buyer) & Section B (Invoice) */}
      {currentStep === 2 && (
        <div className="step-content">
          <h2>Step 2: Buyer & Invoice Details</h2>

          {/* Section A - Buyer Details */}
          <div className="form-section">
            <h3>Section A - Buyer (EPC Company) Details</h3>
            <p className="section-note">
              These details are auto-populated from your EPC mapping
            </p>

            <div className="form-grid">
              <div className="form-group">
                <label>Buyer Name</label>
                <input
                  type="text"
                  value={formData.sectionA.buyerName}
                  onChange={(e) =>
                    updateSection("sectionA", "buyerName", e.target.value)
                  }
                  readOnly
                  className="readonly"
                />
              </div>
              <div className="form-group">
                <label>Buyer GSTIN</label>
                <input
                  type="text"
                  value={formData.sectionA.buyerGstin}
                  onChange={(e) =>
                    updateSection("sectionA", "buyerGstin", e.target.value)
                  }
                  readOnly
                  className="readonly"
                />
              </div>
              <div className="form-group full-width">
                <label>Buyer Address</label>
                <textarea
                  value={formData.sectionA.buyerAddress}
                  onChange={(e) =>
                    updateSection("sectionA", "buyerAddress", e.target.value)
                  }
                  readOnly
                  className="readonly"
                />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  value={formData.sectionA.buyerContactPerson}
                  onChange={(e) =>
                    updateSection(
                      "sectionA",
                      "buyerContactPerson",
                      e.target.value,
                    )
                  }
                  readOnly
                  className="readonly"
                />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={formData.sectionA.buyerContactPhone}
                  onChange={(e) =>
                    updateSection(
                      "sectionA",
                      "buyerContactPhone",
                      e.target.value,
                    )
                  }
                  readOnly
                  className="readonly"
                />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={formData.sectionA.buyerContactEmail}
                  onChange={(e) =>
                    updateSection(
                      "sectionA",
                      "buyerContactEmail",
                      e.target.value,
                    )
                  }
                  readOnly
                  className="readonly"
                />
              </div>
              <div className="form-group">
                <label>Credit Rating</label>
                <input
                  type="text"
                  value={formData.sectionA.buyerCreditRating}
                  readOnly
                  className="readonly"
                />
              </div>
            </div>
          </div>

          {/* Section B - Invoice Details */}
          <div className="form-section">
            <h3>Section B - Invoice Details</h3>
            <p className="section-note">
              Invoice details from your selected bill
            </p>

            <div className="form-grid">
              <div className="form-group">
                <label>Invoice Number *</label>
                <input
                  type="text"
                  value={formData.sectionB.invoiceNumber}
                  onChange={(e) =>
                    updateSection("sectionB", "invoiceNumber", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Invoice Date *</label>
                <input
                  type="date"
                  value={formData.sectionB.invoiceDate}
                  onChange={(e) =>
                    updateSection("sectionB", "invoiceDate", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Invoice Amount *</label>
                <input
                  type="number"
                  value={formData.sectionB.invoiceAmount}
                  onChange={(e) =>
                    updateSection(
                      "sectionB",
                      "invoiceAmount",
                      parseFloat(e.target.value),
                    )
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Invoice Due Date</label>
                <input
                  type="date"
                  value={formData.sectionB.invoiceDueDate}
                  onChange={(e) =>
                    updateSection("sectionB", "invoiceDueDate", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Purchase Order Number</label>
                <input
                  type="text"
                  value={formData.sectionB.purchaseOrderNumber}
                  onChange={(e) =>
                    updateSection(
                      "sectionB",
                      "purchaseOrderNumber",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="form-group">
                <label>Purchase Order Date</label>
                <input
                  type="date"
                  value={formData.sectionB.purchaseOrderDate}
                  onChange={(e) =>
                    updateSection(
                      "sectionB",
                      "purchaseOrderDate",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="form-group full-width">
                <label>Work Description</label>
                <textarea
                  value={formData.sectionB.workDescription}
                  onChange={(e) =>
                    updateSection("sectionB", "workDescription", e.target.value)
                  }
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Work Completion Date</label>
                <input
                  type="date"
                  value={formData.sectionB.workCompletionDate}
                  onChange={(e) =>
                    updateSection(
                      "sectionB",
                      "workCompletionDate",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="form-group">
                <label>GST Amount</label>
                <input
                  type="number"
                  value={formData.sectionB.gstAmount}
                  onChange={(e) =>
                    updateSection(
                      "sectionB",
                      "gstAmount",
                      parseFloat(e.target.value),
                    )
                  }
                />
              </div>
              <div className="form-group">
                <label>Net Invoice Amount</label>
                <input
                  type="number"
                  value={formData.sectionB.netInvoiceAmount}
                  onChange={(e) =>
                    updateSection(
                      "sectionB",
                      "netInvoiceAmount",
                      parseFloat(e.target.value),
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Section C (CWC Request) */}
      {currentStep === 3 && (
        <div className="step-content">
          <h2>Step 3: CWC Request Details</h2>

          <div className="form-section">
            <h3>Section C - CWC Request Parameters</h3>
            <p className="section-note">Specify your funding requirements</p>

            <div className="form-grid">
              <div className="form-group">
                <label>Requested Amount * (₹)</label>
                <input
                  type="number"
                  value={formData.sectionC.requestedAmount}
                  onChange={(e) =>
                    updateSection(
                      "sectionC",
                      "requestedAmount",
                      parseFloat(e.target.value),
                    )
                  }
                  max={formData.sectionB.invoiceAmount}
                  required
                />
                <span className="field-note">
                  Max: ₹{formData.sectionB.invoiceAmount?.toLocaleString()}
                </span>
              </div>
              <div className="form-group">
                <label>Requested Tenure * (Days)</label>
                <input
                  type="number"
                  value={formData.sectionC.requestedTenure}
                  onChange={(e) =>
                    updateSection(
                      "sectionC",
                      "requestedTenure",
                      parseInt(e.target.value),
                    )
                  }
                  min={15}
                  max={180}
                  required
                />
              </div>
              <div className="form-group">
                <label>Urgency Level *</label>
                <select
                  value={formData.sectionC.urgencyLevel}
                  onChange={(e) =>
                    updateSection("sectionC", "urgencyLevel", e.target.value)
                  }
                >
                  <option value="NORMAL">Normal (7-10 days)</option>
                  <option value="URGENT">Urgent (3-5 days)</option>
                  <option value="CRITICAL">Critical (1-2 days)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Preferred Disbursement Date</label>
                <input
                  type="date"
                  value={formData.sectionC.preferredDisbursementDate}
                  onChange={(e) =>
                    updateSection(
                      "sectionC",
                      "preferredDisbursementDate",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="form-group full-width">
                <label>Reason for Funding *</label>
                <textarea
                  value={formData.sectionC.reasonForFunding}
                  onChange={(e) =>
                    updateSection(
                      "sectionC",
                      "reasonForFunding",
                      e.target.value,
                    )
                  }
                  placeholder="Describe why you need this funding..."
                  rows={3}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Collateral Offered (if any)</label>
                <textarea
                  value={formData.sectionC.collateralOffered}
                  onChange={(e) =>
                    updateSection(
                      "sectionC",
                      "collateralOffered",
                      e.target.value,
                    )
                  }
                  placeholder="Describe any collateral you can offer..."
                  rows={2}
                />
              </div>
              <div className="form-group full-width">
                <label>Existing Loan Details (if any)</label>
                <textarea
                  value={formData.sectionC.existingLoanDetails}
                  onChange={(e) =>
                    updateSection(
                      "sectionC",
                      "existingLoanDetails",
                      e.target.value,
                    )
                  }
                  placeholder="Mention any existing loans or credit facilities..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Section D (Interest Preference) */}
      {currentStep === 4 && (
        <div className="step-content">
          <h2>Step 4: Interest Preferences</h2>

          <div className="form-section">
            <h3>Section D - Interest & Repayment Preferences</h3>
            <p className="section-note">
              Set your acceptable interest rate range and repayment preferences
            </p>

            <div className="form-grid">
              <div className="form-group">
                <label>Minimum Acceptable Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  value={formData.sectionD.acceptableInterestRateMin}
                  onChange={(e) =>
                    updateSection(
                      "sectionD",
                      "acceptableInterestRateMin",
                      parseFloat(e.target.value),
                    )
                  }
                  step="0.5"
                  min={0}
                  max={50}
                />
              </div>
              <div className="form-group">
                <label>Maximum Acceptable Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  value={formData.sectionD.acceptableInterestRateMax}
                  onChange={(e) =>
                    updateSection(
                      "sectionD",
                      "acceptableInterestRateMax",
                      parseFloat(e.target.value),
                    )
                  }
                  step="0.5"
                  min={0}
                  max={50}
                />
              </div>
              <div className="form-group">
                <label>Preferred Repayment Frequency</label>
                <select
                  value={formData.sectionD.preferredRepaymentFrequency}
                  onChange={(e) =>
                    updateSection(
                      "sectionD",
                      "preferredRepaymentFrequency",
                      e.target.value,
                    )
                  }
                >
                  <option value="ONE_TIME">One-Time (Bullet Payment)</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Prepayment Preference</label>
                <select
                  value={formData.sectionD.prepaymentPreference}
                  onChange={(e) =>
                    updateSection(
                      "sectionD",
                      "prepaymentPreference",
                      e.target.value,
                    )
                  }
                >
                  <option value="WITHOUT_PENALTY">Without Penalty</option>
                  <option value="WITH_PENALTY">
                    With Penalty (if rate is lower)
                  </option>
                  <option value="NO_PREPAYMENT">No Prepayment Needed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.sectionD.processingFeeAcceptance}
                    onChange={(e) =>
                      updateSection(
                        "sectionD",
                        "processingFeeAcceptance",
                        e.target.checked,
                      )
                    }
                  />
                  Accept Processing Fee
                </label>
              </div>
              {formData.sectionD.processingFeeAcceptance && (
                <div className="form-group">
                  <label>Maximum Processing Fee (%)</label>
                  <input
                    type="number"
                    value={formData.sectionD.maxProcessingFeePercent}
                    onChange={(e) =>
                      updateSection(
                        "sectionD",
                        "maxProcessingFeePercent",
                        parseFloat(e.target.value),
                      )
                    }
                    step="0.5"
                    min={0}
                    max={5}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Review & Submit */}
      {currentStep === 5 && (
        <div className="step-content">
          <h2>Step 5: Review & Submit</h2>

          <div className="review-section">
            <h3>Summary of Your CWCRF</h3>

            <div className="review-block">
              <h4>Buyer Details (Section A)</h4>
              <div className="review-grid">
                <div>
                  <span>Buyer:</span> {formData.sectionA.buyerName}
                </div>
                <div>
                  <span>GSTIN:</span> {formData.sectionA.buyerGstin}
                </div>
                <div>
                  <span>Contact:</span> {formData.sectionA.buyerContactPerson}
                </div>
              </div>
            </div>

            <div className="review-block">
              <h4>Invoice Details (Section B)</h4>
              <div className="review-grid">
                <div>
                  <span>Invoice #:</span> {formData.sectionB.invoiceNumber}
                </div>
                <div>
                  <span>Amount:</span> ₹
                  {formData.sectionB.invoiceAmount?.toLocaleString()}
                </div>
                <div>
                  <span>Date:</span> {formData.sectionB.invoiceDate}
                </div>
                <div>
                  <span>Work:</span> {formData.sectionB.workDescription}
                </div>
              </div>
            </div>

            <div className="review-block">
              <h4>CWC Request (Section C)</h4>
              <div className="review-grid">
                <div>
                  <span>Requested Amount:</span> ₹
                  {formData.sectionC.requestedAmount?.toLocaleString()}
                </div>
                <div>
                  <span>Tenure:</span> {formData.sectionC.requestedTenure} days
                </div>
                <div>
                  <span>Urgency:</span> {formData.sectionC.urgencyLevel}
                </div>
                <div>
                  <span>Reason:</span> {formData.sectionC.reasonForFunding}
                </div>
              </div>
            </div>

            <div className="review-block">
              <h4>Interest Preference (Section D)</h4>
              <div className="review-grid">
                <div>
                  <span>Rate Range:</span>{" "}
                  {formData.sectionD.acceptableInterestRateMin}% -{" "}
                  {formData.sectionD.acceptableInterestRateMax}% p.a.
                </div>
                <div>
                  <span>Repayment:</span>{" "}
                  {formData.sectionD.preferredRepaymentFrequency}
                </div>
                <div>
                  <span>Processing Fee:</span>{" "}
                  {formData.sectionD.processingFeeAcceptance
                    ? `Up to ${formData.sectionD.maxProcessingFeePercent}%`
                    : "Not Accepted"}
                </div>
                <div>
                  <span>Prepayment:</span>{" "}
                  {formData.sectionD.prepaymentPreference.replace(/_/g, " ")}
                </div>
              </div>
            </div>

            <div className="declaration-box">
              <h4>Declaration</h4>
              <p>By submitting this CWCRF, I declare that:</p>
              <ul>
                <li>
                  All information provided is true and accurate to the best of
                  my knowledge
                </li>
                <li>
                  The invoice mentioned is genuine and represents actual work
                  completed
                </li>
                <li>
                  I authorize Gryork to share this information with NBFC
                  partners for quotation purposes
                </li>
                <li>
                  I understand that final terms will be subject to NBFC approval
                  and due diligence
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="step-navigation">
        {currentStep > 1 && (
          <button onClick={prevStep} className="btn-secondary">
            ← Previous
          </button>
        )}
        <div className="nav-spacer"></div>
        {currentStep < 5 && (
          <button onClick={nextStep} className="btn-primary">
            Next →
          </button>
        )}
        {currentStep === 5 && (
          <button
            onClick={handleSubmit}
            className="btn-submit"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit CWCRF"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CwcrfSubmissionPage;
