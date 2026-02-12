import React, { useState, useEffect } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';

interface NbfcCase {
  _id: string;
  caseNumber: string;
  seller: { name: string; companyName: string };
  buyer: { name: string };
  dealValue: number;
  status: string;
  sharedAt: string;
}

interface Transaction {
  _id: string;
  transactionNumber: string;
  case: { caseNumber: string };
  totalAmount: number;
  fundedAmount: number;
  status: string;
  seller: { companyName: string };
}

interface Dashboard {
  totalCases: number;
  pendingCases: number;
  approvedCases: number;
  totalDisbursed: number;
  approvalRate: number;
}

const NbfcDashboard: React.FC = () => {
  const [cases, setCases] = useState<NbfcCase[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [responseModal, setResponseModal] = useState<NbfcCase | null>(null);
  const [responseForm, setResponseForm] = useState({
    fundingPercentage: 65,
    interestRate: 12,
    tenorDays: 30,
    rejectionReason: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [casesRes, dashboardRes, transactionsRes] = await Promise.all([
        api.get('/nbfc/cases'),
        api.get('/nbfc/dashboard'),
        api.get('/transactions'),
      ]);
      setCases(casesRes.data);
      setDashboard(dashboardRes.data);
      setTransactions(transactionsRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (caseId: string) => {
    try {
      await api.post(`/nbfc/${caseId}/respond`, {
        decision: 'approve',
        approvalDetails: {
          fundingPercentage: responseForm.fundingPercentage,
          interestRate: responseForm.interestRate,
          tenorDays: responseForm.tenorDays,
        },
      });
      toast.success('Case approved');
      setResponseModal(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (caseId: string) => {
    try {
      await api.post(`/nbfc/${caseId}/respond`, {
        decision: 'reject',
        rejectionReason: responseForm.rejectionReason,
      });
      toast.success('Case rejected');
      setResponseModal(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      NBFC_APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      DISBURSED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[status] || 'bg-gray-100'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading NBFC Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">NBFC Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-blue-600">{dashboard?.totalCases || 0}</h3>
            <p className="text-gray-600">Total Cases</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-yellow-600">{dashboard?.pendingCases || 0}</h3>
            <p className="text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-green-600">{dashboard?.approvedCases || 0}</h3>
            <p className="text-gray-600">Approved</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-purple-600">
              {formatCurrency(dashboard?.totalDisbursed || 0)}
            </h3>
            <p className="text-gray-600">Total Disbursed</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-3xl font-bold text-indigo-600">
              {dashboard?.approvalRate || 0}%
            </h3>
            <p className="text-gray-600">Approval Rate</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Pending Cases
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'transactions' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            History
          </button>
        </div>

        {/* Pending Cases Tab */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Case #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    EPC (Buyer)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Deal Value
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
                {cases.filter((c) => c.status === 'PENDING').length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No pending cases
                    </td>
                  </tr>
                ) : (
                  cases
                    .filter((c) => c.status === 'PENDING')
                    .map((caseItem) => (
                      <tr key={caseItem._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{caseItem.caseNumber}</td>
                        <td className="px-6 py-4">{caseItem.seller?.companyName}</td>
                        <td className="px-6 py-4">{caseItem.buyer?.name}</td>
                        <td className="px-6 py-4">{formatCurrency(caseItem.dealValue)}</td>
                        <td className="px-6 py-4">{statusBadge(caseItem.status)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setResponseModal(caseItem)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Review & Respond
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Transaction #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Case
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Funded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => (
                    <tr key={txn._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{txn.transactionNumber}</td>
                      <td className="px-6 py-4">{txn.case?.caseNumber}</td>
                      <td className="px-6 py-4">{txn.seller?.companyName}</td>
                      <td className="px-6 py-4">{formatCurrency(txn.totalAmount)}</td>
                      <td className="px-6 py-4">{formatCurrency(txn.fundedAmount)}</td>
                      <td className="px-6 py-4">{statusBadge(txn.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Case #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Deal Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Shared At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cases.filter((c) => c.status !== 'PENDING').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No history
                    </td>
                  </tr>
                ) : (
                  cases
                    .filter((c) => c.status !== 'PENDING')
                    .map((caseItem) => (
                      <tr key={caseItem._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{caseItem.caseNumber}</td>
                        <td className="px-6 py-4">{caseItem.seller?.companyName}</td>
                        <td className="px-6 py-4">{formatCurrency(caseItem.dealValue)}</td>
                        <td className="px-6 py-4">{statusBadge(caseItem.status)}</td>
                        <td className="px-6 py-4">
                          {new Date(caseItem.sharedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Response Modal */}
        {responseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Review Case: {responseModal.caseNumber}</h2>
                  <button
                    onClick={() => setResponseModal(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-gray-600">Seller</p>
                    <p className="font-medium">{responseModal.seller?.companyName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">EPC (Buyer)</p>
                    <p className="font-medium">{responseModal.buyer?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Deal Value</p>
                    <p className="font-medium text-lg">{formatCurrency(responseModal.dealValue)}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Approval Terms</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Funding %</label>
                      <input
                        type="number"
                        value={responseForm.fundingPercentage}
                        onChange={(e) =>
                          setResponseForm({ ...responseForm, fundingPercentage: Number(e.target.value) })
                        }
                        className="w-full p-2 border rounded"
                        min={50}
                        max={80}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Interest Rate %</label>
                      <input
                        type="number"
                        value={responseForm.interestRate}
                        onChange={(e) =>
                          setResponseForm({ ...responseForm, interestRate: Number(e.target.value) })
                        }
                        className="w-full p-2 border rounded"
                        step={0.5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Tenor (Days)</label>
                      <input
                        type="number"
                        value={responseForm.tenorDays}
                        onChange={(e) =>
                          setResponseForm({ ...responseForm, tenorDays: Number(e.target.value) })
                        }
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(responseModal._id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(responseModal._id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>

                  <div className="mt-4">
                    <input
                      type="text"
                      value={responseForm.rejectionReason}
                      onChange={(e) =>
                        setResponseForm({ ...responseForm, rejectionReason: e.target.value })
                      }
                      placeholder="Rejection reason (if rejecting)"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NbfcDashboard;
