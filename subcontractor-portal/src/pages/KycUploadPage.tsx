import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { scApi } from "../api";
import toast from "react-hot-toast";

interface KycDocument {
  type: string;
  label: string;
  description: string;
  required: boolean;
  uploaded?: boolean;
  url?: string;
  status?: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
}

const KYC_DOCUMENTS: KycDocument[] = [
  {
    type: "panCard",
    label: "PAN Card",
    description: "Upload clear copy of your company/proprietor PAN card",
    required: true,
  },
  {
    type: "aadhaarCard",
    label: "Aadhaar Card",
    description:
      "Upload front and back of Aadhaar card (for proprietor/director)",
    required: true,
  },
  {
    type: "gstCertificate",
    label: "GST Certificate",
    description: "Upload GST registration certificate",
    required: true,
  },
  {
    type: "cancelledCheque",
    label: "Cancelled Cheque",
    description: "Upload a cancelled cheque for bank account verification",
    required: true,
  },
  {
    type: "incorporationCertificate",
    label: "Certificate of Incorporation",
    description: "Required for Pvt Ltd, LLP, or Partnership firms",
    required: false,
  },
  {
    type: "bankStatement",
    label: "Bank Statement (6 months)",
    description: "Last 6 months bank statement for financial assessment",
    required: false,
  },
];

const KycUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<{
    overall: string;
    documents: Record<
      string,
      {
        uploaded: boolean;
        url?: string;
        status?: string;
        rejectionReason?: string;
      }
    >;
    bankDetailsVerified: boolean;
  } | null>(null);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    accountHolderName: "",
  });
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    loadKycStatus();
  }, []);

  const loadKycStatus = async () => {
    try {
      const res = await scApi.getKycStatus();
      setKycStatus(res.data);

      if (res.data.bankDetails) {
        setBankDetails({
          accountNumber: res.data.bankDetails.accountNumber || "",
          ifscCode: res.data.bankDetails.ifscCode || "",
          bankName: res.data.bankDetails.bankName || "",
          branchName: res.data.bankDetails.branchName || "",
          accountHolderName: res.data.bankDetails.accountHolderName || "",
        });
      }
    } catch (err) {
      toast.error("Failed to load KYC status");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (docType: string, file: File) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or PDF files are allowed");
      return;
    }

    setUploading(docType);
    try {
      const formData = new FormData();
      formData.append("document", file);

      await scApi.uploadKycDocument(docType, formData);
      toast.success("Document uploaded successfully!");
      loadKycStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !bankDetails.accountNumber ||
      !bankDetails.ifscCode ||
      !bankDetails.bankName
    ) {
      toast.error("Please fill all required bank details");
      return;
    }

    setSavingBank(true);
    try {
      await scApi.updateBankDetails(bankDetails);
      toast.success("Bank details saved!");
      loadKycStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save bank details");
    } finally {
      setSavingBank(false);
    }
  };

  const getDocumentStatus = (docType: string) => {
    const doc = kycStatus?.documents?.[docType];
    if (!doc || !doc.uploaded) return "NOT_UPLOADED";
    return doc.status || "PENDING";
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      NOT_UPLOADED: { class: "badge-gray", label: "Not Uploaded" },
      PENDING: { class: "badge-yellow", label: "Pending Review" },
      VERIFIED: { class: "badge-green", label: "Verified" },
      REJECTED: { class: "badge-red", label: "Rejected" },
    };
    const badge = badges[status] || badges.NOT_UPLOADED;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  const calculateProgress = () => {
    const requiredDocs = KYC_DOCUMENTS.filter((d) => d.required);
    const uploadedRequired = requiredDocs.filter(
      (d) => getDocumentStatus(d.type) !== "NOT_UPLOADED",
    ).length;
    const verifiedRequired = requiredDocs.filter(
      (d) => getDocumentStatus(d.type) === "VERIFIED",
    ).length;

    return {
      uploaded: Math.round((uploadedRequired / requiredDocs.length) * 100),
      verified: Math.round((verifiedRequired / requiredDocs.length) * 100),
    };
  };

  if (loading) {
    return <div className="page-loading">Loading KYC status...</div>;
  }

  const progress = calculateProgress();

  return (
    <div className="kyc-page">
      <div className="kyc-header">
        <h1>KYC Document Upload</h1>
        <p>Complete your Know Your Customer (KYC) verification</p>
      </div>

      {/* Progress Bar */}
      <div className="kyc-progress">
        <div className="progress-info">
          <span>Documents Uploaded: {progress.uploaded}%</span>
          <span>Documents Verified: {progress.verified}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill uploaded"
            style={{ width: `${progress.uploaded}%` }}
          ></div>
          <div
            className="progress-fill verified"
            style={{ width: `${progress.verified}%` }}
          ></div>
        </div>
        {kycStatus?.overall === "VERIFIED" && (
          <div className="kyc-complete-notice">
            <span className="notice-icon">✓</span>
            <span>KYC Verification Complete! You can now submit CWCRF.</span>
          </div>
        )}
      </div>

      {/* Document Upload Section */}
      <div className="kyc-section">
        <h2>Required Documents</h2>
        <div className="documents-grid">
          {KYC_DOCUMENTS.filter((d) => d.required).map((doc) => {
            const status = getDocumentStatus(doc.type);
            const docData = kycStatus?.documents?.[doc.type];

            return (
              <div
                key={doc.type}
                className={`document-card ${status.toLowerCase()}`}
              >
                <div className="doc-header">
                  <h4>{doc.label}</h4>
                  {getStatusBadge(status)}
                </div>
                <p className="doc-description">{doc.description}</p>

                {status === "REJECTED" && docData?.rejectionReason && (
                  <div className="rejection-reason">
                    <strong>Rejection Reason:</strong> {docData.rejectionReason}
                  </div>
                )}

                {docData?.url && (
                  <div className="doc-preview">
                    <a
                      href={docData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Uploaded Document
                    </a>
                  </div>
                )}

                <div className="doc-upload">
                  <label className="upload-btn">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(doc.type, file);
                      }}
                      disabled={uploading === doc.type}
                    />
                    {uploading === doc.type
                      ? "Uploading..."
                      : status === "NOT_UPLOADED"
                        ? "Upload"
                        : "Re-upload"}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional Documents */}
      <div className="kyc-section">
        <h2>Optional Documents</h2>
        <p className="section-note">
          These documents may speed up your verification process
        </p>
        <div className="documents-grid">
          {KYC_DOCUMENTS.filter((d) => !d.required).map((doc) => {
            const status = getDocumentStatus(doc.type);
            const docData = kycStatus?.documents?.[doc.type];

            return (
              <div
                key={doc.type}
                className={`document-card ${status.toLowerCase()}`}
              >
                <div className="doc-header">
                  <h4>{doc.label}</h4>
                  {getStatusBadge(status)}
                </div>
                <p className="doc-description">{doc.description}</p>

                {docData?.url && (
                  <div className="doc-preview">
                    <a
                      href={docData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Uploaded Document
                    </a>
                  </div>
                )}

                <div className="doc-upload">
                  <label className="upload-btn">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(doc.type, file);
                      }}
                      disabled={uploading === doc.type}
                    />
                    {uploading === doc.type
                      ? "Uploading..."
                      : status === "NOT_UPLOADED"
                        ? "Upload"
                        : "Re-upload"}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="kyc-section">
        <h2>Bank Account Details</h2>
        <p className="section-note">
          Provide your bank account for fund disbursement
        </p>

        <form onSubmit={handleSaveBankDetails} className="bank-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Account Holder Name *</label>
              <input
                type="text"
                value={bankDetails.accountHolderName}
                onChange={(e) =>
                  setBankDetails((prev) => ({
                    ...prev,
                    accountHolderName: e.target.value,
                  }))
                }
                placeholder="Name as per bank records"
                required
              />
            </div>
            <div className="form-group">
              <label>Account Number *</label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) =>
                  setBankDetails((prev) => ({
                    ...prev,
                    accountNumber: e.target.value,
                  }))
                }
                placeholder="Enter account number"
                required
              />
            </div>
            <div className="form-group">
              <label>IFSC Code *</label>
              <input
                type="text"
                value={bankDetails.ifscCode}
                onChange={(e) =>
                  setBankDetails((prev) => ({
                    ...prev,
                    ifscCode: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="e.g., HDFC0001234"
                maxLength={11}
                required
              />
            </div>
            <div className="form-group">
              <label>Bank Name *</label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) =>
                  setBankDetails((prev) => ({
                    ...prev,
                    bankName: e.target.value,
                  }))
                }
                placeholder="Enter bank name"
                required
              />
            </div>
            <div className="form-group">
              <label>Branch Name</label>
              <input
                type="text"
                value={bankDetails.branchName}
                onChange={(e) =>
                  setBankDetails((prev) => ({
                    ...prev,
                    branchName: e.target.value,
                  }))
                }
                placeholder="Enter branch name"
              />
            </div>
          </div>

          <div className="bank-status">
            {kycStatus?.bankDetailsVerified ? (
              <span className="badge badge-green">✓ Bank Details Verified</span>
            ) : bankDetails.accountNumber ? (
              <span className="badge badge-yellow">Pending Verification</span>
            ) : (
              <span className="badge badge-gray">Not Submitted</span>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={savingBank}>
              {savingBank ? "Saving..." : "Save Bank Details"}
            </button>
          </div>
        </form>
      </div>

      {/* Navigation */}
      <div className="kyc-actions">
        <button onClick={() => navigate("/")} className="btn-secondary">
          Back to Dashboard
        </button>
        {kycStatus?.overall === "VERIFIED" &&
          kycStatus?.bankDetailsVerified && (
            <button onClick={() => navigate("/cwcrf")} className="btn-primary">
              Proceed to Submit CWCRF →
            </button>
          )}
      </div>
    </div>
  );
};

export default KycUploadPage;
