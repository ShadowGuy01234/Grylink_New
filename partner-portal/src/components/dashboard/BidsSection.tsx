import React from "react";
import { motion } from "framer-motion";
import { Bid, Case } from "../../types";

interface BidsSectionProps {
  bids: Bid[];
  cases: Case[]; // needed for placing new bids
  isEpc: boolean;
  onPlaceBid: (data: any) => Promise<void>; // Adjust type as needed
  onNegotiate: (bidId: string, counterOffer: any) => Promise<void>;
  onLockBid: (bidId: string) => Promise<void>;
}

export const BidsSection: React.FC<BidsSectionProps> = ({
  bids,
  cases,
  isEpc,
  onPlaceBid,
  onNegotiate,
  onLockBid,
}) => {
  const [bidModal, setBidModal] = React.useState<any>(null);
  const [bidForm, setBidForm] = React.useState({
    bidAmount: "",
    fundingDurationDays: "",
  });
  const [negotiatingBid, setNegotiatingBid] = React.useState<string | null>(
    null,
  );
  const [counterOffer, setCounterOffer] = React.useState({
    amount: "",
    duration: "",
    message: "",
  });

  const handlePlaceBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidModal) return;

    await onPlaceBid({
      caseId: bidModal._id,
      bidAmount: Number(bidForm.bidAmount),
      fundingDurationDays: Number(bidForm.fundingDurationDays),
    });

    setBidModal(null);
    setBidForm({ bidAmount: "", fundingDurationDays: "" });
  };

  const handleNegotiateSubmit = async (bidId: string) => {
    await onNegotiate(bidId, {
      amount: parseFloat(counterOffer.amount),
      duration: parseInt(counterOffer.duration) || undefined,
      message: counterOffer.message,
    });
    setNegotiatingBid(null);
    setCounterOffer({ amount: "", duration: "", message: "" });
  };

  return (
    <motion.div
      key="bids"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="section"
    >
      {/* Render Bids Logic Here - adapting from DashboardPage.tsx */}
      {/* Helper to filter cases available for bidding */}
      {isEpc && (
        <div className="available-cases-section">
          <h3>Available for Bidding</h3>
          <div className="cases-grid">
            {cases
              .filter((c) => c.status === "EPC_VERIFIED")
              .map((c) => (
                <div key={c._id} className="bid-case-card">
                  <div className="card-header">
                    <h4>{c.caseNumber}</h4>
                    <span className="amount">
                      ₹{c.billId?.amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="card-body">
                    <p>
                      <strong>SC:</strong> {c.subContractorId?.companyName}
                    </p>
                    <p>
                      <strong>Bill Date:</strong>{" "}
                      {new Date(c.billId?.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setBidModal(c)}
                    className="btn-primary-sm"
                  >
                    Place Bid
                  </button>
                </div>
              ))}
            {cases.filter((c) => c.status === "EPC_VERIFIED").length === 0 && (
              <p className="empty-text">No cases available for bidding.</p>
            )}
          </div>
        </div>
      )}

      {/* Existing Bids */}
      <h3>My Active Bids</h3>
      {bids.length === 0 ? (
        <div className="empty-state">No active bids.</div>
      ) : (
        <div className="bids-list">
          {bids.map((bid) => (
            <div key={bid._id} className="bid-card-row">
              <div className="bid-info">
                <span className="case-ref">Case: {bid.caseId?.caseNumber}</span>
                <div className="term-highlight">
                  <span className="amount">
                    ₹{bid.bidAmount.toLocaleString()}
                  </span>
                  <span className="duration">
                    {bid.fundingDurationDays} Days
                  </span>
                </div>
                <div className="bid-status">
                  <span
                    className={`badge badge-${bid.status === "ACCEPTED" ? "green" : "blue"}`}
                  >
                    {bid.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              {/* Negotiation and Actions */}
              <div className="bid-actions">
                {bid.status === "NEGOTIATION_IN_PROGRESS" && (
                  <button
                    onClick={() => setNegotiatingBid(bid._id)}
                    className="btn-secondary-sm"
                  >
                    Respond
                  </button>
                )}
                {bid.status === "ACCEPTED" ||
                  (bid.status === "NEGOTIATION_IN_PROGRESS" && (
                    <button
                      onClick={() => onLockBid(bid._id)}
                      className="btn-lock"
                      title="Lock Commercial Terms"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Lock Deal
                    </button>
                  ))}
              </div>

              {/* Negotiation Modal/Form inline */}
              {negotiatingBid === bid._id && (
                <div className="negotiation-panel">
                  {/* Simplified negotiation form */}
                  <input
                    type="number"
                    placeholder="Counter Amount"
                    value={counterOffer.amount}
                    onChange={(e) =>
                      setCounterOffer({
                        ...counterOffer,
                        amount: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Days"
                    value={counterOffer.duration}
                    onChange={(e) =>
                      setCounterOffer({
                        ...counterOffer,
                        duration: e.target.value,
                      })
                    }
                  />
                  <button onClick={() => handleNegotiateSubmit(bid._id)}>
                    Send
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Place Bid Modal */}
      {bidModal && (
        <div className="modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content"
          >
            <h2>Place Bid for {bidModal.caseNumber}</h2>
            <form onSubmit={handlePlaceBidSubmit}>
              <div className="form-group">
                <label>Financing Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={bidForm.bidAmount}
                  onChange={(e) =>
                    setBidForm({
                      ...bidForm,
                      bidAmount: e.target.value,
                    })
                  }
                  placeholder="Enter amount"
                />
              </div>
              <div className="form-group">
                <label>Funding Duration (Days)</label>
                <input
                  type="number"
                  required
                  value={bidForm.fundingDurationDays}
                  onChange={(e) =>
                    setBidForm({
                      ...bidForm,
                      fundingDurationDays: e.target.value,
                    })
                  }
                  placeholder="e.g. 90"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setBidModal(null)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Bid
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
