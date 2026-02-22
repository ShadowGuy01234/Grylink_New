import React, { useState, useEffect, useCallback } from "react";
import { careerApi } from "../api";
import toast from "react-hot-toast";

// ── Types ────────────────────────────────────────────────────────────────────

interface Application {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department?: string;
  experience: string;
  currentCompany?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: "new" | "reviewed" | "interview" | "rejected" | "hired";
  adminNotes?: string;
  reviewedBy?: { name: string; email: string };
  reviewedAt?: string;
  createdAt: string;
}

interface Stats {
  stats: { _id: string; count: number }[];
  total: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  new:       { label: "New",       color: "#1d4ed8", bg: "#eff6ff", dot: "#3b82f6" },
  reviewed:  { label: "Reviewed",  color: "#92400e", bg: "#fffbeb", dot: "#f59e0b" },
  interview: { label: "Interview", color: "#065f46", bg: "#ecfdf5", dot: "#10b981" },
  rejected:  { label: "Rejected",  color: "#991b1b", bg: "#fef2f2", dot: "#ef4444" },
  hired:     { label: "Hired",     color: "#1e1b4b", bg: "#f5f3ff", dot: "#8b5cf6" },
};

const STATUS_OPTIONS = ["new", "reviewed", "interview", "rejected", "hired"];

// ── Detail Drawer ────────────────────────────────────────────────────────────

interface DrawerProps {
  app: Application;
  onClose: () => void;
  onUpdate: (updated: Application) => void;
}

function ApplicationDrawer({ app, onClose, onUpdate }: DrawerProps) {
  const [status, setStatus] = useState(app.status);
  const [notes, setNotes] = useState(app.adminNotes || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await careerApi.updateApplication(app._id, { status, adminNotes: notes });
      onUpdate(res.data);
      toast.success("Application updated");
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "flex-end" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 560, height: "100%", background: "#fff",
        overflowY: "auto", padding: 28, display: "flex", flexDirection: "column", gap: 20,
        boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 20, color: "#111827", margin: 0 }}>{app.name}</h2>
            <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>{app.role} · {app.department}</p>
          </div>
          <button onClick={onClose} style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", background: "#f9fafb", fontSize: 16, color: "#6b7280" }}>✕</button>
        </div>

        {/* Status badge */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: cfg.color, background: cfg.bg }}>
            {cfg.label}
          </span>
          <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 12, background: "#f3f4f6", color: "#6b7280" }}>
            Applied: {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>

        {/* Contact info */}
        <div style={{ background: "#f9fafb", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <h4 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Contact Details</h4>
          <InfoRow label="Email" value={<a href={`mailto:${app.email}`} style={{ color: "#1d4ed8" }}>{app.email}</a>} />
          <InfoRow label="Phone" value={<a href={`tel:${app.phone}`} style={{ color: "#1d4ed8" }}>{app.phone}</a>} />
          <InfoRow label="Experience" value={app.experience} />
          {app.currentCompany && <InfoRow label="Current Company" value={app.currentCompany} />}
        </div>

        {/* Links */}
        {(app.linkedinUrl || app.portfolioUrl || app.resumeUrl) && (
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <h4 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Links</h4>
            {app.linkedinUrl && <InfoRow label="LinkedIn" value={<a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8" }}>View Profile ↗</a>} />}
            {app.portfolioUrl && <InfoRow label="Portfolio" value={<a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8" }}>View ↗</a>} />}
            {app.resumeUrl && <InfoRow label="Resume" value={<a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", fontWeight: 600 }}>Download / View ↗</a>} />}
          </div>
        )}

        {/* Cover letter */}
        {app.coverLetter && (
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: 16 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Cover Letter</h4>
            <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{app.coverLetter}</p>
          </div>
        )}

        {/* Admin actions */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>Update Status</h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STATUS_OPTIONS.map((s) => {
              const c = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s as Application["status"])}
                  style={{
                    padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    color: status === s ? c.color : "#6b7280",
                    background: status === s ? c.bg : "#f3f4f6",
                    border: status === s ? `1.5px solid ${c.dot}` : "1.5px solid #e5e7eb",
                    transition: "all 0.15s",
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Admin Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add internal notes about this applicant..."
              style={{
                width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 10,
                fontSize: 13, color: "#374151", resize: "vertical", outline: "none", boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 24px", borderRadius: 10, background: "#0A2463", color: "#fff",
              fontWeight: 600, fontSize: 14, border: "none", cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {app.reviewedBy && (
            <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
              Last updated by {app.reviewedBy.name} on {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString("en-IN") : "—"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
      <span style={{ color: "#9ca3af", width: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#374151", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function CareerApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterRole)   params.role   = filterRole;
      if (search)       params.search = search;

      const [appsRes, statsRes] = await Promise.all([
        careerApi.getApplications(params),
        careerApi.getStats(),
      ]);
      setApplications(appsRes.data.applications);
      setStats(statsRes.data);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterRole, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = (updated: Application) => {
    setApplications((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
    setSelectedApp(updated);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this application?")) return;
    try {
      await careerApi.deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a._id !== id));
      if (selectedApp?._id === id) setSelectedApp(null);
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  // ── Stat cards ──
  const statTotal = stats?.total ?? 0;
  const countByStatus = (s: string) => stats?.stats.find((x) => x._id === s)?.count ?? 0;

  return (
    <>
      {selectedApp && (
        <ApplicationDrawer
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={handleUpdate}
        />
      )}

      <div style={{ padding: "24px 28px", minHeight: "100%", background: "#f8fafc" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontWeight: 700, fontSize: 24, color: "#0A2463", margin: 0 }}>Career Applications</h1>
          <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 0" }}>
            Review and manage job applications submitted through gryork.com/careers
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total", value: statTotal, color: "#0A2463", bg: "#eff6ff" },
            { label: "New", value: countByStatus("new"), ...{ color: STATUS_CONFIG.new.color, bg: STATUS_CONFIG.new.bg } },
            { label: "Interview", value: countByStatus("interview"), ...{ color: STATUS_CONFIG.interview.color, bg: STATUS_CONFIG.interview.bg } },
            { label: "Hired", value: countByStatus("hired"), ...{ color: STATUS_CONFIG.hired.color, bg: STATUS_CONFIG.hired.bg } },
            { label: "Rejected", value: countByStatus("rejected"), ...{ color: STATUS_CONFIG.rejected.color, bg: STATUS_CONFIG.rejected.bg } },
          ].map((s) => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "16px 18px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", marginBottom: 20, border: "1px solid #e5e7eb", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, flex: 1, minWidth: 240 }}>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, role…"
              style={{ flex: 1, padding: "8px 14px", border: "1px solid #e5e7eb", borderRadius: 9, fontSize: 13, outline: "none" }}
            />
            <button type="submit" style={{ padding: "8px 16px", background: "#0A2463", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Search
            </button>
            {search && (
              <button type="button" onClick={() => { setSearch(""); setSearchInput(""); }}
                style={{ padding: "8px 12px", background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: 9, fontSize: 13, cursor: "pointer" }}>
                Clear
              </button>
            )}
          </form>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: "8px 14px", border: "1px solid #e5e7eb", borderRadius: 9, fontSize: 13, background: "#fff", outline: "none", cursor: "pointer" }}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
          </select>

          <input
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            placeholder="Filter by role…"
            style={{ padding: "8px 14px", border: "1px solid #e5e7eb", borderRadius: 9, fontSize: 13, outline: "none", width: 180 }}
          />

          <button onClick={fetchData} style={{ padding: "8px 16px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 9, fontSize: 13, cursor: "pointer" }}>
            Refresh
          </button>
        </div>

        {/* ── Table ── */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>Loading applications…</div>
          ) : applications.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <p style={{ color: "#9ca3af", margin: 0 }}>No applications found</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                  {["Applicant", "Role", "Experience", "Applied On", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app, i) => {
                  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.new;
                  return (
                    <tr
                      key={app._id}
                      style={{ borderBottom: i < applications.length - 1 ? "1px solid #f3f4f6" : "none", transition: "background 0.1s", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{app.name}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{app.email}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{app.phone}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{app.role}</div>
                        {app.department && <div style={{ fontSize: 12, color: "#9ca3af" }}>{app.department}</div>}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>{app.experience}</td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "#6b7280" }}>
                        {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                          color: cfg.color, background: cfg.bg,
                        }}>
                          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: cfg.dot, marginRight: 5, verticalAlign: "middle" }} />
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => setSelectedApp(app)}
                            style={{ padding: "6px 14px", background: "#0A2463", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(app._id)}
                            style={{ padding: "6px 12px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, cursor: "pointer" }}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <p style={{ textAlign: "right", fontSize: 12, color: "#9ca3af", marginTop: 12 }}>
          Showing {applications.length} application{applications.length !== 1 ? "s" : ""}
          {statTotal > applications.length ? ` of ${statTotal} total` : ""}
        </p>
      </div>
    </>
  );
}
