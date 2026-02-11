import React, { useState, useEffect } from 'react';
import { companyApi, casesApi, bidsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DOCUMENT_TYPES = ['CIN', 'GST', 'PAN', 'BOARD_RESOLUTION', 'BANK_STATEMENTS', 'AUDITED_FINANCIALS', 'PROJECT_DETAILS', 'CASHFLOW_DETAILS'];

const DashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [subContractors, setSubContractors] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('documents');

  // Document upload state
  const [files, setFiles] = useState<File[]>([]);
  const [docTypes, setDocTypes] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Sub-contractor state
  const [showAddSC, setShowAddSC] = useState(false);
  const [scForm, setScForm] = useState({ companyName: '', contactName: '', email: '', phone: '' });
  const [addingSC, setAddingSC] = useState(false);

  // Bid state
  const [bidModal, setBidModal] = useState<any>(null);
  const [bidForm, setBidForm] = useState({ bidAmount: '', fundingDurationDays: '' });

  // Negotiation state
  const [negotiatingBid, setNegotiatingBid] = useState<string | null>(null);
  const [counterOffer, setCounterOffer] = useState({ amount: '', duration: '', message: '' });

  const fetchData = async () => {
    try {
      const promises: Promise<any>[] = [
        companyApi.getProfile(),
        companyApi.getSubContractors(),
        casesApi.getCases(),
        bidsApi.getMyBids(),
      ];
      const [profileRes, scRes, casesRes, bidsRes] = await Promise.all(promises);
      setProfile(profileRes.data);
      setSubContractors(scRes.data);
      setCases(casesRes.data);
      setMyBids(bidsRes.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUploadDocs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return toast.error('Select files to upload');
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('documents', f));
      formData.append('documentTypes', JSON.stringify(docTypes));
      await companyApi.uploadDocuments(formData);
      toast.success('Documents uploaded!');
      setFiles([]); setDocTypes([]);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSC = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingSC(true);
    try {
      await companyApi.addSubContractors([scForm]);
      toast.success('Sub-contractor added!');
      setShowAddSC(false);
      setScForm({ companyName: '', contactName: '', email: '', phone: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add');
    } finally {
      setAddingSC(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await companyApi.bulkAddSubContractors(formData);
      toast.success(`Added ${res.data.created?.length || 0} sub-contractors`);
      if (res.data.errors?.length) toast.error(`${res.data.errors.length} rows had errors`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Bulk upload failed');
    }
  };

  const handleReviewCase = async (caseId: string, decision: string) => {
    try {
      await casesApi.reviewCase(caseId, { decision });
      toast.success(`Case ${decision === 'approve' ? 'approved' : 'rejected'}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Review failed');
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bidsApi.placeBid({
        caseId: bidModal._id,
        bidAmount: Number(bidForm.bidAmount),
        fundingDurationDays: Number(bidForm.fundingDurationDays),
      });
      toast.success('Bid placed!');
      setBidModal(null);
      setBidForm({ bidAmount: '', fundingDurationDays: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Bid failed');
    }
  };

  const handleNegotiate = async (bidId: string) => {
    try {
      await bidsApi.negotiate(bidId, {
        amount: parseFloat(counterOffer.amount),
        duration: parseInt(counterOffer.duration) || undefined,
        message: counterOffer.message,
      });
      toast.success('Counter-offer sent!');
      setNegotiatingBid(null);
      setCounterOffer({ amount: '', duration: '', message: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Negotiation failed');
    }
  };

  const handleLockBid = async (bidId: string) => {
    if (!confirm('Are you sure you want to lock this commercial agreement? This action cannot be undone.')) return;
    try {
      await bidsApi.lockBid(bidId);
      toast.success('Commercial agreement locked!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Lock failed');
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      LEAD_CREATED: 'badge-yellow', CREDENTIALS_CREATED: 'badge-blue', DOCS_SUBMITTED: 'badge-purple',
      ACTION_REQUIRED: 'badge-red', ACTIVE: 'badge-green', pending: 'badge-yellow', verified: 'badge-green',
      rejected: 'badge-red', READY_FOR_COMPANY_REVIEW: 'badge-purple', EPC_VERIFIED: 'badge-green',
      BID_PLACED: 'badge-blue', COMMERCIAL_LOCKED: 'badge-green', NEGOTIATION_IN_PROGRESS: 'badge-yellow',
      SUBMITTED: 'badge-blue', ACCEPTED: 'badge-green', REJECTED: 'badge-red',
    };
    return <span className={`badge ${colors[status] || 'badge-gray'}`}>{status.replace(/_/g, ' ')}</span>;
  };

  const isEpc = user?.role === 'epc';
  const isNbfc = user?.role === 'nbfc';
  const activeBids = myBids.filter((b: any) => ['SUBMITTED', 'NEGOTIATION_IN_PROGRESS'].includes(b.status));

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>{profile?.company?.companyName || 'Partner Dashboard'}</h1>
          <p className="subtitle">{isEpc ? 'EPC' : 'NBFC'} Portal {profile?.company?.status && statusBadge(profile?.company?.status)}</p>
        </div>
      </div>

      <div className="tabs">
        {isEpc && (
          <>
            <button className={`tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
              📄 Documents
            </button>
            <button className={`tab ${activeTab === 'subcontractors' ? 'active' : ''}`} onClick={() => setActiveTab('subcontractors')}>
              👷 Sub-Contractors
            </button>
          </>
        )}
        <button className={`tab ${activeTab === 'cases' ? 'active' : ''}`} onClick={() => setActiveTab('cases')}>
          📋 Cases & Bills
        </button>
        <button className={`tab ${activeTab === 'bids' ? 'active' : ''}`} onClick={() => setActiveTab('bids')}>
          💰 My Bids
          {activeBids.length > 0 && <span className="tab-badge">{activeBids.length}</span>}
        </button>
      </div>

      {/* Documents Tab (EPC only) */}
      {activeTab === 'documents' && isEpc && (
        <div className="section">
          <div className="section-header">
            <h2>Company Documents</h2>
          </div>

          {(profile?.company?.status === 'CREDENTIALS_CREATED' || profile?.company?.status === 'ACTION_REQUIRED') && (
            <form onSubmit={handleUploadDocs} className="upload-form">
              <p className="upload-hint">Upload the required documents: CIN, GST, PAN, Board Resolution, Bank Statements (12 months), Audited Financials (2 years), Project details, Cash-flow details</p>
              <div className="file-select">
                <input type="file" multiple onChange={(e) => {
                  const selected = Array.from(e.target.files || []);
                  setFiles(selected);
                  setDocTypes(selected.map(() => 'OTHER'));
                }} />
              </div>
              {files.length > 0 && (
                <div className="file-list">
                  {files.map((f, i) => (
                    <div key={i} className="file-item">
                      <span>{f.name}</span>
                      <select value={docTypes[i]} onChange={(e) => {
                        const updated = [...docTypes]; updated[i] = e.target.value; setDocTypes(updated);
                      }}>
                        {DOCUMENT_TYPES.map(dt => <option key={dt} value={dt}>{dt.replace(/_/g, ' ')}</option>)}
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
              <button type="submit" className="btn-primary" disabled={uploading || files.length === 0}>
                {uploading ? 'Uploading...' : 'Upload Documents'}
              </button>
            </form>
          )}

          {profile?.documents?.length > 0 && (
            <div className="doc-grid">
              {profile.documents.map((doc: any) => (
                <div key={doc._id} className="doc-card">
                  <div className="doc-type">{doc.documentType.replace(/_/g, ' ')}</div>
                  <div className="doc-name">{doc.fileName}</div>
                  <div className="doc-status">{statusBadge(doc.status)}</div>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="doc-link">View</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-Contractors Tab (EPC only) */}
      {activeTab === 'subcontractors' && isEpc && (
        <div className="section">
          <div className="section-header">
            <h2>Sub-Contractors</h2>
            {profile?.company?.status === 'ACTIVE' && (
              <div className="header-actions">
                <button className="btn-primary" onClick={() => setShowAddSC(true)}>+ Add Manually</button>
                <label className="btn-secondary upload-label">
                  📊 Bulk Upload
                  <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} hidden />
                </label>
              </div>
            )}
          </div>

          <div className="table-wrapper">
            <table>
              <thead><tr><th>Company</th><th>Contact</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead>
              <tbody>
                {subContractors.map((sc: any) => (
                  <tr key={sc._id}>
                    <td>{sc.companyName || '—'}</td>
                    <td>{sc.contactName || '—'}</td>
                    <td>{sc.email}</td>
                    <td>{sc.phone || '—'}</td>
                    <td>{statusBadge(sc.status)}</td>
                  </tr>
                ))}
                {subContractors.length === 0 && <tr><td colSpan={5} className="empty-state">No sub-contractors</td></tr>}
              </tbody>
            </table>
          </div>

          {showAddSC && (
            <div className="modal-overlay" onClick={() => setShowAddSC(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Add Sub-Contractor</h2>
                <form onSubmit={handleAddSC}>
                  <div className="form-group"><label>Company Name</label>
                    <input value={scForm.companyName} onChange={(e) => setScForm({ ...scForm, companyName: e.target.value })} /></div>
                  <div className="form-group"><label>Contact Name</label>
                    <input value={scForm.contactName} onChange={(e) => setScForm({ ...scForm, contactName: e.target.value })} /></div>
                  <div className="form-group"><label>Email *</label>
                    <input type="email" required value={scForm.email} onChange={(e) => setScForm({ ...scForm, email: e.target.value })} /></div>
                  <div className="form-group"><label>Phone</label>
                    <input value={scForm.phone} onChange={(e) => setScForm({ ...scForm, phone: e.target.value })} /></div>
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowAddSC(false)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={addingSC}>{addingSC ? 'Adding...' : 'Add'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cases Tab */}
      {activeTab === 'cases' && (
        <div className="section">
          <h2>Cases & Bills</h2>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Case #</th><th>Sub-Contractor</th><th>Bill Amount</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {cases.map((c: any) => (
                  <tr key={c._id}>
                    <td>{c.caseNumber}</td>
                    <td>{c.subContractorId?.companyName || '—'}</td>
                    <td>{c.billId?.amount ? `₹${c.billId.amount.toLocaleString()}` : '—'}</td>
                    <td>{statusBadge(c.status)}</td>
                    <td className="action-buttons">
                      {isEpc && c.status === 'READY_FOR_COMPANY_REVIEW' && (
                        <>
                          <button className="btn-sm btn-success" onClick={() => handleReviewCase(c._id, 'approve')}>Approve</button>
                          <button className="btn-sm btn-danger" onClick={() => handleReviewCase(c._id, 'reject')}>Reject</button>
                        </>
                      )}
                      {isNbfc && c.status === 'EPC_VERIFIED' && (
                        <button className="btn-sm btn-primary" onClick={() => setBidModal(c)}>Place Bid</button>
                      )}
                    </td>
                  </tr>
                ))}
                {cases.length === 0 && <tr><td colSpan={5} className="empty-state">No cases yet</td></tr>}
              </tbody>
            </table>
          </div>

          {bidModal && (
            <div className="modal-overlay" onClick={() => setBidModal(null)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Place Bid — {bidModal.caseNumber}</h2>
                <form onSubmit={handlePlaceBid}>
                  <div className="form-group"><label>Bid Amount (₹) *</label>
                    <input type="number" required min="1" value={bidForm.bidAmount}
                      onChange={(e) => setBidForm({ ...bidForm, bidAmount: e.target.value })} /></div>
                  <div className="form-group"><label>Funding Duration (days) *</label>
                    <input type="number" required min="1" value={bidForm.fundingDurationDays}
                      onChange={(e) => setBidForm({ ...bidForm, fundingDurationDays: e.target.value })} /></div>
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setBidModal(null)}>Cancel</button>
                    <button type="submit" className="btn-primary">Place Bid</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bids Tab */}
      {activeTab === 'bids' && (
        <div className="section">
          <h2>My Bids</h2>
          <p className="description">Track your placed bids and negotiate terms.</p>

          <div className="bids-list">
            {myBids.map((bid: any) => (
              <div key={bid._id} className="bid-card">
                <div className="bid-header">
                  <h3>Case #{bid.caseId?.caseNumber || 'N/A'}</h3>
                  {statusBadge(bid.status)}
                </div>
                <div className="bid-details">
                  <div className="detail">
                    <span className="label">Sub-Contractor:</span>
                    <span>{bid.caseId?.subContractorId?.companyName || '—'}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Bill Amount:</span>
                    <span>₹{bid.caseId?.billId?.amount?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Your Bid:</span>
                    <span className="highlight">₹{bid.bidAmount?.toLocaleString()}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Duration:</span>
                    <span>{bid.fundingDurationDays} days</span>
                  </div>
                </div>

                {/* Negotiation history */}
                {bid.negotiations?.length > 0 && (
                  <div className="negotiations">
                    <h4>Negotiation History</h4>
                    {bid.negotiations.map((n: any, i: number) => (
                      <div key={i} className={`negotiation-item ${n.proposedByRole}`}>
                        <span className="role">{n.proposedByRole === 'epc' ? 'You' : 'Sub-Contractor'}</span>
                        <span>₹{n.counterAmount?.toLocaleString()} for {n.counterDuration} days</span>
                        {n.message && <p className="message">"{n.message}"</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {['SUBMITTED', 'NEGOTIATION_IN_PROGRESS'].includes(bid.status) && (
                  <div className="bid-actions">
                    {negotiatingBid === bid._id ? (
                      <div className="negotiate-form">
                        <h4>Send Counter-Offer</h4>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Amount (₹)</label>
                            <input type="number" value={counterOffer.amount}
                              onChange={(e) => setCounterOffer({ ...counterOffer, amount: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label>Duration (days)</label>
                            <input type="number" value={counterOffer.duration}
                              onChange={(e) => setCounterOffer({ ...counterOffer, duration: e.target.value })} />
                          </div>
                          <div className="form-group full-span">
                            <label>Message</label>
                            <input value={counterOffer.message}
                              onChange={(e) => setCounterOffer({ ...counterOffer, message: e.target.value })} />
                          </div>
                        </div>
                        <div className="button-group">
                          <button className="btn-primary" onClick={() => handleNegotiate(bid._id)}
                            disabled={!counterOffer.amount}>Send Counter-Offer</button>
                          <button className="btn-secondary" onClick={() => setNegotiatingBid(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="button-group">
                        <button className="btn-warning" onClick={() => setNegotiatingBid(bid._id)}>
                          ↔ Counter-Offer
                        </button>
                        <button className="btn-success" onClick={() => handleLockBid(bid._id)}>
                          🔒 Lock Agreement
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Locked info */}
                {bid.status === 'COMMERCIAL_LOCKED' && bid.lockedTerms && (
                  <div className="locked-terms">
                    <h4>🔒 Commercial Locked</h4>
                    <p>Final Amount: ₹{bid.lockedTerms.finalAmount?.toLocaleString()}</p>
                    <p>Duration: {bid.lockedTerms.finalDuration} days</p>
                    <p>Locked: {new Date(bid.lockedTerms.lockedAt).toLocaleDateString()}</p>
                  </div>
                )}

                {bid.status === 'REJECTED' && (
                  <div className="rejected-info">
                    <p>❌ This bid was rejected by the sub-contractor.</p>
                  </div>
                )}
              </div>
            ))}

            {myBids.length === 0 && (
              <div className="empty-state">
                <p>No bids placed yet.</p>
                <p className="hint">Go to Cases & Bills to place bids on verified cases.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
