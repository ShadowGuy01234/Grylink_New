import React, { useState, useEffect, useRef } from "react";
import { companyApi, casesApi, bidsApi } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

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

const DashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [subContractors, setSubContractors] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("documents");

  // Document upload state
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Sub-contractor state
  const [showAddSC, setShowAddSC] = useState(false);
  const [scForm, setScForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
  });
  const [addingSC, setAddingSC] = useState(false);

  // Bid state
  const [bidModal, setBidModal] = useState<any>(null);
  const [bidForm, setBidForm] = useState({
    bidAmount: "",
    fundingDurationDays: "",
  });

  // Negotiation state
  const [negotiatingBid, setNegotiatingBid] = useState<string | null>(null);
  const [counterOffer, setCounterOffer] = useState({
    amount: "",
    duration: "",
    message: "",
  });

  // Helper to open PDF documents properly (fetches and opens with correct MIME type)
  const openPdfDocument = async (url: string, fileName: string) => {
    try {
      toast.loading("Loading document...", { id: "pdf-load" });
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      toast.dismiss("pdf-load");
      window.open(blobUrl, "_blank");
      // Clean up blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      toast.dismiss("pdf-load");
      toast.error("Failed to load document. Downloading instead...");
      // Fallback: download the file
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "document.pdf";
      a.click();
    }
  };

  const fetchData = async () => {
    try {
      const promises: Promise<any>[] = [
        companyApi.getProfile(),
        companyApi.getSubContractors(),
        casesApi.getCases(),
        bidsApi.getMyBids(),
      ];
      const [profileRes, scRes, casesRes, bidsRes] =
        await Promise.all(promises);
      setProfile(profileRes.data);
      setSubContractors(scRes.data);
      setCases(casesRes.data);
      setMyBids(bidsRes.data || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadSingleDoc = async (docType: string, file: File) => {
    setUploadingDoc(docType);
    try {
      const formData = new FormData();
      formData.append("documents", file);
      formData.append("documentTypes", JSON.stringify([docType]));
      await companyApi.uploadDocuments(formData);
      toast.success(`${docType.replace(/_/g, " ")} uploaded successfully!`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploadingDoc(null);
    }
  };

  const getDocumentStatus = (docType: string) => {
    const doc = profile?.documents?.find(
      (d: any) => d.documentType === docType,
    );
    return doc || null;
  };

  const handleAddSC = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingSC(true);
    try {
      await companyApi.addSubContractors([scForm]);
      toast.success("Sub-contractor added!");
      setShowAddSC(false);
      setScForm({ companyName: "", contactName: "", email: "", phone: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add");
    } finally {
      setAddingSC(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await companyApi.bulkAddSubContractors(formData);
      toast.success(`Added ${res.data.created?.length || 0} sub-contractors`);
      if (res.data.errors?.length)
        toast.error(`${res.data.errors.length} rows had errors`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Bulk upload failed");
    }
  };

  // Download Excel template for bulk sub-contractor upload
  const downloadTemplate = () => {
    const templateData = [
      {
        companyName: "Example Pvt Ltd",
        contactName: "John Doe",
        email: "john@example.com",
        phone: "9876543210",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    // Set column widths
    ws["!cols"] = [
      { wch: 25 }, // companyName
      { wch: 25 }, // contactName
      { wch: 30 }, // email
      { wch: 15 }, // phone
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sub-Contractors");
    XLSX.writeFile(wb, "subcontractor_template.xlsx");
    toast.success("Template downloaded! Fill it and upload.");
  };

  const handleReviewCase = async (caseId: string, decision: string) => {
    try {
      await casesApi.reviewCase(caseId, { decision });
      toast.success(`Case ${decision === "approve" ? "approved" : "rejected"}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Review failed");
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bidsApi.placeBid({
        caseId: bidModal._id,
        bidAmount: Number(bidForm.bidAmount),
        fundingDurationDays: Number(bidForm.fundingDurationDays),
      });
      toast.success("Bid placed!");
      setBidModal(null);
      setBidForm({ bidAmount: "", fundingDurationDays: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Bid failed");
    }
  };

  const handleNegotiate = async (bidId: string) => {
    try {
      await bidsApi.negotiate(bidId, {
        amount: parseFloat(counterOffer.amount),
        duration: parseInt(counterOffer.duration) || undefined,
        message: counterOffer.message,
      });
      toast.success("Counter-offer sent!");
      setNegotiatingBid(null);
      setCounterOffer({ amount: "", duration: "", message: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Negotiation failed");
    }
  };

  const handleLockBid = async (bidId: string) => {
    if (
      !confirm(
        "Are you sure you want to lock this commercial agreement? This action cannot be undone.",
      )
    )
      return;
    try {
      await bidsApi.lockBid(bidId);
      toast.success("Commercial agreement locked!");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Lock failed");
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      LEAD_CREATED: "badge-yellow",
      CREDENTIALS_CREATED: "badge-blue",
      DOCS_SUBMITTED: "badge-purple",
      ACTION_REQUIRED: "badge-red",
      ACTIVE: "badge-green",
      pending: "badge-yellow",
      verified: "badge-green",
      rejected: "badge-red",
      READY_FOR_COMPANY_REVIEW: "badge-purple",
      EPC_VERIFIED: "badge-green",
      BID_PLACED: "badge-blue",
      COMMERCIAL_LOCKED: "badge-green",
      NEGOTIATION_IN_PROGRESS: "badge-yellow",
      SUBMITTED: "badge-blue",
      ACCEPTED: "badge-green",
      REJECTED: "badge-red",
    };
    return (
      <span className={`badge ${colors[status] || "badge-gray"}`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  const isEpc = user?.role === "epc";
  const isNbfc = user?.role === "nbfc";
  const activeBids = myBids.filter((b: any) =>
    ["SUBMITTED", "NEGOTIATION_IN_PROGRESS"].includes(b.status),
  );

  // Check if all required documents are verified - blocks other tabs until Ops team verifies
  const requiredDocTypes = DOCUMENT_TYPES.filter((d) => d.required).map(
    (d) => d.key,
  );
  const verifiedDocs =
    profile?.documents?.filter((d: any) => d.status === "verified") || [];
  const verifiedDocTypes = verifiedDocs.map((d: any) => d.documentType);
  const areDocsVerified = requiredDocTypes.every((dt) =>
    verifiedDocTypes.includes(dt),
  );
  const pendingVerification =
    profile?.company?.status === "DOCS_SUBMITTED" && !areDocsVerified;

  // Stats for dashboard
  const uploadedDocsCount = profile?.documents?.length || 0;
  const verifiedDocsCount = verifiedDocs.length;
  const pendingCasesCount = cases.filter(
    (c: any) => c.status === "PENDING_EPC_APPROVAL",
  ).length;

  if (loading)
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        Loading dashboard...
      </div>
    );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="dashboard-page"
      style={{ minHeight: "100vh", padding: "2rem" }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div className="dashboard-header">
          <h1>{profile?.company?.companyName || "Partner Dashboard"}</h1>
          <div className="subtitle">
            {isEpc ? "EPC" : "NBFC"} Portal{" "}
            {profile?.company?.status && statusBadge(profile?.company?.status)}
          </div>
        </div>

        {/* Stats Cards */}
        {isEpc && (
          <motion.div
            className="stats-grid"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={cardVariant} className="stat-card">
              <div className="stat-icon blue">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="stat-label">Documents Uploaded</div>
              <div className="stat-value">{uploadedDocsCount}</div>
            </motion.div>
            <motion.div variants={cardVariant} className="stat-card">
              <div className="stat-icon green">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="stat-label">Verified</div>
              <div className="stat-value">{verifiedDocsCount}</div>
            </motion.div>
            <motion.div variants={cardVariant} className="stat-card">
              <div className="stat-icon purple">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="stat-label">Sub-Contractors</div>
              <div className="stat-value">{subContractors.length}</div>
            </motion.div>
            <motion.div variants={cardVariant} className="stat-card">
              <div className="stat-icon orange">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <div className="stat-label">Pending Cases</div>
              <div className="stat-value">{pendingCasesCount}</div>
            </motion.div>
          </motion.div>
        )}

        {/* Pending Verification Notice */}
        {pendingVerification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="alert-banner"
          >
            <span className="alert-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <div className="alert-content">
              <h3>Documents Pending Verification</h3>
              <p>
                Your documents are being reviewed by our Ops team. Other
                sections will be unlocked once verification is complete.
              </p>
            </div>
          </motion.div>
        )}

        {/* Modern Tabs */}
        <div className="tabs-container">
          {isEpc && (
            <button
              onClick={() => setActiveTab("documents")}
              className={`tab ${activeTab === "documents" ? "active" : ""}`}
            >
              <span className="tab-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </span>
              Documents
            </button>
          )}
          {isEpc && (
            <button
              onClick={() => areDocsVerified && setActiveTab("subcontractors")}
              disabled={!areDocsVerified}
              className={`tab ${activeTab === "subcontractors" ? "active" : ""}`}
              title={
                !areDocsVerified
                  ? "Complete document verification to unlock"
                  : ""
              }
            >
              <span className="tab-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              Sub-Contractors
              {!areDocsVerified && (
                <svg
                  className="lock-icon"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
            </button>
          )}
          <button
            onClick={() => (areDocsVerified || isNbfc) && setActiveTab("cases")}
            disabled={isEpc && !areDocsVerified}
            className={`tab ${activeTab === "cases" ? "active" : ""}`}
            title={
              isEpc && !areDocsVerified
                ? "Complete document verification to unlock"
                : ""
            }
          >
            <span className="tab-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </span>
            Cases & Bills
            {isEpc && !areDocsVerified && (
              <svg
                className="lock-icon"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
          </button>
          <button
            onClick={() => (areDocsVerified || isNbfc) && setActiveTab("bids")}
            disabled={isEpc && !areDocsVerified}
            className={`tab ${activeTab === "bids" ? "active" : ""}`}
            title={
              isEpc && !areDocsVerified
                ? "Complete document verification to unlock"
                : ""
            }
          >
            <span className="tab-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
            My Bids
            {isEpc && !areDocsVerified && (
              <svg
                className="lock-icon"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
            {activeBids.length > 0 && (areDocsVerified || isNbfc) && (
              <span className="tab-badge">{activeBids.length}</span>
            )}
          </button>
        </div>

        {/* Tab Content with Animation */}
        <AnimatePresence mode="wait">
          {/* Documents Tab (EPC only) */}
          {activeTab === "documents" && isEpc && (
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
                                className={`badge ${
                                  existingDoc.status === "verified"
                                    ? "badge-green"
                                    : existingDoc.status === "rejected"
                                      ? "badge-red"
                                      : "badge-yellow"
                                }`}
                              >
                                {existingDoc.status === "verified" &&
                                  "Verified"}
                                {existingDoc.status === "rejected" &&
                                  "Rejected"}
                                {existingDoc.status === "pending" && "Pending"}
                              </span>
                            )}
                          </div>
                        </div>
                        {existingDoc && existingDoc.fileName && (
                          <p className="document-filename">
                            {existingDoc.fileName}
                          </p>
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
                                const isPdf = existingDoc.fileName
                                  ?.toLowerCase()
                                  .endsWith(".pdf");
                                if (isPdf) {
                                  openPdfDocument(
                                    existingDoc.fileUrl,
                                    existingDoc.fileName,
                                  );
                                } else {
                                  window.open(existingDoc.fileUrl, "_blank");
                                }
                              }}
                              className="btn-icon"
                              disabled={!existingDoc.fileUrl}
                              title="View document"
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
                            <button
                              onClick={() =>
                                fileInputRefs.current[docType.key]?.click()
                              }
                              className="btn-icon"
                              disabled={isUploading}
                              title="Replace document"
                            >
                              {isUploading ? (
                                <span className="spinner-small" />
                              ) : (
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="17 8 12 3 7 8" />
                                  <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                              )}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              fileInputRefs.current[docType.key]?.click()
                            }
                            disabled={isUploading}
                            className="btn-upload"
                          >
                            {isUploading ? (
                              <>
                                <span className="spinner-small" />
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
                        )}
                      </div>

                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[docType.key] = el;
                        }}
                        style={{ display: "none" }}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadSingleDoc(docType.key, file);
                          e.target.value = "";
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="progress-card"
              >
                <div className="progress-header">
                  <div className="progress-info">
                    <span className="progress-label">
                      Verification Progress
                    </span>
                    <span className="progress-text">
                      {profile?.documents?.length || 0} of{" "}
                      {DOCUMENT_TYPES.filter((d) => d.required).length} Required
                      Documents Uploaded
                    </span>
                  </div>
                  <div className="progress-percentage">
                    {Math.round(
                      ((profile?.documents?.length || 0) /
                        DOCUMENT_TYPES.filter((d) => d.required).length) *
                        100,
                    )}
                    %
                  </div>
                </div>
                <div className="progress-bar-container">
                  <motion.div
                    className="progress-bar-fill"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((profile?.documents?.length || 0) / DOCUMENT_TYPES.filter((d) => d.required).length) * 100}%`,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Sub-Contractors Tab (EPC only) */}
          {activeTab === "subcontractors" && isEpc && (
            <motion.div
              key="subcontractors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="section"
            >
              <div className="section-header">
                <h2>Sub-Contractors</h2>
                <div className="header-actions">
                  <button
                    onClick={() => setShowAddSC(true)}
                    className="btn-primary"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Sub-Contractor
                  </button>
                  <button onClick={downloadTemplate} className="btn-secondary">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Template
                  </button>
                  <label className="btn-primary upload-label">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Bulk Upload
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      hidden
                    />
                  </label>
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subContractors.map((sc: any) => (
                      <tr key={sc._id}>
                        <td>{sc.companyName || "—"}</td>
                        <td>{sc.contactName || "—"}</td>
                        <td>{sc.email}</td>
                        <td>{sc.phone || "—"}</td>
                        <td>{statusBadge(sc.status)}</td>
                      </tr>
                    ))}
                    {subContractors.length === 0 && (
                      <tr>
                        <td colSpan={5} className="empty-state">
                          <div>
                            <p>No sub-contractors added yet</p>
                            <button
                              onClick={() => setShowAddSC(true)}
                              className="btn-primary btn-sm"
                              style={{ marginTop: "0.5rem" }}
                            >
                              Add Your First Sub-Contractor
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {showAddSC && (
                <div
                  className="modal-overlay"
                  onClick={() => setShowAddSC(false)}
                >
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <h2>Add Sub-Contractor</h2>
                    <form onSubmit={handleAddSC}>
                      <div className="form-group">
                        <label>Company Name</label>
                        <input
                          value={scForm.companyName}
                          onChange={(e) =>
                            setScForm({
                              ...scForm,
                              companyName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Contact Name</label>
                        <input
                          value={scForm.contactName}
                          onChange={(e) =>
                            setScForm({
                              ...scForm,
                              contactName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          Email{" "}
                          <span style={{ color: "var(--danger)" }}>*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={scForm.email}
                          onChange={(e) =>
                            setScForm({ ...scForm, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          value={scForm.phone}
                          onChange={(e) =>
                            setScForm({ ...scForm, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="modal-actions">
                        <button
                          type="button"
                          onClick={() => setShowAddSC(false)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={addingSC}
                          className="btn-primary"
                        >
                          {addingSC ? "Adding..." : "Add Sub-Contractor"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Cases Tab */}
          {activeTab === "cases" && (
            <motion.div
              key="cases"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="section"
            >
              <h2>Cases & Bills</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Case #</th>
                      <th>Sub-Contractor</th>
                      <th>Bill Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((c: any) => (
                      <tr key={c._id}>
                        <td>{c.caseNumber}</td>
                        <td>{c.subContractorId?.companyName || "—"}</td>
                        <td>
                          {c.billId?.amount
                            ? `₹${c.billId.amount.toLocaleString()}`
                            : "—"}
                        </td>
                        <td>{statusBadge(c.status)}</td>
                        <td className="action-buttons">
                          {isEpc && c.status === "READY_FOR_COMPANY_REVIEW" && (
                            <>
                              <button
                                className="btn-sm btn-success"
                                onClick={() =>
                                  handleReviewCase(c._id, "approve")
                                }
                              >
                                Approve
                              </button>
                              <button
                                className="btn-sm btn-danger"
                                onClick={() =>
                                  handleReviewCase(c._id, "reject")
                                }
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {isNbfc && c.status === "EPC_VERIFIED" && (
                            <button
                              className="btn-sm btn-primary"
                              onClick={() => setBidModal(c)}
                            >
                              Place Bid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {cases.length === 0 && (
                      <tr>
                        <td colSpan={5} className="empty-state">
                          No cases yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {bidModal && (
                <div
                  className="modal-overlay"
                  onClick={() => setBidModal(null)}
                >
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <h2>Place Bid — {bidModal.caseNumber}</h2>
                    <form onSubmit={handlePlaceBid}>
                      <div className="form-group">
                        <label>Bid Amount (₹) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={bidForm.bidAmount}
                          onChange={(e) =>
                            setBidForm({
                              ...bidForm,
                              bidAmount: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Funding Duration (days) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={bidForm.fundingDurationDays}
                          onChange={(e) =>
                            setBidForm({
                              ...bidForm,
                              fundingDurationDays: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="modal-actions">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setBidModal(null)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                          Place Bid
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Bids Tab */}
          {activeTab === "bids" && (
            <motion.div
              key="bids"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="section"
            >
              <h2>My Bids</h2>
              <p className="text-secondary" style={{ marginBottom: "1.5rem" }}>
                Track your placed bids and negotiate terms.
              </p>

              <div className="bids-list">
                {myBids.map((bid: any) => (
                  <motion.div
                    key={bid._id}
                    variants={cardVariant}
                    initial="hidden"
                    animate="visible"
                    className="bid-card"
                  >
                    <div className="bid-header">
                      <h3>Case #{bid.caseId?.caseNumber || "N/A"}</h3>
                      {statusBadge(bid.status)}
                    </div>
                    <div className="bid-details">
                      <div className="bid-detail">
                        <span className="label">Sub-Contractor</span>
                        <span className="value">
                          {bid.caseId?.subContractorId?.companyName || "—"}
                        </span>
                      </div>
                      <div className="detail">
                        <span className="label">Bill Amount:</span>
                        <span>
                          ₹
                          {bid.caseId?.billId?.amount?.toLocaleString() ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="detail">
                        <span className="label">Your Bid:</span>
                        <span className="highlight">
                          ₹{bid.bidAmount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="detail">
                        <span className="label">Duration:</span>
                        <span>{bid.fundingDurationDays} days</span>
                      </div>
                    </div>

                    {/* Negotiation history */}
                    {bid.negotiations?.length > 0 && (
                      <div className="negotiations">
                        <h4>Negotiation History</h4>
                        {bid.negotiations.map((n: any, i: number) => (
                          <div
                            key={i}
                            className={`negotiation-item ${n.proposedByRole}`}
                          >
                            <span className="role">
                              {n.proposedByRole === "epc"
                                ? "You"
                                : "Sub-Contractor"}
                            </span>
                            <span>
                              ₹{n.counterAmount?.toLocaleString()} for{" "}
                              {n.counterDuration} days
                            </span>
                            {n.message && (
                              <p className="message">"{n.message}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    {["SUBMITTED", "NEGOTIATION_IN_PROGRESS"].includes(
                      bid.status,
                    ) && (
                      <div className="bid-actions">
                        {negotiatingBid === bid._id ? (
                          <div className="negotiate-form">
                            <h4>Send Counter-Offer</h4>
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Amount (₹)</label>
                                <input
                                  type="number"
                                  value={counterOffer.amount}
                                  onChange={(e) =>
                                    setCounterOffer({
                                      ...counterOffer,
                                      amount: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="form-group">
                                <label>Duration (days)</label>
                                <input
                                  type="number"
                                  value={counterOffer.duration}
                                  onChange={(e) =>
                                    setCounterOffer({
                                      ...counterOffer,
                                      duration: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="form-group full-span">
                                <label>Message</label>
                                <input
                                  value={counterOffer.message}
                                  onChange={(e) =>
                                    setCounterOffer({
                                      ...counterOffer,
                                      message: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="button-group">
                              <button
                                className="btn-primary"
                                onClick={() => handleNegotiate(bid._id)}
                                disabled={!counterOffer.amount}
                              >
                                Send Counter-Offer
                              </button>
                              <button
                                className="btn-secondary"
                                onClick={() => setNegotiatingBid(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="button-group">
                            <button
                              className="btn-warning"
                              onClick={() => setNegotiatingBid(bid._id)}
                            >
                              ↔ Counter-Offer
                            </button>
                            <button
                              className="btn-success"
                              onClick={() => handleLockBid(bid._id)}
                            >
                              Lock Agreement
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Locked info */}
                    {bid.status === "COMMERCIAL_LOCKED" && bid.lockedTerms && (
                      <div className="locked-terms">
                        <h4>Commercial Locked</h4>
                        <p>
                          Final Amount: ₹
                          {bid.lockedTerms.finalAmount?.toLocaleString()}
                        </p>
                        <p>Duration: {bid.lockedTerms.finalDuration} days</p>
                        <p>
                          Locked:{" "}
                          {new Date(
                            bid.lockedTerms.lockedAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {bid.status === "REJECTED" && (
                      <div className="rejected-info">
                        <p>This bid was rejected by the sub-contractor.</p>
                      </div>
                    )}
                  </motion.div>
                ))}

                {myBids.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <p className="empty-state-text">No bids placed yet.</p>
                    <p className="text-muted">
                      Go to Cases & Bills to place bids on verified cases.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
