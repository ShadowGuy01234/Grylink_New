import React from "react";
import { motion } from "framer-motion";
import { Document, CompanyProfile } from "../../types";

interface DocumentsSectionProps {
  profile: CompanyProfile | null;
  uploadingDoc: string | null;
  onUpload: (docType: string, file: File) => void;
}

const DOCUMENT_TYPES = [
  { key: "CIN", label: "CIN Certificate", required: true },
  { key: "GST", label: "GST Certificate", required: true },
  { key: "PAN", label: "PAN Card", required: true },
  {
    key: "BOARD_RESOLUTION",
    label: "Board Resolution",
    required: true,
  },
  {
    key: "BANK_STATEMENTS",
    label: "Bank Statements (12 months)",
    required: true,
  },
  {
    key: "AUDITED_FINANCIALS",
    label: "Audited Financials (2 years)",
    required: true,
  },
  {
    key: "PROJECT_DETAILS",
    label: "Project Details",
    required: false,
  },
  {
    key: "CASHFLOW_DETAILS",
    label: "Cash-flow Details",
    required: false,
  },
];

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  profile,
  uploadingDoc,
  onUpload,
}) => {
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  const getDocumentStatus = (docType: string): Document | null => {
    // @ts-ignore - profile might not match exact shape yet during refactor
    const doc = profile?.documents?.find(
      (d: any) => d.documentType === docType,
    );
    return doc || null;
  };

  const handleFileClick = (docType: string) => {
    fileInputRefs.current[docType]?.click();
  };

  const handleFileChange = (
    docType: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(docType, file);
    }
  };

  return (
    <motion.div
      key="documents"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="section"
    >
      <div className="section-header">
        <div>
          <h2>Company Documents</h2>
          <p className="section-subtitle">
            Upload all required documents to proceed with verification
          </p>
        </div>
        <div className="docs-progress-badge">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          {/* @ts-ignore */}
          {profile?.documents?.length || 0}/
          {DOCUMENT_TYPES.filter((d) => d.required).length} Required
        </div>
      </div>

      <div className="documents-grid">
        {DOCUMENT_TYPES.map((docType, index) => {
          const existingDoc = getDocumentStatus(docType.key);
          const isUploading = uploadingDoc === docType.key;

          return (
            <motion.div
              key={docType.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`document-card ${existingDoc ? "uploaded" : ""} ${existingDoc?.status === "verified" ? "verified" : ""} ${existingDoc?.status === "rejected" ? "rejected" : ""}`}
            >
              <div className="document-card-icon">
                {existingDoc?.status === "verified" ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--success)"
                    strokeWidth="2.5"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ) : existingDoc?.status === "rejected" ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--danger)"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                ) : existingDoc ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--warning)"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-muted)"
                    strokeWidth="1.5"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                )}
              </div>
              <div className="document-card-content">
                <div className="document-card-header">
                  <h3 className="document-title">{docType.label}</h3>
                  <div className="document-badges">
                    {docType.required && !existingDoc && (
                      <span className="badge badge-red">Required</span>
                    )}
                    {existingDoc && (
                      <span
                        className={`badge ${existingDoc.status === "verified" ? "badge-green" : existingDoc.status === "rejected" ? "badge-red" : "badge-yellow"}`}
                      >
                        {existingDoc.status === "verified" && "Verified"}
                        {existingDoc.status === "rejected" && "Rejected"}
                        {existingDoc.status === "pending" && "Pending"}
                      </span>
                    )}
                  </div>
                </div>
                {existingDoc && existingDoc.fileName && (
                  <p className="document-filename">{existingDoc.fileName}</p>
                )}
                {/* Rejection notes */}
                {existingDoc?.status === "rejected" &&
                  existingDoc.verificationNotes && (
                    <div className="rejection-note">
                      <strong>Reason:</strong> {existingDoc.verificationNotes}
                    </div>
                  )}
              </div>
              <div className="document-card-actions">
                {existingDoc ? (
                  <>
                    <button
                      onClick={() => {
                        if (!existingDoc.fileUrl) {
                          alert(
                            "Document URL is missing. Please re-upload the document.",
                          );
                          return;
                        }
                        window.open(existingDoc.fileUrl, "_blank");
                      }}
                      className="btn-icon"
                      title="View Document"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    {existingDoc.status === "rejected" && (
                      <div className="upload-wrapper">
                        <input
                          type="file"
                          ref={(el) => {
                            fileInputRefs.current[docType.key] = el;
                          }}
                          onChange={(e) => handleFileChange(docType.key, e)}
                          style={{ display: "none" }}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <button
                          onClick={() => handleFileClick(docType.key)}
                          className="btn-text"
                          disabled={isUploading}
                        >
                          {isUploading ? "Uploading..." : "Re-upload"}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="upload-wrapper">
                    <input
                      type="file"
                      ref={(el) => {
                        fileInputRefs.current[docType.key] = el;
                      }}
                      onChange={(e) => handleFileChange(docType.key, e)}
                      style={{ display: "none" }}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <button
                      onClick={() => handleFileClick(docType.key)}
                      className="btn-primary-sm"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <span className="spinner-sm"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          Upload
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export { DOCUMENT_TYPES };
