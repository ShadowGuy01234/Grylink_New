import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api, cwcrfApi } from "../api";

interface Cwcrf {
  _id: string;
  cwcrfNumber: string;
  status: string;
  seller: {
    _id: string;
    name: string;
    companyName: string;
  };
  sectionA: {
    buyerName: string;
    buyerGstin: string;
  };
  sectionB: {
    invoiceNumber: string;
    invoiceAmount: number;
    invoiceDate: string;
  };
  sectionC: {
    requestedAmount: number;
    tenure: number;
    urgencyLevel: string;
    reason: string;
  };
  sectionD: {
    preferredRateMin: number;
    preferredRateMax: number;
    repaymentFrequency: string;
  };
  buyerVerification?: {
    approvedAmount: number;
    repaymentTimeline: number;
    repaymentArrangement: string;
    verifiedAt: string;
  };
  createdAt: string;
}

interface MatchingNbfc {
  _id: string;
  name: string;
  companyName: string;
  matchScore: number;
  lps: {
    interestRatePolicy: {
      preferredRate: number;
    };
    riskAppetite: {
      acceptedCategories: string[];
    };
  };
}

interface CwcafFormData {
  riskAssessment: {
    invoiceAging: { score: number; remarks: string };
    buyerCreditworthiness: { score: number; remarks: string };
    sellerTrackRecord: { score: number; remarks: string };
    collateralCoverage: { score: number; remarks: string };
  };
  riskCategory: "LOW" | "MEDIUM" | "HIGH";
  rmtRecommendation: string;
}

interface RiskAssessment {
  _id: string;
  seller: {
    name: string;
    companyName: string;
    email: string;
  };
  status: string;
  riskScore: number;
  riskCategory: string;
  checklist: Record<string, ChecklistItem>;
  createdAt: string;
}

interface ChecklistItem {
  verified: boolean;
  notes?: string;
  verifiedAt?: string;
}

interface ApprovalRequest {
  _id: string;
  requestType: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  requestedBy: { name: string };
}

const RmtDashboard: React.FC = () => {
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [cwcrfs, setCwcrfs] = useState<Cwcrf[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assessments");
  const [selectedAssessment, setSelectedAssessment] =
    useState<RiskAssessment | null>(null);
  const [checklistModal, setChecklistModal] = useState<string | null>(null);
  const [checklistNotes, setChecklistNotes] = useState("");
  const [selectedCwcrf, setSelectedCwcrf] = useState<Cwcrf | null>(null);
  const [showCwcafModal, setShowCwcafModal] = useState(false);
  const [showNbfcModal, setShowNbfcModal] = useState(false);
  const [matchingNbfcs, setMatchingNbfcs] = useState<MatchingNbfc[]>([]);
  const [selectedNbfcs, setSelectedNbfcs] = useState<string[]>([]);
  const [cwcafForm, setCwcafForm] = useState<CwcafFormData>({
    riskAssessment: {
      invoiceAging: { score: 0, remarks: "" },
      buyerCreditworthiness: { score: 0, remarks: "" },
      sellerTrackRecord: { score: 0, remarks: "" },
      collateralCoverage: { score: 0, remarks: "" },
    },
    riskCategory: "MEDIUM",
    rmtRecommendation: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assessmentsRes, approvalsRes, dashboardRes, cwcrfsRes] =
        await Promise.all([
          api.get("/risk-assessment/pending"),
          api.get("/approvals/pending"),
          api.get("/rmt/dashboard"),
          cwcrfApi.getRmtQueue(),
        ]);

      setAssessments(assessmentsRes.data.data || []);
      setApprovals(approvalsRes.data.data || []);
      setDashboard(dashboardRes.data.data || {});
      setCwcrfs(cwcrfsRes.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyChecklistItem = async (
    assessmentId: string,
    itemKey: string,
    verified: boolean,
  ) => {
    try {
      await api.put(`/risk-assessment/${assessmentId}/checklist/${itemKey}`, {
        verified,
        notes: checklistNotes,
      });
      toast.success(`${itemKey} ${verified ? "verified" : "unverified"}`);
      setChecklistModal(null);
      setChecklistNotes("");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  const handleCompleteAssessment = async (
    assessmentId: string,
    decision: "APPROVE" | "REJECT",
  ) => {
    try {
      await api.post(`/risk-assessment/${assessmentId}/complete`, {
        decision,
        notes: `Risk assessment ${decision.toLowerCase()}d by RMT`,
      });
      toast.success(`Assessment ${decision.toLowerCase()}d`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to complete");
    }
  };

  const handleApproval = async (
    requestId: string,
    action: "approve" | "reject",
  ) => {
    try {
      await api.post(`/approvals/${requestId}/${action}`, {
        comments: "Processed from RMT dashboard",
      });
      toast.success(`Request ${action}d`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to process");
    }
  };

  const handleGenerateCwcaf = async () => {
    if (!selectedCwcrf) return;

    try {
      const avgScore =
        (cwcafForm.riskAssessment.invoiceAging.score +
          cwcafForm.riskAssessment.buyerCreditworthiness.score +
          cwcafForm.riskAssessment.sellerTrackRecord.score +
          cwcafForm.riskAssessment.collateralCoverage.score) /
        4;

      await cwcrfApi.generateCwcaf(selectedCwcrf._id, {
        ...cwcafForm,
        overallRiskScore: avgScore,
      });

      toast.success("CWCAF generated successfully");
      setShowCwcafModal(false);
      fetchData();

      // Reset form
      setCwcafForm({
        riskAssessment: {
          invoiceAging: { score: 0, remarks: "" },
          buyerCreditworthiness: { score: 0, remarks: "" },
          sellerTrackRecord: { score: 0, remarks: "" },
          collateralCoverage: { score: 0, remarks: "" },
        },
        riskCategory: "MEDIUM",
        rmtRecommendation: "",
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate CWCAF");
    }
  };

  const handleOpenNbfcModal = async (cwcrf: Cwcrf) => {
    setSelectedCwcrf(cwcrf);
    try {
      const response = await cwcrfApi.getMatchingNbfcs(cwcrf._id);
      setMatchingNbfcs(response.data.data || []);
      setShowNbfcModal(true);
    } catch (err: any) {
      toast.error("Failed to fetch matching NBFCs");
    }
  };

  const handleShareWithNbfcs = async () => {
    if (!selectedCwcrf || selectedNbfcs.length === 0) {
      toast.error("Please select at least one NBFC");
      return;
    }

    try {
      await cwcrfApi.shareWithNbfcs(selectedCwcrf._id, selectedNbfcs);
      toast.success(
        `Shared with ${selectedNbfcs.length} NBFC${selectedNbfcs.length > 1 ? "s" : ""}`,
      );
      setShowNbfcModal(false);
      setSelectedNbfcs([]);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to share with NBFCs");
    }
  };

  const riskBadge = (category: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-green-100 text-green-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded ${colors[category] || "bg-gray-100"}`}
      >
        {category}
      </span>
    );
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded ${colors[status] || "bg-gray-100"}`}
      >
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  const priorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded ${colors[priority] || "bg-gray-100"}`}
      >
        {priority}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading RMT Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">RMT Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-blue-600">
              {dashboard?.total || 0}
            </h3>
            <p className="text-gray-600">Total Assessments</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-yellow-600">
              {dashboard?.inProgress || 0}
            </h3>
            <p className="text-gray-600">In Progress</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-green-600">
              {dashboard?.approved || 0}
            </h3>
            <p className="text-gray-600">Approved</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-red-600">
              {dashboard?.rejected || 0}
            </h3>
            <p className="text-gray-600">Rejected</p>
          </div>
        </div>

        {/* Risk Breakdown */}
        {dashboard?.riskBreakdown && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">Risk Distribution</h2>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Low: {dashboard.riskBreakdown.low}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Medium: {dashboard.riskBreakdown.medium}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>High: {dashboard.riskBreakdown.high}</span>
              </div>
              <div className="ml-auto">
                <span className="text-gray-600">Avg Risk Score: </span>
                <span className="font-bold">{dashboard.avgRiskScore}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("assessments")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "assessments"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Risk Assessments ({assessments.length})
          </button>
          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "approvals"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Pending Approvals ({approvals.length})
          </button>
          <button
            onClick={() => setActiveTab("cwcrf")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "cwcrf"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            CWCRF Queue ({cwcrfs.length})
          </button>
        </div>

        {/* CWCRF Queue Tab */}
        {activeTab === "cwcrf" && (
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    CWCRF #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tenure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cwcrfs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No CWCRFs pending review
                    </td>
                  </tr>
                ) : (
                  cwcrfs.map((cwcrf) => (
                    <tr key={cwcrf._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">
                        {cwcrf.cwcrfNumber}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {cwcrf.seller?.companyName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {cwcrf.sectionA?.buyerName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        ₹
                        {cwcrf.buyerVerification?.approvedAmount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {cwcrf.buyerVerification?.repaymentTimeline} days
                      </td>
                      <td className="px-6 py-4">{statusBadge(cwcrf.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {cwcrf.status === "BUYER_APPROVED" && (
                            <button
                              onClick={() => {
                                setSelectedCwcrf(cwcrf);
                                setShowCwcafModal(true);
                              }}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Generate CWCAF
                            </button>
                          )}
                          {cwcrf.status === "CWCAF_READY" && (
                            <button
                              onClick={() => handleOpenNbfcModal(cwcrf)}
                              className="text-green-600 hover:underline text-sm"
                            >
                              Share with NBFCs
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === "assessments" && (
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assessments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No pending assessments
                    </td>
                  </tr>
                ) : (
                  assessments.map((assessment) => (
                    <tr key={assessment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{assessment.seller?.name}</td>
                      <td className="px-6 py-4">
                        {assessment.seller?.companyName}
                      </td>
                      <td className="px-6 py-4">
                        {riskBadge(assessment.riskCategory)}
                      </td>
                      <td className="px-6 py-4">{assessment.riskScore}</td>
                      <td className="px-6 py-4">
                        {statusBadge(assessment.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedAssessment(assessment)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Checklist
                          </button>
                          {assessment.status === "IN_PROGRESS" && (
                            <>
                              <button
                                onClick={() =>
                                  handleCompleteAssessment(
                                    assessment._id,
                                    "APPROVE",
                                  )
                                }
                                className="text-green-600 hover:underline text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleCompleteAssessment(
                                    assessment._id,
                                    "REJECT",
                                  )
                                }
                                className="text-red-600 hover:underline text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === "approvals" && (
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Requested By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {approvals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No pending approvals
                    </td>
                  </tr>
                ) : (
                  approvals.map((approval) => (
                    <tr key={approval._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        {approval.requestType.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-4 text-sm">{approval.title}</td>
                      <td className="px-6 py-4">
                        {priorityBadge(approval.priority)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {approval.requestedBy?.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleApproval(approval._id, "approve")
                            }
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleApproval(approval._id, "reject")
                            }
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Checklist Modal */}
        {selectedAssessment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    Risk Assessment Checklist -{" "}
                    {selectedAssessment.seller?.companyName}
                  </h2>
                  <button
                    onClick={() => setSelectedAssessment(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-4">
                  <span className="text-gray-600">Risk Score: </span>
                  <span className="font-bold">
                    {selectedAssessment.riskScore}
                  </span>
                  <span className="ml-4">
                    {riskBadge(selectedAssessment.riskCategory)}
                  </span>
                </div>

                <div className="space-y-3">
                  {Object.entries(selectedAssessment.checklist || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div>
                          <span className="font-medium">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          {value.notes && (
                            <p className="text-sm text-gray-500">
                              {value.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {value.verified ? (
                            <span className="text-green-600">✓ Verified</span>
                          ) : (
                            <button
                              onClick={() => setChecklistModal(key)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>

                {/* Checklist Item Verification Modal */}
                {checklistModal && (
                  <div className="mt-4 p-4 bg-blue-50 rounded">
                    <h3 className="font-medium mb-2">
                      Verify: {checklistModal.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                    <textarea
                      value={checklistNotes}
                      onChange={(e) => setChecklistNotes(e.target.value)}
                      placeholder="Add verification notes..."
                      className="w-full p-2 border rounded mb-2"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleVerifyChecklistItem(
                            selectedAssessment._id,
                            checklistModal,
                            true,
                          )
                        }
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Mark Verified
                      </button>
                      <button
                        onClick={() => setChecklistModal(null)}
                        className="px-3 py-1 bg-gray-300 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CWCAF Generation Modal */}
        {showCwcafModal && selectedCwcrf && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    Generate CWCAF - {selectedCwcrf.cwcrfNumber}
                  </h2>
                  <button
                    onClick={() => setShowCwcafModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* CWCRF Summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-2">CWCRF Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Seller:</span>{" "}
                      {selectedCwcrf.seller?.companyName}
                    </div>
                    <div>
                      <span className="text-gray-600">Buyer:</span>{" "}
                      {selectedCwcrf.sectionA?.buyerName}
                    </div>
                    <div>
                      <span className="text-gray-600">Invoice Amount:</span> ₹
                      {selectedCwcrf.sectionB?.invoiceAmount?.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-gray-600">Approved Amount:</span> ₹
                      {selectedCwcrf.buyerVerification?.approvedAmount?.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-gray-600">Requested Tenure:</span>{" "}
                      {selectedCwcrf.sectionC?.tenure} days
                    </div>
                    <div>
                      <span className="text-gray-600">Repayment Timeline:</span>{" "}
                      {selectedCwcrf.buyerVerification?.repaymentTimeline} days
                    </div>
                  </div>
                </div>

                {/* Risk Assessment Form */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    Risk Assessment Parameters
                  </h3>

                  {/* Invoice Aging */}
                  <div>
                    <label className="block font-medium mb-2">
                      Invoice Aging Score (0-100)
                      <span className="text-sm text-gray-500 ml-2">
                        Higher = Better
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cwcafForm.riskAssessment.invoiceAging.score}
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessment: {
                            ...cwcafForm.riskAssessment,
                            invoiceAging: {
                              ...cwcafForm.riskAssessment.invoiceAging,
                              score: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>0</span>
                      <span className="font-semibold">
                        {cwcafForm.riskAssessment.invoiceAging.score}
                      </span>
                      <span>100</span>
                    </div>
                    <textarea
                      value={cwcafForm.riskAssessment.invoiceAging.remarks}
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessment: {
                            ...cwcafForm.riskAssessment,
                            invoiceAging: {
                              ...cwcafForm.riskAssessment.invoiceAging,
                              remarks: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Remarks on invoice aging..."
                      className="w-full p-2 border rounded mt-2"
                      rows={2}
                    />
                  </div>

                  {/* Buyer Creditworthiness */}
                  <div>
                    <label className="block font-medium mb-2">
                      Buyer Creditworthiness Score (0-100)
                      <span className="text-sm text-gray-500 ml-2">
                        Higher = Better
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={
                        cwcafForm.riskAssessment.buyerCreditworthiness.score
                      }
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessment: {
                            ...cwcafForm.riskAssessment,
                            buyerCreditworthiness: {
                              ...cwcafForm.riskAssessment.buyerCreditworthiness,
                              score: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>0</span>
                      <span className="font-semibold">
                        {cwcafForm.riskAssessment.buyerCreditworthiness.score}
                      </span>
                      <span>100</span>
                    </div>
                    <textarea
                      value={
                        cwcafForm.riskAssessment.buyerCreditworthiness.remarks
                      }
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessment: {
                            ...cwcafForm.riskAssessment,
                            buyerCreditworthiness: {
                              ...cwcafForm.riskAssessment.buyerCreditworthiness,
                              remarks: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Remarks on buyer creditworthiness..."
                      className="w-full p-2 border rounded mt-2"
                      rows={2}
                    />
                  </div>

                  {/* Seller Track Record */}
                  <div>
                    <label className="block font-medium mb-2">
                      Seller Track Record Score (0-100)
                      <span className="text-sm text-gray-500 ml-2">
                        Higher = Better
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cwcafForm.riskAssessment.sellerTrackRecord.score}
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessment: {
                            ...cwcafForm.riskAssessment,
                            sellerTrackRecord: {
                              ...cwcafForm.riskAssessment.sellerTrackRecord,
                              score: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>0</span>
                      <span className="font-semibold">
                        {cwcafForm.riskAssessment.sellerTrackRecord.score}
                      </span>
                      <span>100</span>
                    </div>
                    <textarea
                      value={cwcafForm.riskAssessment.sellerTrackRecord.remarks}
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessment: {
                            ...cwcafForm.riskAssessment,
                            sellerTrackRecord: {
                              ...cwcafForm.riskAssessment.sellerTrackRecord,
                              remarks: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Remarks on seller track record..."
                      className="w-full p-2 border rounded mt-2"
                      rows={2}
                    />
                  </div>

                  {/* Collateral Coverage */}
                  <div>
                    <label className="block font-medium mb-2">
                      Collateral Coverage Score (0-100)
                      <span className="text-sm text-gray-500 ml-2">
                        Higher = Better
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cwcafForm.riskAssessment.collateralCoverage.score}
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessment: {
                            ...cwcafForm.riskAssessment,
                            collateralCoverage: {
                              ...cwcafForm.riskAssessment.collateralCoverage,
                              score: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>0</span>
                      <span className="font-semibold">
                        {cwcafForm.riskAssessment.collateralCoverage.score}
                      </span>
                      <span>100</span>
                    </div>
                    <textarea
                      value={
                        cwcafForm.riskAssessment.collateralCoverage.remarks
                      }
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessment: {
                            ...cwcafForm.riskAssessment,
                            collateralCoverage: {
                              ...cwcafForm.riskAssessment.collateralCoverage,
                              remarks: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Remarks on collateral coverage..."
                      className="w-full p-2 border rounded mt-2"
                      rows={2}
                    />
                  </div>

                  {/* Overall Risk Score Display */}
                  <div className="bg-blue-50 p-4 rounded">
                    <span className="font-medium">Overall Risk Score: </span>
                    <span className="text-2xl font-bold">
                      {(
                        (cwcafForm.riskAssessment.invoiceAging.score +
                          cwcafForm.riskAssessment.buyerCreditworthiness.score +
                          cwcafForm.riskAssessment.sellerTrackRecord.score +
                          cwcafForm.riskAssessment.collateralCoverage.score) /
                        4
                      ).toFixed(2)}
                    </span>
                  </div>

                  {/* Risk Category */}
                  <div>
                    <label className="block font-medium mb-2">
                      Risk Category
                    </label>
                    <select
                      value={cwcafForm.riskCategory}
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskCategory: e.target.value as
                            | "LOW"
                            | "MEDIUM"
                            | "HIGH",
                        })
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>

                  {/* RMT Recommendation */}
                  <div>
                    <label className="block font-medium mb-2">
                      RMT Recommendation
                    </label>
                    <textarea
                      value={cwcafForm.rmtRecommendation}
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          rmtRecommendation: e.target.value,
                        })
                      }
                      placeholder="Enter your recommendation..."
                      className="w-full p-2 border rounded"
                      rows={4}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => setShowCwcafModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerateCwcaf}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Generate CWCAF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NBFC Sharing Modal */}
        {showNbfcModal && selectedCwcrf && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    Share CWCRF with NBFCs - {selectedCwcrf.cwcrfNumber}
                  </h2>
                  <button
                    onClick={() => {
                      setShowNbfcModal(false);
                      setSelectedNbfcs([]);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-4 text-sm text-gray-600">
                  {selectedNbfcs.length} NBFC(s) selected
                </div>

                {/* Matching NBFCs List */}
                <div className="space-y-3">
                  {matchingNbfcs.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No matching NBFCs found
                    </div>
                  ) : (
                    matchingNbfcs.map((nbfc) => (
                      <div
                        key={nbfc._id}
                        className={`p-4 border rounded-lg ${
                          selectedNbfcs.includes(nbfc._id)
                            ? "bg-blue-50 border-blue-500"
                            : "bg-white border-gray-200"
                        } hover:shadow-md cursor-pointer transition`}
                        onClick={() => {
                          if (selectedNbfcs.includes(nbfc._id)) {
                            setSelectedNbfcs(
                              selectedNbfcs.filter((id) => id !== nbfc._id),
                            );
                          } else {
                            setSelectedNbfcs([...selectedNbfcs, nbfc._id]);
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">
                              {nbfc.companyName}
                            </h3>
                            <div className="text-sm text-gray-600 mt-1">
                              <span>
                                Preferred Rate:{" "}
                                {nbfc.lps?.interestRatePolicy?.preferredRate}%
                              </span>
                              <span className="mx-2">•</span>
                              <span>Match Score: {nbfc.matchScore}%</span>
                            </div>
                            {nbfc.lps?.riskAppetite?.acceptedCategories && (
                              <div className="flex gap-2 mt-2">
                                {nbfc.lps.riskAppetite.acceptedCategories.map(
                                  (cat) => (
                                    <span
                                      key={cat}
                                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                    >
                                      {cat}
                                    </span>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            {selectedNbfcs.includes(nbfc._id) ? (
                              <svg
                                className="w-6 h-6 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-6 h-6 text-gray-300"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
                  <button
                    onClick={() => {
                      setShowNbfcModal(false);
                      setSelectedNbfcs([]);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShareWithNbfcs}
                    disabled={selectedNbfcs.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Share with Selected NBFCs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RmtDashboard;
