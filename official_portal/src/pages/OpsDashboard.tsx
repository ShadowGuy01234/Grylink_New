import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // Additional Documents tab
  const [additionalDocSellers, setAdditionalDocSellers] = useState<any[]>([]);
  const [selectedDocSeller, setSelectedDocSeller] = useState<any | null>(null);
  const [requestDocForm, setRequestDocForm] = useState({ label: "", description: "" });
  const [requestingDoc, setRequestingDoc] = useState(false);
  const [loadingDocSellers, setLoadingDocSellers] = useState(false);
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);

  const fetchAdditionalDocSellers = async (selectId?: string) => {
    setLoadingDocSellers(true);
    try {
      const res = await opsApi.getSubContractors();
      const sellers = res.data.sellers || [];
      setAdditionalDocSellers(sellers);
      if (selectId) {
        const fresh = sellers.find((s: any) => s._id === selectId);
        if (fresh) setSelectedDocSeller(fresh);
      } else if (selectedDocSeller) {
        const fresh = sellers.find((s: any) => s._id === selectedDocSeller._id);
        if (fresh) setSelectedDocSeller(fresh);
      }
    } catch {
      toast.error("Failed to load sellers");
    } finally {
      setLoadingDocSellers(false);
    }
  };

  const handleRequestDoc = async (sellerId: string) => {
    if (!requestDocForm.label.trim()) { toast.error("Label is required"); return; }
    setRequestingDoc(true);
    try {
      await opsApi.requestAdditionalDoc(sellerId, requestDocForm);
      toast.success("Document requested successfully!");
      setRequestDocForm({ label: "", description: "" });
      fetchAdditionalDocSellers(sellerId);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to request document");
    } finally {
      setRequestingDoc(false);
    }
  };

  const handleVerifyAdditionalDoc = async (sellerId: string, docId: string, decision: string) => {
    setVerifyingDocId(docId);
    try {
      await opsApi.verifyAdditionalDoc(sellerId, docId, { decision });
      toast.success(`Document ${decision === "approve" ? "verified" : "rejected"}`);
      fetchAdditionalDocSellers(sellerId);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Action failed");
    } finally {
      setVerifyingDocId(null);
    }
  };

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
        {["companies", "bills", "kyc", "cases", "nbfc", "additional-docs"].map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab);
              if (tab === "additional-docs") fetchAdditionalDocSellers();
            }}
          >
            {tab === "additional-docs" ? "Additional Docs" : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2>Pending KYC Verification</h2>
            <button className="btn-primary" onClick={() => navigate("/ops/kyc")}>
              Open KYC Verification
            </button>
          </div>
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
                    <td>
                      <button
                        className="btn-sm btn-primary"
                        onClick={() => navigate("/ops/kyc")}
                      >
                        Review KYC
                      </button>
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

      {/* Additional Docs Tab */}
      {activeTab === "additional-docs" && (
        <div className="section" style={{ padding: "20px" }}>
          <h2>Additional Documents</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px", fontSize: "0.9em" }}>
            Request additional documents from sub-contractors and verify uploaded files.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px", alignItems: "start" }}>

            {/* Left: Seller List */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden", background: "#fff" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                <strong style={{ fontSize: "0.9em" }}>Sub-Contractors</strong>
              </div>
              {loadingDocSellers && <div style={{ padding: "20px", textAlign: "center", color: "#9ca3af" }}>Loading...</div>}
              {!loadingDocSellers && additionalDocSellers.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", color: "#9ca3af" }}>No sub-contractors found</div>
              )}
              {additionalDocSellers.map((seller) => {
                const pendingCount = seller.additionalDocuments?.filter((d: any) => d.status === "REQUESTED").length || 0;
                const uploadedCount = seller.additionalDocuments?.filter((d: any) => d.status === "UPLOADED").length || 0;
                const isSelected = selectedDocSeller?._id === seller._id;
                return (
                  <button
                    key={seller._id}
                    onClick={() => setSelectedDocSeller(seller)}
                    style={{
                      display: "block", width: "100%", textAlign: "left", padding: "12px 16px",
                      borderBottom: "1px solid #f3f4f6", background: isSelected ? "#eff6ff" : "transparent",
                      cursor: "pointer", border: "none", borderLeft: isSelected ? "3px solid #2563eb" : "3px solid transparent",
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: "0.9em", color: "#111827" }}>{seller.companyName}</div>
                    <div style={{ fontSize: "0.78em", color: "#6b7280", marginTop: "2px" }}>{seller.email}</div>
                    <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
                      {uploadedCount > 0 && <span className="badge badge-yellow">{uploadedCount} to review</span>}
                      {pendingCount > 0 && <span className="badge badge-red">{pendingCount} awaiting</span>}
                      {!uploadedCount && !pendingCount && <span className="badge badge-gray">No requests</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Selected Seller Panel */}
            {selectedDocSeller ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1em" }}>{selectedDocSeller.companyName}</h3>
                      <p style={{ margin: "2px 0 0", fontSize: "0.82em", color: "#6b7280" }}>{selectedDocSeller.email}</p>
                    </div>
                    <span className={`badge ${
                      selectedDocSeller.status === "KYC_COMPLETED" ? "badge-green" :
                      selectedDocSeller.status === "VERIFIED" ? "badge-green" : "badge-yellow"
                    }`}>{selectedDocSeller.status?.replace(/_/g, " ")}</span>
                  </div>

                  {/* Existing Additional Docs */}
                  {selectedDocSeller.additionalDocuments?.length > 0 ? (
                    <div style={{ marginBottom: "16px" }}>
                      <p style={{ fontWeight: 600, fontSize: "0.85em", marginBottom: "10px", color: "#374151" }}>Requested Documents</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {selectedDocSeller.additionalDocuments.map((doc: any) => (
                          <div key={doc._id} style={{
                            border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px 14px",
                            background: doc.status === "UPLOADED" ? "#fffbeb" : doc.status === "VERIFIED" ? "#f0fdf4" : doc.status === "REJECTED" ? "#fef2f2" : "#f9fafb"
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: "0.88em" }}>{doc.label}</p>
                                {doc.description && <p style={{ margin: "2px 0 0", fontSize: "0.78em", color: "#6b7280" }}>{doc.description}</p>}
                                <p style={{ margin: "4px 0 0", fontSize: "0.75em", color: "#9ca3af" }}>
                                  Requested {new Date(doc.requestedAt).toLocaleDateString()}
                                </p>
                                {doc.fileName && (
                                  <p style={{ margin: "4px 0 0", fontSize: "0.78em", color: "#6b7280" }}>
                                    File: <strong>{doc.fileName}</strong>
                                    {doc.fileUrl && (
                                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                                        style={{ marginLeft: "8px", color: "#2563eb", fontSize: "0.9em" }}>View</a>
                                    )}
                                  </p>
                                )}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", minWidth: "120px" }}>
                                <span className={`badge ${
                                  doc.status === "UPLOADED" ? "badge-yellow" :
                                  doc.status === "VERIFIED" ? "badge-green" :
                                  doc.status === "REJECTED" ? "badge-red" : "badge-gray"
                                }`}>{doc.status}</span>
                                {doc.status === "UPLOADED" && (
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button
                                      className="btn-sm btn-success"
                                      disabled={verifyingDocId === doc._id}
                                      onClick={() => handleVerifyAdditionalDoc(selectedDocSeller._id, doc._id, "approve")}
                                    >
                                      {verifyingDocId === doc._id ? "..." : "✓ Verify"}
                                    </button>
                                    <button
                                      className="btn-sm btn-danger"
                                      disabled={verifyingDocId === doc._id}
                                      onClick={() => handleVerifyAdditionalDoc(selectedDocSeller._id, doc._id, "reject")}
                                    >
                                      ✗ Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "#9ca3af", fontSize: "0.85em", marginBottom: "16px" }}>No additional documents requested yet.</p>
                  )}

                  {/* Request New Doc Form */}
                  <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "16px" }}>
                    <p style={{ fontWeight: 600, fontSize: "0.85em", marginBottom: "10px", color: "#374151" }}>Request New Document</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ display: "block", fontSize: "0.82em", fontWeight: 500, marginBottom: "4px" }}>Document Label *</label>
                        <input
                          className="form-control"
                          placeholder="e.g. Bank Statement, GST Certificate"
                          value={requestDocForm.label}
                          onChange={(e) => setRequestDocForm(p => ({ ...p, label: e.target.value }))}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.88em" }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ display: "block", fontSize: "0.82em", fontWeight: 500, marginBottom: "4px" }}>Description (optional)</label>
                        <textarea
                          placeholder="Additional instructions for the sub-contractor..."
                          value={requestDocForm.description}
                          onChange={(e) => setRequestDocForm(p => ({ ...p, description: e.target.value }))}
                          rows={2}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "0.88em", resize: "vertical" }}
                        />
                      </div>
                      <button
                        className="btn-primary"
                        disabled={requestingDoc || !requestDocForm.label.trim()}
                        onClick={() => handleRequestDoc(selectedDocSeller._id)}
                        style={{ alignSelf: "flex-start", padding: "8px 18px", fontSize: "0.88em" }}
                      >
                        {requestingDoc ? "Sending..." : "Send Request"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                border: "2px dashed #e5e7eb", borderRadius: "10px", display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "48px 24px", color: "#9ca3af", textAlign: "center"
              }}>
                <div style={{ fontSize: "2.5em", marginBottom: "12px" }}>📂</div>
                <p style={{ margin: 0, fontWeight: 500 }}>Select a sub-contractor</p>
                <p style={{ margin: "6px 0 0", fontSize: "0.85em" }}>Choose from the list on the left to manage their documents</p>
              </div>
            )}
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
