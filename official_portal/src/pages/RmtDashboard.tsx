import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api, cwcrfApi, opsApi } from "../api";
import { useAuth } from "../context/AuthContext";

interface Cwcrf {
  _id: string;
  cwcRfNumber: string;
  status: string;
  subContractorId?: {
    _id: string;
    companyName: string;
    ownerName?: string;
  };
  epcId?: {
    _id: string;
    companyName: string;
  };
  billId?: {
    billNumber: string;
    amount: number;
    fileUrl?: string;
    wcc?: { uploaded: boolean; fileUrl?: string };
    measurementSheet?: { uploaded: boolean; fileUrl?: string };
  };
  buyerDetails?: {
    buyerName: string;
    buyerGstin: string;
    projectName?: string;
    projectLocation?: string;
  };
  invoiceDetails?: {
    invoiceNumber: string;
    invoiceAmount: number;
    invoiceDate: string;
  };
  cwcRequest?: {
    requestedAmount: number;
    requestedTenure: number;
    urgencyLevel: string;
    reasonForFunding: string;
  };
  interestPreference?: {
    minRate: number;
    maxRate: number;
    maxAcceptableRate: number;
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
  sellerProfileSummary: {
    businessAge: number;
    totalTransactions: number;
    averageInvoiceValue: number;
    repaymentHistory: string;
  };
  riskAssessmentDetails: {
    invoiceAging: { score: number; remarks: string };
    buyerCreditworthiness: { score: number; remarks: string };
    sellerTrackRecord: { score: number; remarks: string };
    collateralCoverage: { score: number; remarks: string };
  };
  riskCategory: "LOW" | "MEDIUM" | "HIGH";
  rmtRecommendation: "PROCEED" | "REVIEW" | "REJECT";
}

interface DashboardData {
  total: number;
  inProgress: number;
  approved: number;
  rejected: number;
  riskBreakdown?: {
    low: number;
    medium: number;
    high: number;
  };
  avgRiskScore?: number;
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
  const { user } = useAuth();
  const [lastRefreshed] = useState(() => new Date());
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [cwcrfs, setCwcrfs] = useState<Cwcrf[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
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
  const [caseDetailCwcrf, setCaseDetailCwcrf] = useState<Cwcrf | null>(null);
  const [cwcafForm, setCwcafForm] = useState<CwcafFormData>({
    sellerProfileSummary: {
      businessAge: 0,
      totalTransactions: 0,
      averageInvoiceValue: 0,
      repaymentHistory: "",
    },
    riskAssessmentDetails: {
      invoiceAging: { score: 0, remarks: "" },
      buyerCreditworthiness: { score: 0, remarks: "" },
      sellerTrackRecord: { score: 0, remarks: "" },
      collateralCoverage: { score: 0, remarks: "" },
    },
    riskCategory: "MEDIUM",
    rmtRecommendation: "PROCEED",
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to update");
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to complete");
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to process");
    }
  };

  const handleGenerateCwcaf = async () => {
    if (!selectedCwcrf) return;

    try {
      await cwcrfApi.generateCwcaf(selectedCwcrf._id, cwcafForm);

      toast.success("CWCAF generated successfully");
      setShowCwcafModal(false);
      fetchData();

      // Reset form
      setCwcafForm({
        sellerProfileSummary: {
          businessAge: 0,
          totalTransactions: 0,
          averageInvoiceValue: 0,
          repaymentHistory: "",
        },
        riskAssessmentDetails: {
          invoiceAging: { score: 0, remarks: "" },
          buyerCreditworthiness: { score: 0, remarks: "" },
          sellerTrackRecord: { score: 0, remarks: "" },
          collateralCoverage: { score: 0, remarks: "" },
        },
        riskCategory: "MEDIUM",
        rmtRecommendation: "PROCEED",
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to generate CWCAF");
    }
  };

  const handleShareWithNbfcs = async () => {
    if (!selectedCwcrf || selectedNbfcs.length === 0) {
      toast.error("Please select at least one NBFC");
      return;
    }

    try {
      await opsApi.shareWithNbfcs(selectedCwcrf._id, selectedNbfcs);
      toast.success(
        `Shared with ${selectedNbfcs.length} NBFC${selectedNbfcs.length > 1 ? "s" : ""}`,
      );
      setShowNbfcModal(false);
      setSelectedNbfcs([]);
      setMatchingNbfcs([]);
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to share with NBFCs");
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
    <div style={{ padding: '0 0 40px' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#92400e', margin: 0 }}>
              Risk Management
            </h1>
            <span style={{
              background: 'linear-gradient(135deg,#B45309,#F59E0B)',
              color: 'white',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              letterSpacing: '0.04em',
              boxShadow: '0 1px 3px rgba(180,83,9,0.25)',
            }}>RMT</span>
          </div>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Welcome back, {user?.name?.split(' ')[0] ?? 'Officer'} — Risk queue &amp; assessments
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Last refreshed</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', margin: 0 }}>
            {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">

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
                        {cwcrf.cwcRfNumber}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {cwcrf.subContractorId?.companyName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {cwcrf.buyerDetails?.buyerName || cwcrf.epcId?.companyName || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        ₹{(cwcrf.buyerVerification?.approvedAmount || cwcrf.cwcRequest?.requestedAmount || 0).toLocaleString()}
                        {cwcrf.buyerVerification?.approvedAmount ? <span className="ml-1 text-xs text-green-600">(approved)</span> : <span className="ml-1 text-xs text-gray-400">(requested)</span>}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {cwcrf.buyerVerification?.repaymentTimeline || cwcrf.cwcRequest?.requestedTenure || '—'} days
                      </td>
                      <td className="px-6 py-4">{statusBadge(cwcrf.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => setCaseDetailCwcrf(cwcrf)}
                            className="text-indigo-600 hover:bg-indigo-50 border border-indigo-200 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                          >
                            View Details
                          </button>
                          {(cwcrf.status === "UNDER_RISK_REVIEW" || cwcrf.status === "BUYER_APPROVED") && (
                            <button
                              onClick={() => {
                                setSelectedCwcrf(cwcrf);
                                setShowCwcafModal(true);
                              }}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Complete Assessment
                            </button>
                          )}
                          {cwcrf.status === "CWCAF_READY" && (
                            <>
                              <button
                                onClick={async () => {
                                  try {
                                    await cwcrfApi.rmtForwardToOps(cwcrf._id, "Risk assessment complete");
                                    toast.success("Forwarded to Ops for risk triage");
                                    fetchData();
                                  } catch (err: unknown) {
                                    const e = err as { response?: { data?: { message?: string } } };
                                    toast.error(e.response?.data?.message || "Failed to forward");
                                  }
                                }}
                                className="text-orange-600 hover:underline text-sm font-medium"
                              >
                                Forward to Ops
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    setSelectedCwcrf(cwcrf);
                                    const res = await opsApi.getMatchingNbfcs(cwcrf._id);
                                    setMatchingNbfcs(res.data?.nbfcs || res.data || []);
                                    setShowNbfcModal(true);
                                  } catch {
                                    toast.error("Failed to load matching NBFCs");
                                  }
                                }}
                                className="text-purple-600 hover:underline text-sm"
                              >
                                Share w/ NBFCs
                              </button>
                            </>
                          )}
                          {cwcrf.status === "RMT_APPROVED" && (
                            <span className="text-green-600 text-sm">✓ Sent to Ops</span>
                          )}
                          <button
                            onClick={async () => {
                              try {
                                toast.loading("Generating PDF...", { id: "pdf-gen" });
                                const res = await cwcrfApi.downloadCasePdf(cwcrf._id);
                                const blob = new Blob([res.data], { type: "application/pdf" });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${cwcrf.cwcRfNumber || cwcrf._id}-Case-Report.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                window.URL.revokeObjectURL(url);
                                toast.dismiss("pdf-gen");
                                toast.success("PDF downloaded");
                              } catch {
                                toast.dismiss("pdf-gen");
                                toast.error("Failed to download PDF");
                              }
                            }}
                            className="text-gray-600 hover:text-gray-900 hover:underline text-sm"
                            title="Download full case as PDF"
                          >
                            📄 PDF
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
                    Generate CWCAF - {selectedCwcrf.cwcRfNumber}
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
                      {selectedCwcrf.subContractorId?.companyName}
                    </div>
                    <div>
                      <span className="text-gray-600">Buyer:</span>{" "}
                      {selectedCwcrf.buyerDetails?.buyerName}
                    </div>
                    <div>
                      <span className="text-gray-600">Invoice Amount:</span> ₹
                      {selectedCwcrf.invoiceDetails?.invoiceAmount?.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-gray-600">Approved Amount:</span> ₹
                      {selectedCwcrf.buyerVerification?.approvedAmount?.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-gray-600">Requested Tenure:</span>{" "}
                      {selectedCwcrf.cwcRequest?.requestedTenure} days
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
                      value={cwcafForm.riskAssessmentDetails.invoiceAging.score}
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessmentDetails: {
                            ...cwcafForm.riskAssessmentDetails,
                            invoiceAging: {
                              ...cwcafForm.riskAssessmentDetails.invoiceAging,
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
                        {cwcafForm.riskAssessmentDetails.invoiceAging.score}
                      </span>
                      <span>100</span>
                    </div>
                    <textarea
                      value={cwcafForm.riskAssessmentDetails.invoiceAging.remarks}
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessmentDetails: {
                            ...cwcafForm.riskAssessmentDetails,
                            invoiceAging: {
                              ...cwcafForm.riskAssessmentDetails.invoiceAging,
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
                        cwcafForm.riskAssessmentDetails.buyerCreditworthiness.score
                      }
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessmentDetails: {
                            ...cwcafForm.riskAssessmentDetails,
                            buyerCreditworthiness: {
                              ...cwcafForm.riskAssessmentDetails.buyerCreditworthiness,
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
                        {cwcafForm.riskAssessmentDetails.buyerCreditworthiness.score}
                      </span>
                      <span>100</span>
                    </div>
                    <textarea
                      value={
                        cwcafForm.riskAssessmentDetails.buyerCreditworthiness.remarks
                      }
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessmentDetails: {
                            ...cwcafForm.riskAssessmentDetails,
                            buyerCreditworthiness: {
                              ...cwcafForm.riskAssessmentDetails.buyerCreditworthiness,
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
                      value={cwcafForm.riskAssessmentDetails.sellerTrackRecord.score}
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessmentDetails: {
                            ...cwcafForm.riskAssessmentDetails,
                            sellerTrackRecord: {
                              ...cwcafForm.riskAssessmentDetails.sellerTrackRecord,
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
                        {cwcafForm.riskAssessmentDetails.sellerTrackRecord.score}
                      </span>
                      <span>100</span>
                    </div>
                    <textarea
                      value={cwcafForm.riskAssessmentDetails.sellerTrackRecord.remarks}
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessmentDetails: {
                            ...cwcafForm.riskAssessmentDetails,
                            sellerTrackRecord: {
                              ...cwcafForm.riskAssessmentDetails.sellerTrackRecord,
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
                      value={cwcafForm.riskAssessmentDetails.collateralCoverage.score}
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessmentDetails: {
                            ...cwcafForm.riskAssessmentDetails,
                            collateralCoverage: {
                              ...cwcafForm.riskAssessmentDetails.collateralCoverage,
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
                        {cwcafForm.riskAssessmentDetails.collateralCoverage.score}
                      </span>
                      <span>100</span>
                    </div>
                    <textarea
                      value={
                        cwcafForm.riskAssessmentDetails.collateralCoverage.remarks
                      }
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          riskAssessmentDetails: {
                            ...cwcafForm.riskAssessmentDetails,
                            collateralCoverage: {
                              ...cwcafForm.riskAssessmentDetails.collateralCoverage,
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
                        (cwcafForm.riskAssessmentDetails.invoiceAging.score +
                          cwcafForm.riskAssessmentDetails.buyerCreditworthiness.score +
                          cwcafForm.riskAssessmentDetails.sellerTrackRecord.score +
                          cwcafForm.riskAssessmentDetails.collateralCoverage.score) /
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
                    <select
                      value={cwcafForm.rmtRecommendation}
                      onChange={(e) =>
                        setCwcafForm({
                          ...cwcafForm,
                          rmtRecommendation: e.target.value as "PROCEED" | "REVIEW" | "REJECT",
                        })
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value="PROCEED">PROCEED — Recommend for funding</option>
                      <option value="REVIEW">REVIEW — Needs further scrutiny</option>
                      <option value="REJECT">REJECT — Not recommended</option>
                    </select>
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

        {/* ═══ Case Detail Modal ═══ */}
        {caseDetailCwcrf && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 p-4 overflow-y-auto" id="case-detail-overlay">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8" id="case-detail-printable">
              {/* ── Modal Header ── */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-sky-50 rounded-t-2xl no-print-header">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl font-bold text-gray-900">{caseDetailCwcrf.cwcRfNumber}</span>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: caseDetailCwcrf.status === "CWCAF_READY" ? "#d1fae5" : caseDetailCwcrf.status === "UNDER_RISK_REVIEW" ? "#dbeafe" : "#fef3c7",
                      color: caseDetailCwcrf.status === "CWCAF_READY" ? "#065f46" : caseDetailCwcrf.status === "UNDER_RISK_REVIEW" ? "#1e40af" : "#92400e",
                    }}>
                      {caseDetailCwcrf.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Submitted: {caseDetailCwcrf.createdAt ? new Date(caseDetailCwcrf.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const overlay = document.getElementById("case-detail-overlay");
                      if (overlay) overlay.style.display = "none";
                      window.print();
                      if (overlay) overlay.style.display = "";
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: "#4f46e5", color: "white",
                      border: "none", borderRadius: 8,
                      padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    🖨️ Print / Download PDF
                  </button>
                  <button
                    onClick={() => setCaseDetailCwcrf(null)}
                    style={{ background: "none", border: "none", fontSize: 24, color: "#94a3b8", cursor: "pointer", lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* ── Print Header (only visible when printing) ── */}
              <div className="print-only-header" style={{ display: "none", padding: "24px 28px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #4f46e5", paddingBottom: 16, marginBottom: 24 }}>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: "0 0 4px" }}>Gryork Platform — CWCRF Case Report</h1>
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Credit on Working Capital Request Form — Detailed Assessment</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 2px" }}>{caseDetailCwcrf.cwcRfNumber}</p>
                    <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>Printed: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
              </div>

              {/* ── Body ── */}
              <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Row 1: SC + EPC + Status */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  {/* Sub-Contractor */}
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", margin: "0 0 10px" }}>Sub-Contractor (Seller)</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>
                      {caseDetailCwcrf.subContractorId?.companyName || "—"}
                    </p>
                    <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>ID: {caseDetailCwcrf.subContractorId?._id?.slice(-8) || "—"}</p>
                  </div>
                  {/* EPC Buyer */}
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", margin: "0 0 10px" }}>EPC Buyer</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>
                      {caseDetailCwcrf.buyerDetails?.buyerName || "—"}
                    </p>
                    <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>GSTIN: {caseDetailCwcrf.buyerDetails?.buyerGstin || "—"}</p>
                    {caseDetailCwcrf.buyerVerification?.verifiedAt && (
                      <p style={{ fontSize: 11, color: "#059669", fontWeight: 600, marginTop: 4 }}>✓ Buyer Verified</p>
                    )}
                  </div>
                  {/* Case Status */}
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", margin: "0 0 10px" }}>Case Status</p>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      background: caseDetailCwcrf.status === "CWCAF_READY" ? "#d1fae5" : caseDetailCwcrf.status === "UNDER_RISK_REVIEW" ? "#dbeafe" : "#fef3c7",
                      color: caseDetailCwcrf.status === "CWCAF_READY" ? "#065f46" : caseDetailCwcrf.status === "UNDER_RISK_REVIEW" ? "#1e40af" : "#92400e",
                    }}>
                      {caseDetailCwcrf.status?.replace(/_/g, " ") || "—"}
                    </span>
                    <p style={{ fontSize: 12, color: "#64748b", margin: "8px 0 0" }}>
                      Submitted: {caseDetailCwcrf.createdAt ? new Date(caseDetailCwcrf.createdAt).toLocaleDateString("en-IN") : "—"}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: 0 }} />

                {/* Section B: Invoice Details */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#4f46e5", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                    📄 Section B — Invoice Details
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {[
                      { label: "Invoice Number", value: caseDetailCwcrf.invoiceDetails?.invoiceNumber || "—" },
                      { label: "Invoice Amount", value: caseDetailCwcrf.invoiceDetails?.invoiceAmount ? `₹${caseDetailCwcrf.invoiceDetails.invoiceAmount.toLocaleString()}` : "—" },
                      { label: "Invoice Date", value: caseDetailCwcrf.invoiceDetails?.invoiceDate ? new Date(caseDetailCwcrf.invoiceDetails.invoiceDate).toLocaleDateString("en-IN") : "—" },
                      { label: "Approved by EPC", value: caseDetailCwcrf.buyerVerification?.approvedAmount ? `₹${caseDetailCwcrf.buyerVerification.approvedAmount.toLocaleString()}` : "Pending" },
                      { label: "Repayment Timeline", value: caseDetailCwcrf.buyerVerification?.repaymentTimeline ? `${caseDetailCwcrf.buyerVerification.repaymentTimeline} days` : "—" },
                      { label: "Repayment Arrangement", value: caseDetailCwcrf.buyerVerification?.repaymentArrangement || "—" },
                    ].map((f) => (
                      <div key={f.label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" }}>
                        <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 4px", fontWeight: 600 }}>{f.label}</p>
                        <p style={{ fontSize: 14, color: "#1e293b", margin: 0, fontWeight: 600 }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: 0 }} />

                {/* Section C: Credit Request */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#0284c7", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                    💳 Section C — Credit Request
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {[
                      { label: "Requested Amount", value: caseDetailCwcrf.cwcRequest?.requestedAmount ? `₹${caseDetailCwcrf.cwcRequest.requestedAmount.toLocaleString()}` : "—" },
                      { label: "Requested Tenure", value: caseDetailCwcrf.cwcRequest?.requestedTenure ? `${caseDetailCwcrf.cwcRequest.requestedTenure} days` : "—" },
                      { label: "Urgency Level", value: caseDetailCwcrf.cwcRequest?.urgencyLevel || "—" },
                    ].map((f) => (
                      <div key={f.label} style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "10px 14px" }}>
                        <p style={{ fontSize: 11, color: "#0284c7", margin: "0 0 4px", fontWeight: 600 }}>{f.label}</p>
                        <p style={{ fontSize: 14, color: "#0c4a6e", margin: 0, fontWeight: 700 }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                  {caseDetailCwcrf.cwcRequest?.reasonForFunding && (
                    <div style={{ marginTop: 10, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" }}>
                      <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 4px", fontWeight: 600 }}>Reason for Funding</p>
                      <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>{caseDetailCwcrf.cwcRequest.reasonForFunding}</p>
                    </div>
                  )}
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: 0 }} />

                {/* Section D: Interest Preference */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#059669", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                    📈 Section D — Interest Preference
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {[
                      { label: "Minimum Interest Rate", value: caseDetailCwcrf.interestPreference?.minRate != null ? `${caseDetailCwcrf.interestPreference.minRate}%` : "—" },
                      { label: "Maximum Interest Rate", value: caseDetailCwcrf.interestPreference?.maxRate != null ? `${caseDetailCwcrf.interestPreference.maxRate}%` : "—" },
                      { label: "Max Acceptable Rate", value: caseDetailCwcrf.interestPreference?.maxAcceptableRate != null ? `${caseDetailCwcrf.interestPreference.maxAcceptableRate}%` : "—" },
                    ].map((f) => (
                      <div key={f.label} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px" }}>
                        <p style={{ fontSize: 11, color: "#059669", margin: "0 0 4px", fontWeight: 600 }}>{f.label}</p>
                        <p style={{ fontSize: 14, color: "#14532d", margin: 0, fontWeight: 700 }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions (no-print) */}
                <div className="no-print-actions" style={{ display: "flex", gap: 10, borderTop: "1px solid #e2e8f0", paddingTop: 16, flexWrap: "wrap" }}>
                  {(caseDetailCwcrf.status === "UNDER_RISK_REVIEW" || caseDetailCwcrf.status === "BUYER_APPROVED") && (
                    <button
                      onClick={() => {
                        setSelectedCwcrf(caseDetailCwcrf);
                        setCaseDetailCwcrf(null);
                        setShowCwcafModal(true);
                      }}
                      style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      Complete Risk Assessment
                    </button>
                  )}
                  {caseDetailCwcrf.status === "CWCAF_READY" && (
                    <button
                      onClick={async () => {
                        try {
                          await cwcrfApi.rmtForwardToOps(caseDetailCwcrf._id, "Risk assessment complete");
                          toast.success("Forwarded to Ops for risk triage");
                          setCaseDetailCwcrf(null);
                          fetchData();
                        } catch {
                          toast.error("Failed to forward");
                        }
                      }}
                      style={{ background: "#d97706", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      Forward to Ops
                    </button>
                  )}
                  <button
                    onClick={() => setCaseDetailCwcrf(null)}
                    style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginLeft: "auto" }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            {/* Print styles */}
            <style>{`
              @media print {
                body * { visibility: hidden !important; }
                #case-detail-printable, #case-detail-printable * { visibility: visible !important; }
                #case-detail-printable { position: fixed; left: 0; top: 0; width: 100%; background: white !important; padding: 0 !important; margin: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
                .no-print-header, .no-print-actions { display: none !important; }
                .print-only-header { display: block !important; }
                @page { margin: 16mm; size: A4; }
              }
            `}</style>
          </div>
        )}

        {/* NBFC Sharing Modal */}
        {showNbfcModal && selectedCwcrf && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    Share CWCRF with NBFCs - {selectedCwcrf.cwcRfNumber}
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
