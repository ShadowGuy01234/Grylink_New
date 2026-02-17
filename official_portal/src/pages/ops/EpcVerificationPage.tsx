import { useState, useEffect, useCallback } from "react";
import { opsApi } from "../../api";
import toast from "react-hot-toast";
import {
  HiOutlineOfficeBuilding,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineChevronLeft,
  HiOutlineExclamation,
} from "react-icons/hi";
// Import shared verification components
import {
  EntityCard,
  DocumentList,
  DocumentViewer,
  VerificationModal,
  SearchFilter,
} from "../../components/verification";
import type { BaseDocument, VerificationDecision } from "../../components/verification";

interface Company {
  _id: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  createdAt: string;
  documents?: Document[];
}

interface Document {
  _id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
}

const DOCUMENT_TYPES: Record<string, { key: string; label: string; required: boolean }> = {
  CIN: { key: 'CIN', label: 'Certificate of Incorporation', required: true },
  GST: { key: 'GST', label: 'GST Certificate', required: true },
  PAN: { key: 'PAN', label: 'PAN Card', required: true },
  ADDRESS_PROOF: { key: 'ADDRESS_PROOF', label: 'Address Proof', required: true },
  BANK_STATEMENT: { key: 'BANK_STATEMENT', label: 'Bank Statement', required: false },
  AUDITED_FINANCIALS: { key: 'AUDITED_FINANCIALS', label: 'Audited Financials', required: false },
};

// EPC Status options for filtering
const EPC_STATUS_OPTIONS = [
  { value: 'DOCS_SUBMITTED', label: 'Docs Submitted' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
];

const EpcVerificationPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("DOCS_SUBMITTED");
  
  // Using shared VerificationModal component
  const [companyVerifyModal, setCompanyVerifyModal] = useState<{ show: boolean; defaultDecision?: 'approve' | 'reject' }>({
    show: false,
  });
  const [docVerifyModal, setDocVerifyModal] = useState<{ show: boolean; doc: Document | null; defaultDecision?: 'approve' | 'reject' }>({
    show: false,
    doc: null,
  });
  
  // Document viewer using shared DocumentViewer component
  const [viewingDoc, setViewingDoc] = useState<BaseDocument | null>(null);
  
  // Processing state
  const [processingAction, setProcessingAction] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await opsApi.getPending();
      const filtered = statusFilter 
        ? res.data.pendingCompanies.filter((c: Company) => c.status === statusFilter)
        : res.data.pendingCompanies;
      setCompanies(filtered);
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchDocuments = useCallback(async (companyId: string) => {
    try {
      const res = await opsApi.getCompanyDocuments(companyId);
      setDocuments(res.data);
    } catch {
      toast.error("Failed to load documents");
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (selectedCompany) {
      fetchDocuments(selectedCompany._id);
    }
  }, [selectedCompany, fetchDocuments]);

  const handleVerifyCompany = async (decision: VerificationDecision) => {
    if (!selectedCompany) return;
    
    setProcessingAction(true);
    try {
      await opsApi.verifyCompany(selectedCompany._id, {
        decision: decision.decision,
        notes: decision.notes,
      });
      toast.success(decision.decision === "approve" ? "Company approved!" : "Company rejected");
      setCompanyVerifyModal({ show: false });
      setSelectedCompany(null);
      fetchCompanies();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to verify company";
      toast.error(errMsg);
      console.error("Verify company error:", error);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleVerifyDocument = async (decision: VerificationDecision) => {
    if (!docVerifyModal.doc) return;
    
    setProcessingAction(true);
    try {
      await opsApi.verifyDocument(docVerifyModal.doc._id, {
        decision: decision.decision,
        notes: decision.notes,
      });
      toast.success("Document verified");
      setDocVerifyModal({ show: false, doc: null });
      if (selectedCompany) {
        fetchDocuments(selectedCompany._id);
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to verify document";
      toast.error(errMsg);
      console.error("Verify document error:", error);
    } finally {
      setProcessingAction(false);
    }
  };

  // Helper to prepare documents for DocumentList component
  const prepareDocuments = (): BaseDocument[] => {
    return Object.values(DOCUMENT_TYPES).map(docType => {
      const doc = documents.find(d => d.type === docType.key);
      if (doc) {
        return {
          _id: doc._id,
          type: docType.key,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          status: doc.status as 'pending' | 'verified' | 'rejected',
          uploadedAt: doc.uploadedAt,
        };
      }
      return {
        _id: `missing-${docType.key}`,
        type: docType.key,
        fileName: docType.label,
        fileUrl: '',
        status: 'missing' as const,
      };
    });
  };

  // Document viewer handlers
  const handleViewDocument = (doc: BaseDocument) => {
    setViewingDoc(doc);
  };

  const handleDocumentApprove = (doc: BaseDocument) => {
    const originalDoc = documents.find(d => d._id === doc._id);
    if (originalDoc) {
      setDocVerifyModal({ show: true, doc: originalDoc, defaultDecision: 'approve' });
      setViewingDoc(null);
    }
  };

  const handleDocumentReject = (doc: BaseDocument) => {
    const originalDoc = documents.find(d => d._id === doc._id);
    if (originalDoc) {
      setDocVerifyModal({ show: true, doc: originalDoc, defaultDecision: 'reject' });
      setViewingDoc(null);
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDocStatus = (type: string) => {
    const doc = documents.find(d => d.type === type);
    if (!doc) return { status: 'missing', label: 'Not Uploaded', color: '#94a3b8' };
    if (doc.status === 'verified') return { status: 'verified', label: 'Verified', color: '#10b981' };
    if (doc.status === 'rejected') return { status: 'rejected', label: 'Rejected', color: '#ef4444' };
    return { status: 'pending', label: 'Pending Review', color: '#f59e0b' };
  };

  const allRequiredDocsVerified = Object.values(DOCUMENT_TYPES)
    .filter(dt => dt.required)
    .every(dt => getDocStatus(dt.key).status === 'verified');

  const getMissingDocs = () => {
    return Object.values(DOCUMENT_TYPES)
      .filter(dt => dt.required && getDocStatus(dt.key).status === 'missing')
      .map(dt => dt.label);
  };

  return (
    <div className="epc-verification-page">
      <div className="page-header">
        <div className="header-content">
          <h1><HiOutlineOfficeBuilding /> EPC Company Verification</h1>
          <p>Review and verify EPC company documents and profiles</p>
        </div>
        <button className="btn-refresh" onClick={fetchCompanies}>
          <HiOutlineRefresh /> Refresh
        </button>
      </div>

      <div className="page-layout">
        {/* Company List Panel */}
        <div className="list-panel">
          <div className="panel-header">
            <h2>Companies</h2>
            <span className="count">{filteredCompanies.length} pending</span>
          </div>

          <SearchFilter
            searchTerm={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={EPC_STATUS_OPTIONS}
            placeholder="Search companies..."
          />

          <div className="company-list">
            {loading ? (
              <div className="loading-state">Loading companies...</div>
            ) : filteredCompanies.length === 0 ? (
              <div className="empty-state">
                <HiOutlineOfficeBuilding />
                <p>No companies pending verification</p>
              </div>
            ) : (
              filteredCompanies.map(company => (
                <EntityCard
                  key={company._id}
                  entity={{
                    _id: company._id,
                    name: company.companyName,
                    email: company.email,
                    status: company.status.toLowerCase().replace(/_/g, '-'),
                    createdAt: company.createdAt,
                  }}
                  isSelected={selectedCompany?._id === company._id}
                  onClick={() => setSelectedCompany(company)}
                  showStatus
                  subtitle={company.ownerName}
                />
              ))
            )}
          </div>
        </div>

        {/* Document Review Panel */}
        <div className="detail-panel">
          {!selectedCompany ? (
            <div className="no-selection">
              <HiOutlineDocumentText />
              <p>Select a company to review documents</p>
            </div>
          ) : (
            <>
              <div className="detail-header">
                <button className="btn-back" onClick={() => setSelectedCompany(null)}>
                  <HiOutlineChevronLeft /> Back
                </button>
                <div className="company-title">
                  <h2>{selectedCompany.companyName}</h2>
                  <span className={`status-badge ${selectedCompany.status.toLowerCase().replace(/_/g, '-')}`}>
                    {selectedCompany.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Company Info Cards */}
              <div className="info-grid">
                <div className="info-card">
                  <HiOutlineMail className="icon" />
                  <div>
                    <label>Email</label>
                    <span>{selectedCompany.email}</span>
                  </div>
                </div>
                <div className="info-card">
                  <HiOutlinePhone className="icon" />
                  <div>
                    <label>Phone</label>
                    <span>{selectedCompany.phone || '—'}</span>
                  </div>
                </div>
                <div className="info-card">
                  <HiOutlineLocationMarker className="icon" />
                  <div>
                    <label>Address</label>
                    <span>{selectedCompany.address || '—'}</span>
                  </div>
                </div>
                <div className="info-card">
                  <HiOutlineClock className="icon" />
                  <div>
                    <label>Submitted</label>
                    <span>{new Date(selectedCompany.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Document Checklist */}
              <div className="documents-section">
                <div className="section-header">
                  <h3>Document Checklist</h3>
                  {getMissingDocs().length > 0 && (
                    <div className="missing-docs-alert">
                      <HiOutlineExclamation />
                      <span>Missing: {getMissingDocs().join(', ')}</span>
                    </div>
                  )}
                </div>
                <DocumentList
                  documents={prepareDocuments()}
                  documentTypes={DOCUMENT_TYPES}
                  onView={handleViewDocument}
                  onApprove={handleDocumentApprove}
                  onReject={handleDocumentReject}
                  layout="list"
                  emptyMessage="No documents found"
                />
              </div>

              {/* Action Buttons */}
              {selectedCompany.status === 'DOCS_SUBMITTED' && (
                <div className="action-bar">
                  <button 
                    className="btn-approve"
                    onClick={() => setCompanyVerifyModal({ show: true, defaultDecision: 'approve' })}
                    disabled={!allRequiredDocsVerified}
                    title={!allRequiredDocsVerified ? 'All required documents must be verified first' : ''}
                  >
                    <HiOutlineCheckCircle /> Approve Company
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => setCompanyVerifyModal({ show: true, defaultDecision: 'reject' })}
                  >
                    <HiOutlineXCircle /> Reject Company
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Document Viewer Modal - using shared component */}
      {viewingDoc && (
        <DocumentViewer
          document={viewingDoc}
          onClose={() => setViewingDoc(null)}
          onApprove={handleDocumentApprove}
          onReject={handleDocumentReject}
          showActions={viewingDoc.status === 'pending'}
        />
      )}

      {/* Company Verify Modal - using shared component */}
      <VerificationModal
        isOpen={companyVerifyModal.show}
        onClose={() => setCompanyVerifyModal({ show: false })}
        onConfirm={handleVerifyCompany}
        title={companyVerifyModal.defaultDecision === 'approve' ? 'Approve Company' : 'Reject Company'}
        entityName={selectedCompany?.companyName || ''}
        defaultDecision={companyVerifyModal.defaultDecision}
        isLoading={processingAction}
      />

      {/* Document Verify Modal - using shared component */}
      <VerificationModal
        isOpen={docVerifyModal.show}
        onClose={() => setDocVerifyModal({ show: false, doc: null })}
        onConfirm={handleVerifyDocument}
        title={docVerifyModal.defaultDecision === 'approve' ? 'Approve Document' : 'Reject Document'}
        entityName={docVerifyModal.doc?.fileName || ''}
        defaultDecision={docVerifyModal.defaultDecision}
        isLoading={processingAction}
      />

      <style>{`
        .epc-verification-page {
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
          color: var(--text-primary);
        }

        .btn-refresh:hover {
          background: var(--bg-secondary);
        }

        .page-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 24px;
          height: calc(100vh - 180px);
        }

        .list-panel {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border, #e2e8f0);
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
          gap: 8px;
          border-bottom: 1px solid var(--border);
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .search-box input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          outline: none;
        }

        .search-box svg {
          color: var(--text-muted);
        }

        .filter-select {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-select select {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          background: white;
        }

        .company-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .company-card {
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 10px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .company-card:hover {
          border-color: var(--primary);
          background: #f8faff;
        }

        .company-card.selected {
          border-color: var(--primary);
          background: #eff6ff;
        }

        .company-info h3 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .company-info p {
          font-size: 13px;
          color: var(--text-muted);
        }

        .company-info .email {
          font-size: 12px;
          color: var(--primary);
        }

        .company-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.docs-submitted {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.action-required {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-badge.active {
          background: #d1fae5;
          color: #059669;
        }

        .time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-muted);
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

        .detail-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .btn-back {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: 1px solid var(--border);
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
        }

        .company-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .company-title h2 {
          font-size: 18px;
          font-weight: 600;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 20px;
          background: var(--bg-secondary);
        }

        .info-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 10px;
        }

        .info-card .icon {
          font-size: 24px;
          color: var(--primary);
        }

        .info-card label {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .info-card span {
          font-size: 14px;
          font-weight: 500;
        }

        .documents-section {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h3 {
          font-size: 16px;
          font-weight: 600;
        }

        .missing-docs-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #fef3cd;
          border: 1px solid #ffc107;
          border-radius: 6px;
          font-size: 13px;
          color: #856404;
        }

        .missing-docs-alert svg {
          color: #f59e0b;
        }

        .documents-section h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .doc-checklist {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .doc-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 10px;
          border: 1px solid var(--border);
        }

        .doc-item.verified {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .doc-item.rejected {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .doc-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .doc-status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .doc-details {
          display: flex;
          flex-direction: column;
        }

        .doc-name {
          font-weight: 500;
          font-size: 14px;
        }

        .doc-name .required {
          color: #ef4444;
          margin-left: 4px;
        }

        .doc-status-text {
          font-size: 12px;
          color: var(--text-muted);
        }

        .doc-actions {
          display: flex;
          gap: 8px;
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
        }

        .btn-icon.approve {
          color: #10b981;
          border-color: #10b981;
        }

        .btn-icon.reject {
          color: #ef4444;
          border-color: #ef4444;
        }

        .action-bar {
          display: flex;
          gap: 12px;
          padding: 20px;
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
        }

        .btn-approve, .btn-reject {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
        }

        .btn-approve {
          background: #10b981;
          color: white;
        }

        .btn-approve:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .btn-reject {
          background: #ef4444;
          color: white;
        }

        .btn-secondary {
          padding: 12px 24px;
          border: 1px solid var(--border);
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
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

        .modal-body p {
          margin-bottom: 16px;
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
            max-height: 400px;
          }

          .info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .epc-verification-page {
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

          .list-panel {
            max-height: 350px;
          }

          .company-card {
            padding: 12px;
          }

          .company-info h3 {
            font-size: 14px;
          }

          .detail-panel {
            border-radius: 8px;
          }

          .info-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .doc-item {
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

          .action-buttons {
            flex-direction: column;
          }

          .action-buttons .btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .epc-verification-page {
            padding: 12px;
          }

          .page-header h1 {
            font-size: 18px;
          }

          .filters {
            padding: 8px 12px;
          }

          .company-list {
            padding: 8px;
          }

          .company-card {
            padding: 10px;
            margin-bottom: 6px;
          }

          .panel-header {
            padding: 12px 16px;
          }

          .modal-header {
            padding: 12px 16px;
          }

          .modal-body {
            padding: 12px 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default EpcVerificationPage;
