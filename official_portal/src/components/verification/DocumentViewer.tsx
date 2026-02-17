import { HiOutlineX, HiOutlineDownload, HiOutlineExternalLink, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import type { BaseDocument } from './types';
import StatusBadge from './StatusBadge';

interface DocumentViewerProps {
  document: BaseDocument | null;
  onClose: () => void;
  onApprove?: (doc: BaseDocument) => void;
  onReject?: (doc: BaseDocument) => void;
  showActions?: boolean;
}

export const DocumentViewer = ({
  document,
  onClose,
  onApprove,
  onReject,
  showActions = true,
}: DocumentViewerProps) => {
  if (!document) return null;

  const isImage = document.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
                  document.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPdf = document.fileUrl?.match(/\.pdf$/i) || document.fileName?.match(/\.pdf$/i);

  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = document.fileUrl;
    link.download = document.fileName || 'document';
    link.click();
  };

  return (
    <div className="document-viewer-overlay" onClick={onClose}>
      <div className="document-viewer-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="document-viewer-header">
          <div className="header-info">
            <h3>{document.fileName || document.type}</h3>
            <div className="header-meta">
              <StatusBadge status={document.status} size="sm" />
              {document.uploadedAt && (
                <span className="upload-date">
                  Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-icon" onClick={handleDownload} title="Download">
              <HiOutlineDownload />
            </button>
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon"
              title="Open in new tab"
            >
              <HiOutlineExternalLink />
            </a>
            <button className="btn-icon close" onClick={onClose} title="Close">
              <HiOutlineX />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="document-viewer-content">
          {isImage ? (
            <img src={document.fileUrl} alt={document.fileName} className="document-image" />
          ) : isPdf ? (
            <iframe src={document.fileUrl} className="document-pdf" title={document.fileName} />
          ) : (
            <div className="document-fallback">
              <HiOutlineExternalLink size={48} />
              <p>Preview not available</p>
              <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Open Document
              </a>
            </div>
          )}
        </div>

        {/* Footer with actions */}
        {showActions && document.status === 'pending' && (
          <div className="document-viewer-footer">
            {document.verificationNotes && (
              <div className="verification-notes">
                <strong>Notes:</strong> {document.verificationNotes}
              </div>
            )}
            <div className="action-buttons">
              {onReject && (
                <button className="btn-reject" onClick={() => onReject(document)}>
                  <HiOutlineXCircle /> Reject
                </button>
              )}
              {onApprove && (
                <button className="btn-approve" onClick={() => onApprove(document)}>
                  <HiOutlineCheckCircle /> Approve
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .document-viewer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        .document-viewer-container {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 1000px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        .document-viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .header-info h3 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .header-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .upload-date {
          font-size: 12px;
          color: #6b7280;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-icon:hover {
          background: #f3f4f6;
          color: #111827;
          border-color: #d1d5db;
        }

        .btn-icon.close:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fecaca;
        }

        .document-viewer-content {
          flex: 1;
          overflow: auto;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          min-height: 400px;
        }

        .document-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .document-pdf {
          width: 100%;
          height: 100%;
          min-height: 500px;
          border: none;
          border-radius: 8px;
        }

        .document-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: #6b7280;
        }

        .document-fallback p {
          margin: 0;
          font-size: 14px;
        }

        .btn-primary {
          padding: 8px 16px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        .document-viewer-footer {
          padding: 16px 20px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .verification-notes {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 12px;
          padding: 8px 12px;
          background: #fff;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-approve, .btn-reject {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-approve {
          background: #10b981;
          color: white;
        }

        .btn-approve:hover {
          background: #059669;
        }

        .btn-reject {
          background: #ef4444;
          color: white;
        }

        .btn-reject:hover {
          background: #dc2626;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .document-viewer-container {
            max-height: 100vh;
            border-radius: 0;
          }
          
          .document-viewer-overlay {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default DocumentViewer;
