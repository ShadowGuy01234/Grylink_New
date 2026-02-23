import { useState, useEffect, useCallback } from "react";
import { opsApi } from "../../api";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineRefresh,
} from "react-icons/hi";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineEnvelope,
  HiOutlineBuildingLibrary,
  HiOutlineXMark,
} from "react-icons/hi2";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NbfcInvite {
  _id: string;
  name: string;
  code: string;
  email: string;
  phone?: string;
  status: string;
  userId?: { _id: string; name: string; email: string };
  createdAt: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
const NbfcOnboardingPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [nbfcs, setNbfcs] = useState<NbfcInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
  });

  const fetchNbfcs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await opsApi.getNbfcs();
      setNbfcs(res.data);
    } catch {
      // NBFCs endpoint might not exist yet, use empty
      setNbfcs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNbfcs();
  }, [fetchNbfcs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.ownerName || !form.email) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await opsApi.inviteNbfc({
        name: form.name,
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        address: form.address,
      });
      toast.success("NBFC onboarding link sent successfully!");
      setShowModal(false);
      setForm({ name: "", ownerName: "", email: "", phone: "", address: "" });
      fetchNbfcs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to invite NBFC");
    } finally {
      setSubmitting(false);
    }
  };

  const STATUS_COLORS: Record<
    string,
    { color: string; bg: string; label: string }
  > = {
    ACTIVE: { color: "#15803D", bg: "rgba(34,197,94,0.1)", label: "Active" },
    INACTIVE: {
      color: "#D97706",
      bg: "rgba(245,158,11,0.1)",
      label: "Pending Setup",
    },
    SUSPENDED: {
      color: "#DC2626",
      bg: "rgba(239,68,68,0.1)",
      label: "Suspended",
    },
  };

  const filtered = nbfcs.filter((n) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      n.name?.toLowerCase().includes(q) ||
      n.email?.toLowerCase().includes(q) ||
      n.code?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: nbfcs.length,
    active: nbfcs.filter((n) => n.status === "ACTIVE").length,
    pending: nbfcs.filter((n) => n.status === "INACTIVE").length,
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#0a2463",
              margin: 0,
            }}
          >
            NBFC Onboarding
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            Invite and manage NBFC lending partners
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background: "linear-gradient(135deg, #2563eb, #1e40af)",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
            transition: "all 0.15s",
          }}
        >
          <HiOutlinePlus style={{ fontSize: 18 }} />
          Onboard New NBFC
        </button>
      </div>

      {/* ── Stat pills ── */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 18px",
            borderRadius: 12,
            border: "2px solid #e5e7eb",
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <HiOutlineBuildingLibrary
            style={{ fontSize: 20, color: "#2563eb" }}
          />
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#2563eb",
                lineHeight: 1.1,
              }}
            >
              {stats.total}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6b7280",
                marginTop: 1,
              }}
            >
              Total NBFCs
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 18px",
            borderRadius: 12,
            border: "2px solid #e5e7eb",
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <HiOutlineCheckCircle style={{ fontSize: 20, color: "#15803D" }} />
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#15803D",
                lineHeight: 1.1,
              }}
            >
              {stats.active}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6b7280",
                marginTop: 1,
              }}
            >
              Active
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 18px",
            borderRadius: 12,
            border: "2px solid #e5e7eb",
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <HiOutlineClock style={{ fontSize: 20, color: "#D97706" }} />
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#D97706",
                lineHeight: 1.1,
              }}
            >
              {stats.pending}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6b7280",
                marginTop: 1,
              }}
            >
              Pending Setup
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + Refresh ── */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
      >
        <div style={{ flex: "1 1 280px", position: "relative" }}>
          <HiOutlineSearch
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              fontSize: 16,
              pointerEvents: "none",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or code…"
            style={{
              width: "100%",
              paddingLeft: 38,
              paddingRight: 14,
              paddingTop: 10,
              paddingBottom: 10,
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              fontSize: 14,
              outline: "none",
              background: "white",
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          onClick={fetchNbfcs}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            background: "white",
            fontSize: 13,
            fontWeight: 600,
            color: "#4b5563",
            cursor: "pointer",
          }}
        >
          <HiOutlineRefresh style={{ fontSize: 16 }} />
          Refresh
        </button>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {loading ? (
          <div className="page-loading" style={{ minHeight: 300 }}>
            Loading NBFCs…
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#6b7280",
            }}
          >
            <HiOutlineBuildingLibrary
              style={{ fontSize: 48, color: "#e5e7eb", marginBottom: 12 }}
            />
            <div style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>
              No NBFCs found
            </div>
            <div style={{ fontSize: 14, marginTop: 4 }}>
              Click "Onboard New NBFC" to invite your first lending partner
            </div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {[
                  "NBFC Name",
                  "Code",
                  "Email",
                  "Contact",
                  "Status",
                  "Onboarded",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#6b7280",
                      borderBottom: "1px solid #e5e7eb",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((nbfc) => {
                const sc = STATUS_COLORS[nbfc.status] || STATUS_COLORS.INACTIVE;
                return (
                  <tr
                    key={nbfc._id}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "rgba(30,90,175,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <HiOutlineBuildingLibrary
                            style={{ fontSize: 16, color: "#1E5AAF" }}
                          />
                        </div>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#1f2937",
                            fontSize: 14,
                          }}
                        >
                          {nbfc.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#4b5563",
                          background: "#f3f4f6",
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontFamily: "monospace",
                        }}
                      >
                        {nbfc.code}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 13,
                        color: "#4b5563",
                      }}
                    >
                      {nbfc.email}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 13,
                        color: "#4b5563",
                      }}
                    >
                      {nbfc.phone || "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: sc.color,
                          background: sc.bg,
                          padding: "4px 10px",
                          borderRadius: 20,
                          display: "inline-block",
                        }}
                      >
                        {sc.label}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      {new Date(nbfc.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Onboard New NBFC Modal ── */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #2563eb, #1e40af)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HiOutlineBuildingLibrary
                    style={{ fontSize: 20, color: "white" }}
                  />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#1f2937",
                      margin: 0,
                    }}
                  >
                    Onboard New NBFC
                  </h2>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                    An onboarding link will be sent to the NBFC
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: 20,
                  padding: 4,
                }}
              >
                <HiOutlineXMark />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {/* NBFC Name */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    NBFC Name <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., HDFC Finance Ltd"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>

                {/* Owner / Contact Name */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    Owner / Contact Person Name{" "}
                    <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.ownerName}
                    onChange={(e) =>
                      setForm({ ...form, ownerName: e.target.value })
                    }
                    placeholder="e.g., Rajesh Kumar"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    NBFC Email ID <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <HiOutlineEnvelope
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9ca3af",
                        fontSize: 16,
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="nbfc@example.com"
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        paddingLeft: 38,
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.15s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                      onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    />
                  </div>
                  <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                    The onboarding link will be sent to this email
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+91 9876543210"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>

                {/* Address */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 6,
                    }}
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="Office address"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
              </div>

              {/* Info box */}
              <div
                style={{
                  background: "#f0f9ff",
                  borderLeft: "4px solid #2563eb",
                  padding: "12px 16px",
                  borderRadius: "0 8px 8px 0",
                  marginTop: 20,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "#1e40af",
                    fontWeight: 600,
                    margin: "0 0 4px 0",
                  }}
                >
                  What happens when you submit?
                </p>
                <ul
                  style={{
                    fontSize: 12,
                    color: "#4b5563",
                    margin: 0,
                    paddingLeft: 16,
                    lineHeight: 1.8,
                  }}
                >
                  <li>An NBFC record is created on the platform</li>
                  <li>A user account is created (password not set yet)</li>
                  <li>An onboarding link is emailed to the NBFC</li>
                  <li>The NBFC sets their password via link.gryork.com</li>
                  <li>They can then login at partner.gryork.com</li>
                </ul>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 24,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    background: "white",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#4b5563",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "10px 24px",
                    background: submitting
                      ? "#93c5fd"
                      : "linear-gradient(135deg, #2563eb, #1e40af)",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                  }}
                >
                  {submitting ? (
                    <>
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "white",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                          display: "inline-block",
                        }}
                      />
                      Sending…
                    </>
                  ) : (
                    <>
                      <HiOutlineEnvelope style={{ fontSize: 16 }} />
                      Send Onboarding Link
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NbfcOnboardingPage;
