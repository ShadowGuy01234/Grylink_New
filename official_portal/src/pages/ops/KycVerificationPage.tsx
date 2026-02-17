import { useState, useEffect, useCallback, useRef } from "react";
import { opsApi } from "../../api";
import toast from "react-hot-toast";
import {
  HiOutlineIdentification,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineChat,
  HiOutlinePaperAirplane,
  HiOutlineReply,
  HiOutlineDocumentText,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
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
  };
  kycStatus: string;
  kycDocuments?: KycDocument[];
  createdAt: string;
  case?: {
    _id: string;
    caseId: string;
  };
}

interface KycDocument {
  _id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
}

interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    role: string;
  };
  message: string;
  type: 'text' | 'system' | 'action_required' | 'document';
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
  }[];
  replyTo?: {
    _id: string;
    message: string;
    sender: { name: string };
  };
  reactions?: {
    emoji: string;
    users: string[];
  }[];
  isEdited?: boolean;
  createdAt: string;
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
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
];

const KycVerificationPage = () => {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Document viewer state
  const [viewingDoc, setViewingDoc] = useState<BaseDocument | null>(null);
  
  // Verification modals - using new VerificationModal component
  const [kycVerifyModal, setKycVerifyModal] = useState<{ show: boolean; defaultDecision?: 'approve' | 'reject' }>({ show: false });
  const [docVerifyModal, setDocVerifyModal] = useState<{ show: boolean; doc: KycDocument | null; defaultDecision?: 'approve' | 'reject' }>({
    show: false,
    doc: null,
  });
  const [processingAction, setProcessingAction] = useState(false);

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

  const fetchMessages = useCallback(async (sellerId: string) => {
    try {
      const res = await opsApi.getKycChat(sellerId);
      setMessages(res.data.messages || []);
    } catch {
      console.error("Failed to load messages");
    }
  }, []);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  useEffect(() => {
    if (selectedSeller) {
      fetchMessages(selectedSeller._id);
      const interval = setInterval(() => fetchMessages(selectedSeller._id), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedSeller, fetchMessages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!selectedSeller || !newMessage.trim()) return;
    
    try {
      if (editingMessage) {
        await opsApi.editKycMessage(editingMessage._id, { message: newMessage });
        toast.success("Message updated");
        setEditingMessage(null);
      } else {
        await opsApi.sendKycMessage(selectedSeller._id, {
          message: newMessage,
          replyTo: replyingTo?._id,
        });
      }
      setNewMessage("");
      setReplyingTo(null);
      fetchMessages(selectedSeller._id);
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await opsApi.deleteKycMessage(messageId);
      toast.success("Message deleted");
      if (selectedSeller) {
        fetchMessages(selectedSeller._id);
      }
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      await opsApi.addKycReaction(messageId, emoji);
      if (selectedSeller) {
        fetchMessages(selectedSeller._id);
      }
    } catch {
      toast.error("Failed to add reaction");
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
      console.log("Verifying document:", docVerifyModal.doc._id, decision);
      await opsApi.verifyKycDocument(docVerifyModal.doc._id, {
        decision: decision.decision,
        notes: decision.notes,
      });
      toast.success("Document verified successfully!");
      setDocVerifyModal({ show: false, doc: null });
      fetchSellers();
      if (selectedSeller) {
        const res = await opsApi.getSellerKyc(selectedSeller._id);
        setSelectedSeller(res.data.seller);
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

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="kyc-verification-page">
      <div className="page-header">
        <div className="header-content">
          <h1><HiOutlineIdentification /> Seller KYC Verification</h1>
          <p>Verify seller identity documents and communicate directly</p>
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
                  onClick={() => setSelectedSeller(seller)}
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

              <div className="content-grid">
                {/* Documents Panel - Using DocumentList Component */}
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
                          ))
                        }
                      </ul>
                    </div>
                  )}

                  {selectedSeller.kycStatus === 'PENDING' && (
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
                  )}
                </div>

                {/* Chat Panel */}
                <div className="chat-panel">
                  <div className="chat-header">
                    <HiOutlineChat />
                    <h3>Communication</h3>
                    <span className="message-count">{messages.length} messages</span>
                  </div>

                  <div className="chat-messages" ref={chatContainerRef}>
                    {messages.length === 0 ? (
                      <div className="no-messages">
                        <HiOutlineChat />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map(msg => {
                        const isOwn = msg.sender._id === user?.id;
                        return (
                          <div 
                            key={msg._id} 
                            className={`message ${isOwn ? 'own' : ''} ${msg.type}`}
                          >
                            {msg.replyTo && (
                              <div className="reply-preview">
                                <HiOutlineReply />
                                <span>{msg.replyTo.sender.name}: {msg.replyTo.message.substring(0, 50)}...</span>
                              </div>
                            )}
                            <div className="message-content">
                              {!isOwn && (
                                <span className="sender-name">{msg.sender.name}</span>
                              )}
                              <p>{msg.message}</p>
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="attachments">
                                  {msg.attachments.map((att, i) => (
                                    <a key={i} href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                                      <HiOutlineDocumentText />
                                      {att.fileName}
                                    </a>
                                  ))}
                                </div>
                              )}
                              <div className="message-meta">
                                <span className="time">{formatTime(msg.createdAt)}</span>
                                {msg.isEdited && <span className="edited">(edited)</span>}
                              </div>
                            </div>
                            
                            {/* Reactions */}
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className="reactions">
                                {msg.reactions.map((r, i) => (
                                  <span key={i} className="reaction">
                                    {r.emoji} {r.users.length}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Message Actions */}
                            <div className="message-actions">
                              <button onClick={() => setReplyingTo(msg)} title="Reply">
                                <HiOutlineReply />
                              </button>
                              <button onClick={() => handleAddReaction(msg._id, '👍')} title="Like">
                                👍
                              </button>
                              {isOwn && (
                                <>
                                  <button onClick={() => {
                                    setEditingMessage(msg);
                                    setNewMessage(msg.message);
                                  }} title="Edit">
                                    <HiOutlinePencil />
                                  </button>
                                  <button onClick={() => handleDeleteMessage(msg._id)} title="Delete">
                                    <HiOutlineTrash />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Reply Preview */}
                  {replyingTo && (
                    <div className="reply-bar">
                      <HiOutlineReply />
                      <span>Replying to {replyingTo.sender.name}</span>
                      <button onClick={() => setReplyingTo(null)}>×</button>
                    </div>
                  )}

                  {/* Edit Preview */}
                  {editingMessage && (
                    <div className="edit-bar">
                      <HiOutlinePencil />
                      <span>Editing message</span>
                      <button onClick={() => {
                        setEditingMessage(null);
                        setNewMessage("");
                      }}>×</button>
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="chat-input">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                      className="btn-send"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <HiOutlinePaperAirplane />
                    </button>
                  </div>
                </div>
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

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          flex: 1;
          overflow: hidden;
        }

        .documents-panel {
          padding: 20px;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
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

        /* Chat Panel */
        .chat-panel {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .chat-header h3 {
          font-size: 14px;
          font-weight: 600;
          margin-right: auto;
        }

        .message-count {
          font-size: 12px;
          color: var(--text-muted);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .no-messages {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          gap: 8px;
        }

        .no-messages svg {
          font-size: 40px;
          opacity: 0.3;
        }

        .message {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 12px;
          background: var(--bg-secondary);
          position: relative;
        }

        .message.own {
          margin-left: auto;
          background: var(--primary);
          color: white;
        }

        .message.system, .message.action_required {
          margin: 0 auto;
          max-width: 90%;
          text-align: center;
          background: #fef3c7;
          font-size: 12px;
        }

        .reply-preview {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          margin-bottom: 8px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 6px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .message.own .reply-preview {
          background: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.8);
        }

        .sender-name {
          display: block;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--primary);
        }

        .message.own .sender-name {
          color: rgba(255, 255, 255, 0.8);
        }

        .message-content p {
          font-size: 13px;
          line-height: 1.4;
        }

        .attachments {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 8px;
        }

        .attachments a {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: inherit;
          opacity: 0.9;
          text-decoration: underline;
        }

        .message-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }

        .time {
          font-size: 10px;
          opacity: 0.7;
        }

        .edited {
          font-size: 10px;
          opacity: 0.6;
          font-style: italic;
        }

        .reactions {
          display: flex;
          gap: 4px;
          margin-top: 6px;
        }

        .reaction {
          padding: 2px 6px;
          background: white;
          border-radius: 10px;
          font-size: 11px;
          border: 1px solid var(--border);
        }

        .message-actions {
          display: none;
          position: absolute;
          top: -10px;
          right: 4px;
          background: white;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 4px;
        }

        .message:hover .message-actions {
          display: flex;
          gap: 2px;
        }

        .message-actions button {
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .message-actions button:hover {
          background: var(--bg-secondary);
        }

        .reply-bar, .edit-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          font-size: 12px;
        }

        .reply-bar button, .edit-bar button {
          margin-left: auto;
          width: 20px;
          height: 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 16px;
        }

        .chat-input {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid var(--border);
        }

        .chat-input input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          outline: none;
        }

        .chat-input input:focus {
          border-color: var(--primary);
        }

        .btn-send {
          width: 40px;
          height: 40px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-send:disabled {
          background: var(--text-muted);
          cursor: not-allowed;
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
