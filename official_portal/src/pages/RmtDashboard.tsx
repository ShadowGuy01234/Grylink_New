import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api';

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
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assessments');
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);
  const [checklistModal, setChecklistModal] = useState<string | null>(null);
  const [checklistNotes, setChecklistNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assessmentsRes, approvalsRes, dashboardRes] = await Promise.all([
        api.get('/risk-assessment/pending'),
        api.get('/approvals/my-pending'),
        api.get('/risk-assessment/dashboard'),
      ]);
      setAssessments(assessmentsRes.data);
      setApprovals(approvalsRes.data);
      setDashboard(dashboardRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyChecklistItem = async (assessmentId: string, itemKey: string, verified: boolean) => {
    try {
      await api.put(`/risk-assessment/${assessmentId}/checklist/${itemKey}`, {
        verified,
        notes: checklistNotes,
      });
      toast.success(`${itemKey} ${verified ? 'verified' : 'unverified'}`);
      setChecklistModal(null);
      setChecklistNotes('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleCompleteAssessment = async (assessmentId: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      await api.post(`/risk-assessment/${assessmentId}/complete`, {
        decision,
        notes: `Risk assessment ${decision.toLowerCase()}d by RMT`,
      });
      toast.success(`Assessment ${decision.toLowerCase()}d`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete');
    }
  };

  const handleApproval = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await api.post(`/approvals/${requestId}/${action}`, {
        comments: 'Processed from RMT dashboard',
      });
      toast.success(`Request ${action}d`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process');
    }
  };

  const riskBadge = (category: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[category] || 'bg-gray-100'}`}>
        {category}
      </span>
    );
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[status] || 'bg-gray-100'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  const priorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[priority] || 'bg-gray-100'}`}>
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
            <h3 className="text-3xl font-bold text-blue-600">{dashboard?.total || 0}</h3>
            <p className="text-gray-600">Total Assessments</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-yellow-600">{dashboard?.inProgress || 0}</h3>
            <p className="text-gray-600">In Progress</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-green-600">{dashboard?.approved || 0}</h3>
            <p className="text-gray-600">Approved</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-red-600">{dashboard?.rejected || 0}</h3>
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
            onClick={() => setActiveTab('assessments')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'assessments' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Risk Assessments ({assessments.length})
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'approvals' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Pending Approvals ({approvals.length})
          </button>
        </div>

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assessments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No pending assessments
                    </td>
                  </tr>
                ) : (
                  assessments.map((assessment) => (
                    <tr key={assessment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{assessment.seller?.name}</td>
                      <td className="px-6 py-4">{assessment.seller?.companyName}</td>
                      <td className="px-6 py-4">{riskBadge(assessment.riskCategory)}</td>
                      <td className="px-6 py-4">{assessment.riskScore}</td>
                      <td className="px-6 py-4">{statusBadge(assessment.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedAssessment(assessment)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Checklist
                          </button>
                          {assessment.status === 'IN_PROGRESS' && (
                            <>
                              <button
                                onClick={() => handleCompleteAssessment(assessment._id, 'APPROVE')}
                                className="text-green-600 hover:underline text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleCompleteAssessment(assessment._id, 'REJECT')}
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
        {activeTab === 'approvals' && (
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {approvals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No pending approvals
                    </td>
                  </tr>
                ) : (
                  approvals.map((approval) => (
                    <tr key={approval._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{approval.requestType.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4 text-sm">{approval.title}</td>
                      <td className="px-6 py-4">{priorityBadge(approval.priority)}</td>
                      <td className="px-6 py-4 text-sm">{approval.requestedBy?.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproval(approval._id, 'approve')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(approval._id, 'reject')}
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
                    Risk Assessment Checklist - {selectedAssessment.seller?.companyName}
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
                  <span className="font-bold">{selectedAssessment.riskScore}</span>
                  <span className="ml-4">{riskBadge(selectedAssessment.riskCategory)}</span>
                </div>

                <div className="space-y-3">
                  {Object.entries(selectedAssessment.checklist || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        {value.notes && <p className="text-sm text-gray-500">{value.notes}</p>}
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
                  ))}
                </div>

                {/* Checklist Item Verification Modal */}
                {checklistModal && (
                  <div className="mt-4 p-4 bg-blue-50 rounded">
                    <h3 className="font-medium mb-2">Verify: {checklistModal.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <textarea
                      value={checklistNotes}
                      onChange={(e) => setChecklistNotes(e.target.value)}
                      placeholder="Add verification notes..."
                      className="w-full p-2 border rounded mb-2"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerifyChecklistItem(selectedAssessment._id, checklistModal, true)}
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
      </div>
    </div>
  );
};

export default RmtDashboard;
