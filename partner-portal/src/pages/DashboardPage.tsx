import React, { useState, useEffect, useRef } from "react";
import { companyApi, casesApi, bidsApi } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

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
        phone: "9876543210"
      }
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

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div style={{ minHeight: "100vh", padding: "1.5rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              marginBottom: "0.25rem",
            }}
          >
            {profile?.company?.companyName || "Partner Dashboard"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            {isEpc ? "EPC" : "NBFC"} Portal{" "}
            {profile?.company?.status && statusBadge(profile?.company?.status)}
          </p>
        </div>

        {/* Pending Verification Notice */}
        {pendingVerification && (
          <div
            style={{
              backgroundColor: "var(--bg-card)",
              border: "2px solid var(--warning)",
              borderRadius: "8px",
              padding: "1rem 1.5rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span style={{ color: "var(--warning)", fontSize: "1.25rem" }}>
              !
            </span>
            <div>
              <p style={{ fontWeight: 600, margin: 0 }}>
                Documents Pending Verification
              </p>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.875rem",
                  margin: 0,
                }}
              >
                Your documents are being reviewed by our Ops team. Other
                sections will be unlocked once verification is complete.
              </p>
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "0.5rem",
          }}
        >
          {isEpc && (
            <button
              onClick={() => setActiveTab("documents")}
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "0.875rem",
                backgroundColor:
                  activeTab === "documents" ? "var(--accent)" : "transparent",
                color:
                  activeTab === "documents" ? "white" : "var(--text-secondary)",
                transition: "all 0.2s",
              }}
            >
              Documents
            </button>
          )}
          {isEpc && (
            <button
              onClick={() =>
                areDocsVerified ? setActiveTab("subcontractors") : null
              }
              disabled={!areDocsVerified}
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: "6px",
                border: "none",
                cursor: areDocsVerified ? "pointer" : "not-allowed",
                fontWeight: 500,
                fontSize: "0.875rem",
                backgroundColor:
                  activeTab === "subcontractors"
                    ? "var(--accent)"
                    : "transparent",
                color:
                  activeTab === "subcontractors"
                    ? "white"
                    : areDocsVerified
                      ? "var(--text-secondary)"
                      : "var(--text-muted)",
                opacity: areDocsVerified ? 1 : 0.5,
                transition: "all 0.2s",
              }}
              title={
                !areDocsVerified
                  ? "Complete document verification to unlock"
                  : ""
              }
            >
              Sub-Contractors {!areDocsVerified && "(Locked)"}
            </button>
          )}
          <button
            onClick={() =>
              areDocsVerified || isNbfc ? setActiveTab("cases") : null
            }
            disabled={isEpc && !areDocsVerified}
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "6px",
              border: "none",
              cursor: areDocsVerified || isNbfc ? "pointer" : "not-allowed",
              fontWeight: 500,
              fontSize: "0.875rem",
              backgroundColor:
                activeTab === "cases" ? "var(--accent)" : "transparent",
              color:
                activeTab === "cases"
                  ? "white"
                  : areDocsVerified || isNbfc
                    ? "var(--text-secondary)"
                    : "var(--text-muted)",
              opacity: areDocsVerified || isNbfc ? 1 : 0.5,
              transition: "all 0.2s",
            }}
            title={
              isEpc && !areDocsVerified
                ? "Complete document verification to unlock"
                : ""
            }
          >
            Cases & Bills {isEpc && !areDocsVerified && "(Locked)"}
          </button>
          <button
            onClick={() =>
              areDocsVerified || isNbfc ? setActiveTab("bids") : null
            }
            disabled={isEpc && !areDocsVerified}
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "6px",
              border: "none",
              cursor: areDocsVerified || isNbfc ? "pointer" : "not-allowed",
              fontWeight: 500,
              fontSize: "0.875rem",
              backgroundColor:
                activeTab === "bids" ? "var(--accent)" : "transparent",
              color:
                activeTab === "bids"
                  ? "white"
                  : areDocsVerified || isNbfc
                    ? "var(--text-secondary)"
                    : "var(--text-muted)",
              opacity: areDocsVerified || isNbfc ? 1 : 0.5,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            title={
              isEpc && !areDocsVerified
                ? "Complete document verification to unlock"
                : ""
            }
          >
            My Bids {isEpc && !areDocsVerified && "(Locked)"}
            {activeBids.length > 0 && (areDocsVerified || isNbfc) && (
              <span
                style={{
                  backgroundColor: "var(--danger)",
                  color: "white",
                  padding: "0.125rem 0.5rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                {activeBids.length}
              </span>
            )}
          </button>
        </div>

        {/* Documents Tab (EPC only) */}
        {activeTab === "documents" && isEpc && (
          <div className="section">
            <div className="section-header" style={{ marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ margin: 0, marginBottom: "0.5rem" }}>
                  Company Documents
                </h2>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                    margin: 0,
                  }}
                >
                  Upload all required documents to proceed with verification
                  process
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
                maxWidth: "900px",
              }}
            >
              {DOCUMENT_TYPES.map((docType) => {
                const existingDoc = getDocumentStatus(docType.key);
                const isUploading = uploadingDoc === docType.key;

                return (
                  <div
                    key={docType.key}
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderRadius: "var(--radius)",
                      padding: "1rem 1.25rem",
                      border: existingDoc
                        ? "2px solid var(--success)"
                        : "1px solid var(--border)",
                      transition: "all 0.2s ease",
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      alignItems: "center",
                      gap: "1.5rem",
                      minHeight: "70px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "0.9375rem",
                            fontWeight: 600,
                            margin: 0,
                            color: "var(--text-primary)",
                          }}
                        >
                          {docType.label}
                        </h3>
                        {docType.required && (
                          <span className="badge badge-red">Required</span>
                        )}
                        {existingDoc && (
                          <span
                            className={
                              existingDoc.status === "verified"
                                ? "badge badge-green"
                                : existingDoc.status === "rejected"
                                  ? "badge badge-red"
                                  : "badge badge-yellow"
                            }
                          >
                            {existingDoc.status === "verified" && "Verified"}
                            {existingDoc.status === "rejected" && "Rejected"}
                            {existingDoc.status === "pending" &&
                              "Pending Review"}
                          </span>
                        )}
                      </div>
                      {existingDoc && existingDoc.fileName && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8125rem",
                            color: "var(--text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "500px",
                          }}
                        >
                          {existingDoc.fileName}
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.625rem",
                        alignItems: "center",
                      }}
                    >
                      {existingDoc ? (
                        <>
                          <button
                            onClick={() => {
                              if (!existingDoc.fileUrl) {
                                alert("Document URL is missing. Please re-upload the document.");
                                return;
                              }
                              const isPdf = existingDoc.fileName?.toLowerCase().endsWith(".pdf");
                              if (isPdf) {
                                openPdfDocument(existingDoc.fileUrl, existingDoc.fileName);
                              } else {
                                window.open(existingDoc.fileUrl, "_blank");
                              }
                            }}
                            className="btn-primary btn-sm"
                            disabled={!existingDoc.fileUrl}
                            style={{ minWidth: "70px" }}
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              fileInputRefs.current[docType.key]?.click()
                            }
                            className="btn-secondary btn-sm"
                            disabled={isUploading}
                            style={{ minWidth: "80px" }}
                          >
                            {isUploading ? "..." : "Replace"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            fileInputRefs.current[docType.key]?.click()
                          }
                          disabled={isUploading}
                          className="btn-primary"
                          style={{
                            padding: "0.5rem 1.25rem",
                            fontSize: "0.875rem",
                            minWidth: "120px",
                          }}
                        >
                          {isUploading ? "Uploading..." : "Upload"}
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
                  </div>
                );
              })}
            </div>

            {/* Progress Summary */}
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1.25rem 1.5rem",
                backgroundColor: "var(--bg-card)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                maxWidth: "900px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.8125rem",
                      display: "block",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Verification Progress
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    {profile?.documents?.length || 0} of{" "}
                    {DOCUMENT_TYPES.filter((d) => d.required).length} Required
                    Documents Uploaded
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--accent)",
                    minWidth: "60px",
                    textAlign: "right",
                  }}
                >
                  {Math.round(
                    ((profile?.documents?.length || 0) /
                      DOCUMENT_TYPES.filter((d) => d.required).length) *
                      100,
                  )}
                  %
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "10px",
                  backgroundColor: "var(--bg-hover)",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${((profile?.documents?.length || 0) / DOCUMENT_TYPES.filter((d) => d.required).length) * 100}%`,
                    height: "100%",
                    backgroundColor: "var(--success)",
                    transition: "width 0.4s ease",
                    borderRadius: "9999px",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Sub-Contractors Tab (EPC only) */}
        {activeTab === "subcontractors" && isEpc && (
          <div className="section">
            <div className="section-header">
              <h2>Sub-Contractors</h2>
              <div className="header-actions">
                <button
                  onClick={() => setShowAddSC(true)}
                  className="btn-primary"
                >
                  Add Sub-Contractor
                </button>
                <button
                  onClick={downloadTemplate}
                  className="btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  📥 Download Template
                </button>
                <label className="btn-primary" style={{ cursor: "pointer" }}>
                  📤 Bulk Upload
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    hidden
                  />
                </label>
              </div>
            </div>

            <div className="table-wrapper" style={{ marginTop: "1.5rem" }}>
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
                          setScForm({ ...scForm, companyName: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Name</label>
                      <input
                        value={scForm.contactName}
                        onChange={(e) =>
                          setScForm({ ...scForm, contactName: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        Email <span style={{ color: "var(--danger)" }}>*</span>
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
          </div>
        )}

        {/* Cases Tab */}
        {activeTab === "cases" && (
          <div className="section">
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
                              onClick={() => handleReviewCase(c._id, "approve")}
                            >
                              Approve
                            </button>
                            <button
                              className="btn-sm btn-danger"
                              onClick={() => handleReviewCase(c._id, "reject")}
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
              <div className="modal-overlay" onClick={() => setBidModal(null)}>
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
                          setBidForm({ ...bidForm, bidAmount: e.target.value })
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
          </div>
        )}

        {/* Bids Tab */}
        {activeTab === "bids" && (
          <div className="section">
            <h2>My Bids</h2>
            <p className="description">
              Track your placed bids and negotiate terms.
            </p>

            <div className="bids-list">
              {myBids.map((bid: any) => (
                <div key={bid._id} className="bid-card">
                  <div className="bid-header">
                    <h3>Case #{bid.caseId?.caseNumber || "N/A"}</h3>
                    {statusBadge(bid.status)}
                  </div>
                  <div className="bid-details">
                    <div className="detail">
                      <span className="label">Sub-Contractor:</span>
                      <span>
                        {bid.caseId?.subContractorId?.companyName || "—"}
                      </span>
                    </div>
                    <div className="detail">
                      <span className="label">Bill Amount:</span>
                      <span>
                        ₹{bid.caseId?.billId?.amount?.toLocaleString() || "N/A"}
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
                </div>
              ))}

              {myBids.length === 0 && (
                <div className="empty-state">
                  <p>No bids placed yet.</p>
                  <p className="hint">
                    Go to Cases & Bills to place bids on verified cases.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
