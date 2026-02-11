import React, { useState, useEffect } from 'react';
import { scApi } from '../api';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    companyName: '', ownerName: '', address: '', phone: '', vendorId: '', gstin: '',
  });
  const [saving, setSaving] = useState(false);

  // Bill upload
  const [billFiles, setBillFiles] = useState<File[]>([]);
  const [billData, setBillData] = useState({ billNumber: '', amount: '', description: '' });
  const [uploadingBill, setUploadingBill] = useState(false);

  // CWC
  const [selectedBillForCwc, setSelectedBillForCwc] = useState('');
  const [submittingCwc, setSubmittingCwc] = useState(false);

  // Bids response
  const [respondingBid, setRespondingBid] = useState<string | null>(null);
  const [counterOffer, setCounterOffer] = useState({ amount: '', duration: '', message: '' });

  const fetchData = async () => {
    try {
      const res = await scApi.getProfile();
      setDashboard(res.data);
      if (res.data.subContractor) {
        const sc = res.data.subContractor;
        setProfileForm({
          companyName: sc.companyName || '', ownerName: sc.ownerName || '',
          address: sc.address || '', phone: sc.phone || '',
          vendorId: sc.vendorId || '', gstin: sc.gstin || '',
        });
      }
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await scApi.updateProfile(profileForm);
      toast.success('Profile updated!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billFiles.length === 0) return toast.error('Select bill files');
    setUploadingBill(true);
    try {
      const formData = new FormData();
      billFiles.forEach((f) => formData.append('bills', f));
      formData.append('billNumber', billData.billNumber);
      formData.append('amount', billData.amount);
      formData.append('description', billData.description);
      await scApi.submitBill(formData);
      toast.success('Bill uploaded!');
      setBillFiles([]); setBillData({ billNumber: '', amount: '', description: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploadingBill(false);
    }
  };

  const handleSubmitCwc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForCwc) return toast.error('Select a verified bill');
    setSubmittingCwc(true);
    try {
      await scApi.submitCwc({ billId: selectedBillForCwc });
      toast.success('CWC RF submitted!');
      setSelectedBillForCwc('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmittingCwc(false);
    }
  };

  const handleBidResponse = async (bidId: string, decision: 'accept' | 'reject' | 'negotiate') => {
    try {
      const data: { decision: string; counterOffer?: any } = { decision };
      if (decision === 'negotiate' && counterOffer.amount) {
        data.counterOffer = {
          amount: parseFloat(counterOffer.amount),
          duration: parseInt(counterOffer.duration) || undefined,
          message: counterOffer.message,
        };
      }
      await scApi.respondToBid(bidId, data);
      toast.success(decision === 'accept' ? 'Bid accepted!' : decision === 'reject' ? 'Bid rejected' : 'Counter-offer sent!');
      setRespondingBid(null);
      setCounterOffer({ amount: '', duration: '', message: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to respond');
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      LEAD_CREATED: 'badge-yellow', PROFILE_INCOMPLETE: 'badge-yellow', PROFILE_COMPLETED: 'badge-green',
      UPLOADED: 'badge-yellow', VERIFIED: 'badge-green', REJECTED: 'badge-red',
      SUBMITTED: 'badge-blue', ACTION_REQUIRED: 'badge-red', KYC_COMPLETED: 'badge-green',
      EPC_VERIFIED: 'badge-green', BID_PLACED: 'badge-blue', NEGOTIATION_IN_PROGRESS: 'badge-yellow',
      COMMERCIAL_LOCKED: 'badge-green', ACCEPTED: 'badge-green',
    };
    return <span className={`badge ${colors[status] || 'badge-gray'}`}>{status.replace(/_/g, ' ')}</span>;
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  const sc = dashboard?.subContractor;
  const verifiedBills = dashboard?.bills?.filter((b: any) => b.status === 'VERIFIED') || [];
  const pendingBids = dashboard?.bids?.filter((b: any) => b.status === 'SUBMITTED' || b.status === 'NEGOTIATION_IN_PROGRESS') || [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>{sc?.companyName || 'Sub-Contractor'}</h1>
          <p className="subtitle">Sub-Contractor Dashboard {sc && statusBadge(sc.status)}</p>
        </div>
        {pendingBids.length > 0 && (
          <div className="notification-badge">
            <span className="badge badge-red">{pendingBids.length} pending bid{pendingBids.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="tabs">
        {['profile', 'bills', 'cwc', 'cases', 'bids'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}>
            {t.toUpperCase()}
            {t === 'bids' && pendingBids.length > 0 && <span className="tab-badge">{pendingBids.length}</span>}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="section">
          <h2>Complete Your Profile</h2>
          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="form-grid">
              <div className="form-group"><label>Company Name *</label>
                <input required value={profileForm.companyName} onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })} /></div>
              <div className="form-group"><label>Owner Name *</label>
                <input required value={profileForm.ownerName} onChange={(e) => setProfileForm({ ...profileForm, ownerName: e.target.value })} /></div>
              <div className="form-group"><label>Phone *</label>
                <input required value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></div>
              <div className="form-group"><label>Vendor ID</label>
                <input value={profileForm.vendorId} onChange={(e) => setProfileForm({ ...profileForm, vendorId: e.target.value })} /></div>
              <div className="form-group"><label>GSTIN</label>
                <input value={profileForm.gstin} onChange={(e) => setProfileForm({ ...profileForm, gstin: e.target.value })} /></div>
              <div className="form-group full-span"><label>Address *</label>
                <textarea required value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} /></div>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
          </form>
        </div>
      )}

      {/* Bills Tab */}
      {activeTab === 'bills' && (
        <div className="section">
          <h2>Upload Bills</h2>
          <form onSubmit={handleUploadBill} className="upload-form">
            <div className="form-grid">
              <div className="form-group"><label>Bill Number</label>
                <input value={billData.billNumber} onChange={(e) => setBillData({ ...billData, billNumber: e.target.value })} /></div>
              <div className="form-group"><label>Amount (₹)</label>
                <input type="number" value={billData.amount} onChange={(e) => setBillData({ ...billData, amount: e.target.value })} /></div>
              <div className="form-group full-span"><label>Description</label>
                <input value={billData.description} onChange={(e) => setBillData({ ...billData, description: e.target.value })} /></div>
            </div>
            <input type="file" multiple onChange={(e) => setBillFiles(Array.from(e.target.files || []))} />
            <button type="submit" className="btn-primary" disabled={uploadingBill || billFiles.length === 0}>
              {uploadingBill ? 'Uploading...' : 'Upload Bills'}
            </button>
          </form>

          <h3 style={{ marginTop: 24 }}>Your Bills</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Bill #</th><th>Amount</th><th>File</th><th>Status</th></tr></thead>
              <tbody>
                {dashboard?.bills?.map((b: any) => (
                  <tr key={b._id}>
                    <td>{b.billNumber || '—'}</td>
                    <td>{b.amount ? `₹${b.amount.toLocaleString()}` : '—'}</td>
                    <td><a href={b.fileUrl} target="_blank" rel="noreferrer">{b.fileName}</a></td>
                    <td>{statusBadge(b.status)}</td>
                  </tr>
                ))}
                {(!dashboard?.bills || dashboard.bills.length === 0) && (
                  <tr><td colSpan={4} className="empty-state">No bills uploaded</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CWC Tab */}
      {activeTab === 'cwc' && (
        <div className="section">
          <h2>Submit CWC RF (Confirmation With Company Request for Funding)</h2>
          <p className="description">Select a verified bill to submit a CWC RF. A ₹1,000 platform fee applies.</p>
          
          <form onSubmit={handleSubmitCwc} className="cwc-form">
            <div className="form-group">
              <label>Select Verified Bill</label>
              <select value={selectedBillForCwc} onChange={(e) => setSelectedBillForCwc(e.target.value)}>
                <option value="">-- Select a Bill --</option>
                {verifiedBills.map((b: any) => (
                  <option key={b._id} value={b._id}>
                    {b.billNumber} - ₹{b.amount?.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            {verifiedBills.length === 0 && (
              <p className="warning">No verified bills available. Bills must be verified by Ops before submitting CWC.</p>
            )}
            <button type="submit" className="btn-primary" disabled={submittingCwc || !selectedBillForCwc}>
              {submittingCwc ? 'Submitting...' : 'Submit CWC RF'}
            </button>
          </form>

          <h3 style={{ marginTop: 24 }}>Your CWC Requests</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Bill</th><th>Platform Fee</th><th>Status</th><th>Submitted</th></tr></thead>
              <tbody>
                {dashboard?.cwcRfs?.map((c: any) => (
                  <tr key={c._id}>
                    <td>{c.billId?.billNumber || '—'}</td>
                    <td>{c.platformFeePaid ? '✅ Paid' : '❌ Pending'}</td>
                    <td>{statusBadge(c.status)}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(!dashboard?.cwcRfs || dashboard.cwcRfs.length === 0) && (
                  <tr><td colSpan={4} className="empty-state">No CWC requests submitted</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cases Tab */}
      {activeTab === 'cases' && (
        <div className="section">
          <h2>Your Cases</h2>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Case #</th><th>Bill</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {dashboard?.cases?.map((c: any) => (
                  <tr key={c._id}>
                    <td>{c.caseNumber}</td>
                    <td>{c.billId?.billNumber || '—'}</td>
                    <td>{c.billId?.amount ? `₹${c.billId.amount.toLocaleString()}` : '—'}</td>
                    <td>{statusBadge(c.status)}</td>
                  </tr>
                ))}
                {(!dashboard?.cases || dashboard.cases.length === 0) && (
                  <tr><td colSpan={4} className="empty-state">No cases yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bids Tab */}
      {activeTab === 'bids' && (
        <div className="section">
          <h2>Incoming Bids</h2>
          <p className="description">Review and respond to funding offers from EPC companies and NBFCs.</p>
          
          <div className="bids-list">
            {dashboard?.bids?.map((bid: any) => (
              <div key={bid._id} className="bid-card">
                <div className="bid-header">
                  <h3>Case #{bid.caseId?.caseNumber || 'N/A'}</h3>
                  {statusBadge(bid.status)}
                </div>
                <div className="bid-details">
                  <div className="detail">
                    <span className="label">From:</span>
                    <span>{bid.epcId?.companyName || bid.nbfcId?.companyName || 'Unknown'}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Bill Amount:</span>
                    <span>₹{bid.caseId?.billId?.amount?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Bid Amount:</span>
                    <span className="highlight">₹{bid.bidAmount?.toLocaleString()}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Duration:</span>
                    <span>{bid.fundingDurationDays} days</span>
                  </div>
                  {bid.notes && (
                    <div className="detail full-width">
                      <span className="label">Notes:</span>
                      <span>{bid.notes}</span>
                    </div>
                  )}
                </div>

                {/* Negotiation history */}
                {bid.negotiations?.length > 0 && (
                  <div className="negotiations">
                    <h4>Negotiation History</h4>
                    {bid.negotiations.map((n: any, i: number) => (
                      <div key={i} className={`negotiation-item ${n.proposedByRole}`}>
                        <span className="role">{n.proposedByRole}</span>
                        <span>₹{n.counterAmount?.toLocaleString()} for {n.counterDuration} days</span>
                        {n.message && <p className="message">"{n.message}"</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions for pending bids */}
                {(bid.status === 'SUBMITTED' || bid.status === 'NEGOTIATION_IN_PROGRESS') && (
                  <div className="bid-actions">
                    {respondingBid === bid._id ? (
                      <div className="negotiate-form">
                        <h4>Counter-Offer</h4>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Your Amount (₹)</label>
                            <input type="number" value={counterOffer.amount} 
                              onChange={(e) => setCounterOffer({ ...counterOffer, amount: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label>Duration (days)</label>
                            <input type="number" value={counterOffer.duration} 
                              onChange={(e) => setCounterOffer({ ...counterOffer, duration: e.target.value })} />
                          </div>
                          <div className="form-group full-span">
                            <label>Message (optional)</label>
                            <input value={counterOffer.message} 
                              onChange={(e) => setCounterOffer({ ...counterOffer, message: e.target.value })} />
                          </div>
                        </div>
                        <div className="button-group">
                          <button className="btn-primary" onClick={() => handleBidResponse(bid._id, 'negotiate')}
                            disabled={!counterOffer.amount}>Send Counter-Offer</button>
                          <button className="btn-secondary" onClick={() => setRespondingBid(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="button-group">
                        <button className="btn-success" onClick={() => handleBidResponse(bid._id, 'accept')}>
                          ✓ Accept Bid
                        </button>
                        <button className="btn-warning" onClick={() => setRespondingBid(bid._id)}>
                          ↔ Negotiate
                        </button>
                        <button className="btn-danger" onClick={() => handleBidResponse(bid._id, 'reject')}>
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Locked bid info */}
                {bid.status === 'COMMERCIAL_LOCKED' && bid.lockedTerms && (
                  <div className="locked-terms">
                    <h4>🔒 Commercial Locked</h4>
                    <p>Final Amount: ₹{bid.lockedTerms.finalAmount?.toLocaleString()}</p>
                    <p>Duration: {bid.lockedTerms.finalDuration} days</p>
                    <p>Locked At: {new Date(bid.lockedTerms.lockedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            ))}

            {(!dashboard?.bids || dashboard.bids.length === 0) && (
              <div className="empty-state">
                <p>No bids received yet.</p>
                <p className="hint">Once your cases are verified by the EPC company, you'll receive funding offers here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
