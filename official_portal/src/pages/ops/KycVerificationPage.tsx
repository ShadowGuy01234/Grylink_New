import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { opsApi } from "../../api";
import toast from "react-hot-toast";
import {
  HiOutlineIdentification,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineDocumentText,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineCreditCard,
  HiOutlinePlus,
  HiOutlineExternalLink,
} from "react-icons/hi";
// Import shared verification components
import {
  EntityCard,
  DocumentList,
  DocumentViewer,
  VerificationModal,
  SearchFilter,
  StatusBadge,
} from "../../components/verification";
import type { BaseDocument, VerificationDecision } from "../../components/verification";

interface Seller {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company: {
    _id: string;
    companyName: string;
  } | null;
  kycStatus: string;
  status?: string;
  kycDocuments?: KycDocument[];
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
    accountType?: string;
    verificationStatus?: string;
    verifiedAt?: string;
  };
  additionalDocuments?: AdditionalDocument[];
  createdAt: string;
  case?: {
    _id: string;
    caseId: string;
  };
}

interface AdditionalDocument {
  _id: string;
  label: string;
  description?: string;
  requestedAt: string;
  fileName?: string;
  fileUrl?: string;
  status: string;
  uploadedAt?: string;
}

interface KycDocument {
  _id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
}

// KYC Document type definitions for this page
const KYC_DOCUMENT_TYPES: Record<string, { key: string; label: string; required: boolean }> = {
  panCard: { key: 'panCard', label: 'PAN Card', required: true },
  aadhaarCard: { key: 'aadhaarCard', label: 'Aadhaar Card', required: true },
  gstCertificate: { key: 'gstCertificate', label: 'GST Certificate', required: true },
  cancelledCheque: { key: 'cancelledCheque', label: 'Cancelled Cheque', required: true },
  incorporationCertificate: { key: 'incorporationCertificate', label: 'Incorporation Certificate', required: false },
  bankStatement: { key: 'bankStatement', label: 'Bank Statement', required: false },
};

// KYC Status options for filtering
const KYC_STATUS_OPTIONS = [
  { value: 'DOCUMENTS_PENDING', label: 'Documents Pending' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
];

const KycVerificationPage = () => {
  const location = useLocation();
  const routeState = (location.state || {}) as { sellerId?: string; sellerName?: string };

  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  // Document viewer state
  const [viewingDoc, setViewingDoc] = useState<BaseDocument | null>(null);
  
  // Verification modals
  const [kycVerifyModal, setKycVerifyModal] = useState<{ show: boolean; defaultDecision?: 'approve' | 'reject' }>({ show: false });
  const [docVerifyModal, setDocVerifyModal] = useState<{ show: boolean; doc: KycDocument | null; defaultDecision?: 'approve' | 'reject' }>({
    show: false,
    doc: null,
  });
  const [bankVerifyModal, setBankVerifyModal] = useState<{ show: boolean; defaultDecision?: 'approve' | 'reject' }>({ show: false });
  const [additionalVerifyModal, setAdditionalVerifyModal] = useState<{ show: boolean; docId: string | null; defaultDecision?: 'approve' | 'reject' }>({ show: false, docId: null });
  const [processingAction, setProcessingAction] = useState(false);

  // Request additional document form
  const [requestDocForm, setRequestDocForm] = useState({ show: false, label: '', description: '' });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const fetchSellers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await opsApi.getPendingKyc();
      const filtered = statusFilter 
        ? res.data.sellers.filter((s: Seller) => s.kycStatus === statusFilter)
        : res.data.sellers;
      setSellers(filtered);
    } catch {
      toast.error("Failed to load sellers");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Re-fetch when status filter changes
  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  // Auto-load & pre-select seller from route state (navigating from KYC queue)
  useEffect(() => {
    if (!routeState.sellerId) return;
    const loadFromRoute = async () => {
      try {
        setLoadingDetail(true);
        const res = await opsApi.getSellerKyc(routeState.sellerId!);
        const seller = res.data.seller as Seller;
        // Inject into list if not already there (completed KYC sellers aren't in pending list)
        setSellers(prev => {
          const exists = prev.some(s => s._id === seller._id);
          return exists ? prev : [seller, ...prev];
        });
        setSelectedSeller(seller);
      } catch {
        toast.error("Could not load seller details");
      } finally {
        setLoadingDetail(false);
      }
    };
    loadFromRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSeller = async (seller: Seller) => {
    setSelectedSeller(seller);
    setLoadingDetail(true);
    try {
      const res = await opsApi.getSellerKyc(seller._id);
      setSelectedSeller(res.data.seller);
    } catch {
      toast.error("Failed to load seller details");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleVerifyKyc = async (decision: VerificationDecision) => {
    if (!selectedSeller) return;
    
    setProcessingAction(true);
    try {
      await opsApi.verifyKyc(selectedSeller._id, {
        decision: decision.decision,
        notes: decision.notes,
      });
      toast.success(decision.decision === "approve" ? "KYC approved!" : "KYC rejected");
      setKycVerifyModal({ show: false });
      setSelectedSeller(null);
      fetchSellers();
    } catch {
      toast.error("Failed to verify KYC");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleVerifyDocument = async (decision: VerificationDecision) => {
    if (!docVerifyModal.doc) return;
    
    setProcessingAction(true);
    try {
      await opsApi.verifyKycDocument(docVerifyModal.doc._id, {
        decision: decision.decision,
        notes: decision.notes,
      });
      toast.success(decision.decision === "approve" ? "Document verified successfully!" : "Document rejected");
      setDocVerifyModal({ show: false, doc: null });
      if (selectedSeller) {
        const res = await opsApi.getSellerKyc(selectedSeller._id);
        setSelectedSeller(res.data.seller);
      }
      fetchSellers();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to verify document";
      toast.error(errMsg);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleVerifyBankDetails = async (decision: VerificationDecision) => {
    if (!selectedSeller) return;
    setProcessingAction(true);
    try {
      await opsApi.verifyBankDetails(selectedSeller._id, {
        decision: decision.decision,
        notes: decision.notes,
      });
      toast.success(decision.decision === "approve" ? "Bank details verified!" : "Bank details rejected");
      setBankVerifyModal({ show: false });
      const res = await opsApi.getSellerKyc(selectedSeller._id);
      setSelectedSeller(res.data.seller);
    } catch {
      toast.error("Failed to verify bank details");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleVerifyAdditionalDoc = async (decision: VerificationDecision) => {
    if (!selectedSeller || !additionalVerifyModal.docId) return;
    setProcessingAction(true);
    try {
      await opsApi.verifyAdditionalDoc(selectedSeller._id, additionalVerifyModal.docId, {
        decision: decision.decision,
      });
      toast.success(decision.decision === "approve" ? "Document verified!" : "Document rejected");
      setAdditionalVerifyModal({ show: false, docId: null });
      const res = await opsApi.getSellerKyc(selectedSeller._id);
      setSelectedSeller(res.data.seller);
    } catch {
      toast.error("Failed to verify document");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRequestAdditionalDoc = async () => {
    if (!selectedSeller || !requestDocForm.label.trim()) return;
    setSubmittingRequest(true);
    try {
      await opsApi.requestAdditionalDoc(selectedSeller._id, {
        label: requestDocForm.label,
        description: requestDocForm.description,
      });
      toast.success("Additional document requested");
      setRequestDocForm({ show: false, label: '', description: '' });
      const res = await opsApi.getSellerKyc(selectedSeller._id);
      setSelectedSeller(res.data.seller);
    } catch {
      toast.error("Failed to request document");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const filteredSellers = sellers.filter(s => 
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.company?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transform KYC documents for DocumentList component
  const prepareDocuments = (): BaseDocument[] => {
    if (!selectedSeller?.kycDocuments) return [];
    
    return selectedSeller.kycDocuments.map(doc => ({
      _id: doc._id,
      type: doc.type,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      status: (doc.status as 'pending' | 'verified' | 'rejected' | 'missing') || 'pending',
      uploadedAt: doc.uploadedAt,
    }));
  };

  // Handle document view from DocumentList
  const handleViewDocument = (doc: BaseDocument) => {
    setViewingDoc(doc);
  };

  // Handle approve from DocumentViewer or DocumentList
  const handleDocumentApprove = (doc: BaseDocument) => {
    const kycDoc = selectedSeller?.kycDocuments?.find(d => d._id === doc._id);
    if (kycDoc) {
      setDocVerifyModal({ show: true, doc: kycDoc, defaultDecision: 'approve' });
    }
  };

  // Handle reject from DocumentViewer or DocumentList
  const handleDocumentReject = (doc: BaseDocument) => {
    const kycDoc = selectedSeller?.kycDocuments?.find(d => d._id === doc._id);
    if (kycDoc) {
      setDocVerifyModal({ show: true, doc: kycDoc, defaultDecision: 'reject' });
    }
  };

  // Helper to get document status info (used for missing docs check)
  const getMissingDocs = () => {
    return Object.entries(KYC_DOCUMENT_TYPES)
      .filter(([key, config]) => 
        config.required && !selectedSeller?.kycDocuments?.find(d => d.type === key)
      );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="kyc-verification-page">
      <div className="page-header">
        <div className="header-content">
          <h1><HiOutlineIdentification /> Seller KYC Verification</h1>
          <p>Review and verify subcontractor identity documents and bank details</p>
        </div>
        <button className="btn-refresh" onClick={fetchSellers}>
          <HiOutlineRefresh /> Refresh
        </button>
      </div>

      <div className="page-layout">
        {/* Seller List Panel */}
        <div className="list-panel">
          <div className="panel-header">
            <h2>Sellers</h2>
            <span className="count">{filteredSellers.length}</span>
          </div>

          <div className="filters">
            <SearchFilter
              searchTerm={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              statusOptions={KYC_STATUS_OPTIONS}
              placeholder="Search sellers..."
            />
          </div>

          <div className="seller-list">
            {loading ? (
              <div className="loading-state">Loading sellers...</div>
            ) : filteredSellers.length === 0 ? (
              <div className="empty-state">
                <HiOutlineIdentification />
                <p>No sellers pending KYC</p>
              </div>
            ) : (
              filteredSellers.map(seller => (
                <EntityCard
                  key={seller._id}
                  entity={{
                    _id: seller._id,
                    name: seller.name,
                    email: seller.email,
                    phone: seller.phone,
                    company: seller.company,
                    status: seller.kycStatus,
                    createdAt: seller.createdAt,
                  }}
                  isSelected={selectedSeller?._id === seller._id}
                  onClick={() => handleSelectSeller(seller)}
                  subtitle={`${seller.kycDocuments?.length || 0} documents`}
                />
              ))
            )}
          </div>
        </div>

        {/* KYC Detail Panel */}
        <div className="detail-panel">
          {!selectedSeller ? (
            <div className="no-selection">
              <HiOutlineIdentification />
              <p>Select a seller to review KYC</p>
            </div>
          ) : (
            <div className="kyc-details">
              <div className="detail-header">
                <div className="seller-header-info">
                  <div className="seller-avatar large">
                    {selectedSeller.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2>{selectedSeller.name}</h2>
                    <p>{selectedSeller.company?.companyName}</p>
                  </div>
                </div>
                <StatusBadge status={selectedSeller.kycStatus} size="lg" />
              </div>

              <div className="info-row">
                <div className="info-item">
                  <HiOutlineMail />
                  <span>{selectedSeller.email}</span>
                </div>
                <div className="info-item">
                  <HiOutlinePhone />
                  <span>{selectedSeller.phone || '—'}</span>
                </div>
                {selectedSeller.case && (
                  <div className="info-item">
                    <HiOutlineDocumentText />
                    <span>Case: {selectedSeller.case.caseId}</span>
                  </div>
                )}
              </div>

              {loadingDetail && (
                <div className="detail-loading">Loading full KYC details...</div>
              )}

              <div className="content-column">
                {/* Documents Panel */}
                <div className="documents-panel">
                  <h3>KYC Documents</h3>
                  <DocumentList
                    documents={prepareDocuments()}
                    documentTypes={KYC_DOCUMENT_TYPES}
                    onView={handleViewDocument}
                    onApprove={handleDocumentApprove}
                    onReject={handleDocumentReject}
                    layout="list"
                    emptyMessage="No documents uploaded yet"
                  />

                  {/* Missing documents indicator */}
                  {getMissingDocs().length > 0 && (
                    <div className="missing-docs-alert">
                      <strong>Missing Required Documents:</strong>
                      <ul>
                        {getMissingDocs().map(([key, config]) => (
                          <li key={key}>{config.label}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bank Details Panel */}
                <div className="bank-details-panel">
                  <div className="panel-section-header">
                    <HiOutlineCreditCard />
                    <h3>Bank Details</h3>
                    {selectedSeller.bankDetails?.verificationStatus && (
                      <span className={`status-chip ${selectedSeller.bankDetails.verificationStatus.toLowerCase()}`}>
                        {selectedSeller.bankDetails.verificationStatus}
                      </span>
                    )}
                  </div>
                  {selectedSeller.bankDetails?.accountNumber ? (
                    <>
                      <div className="bank-grid">
                        <div className="bank-field">
                          <label>Account Holder</label>
                          <span>{selectedSeller.bankDetails.accountHolderName || '—'}</span>
                        </div>
                        <div className="bank-field">
                          <label>Account Number</label>
                          <span>{selectedSeller.bankDetails.accountNumber}</span>
                        </div>
                        <div className="bank-field">
                          <label>IFSC Code</label>
                          <span>{selectedSeller.bankDetails.ifscCode || '—'}</span>
                        </div>
                        <div className="bank-field">
                          <label>Bank Name</label>
                          <span>{selectedSeller.bankDetails.bankName || '—'}</span>
                        </div>
                        <div className="bank-field">
                          <label>Branch</label>
                          <span>{selectedSeller.bankDetails.branchName || '—'}</span>
                        </div>
                        <div className="bank-field">
                          <label>Account Type</label>
                          <span>{selectedSeller.bankDetails.accountType || '—'}</span>
                        </div>
                      </div>
                      {selectedSeller.bankDetails.verificationStatus !== 'VERIFIED' && (
                        <div className="bank-actions">
                          <button
                            className="btn-approve-sm"
                            onClick={() => setBankVerifyModal({ show: true, defaultDecision: 'approve' })}
                          >
                            <HiOutlineCheckCircle /> Verify Bank
                          </button>
                          <button
                            className="btn-reject-sm"
                            onClick={() => setBankVerifyModal({ show: true, defaultDecision: 'reject' })}
                          >
                            <HiOutlineXCircle /> Reject Bank
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="no-bank-details">No bank details submitted yet</p>
                  )}
                </div>

                {/* Additional Documents Panel */}
                <div className="additional-docs-panel">
                  <div className="panel-section-header">
                    <HiOutlineDocumentText />
                    <h3>Additional Documents</h3>
                    <button
                      className="btn-request-doc"
                      onClick={() => setRequestDocForm({ show: true, label: '', description: '' })}
                    >
                      <HiOutlinePlus /> Request Document
                    </button>
                  </div>

                  {requestDocForm.show && (
                    <div className="request-doc-form">
                      <input
                        placeholder="Document label (e.g. GST Returns 2023-24)"
                        value={requestDocForm.label}
                        onChange={(e) => setRequestDocForm(f => ({ ...f, label: e.target.value }))}
                      />
                      <input
                        placeholder="Description (optional)"
                        value={requestDocForm.description}
                        onChange={(e) => setRequestDocForm(f => ({ ...f, description: e.target.value }))}
                      />
                      <div className="form-actions">
                        <button
                          className="btn-cancel-sm"
                          onClick={() => setRequestDocForm({ show: false, label: '', description: '' })}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn-primary-sm"
                          onClick={handleRequestAdditionalDoc}
                          disabled={!requestDocForm.label.trim() || submittingRequest}
                        >
                          {submittingRequest ? 'Sending...' : 'Send Request'}
                        </button>
                      </div>
                    </div>
                  )}

                  {(selectedSeller.additionalDocuments || []).length === 0 && !requestDocForm.show && (
                    <p className="no-additional-docs">No additional documents requested</p>
                  )}

                  {(selectedSeller.additionalDocuments || []).map(doc => (
                    <div key={doc._id} className="additional-doc-item">
                      <div className="additional-doc-info">
                        <strong>{doc.label}</strong>
                        {doc.description && <span className="doc-description">{doc.description}</span>}
                        <div className="doc-meta">
                          <span className={`status-chip ${doc.status.toLowerCase()}`}>{doc.status}</span>
                          {doc.requestedAt && <span className="doc-date">Requested: {formatDate(doc.requestedAt)}</span>}
                        </div>
                      </div>
                      <div className="additional-doc-actions">
                        {doc.fileUrl && (
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-view-sm">
                            <HiOutlineExternalLink /> View
                          </a>
                        )}
                        {doc.status === 'UPLOADED' && (
                          <>
                            <button
                              className="btn-approve-sm"
                              onClick={() => setAdditionalVerifyModal({ show: true, docId: doc._id, defaultDecision: 'approve' })}
                            >
                              <HiOutlineCheckCircle />
                            </button>
                            <button
                              className="btn-reject-sm"
                              onClick={() => setAdditionalVerifyModal({ show: true, docId: doc._id, defaultDecision: 'reject' })}
                            >
                              <HiOutlineXCircle />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Overall KYC Actions */}
                {selectedSeller.kycStatus === 'UNDER_REVIEW' && (
                  <div className="kyc-final-actions">
                    <h3>Final KYC Decision</h3>
                    <p>All required documents have been submitted for review.</p>
                    <div className="action-buttons">
                      <button
                        className="btn-approve"
                        onClick={() => setKycVerifyModal({ show: true, defaultDecision: 'approve' })}
                      >
                        <HiOutlineCheckCircle /> Approve KYC
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => setKycVerifyModal({ show: true, defaultDecision: 'reject' })}
                      >
                        <HiOutlineXCircle /> Reject KYC
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer - Using DocumentViewer Component */}
      <DocumentViewer
        document={viewingDoc}
        onClose={() => setViewingDoc(null)}
        onApprove={(doc) => {
          handleDocumentApprove(doc);
          setViewingDoc(null);
        }}
        onReject={(doc) => {
          handleDocumentReject(doc);
          setViewingDoc(null);
        }}
        showActions={true}
      />

      {/* KYC Verification Modal - Using VerificationModal Component */}
      <VerificationModal
        isOpen={kycVerifyModal.show}
        onClose={() => setKycVerifyModal({ show: false })}
        onConfirm={handleVerifyKyc}
        title="Verify Seller KYC"
        entityName={selectedSeller?.name}
        defaultDecision={kycVerifyModal.defaultDecision}
        isLoading={processingAction}
      />

      {/* Document Verification Modal - Using VerificationModal Component */}
      <VerificationModal
        isOpen={docVerifyModal.show}
        onClose={() => setDocVerifyModal({ show: false, doc: null })}
        onConfirm={handleVerifyDocument}
        title="Verify Document"
        entityName={docVerifyModal.doc?.fileName}
        defaultDecision={docVerifyModal.defaultDecision}
        isLoading={processingAction}
      />

      {/* Bank Details Verification Modal */}
      <VerificationModal
        isOpen={bankVerifyModal.show}
        onClose={() => setBankVerifyModal({ show: false })}
        onConfirm={handleVerifyBankDetails}
        title="Verify Bank Details"
        entityName={selectedSeller?.bankDetails?.bankName}
        defaultDecision={bankVerifyModal.defaultDecision}
        isLoading={processingAction}
      />

      {/* Additional Document Verification Modal */}
      <VerificationModal
        isOpen={additionalVerifyModal.show}
        onClose={() => setAdditionalVerifyModal({ show: false, docId: null })}
        onConfirm={handleVerifyAdditionalDoc}
        title="Verify Additional Document"
        entityName={selectedSeller?.additionalDocuments?.find(d => d._id === additionalVerifyModal.docId)?.label}
        defaultDecision={additionalVerifyModal.defaultDecision}
        isLoading={processingAction}
      />

      <style>{`
        .kyc-verification-page {
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

        .page-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 24px;
          height: calc(100vh - 140px);
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

        .seller-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .seller-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          border: 1px solid var(--border);
          border-radius: 10px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .seller-card:hover {
          border-color: var(--primary);
          background: #f8faff;
        }

        .seller-card.selected {
          border-color: var(--primary);
          background: #eff6ff;
        }

        .seller-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }

        .seller-avatar.large {
          width: 56px;
          height: 56px;
          font-size: 22px;
        }

        .seller-info {
          flex: 1;
          min-width: 0;
        }

        .seller-info h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .seller-info p {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .seller-info .email {
          font-size: 11px;
          color: var(--primary);
        }

        .seller-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .status-badge {
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.in-review {
          background: #dbeafe;
          color: #2563eb;
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

        .doc-count {
          font-size: 11px;
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

        .kyc-details {
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

        .seller-header-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .seller-header-info h2 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .seller-header-info p {
          font-size: 13px;
          color: var(--text-muted);
        }

        .info-row {
          display: flex;
          gap: 24px;
          padding: 16px 20px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .info-item svg {
          color: var(--primary);
        }

        .content-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .detail-loading {
          padding: 8px 20px;
          font-size: 12px;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
        }

        .documents-panel {
          background: white;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px;
        }

        .documents-panel h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .doc-checklist {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .doc-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px;
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

        .doc-type-icon {
          font-size: 20px;
          color: var(--primary);
        }

        .doc-details {
          display: flex;
          flex-direction: column;
        }

        .doc-name {
          font-weight: 500;
          font-size: 13px;
        }

        .doc-status-text {
          font-size: 11px;
        }

        .doc-actions {
          display: flex;
          gap: 6px;
        }

        .btn-icon {
          width: 30px;
          height: 30px;
          border: 1px solid var(--border);
          background: white;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
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

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }

        .btn-approve, .btn-reject {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
        }

        .btn-approve {
          background: #10b981;
          color: white;
        }

        .btn-reject {
          background: #ef4444;
          color: white;
        }

        .btn-secondary {
          padding: 12px 20px;
          border: 1px solid var(--border);
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        /* Missing Documents Alert */
        .missing-docs-alert {
          margin-top: 16px;
          padding: 14px;
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          font-size: 13px;
        }

        .missing-docs-alert strong {
          display: block;
          color: #92400e;
          margin-bottom: 8px;
        }

        .missing-docs-alert ul {
          margin: 0;
          padding-left: 20px;
          color: #78350f;
        }

        .missing-docs-alert li {
          margin-bottom: 4px;
        }

        /* Bank Details Panel */
        .bank-details-panel {
          background: white;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px;
        }

        .panel-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .panel-section-header h3 {
          font-size: 14px;
          font-weight: 600;
          flex: 1;
        }

        .panel-section-header svg {
          color: var(--primary);
          font-size: 18px;
        }

        .status-chip {
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-chip.verified { background: #d1fae5; color: #059669; }
        .status-chip.pending { background: #fef3c7; color: #92400e; }
        .status-chip.failed, .status-chip.rejected { background: #fee2e2; color: #dc2626; }
        .status-chip.under_review { background: #dbeafe; color: #2563eb; }
        .status-chip.requested { background: #f3f4f6; color: #6b7280; }
        .status-chip.uploaded { background: #ede9fe; color: #7c3aed; }

        .bank-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .bank-field {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .bank-field label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .bank-field span {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .bank-actions {
          display: flex;
          gap: 8px;
        }

        .no-bank-details, .no-additional-docs {
          font-size: 13px;
          color: var(--text-muted);
          padding: 12px 0;
        }

        /* Additional Docs Panel */
        .additional-docs-panel {
          background: white;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px;
        }

        .btn-request-doc {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        }

        .request-doc-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          padding: 14px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .request-doc-form input {
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          outline: none;
        }

        .request-doc-form input:focus {
          border-color: var(--primary);
        }

        .form-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .additional-doc-item {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .additional-doc-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .additional-doc-info strong {
          font-size: 13px;
          font-weight: 600;
        }

        .doc-description {
          font-size: 12px;
          color: var(--text-muted);
        }

        .doc-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .doc-date {
          font-size: 11px;
          color: var(--text-muted);
        }

        .additional-doc-actions {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-shrink: 0;
        }

        /* Small buttons */
        .btn-approve-sm, .btn-reject-sm, .btn-view-sm, .btn-cancel-sm, .btn-primary-sm {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
        }

        .btn-approve-sm {
          background: #d1fae5;
          color: #059669;
        }

        .btn-reject-sm {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-view-sm {
          background: #eff6ff;
          color: #2563eb;
        }

        .btn-cancel-sm {
          background: var(--bg-secondary);
          color: var(--text-muted);
          border: 1px solid var(--border);
        }

        .btn-primary-sm {
          background: var(--primary);
          color: white;
        }

        .btn-primary-sm:disabled {
          background: var(--text-muted);
          cursor: not-allowed;
        }

        /* KYC Final Actions */
        .kyc-final-actions {
          background: white;
          border: 2px solid #2563eb;
          border-radius: 10px;
          padding: 20px;
        }

        .kyc-final-actions h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--text-primary);
        }

        .kyc-final-actions p {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 16px;
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

        .seller-summary {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .seller-summary strong {
          display: block;
        }

        .seller-summary span {
          font-size: 13px;
          color: var(--text-muted);
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

          .content-grid {
            grid-template-columns: 1fr;
          }

          .documents-panel {
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
        }

        @media (max-width: 768px) {
          .kyc-verification-page {
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
            max-height: 280px;
          }

          .seller-card {
            padding: 12px;
          }

          .seller-name {
            font-size: 14px;
          }

          .detail-panel {
            border-radius: 8px;
          }

          .content-grid {
            height: auto;
          }

          .documents-panel,
          .chat-panel {
            height: 350px;
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

          .chat-messages {
            padding: 12px;
          }

          .message {
            max-width: 90%;
          }

          .chat-input {
            padding: 12px;
          }

          .chat-input input {
            padding: 10px 14px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-buttons .btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .kyc-verification-page {
            padding: 12px;
          }

          .page-header h1 {
            font-size: 18px;
          }

          .filters {
            padding: 8px 12px;
          }

          .seller-list {
            padding: 8px;
          }

          .seller-card {
            padding: 10px;
            margin-bottom: 6px;
          }

          .panel-header {
            padding: 12px 16px;
          }

          .documents-panel,
          .chat-panel {
            height: 300px;
          }

          .message-content {
            padding: 10px 12px;
          }

          .message-reactions {
            flex-wrap: wrap;
          }

          .emoji-btn {
            padding: 2px 6px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default KycVerificationPage;
