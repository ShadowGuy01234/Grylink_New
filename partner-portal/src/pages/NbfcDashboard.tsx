import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, cwcrfApi } from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface NbfcCase {
  _id: string;
  caseNumber: string;
  seller: { name: string; companyName: string };
  buyer: { name: string };
  dealValue: number;
  status: string;
  sharedAt: string;
}

interface AvailableCwcrf {
  _id: string;
  cwcRfNumber?: string;
  subContractorId?: { companyName: string };
  buyerDetails?: { buyerName: string };
  cwcRequest?: { requestedAmount: number; requestedTenure: number };
  riskCategory?: string;
  sharedAt?: string;
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [cases, setCases] = useState<NbfcCase[]>([]);
  const [availableCwcrfs, setAvailableCwcrfs] = useState<AvailableCwcrf[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
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
      const [casesRes, dashboardRes, transactionsRes, cwcrfsRes] = await Promise.all([
        api.get('/nbfc/cases').catch(() => ({ data: [] })),
        api.get('/nbfc/dashboard').catch(() => ({ data: null })),
        api.get('/transactions').catch(() => ({ data: [] })),
        cwcrfApi.getAvailableCwcrfs().catch(() => ({ data: { cwcrfs: [] } })),
      ]);
      setCases(casesRes.data);
      setDashboard(dashboardRes.data);
      setTransactions(transactionsRes.data);
      const cwcrfsData = cwcrfsRes.data;
      setAvailableCwcrfs(
        Array.isArray(cwcrfsData) ? cwcrfsData :
        Array.isArray(cwcrfsData?.cwcrfs) ? cwcrfsData.cwcrfs : []
      );
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const riskBadge = (cat?: string) => {
    const map: Record<string, string> = {
      LOW: 'bg-emerald-100 text-emerald-700',
      MEDIUM: 'bg-amber-100 text-amber-700',
      HIGH: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${map[cat || ''] || 'bg-gray-100 text-gray-600'}`}>
        {cat || '—'}
      </span>
    );
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700',
      APPROVED: 'bg-emerald-100 text-emerald-700',
      NBFC_APPROVED: 'bg-emerald-100 text-emerald-700',
      REJECTED: 'bg-red-100 text-red-700',
      DISBURSED: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-emerald-100 text-emerald-700',
      OVERDUE: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${map[status] || 'bg-gray-100 text-gray-600'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  const pendingCases = cases.filter((c) => c.status === 'PENDING');
  const historyCases = cases.filter((c) => c.status !== 'PENDING');
  const availableCount = availableCwcrfs.length;

  const tabTitles: Record<string, { heading: string; sub: string }> = {
    overview:     { heading: 'Overview',           sub: 'Your NBFC dashboard summary' },
    cwcafs:       { heading: 'Available CWCAFs',   sub: 'CWCAFs shared with your NBFC — submit quotes' },
    cases:        { heading: 'My Cases',            sub: 'Cases you have reviewed and responded to' },
    transactions: { heading: 'Transactions',        sub: 'Disbursed and active transactions' },
    history:      { heading: 'History',             sub: 'All past case responses' },
  };

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'cwcafs',
      label: 'Available CWCAFs',
      badge: availableCount > 0 ? availableCount : undefined,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'cases',
      label: 'My Cases',
      badge: pendingCases.length > 0 ? pendingCases.length : undefined,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'history',
      label: 'History',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="app-container">
        <aside className="sidebar">
          <div className="mb-8 px-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">G</div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-600">Gryork</h1>
              <p className="text-xs text-slate-400 font-medium">Partner Portal</p>
            </div>
          </div>
        </aside>
        <main className="main-content-area flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading dashboard…</p>
          </div>
        </main>
      </div>
    );
  }

  const { heading, sub } = tabTitles[activeTab] || tabTitles.overview;

  return (
    <div className="app-container">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">G</div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-600">Gryork</h1>
            <p className="text-xs text-slate-400 font-medium">Partner Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Menu</p>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
              {item.badge !== undefined && (
                <span className="ml-auto bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="pt-2 mt-2 border-t border-slate-100">
            <button
              onClick={() => navigate('/nbfc/lps')}
              className="nav-item text-purple-600 hover:bg-purple-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              LPS Settings
            </button>
            <button
              onClick={() => navigate('/nbfc/quotations')}
              className="nav-item"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              My Quotations
            </button>
          </div>
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
              {user?.name?.[0]?.toUpperCase() || 'N'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-slate-700 truncate">{user?.name || 'NBFC User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content-area">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{heading}</h2>
            <p className="text-slate-500 text-sm mt-1">{sub}</p>
          </div>
          <div className="px-4 py-1.5 rounded-full text-sm font-semibold border bg-violet-50 text-violet-600 border-violet-200">
            NBFC
          </div>
        </header>

        <AnimatePresence mode="wait">

          {/* ── Overview Tab ── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Available CWCAFs', value: availableCount, color: 'bg-emerald-50 text-emerald-600', action: () => setActiveTab('cwcafs'), actionLabel: 'View →' },
                  { label: 'Pending Review', value: pendingCases.length, color: 'bg-amber-50 text-amber-600', action: () => setActiveTab('cases'), actionLabel: 'Review →' },
                  { label: 'Approved Cases', value: dashboard?.approvedCases || 0, color: 'bg-blue-50 text-blue-600', action: undefined, actionLabel: '' },
                  { label: 'Total Disbursed', value: fmt(dashboard?.totalDisbursed || 0), color: 'bg-purple-50 text-purple-600', action: () => setActiveTab('transactions'), actionLabel: 'View →', isStr: true },
                ].map((stat) => (
                  <div key={stat.label} className="stat-card-premium">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    {stat.action && (
                      <button onClick={stat.action} className="mt-3 text-xs text-indigo-600 hover:underline font-medium">
                        {stat.actionLabel}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">Quick Actions</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Browse Available CWCAFs', desc: `${availableCount} waiting for quotes`, tab: 'cwcafs', color: 'emerald' },
                    { label: 'Pending Case Reviews', desc: `${pendingCases.length} need your response`, tab: 'cases', color: 'amber' },
                    { label: 'Update LPS Settings', desc: 'Adjust your lending parameters', lps: true, color: 'violet' },
                  ].map((action) => {
                    const colors: Record<string, string> = { emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', violet: 'bg-violet-50 text-violet-600' };
                    return (
                      <button
                        key={action.label}
                        onClick={() => action.lps ? navigate('/nbfc/lps') : setActiveTab(action.tab!)}
                        className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div className={`${colors[action.color]} p-2.5 rounded-lg`}>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{action.label}</p>
                          <p className="text-xs text-gray-500">{action.desc}</p>
                        </div>
                        <svg className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pending Cases Preview */}
              {pendingCases.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                    <button onClick={() => setActiveTab('cases')} className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5">
                      View all
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
                    {pendingCases.slice(0, 3).map((c) => (
                      <div key={c._id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.seller?.companyName}</p>
                          <p className="text-xs text-gray-500">{c.caseNumber}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-700">{fmt(c.dealValue)}</span>
                          <button onClick={() => setResponseModal(c)} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700">
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Available CWCAFs Tab ── */}
          {activeTab === 'cwcafs' && (
            <motion.div key="cwcafs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              {availableCwcrfs.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-500">No CWCAFs available right now</p>
                  <p className="text-sm text-gray-400 mt-1">Gryork will notify you when new cases match your LPS criteria</p>
                  <button onClick={() => navigate('/nbfc/lps')} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                    Review LPS Settings
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {availableCwcrfs.map((cwcrf) => (
                    <div key={cwcrf._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm font-semibold text-gray-800 font-mono">
                              {cwcrf.cwcRfNumber || cwcrf._id.slice(-8).toUpperCase()}
                            </span>
                            {riskBadge(cwcrf.riskCategory)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Sub-Contractor</p>
                              <p className="font-medium text-gray-800 truncate">{cwcrf.subContractorId?.companyName || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Buyer (EPC)</p>
                              <p className="font-medium text-gray-800 truncate">{cwcrf.buyerDetails?.buyerName || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Requested Amount</p>
                              <p className="font-semibold text-indigo-700">{fmt(cwcrf.cwcRequest?.requestedAmount || 0)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Tenure</p>
                              <p className="font-medium text-gray-800">{cwcrf.cwcRequest?.requestedTenure || '—'} days</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/nbfc/quotations')}
                          className="shrink-0 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 font-medium"
                        >
                          Submit Quote
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── My Cases Tab ── */}
          {activeTab === 'cases' && (
            <motion.div key="cases" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              {pendingCases.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-lg font-medium text-gray-500">No pending cases</p>
                  <p className="text-sm text-gray-400 mt-1">All cases have been reviewed</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Case #', 'Seller', 'EPC (Buyer)', 'Deal Value', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pendingCases.map((c) => (
                        <tr key={c._id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 text-sm font-medium font-mono text-gray-800">{c.caseNumber}</td>
                          <td className="px-5 py-4 text-sm text-gray-700">{c.seller?.companyName}</td>
                          <td className="px-5 py-4 text-sm text-gray-700">{c.buyer?.name}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-indigo-700">{fmt(c.dealValue)}</td>
                          <td className="px-5 py-4">{statusBadge(c.status)}</td>
                          <td className="px-5 py-4">
                            <button onClick={() => setResponseModal(c)} className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 font-medium">
                              Review & Respond
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Transactions Tab ── */}
          {activeTab === 'transactions' && (
            <motion.div key="transactions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              {transactions.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-lg font-medium text-gray-500">No transactions yet</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Txn #', 'Case', 'Seller', 'Total', 'Funded', 'Status'].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions.map((txn) => (
                        <tr key={txn._id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 text-sm font-medium font-mono">{txn.transactionNumber}</td>
                          <td className="px-5 py-4 text-sm">{txn.case?.caseNumber}</td>
                          <td className="px-5 py-4 text-sm">{txn.seller?.companyName}</td>
                          <td className="px-5 py-4 text-sm font-semibold">{fmt(txn.totalAmount)}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-emerald-700">{fmt(txn.fundedAmount)}</td>
                          <td className="px-5 py-4">{statusBadge(txn.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ── History Tab ── */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              {historyCases.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-lg font-medium text-gray-500">No history yet</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Case #', 'Seller', 'Deal Value', 'Status', 'Shared At'].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {historyCases.map((c) => (
                        <tr key={c._id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 text-sm font-medium font-mono">{c.caseNumber}</td>
                          <td className="px-5 py-4 text-sm">{c.seller?.companyName}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-indigo-700">{fmt(c.dealValue)}</td>
                          <td className="px-5 py-4">{statusBadge(c.status)}</td>
                          <td className="px-5 py-4 text-sm text-gray-500">{new Date(c.sharedAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Response Modal ── */}
      {responseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Review Case</h2>
                  <p className="text-sm text-gray-500 font-mono">{responseModal.caseNumber}</p>
                </div>
                <button onClick={() => setResponseModal(null)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Sub-Contractor (Seller)</p>
                  <p className="font-semibold text-gray-800">{responseModal.seller?.companyName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">EPC (Buyer)</p>
                  <p className="font-semibold text-gray-800">{responseModal.buyer?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Deal Value</p>
                  <p className="font-semibold text-indigo-700 text-lg">{fmt(responseModal.dealValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Status</p>
                  {statusBadge(responseModal.status)}
                </div>
              </div>

              <div className="space-y-4 mb-5">
                <p className="text-sm font-semibold text-gray-700">Your Approval Terms</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Funding %', key: 'fundingPercentage', min: 50, max: 80, step: 5 },
                    { label: 'Interest Rate % p.a.', key: 'interestRate', min: 8, max: 36, step: 0.5 },
                    { label: 'Tenor (Days)', key: 'tenorDays', min: 30, max: 180, step: 15 },
                  ].map(({ label, key, min, max, step }) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input
                        type="number"
                        value={(responseForm as any)[key]}
                        onChange={(e) => setResponseForm({ ...responseForm, [key]: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min={min} max={max} step={step}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Rejection Reason (only if rejecting)</label>
                  <input
                    type="text"
                    value={responseForm.rejectionReason}
                    onChange={(e) => setResponseForm({ ...responseForm, rejectionReason: e.target.value })}
                    placeholder="Reason for rejection…"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleApprove(responseModal._id)}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleReject(responseModal._id)}
                  disabled={!responseForm.rejectionReason.trim()}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NbfcDashboard;
