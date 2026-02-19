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
  { key: "BOARD_RESOLUTION", label: "Board Resolution", required: true },
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
  { key: "PROJECT_DETAILS", label: "Project Details", required: false },
  { key: "CASHFLOW_DETAILS", label: "Cash-flow Details", required: false },
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl"
    >
      <div className="grid gap-4">
        {DOCUMENT_TYPES.map((docType) => {
          const doc = getDocumentStatus(docType.key);
          const isUploaded = !!doc;
          const isVerified = doc?.status === "verified";
          const isRejected = doc?.status === "rejected";
          const isPending = isUploaded && !isVerified && !isRejected;

          return (
            <motion.div
              key={docType.key}
              layout
              className={`doc-card ${
                isVerified ? "border-emerald-200 bg-emerald-50/30" : ""
              }`}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  isVerified
                    ? "bg-emerald-100 text-emerald-600"
                    : isRejected
                      ? "bg-red-100 text-red-600"
                      : isUploaded
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-slate-100 text-slate-400"
                }`}
              >
                {isVerified ? "✓" : isRejected ? "!" : isUploaded ? "📄" : "☁️"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-slate-800">
                    {docType.label}
                  </h3>
                  {docType.required && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      REQUIRED
                    </span>
                  )}

                  {isVerified && (
                    <span className="doc-status-badge doc-status-verified">
                      Verified
                    </span>
                  )}
                  {isRejected && (
                    <span className="doc-status-badge doc-status-rejected">
                      Rejected
                    </span>
                  )}
                  {isPending && (
                    <span className="doc-status-badge doc-status-pending">
                      Pending Review
                    </span>
                  )}
                </div>

                {isUploaded ? (
                  <div className="text-sm text-slate-500">
                    <p className="flex items-center gap-2">
                      <span className="truncate max-w-xs">{doc?.fileName}</span>
                      <span className="text-slate-300">•</span>
                      <span>
                        Uploaded on{" "}
                        {doc?.uploadedAt
                          ? new Date(doc.uploadedAt).toLocaleDateString()
                          : "Unknown date"}
                      </span>
                    </p>
                    {isRejected && doc?.verificationNotes && (
                      <p className="text-red-500 text-xs mt-1 font-medium">
                        Reason: {doc.verificationNotes}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    Please upload this document to proceed
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {isUploaded && doc?.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View Document"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      ></path>
                    </svg>
                  </a>
                )}

                <input
                  type="file"
                  ref={(el) => {
                    fileInputRefs.current[docType.key] = el;
                  }}
                  className="hidden"
                  onChange={(e) => handleFileChange(docType.key, e)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                />

                {!isVerified && (
                  <button
                    onClick={() => handleFileClick(docType.key)}
                    disabled={uploadingDoc === docType.key}
                    className="btn-secondary text-sm py-2 px-4 shadow-sm min-w-[100px]"
                  >
                    {uploadingDoc === docType.key
                      ? "Uploading..."
                      : isUploaded
                        ? "Re-upload"
                        : "Upload"}
                  </button>
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
