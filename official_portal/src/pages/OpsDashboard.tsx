import { useState, useEffect } from 'react';
import { opsApi, casesApi } from '../api';
import toast from 'react-hot-toast';

const OpsDashboard = () => {
  const [pending, setPending] = useState<any>({ pendingCompanies: [], pendingBills: [], pendingKyc: [] });
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('companies');
  const [verifyModal, setVerifyModal] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [kycMessage, setKycMessage] = useState('');

  const fetchData = async () => {
    try {
      const [pendingRes, casesRes] = await Promise.all([
        opsApi.getPending(),
        casesApi.getCases(),
      ]);
      setPending(pendingRes.data);
      setCases(casesRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => { fetchData(); }, []);

  const handleVerifyBill = async (id: string, decision: string) => {
    try {
      await opsApi.verifyBill(id, { decision, notes });
      toast.success(`Bill ${decision === 'approve' ? 'approved' : 'rejected'}`);
      setVerifyModal(null);
      setNotes('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to verify');
    }
  };

  const handleKycRequest = async (id: string) => {
    try {
      await opsApi.requestKyc(id, kycMessage);
      toast.success('KYC document request sent');
      setKycMessage('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send request');
    }
  };

  const handleCompleteKyc = async (id: string) => {
    try {
      await opsApi.completeKyc(id);
      toast.success('KYC completed — Case created');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to complete KYC');
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DOCS_SUBMITTED: 'badge-purple', UPLOADED: 'badge-yellow', SUBMITTED: 'badge-blue',
      ACTION_REQUIRED: 'badge-red', VERIFIED: 'badge-green', REJECTED: 'badge-red',
      KYC_COMPLETED: 'badge-green', READY_FOR_COMPANY_REVIEW: 'badge-purple',
      EPC_VERIFIED: 'badge-green', BID_PLACED: 'badge-blue', COMMERCIAL_LOCKED: 'badge-green',
    };
    return <span className={`badge ${colors[status] || 'badge-gray'}`}>{status.replace(/_/g, ' ')}</span>;
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Ops Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-warning">
          <h3>{pending.pendingCompanies.length}</h3>
          <p>Pending Companies</p>
        </div>
        <div className="stat-card stat-info">
          <h3>{pending.pendingBills.length}</h3>
          <p>Pending Bills</p>
        </div>
        <div className="stat-card stat-danger">
          <h3>{pending.pendingKyc.length}</h3>
          <p>Pending KYC</p>
        </div>
        <div className="stat-card">
          <h3>{cases.length}</h3>
          <p>Total Cases</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['companies', 'bills', 'kyc', 'cases', 'nbfc'].map((tab) => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <div className="table-section">
          <h2>Pending Company Verifications</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Company</th><th>Owner</th><th>Email</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pending.pendingCompanies.map((c: any) => (
                  <tr key={c._id}>
                    <td>{c.companyName}</td>
                    <td>{c.ownerName}</td>
                    <td>{c.email}</td>
                    <td>{statusBadge(c.status)}</td>
                    <td>
                      <button className="btn-sm btn-success" onClick={() => setVerifyModal({ type: 'company', id: c._id, name: c.companyName })}>Review</button>
                    </td>
                  </tr>
                ))}
                {pending.pendingCompanies.length === 0 && (
                  <tr><td colSpan={5} className="empty-state">No pending company verifications</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bills Tab */}
      {activeTab === 'bills' && (
        <div className="table-section">
          <h2>Pending Bill Verifications</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Bill #</th><th>Sub-Contractor</th><th>EPC</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pending.pendingBills.map((b: any) => (
                  <tr key={b._id}>
                    <td>{b.billNumber || '—'}</td>
                    <td>{b.subContractorId?.companyName || '—'}</td>
                    <td>{b.linkedEpcId?.companyName || '—'}</td>
                    <td>{b.amount ? `₹${b.amount.toLocaleString()}` : '—'}</td>
                    <td>{statusBadge(b.status)}</td>
                    <td>
                      <button className="btn-sm btn-success" onClick={() => setVerifyModal({ type: 'bill', id: b._id, name: b.billNumber })}>Review</button>
                    </td>
                  </tr>
                ))}
                {pending.pendingBills.length === 0 && (
                  <tr><td colSpan={6} className="empty-state">No pending bill verifications</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KYC Tab */}
      {activeTab === 'kyc' && (
        <div className="table-section">
          <h2>Pending KYC</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Sub-Contractor</th><th>User</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pending.pendingKyc.map((k: any) => (
                  <tr key={k._id}>
                    <td>{k.subContractorId?.companyName || '—'}</td>
                    <td>{k.userId?.name || '—'}</td>
                    <td>{statusBadge(k.status)}</td>
                    <td className="action-buttons">
                      {k.status !== 'KYC_COMPLETED' && (
                        <>
                          <div className="inline-form">
                            <input placeholder="Request message..." value={kycMessage}
                              onChange={(e) => setKycMessage(e.target.value)} />
                            <button className="btn-sm btn-warning" onClick={() => handleKycRequest(k._id)}>Request Docs</button>
                          </div>
                          <button className="btn-sm btn-success" onClick={() => handleCompleteKyc(k._id)}>Complete KYC</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {pending.pendingKyc.length === 0 && (
                  <tr><td colSpan={4} className="empty-state">No pending KYC</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cases Tab */}
      {activeTab === 'cases' && (
        <div className="table-section">
          <h2>All Cases</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Case #</th><th>Sub-Contractor</th><th>EPC</th><th>Bill Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {cases.map((c: any) => (
                  <tr key={c._id}>
                    <td>{c.caseNumber}</td>
                    <td>{c.subContractorId?.companyName || '—'}</td>
                    <td>{c.epcId?.companyName || '—'}</td>
                    <td>{c.billId?.amount ? `₹${c.billId.amount.toLocaleString()}` : '—'}</td>
                    <td>{statusBadge(c.status)}</td>
                  </tr>
                ))}
                {cases.length === 0 && (
                  <tr><td colSpan={5} className="empty-state">No cases yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NBFC Tab */}
      {activeTab === 'nbfc' && (
        <div className="section" style={{ padding: '20px' }}>
          <h2>Invite NBFC</h2>
          <div className="card" style={{ maxWidth: '600px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const data = Object.fromEntries(formData.entries());
              
              try {
                await opsApi.inviteNbfc(data);
                toast.success('NBFC invited successfully!');
                form.reset();
              } catch (err: any) {
                toast.error(err.response?.data?.error || 'Failed to invite NBFC');
              }
            }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Company Name *</label>
                <input name="companyName" required placeholder="NBFC Name" className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Owner Name *</label>
                <input name="ownerName" required placeholder="Contact Person" className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Email *</label>
                <input name="email" type="email" required placeholder="nbfc@example.com" className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Phone *</label>
                <input name="phone" required placeholder="+91..." className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Address *</label>
                <input name="address" required placeholder="Office Address" className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Send Invitation</button>
            </form>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {verifyModal && (
        <div className="modal-overlay" onClick={() => setVerifyModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <h2>Review: {verifyModal.name}</h2>
            
            {verifyModal.type === 'company' && (
              <CompanyReview 
                companyId={verifyModal.id} 
                onClose={() => { setVerifyModal(null); fetchData(); }} 
              />
            )}

            {verifyModal.type === 'bill' && (
              <>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add verification notes..." />
                </div>
                <div className="modal-actions">
                  <button className="btn-danger" onClick={() => handleVerifyBill(verifyModal.id, 'reject')}>Reject</button>
                  <button className="btn-success" onClick={() => handleVerifyBill(verifyModal.id, 'approve')}>Approve</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CompanyReview = ({ companyId, onClose }: { companyId: string, onClose: () => void }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const res = await opsApi.getCompanyDocuments(companyId);
        setDocuments(res.data);
      } catch (err) {
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    loadDocs();
  }, [companyId]);

  const handleVerifyDoc = async (docId: string, decision: string) => {
    try {
      await opsApi.verifyDocument(docId, { decision });
      toast.success(`Document ${decision === 'approve' ? 'verified' : 'rejected'}`);
      setDocuments(docs => docs.map(d => d._id === docId ? { ...d, status: decision === 'approve' ? 'verified' : 'rejected' } : d));
    } catch (err) {
      toast.error('Failed to update document status');
    }
  };

  const handleVerifyCompany = async (decision: string) => {
    try {
      await opsApi.verifyCompany(companyId, { decision });
      toast.success(`Company ${decision === 'approve' ? 'approved' : 'rejected'}`);
      onClose();
    } catch (err) {
      toast.error('Failed to update company status');
    }
  };

  if (loading) return <div>Loading documents...</div>;

  return (
    <div className="company-review">
      <div className="docs-list">
        <h3>Submitted Documents</h3>
        {documents.map(doc => (
          <div key={doc._id} className="doc-item" style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '10px', borderBottom: '1px solid #eee' 
          }}>
            <div>
              <strong>{doc.documentType}</strong>
              <div style={{ fontSize: '0.8em', color: '#666' }}>{doc.fileName}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className={`badge badge-${doc.status === 'verified' ? 'green' : doc.status === 'rejected' ? 'red' : 'yellow'}`}>
                {doc.status}
              </span>
              <button className="btn-sm btn-secondary" onClick={() => setPreviewDoc(doc)}>Preview</button>
              {doc.status === 'pending' && (
                <>
                  <button className="btn-sm btn-success" onClick={() => handleVerifyDoc(doc._id, 'approve')}>✓</button>
                  <button className="btn-sm btn-danger" onClick={() => handleVerifyDoc(doc._id, 'reject')}>✗</button>
                </>
              )}
            </div>
          </div>
        ))}
        {documents.length === 0 && <p>No documents found.</p>}
      </div>

      {previewDoc && (
        <div className="doc-preview" style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px' }}>
          <h4>Preview: {previewDoc.documentType} <button style={{float:'right'}} onClick={() => setPreviewDoc(null)}>Close</button></h4>
          <iframe 
            src={previewDoc.fileUrl} 
            title="Document Preview"
            style={{ width: '100%', height: '500px', border: 'none' }} 
          />
        </div>
      )}

      <div className="company-actions" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
        <h4>Final Decision</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-danger" onClick={() => handleVerifyCompany('reject')}>Reject Company</button>
          <button className="btn-success" onClick={() => handleVerifyCompany('approve')}>Approve Company</button>
        </div>
      </div>
    </div>
  );
};

export default OpsDashboard;
