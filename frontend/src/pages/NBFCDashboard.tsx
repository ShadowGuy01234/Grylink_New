import { useState, useEffect } from 'react';
import { nbfcApi } from '../api';
import toast from 'react-hot-toast';
import {
  HiOutlineCurrencyRupee,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineRefresh,
  HiOutlineEye,
  HiOutlinePaperAirplane,
  HiOutlineXCircle,
  HiOutlineTrendingUp,
  HiOutlineCalendar,
} from 'react-icons/hi';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';

interface LPSData {
  interestRatePolicy: {
    preferredRate: number;
    maxRate: number;
    minRate: number;
  };
  exposureLimits: {
    perTransaction: number;
    perSeller: number;
    perBuyer: number;
    monthlyCapacity: number;
    monthlyUsed: number;
  };
  tenurePolicy: {
    minDays: number;
    maxDays: number;
    preferredDays: number;
  };
  riskAppetite: {
    acceptedCategories: string[];
    maxRiskScore: number;
  };
  sectorPreferences: {
    preferred: string[];
    avoided: string[];
  };
  geographyRestrictions: {
    allowedStates: string[];
    restrictedStates: string[];
  };
}

interface CWCAF {
  _id: string;
  cwcrfNumber: string;
  seller: {
    _id: string;
    companyName: string;
    gstin?: string;
  };
  buyer: {
    companyName: string;
    gstin?: string;
  };
  invoiceAmount: number;
  requestedAmount: number;
  approvedAmount: number;
  tenure: number;
  riskCategory: string;
  riskScore: number;
  status: string;
  sharedAt: string;
  expiresAt?: string;
}

interface Transaction {
  _id: string;
  transactionNumber: string;
  sellerId: { companyName: string };
  buyerId: { companyName: string };
  amount: number;
  interestRate: number;
  tenure: number;
  status: string;
  disbursedAt?: string;
  repayment?: {
    dueDate: string;
    status: string;
    overdueBy?: number;
  };
}

interface DashboardData {
  nbfc: {
    name: string;
    companyName: string;
    status: string;
  };
  metrics: {
    totalDeals: number;
    activeDeals: number;
    totalDisbursed: number;
    approvalRate: number;
    avgProcessingDays: number;
  };
  pendingOffers: number;
  monthlyUsage: {
    used: number;
    capacity: number;
  };
}

const NBFCDashboard = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [cwcafs, setCwcafs] = useState<CWCAF[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lps, setLps] = useState<LPSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // LPS Modal
  const [showLpsModal, setShowLpsModal] = useState(false);
  const [lpsForm, setLpsForm] = useState<LPSData | null>(null);
  const [savingLps, setSavingLps] = useState(false);

  // Quote Modal
  const [selectedCwcaf, setSelectedCwcaf] = useState<CWCAF | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    interestRate: '',
    processingFee: '',
    fundingDays: '',
    validityHours: '48',
    notes: '',
  });
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchData = async () => {
    try {
      const [dashboardRes, cwcafsRes, transactionsRes, lpsRes] = await Promise.all([
        nbfcApi.getDashboard().catch(() => ({ data: null })),
        nbfcApi.getAvailableCwcafs().catch(() => ({ data: { data: [] } })),
        nbfcApi.getTransactions().catch(() => ({ data: [] })),
        nbfcApi.getLps().catch(() => ({ data: null })),
      ]);

      setDashboard(dashboardRes.data);
      setCwcafs(cwcafsRes.data?.data || []);
      setTransactions(transactionsRes.data || []);
      setLps(lpsRes.data);
      if (lpsRes.data) {
        setLpsForm(lpsRes.data);
      }
    } catch (error: any) {
      toast.error('Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveLps = async () => {
    if (!lpsForm) return;
    setSavingLps(true);
    try {
      await nbfcApi.updateLps(lpsForm);
      toast.success('Lending Preference Sheet updated!');
      setShowLpsModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save LPS');
    } finally {
      setSavingLps(false);
    }
  };

  const handleSubmitQuote = async () => {
    if (!selectedCwcaf) return;
    if (!quoteForm.interestRate || !quoteForm.fundingDays) {
      toast.error('Interest rate and funding days are required');
      return;
    }

    setSubmittingQuote(true);
    try {
      await nbfcApi.submitQuote(selectedCwcaf._id, {
        interestRate: parseFloat(quoteForm.interestRate),
        processingFee: parseFloat(quoteForm.processingFee) || 0,
        fundingDays: parseInt(quoteForm.fundingDays),
        validityHours: parseInt(quoteForm.validityHours),
        notes: quoteForm.notes,
      });
      toast.success('Quote submitted successfully!');
      setShowQuoteModal(false);
      setSelectedCwcaf(null);
      setQuoteForm({ interestRate: '', processingFee: '', fundingDays: '', validityHours: '48', notes: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit quote');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const openQuoteModal = (cwcaf: CWCAF) => {
    setSelectedCwcaf(cwcaf);
    // Pre-fill with LPS defaults
    if (lps) {
      setQuoteForm({
        interestRate: lps.interestRatePolicy.preferredRate.toString(),
        processingFee: '1',
        fundingDays: lps.tenurePolicy.preferredDays.toString(),
        validityHours: '48',
        notes: '',
      });
    }
    setShowQuoteModal(true);
  };

  const openDetailModal = (cwcaf: CWCAF) => {
    setSelectedCwcaf(cwcaf);
    setShowDetailModal(true);
  };

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return 'Expired';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const riskBadge = (category: string) => {
    const colors: Record<string, string> = {
      LOW: 'success',
      MEDIUM: 'warning',
      HIGH: 'danger',
    };
    return <Badge status={category} variant={colors[category] || 'default'} />;
  };

  if (loading) {
    return <div className="page-loading">Loading NBFC Dashboard...</div>;
  }

  const capacityPercent = dashboard?.monthlyUsage 
    ? Math.round((dashboard.monthlyUsage.used / dashboard.monthlyUsage.capacity) * 100) 
    : 0;

  return (
    <div className="dashboard nbfc-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>NBFC Dashboard</h1>
          <p className="subtitle">{dashboard?.nbfc?.companyName || 'Lending Partner Portal'}</p>
        </div>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => setShowLpsModal(true)} icon={<HiOutlineCog />}>
            Configure LPS
          </Button>
          <Button variant="primary" onClick={() => fetchData()} icon={<HiOutlineRefresh />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Pending Offers"
          value={cwcafs.length}
          icon={<HiOutlineDocumentText />}
          color="blue"
          subtitle="Awaiting your quote"
        />
        <StatCard
          title="Active Deals"
          value={dashboard?.metrics?.activeDeals || 0}
          icon={<HiOutlineCurrencyRupee />}
          color="green"
          subtitle="Currently funded"
        />
        <StatCard
          title="Total Disbursed"
          value={`₹${((dashboard?.metrics?.totalDisbursed || 0) / 100000).toFixed(1)}L`}
          icon={<HiOutlineTrendingUp />}
          color="purple"
          subtitle="Lifetime"
        />
        <StatCard
          title="Approval Rate"
          value={`${dashboard?.metrics?.approvalRate || 0}%`}
          icon={<HiOutlineChartBar />}
          color="orange"
          subtitle="Success rate"
        />
      </div>

      {/* Capacity Meter */}
      <Card className="capacity-card">
        <div className="capacity-header">
          <h3>Monthly Capacity Utilization</h3>
          <span className="capacity-text">
            ₹{((dashboard?.monthlyUsage?.used || 0) / 100000).toFixed(1)}L 
            / ₹{((dashboard?.monthlyUsage?.capacity || 0) / 100000).toFixed(1)}L
          </span>
        </div>
        <div className="capacity-bar">
          <div 
            className={`capacity-fill ${capacityPercent > 80 ? 'high' : capacityPercent > 50 ? 'medium' : 'low'}`}
            style={{ width: `${Math.min(capacityPercent, 100)}%` }}
          />
        </div>
        <p className="capacity-meta">{capacityPercent}% utilized this month</p>
      </Card>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            <HiOutlineDocumentText /> Available Offers ({cwcafs.length})
          </button>
          <button
            className={activeTab === 'transactions' ? 'active' : ''}
            onClick={() => setActiveTab('transactions')}
          >
            <HiOutlineCurrencyRupee /> My Transactions ({transactions.length})
          </button>
          <button
            className={activeTab === 'lps' ? 'active' : ''}
            onClick={() => setActiveTab('lps')}
          >
            <HiOutlineCog /> Lending Preferences
          </button>
        </div>
      </div>

      {/* Available Offers Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {cwcafs.length === 0 ? (
            <Card className="empty-state">
              <HiOutlineDocumentText className="empty-icon" />
              <h3>No offers available</h3>
              <p>New CWCAFs matching your preferences will appear here.</p>
            </Card>
          ) : (
            <div className="cwcaf-grid">
              {cwcafs.map((cwcaf) => (
                <Card key={cwcaf._id} className="cwcaf-card">
                  <div className="cwcaf-header">
                    <span className="cwcaf-number">{cwcaf.cwcrfNumber}</span>
                    {riskBadge(cwcaf.riskCategory)}
                  </div>
                  
                  <div className="cwcaf-body">
                    <div className="cwcaf-parties">
                      <div className="party">
                        <span className="label">Seller</span>
                        <span className="value">{cwcaf.seller?.companyName}</span>
                      </div>
                      <div className="party">
                        <span className="label">Buyer</span>
                        <span className="value">{cwcaf.buyer?.companyName}</span>
                      </div>
                    </div>

                    <div className="cwcaf-details">
                      <div className="detail">
                        <HiOutlineCurrencyRupee />
                        <span>₹{(cwcaf.approvedAmount / 100000).toFixed(2)}L</span>
                      </div>
                      <div className="detail">
                        <HiOutlineCalendar />
                        <span>{cwcaf.tenure} days</span>
                      </div>
                      <div className="detail">
                        <HiOutlineChartBar />
                        <span>Score: {cwcaf.riskScore}</span>
                      </div>
                    </div>

                    {cwcaf.expiresAt && (
                      <div className={`cwcaf-timer ${getTimeRemaining(cwcaf.expiresAt) === 'Expired' ? 'expired' : ''}`}>
                        <HiOutlineClock />
                        <span>{getTimeRemaining(cwcaf.expiresAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="cwcaf-actions">
                    <Button variant="secondary" size="sm" onClick={() => openDetailModal(cwcaf)}>
                      <HiOutlineEye /> Details
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => openQuoteModal(cwcaf)}>
                      <HiOutlinePaperAirplane /> Submit Quote
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="tab-content">
          {transactions.length === 0 ? (
            <Card className="empty-state">
              <HiOutlineCurrencyRupee className="empty-icon" />
              <h3>No transactions yet</h3>
              <p>Your funded deals will appear here.</p>
            </Card>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Transaction #</th>
                    <th>Seller</th>
                    <th>Buyer</th>
                    <th>Amount</th>
                    <th>Rate</th>
                    <th>Tenure</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn._id}>
                      <td className="font-medium">{txn.transactionNumber}</td>
                      <td>{txn.sellerId?.companyName}</td>
                      <td>{txn.buyerId?.companyName}</td>
                      <td>₹{(txn.amount / 100000).toFixed(2)}L</td>
                      <td>{txn.interestRate}%</td>
                      <td>{txn.tenure} days</td>
                      <td>
                        <Badge 
                          status={txn.status} 
                          variant={
                            txn.status === 'COMPLETED' ? 'success' :
                            txn.status === 'OVERDUE' ? 'danger' :
                            txn.status === 'ACTIVE' ? 'info' : 'default'
                          } 
                        />
                      </td>
                      <td>
                        {txn.repayment?.dueDate 
                          ? new Date(txn.repayment.dueDate).toLocaleDateString()
                          : '—'
                        }
                        {txn.repayment?.overdueBy && (
                          <span className="overdue-badge">+{txn.repayment.overdueBy}d</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* LPS Tab */}
      {activeTab === 'lps' && (
        <div className="tab-content">
          {!lps ? (
            <Card className="empty-state">
              <HiOutlineCog className="empty-icon" />
              <h3>Configure your Lending Preferences</h3>
              <p>Set up your LPS to receive matching opportunities.</p>
              <Button variant="primary" onClick={() => setShowLpsModal(true)}>
                Configure Now
              </Button>
            </Card>
          ) : (
            <div className="lps-display">
              <Card>
                <h3>Interest Rate Policy</h3>
                <div className="lps-grid">
                  <div className="lps-item">
                    <span className="lps-label">Preferred Rate</span>
                    <span className="lps-value">{lps.interestRatePolicy.preferredRate}%</span>
                  </div>
                  <div className="lps-item">
                    <span className="lps-label">Min Rate</span>
                    <span className="lps-value">{lps.interestRatePolicy.minRate}%</span>
                  </div>
                  <div className="lps-item">
                    <span className="lps-label">Max Rate</span>
                    <span className="lps-value">{lps.interestRatePolicy.maxRate}%</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3>Exposure Limits</h3>
                <div className="lps-grid">
                  <div className="lps-item">
                    <span className="lps-label">Per Transaction</span>
                    <span className="lps-value">₹{(lps.exposureLimits.perTransaction / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="lps-item">
                    <span className="lps-label">Per Seller</span>
                    <span className="lps-value">₹{(lps.exposureLimits.perSeller / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="lps-item">
                    <span className="lps-label">Monthly Capacity</span>
                    <span className="lps-value">₹{(lps.exposureLimits.monthlyCapacity / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3>Tenure Policy</h3>
                <div className="lps-grid">
                  <div className="lps-item">
                    <span className="lps-label">Preferred Days</span>
                    <span className="lps-value">{lps.tenurePolicy.preferredDays} days</span>
                  </div>
                  <div className="lps-item">
                    <span className="lps-label">Min Days</span>
                    <span className="lps-value">{lps.tenurePolicy.minDays} days</span>
                  </div>
                  <div className="lps-item">
                    <span className="lps-label">Max Days</span>
                    <span className="lps-value">{lps.tenurePolicy.maxDays} days</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3>Risk Appetite</h3>
                <div className="lps-grid">
                  <div className="lps-item">
                    <span className="lps-label">Accepted Categories</span>
                    <div className="lps-tags">
                      {lps.riskAppetite.acceptedCategories.map((cat) => (
                        <Badge key={cat} status={cat} variant={cat === 'LOW' ? 'success' : cat === 'MEDIUM' ? 'warning' : 'danger'} />
                      ))}
                    </div>
                  </div>
                  <div className="lps-item">
                    <span className="lps-label">Max Risk Score</span>
                    <span className="lps-value">{lps.riskAppetite.maxRiskScore}</span>
                  </div>
                </div>
              </Card>

              <div className="lps-actions">
                <Button variant="primary" onClick={() => setShowLpsModal(true)}>
                  <HiOutlineCog /> Edit Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LPS Configuration Modal */}
      {showLpsModal && (
        <Modal title="Configure Lending Preference Sheet" onClose={() => setShowLpsModal(false)} size="large">
          <div className="lps-form">
            <div className="form-section">
              <h4>Interest Rate Policy</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={lpsForm?.interestRatePolicy.preferredRate || ''}
                    onChange={(e) => setLpsForm(prev => prev ? {
                      ...prev,
                      interestRatePolicy: { ...prev.interestRatePolicy, preferredRate: parseFloat(e.target.value) }
                    } : null)}
                  />
                </div>
                <div className="form-group">
                  <label>Min Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={lpsForm?.interestRatePolicy.minRate || ''}
                    onChange={(e) => setLpsForm(prev => prev ? {
                      ...prev,
                      interestRatePolicy: { ...prev.interestRatePolicy, minRate: parseFloat(e.target.value) }
                    } : null)}
                  />
                </div>
                <div className="form-group">
                  <label>Max Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={lpsForm?.interestRatePolicy.maxRate || ''}
                    onChange={(e) => setLpsForm(prev => prev ? {
                      ...prev,
                      interestRatePolicy: { ...prev.interestRatePolicy, maxRate: parseFloat(e.target.value) }
                    } : null)}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Exposure Limits</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Per Transaction (₹)</label>
                  <input
                    type="number"
                    value={lpsForm?.exposureLimits.perTransaction || ''}
                    onChange={(e) => setLpsForm(prev => prev ? {
                      ...prev,
                      exposureLimits: { ...prev.exposureLimits, perTransaction: parseFloat(e.target.value) }
                    } : null)}
                  />
                </div>
                <div className="form-group">
                  <label>Per Seller (₹)</label>
                  <input
                    type="number"
                    value={lpsForm?.exposureLimits.perSeller || ''}
                    onChange={(e) => setLpsForm(prev => prev ? {
                      ...prev,
                      exposureLimits: { ...prev.exposureLimits, perSeller: parseFloat(e.target.value) }
                    } : null)}
                  />
                </div>
                <div className="form-group">
                  <label>Monthly Capacity (₹)</label>
                  <input
                    type="number"
                    value={lpsForm?.exposureLimits.monthlyCapacity || ''}
                    onChange={(e) => setLpsForm(prev => prev ? {
                      ...prev,
                      exposureLimits: { ...prev.exposureLimits, monthlyCapacity: parseFloat(e.target.value) }
                    } : null)}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Tenure Policy</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Days</label>
                  <input
                    type="number"
                    value={lpsForm?.tenurePolicy.preferredDays || ''}
                    onChange={(e) => setLpsForm(prev => prev ? {
                      ...prev,
                      tenurePolicy: { ...prev.tenurePolicy, preferredDays: parseInt(e.target.value) }
                    } : null)}
                  />
                </div>
                <div className="form-group">
                  <label>Min Days</label>
                  <input
                    type="number"
                    value={lpsForm?.tenurePolicy.minDays || ''}
                    onChange={(e) => setLpsForm(prev => prev ? {
                      ...prev,
                      tenurePolicy: { ...prev.tenurePolicy, minDays: parseInt(e.target.value) }
                    } : null)}
                  />
                </div>
                <div className="form-group">
                  <label>Max Days</label>
                  <input
                    type="number"
                    value={lpsForm?.tenurePolicy.maxDays || ''}
                    onChange={(e) => setLpsForm(prev => prev ? {
                      ...prev,
                      tenurePolicy: { ...prev.tenurePolicy, maxDays: parseInt(e.target.value) }
                    } : null)}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Risk Appetite</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Accepted Risk Categories</label>
                  <div className="checkbox-group">
                    {['LOW', 'MEDIUM', 'HIGH'].map((cat) => (
                      <label key={cat} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={lpsForm?.riskAppetite.acceptedCategories.includes(cat) || false}
                          onChange={(e) => {
                            if (!lpsForm) return;
                            const categories = e.target.checked
                              ? [...lpsForm.riskAppetite.acceptedCategories, cat]
                              : lpsForm.riskAppetite.acceptedCategories.filter(c => c !== cat);
                            setLpsForm({
                              ...lpsForm,
                              riskAppetite: { ...lpsForm.riskAppetite, acceptedCategories: categories }
                            });
                          }}
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Max Risk Score</label>
                  <input
                    type="number"
                    max={100}
                    value={lpsForm?.riskAppetite.maxRiskScore || ''}
                    onChange={(e) => setLpsForm(prev => prev ? {
                      ...prev,
                      riskAppetite: { ...prev.riskAppetite, maxRiskScore: parseInt(e.target.value) }
                    } : null)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowLpsModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveLps} disabled={savingLps}>
              {savingLps ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Quote Submission Modal */}
      {showQuoteModal && selectedCwcaf && (
        <Modal title="Submit Quote" onClose={() => setShowQuoteModal(false)}>
          <div className="quote-form">
            <div className="quote-summary">
              <h4>{selectedCwcaf.cwcrfNumber}</h4>
              <p><strong>Seller:</strong> {selectedCwcaf.seller?.companyName}</p>
              <p><strong>Buyer:</strong> {selectedCwcaf.buyer?.companyName}</p>
              <p><strong>Amount:</strong> ₹{(selectedCwcaf.approvedAmount / 100000).toFixed(2)}L</p>
              <p><strong>Tenure:</strong> {selectedCwcaf.tenure} days</p>
              <p><strong>Risk:</strong> {selectedCwcaf.riskCategory} (Score: {selectedCwcaf.riskScore})</p>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label>Interest Rate (% p.a.) *</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g., 16.5"
                  value={quoteForm.interestRate}
                  onChange={(e) => setQuoteForm({ ...quoteForm, interestRate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Processing Fee (%)</label>
                <input
                  type="number"
                  step="0.25"
                  placeholder="e.g., 1.0"
                  value={quoteForm.processingFee}
                  onChange={(e) => setQuoteForm({ ...quoteForm, processingFee: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Funding Timeline (days) *</label>
                <input
                  type="number"
                  placeholder="e.g., 3"
                  value={quoteForm.fundingDays}
                  onChange={(e) => setQuoteForm({ ...quoteForm, fundingDays: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Quote Validity (hours)</label>
                <select
                  value={quoteForm.validityHours}
                  onChange={(e) => setQuoteForm({ ...quoteForm, validityHours: e.target.value })}
                >
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="72">72 hours</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  placeholder="Any additional terms or conditions..."
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowQuoteModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitQuote} disabled={submittingQuote}>
              {submittingQuote ? 'Submitting...' : 'Submit Quote'}
            </Button>
          </div>
        </Modal>
      )}

      {/* CWCAF Detail Modal */}
      {showDetailModal && selectedCwcaf && (
        <Modal title="CWCAF Details" onClose={() => setShowDetailModal(false)} size="large">
          <div className="cwcaf-detail">
            <div className="detail-header">
              <h3>{selectedCwcaf.cwcrfNumber}</h3>
              {riskBadge(selectedCwcaf.riskCategory)}
            </div>

            <div className="detail-sections">
              <div className="detail-section">
                <h4>Seller Information</h4>
                <p><strong>Company:</strong> {selectedCwcaf.seller?.companyName}</p>
                <p><strong>GSTIN:</strong> {selectedCwcaf.seller?.gstin || '—'}</p>
              </div>

              <div className="detail-section">
                <h4>Buyer Information</h4>
                <p><strong>Company:</strong> {selectedCwcaf.buyer?.companyName}</p>
                <p><strong>GSTIN:</strong> {selectedCwcaf.buyer?.gstin || '—'}</p>
              </div>

              <div className="detail-section">
                <h4>Financial Details</h4>
                <p><strong>Invoice Amount:</strong> ₹{(selectedCwcaf.invoiceAmount / 100000).toFixed(2)}L</p>
                <p><strong>Requested Amount:</strong> ₹{(selectedCwcaf.requestedAmount / 100000).toFixed(2)}L</p>
                <p><strong>Approved Amount:</strong> ₹{(selectedCwcaf.approvedAmount / 100000).toFixed(2)}L</p>
                <p><strong>Tenure:</strong> {selectedCwcaf.tenure} days</p>
              </div>

              <div className="detail-section">
                <h4>Risk Assessment</h4>
                <p><strong>Risk Category:</strong> {selectedCwcaf.riskCategory}</p>
                <p><strong>Risk Score:</strong> {selectedCwcaf.riskScore} / 100</p>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
            <Button variant="primary" onClick={() => {
              setShowDetailModal(false);
              openQuoteModal(selectedCwcaf);
            }}>
              <HiOutlinePaperAirplane /> Submit Quote
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NBFCDashboard;
