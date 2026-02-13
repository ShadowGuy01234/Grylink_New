import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cwcrfApi } from "../api";
import toast from "react-hot-toast";

interface Cwcrf {
  _id: string;
  status: string;
  buyerDetails: {
    buyerName: string;
  };
  invoiceDetails: {
    invoiceNumber: string;
    invoiceAmount: number;
  };
  cwcRequest: {
    requestedAmount: number;
    requestedTenure: number;
    urgencyLevel: string;
  };
  nbfcQuotations: Array<{
    nbfc: { name: string };
    offeredAmount: number;
    interestRate: number;
    tenure: number;
    processingFee: number;
    quotedAt: string;
  }>;
  selectedNbfc?: {
    nbfc: { name: string };
    offeredAmount: number;
    interestRate: number;
  };
  createdAt: string;
}

const statusSteps = [
  "SUBMITTED",
  "BUYER_PENDING",
  "BUYER_APPROVED",
  "UNDER_RISK_REVIEW",
  "CWCAF_READY",
  "SHARED_WITH_NBFC",
  "QUOTATIONS_RECEIVED",
  "NBFC_SELECTED",
  "DOCUMENTATION_PENDING",
  "DISBURSED",
];

const statusLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  BUYER_PENDING: "Awaiting Buyer Verification",
  BUYER_APPROVED: "Buyer Approved",
  BUYER_REJECTED: "Buyer Rejected",
  UNDER_RISK_REVIEW: "Under Risk Review (RMT)",
  CWCAF_READY: "CWCAF Generated",
  SHARED_WITH_NBFC: "Shared with NBFCs",
  QUOTATIONS_RECEIVED: "Quotations Received",
  NBFC_SELECTED: "NBFC Selected",
  DOCUMENTATION_PENDING: "Documentation Pending",
  DISBURSED: "Disbursed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

const MyCwcrfsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cwcrfs, setCwcrfs] = useState<Cwcrf[]>([]);
  const [selectedCwcrf, setSelectedCwcrf] = useState<Cwcrf | null>(null);
  const [selectingNbfc, setSelectingNbfc] = useState(false);

  useEffect(() => {
    loadMyCwcrfs();
  }, []);

  const loadMyCwcrfs = async () => {
    try {
      const res = await cwcrfApi.getMyCwcrfs();
      setCwcrfs(res.data.cwcrfs || []);
    } catch (err) {
      toast.error("Failed to load your CWCRFs");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    const idx = statusSteps.indexOf(status);
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

  const handleSelectNbfc = async (cwcrfId: string, nbfcId: string) => {
    setSelectingNbfc(true);
    try {
      await cwcrfApi.selectNbfc(cwcrfId, nbfcId);
      toast.success("NBFC selected successfully!");
      setSelectedCwcrf(null);
      loadMyCwcrfs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to select NBFC");
    } finally {
      setSelectingNbfc(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
    return <div className="page-loading">Loading your CWCRFs...</div>;
  }

  return (
    <div className="my-cwcrfs-page">
      <div className="page-header">
        <div>
          <h1>My CWC Requests</h1>
          <p>Track and manage your bill discounting requests</p>
        </div>
        <button onClick={() => navigate("/cwcrf")} className="btn-primary">
          + New CWCRF
        </button>
      </div>

      {cwcrfs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No CWCRFs Yet</h3>
          <p>You haven't submitted any CWC Request Forms yet.</p>
          <button onClick={() => navigate("/cwcrf")} className="btn-primary">
            Submit Your First CWCRF
          </button>
        </div>
      ) : (
        <div className="cwcrfs-list">
          {cwcrfs.map((cwcrf) => (
            <div
              key={cwcrf._id}
              className={`cwcrf-card ${getStatusColor(cwcrf.status)}`}
            >
              <div className="cwcrf-header">
                <div className="cwcrf-id">
                  <span className="label">CWCRF ID:</span>
                  <span className="value">
                    {cwcrf._id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <span
                  className={`status-badge ${getStatusColor(cwcrf.status)}`}
                >
                  {statusLabels[cwcrf.status] || cwcrf.status}
                </span>
              </div>

              {/* Progress Bar */}
              {!["REJECTED", "CANCELLED", "BUYER_REJECTED"].includes(
                cwcrf.status,
              ) && (
                <div className="progress-tracker">
                  {statusSteps.slice(0, 6).map((step, idx) => (
                    <div
                      key={step}
                      className={`progress-step ${getStatusIndex(cwcrf.status) >= idx ? "completed" : ""} ${getStatusIndex(cwcrf.status) === idx ? "current" : ""}`}
                    >
                      <div className="step-dot"></div>
                      <span className="step-label">
                        {statusLabels[step]?.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="cwcrf-details">
                <div className="detail-row">
                  <span className="label">Buyer:</span>
                  <span className="value">
                    {cwcrf.buyerDetails?.buyerName || "N/A"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Invoice:</span>
                  <span className="value">
                    {cwcrf.invoiceDetails?.invoiceNumber}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Invoice Amount:</span>
                  <span className="value">
                    {formatCurrency(cwcrf.invoiceDetails?.invoiceAmount || 0)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Requested:</span>
                  <span className="value">
                    {formatCurrency(cwcrf.cwcRequest?.requestedAmount || 0)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Tenure:</span>
                  <span className="value">
                    {cwcrf.cwcRequest?.requestedTenure} days
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Submitted:</span>
                  <span className="value">{formatDate(cwcrf.createdAt)}</span>
                </div>
              </div>

              {/* NBFC Quotations Section */}
              {cwcrf.nbfcQuotations && cwcrf.nbfcQuotations.length > 0 && (
                <div className="quotations-section">
                  <h4>NBFC Quotations ({cwcrf.nbfcQuotations.length})</h4>

                  {cwcrf.selectedNbfc ? (
                    <div className="selected-nbfc">
                      <span className="selected-label">✓ Selected NBFC:</span>
                      <div className="nbfc-details">
                        <strong>{cwcrf.selectedNbfc.nbfc?.name}</strong>
                        <span>
                          Amount:{" "}
                          {formatCurrency(cwcrf.selectedNbfc.offeredAmount)}
                        </span>
                        <span>
                          Rate: {cwcrf.selectedNbfc.interestRate}% p.a.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="quotations-list">
                      {cwcrf.nbfcQuotations.map((quote, idx) => (
                        <div key={idx} className="quotation-card">
                          <div className="quote-header">
                            <strong>
                              {quote.nbfc?.name || `NBFC ${idx + 1}`}
                            </strong>
                            <span className="quote-date">
                              Quoted: {formatDate(quote.quotedAt)}
                            </span>
                          </div>
                          <div className="quote-details">
                            <div className="quote-item">
                              <span>Amount:</span>
                              <strong>
                                {formatCurrency(quote.offeredAmount)}
                              </strong>
                            </div>
                            <div className="quote-item">
                              <span>Interest Rate:</span>
                              <strong>{quote.interestRate}% p.a.</strong>
                            </div>
                            <div className="quote-item">
                              <span>Tenure:</span>
                              <strong>{quote.tenure} days</strong>
                            </div>
                            <div className="quote-item">
                              <span>Processing Fee:</span>
                              <strong>{quote.processingFee}%</strong>
                            </div>
                          </div>
                          {cwcrf.status === "QUOTATIONS_RECEIVED" && (
                            <button
                              onClick={() =>
                                handleSelectNbfc(
                                  cwcrf._id,
                                  (quote as any).nbfc?._id,
                                )
                              }
                              className="btn-select"
                              disabled={selectingNbfc}
                            >
                              {selectingNbfc
                                ? "Selecting..."
                                : "Select This NBFC"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="cwcrf-actions">
                <button
                  onClick={() => setSelectedCwcrf(cwcrf)}
                  className="btn-secondary"
                >
                  View Details
                </button>
                {cwcrf.status === "QUOTATIONS_RECEIVED" && (
                  <span className="action-required">
                    Action Required - Select NBFC
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedCwcrf && (
        <div className="modal-overlay" onClick={() => setSelectedCwcrf(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>CWCRF Details</h2>
              <button
                onClick={() => setSelectedCwcrf(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Section A - Buyer Details</h3>
                <p>
                  <strong>Buyer:</strong>{" "}
                  {selectedCwcrf.buyerDetails?.buyerName}
                </p>
              </div>
              <div className="detail-section">
                <h3>Section B - Invoice Details</h3>
                <p>
                  <strong>Invoice #:</strong>{" "}
                  {selectedCwcrf.invoiceDetails?.invoiceNumber}
                </p>
                <p>
                  <strong>Amount:</strong>{" "}
                  {formatCurrency(
                    selectedCwcrf.invoiceDetails?.invoiceAmount || 0,
                  )}
                </p>
              </div>
              <div className="detail-section">
                <h3>Section C - CWC Request</h3>
                <p>
                  <strong>Requested Amount:</strong>{" "}
                  {formatCurrency(
                    selectedCwcrf.cwcRequest?.requestedAmount || 0,
                  )}
                </p>
                <p>
                  <strong>Tenure:</strong>{" "}
                  {selectedCwcrf.cwcRequest?.requestedTenure} days
                </p>
                <p>
                  <strong>Urgency:</strong>{" "}
                  {selectedCwcrf.cwcRequest?.urgencyLevel}
                </p>
              </div>
              <div className="detail-section">
                <h3>Current Status</h3>
                <p
                  className={`status-text ${getStatusColor(selectedCwcrf.status)}`}
                >
                  {statusLabels[selectedCwcrf.status] || selectedCwcrf.status}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setSelectedCwcrf(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCwcrfsPage;
