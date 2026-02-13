import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cwcrfApi } from "../api";
import toast from "react-hot-toast";

interface CwcrfDetail {
  _id: string;
  cwcrfNumber: string;
  status: string;
  buyerDetails: {
    buyerName: string;
    buyerGstin: string;
    projectName: string;
    projectLocation: string;
  };
  invoiceDetails: {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceAmount: number;
    expectedPaymentDate: string;
    workDescription: string;
  };
  cwcRequest: {
    requestedAmount: number;
    requestedTenure: number;
    urgencyLevel: string;
    reasonForFunding: string;
  };
  interestPreference: {
    preferenceType: string;
    minRate: number;
    maxRate: number;
  };
  nbfcQuotations: Array<{
    nbfc: { _id: string; name: string };
    offeredAmount: number;
    interestRate: number;
    tenure: number;
    processingFee: number;
    quotedAt: string;
    status: string;
  }>;
  selectedNbfc?: {
    nbfc: { name: string };
    offeredAmount: number;
    interestRate: number;
    selectedAt: string;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    updatedBy: string;
    notes: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const statusSteps = [
  { key: "SUBMITTED", label: "Submitted", icon: "📝" },
  { key: "BUYER_PENDING", label: "Awaiting Buyer", icon: "⏳" },
  { key: "BUYER_APPROVED", label: "Buyer Approved", icon: "✅" },
  { key: "UNDER_RISK_REVIEW", label: "Risk Review", icon: "🔍" },
  { key: "CWCAF_READY", label: "CWCAF Ready", icon: "📋" },
  { key: "SHARED_WITH_NBFC", label: "Shared with NBFCs", icon: "📤" },
  { key: "QUOTATIONS_RECEIVED", label: "Quotes Received", icon: "💰" },
  { key: "NBFC_SELECTED", label: "NBFC Selected", icon: "🤝" },
  { key: "DOCUMENTATION_PENDING", label: "Documentation", icon: "📄" },
  { key: "DISBURSED", label: "Disbursed", icon: "💵" },
];

const statusLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  BUYER_PENDING: "Awaiting Buyer Verification",
  BUYER_APPROVED: "Buyer Approved",
  BUYER_REJECTED: "Buyer Rejected",
  UNDER_RISK_REVIEW: "Under Risk Review",
  CWCAF_READY: "CWCAF Generated",
  SHARED_WITH_NBFC: "Shared with NBFCs",
  QUOTATIONS_RECEIVED: "Quotations Received",
  NBFC_SELECTED: "NBFC Selected",
  DOCUMENTATION_PENDING: "Documentation Pending",
  DISBURSED: "Disbursed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

const CwcrfDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cwcrf, setCwcrf] = useState<CwcrfDetail | null>(null);
  const [selectingNbfc, setSelectingNbfc] = useState(false);

  useEffect(() => {
    loadCwcrfDetail();
  }, [id]);

  const loadCwcrfDetail = async () => {
    if (!id) return;
    try {
      const res = await cwcrfApi.getById(id);
      setCwcrf(res.data.cwcrf || res.data);
    } catch (err) {
      toast.error("Failed to load CWCRF details");
      navigate("/my-cwcrfs");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNbfc = async (nbfcId: string) => {
    if (!cwcrf) return;
    setSelectingNbfc(true);
    try {
      await cwcrfApi.selectNbfc(cwcrf._id, nbfcId);
      toast.success("NBFC selected successfully!");
      loadCwcrfDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to select NBFC");
    } finally {
      setSelectingNbfc(false);
    }
  };

  const getStatusIndex = (status: string) => {
    const idx = statusSteps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const getStatusColor = (status: string) => {
    if (["DISBURSED"].includes(status)) return "status-success";
    if (["REJECTED", "CANCELLED", "BUYER_REJECTED"].includes(status))
      return "status-error";
    if (["QUOTATIONS_RECEIVED", "NBFC_SELECTED"].includes(status))
      return "status-action";
    return "status-progress";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="page-loading">Loading CWCRF details...</div>;
  }

  if (!cwcrf) {
    return (
      <div className="cwcrf-detail-page">
        <div className="empty-state">
          <h3>CWCRF Not Found</h3>
          <button onClick={() => navigate("/my-cwcrfs")} className="btn-primary">
            Back to My CWCRFs
          </button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(cwcrf.status);

  return (
    <div className="cwcrf-detail-page">
      {/* Header */}
      <div className="detail-header">
        <button onClick={() => navigate("/my-cwcrfs")} className="btn-back">
          ← Back to My CWCRFs
        </button>
        <div className="header-info">
          <h1>
            CWCRF #{cwcrf.cwcrfNumber || cwcrf._id.slice(-8).toUpperCase()}
          </h1>
          <span className={`status-badge ${getStatusColor(cwcrf.status)}`}>
            {statusLabels[cwcrf.status] || cwcrf.status}
          </span>
        </div>
        <p className="submitted-date">Submitted on {formatDate(cwcrf.createdAt)}</p>
      </div>

      {/* Progress Timeline */}
      {!["REJECTED", "CANCELLED", "BUYER_REJECTED"].includes(cwcrf.status) && (
        <div className="timeline-section">
          <h2>Progress Timeline</h2>
          <div className="status-timeline">
            {statusSteps.map((step, idx) => (
              <div
                key={step.key}
                className={`timeline-step ${idx <= currentStatusIndex ? "completed" : ""} ${idx === currentStatusIndex ? "current" : ""}`}
              >
                <div className="step-icon">{step.icon}</div>
                <div className="step-info">
                  <span className="step-name">{step.label}</span>
                  {idx <= currentStatusIndex && cwcrf.timeline && (
                    <span className="step-time">
                      {cwcrf.timeline.find((t) => t.status === step.key)
                        ? formatDateTime(
                            cwcrf.timeline.find((t) => t.status === step.key)!.timestamp
                          )
                        : idx === 0
                        ? formatDateTime(cwcrf.createdAt)
                        : ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Required Banner */}
      {cwcrf.status === "QUOTATIONS_RECEIVED" && (
        <div className="action-banner">
          <span className="action-icon">⚠️</span>
          <div>
            <strong>Action Required</strong>
            <p>You have received quotations from NBFCs. Please review and select one to proceed.</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="detail-grid">
        {/* Left Column - Details */}
        <div className="detail-column">
          {/* Buyer Details */}
          <div className="detail-card">
            <h3>Section A - Buyer Details</h3>
            <div className="detail-rows">
              <div className="detail-item">
                <span>Buyer Name</span>
                <strong>{cwcrf.buyerDetails?.buyerName || "N/A"}</strong>
              </div>
              <div className="detail-item">
                <span>GSTIN</span>
                <strong>{cwcrf.buyerDetails?.buyerGstin || "N/A"}</strong>
              </div>
              <div className="detail-item">
                <span>Project Name</span>
                <strong>{cwcrf.buyerDetails?.projectName || "N/A"}</strong>
              </div>
              <div className="detail-item">
                <span>Project Location</span>
                <strong>{cwcrf.buyerDetails?.projectLocation || "N/A"}</strong>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="detail-card">
            <h3>Section B - Invoice Details</h3>
            <div className="detail-rows">
              <div className="detail-item">
                <span>Invoice Number</span>
                <strong>{cwcrf.invoiceDetails?.invoiceNumber}</strong>
              </div>
              <div className="detail-item">
                <span>Invoice Date</span>
                <strong>
                  {cwcrf.invoiceDetails?.invoiceDate
                    ? formatDate(cwcrf.invoiceDetails.invoiceDate)
                    : "N/A"}
                </strong>
              </div>
              <div className="detail-item highlight">
                <span>Invoice Amount</span>
                <strong>
                  {formatCurrency(cwcrf.invoiceDetails?.invoiceAmount || 0)}
                </strong>
              </div>
              <div className="detail-item">
                <span>Expected Payment Date</span>
                <strong>
                  {cwcrf.invoiceDetails?.expectedPaymentDate
                    ? formatDate(cwcrf.invoiceDetails.expectedPaymentDate)
                    : "N/A"}
                </strong>
              </div>
              {cwcrf.invoiceDetails?.workDescription && (
                <div className="detail-item full-width">
                  <span>Work Description</span>
                  <strong>{cwcrf.invoiceDetails.workDescription}</strong>
                </div>
              )}
            </div>
          </div>

          {/* CWC Request Details */}
          <div className="detail-card">
            <h3>Section C - CWC Request</h3>
            <div className="detail-rows">
              <div className="detail-item highlight">
                <span>Requested Amount</span>
                <strong>{formatCurrency(cwcrf.cwcRequest?.requestedAmount || 0)}</strong>
              </div>
              <div className="detail-item">
                <span>Requested Tenure</span>
                <strong>{cwcrf.cwcRequest?.requestedTenure} days</strong>
              </div>
              <div className="detail-item">
                <span>Urgency Level</span>
                <strong className={`urgency-${cwcrf.cwcRequest?.urgencyLevel?.toLowerCase()}`}>
                  {cwcrf.cwcRequest?.urgencyLevel || "NORMAL"}
                </strong>
              </div>
              {cwcrf.cwcRequest?.reasonForFunding && (
                <div className="detail-item full-width">
                  <span>Reason for Funding</span>
                  <strong>{cwcrf.cwcRequest.reasonForFunding}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Interest Preference */}
          <div className="detail-card">
            <h3>Section D - Interest Preference</h3>
            <div className="detail-rows">
              <div className="detail-item">
                <span>Preference Type</span>
                <strong>{cwcrf.interestPreference?.preferenceType || "RANGE"}</strong>
              </div>
              <div className="detail-item">
                <span>Acceptable Rate Range</span>
                <strong>
                  {cwcrf.interestPreference?.minRate}% - {cwcrf.interestPreference?.maxRate}% p.a.
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Quotations */}
        <div className="quotations-column">
          <div className="detail-card">
            <h3>
              NBFC Quotations {cwcrf.nbfcQuotations?.length ? `(${cwcrf.nbfcQuotations.length})` : ""}
            </h3>

            {cwcrf.selectedNbfc ? (
              <div className="selected-nbfc-card">
                <div className="selected-badge">✓ Selected NBFC</div>
                <div className="nbfc-name">{cwcrf.selectedNbfc.nbfc?.name}</div>
                <div className="selected-details">
                  <div>
                    <span>Sanctioned Amount</span>
                    <strong>{formatCurrency(cwcrf.selectedNbfc.offeredAmount)}</strong>
                  </div>
                  <div>
                    <span>Interest Rate</span>
                    <strong>{cwcrf.selectedNbfc.interestRate}% p.a.</strong>
                  </div>
                  <div>
                    <span>Selected On</span>
                    <strong>
                      {cwcrf.selectedNbfc.selectedAt
                        ? formatDate(cwcrf.selectedNbfc.selectedAt)
                        : "Recently"}
                    </strong>
                  </div>
                </div>
              </div>
            ) : cwcrf.nbfcQuotations && cwcrf.nbfcQuotations.length > 0 ? (
              <div className="quotations-list-detail">
                {cwcrf.nbfcQuotations.map((quote, idx) => (
                  <div key={idx} className="quotation-detail-card">
                    <div className="quote-nbfc-name">
                      {quote.nbfc?.name || `NBFC ${idx + 1}`}
                    </div>
                    <div className="quote-info-grid">
                      <div>
                        <span>Offered Amount</span>
                        <strong>{formatCurrency(quote.offeredAmount)}</strong>
                      </div>
                      <div>
                        <span>Interest Rate</span>
                        <strong>{quote.interestRate}% p.a.</strong>
                      </div>
                      <div>
                        <span>Tenure</span>
                        <strong>{quote.tenure} days</strong>
                      </div>
                      <div>
                        <span>Processing Fee</span>
                        <strong>{quote.processingFee}%</strong>
                      </div>
                    </div>
                    <div className="quote-footer">
                      <span className="quoted-date">
                        Quoted: {formatDate(quote.quotedAt)}
                      </span>
                      {cwcrf.status === "QUOTATIONS_RECEIVED" && (
                        <button
                          onClick={() => handleSelectNbfc(quote.nbfc?._id)}
                          className="btn-select-nbfc"
                          disabled={selectingNbfc}
                        >
                          {selectingNbfc ? "Selecting..." : "Select"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-quotations">
                <p>
                  {cwcrf.status === "SHARED_WITH_NBFC"
                    ? "Waiting for NBFCs to submit quotations..."
                    : cwcrf.status === "SUBMITTED" || cwcrf.status === "BUYER_PENDING"
                    ? "Quotations will be available after buyer verification and risk review."
                    : "No quotations received yet."}
                </p>
              </div>
            )}
          </div>

          {/* Status History */}
          {cwcrf.timeline && cwcrf.timeline.length > 0 && (
            <div className="detail-card">
              <h3>Status History</h3>
              <div className="history-list">
                {cwcrf.timeline.map((entry, idx) => (
                  <div key={idx} className="history-item">
                    <div className="history-dot"></div>
                    <div className="history-info">
                      <span className="history-status">
                        {statusLabels[entry.status] || entry.status}
                      </span>
                      <span className="history-time">
                        {formatDateTime(entry.timestamp)}
                      </span>
                      {entry.notes && (
                        <span className="history-notes">{entry.notes}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CwcrfDetailPage;
