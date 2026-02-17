import { useState, useEffect, useCallback } from "react";
import { opsApi } from "../../api";
import toast from "react-hot-toast";
import {
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlineChatAlt2,
  HiOutlinePaperAirplane,
} from "react-icons/hi";
// Import shared verification components
import {
  DocumentList,
  DocumentViewer,
  VerificationModal,
  SearchFilter,
  StatusBadge,
} from "../../components/verification";
import type { BaseDocument, VerificationDecision } from "../../components/verification";

interface Bill {
  _id: string;
  billNumber: string;
  type: 'invoice' | 'wcc';
  amount: number;
  status: string;
  company: {
    _id: string;
    companyName: string;
  };
  case?: {
    _id: string;
    caseId: string;
  };
  seller?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  submittedAt: string;
  documents?: BillDocument[];
  notes?: string;
  slaDeadline?: string;
}

interface BillDocument {
  _id: string;
  type: string;
  fileName: string;
  fileUrl: string;
}

interface VerificationNote {
  _id: string;
  user: { name: string };
  text: string;
  createdAt: string;
}

// Bill Status options for filtering
const BILL_STATUS_OPTIONS = [
  { value: 'PENDING_VERIFICATION', label: 'Pending' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
];

// Bill Type options for filtering
const BILL_TYPE_OPTIONS = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'wcc', label: 'WCC' },
];

const BillVerificationPage = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING_VERIFICATION");
  
  // Using shared VerificationModal component
  const [verifyModal, setVerifyModal] = useState<{ show: boolean; defaultDecision?: 'approve' | 'reject' }>({
    show: false,
  });
  
  // Document viewer using shared DocumentViewer component
  const [viewingDoc, setViewingDoc] = useState<BaseDocument | null>(null);
  
  // Notes state
  const [notes, setNotes] = useState<VerificationNote[]>([]);
  const [newNote, setNewNote] = useState("");
  
  // Processing state
  const [processingAction, setProcessingAction] = useState(false);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await opsApi.getPendingBills();
      let filtered = res.data.bills || [];
      
      if (statusFilter) {
        filtered = filtered.filter((b: Bill) => b.status === statusFilter);
      }
      if (typeFilter) {
        filtered = filtered.filter((b: Bill) => b.type === typeFilter);
      }
      
      setBills(filtered);
    } catch {
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  const fetchBillDetails = useCallback(async (billId: string) => {
    try {
      const res = await opsApi.getBillDetails(billId);
      setSelectedBill(res.data.bill);
      setNotes(res.data.verificationNotes || []);
    } catch {
      toast.error("Failed to load bill details");
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleVerify = async (decision: VerificationDecision) => {
    if (!selectedBill) return;
    
    setProcessingAction(true);
    try {
      await opsApi.verifyBill(selectedBill._id, {
        decision: decision.decision,
        notes: decision.notes,
      });
      toast.success(decision.decision === "approve" ? "Bill approved!" : "Bill rejected");
      setVerifyModal({ show: false });
      setSelectedBill(null);
      fetchBills();
    } catch {
      toast.error("Failed to verify bill");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedBill || !newNote.trim()) return;
    
    try {
      await opsApi.addBillNote(selectedBill._id, { text: newNote });
      toast.success("Note added");
      setNewNote("");
      fetchBillDetails(selectedBill._id);
    } catch {
      toast.error("Failed to add note");
    }
  };

  const filteredBills = bills.filter(b => 
    b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.company.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transform bill documents for DocumentList component
  const prepareBillDocuments = (): BaseDocument[] => {
    if (!selectedBill?.documents) return [];
    
    return selectedBill.documents.map(doc => ({
      _id: doc._id,
      type: doc.type,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      status: 'pending' as const, // Bills don't have individual doc status
    }));
  };

  // Handle document view
  const handleViewDocument = (doc: BaseDocument) => {
    setViewingDoc(doc);
  };

  const getSlaStatus = (deadline: string | undefined) => {
    if (!deadline) return null;
    const now = new Date();
    const sla = new Date(deadline);
    const diff = sla.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 0) return { status: 'breached', label: 'SLA Breached', color: '#ef4444' };
    if (hours < 4) return { status: 'critical', label: `${hours}h remaining`, color: '#ef4444' };
    if (hours < 8) return { status: 'warning', label: `${hours}h remaining`, color: '#f59e0b' };
    return { status: 'ok', label: `${hours}h remaining`, color: '#10b981' };
  };

  return (
    <div className="bill-verification-page">
      <div className="page-header">
        <div className="header-content">
          <h1><HiOutlineDocumentText /> Bill & WCC Verification</h1>
          <p>Review and verify invoices and work completion certificates</p>
        </div>
        <button className="btn-refresh" onClick={fetchBills}>
          <HiOutlineRefresh /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon pending">
            <HiOutlineClock />
          </div>
          <div className="stat-info">
            <span className="stat-value">{bills.filter(b => b.status === 'PENDING_VERIFICATION').length}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon invoice">
            <HiOutlineDocumentText />
          </div>
          <div className="stat-info">
            <span className="stat-value">{bills.filter(b => b.type === 'invoice').length}</span>
            <span className="stat-label">Invoices</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon wcc">
            <HiOutlineCheckCircle />
          </div>
          <div className="stat-info">
            <span className="stat-value">{bills.filter(b => b.type === 'wcc').length}</span>
            <span className="stat-label">WCCs</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon urgent">
            <HiOutlineClock />
          </div>
          <div className="stat-info">
            <span className="stat-value">{bills.filter(b => getSlaStatus(b.slaDeadline)?.status === 'breached').length}</span>
            <span className="stat-label">SLA Breached</span>
          </div>
        </div>
      </div>

      <div className="page-layout">
        {/* Bill List Panel */}
        <div className="list-panel">
          <div className="panel-header">
            <h2>Bills & WCCs</h2>
            <span className="count">{filteredBills.length}</span>
          </div>

          <div className="filters">
            <SearchFilter
              searchTerm={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              statusOptions={BILL_STATUS_OPTIONS}
              placeholder="Search bills..."
            />
            <div className="type-filter">
              {BILL_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`type-btn ${typeFilter === opt.value ? 'active' : ''}`}
                  onClick={() => setTypeFilter(typeFilter === opt.value ? '' : opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bill-list">
            {loading ? (
              <div className="loading-state">Loading bills...</div>
            ) : filteredBills.length === 0 ? (
              <div className="empty-state">
                <HiOutlineDocumentText />
                <p>No bills pending verification</p>
              </div>
            ) : (
              filteredBills.map(bill => {
                const sla = getSlaStatus(bill.slaDeadline);
                return (
                  <div
                    key={bill._id}
                    className={`bill-card ${selectedBill?._id === bill._id ? 'selected' : ''}`}
                    onClick={() => fetchBillDetails(bill._id)}
                  >
                    <div className="bill-header">
                      <span className={`type-badge ${bill.type}`}>
                        {bill.type.toUpperCase()}
                      </span>
                      <span className="bill-number">{bill.billNumber}</span>
                    </div>
                    <div className="bill-info">
                      <div className="company-name">
                        <HiOutlineOfficeBuilding />
                        {bill.company.companyName}
                      </div>
                      <div className="amount">
                        <HiOutlineCurrencyRupee />
                        ₹{bill.amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="bill-meta">
                      <StatusBadge status={bill.status} size="sm" />
                      {sla && (
                        <span className="sla-badge" style={{ color: sla.color }}>
                          <HiOutlineClock />
                          {sla.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bill Details Panel */}
        <div className="detail-panel">
          {!selectedBill ? (
            <div className="no-selection">
              <HiOutlineDocumentText />
              <p>Select a bill to review</p>
            </div>
          ) : (
            <div className="bill-details">
              <div className="detail-header">
                <div className="bill-title">
                  <span className={`type-badge large ${selectedBill.type}`}>
                    {selectedBill.type.toUpperCase()}
                  </span>
                  <h2>{selectedBill.billNumber}</h2>
                </div>
                <StatusBadge status={selectedBill.status} size="lg" />
              </div>

              <div className="detail-grid">
                <div className="detail-card">
                  <HiOutlineOfficeBuilding className="icon" />
                  <div>
                    <label>Company</label>
                    <span>{selectedBill.company.companyName}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <HiOutlineCurrencyRupee className="icon" />
                  <div>
                    <label>Amount</label>
                    <span className="amount">₹{selectedBill.amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <HiOutlineUser className="icon" />
                  <div>
                    <label>Seller</label>
                    <span>{selectedBill.seller?.name || '—'}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <HiOutlineCalendar className="icon" />
                  <div>
                    <label>Submitted</label>
                    <span>{new Date(selectedBill.submittedAt || selectedBill.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* SLA Indicator */}
              {selectedBill.slaDeadline && (
                <div className={`sla-banner ${getSlaStatus(selectedBill.slaDeadline)?.status}`}>
                  <HiOutlineClock />
                  <span>SLA: {getSlaStatus(selectedBill.slaDeadline)?.label}</span>
                  <span className="sla-deadline">
                    Due: {new Date(selectedBill.slaDeadline).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Documents Section - Using DocumentList Component */}
              <div className="documents-section">
                <h3>Attached Documents</h3>
                <DocumentList
                  documents={prepareBillDocuments()}
                  onView={handleViewDocument}
                  layout="grid"
                  emptyMessage="No documents attached"
                />
              </div>

              {/* Notes Section */}
              <div className="notes-section">
                <h3><HiOutlineChatAlt2 /> Verification Notes</h3>
                <div className="notes-list">
                  {notes.length === 0 ? (
                    <div className="no-notes">No notes yet</div>
                  ) : (
                    notes.map(note => (
                      <div key={note._id} className="note-item">
                        <div className="note-header">
                          <span className="note-user">{note.user.name}</span>
                          <span className="note-time">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p>{note.text}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="add-note">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a verification note..."
                    rows={2}
                  />
                  <button 
                    className="btn-add-note"
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                  >
                    <HiOutlinePaperAirplane /> Add Note
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedBill.status === 'PENDING_VERIFICATION' && (
                <div className="action-bar">
                  <button 
                    className="btn-approve"
                    onClick={() => setVerifyModal({ show: true, defaultDecision: 'approve' })}
                  >
                    <HiOutlineCheckCircle /> Approve Bill
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => setVerifyModal({ show: true, defaultDecision: 'reject' })}
                  >
                    <HiOutlineXCircle /> Reject Bill
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer - Using DocumentViewer Component */}
      <DocumentViewer
        document={viewingDoc}
        onClose={() => setViewingDoc(null)}
        showActions={false}
      />

      {/* Verification Modal - Using VerificationModal Component */}
      <VerificationModal
        isOpen={verifyModal.show}
        onClose={() => setVerifyModal({ show: false })}
        onConfirm={handleVerify}
        title="Verify Bill"
        entityName={selectedBill ? `${selectedBill.billNumber} - ₹${selectedBill.amount.toLocaleString()}` : undefined}
        defaultDecision={verifyModal.defaultDecision}
        isLoading={processingAction}
      />

      <style>{`
        .bill-verification-page {
          padding: 24px;
          min-height: 100vh;
          background: var(--bg-secondary, #f8fafc);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .page-header h1 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary, #1e293b);
        }

        .page-header p {
          margin-top: 4px;
          color: var(--text-muted, #64748b);
          font-size: 14px;
        }

        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .stat-icon.pending {
          background: #fef3c7;
          color: #f59e0b;
        }

        .stat-icon.invoice {
          background: #dbeafe;
          color: #2563eb;
        }

        .stat-icon.wcc {
          background: #d1fae5;
          color: #10b981;
        }

        .stat-icon.urgent {
          background: #fee2e2;
          color: #ef4444;
        }

        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
        }

        .stat-label {
          font-size: 13px;
          color: var(--text-muted);
        }

        .page-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 24px;
          height: calc(100vh - 280px);
        }

        .list-panel {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .panel-header h2 {
          font-size: 16px;
          font-weight: 600;
        }

        .count {
          background: var(--primary, #2563eb);
          color: white;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .filters {
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-bottom: 1px solid var(--border);
        }

        .type-filter {
          display: flex;
          gap: 8px;
        }

        .type-btn {
          padding: 6px 14px;
          border: 1px solid var(--border);
          border-radius: 20px;
          background: white;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s;
        }

        .type-btn:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .type-btn.active {
          border-color: #2563eb;
          background: #2563eb;
          color: white;
        }

        .bill-list {
          gap: 8px;
        }

        .filter-row select {
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          background: white;
        }

        .bill-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .bill-card {
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 10px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .bill-card:hover {
          border-color: var(--primary);
          background: #f8faff;
        }

        .bill-card.selected {
          border-color: var(--primary);
          background: #eff6ff;
        }

        .bill-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .type-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
        }

        .type-badge.invoice {
          background: #dbeafe;
          color: #2563eb;
        }

        .type-badge.wcc {
          background: #d1fae5;
          color: #059669;
        }

        .type-badge.large {
          padding: 4px 12px;
          font-size: 12px;
        }

        .bill-number {
          font-weight: 600;
          font-size: 14px;
        }

        .bill-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 12px;
        }

        .company-name, .amount {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .amount {
          font-weight: 600;
          color: var(--text-primary);
        }

        .bill-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.pending-verification {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.verified {
          background: #d1fae5;
          color: #059669;
        }

        .status-badge.rejected {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-badge.large {
          padding: 6px 14px;
          font-size: 12px;
        }

        .sla-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .detail-panel {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .no-selection {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          gap: 16px;
        }

        .no-selection svg {
          font-size: 64px;
          opacity: 0.3;
        }

        .bill-details {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }

        .bill-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bill-title h2 {
          font-size: 20px;
          font-weight: 700;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 20px;
          background: var(--bg-secondary);
        }

        .detail-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 10px;
        }

        .detail-card .icon {
          font-size: 24px;
          color: var(--primary);
        }

        .detail-card label {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .detail-card span {
          font-size: 14px;
          font-weight: 500;
        }

        .detail-card .amount {
          font-size: 18px;
          font-weight: 700;
          color: #10b981;
        }

        .sla-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--bg-secondary);
          font-weight: 600;
          font-size: 14px;
        }

        .sla-banner.breached, .sla-banner.critical {
          background: #fee2e2;
          color: #dc2626;
        }

        .sla-banner.warning {
          background: #fef3c7;
          color: #92400e;
        }

        .sla-banner.ok {
          background: #d1fae5;
          color: #059669;
        }

        .sla-deadline {
          margin-left: auto;
          font-weight: 400;
          opacity: 0.8;
        }

        .documents-section, .notes-section {
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }

        .documents-section h3, .notes-section h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .doc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .doc-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .doc-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .doc-icon {
          font-size: 24px;
          color: var(--primary);
        }

        .doc-name {
          display: block;
          font-weight: 500;
          font-size: 13px;
        }

        .doc-type {
          font-size: 11px;
          color: var(--text-muted);
        }

        .doc-actions {
          display: flex;
          gap: 6px;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          border: 1px solid var(--border);
          background: white;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: var(--text-muted);
          text-decoration: none;
        }

        .btn-icon:hover {
          background: var(--bg-secondary);
          color: var(--primary);
        }

        .no-docs, .no-notes {
          padding: 24px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
        }

        .notes-list {
          max-height: 150px;
          overflow-y: auto;
          margin-bottom: 12px;
        }

        .note-item {
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .note-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .note-user {
          font-weight: 600;
          font-size: 13px;
        }

        .note-time {
          font-size: 11px;
          color: var(--text-muted);
        }

        .note-item p {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .add-note {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .add-note textarea {
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          resize: none;
        }

        .btn-add-note {
          align-self: flex-end;
          padding: 8px 16px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-add-note:disabled {
          background: var(--text-muted);
          cursor: not-allowed;
        }

        .action-bar {
          display: flex;
          gap: 12px;
          padding: 20px;
          background: var(--bg-secondary);
          margin-top: auto;
        }

        .btn-approve, .btn-reject, .btn-primary, .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
        }

        .btn-approve {
          background: #10b981;
          color: white;
        }

        .btn-reject {
          background: #ef4444;
          color: white;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-secondary {
          background: white;
          border: 1px solid var(--border);
          color: var(--text-primary);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          overflow: hidden;
        }

        .doc-viewer-modal {
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .modal-header h3 {
          font-size: 16px;
          font-weight: 600;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: var(--bg-secondary);
          border-radius: 6px;
          cursor: pointer;
          font-size: 20px;
        }

        .modal-body {
          padding: 20px;
        }

        .bill-summary {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .bill-ref {
          font-weight: 600;
        }

        .bill-amount {
          margin-left: auto;
          font-weight: 700;
          font-size: 18px;
          color: #10b981;
        }

        .modal-body p {
          margin-bottom: 12px;
          color: var(--text-secondary);
        }

        .modal-body textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          resize: vertical;
        }

        .doc-viewer-modal .modal-body {
          flex: 1;
          padding: 0;
          overflow: hidden;
        }

        .doc-viewer-modal iframe {
          width: 100%;
          height: 500px;
          border: none;
        }

        .doc-viewer-modal img {
          max-width: 100%;
          max-height: 500px;
          display: block;
          margin: 0 auto;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          color: var(--text-muted);
          gap: 12px;
        }

        .empty-state svg {
          font-size: 48px;
          opacity: 0.3;
        }

        @media (max-width: 1200px) {
          .page-layout {
            grid-template-columns: 1fr;
          }

          .list-panel {
            max-height: 300px;
          }

          .detail-grid, .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .doc-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .bill-verification-page {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .page-header h1 {
            font-size: 20px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 16px;
          }

          .stat-card {
            padding: 14px;
          }

          .stat-value {
            font-size: 20px;
          }

          .list-panel {
            max-height: 280px;
          }

          .bill-card {
            padding: 12px;
          }

          .bill-number {
            font-size: 14px;
          }

          .detail-panel {
            border-radius: 8px;
          }

          .detail-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .info-group label {
            font-size: 11px;
          }

          .doc-card {
            padding: 12px;
          }

          .modal-content {
            width: 95vw;
            max-height: 90vh;
          }

          .doc-viewer-modal iframe,
          .doc-viewer-modal img {
            max-height: 350px;
          }

          .modal-footer {
            flex-direction: column;
          }

          .modal-footer .btn {
            width: 100%;
          }

          .notes-section textarea {
            min-height: 80px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-buttons .btn {
            width: 100%;
          }

          .sla-banner {
            padding: 8px 12px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .bill-verification-page {
            padding: 12px;
          }

          .page-header h1 {
            font-size: 18px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters {
            padding: 8px 12px;
          }

          .bill-list {
            padding: 8px;
          }

          .bill-card {
            padding: 10px;
            margin-bottom: 6px;
          }

          .panel-header {
            padding: 12px 16px;
          }

          .bill-summary {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .bill-amount {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default BillVerificationPage;
