import React, { useState, useEffect, useCallback } from "react";
import { api, casesApi } from "../api";
import toast from "react-hot-toast";

// ── Types ───────────────────────────────────────────────────────────────────
interface Case {
  _id: string;
  caseNumber: string;
  rmtCaseNumber?: string;
  status: string;
  dealValue?: number;
  createdAt: string;
  updatedAt: string;
  subContractorId?: { _id: string; companyName: string; ownerName?: string; gstin?: string; pan?: string };
  epcId?: { _id: string; companyName: string; gstin?: string };
  billId?: { _id: string; billNumber: string; amount: number; fileUrl?: string; wcc?: { uploaded: boolean; fileUrl?: string }; measurementSheet?: { uploaded: boolean; fileUrl?: string } };
  cwcRfId?: { _id: string; cwcRfNumber: string; status: string; cwcRequest?: { requestedAmount: number; requestedTenure: number; urgencyLevel: string; reasonForFunding: string }; invoiceDetails?: { invoiceNumber: string; invoiceAmount: number; invoiceDate: string }; buyerVerification?: { approvedAmount: number; repaymentTimeline: number }; interestPreference?: { minRate: number; maxRate: number }; opsVerification?: Record<string, unknown> };
  riskAssessment?: { riskScore: number; riskLevel: string; assessment: string; recommendation: string };
  cwcaf?: { riskCategory: string; generatedAt: string; rmtRecommendation?: { suggestedInterestRateMin?: number; suggestedInterestRateMax?: number; comments?: string } };
  statusHistory?: { status: string; changedAt: string; changedBy?: { name?: string }; notes?: string }[];
  epcReviewNotes?: string;
}

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  RMT_QUEUE:           { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
  RMT_DOCUMENT_REVIEW: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  RMT_PENDING_DOCS:    { bg: "#fef9c3", text: "#713f12", dot: "#eab308" },
  RMT_RISK_ANALYSIS:   { bg: "#f0fdf4", text: "#166534", dot: "#22c55e" },
  RMT_APPROVED:        { bg: "#dcfce7", text: "#15803d", dot: "#16a34a" },
  RMT_REJECTED:        { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444" },
  RMT_NEEDS_REVIEW:    { bg: "#fdf4ff", text: "#7e22ce", dot: "#a855f7" },
  CWCAF_READY:         { bg: "#f0fdfa", text: "#115e59", dot: "#14b8a6" },
  EPC_VERIFIED:        { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" },
  READY_FOR_COMPANY_REVIEW: { bg: "#f5f3ff", text: "#5b21b6", dot: "#8b5cf6" },
  SHARED_WITH_NBFC:    { bg: "#fdf2f8", text: "#9d174d", dot: "#ec4899" },
  DISBURSED:           { bg: "#f0fdf4", text: "#14532d", dot: "#15803d" },
};

const RMT_FILTER_TABS = [
  { key: "all",     label: "All Cases" },
  { key: "RMT_QUEUE",           label: "In Queue" },
  { key: "RMT_DOCUMENT_REVIEW,RMT_RISK_ANALYSIS,RMT_PENDING_DOCS", label: "Under Review" },
  { key: "RMT_APPROVED",        label: "Approved" },
  { key: "CWCAF_READY",         label: "CWCAF Ready" },
  { key: "RMT_REJECTED",        label: "Rejected" },
];

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || { bg: "#f3f4f6", text: "#374151", dot: "#9ca3af" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: c.bg, color: c.text, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ fontSize: 12, color: "#94a3b8", minWidth: 140, flexShrink: 0, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{title}</p>
      {children}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const RmtCasesPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Case | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [filterTab, setFilterTab] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await casesApi.getCases();
      // getCases returns array or {data: array}
      const arr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setCases(arr);
    } catch {
      toast.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  const openCase = async (c: Case) => {
    setSelected(c);
    setLoadingDetail(true);
    try {
      const res = await casesApi.getCase(c._id);
      const detail = res.data?.data || res.data;
      setSelected(detail);
    } catch {
      toast.error("Failed to load case detail");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (caseId: string, status: string) => {
    setActionLoading(true);
    try {
      await api.patch(`/cases/${caseId}/status`, { status });
      toast.success("Status updated");
      fetchCases();
      if (selected?._id === caseId) openCase({ ...selected, status } as Case);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e?.response?.data?.error || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter cases
  const filtered = cases.filter((c) => {
    const matchesFilter = filterTab === "all" || filterTab.split(",").includes(c.status);
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      c.caseNumber?.toLowerCase().includes(q) ||
      c.subContractorId?.companyName?.toLowerCase().includes(q) ||
      c.epcId?.companyName?.toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  // Tab counts
  const countFor = (key: string) => key === "all" ? cases.length : cases.filter(c => key.split(",").includes(c.status)).length;

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const fmtAmt = (n?: number) => n ? `₹${n.toLocaleString("en-IN")}` : "—";

  return (
    <div style={{ padding: "0 0 48px", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#92400e", margin: 0 }}>RMT Cases</h1>
            <span style={{ background: "linear-gradient(135deg,#B45309,#F59E0B)", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.04em" }}>
              {cases.length} total
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>All cases routed through Risk Management Team</p>
        </div>
        <button onClick={fetchCases} style={{ fontSize: 12, color: "#B45309", border: "1px solid #fed7aa", background: "#fff7ed", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
          ↻ Refresh
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { label: "In Queue",    count: countFor("RMT_QUEUE"),    color: "#1d4ed8" },
          { label: "Under Review", count: countFor("RMT_DOCUMENT_REVIEW,RMT_RISK_ANALYSIS,RMT_PENDING_DOCS"), color: "#92400e" },
          { label: "Approved",   count: countFor("RMT_APPROVED"),  color: "#15803d" },
          { label: "CWCAF Ready", count: countFor("CWCAF_READY"),  color: "#0369a1" },
          { label: "Rejected",   count: countFor("RMT_REJECTED"),  color: "#991b1b" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</span>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs + search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {RMT_FILTER_TABS.map(tab => (
          <button key={tab.key} onClick={() => setFilterTab(tab.key)} style={{
            fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 20, cursor: "pointer", transition: "all 0.15s",
            background: filterTab === tab.key ? "#B45309" : "#fff",
            color: filterTab === tab.key ? "#fff" : "#6b7280",
            border: filterTab === tab.key ? "1px solid #B45309" : "1px solid #e2e8f0",
          }}>
            {tab.label} ({countFor(tab.key)})
          </button>
        ))}
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search case, seller, EPC…"
          style={{ marginLeft: "auto", fontSize: 13, padding: "6px 14px", border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", minWidth: 220, color: "#374151" }}
        />
      </div>

      {/* Main layout */}
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: 16, alignItems: "start" }}>

        {/* Case list */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading cases…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No cases found</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["Case #", "Sub-Contractor", "EPC", "Bill Amount", "Requested", "Status", "Date"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c._id}
                    onClick={() => openCase(c)}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer",
                      background: selected?._id === c._id ? "#fff7ed" : "transparent",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={e => { if (selected?._id !== c._id) (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                    onMouseLeave={e => { if (selected?._id !== c._id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#1e293b" }}>{c.caseNumber || "—"}</td>
                    <td style={{ padding: "12px 14px", color: "#374151" }}>{c.subContractorId?.companyName || "—"}</td>
                    <td style={{ padding: "12px 14px", color: "#374151" }}>{c.epcId?.companyName || "—"}</td>
                    <td style={{ padding: "12px 14px", color: "#374151" }}>{fmtAmt(c.billId?.amount)}</td>
                    <td style={{ padding: "12px 14px", color: "#7c3aed", fontWeight: 600 }}>{fmtAmt(c.cwcRfId?.cwcRequest?.requestedAmount)}</td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding: "12px 14px", color: "#94a3b8", fontSize: 12 }}>{fmtDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ position: "sticky", top: 24, maxHeight: "calc(100vh - 100px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Panel header */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px 12px 0 0", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "none" }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", margin: 0 }}>{selected.caseNumber}</p>
                {selected.rmtCaseNumber && <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>RMT: {selected.rmtCaseNumber}</p>}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <StatusBadge status={selected.status} />
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
              </div>
            </div>

            {loadingDetail ? (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0 0 12px 12px", padding: 32, textAlign: "center", color: "#94a3b8" }}>Loading…</div>
            ) : (
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "12px 12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>

                {/* Parties */}
                <Section title="Parties">
                  <InfoRow label="Sub-Contractor" value={selected.subContractorId?.companyName} />
                  <InfoRow label="Owner" value={selected.subContractorId?.ownerName} />
                  <InfoRow label="SC GSTIN" value={selected.subContractorId?.gstin} />
                  <InfoRow label="EPC / Buyer" value={selected.epcId?.companyName} />
                  <InfoRow label="EPC GSTIN" value={selected.epcId?.gstin} />
                </Section>

                {/* Bill */}
                <Section title="RA Bill">
                  <InfoRow label="Bill Number" value={selected.billId?.billNumber} />
                  <InfoRow label="Bill Amount" value={fmtAmt(selected.billId?.amount)} />
                  <InfoRow label="RA Bill" value={selected.billId?.fileUrl ? <a href={selected.billId.fileUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>View PDF ↗</a> : "—"} />
                  <InfoRow label="WCC" value={selected.billId?.wcc?.uploaded ? (selected.billId.wcc.fileUrl ? <a href={selected.billId.wcc.fileUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>View ↗</a> : "Uploaded") : "Not uploaded"} />
                  <InfoRow label="Measurement Sheet" value={selected.billId?.measurementSheet?.uploaded ? (selected.billId.measurementSheet.fileUrl ? <a href={selected.billId.measurementSheet.fileUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>View ↗</a> : "Uploaded") : "Not uploaded"} />
                </Section>

                {/* CWCRF Request */}
                {selected.cwcRfId && (
                  <Section title="CWCRF Details">
                    <InfoRow label="CWCRF #" value={selected.cwcRfId.cwcRfNumber} />
                    <InfoRow label="CWCRF Status" value={<StatusBadge status={selected.cwcRfId.status || ""} />} />
                    <InfoRow label="Invoice No." value={selected.cwcRfId.invoiceDetails?.invoiceNumber} />
                    <InfoRow label="Invoice Amount" value={fmtAmt(selected.cwcRfId.invoiceDetails?.invoiceAmount)} />
                    <InfoRow label="Invoice Date" value={fmtDate(selected.cwcRfId.invoiceDetails?.invoiceDate)} />
                    <InfoRow label="Requested Amount" value={<span style={{ color: "#7c3aed", fontWeight: 700 }}>{fmtAmt(selected.cwcRfId.cwcRequest?.requestedAmount)}</span>} />
                    <InfoRow label="Requested Tenure" value={selected.cwcRfId.cwcRequest?.requestedTenure ? `${selected.cwcRfId.cwcRequest.requestedTenure} days` : undefined} />
                    <InfoRow label="Urgency" value={selected.cwcRfId.cwcRequest?.urgencyLevel} />
                    <InfoRow label="Reason for Funding" value={selected.cwcRfId.cwcRequest?.reasonForFunding} />
                    {selected.cwcRfId.buyerVerification?.approvedAmount && (
                      <>
                        <InfoRow label="Buyer Approved Amt" value={<span style={{ color: "#15803d", fontWeight: 700 }}>{fmtAmt(selected.cwcRfId.buyerVerification.approvedAmount)}</span>} />
                        <InfoRow label="Repayment Timeline" value={`${selected.cwcRfId.buyerVerification.repaymentTimeline} days`} />
                      </>
                    )}
                    {selected.cwcRfId.interestPreference && (
                      <InfoRow label="Interest Range" value={`${selected.cwcRfId.interestPreference.minRate}% – ${selected.cwcRfId.interestPreference.maxRate}% p.a.`} />
                    )}
                  </Section>
                )}

                {/* Risk Assessment */}
                {selected.riskAssessment && (
                  <Section title="Risk Assessment">
                    <InfoRow label="Risk Score" value={
                      <span style={{ fontWeight: 700, color: selected.riskAssessment.riskLevel === "high" ? "#ef4444" : selected.riskAssessment.riskLevel === "medium" ? "#f59e0b" : "#10b981" }}>
                        {selected.riskAssessment.riskScore} / 100
                      </span>
                    } />
                    <InfoRow label="Risk Level" value={<span style={{ textTransform: "capitalize" }}>{selected.riskAssessment.riskLevel}</span>} />
                    <InfoRow label="Assessment" value={selected.riskAssessment.assessment} />
                    <InfoRow label="Recommendation" value={selected.riskAssessment.recommendation} />
                  </Section>
                )}

                {/* CWCAF */}
                {selected.cwcaf && (
                  <Section title="CWCAF">
                    <InfoRow label="Risk Category" value={
                      <span style={{ fontWeight: 700, color: selected.cwcaf.riskCategory === "HIGH" ? "#ef4444" : selected.cwcaf.riskCategory === "MEDIUM" ? "#f59e0b" : "#10b981" }}>
                        {selected.cwcaf.riskCategory}
                      </span>
                    } />
                    <InfoRow label="Generated At" value={fmtDate(selected.cwcaf.generatedAt)} />
                    {selected.cwcaf.rmtRecommendation?.suggestedInterestRateMin && (
                      <InfoRow label="Suggested Rate" value={`${selected.cwcaf.rmtRecommendation.suggestedInterestRateMin}% – ${selected.cwcaf.rmtRecommendation.suggestedInterestRateMax}% p.a.`} />
                    )}
                    {selected.cwcaf.rmtRecommendation?.comments && (
                      <InfoRow label="Comments" value={selected.cwcaf.rmtRecommendation.comments} />
                    )}
                  </Section>
                )}

                {/* Actions */}
                <Section title="Actions">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {selected.status === "RMT_QUEUE" && (
                      <button
                        onClick={() => handleUpdateStatus(selected._id, "RMT_DOCUMENT_REVIEW")}
                        disabled={actionLoading}
                        style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 8, cursor: "pointer" }}
                      >
                        Start Document Review
                      </button>
                    )}
                    {selected.status === "RMT_DOCUMENT_REVIEW" && (
                      <button
                        onClick={() => handleUpdateStatus(selected._id, "RMT_RISK_ANALYSIS")}
                        disabled={actionLoading}
                        style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", borderRadius: 8, cursor: "pointer" }}
                      >
                        Begin Risk Analysis
                      </button>
                    )}
                    {["RMT_DOCUMENT_REVIEW", "RMT_RISK_ANALYSIS"].includes(selected.status) && (
                      <button
                        onClick={() => handleUpdateStatus(selected._id, "RMT_PENDING_DOCS")}
                        disabled={actionLoading}
                        style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", background: "#fef9c3", color: "#713f12", border: "1px solid #fef08a", borderRadius: 8, cursor: "pointer" }}
                      >
                        Request Docs
                      </button>
                    )}
                    {selected.status === "RMT_RISK_ANALYSIS" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selected._id, "RMT_APPROVED")}
                          disabled={actionLoading}
                          style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 8, cursor: "pointer" }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selected._id, "RMT_REJECTED")}
                          disabled={actionLoading}
                          style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 8, cursor: "pointer" }}
                        >
                          ✗ Reject
                        </button>
                      </>
                    )}
                    {selected.billId?.fileUrl && (
                      <a href={selected.billId.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", textDecoration: "none" }}>
                        View Bill ↗
                      </a>
                    )}
                  </div>
                </Section>

                {/* Timeline */}
                {selected.statusHistory && selected.statusHistory.length > 0 && (
                  <Section title="Status Timeline">
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {[...selected.statusHistory].reverse().map((h, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, paddingBottom: 10, position: "relative" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#B45309", marginTop: 3, flexShrink: 0 }} />
                            {i < selected.statusHistory!.length - 1 && <div style={{ width: 1, flex: 1, background: "#e2e8f0", marginTop: 2 }} />}
                          </div>
                          <div style={{ flex: 1, paddingBottom: 4 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: "0 0 2px" }}>{h.status.replace(/_/g, " ")}</p>
                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{new Date(h.changedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}{h.changedBy?.name ? ` · ${h.changedBy.name}` : ""}</p>
                            {h.notes && <p style={{ fontSize: 11, color: "#64748b", margin: "2px 0 0", fontStyle: "italic" }}>{h.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RmtCasesPage;
