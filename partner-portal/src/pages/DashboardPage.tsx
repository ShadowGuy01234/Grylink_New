import React, { useState, useEffect, useRef } from "react";
import { companyApi, casesApi, bidsApi } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const DOCUMENT_TYPES = [
  { key: "CIN", label: "CIN Certificate", icon: "🏢", required: true },
  { key: "GST", label: "GST Certificate", icon: "📋", required: true },
  { key: "PAN", label: "PAN Card", icon: "🪪", required: true },
  {
    key: "BOARD_RESOLUTION",
    label: "Board Resolution",
    icon: "📝",
    required: true,
  },
  {
    key: "BANK_STATEMENTS",
    label: "Bank Statements (12 months)",
    icon: "🏦",
    required: true,
  },
  {
    key: "AUDITED_FINANCIALS",
    label: "Audited Financials (2 years)",
    icon: "📊",
    required: true,
  },
  {
    key: "PROJECT_DETAILS",
    label: "Project Details",
    icon: "🏗️",
    required: false,
  },
  {
    key: "CASHFLOW_DETAILS",
    label: "Cash-flow Details",
    icon: "💰",
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

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>{profile?.company?.companyName || "Partner Dashboard"}</h1>
          <p className="subtitle">
            {isEpc ? "EPC" : "NBFC"} Portal{" "}
            {profile?.company?.status && statusBadge(profile?.company?.status)}
          </p>
        </div>
      </div>

      <div className="tabs">
        {isEpc && (
          <>
            <button
              className={`tab ${activeTab === "documents" ? "active" : ""}`}
              onClick={() => setActiveTab("documents")}
            >
              📄 Documents
            </button>
            <button
              className={`tab ${activeTab === "subcontractors" ? "active" : ""}`}
              onClick={() => setActiveTab("subcontractors")}
            >
              👷 Sub-Contractors
            </button>
          </>
        )}
        <button
          className={`tab ${activeTab === "cases" ? "active" : ""}`}
          onClick={() => setActiveTab("cases")}
        >
          📋 Cases & Bills
        </button>
        <button
          className={`tab ${activeTab === "bids" ? "active" : ""}`}
          onClick={() => setActiveTab("bids")}
        >
          💰 My Bids
          {activeBids.length > 0 && (
            <span className="tab-badge">{activeBids.length}</span>
          )}
        </button>
      </div>

      {/* Documents Tab (EPC only) */}
      {activeTab === "documents" && isEpc && (
        <div className="section">
          <div className="section-header">
            <h2>Company Documents</h2>
            <p
              style={{
                color: "#9ca3af",
                fontSize: "0.875rem",
                marginTop: "0.25rem",
              }}
            >
              Upload all required documents to proceed with verification
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
              marginTop: "1.5rem",
            }}
          >
            {DOCUMENT_TYPES.map((docType) => {
              const existingDoc = getDocumentStatus(docType.key);
              const isUploading = uploadingDoc === docType.key;

              return (
                <div
                  key={docType.key}
                  style={{
                    backgroundColor: "#1e293b",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    border: existingDoc
                      ? "2px solid #22c55e"
                      : "2px solid #334155",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem" }}>{docType.icon}</span>
                      <div>
                        <h3
                          style={{
                            color: "#f1f5f9",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {docType.label}
                        </h3>
                        {docType.required && (
                          <span
                            style={{ color: "#f87171", fontSize: "0.75rem" }}
                          >
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                    {existingDoc && (
                      <span
                        style={{
                          backgroundColor: "#22c55e",
                          color: "#fff",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "9999px",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                        }}
                      >
                        ✓ Uploaded
                      </span>
                    )}
                  </div>

                  {existingDoc ? (
                    <div style={{ marginTop: "0.5rem" }}>
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.8rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {existingDoc.fileName}
                      </p>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <a
                          href={existingDoc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            backgroundColor: "#3b82f6",
                            color: "#fff",
                            padding: "0.5rem 1rem",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          View Document
                        </a>
                        <button
                          onClick={() =>
                            fileInputRefs.current[docType.key]?.click()
                          }
                          style={{
                            backgroundColor: "#475569",
                            color: "#fff",
                            padding: "0.5rem 1rem",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        fileInputRefs.current[docType.key]?.click()
                      }
                      disabled={isUploading}
                      style={{
                        width: "100%",
                        backgroundColor: isUploading ? "#475569" : "#3b82f6",
                        color: "#fff",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        border: "none",
                        cursor: isUploading ? "not-allowed" : "pointer",
                        marginTop: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {isUploading ? (
                        <>⏳ Uploading...</>
                      ) : (
                        <>📤 Upload Document</>
                      )}
                    </button>
                  )}

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
              marginTop: "2rem",
              padding: "1rem 1.5rem",
              backgroundColor: "#1e293b",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                Upload Progress:{" "}
              </span>
              <span style={{ color: "#f1f5f9", fontWeight: 600 }}>
                {profile?.documents?.length || 0} /{" "}
                {DOCUMENT_TYPES.filter((d) => d.required).length} Required
                Documents
              </span>
            </div>
            <div
              style={{
                width: "200px",
                height: "8px",
                backgroundColor: "#334155",
                borderRadius: "9999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${((profile?.documents?.length || 0) / DOCUMENT_TYPES.filter((d) => d.required).length) * 100}%`,
                  height: "100%",
                  backgroundColor: "#22c55e",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sub-Contractors Tab (EPC only) */}
      {activeTab === "subcontractors" && isEpc && (
        <div className="section">
          <div
            className="section-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2>Sub-Contractors</h2>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setShowAddSC(true)}
                style={{
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  padding: "0.625rem 1.25rem",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>+</span> Add Sub-Contractor
              </button>
              <label
                style={{
                  backgroundColor: "#475569",
                  color: "#fff",
                  padding: "0.625rem 1.25rem",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                📊 Bulk Upload
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  hidden
                />
              </label>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#1e293b" }}>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      color: "#94a3b8",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Company
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      color: "#94a3b8",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Contact
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      color: "#94a3b8",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      color: "#94a3b8",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Phone
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      color: "#94a3b8",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {subContractors.map((sc: any) => (
                  <tr
                    key={sc._id}
                    style={{ borderBottom: "1px solid #334155" }}
                  >
                    <td style={{ padding: "1rem", color: "#f1f5f9" }}>
                      {sc.companyName || "—"}
                    </td>
                    <td style={{ padding: "1rem", color: "#cbd5e1" }}>
                      {sc.contactName || "—"}
                    </td>
                    <td style={{ padding: "1rem", color: "#cbd5e1" }}>
                      {sc.email}
                    </td>
                    <td style={{ padding: "1rem", color: "#cbd5e1" }}>
                      {sc.phone || "—"}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {statusBadge(sc.status)}
                    </td>
                  </tr>
                ))}
                {subContractors.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "3rem",
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={{ fontSize: "2rem" }}>👷</span>
                        <span>No sub-contractors added yet</span>
                        <button
                          onClick={() => setShowAddSC(true)}
                          style={{
                            marginTop: "0.5rem",
                            backgroundColor: "#3b82f6",
                            color: "#fff",
                            padding: "0.5rem 1rem",
                            borderRadius: "6px",
                            fontSize: "0.875rem",
                            border: "none",
                            cursor: "pointer",
                          }}
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
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
              }}
              onClick={() => setShowAddSC(false)}
            >
              <div
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: "16px",
                  padding: "2rem",
                  width: "100%",
                  maxWidth: "450px",
                  border: "1px solid #334155",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  style={{
                    color: "#f1f5f9",
                    marginBottom: "1.5rem",
                    fontSize: "1.25rem",
                  }}
                >
                  Add Sub-Contractor
                </h2>
                <form onSubmit={handleAddSC}>
                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      style={{
                        display: "block",
                        color: "#94a3b8",
                        fontSize: "0.875rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Company Name
                    </label>
                    <input
                      value={scForm.companyName}
                      onChange={(e) =>
                        setScForm({ ...scForm, companyName: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#f1f5f9",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      style={{
                        display: "block",
                        color: "#94a3b8",
                        fontSize: "0.875rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Contact Name
                    </label>
                    <input
                      value={scForm.contactName}
                      onChange={(e) =>
                        setScForm({ ...scForm, contactName: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#f1f5f9",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      style={{
                        display: "block",
                        color: "#94a3b8",
                        fontSize: "0.875rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Email <span style={{ color: "#f87171" }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={scForm.email}
                      onChange={(e) =>
                        setScForm({ ...scForm, email: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#f1f5f9",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        color: "#94a3b8",
                        fontSize: "0.875rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Phone
                    </label>
                    <input
                      value={scForm.phone}
                      onChange={(e) =>
                        setScForm({ ...scForm, phone: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#f1f5f9",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowAddSC(false)}
                      style={{
                        padding: "0.625rem 1.25rem",
                        backgroundColor: "#475569",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingSC}
                      style={{
                        padding: "0.625rem 1.25rem",
                        backgroundColor: addingSC ? "#475569" : "#3b82f6",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        cursor: addingSC ? "not-allowed" : "pointer",
                      }}
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
                        {n.message && <p className="message">"{n.message}"</p>}
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
                          🔒 Lock Agreement
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Locked info */}
                {bid.status === "COMMERCIAL_LOCKED" && bid.lockedTerms && (
                  <div className="locked-terms">
                    <h4>🔒 Commercial Locked</h4>
                    <p>
                      Final Amount: ₹
                      {bid.lockedTerms.finalAmount?.toLocaleString()}
                    </p>
                    <p>Duration: {bid.lockedTerms.finalDuration} days</p>
                    <p>
                      Locked:{" "}
                      {new Date(bid.lockedTerms.lockedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {bid.status === "REJECTED" && (
                  <div className="rejected-info">
                    <p>❌ This bid was rejected by the sub-contractor.</p>
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
  );
};

export default DashboardPage;
