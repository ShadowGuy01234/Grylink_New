import React, { useState, useEffect } from "react";
import { cwcrfApi } from "../api";
import toast from "react-hot-toast";

interface PendingCwcrf {
  _id: string;
  sellerDetails: {
    name: string;
    companyName: string;
    gstin: string;
  };
  invoiceDetails: {
    invoiceNumber: string;
    invoiceAmount: number;
    invoiceDate: string;
    workDescription: string;
  };
  cwcRequest: {
    requestedAmount: number;
    requestedTenure: number;
    urgencyLevel: string;
    reasonForFunding: string;
  };
  status: string;
  createdAt: string;
}

const CwcrfVerificationPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pendingCwcrfs, setPendingCwcrfs] = useState<PendingCwcrf[]>([]);
  const [selectedCwcrf, setSelectedCwcrf] = useState<PendingCwcrf | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  // Verification Form - Inputs A, B, C
  const [verificationForm, setVerificationForm] = useState({
    // Input A: Approved Amount
    approvedAmount: 0,
    // Input B: Repayment Timeline
    repaymentTimeline: 30 as number,
    // Input C: Repayment Arrangement
    repaymentArrangement: { source: "DIRECT_DEDUCTION", otherDetails: "", remarks: "" },
    notes: "",
  });

  // Rejection Form
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    loadPendingCwcrfs();
  }, []);

  const loadPendingCwcrfs = async () => {
    try {
      const res = await cwcrfApi.getPendingVerifications();
      setPendingCwcrfs(res.data.cwcrfs || []);
    } catch (err) {
      toast.error("Failed to load pending verifications");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCwcrf = (cwcrf: PendingCwcrf) => {
    setSelectedCwcrf(cwcrf);
    setVerificationForm({
      approvedAmount: cwcrf.cwcRequest.requestedAmount,
      repaymentTimeline: Number(cwcrf.cwcRequest.requestedTenure) || 30,
      repaymentArrangement: { source: "DIRECT_DEDUCTION", otherDetails: "", remarks: "" },
      notes: "",
    });
  };

  const handleVerify = async () => {
    if (!selectedCwcrf) return;

    // Validation
    if (verificationForm.approvedAmount <= 0) {
      toast.error("Please enter a valid approved amount");
      return;
    }
    if (
      verificationForm.approvedAmount >
      selectedCwcrf.invoiceDetails.invoiceAmount
    ) {
      toast.error("Approved amount cannot exceed invoice amount");
      return;
    }

    setVerifying(true);
    try {
      await cwcrfApi.verifyCwcrf(selectedCwcrf._id, {
        approvedAmount: verificationForm.approvedAmount,
        repaymentTimeline: verificationForm.repaymentTimeline,
        repaymentArrangement: verificationForm.repaymentArrangement,
        notes: verificationForm.notes,
      });
      toast.success("CWCRF verified successfully!");
      setSelectedCwcrf(null);
      loadPendingCwcrfs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCwcrf) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setRejecting(true);
    try {
      await cwcrfApi.rejectCwcrf(selectedCwcrf._id, { reason: rejectionReason });
      toast.success("CWCRF rejected");
      setShowRejectModal(false);
      setSelectedCwcrf(null);
      setRejectionReason("");
      loadPendingCwcrfs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Rejection failed");
    } finally {
      setRejecting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors: Record<string, string> = {
      NORMAL: "bg-blue-100 text-blue-800",
      URGENT: "bg-yellow-100 text-yellow-800",
      CRITICAL: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded ${colors[urgency] || colors.NORMAL}`}
      >
        {urgency}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading pending verifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            CWCRF Verification
          </h1>
          <p className="text-gray-600">
            Verify CWC Request Forms from your sub-contractors
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-yellow-600">
              {pendingCwcrfs.length}
            </h3>
            <p className="text-gray-600">Pending Verifications</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-orange-600">
              {
                pendingCwcrfs.filter(
                  (c) => c.cwcRequest.urgencyLevel === "URGENT",
                ).length
              }
            </h3>
            <p className="text-gray-600">Urgent Requests</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-red-600">
              {
                pendingCwcrfs.filter(
                  (c) => c.cwcRequest.urgencyLevel === "CRITICAL",
                ).length
              }
            </h3>
            <p className="text-gray-600">Critical Requests</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Pending CWCRFs</h2>
              </div>
              {pendingCwcrfs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No pending verifications</p>
                </div>
              ) : (
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {pendingCwcrfs.map((cwcrf) => (
                    <div
                      key={cwcrf._id}
                      onClick={() => handleSelectCwcrf(cwcrf)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedCwcrf?._id === cwcrf._id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">
                          {cwcrf.sellerDetails?.companyName}
                        </span>
                        {getUrgencyBadge(cwcrf.cwcRequest.urgencyLevel)}
                      </div>
                      <p className="text-xs text-gray-500">
                        Invoice: {cwcrf.invoiceDetails.invoiceNumber}
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {formatCurrency(cwcrf.cwcRequest.requestedAmount)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted: {formatDate(cwcrf.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Verification Form */}
          <div className="lg:col-span-2">
            {selectedCwcrf ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Verify CWCRF</h2>
                  <button
                    onClick={() => setSelectedCwcrf(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6">
                  {/* Seller & Invoice Info */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Seller Details
                      </h3>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">
                          {selectedCwcrf.sellerDetails?.companyName}
                        </p>
                        <p className="text-sm text-gray-600">
                          GSTIN: {selectedCwcrf.sellerDetails?.gstin}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Invoice Details
                      </h3>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">
                          {selectedCwcrf.invoiceDetails.invoiceNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          Amount:{" "}
                          {formatCurrency(
                            selectedCwcrf.invoiceDetails.invoiceAmount,
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          Date:{" "}
                          {formatDate(selectedCwcrf.invoiceDetails.invoiceDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CWC Request Info */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      CWC Request
                    </h3>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">
                            Requested Amount
                          </p>
                          <p className="font-semibold">
                            {formatCurrency(
                              selectedCwcrf.cwcRequest.requestedAmount,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Tenure</p>
                          <p className="font-semibold">
                            {selectedCwcrf.cwcRequest.requestedTenure} days
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Urgency</p>
                          {getUrgencyBadge(
                            selectedCwcrf.cwcRequest.urgencyLevel,
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-gray-500">
                          Reason for Funding
                        </p>
                        <p className="text-sm">
                          {selectedCwcrf.cwcRequest.reasonForFunding}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Verification Inputs */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Buyer Verification (Inputs A, B, C)
                    </h3>

                    {/* Input A: Approved Amount */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs mr-2">
                          A
                        </span>
                        Approved Amount (₹) *
                      </label>
                      <input
                        type="number"
                        value={verificationForm.approvedAmount}
                        onChange={(e) =>
                          setVerificationForm((prev) => ({
                            ...prev,
                            approvedAmount: parseFloat(e.target.value) || 0,
                          }))
                        }
                        max={selectedCwcrf.invoiceDetails.invoiceAmount}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum:{" "}
                        {formatCurrency(
                          selectedCwcrf.invoiceDetails.invoiceAmount,
                        )}
                      </p>
                    </div>

                    {/* Input B: Repayment Timeline */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs mr-2">
                          B
                        </span>
                        Repayment Timeline (Days) *
                      </label>
                      <select
                        value={verificationForm.repaymentTimeline}
                        onChange={(e) =>
                          setVerificationForm((prev) => ({
                            ...prev,
                            repaymentTimeline: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="15">15 Days</option>
                        <option value="30">30 Days</option>
                        <option value="45">45 Days</option>
                        <option value="60">60 Days</option>
                        <option value="90">90 Days</option>
                        <option value="120">120 Days</option>
                      </select>
                    </div>

                    {/* Input C: Repayment Arrangement */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs mr-2">
                          C
                        </span>
                        Repayment Arrangement *
                      </label>
                      <select
                        value={verificationForm.repaymentArrangement.source}
                        onChange={(e) =>
                          setVerificationForm((prev) => ({
                            ...prev,
                            repaymentArrangement: { ...prev.repaymentArrangement, source: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="DIRECT_DEDUCTION">
                          Direct Deduction from Pending Bills
                        </option>
                        <option value="BANK_TRANSFER">
                          Bank Transfer by Sub-Contractor
                        </option>
                        <option value="ESCROW">
                          Escrow Account Settlement
                        </option>
                        <option value="PARTIAL_DEDUCTION">
                          Partial Deduction + Bank Transfer
                        </option>
                      </select>
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={verificationForm.notes}
                        onChange={(e) =>
                          setVerificationForm((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any additional comments for the NBFC..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleVerify}
                        disabled={verifying}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                      >
                        {verifying ? "Verifying..." : "Verify & Approve"}
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Select a CWCRF to Verify
                </h3>
                <p className="text-gray-500">
                  Click on a pending CWCRF from the list to review and verify
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Reject CWCRF</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this CWC Request Form.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 mb-4"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {rejecting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CwcrfVerificationPage;
