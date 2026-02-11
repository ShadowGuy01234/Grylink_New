import React, { useState, useEffect } from 'react';
import { casesApi, bidsApi } from '../api';
import toast from 'react-hot-toast';

const CasesPage = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await casesApi.getCases();
        setCases(res.data);
      } catch {
        toast.error('Failed to load cases');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const viewCase = async (id: string) => {
    try {
      const [caseRes, bidsRes] = await Promise.all([
        casesApi.getCase(id),
        bidsApi.getBidsForCase(id),
      ]);
      setSelectedCase(caseRes.data);
      setBids(bidsRes.data);
    } catch {
      toast.error('Failed to load case details');
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      READY_FOR_COMPANY_REVIEW: 'badge-purple', EPC_REJECTED: 'badge-red',
      EPC_VERIFIED: 'badge-green', BID_PLACED: 'badge-blue',
      NEGOTIATION_IN_PROGRESS: 'badge-yellow', COMMERCIAL_LOCKED: 'badge-green',
    };
    return <span className={`badge ${colors[status] || 'badge-gray'}`}>{status.replace(/_/g, ' ')}</span>;
  };

  if (loading) return <div className="page-loading">Loading cases...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header"><h1>Cases</h1></div>

      <div className="split-view">
        <div className="table-section">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Case #</th><th>Sub-Contractor</th><th>EPC</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {cases.map((c: any) => (
                  <tr key={c._id} className={selectedCase?._id === c._id ? 'row-active' : ''}>
                    <td>{c.caseNumber}</td>
                    <td>{c.subContractorId?.companyName || '—'}</td>
                    <td>{c.epcId?.companyName || '—'}</td>
                    <td>{statusBadge(c.status)}</td>
                    <td><button className="btn-sm btn-primary" onClick={() => viewCase(c._id)}>View</button></td>
                  </tr>
                ))}
                {cases.length === 0 && <tr><td colSpan={5} className="empty-state">No cases</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {selectedCase && (
          <div className="detail-panel">
            <h2>Case {selectedCase.caseNumber}</h2>
            <div className="detail-grid">
              <div><strong>Status:</strong> {statusBadge(selectedCase.status)}</div>
              <div><strong>EPC:</strong> {selectedCase.epcId?.companyName}</div>
              <div><strong>Sub-Contractor:</strong> {selectedCase.subContractorId?.companyName}</div>
              <div><strong>Bill Amount:</strong> {selectedCase.billId?.amount ? `₹${selectedCase.billId.amount.toLocaleString()}` : '—'}</div>
              {selectedCase.lockedAt && (
                <div><strong>Locked At:</strong> {new Date(selectedCase.lockedAt).toLocaleString()}</div>
              )}
            </div>

            {bids.length > 0 && (
              <>
                <h3>Bids</h3>
                {bids.map((bid: any) => (
                  <div key={bid._id} className="bid-card">
                    <div><strong>Amount:</strong> ₹{bid.bidAmount?.toLocaleString()}</div>
                    <div><strong>Duration:</strong> {bid.fundingDurationDays} days</div>
                    <div><strong>Status:</strong> {statusBadge(bid.status)}</div>
                    <div><strong>By:</strong> {bid.placedBy?.name}</div>
                    {bid.lockedTerms && (
                      <div className="locked-terms">
                        <strong>Final:</strong> ₹{bid.lockedTerms.finalAmount?.toLocaleString()} / {bid.lockedTerms.finalDuration} days
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            <h3>Status History</h3>
            <div className="timeline">
              {selectedCase.statusHistory?.map((h: any, i: number) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" />
                  <div>
                    <span className="timeline-status">{h.status}</span>
                    <span className="timeline-date">{new Date(h.changedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesPage;
