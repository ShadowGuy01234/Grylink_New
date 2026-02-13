import { useState, useEffect } from "react";
import { opsApi, casesApi } from "../api";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface Company {
  _id: string;
  companyName: string;
  ownerName: string;
  email: string;
  status: string;
}

interface Bill {
  _id: string;
  billNumber: string;
  amount: number;
  description: string;
  status: string;
  fileName: string;
  fileUrl: string;
  subContractorId?: { companyName: string };
  linkedEpcId?: { companyName: string };
  wcc?: { uploaded: boolean; fileUrl: string; verified: boolean };
  measurementSheet?: { uploaded: boolean; fileUrl: string; certified: boolean };
}

interface KycItem {
  _id: string;
  status: string;
  subContractorId?: { companyName: string };
  userId?: { name: string };
}

interface CaseItem {
  _id: string;
  caseNumber: string;
  subContractorId?: { companyName: string };
  epcId?: { companyName: string };
  billId?: { amount: number };
  currentStage: string;
  status: string;
  createdAt: string;
}

interface PendingData {
  pendingCompanies: Company[];
  pendingBills: Bill[];
  pendingKyc: KycItem[];
}

interface VerifyModal {
  type: "company" | "bill";
  id: string;
  name: string;
  fileUrl?: string;
  fileName?: string;
  amount?: number;
  description?: string;
  subContractor?: string;
  epc?: string;
  wcc?: { uploaded: boolean; fileUrl: string; verified: boolean };
  measurementSheet?: { uploaded: boolean; fileUrl: string; certified: boolean };
}

const OpsDashboard = () => {
  const [pending, setPending] = useState<PendingData>({
    pendingCompanies: [],
    pendingBills: [],
    pendingKyc: [],
  });
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("companies");
  const [verifyModal, setVerifyModal] = useState<VerifyModal | null>(null);
  const [notes, setNotes] = useState("");
  const [kycMessage, setKycMessage] = useState("");

  const fetchData = async () => {
    try {
      const [pendingRes, casesRes] = await Promise.all([
        opsApi.getPending(),
        casesApi.getCases(),
      ]);
      setPending(pendingRes.data);
      setCases(casesRes.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyBill = async (id: string, decision: string) => {
    try {
      await opsApi.verifyBill(id, { decision, notes });
      toast.success(`Bill ${decision === "approve" ? "approved" : "rejected"}`);
      setVerifyModal(null);
      setNotes("");
      fetchData();
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      toast.error(axiosErr.response?.data?.error || "Failed to verify");
    }
  };

  const handleKycRequest = async (id: string) => {
    try {
      await opsApi.requestKyc(id, kycMessage);
      toast.success("KYC document request sent");
      setKycMessage("");
      fetchData();
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      toast.error(axiosErr.response?.data?.error || "Failed to send request");
    }
  };

  const handleCompleteKyc = async (id: string) => {
    try {
      await opsApi.completeKyc(id);
      toast.success("KYC completed — Case created");
      fetchData();
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      toast.error(axiosErr.response?.data?.error || "Failed to complete KYC");
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DOCS_SUBMITTED: "badge-purple",
      UPLOADED: "badge-yellow",
      SUBMITTED: "badge-blue",
      ACTION_REQUIRED: "badge-red",
      VERIFIED: "badge-green",
      REJECTED: "badge-red",
      KYC_COMPLETED: "badge-green",
      READY_FOR_COMPANY_REVIEW: "badge-purple",
      EPC_VERIFIED: "badge-green",
      BID_PLACED: "badge-blue",
      COMMERCIAL_LOCKED: "badge-green",
    };
    return (
      <span className={`badge ${colors[status] || "badge-gray"}`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Ops Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-warning">
          <h3>{pending.pendingCompanies.length}</h3>
          <p>Pending Companies</p>
        </div>
        <div className="stat-card stat-info">
          <h3>{pending.pendingBills.length}</h3>
          <p>Pending Bills</p>
        </div>
        <div className="stat-card stat-danger">
          <h3>{pending.pendingKyc.length}</h3>
          <p>Pending KYC</p>
        </div>
        <div className="stat-card">
          <h3>{cases.length}</h3>
          <p>Total Cases</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {["companies", "bills", "kyc", "cases", "nbfc"].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Companies Tab */}
      {activeTab === "companies" && (
        <div className="table-section">
          <h2>Pending Company Verifications</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Owner</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.pendingCompanies.map((c) => (
                  <tr key={c._id}>
                    <td>{c.companyName}</td>
                    <td>{c.ownerName}</td>
                    <td>{c.email}</td>
                    <td>{statusBadge(c.status)}</td>
                    <td>
                      <button
                        className="btn-sm btn-success"
                        onClick={() =>
                          setVerifyModal({
                            type: "company",
                            id: c._id,
                            name: c.companyName,
                          })
                        }
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {pending.pendingCompanies.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      No pending company verifications
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bills Tab */}
      {activeTab === "bills" && (
        <div className="table-section">
          <h2>Pending Bill Verifications</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Sub-Contractor</th>
                  <th>EPC</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.pendingBills.map((b) => (
                  <tr key={b._id}>
                    <td>{b.billNumber || "—"}</td>
                    <td>{b.subContractorId?.companyName || "—"}</td>
                    <td>{b.linkedEpcId?.companyName || "—"}</td>
                    <td>{b.amount ? `₹${b.amount.toLocaleString()}` : "—"}</td>
                    <td>{statusBadge(b.status)}</td>
                    <td>
                      <button
                        className="btn-sm btn-success"
                        onClick={() =>
                          setVerifyModal({
                            type: "bill",
                            id: b._id,
                            name: b.billNumber,
                            fileUrl: b.fileUrl,
                            fileName: b.fileName,
                            amount: b.amount,
                            description: b.description,
                            subContractor: b.subContractorId?.companyName,
                            epc: b.linkedEpcId?.companyName,
                            wcc: b.wcc,
                            measurementSheet: b.measurementSheet,
                          })
                        }
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {pending.pendingBills.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      No pending bill verifications
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KYC Tab */}
      {activeTab === "kyc" && (
        <div className="table-section">
          <h2>Pending KYC</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Sub-Contractor</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.pendingKyc.map((k) => (
                  <tr key={k._id}>
                    <td>{k.subContractorId?.companyName || "—"}</td>
                    <td>{k.userId?.name || "—"}</td>
                    <td>{statusBadge(k.status)}</td>
                    <td className="action-buttons">
                      {k.status !== "KYC_COMPLETED" && (
                        <>
                          <div className="inline-form">
                            <input
                              placeholder="Request message..."
                              value={kycMessage}
                              onChange={(e) => setKycMessage(e.target.value)}
                            />
                            <button
                              className="btn-sm btn-warning"
                              onClick={() => handleKycRequest(k._id)}
                            >
                              Request Docs
                            </button>
                          </div>
                          <button
                            className="btn-sm btn-success"
                            onClick={() => handleCompleteKyc(k._id)}
                          >
                            Complete KYC
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {pending.pendingKyc.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      No pending KYC
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cases Tab */}
      {activeTab === "cases" && (
        <div className="table-section">
          <h2>All Cases</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Case #</th>
                  <th>Sub-Contractor</th>
                  <th>EPC</th>
                  <th>Bill Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c._id}>
                    <td>{c.caseNumber}</td>
                    <td>{c.subContractorId?.companyName || "—"}</td>
                    <td>{c.epcId?.companyName || "—"}</td>
                    <td>
                      {c.billId?.amount
                        ? `₹${c.billId.amount.toLocaleString()}`
                        : "—"}
                    </td>
                    <td>{statusBadge(c.status)}</td>
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
        </div>
      )}

      {/* NBFC Tab */}
      {activeTab === "nbfc" && (
        <div className="section" style={{ padding: "20px" }}>
          <h2>Invite NBFC</h2>
          <div
            className="card"
            style={{
              maxWidth: "600px",
              padding: "24px",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                try {
                  await opsApi.inviteNbfc(data);
                  toast.success("NBFC invited successfully!");
                  form.reset();
                } catch (err) {
                  const axiosErr = err as AxiosError<{ error?: string }>;
                  toast.error(
                    axiosErr.response?.data?.error || "Failed to invite NBFC",
                  );
                }
              }}
            >
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Company Name *
                </label>
                <input
                  name="companyName"
                  required
                  placeholder="NBFC Name"
                  className="form-control"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Owner Name *
                </label>
                <input
                  name="ownerName"
                  required
                  placeholder="Contact Person"
                  className="form-control"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="nbfc@example.com"
                  className="form-control"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Phone *
                </label>
                <input
                  name="phone"
                  required
                  placeholder="+91..."
                  className="form-control"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Address *
                </label>
                <input
                  name="address"
                  required
                  placeholder="Office Address"
                  className="form-control"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Send Invitation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {verifyModal && (
        <div className="modal-overlay" onClick={() => setVerifyModal(null)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "800px", width: "90%" }}
          >
            <h2>Review: {verifyModal.name}</h2>

            {verifyModal.type === "company" && (
              <CompanyReview
                companyId={verifyModal.id}
                onClose={() => {
                  setVerifyModal(null);
                  fetchData();
                }}
              />
            )}

            {verifyModal.type === "bill" && (
              <>
                {/* Bill Details */}
                <div
                  style={{
                    marginBottom: 20,
                    padding: 16,
                    background: "var(--bg-secondary)",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <strong>Sub-Contractor:</strong>{" "}
                      {verifyModal.subContractor || "—"}
                    </div>
                    <div>
                      <strong>EPC Company:</strong> {verifyModal.epc || "—"}
                    </div>
                    <div>
                      <strong>Amount:</strong>{" "}
                      {verifyModal.amount
                        ? `₹${verifyModal.amount.toLocaleString()}`
                        : "—"}
                    </div>
                    <div>
                      <strong>Description:</strong>{" "}
                      {verifyModal.description || "—"}
                    </div>
                  </div>

                  {/* Bill Document */}
                  <div style={{ marginBottom: 12 }}>
                    <strong>Bill Document:</strong>{" "}
                    {verifyModal.fileUrl ? (
                      <a
                        href={verifyModal.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-sm btn-primary"
                        style={{ marginLeft: 8 }}
                      >
                        View Bill
                      </a>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>
                        No document uploaded
                      </span>
                    )}
                  </div>

                  {/* WCC Document */}
                  {verifyModal.wcc?.uploaded && (
                    <div style={{ marginBottom: 12 }}>
                      <strong>WCC (Work Completion Certificate):</strong>{" "}
                      <a
                        href={verifyModal.wcc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-sm btn-primary"
                        style={{ marginLeft: 8 }}
                      >
                        View WCC
                      </a>
                      {verifyModal.wcc.verified && (
                        <span
                          className="badge badge-green"
                          style={{ marginLeft: 8 }}
                        >
                          Verified
                        </span>
                      )}
                    </div>
                  )}

                  {/* Measurement Sheet */}
                  {verifyModal.measurementSheet?.uploaded && (
                    <div>
                      <strong>Measurement Sheet:</strong>{" "}
                      <a
                        href={verifyModal.measurementSheet.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-sm btn-primary"
                        style={{ marginLeft: 8 }}
                      >
                        View Sheet
                      </a>
                      {verifyModal.measurementSheet.certified && (
                        <span
                          className="badge badge-green"
                          style={{ marginLeft: 8 }}
                        >
                          Certified
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add verification notes..."
                  />
                </div>
                <div className="modal-actions">
                  <button
                    className="btn-danger"
                    onClick={() => handleVerifyBill(verifyModal.id, "reject")}
                  >
                    Reject
                  </button>
                  <button
                    className="btn-success"
                    onClick={() => handleVerifyBill(verifyModal.id, "approve")}
                  >
                    Approve
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface Document {
  _id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: string;
}

const CompanyReview = ({
  companyId,
  onClose,
}: {
  companyId: string;
  onClose: () => void;
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

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
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      toast.dismiss("pdf-load");
      toast.error("Failed to load document. Downloading instead...");
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "document.pdf";
      a.click();
    }
  };

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const res = await opsApi.getCompanyDocuments(companyId);
        setDocuments(res.data);
      } catch {
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };
    loadDocs();
  }, [companyId]);

  const handleVerifyDoc = async (docId: string, decision: string) => {
    try {
      await opsApi.verifyDocument(docId, { decision });
      toast.success(
        `Document ${decision === "approve" ? "verified" : "rejected"}`,
      );
      setDocuments((docs) =>
        docs.map((d) =>
          d._id === docId
            ? { ...d, status: decision === "approve" ? "verified" : "rejected" }
            : d,
        ),
      );
    } catch {
      toast.error("Failed to update document status");
    }
  };

  const handleVerifyCompany = async (decision: string) => {
    try {
      await opsApi.verifyCompany(companyId, { decision });
      toast.success(
        `Company ${decision === "approve" ? "approved" : "rejected"}`,
      );
      onClose();
    } catch {
      toast.error("Failed to update company status");
    }
  };

  if (loading) return <div>Loading documents...</div>;

  return (
    <div className="company-review">
      <div className="docs-list">
        <h3>Submitted Documents</h3>
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="doc-item"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              borderBottom: "1px solid #eee",
            }}
          >
            <div>
              <strong>{doc.documentType}</strong>
              <div style={{ fontSize: "0.8em", color: "#666" }}>
                {doc.fileName}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span
                className={`badge badge-${doc.status === "verified" ? "green" : doc.status === "rejected" ? "red" : "yellow"}`}
              >
                {doc.status}
              </span>
              <button
                className="btn-sm btn-secondary"
                onClick={() => {
                  const isPdf = doc.fileName?.toLowerCase().endsWith(".pdf");
                  if (isPdf) {
                    openPdfDocument(doc.fileUrl, doc.fileName);
                  } else {
                    window.open(doc.fileUrl, "_blank");
                  }
                }}
              >
                Preview
              </button>
              {doc.status === "pending" && (
                <>
                  <button
                    className="btn-sm btn-success"
                    onClick={() => handleVerifyDoc(doc._id, "approve")}
                  >
                    ✓
                  </button>
                  <button
                    className="btn-sm btn-danger"
                    onClick={() => handleVerifyDoc(doc._id, "reject")}
                  >
                    ✗
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {documents.length === 0 && <p>No documents found.</p>}
      </div>

      <div
        className="company-actions"
        style={{
          marginTop: "20px",
          paddingTop: "20px",
          borderTop: "1px solid #eee",
        }}
      >
        <h4>Final Decision</h4>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn-danger"
            onClick={() => handleVerifyCompany("reject")}
          >
            Reject Company
          </button>
          <button
            className="btn-success"
            onClick={() => handleVerifyCompany("approve")}
          >
            Approve Company
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpsDashboard;
