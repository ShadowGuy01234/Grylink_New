import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Case } from "../../types";

interface CasesAndBillsSectionProps {
  cases: Case[];
  onReviewCase: (caseId: string, decision: string) => Promise<void>;
  isEpc: boolean;
}

export const CasesAndBillsSection: React.FC<CasesAndBillsSectionProps> = ({
  cases,
  onReviewCase,
  isEpc,
}) => {
  const [selectedCase, setSelectedCase] = React.useState<Case | null>(null);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      READY_FOR_COMPANY_REVIEW: "badge-purple",
      EPC_VERIFIED: "badge-green",
      EPC_REJECTED: "badge-red",
      BID_PLACED: "badge-blue",
      COMMERCIAL_LOCKED: "badge-green",
      NEGOTIATION_IN_PROGRESS: "badge-yellow",
    };
    return (
      <span className={`badge ${colors[status] || "badge-gray"}`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <motion.div
      key="cases"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="section"
    >
      <div className="section-header">
        <div>
          <h2>Cases & Bills</h2>
          <p className="section-subtitle">
            Review bills and manage ongoing cases
          </p>
        </div>
      </div>

      <div className="cases-list">
        {cases.length === 0 ? (
          <div className="empty-state">No active cases found.</div>
        ) : (
          cases.map((c, index) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="case-card"
            >
              {/* ── Case Header ── */}
              <div className="case-header">
                <div className="case-id">
                  <span className="case-number">{c.caseNumber}</span>
                  {statusBadge(c.status)}
                </div>
              </div>

              {/* ── Case Body Grid ── */}
              <div className="case-body">
                <div className="case-row">
                  <div className="case-col">
                    <span className="label">Sub-Contractor</span>
                    <span className="value">
                      {c.subContractorId?.companyName || "Unknown"}
                    </span>
                  </div>
                  <div className="case-col">
                    <span className="label">Bill Amount</span>
                    <span className="value amount">
                      ₹{c.billId?.amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="case-col">
                    <span className="label">Bill Number</span>
                    <span className="value">{c.billId?.billNumber || "—"}</span>
                  </div>
                  {c.cwcaf?.riskCategory && (
                    <div className="case-col">
                      <span className="label">Risk Category</span>
                      <span
                        className={`risk-badge ${c.cwcaf.riskCategory?.toLowerCase()}`}
                      >
                        {c.cwcaf.riskCategory}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Case Actions ── */}
              <div className="case-actions">
                {isEpc && c.status === "READY_FOR_COMPANY_REVIEW" && (
                  <>
                    <button
                      onClick={() => onReviewCase(c._id, "approve")}
                      className="btn-success"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => onReviewCase(c._id, "reject")}
                      className="btn-danger-outline"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Reject
                    </button>
                  </>
                )}
                <button
                  className="btn-outline"
                  onClick={() => setSelectedCase(c)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  View Details
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ── Case Details Modal ── */}
      <AnimatePresence>
        {selectedCase && (
          <div className="modal-overlay" onClick={() => setSelectedCase(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="modal-content"
              style={{ maxWidth: 560 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>Case Details</h2>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "0.8rem",
                      color: "#64748b",
                    }}
                  >
                    {selectedCase.caseNumber}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {statusBadge(selectedCase.status)}
                  <button
                    onClick={() => setSelectedCase(null)}
                    style={{
                      background: "#f1f5f9",
                      border: "none",
                      borderRadius: 8,
                      width: 32,
                      height: 32,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="#475569"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Sub-Contractor</span>
                  <span className="value">
                    {selectedCase.subContractorId?.companyName || "Unknown"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Bill Amount</span>
                  <span className="value amount">
                    ₹{selectedCase.billId?.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Bill Number</span>
                  <span className="value">
                    {selectedCase.billId?.billNumber || "—"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Bill Date</span>
                  <span className="value">
                    {selectedCase.billId?.uploadedAt
                      ? new Date(
                          selectedCase.billId.uploadedAt,
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
                {selectedCase.cwcaf?.riskCategory && (
                  <div className="detail-item">
                    <span className="label">Risk Category</span>
                    <span
                      className={`risk-badge ${selectedCase.cwcaf.riskCategory?.toLowerCase()}`}
                    >
                      {selectedCase.cwcaf.riskCategory}
                    </span>
                  </div>
                )}
                {selectedCase.cwcaf?.riskAssessmentDetails?.totalScore !==
                  undefined && (
                  <div className="detail-item">
                    <span className="label">Risk Score</span>
                    <span className="value">
                      {selectedCase.cwcaf.riskAssessmentDetails.totalScore}/100
                    </span>
                  </div>
                )}
              </div>

              {/* EPC Actions inside modal too */}
              {isEpc && selectedCase.status === "READY_FOR_COMPANY_REVIEW" && (
                <div className="modal-actions">
                  <button
                    onClick={async () => {
                      await onReviewCase(selectedCase._id, "reject");
                      setSelectedCase(null);
                    }}
                    className="btn-danger-outline"
                  >
                    Reject Case
                  </button>
                  <button
                    onClick={async () => {
                      await onReviewCase(selectedCase._id, "approve");
                      setSelectedCase(null);
                    }}
                    className="btn-success"
                  >
                    Approve Case
                  </button>
                </div>
              )}

              {(!isEpc ||
                selectedCase.status !== "READY_FOR_COMPANY_REVIEW") && (
                <div className="modal-actions">
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="btn-ghost"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
