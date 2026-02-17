import { useState, useEffect } from 'react';
import { HiOutlineX, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamation } from 'react-icons/hi';
import type { VerificationDecision } from './types';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (decision: VerificationDecision) => void;
  title: string;
  entityName?: string;
  defaultDecision?: 'approve' | 'reject';
  isLoading?: boolean;
}

export const VerificationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  entityName,
  defaultDecision,
  isLoading = false,
}: VerificationModalProps) => {
  const [decision, setDecision] = useState<'approve' | 'reject'>(defaultDecision || 'approve');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens or defaultDecision changes
  useEffect(() => {
    if (isOpen) {
      setDecision(defaultDecision || 'approve');
      setNotes('');
      setError('');
    }
  }, [isOpen, defaultDecision]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (decision === 'reject' && !notes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    setError('');
    onConfirm({ decision, notes: notes.trim() || undefined });
  };

  const handleClose = () => {
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn-close" onClick={handleClose} disabled={isLoading}>
            <HiOutlineX />
          </button>
        </div>

        <div className="modal-body">
          {entityName && (
            <div className="entity-info">
              <span className="label">For:</span>
              <span className="value">{entityName}</span>
            </div>
          )}

          <div className="decision-options">
            <label className={`decision-option ${decision === 'approve' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="decision"
                value="approve"
                checked={decision === 'approve'}
                onChange={() => setDecision('approve')}
                disabled={isLoading}
              />
              <div className="option-icon approve">
                <HiOutlineCheckCircle />
              </div>
              <div className="option-content">
                <span className="option-title">Approve</span>
                <span className="option-description">Mark as verified and approved</span>
              </div>
            </label>

            <label className={`decision-option ${decision === 'reject' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="decision"
                value="reject"
                checked={decision === 'reject'}
                onChange={() => setDecision('reject')}
                disabled={isLoading}
              />
              <div className="option-icon reject">
                <HiOutlineXCircle />
              </div>
              <div className="option-content">
                <span className="option-title">Reject</span>
                <span className="option-description">Request re-upload or deny</span>
              </div>
            </label>
          </div>

          <div className="notes-section">
            <label htmlFor="notes">
              {decision === 'reject' ? 'Rejection Reason *' : 'Notes (Optional)'}
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                decision === 'reject'
                  ? 'Please explain why this is being rejected...'
                  : 'Add any additional notes...'
              }
              rows={4}
              disabled={isLoading}
            />
            {error && (
              <div className="error-message">
                <HiOutlineExclamation /> {error}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={handleClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className={`btn-confirm ${decision}`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Processing...
              </>
            ) : decision === 'approve' ? (
              <>
                <HiOutlineCheckCircle /> Approve
              </>
            ) : (
              <>
                <HiOutlineXCircle /> Reject
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 480px;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .btn-close {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s;
        }

        .btn-close:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .modal-body {
          padding: 20px;
        }

        .entity-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .entity-info .label {
          font-size: 13px;
          color: #6b7280;
        }

        .entity-info .value {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }

        .decision-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .decision-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .decision-option:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .decision-option.selected {
          border-color: #2563eb;
          background: #eff6ff;
        }

        .decision-option input {
          display: none;
        }

        .option-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          font-size: 20px;
        }

        .option-icon.approve {
          background: #d1fae5;
          color: #059669;
        }

        .option-icon.reject {
          background: #fee2e2;
          color: #dc2626;
        }

        .option-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .option-title {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
        }

        .option-description {
          font-size: 13px;
          color: #6b7280;
        }

        .notes-section label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .notes-section textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          resize: vertical;
          font-family: inherit;
          transition: border-color 0.15s;
        }

        .notes-section textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          font-size: 13px;
          color: #dc2626;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .btn-cancel, .btn-confirm {
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

        .btn-cancel {
          background: white;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .btn-confirm.approve {
          background: #10b981;
          color: white;
        }

        .btn-confirm.approve:hover:not(:disabled) {
          background: #059669;
        }

        .btn-confirm.reject {
          background: #ef4444;
          color: white;
        }

        .btn-confirm.reject:hover:not(:disabled) {
          background: #dc2626;
        }

        .btn-cancel:disabled, .btn-confirm:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .modal-container {
            margin: 0 10px;
          }
          
          .decision-option {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default VerificationModal;
