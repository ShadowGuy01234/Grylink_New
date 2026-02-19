import React from "react";
import { motion } from "framer-motion";
import { Case } from "../../types";

interface CasesAndBillsSectionProps {
  cases: Case[];
  // bills: Bill[]; // Removed unused prop
  onReviewCase: (caseId: string, decision: string) => Promise<void>;
  isEpc: boolean;
}

export const CasesAndBillsSection: React.FC<CasesAndBillsSectionProps> = ({
  cases,
  // bills,
  onReviewCase,
  isEpc,
}) => {
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
              <div className="case-header">
                <div className="case-id">
                  <span className="label">Case ID</span>
                  <span className="value">{c.caseNumber}</span>
                </div>
                <div>{statusBadge(c.status)}</div>
              </div>
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
                    <span className="value">{c.billId?.billNumber}</span>
                  </div>
                </div>
                {c.cwcaf && (
                  <div className="case-row risk-row">
                    <div className="case-col">
                      <span className="label">Risk Category</span>
                      <span
                        className={`risk-badge ${c.cwcaf.riskCategory?.toLowerCase()}`}
                      >
                        {c.cwcaf.riskCategory}
                      </span>
                    </div>
                    {c.cwcaf.riskAssessmentDetails && (
                      <div className="case-col">
                        <span className="label">Risk Score</span>
                        <span className="value">
                          {c.cwcaf.riskAssessmentDetails.totalScore}/100
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="case-actions">
                {isEpc && c.status === "READY_FOR_COMPANY_REVIEW" && (
                  <>
                    <button
                      onClick={() => onReviewCase(c._id, "approve")}
                      className="btn-success"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Approve Case
                    </button>
                    <button
                      onClick={() => onReviewCase(c._id, "reject")}
                      className="btn-danger-outline"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Reject
                    </button>
                  </>
                )}
                <button className="btn-secondary">View Details</button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
