import {
  HiOutlineDocumentText,
  HiOutlinePhotograph,
  HiOutlineEye,
  HiOutlineDownload,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationCircle,
  HiOutlineClock,
} from 'react-icons/hi';
import type { BaseDocument, DocumentType } from './types';
import StatusBadge from './StatusBadge';

interface DocumentListProps {
  documents: BaseDocument[];
  documentTypes?: Record<string, DocumentType>;
  onView?: (doc: BaseDocument) => void;
  onApprove?: (doc: BaseDocument) => void;
  onReject?: (doc: BaseDocument) => void;
  layout?: 'grid' | 'list';
  emptyMessage?: string;
}

export const DocumentList = ({
  documents,
  documentTypes = {},
  onView,
  onApprove,
  onReject,
  layout = 'grid',
  emptyMessage = 'No documents available',
}: DocumentListProps) => {
  const getDocumentIcon = (doc: BaseDocument) => {
    const isImage =
      doc.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
      doc.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    return isImage ? <HiOutlinePhotograph /> : <HiOutlineDocumentText />;
  };

  const getDocumentLabel = (doc: BaseDocument) => {
    const docType = documentTypes[doc.type];
    return docType?.label || doc.type || doc.fileName;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return <HiOutlineCheckCircle className="status-icon verified" />;
      case 'rejected':
        return <HiOutlineXCircle className="status-icon rejected" />;
      case 'pending':
        return <HiOutlineClock className="status-icon pending" />;
      default:
        return <HiOutlineExclamationCircle className="status-icon unknown" />;
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="documents-empty">
        <HiOutlineDocumentText size={40} />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`document-list ${layout}`}>
      {documents.map((doc, index) => (
        <div key={doc._id || index} className="document-item">
          {/* Thumbnail / Icon */}
          <div className="document-preview">
            {doc.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img src={doc.fileUrl} alt={doc.fileName} className="preview-image" />
            ) : (
              <div className="preview-icon">{getDocumentIcon(doc)}</div>
            )}
            {doc.status && (
              <div className="status-overlay">{getStatusIcon(doc.status)}</div>
            )}
          </div>

          {/* Document Info */}
          <div className="document-info">
            <div className="document-title">{getDocumentLabel(doc)}</div>
            {doc.fileName && doc.fileName !== doc.type && (
              <div className="document-filename" title={doc.fileName}>
                {doc.fileName}
              </div>
            )}
            <div className="document-meta">
              {doc.uploadedAt && (
                <span className="meta-item">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </span>
              )}
              {doc.status && <StatusBadge status={doc.status} size="sm" />}
            </div>
          </div>

          {/* Actions */}
          <div className="document-actions">
            {onView && (
              <button
                className="action-btn view"
                onClick={() => onView(doc)}
                title="View document"
              >
                <HiOutlineEye />
              </button>
            )}
            {doc.fileUrl && (
              <a
                href={doc.fileUrl}
                download={doc.fileName}
                className="action-btn download"
                title="Download"
                onClick={(e) => e.stopPropagation()}
              >
                <HiOutlineDownload />
              </a>
            )}
            {onApprove && doc.status === 'pending' && (
              <button
                className="action-btn approve"
                onClick={() => onApprove(doc)}
                title="Approve"
              >
                <HiOutlineCheckCircle />
              </button>
            )}
            {onReject && doc.status === 'pending' && (
              <button
                className="action-btn reject"
                onClick={() => onReject(doc)}
                title="Reject"
              >
                <HiOutlineXCircle />
              </button>
            )}
          </div>
        </div>
      ))}

      <style>{`
        .document-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .document-list.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .document-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          transition: all 0.15s;
        }

        .document-item:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .document-preview {
          position: relative;
          flex-shrink: 0;
          width: 56px;
          height: 56px;
          border-radius: 8px;
          overflow: hidden;
          background: #f3f4f6;
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #6b7280;
        }

        .status-overlay {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .status-icon {
          font-size: 18px;
        }

        .status-icon.verified {
          color: #10b981;
        }

        .status-icon.rejected {
          color: #ef4444;
        }

        .status-icon.pending {
          color: #f59e0b;
        }

        .status-icon.unknown {
          color: #6b7280;
        }

        .document-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .document-title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .document-filename {
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .document-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .meta-item {
          font-size: 11px;
          color: #9ca3af;
        }

        .document-actions {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        .action-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.15s;
          text-decoration: none;
        }

        .action-btn:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .action-btn.view:hover {
          color: #2563eb;
          border-color: #bfdbfe;
          background: #eff6ff;
        }

        .action-btn.download:hover {
          color: #059669;
          border-color: #a7f3d0;
          background: #d1fae5;
        }

        .action-btn.approve {
          color: #10b981;
        }

        .action-btn.approve:hover {
          border-color: #a7f3d0;
          background: #d1fae5;
        }

        .action-btn.reject {
          color: #ef4444;
        }

        .action-btn.reject:hover {
          border-color: #fecaca;
          background: #fee2e2;
        }

        .documents-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #9ca3af;
          text-align: center;
        }

        .documents-empty p {
          margin: 12px 0 0 0;
          font-size: 14px;
        }

        @media (max-width: 640px) {
          .document-list.grid {
            grid-template-columns: 1fr;
          }
          
          .document-preview {
            width: 48px;
            height: 48px;
          }
          
          .action-btn {
            width: 30px;
            height: 30px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default DocumentList;
