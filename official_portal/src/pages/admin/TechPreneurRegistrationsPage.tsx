import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { techpreneurApi } from "../../api";
import { SessionsTab } from "./techpreneur/SessionsTab";
import { AnnouncementsTab } from "./techpreneur/AnnouncementsTab";
import { ProjectsTab } from "./techpreneur/ProjectsTab";
import { ReferralsTab } from "./techpreneur/ReferralsTab";
import { PromoCodesTab } from "./techpreneur/PromoCodesTab";
import {
  CheckCircle2, Search, Filter, XCircle, Clock, FileText, PlusCircle,
  AlertCircle, Pencil, ToggleLeft, ToggleRight
} from "lucide-react";

interface Registration {
  _id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  year: string;
  trackPreference: string;
  transactionId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  feeAmount: number;
  registrationPhase: string;
  paymentVerified: boolean;
  dashboardAccess: boolean;
  status: string;
  notes: string;
  referralCode?: string;
  usedReferralCode?: string;
  assignedSPOC: string;
  assignedGroup: string;
  welcomeEmailSent?: boolean;
  createdAt: string;
}

const emptyEdit: Partial<Registration> = {
  name: "", email: "", phone: "", college: "", branch: "",
  year: "1st Year", trackPreference: "AI + Web Development",
  feeAmount: 1769, registrationPhase: "standard",
  razorpayPaymentId: "", razorpayOrderId: "", transactionId: "",
  status: "pending", paymentVerified: false, dashboardAccess: false,
  notes: "", assignedSPOC: "", assignedGroup: "",
};

export default function TechPreneurRegistrationsPage() {
  const [activeTab, setActiveTab] = useState("registrations");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Manual register modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualSuccess, setManualSuccess] = useState<string | null>(null);
  const [manualForm, setManualForm] = useState({
    name: "", email: "", phone: "", college: "", branch: "",
    year: "1st Year", trackPreference: "AI + Web Development",
    razorpayPaymentId: "", razorpayOrderId: "", feeAmount: 1769,
    usedReferralCode: "",
  });

  // Edit modal
  const [editTarget, setEditTarget] = useState<Registration | null>(null);
  const [editForm, setEditForm] = useState<Partial<Registration>>(emptyEdit);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await techpreneurApi.getRegistrations({
        search,
        status: statusFilter || undefined,
        page,
        limit: 50,
      });
      setRegistrations(res.data.items);
      setStats(res.data.stats || {});
      setTotalPages(res.data.pagination?.pages || res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegistrations(); }, [search, statusFilter, page]);

  const handleVerify = async (id: string) => {
    if (!window.confirm("Mark this payment as verified and grant dashboard access?")) return;
    try {
      await techpreneurApi.editRegistration(id, {
        paymentVerified: true,
        status: "confirmed",
        dashboardAccess: true,
      });
      fetchRegistrations();
    } catch (err) {
      alert("Failed to verify payment");
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("Reject this registration?")) return;
    try {
      await techpreneurApi.editRegistration(id, { status: "rejected" });
      fetchRegistrations();
    } catch (err) {
      alert("Failed to reject registration");
    }
  };

  const handleToggleDashboard = async (reg: Registration) => {
    const action = reg.dashboardAccess ? "revoke" : "grant";
    if (!window.confirm(`${action === "grant" ? "Grant" : "Revoke"} dashboard access for ${reg.name}?`)) return;
    try {
      await techpreneurApi.editRegistration(reg._id, { dashboardAccess: !reg.dashboardAccess });
      fetchRegistrations();
    } catch (err) {
      alert("Failed to update dashboard access");
    }
  };

  const openEdit = (reg: Registration) => {
    setEditTarget(reg);
    setEditForm({ ...reg });
    setEditError(null);
    setEditSuccess(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditError(null);
    setEditSuccess(null);
    setEditLoading(true);
    try {
      await techpreneurApi.editRegistration(editTarget._id, editForm);
      setEditSuccess("✅ Registration updated successfully.");
      fetchRegistrations();
    } catch (err: any) {
      setEditError(err.response?.data?.error || "Failed to update.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSendWelcomeEmail = async (reg: Registration) => {
    if (!window.confirm(`Send welcome & referral email to ${reg.name} (${reg.email})?`)) return;
    try {
      await techpreneurApi.sendWelcomeEmail(reg._id);
      alert("✅ Welcome email sent successfully!");
      fetchRegistrations();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to send email");
    }
  };

  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);
    setManualSuccess(null);
    setManualLoading(true);
    try {
      await techpreneurApi.manualRegister(manualForm);
      setManualSuccess(`✅ Registration saved for ${manualForm.name} (${manualForm.email})`);
      setManualForm({ name: "", email: "", phone: "", college: "", branch: "", year: "1st Year", trackPreference: "AI + Web Development", razorpayPaymentId: "", razorpayOrderId: "", feeAmount: 1769, usedReferralCode: "" });
      fetchRegistrations();
    } catch (err: any) {
      setManualError(err.response?.data?.error || "Failed to save registration.");
    } finally {
      setManualLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TechPreneur Operations</h1>
          <p className="text-gray-500 text-sm mt-1">Manage attendees, sessions, announcements, and track projects</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/techpreneur/certificate-builder"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Certificate Builder
          </Link>
          <Link
            to="/admin/techpreneur/certificates"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Issue Certificates
          </Link>
          <button
            onClick={() => { setShowManualModal(true); setManualError(null); setManualSuccess(null); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Add Manual Registration
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto hide-scrollbar">
        {[
          { id: "registrations", label: "Registrations & Revenue" },
          { id: "sessions", label: "Sessions" },
          { id: "announcements", label: "Announcements" },
          { id: "projects", label: "Projects" },
          { id: "referrals", label: "Referrals" },
          { id: "promocodes", label: "Promo Codes" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 min-w-[150px] py-2.5 px-4 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "sessions" && <SessionsTab />}
      {activeTab === "announcements" && <AnnouncementsTab />}
      {activeTab === "projects" && <ProjectsTab />}
      {activeTab === "referrals" && <ReferralsTab />}
      {activeTab === "promocodes" && <PromoCodesTab />}

      {activeTab === "registrations" && (
        <>
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Registrations", value: stats.total || 0, cls: "text-gray-900" },
          { label: "Verified / Confirmed", value: stats.confirmed || 0, cls: "text-green-600" },
          { label: "Pending Payment", value: stats.pending || 0, cls: "text-amber-500" },
          { label: "Total Revenue", value: `₹${stats.totalRevenue || 0}`, cls: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex gap-4 items-center bg-gray-50/50 flex-wrap">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or Payment ID..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Track</th>
                <th className="px-4 py-3 font-medium">Payment Info</th>
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Welcome Email</th>
                <th className="px-4 py-3 font-medium">Dashboard</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading registrations...</td></tr>
              ) : registrations.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">No registrations found.</td></tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{reg.name}</p>
                        {reg.referralCode && (
                          <span className="text-[10px] font-mono bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase tracking-wider" title="Referral Code">
                            {reg.referralCode}
                          </span>
                        )}
                        {reg.usedReferralCode && (
                          <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase tracking-wider" title="Used Promo/Referral Code">
                            Used: {reg.usedReferralCode}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs">{reg.college}</p>
                      <p className="text-gray-400 text-xs">{reg.branch} · {reg.year}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{reg.email}</p>
                      <p className="text-gray-500 text-xs">{reg.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {reg.trackPreference}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-gray-900 font-medium text-xs">PID: {reg.razorpayPaymentId || reg.transactionId || "—"}</p>
                      <p className="text-gray-500 text-xs font-mono">OID: {reg.razorpayOrderId || "—"}</p>
                      <p className="text-green-600 text-xs font-medium mt-0.5">₹{reg.feeAmount} · {reg.registrationPhase}</p>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://grylink-backend.vercel.app/api/techpreneur/invoice/${reg._id}`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        <FileText className="w-4 h-4" /> View Invoice
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {reg.status === "confirmed" ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle2 className="w-4 h-4" /> Confirmed</span>
                      ) : reg.status === "rejected" ? (
                        <span className="flex items-center gap-1 text-red-600 text-xs font-medium"><XCircle className="w-4 h-4" /> Rejected</span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-500 text-xs font-medium"><Clock className="w-4 h-4" /> Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        {reg.welcomeEmailSent ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500 text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3" /> Not Sent
                          </span>
                        )}
                        {reg.status === "confirmed" && !reg.welcomeEmailSent && (
                          <button
                            onClick={() => handleSendWelcomeEmail(reg)}
                            className="text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded font-medium transition-colors"
                          >
                            Send Email
                          </button>
                        )}
                        {reg.status === "confirmed" && reg.welcomeEmailSent && (
                          <button
                            onClick={() => handleSendWelcomeEmail(reg)}
                            className="text-[9px] text-gray-400 hover:text-indigo-600 underline transition-colors"
                          >
                            Resend
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleDashboard(reg)}
                        title={reg.dashboardAccess ? "Revoke dashboard access" : "Grant dashboard access"}
                        className={`flex items-center gap-1 text-xs font-medium transition-colors ${reg.dashboardAccess ? "text-green-600 hover:text-red-600" : "text-gray-400 hover:text-green-600"}`}
                      >
                        {reg.dashboardAccess
                          ? <><ToggleRight className="w-5 h-5" /> Active</>
                          : <><ToggleLeft className="w-5 h-5" /> Off</>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => openEdit(reg)}
                        className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-xs font-medium transition-colors gap-1"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      {reg.status === "pending" && (
                        <>
                          <button onClick={() => handleVerify(reg._id)} className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded text-xs font-medium transition-colors">
                            Verify
                          </button>
                          <button onClick={() => handleReject(reg._id)} className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded text-xs font-medium transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <span className="text-sm text-gray-500 font-medium">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Registration Modal ── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setEditTarget(null)}>
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Registration</h2>
                <p className="text-sm text-gray-500 mt-0.5">{editTarget.name} · {editTarget.email}</p>
              </div>
              <button onClick={() => setEditTarget(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
            </div>

            {editError && (
              <div className="flex items-start gap-2 bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{editError}
              </div>
            )}
            {editSuccess && (
              <div className="flex items-start gap-2 bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 mb-4 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />{editSuccess}
              </div>
            )}

            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                  <input required className={inputCls} value={editForm.name || ""} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" className={inputCls} value={editForm.email || ""} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
                  <input required className={inputCls} value={editForm.phone || ""} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fee Amount (₹) *</label>
                  <input required type="number" className={inputCls} value={editForm.feeAmount || ""} onChange={e => setEditForm(p => ({ ...p, feeAmount: Number(e.target.value) }))} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">College *</label>
                <input required className={inputCls} value={editForm.college || ""} onChange={e => setEditForm(p => ({ ...p, college: e.target.value }))} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Branch *</label>
                  <input required className={inputCls} value={editForm.branch || ""} onChange={e => setEditForm(p => ({ ...p, branch: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Year *</label>
                  <select className={inputCls} value={editForm.year || ""} onChange={e => setEditForm(p => ({ ...p, year: e.target.value }))}>
                    <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Track *</label>
                  <select className={inputCls} value={editForm.trackPreference || ""} onChange={e => setEditForm(p => ({ ...p, trackPreference: e.target.value }))}>
                    <option>AI + Web Development</option>
                    <option>Startup &amp; Entrepreneurship</option>
                    <option>Industry Productivity Tools</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Razorpay Payment ID</label>
                  <input className={`${inputCls} font-mono`} placeholder="pay_xxx" value={editForm.razorpayPaymentId || ""} onChange={e => setEditForm(p => ({ ...p, razorpayPaymentId: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Razorpay Order ID</label>
                  <input className={`${inputCls} font-mono`} placeholder="order_xxx" value={editForm.razorpayOrderId || ""} onChange={e => setEditForm(p => ({ ...p, razorpayOrderId: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Used Promo / Referral Code</label>
                <input className={`${inputCls} font-mono`} placeholder="Code used during checkout" value={editForm.usedReferralCode || ""} onChange={e => setEditForm(p => ({ ...p, usedReferralCode: e.target.value.toUpperCase().trim() }))} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select className={inputCls} value={editForm.status || ""} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Registration Phase</label>
                  <select className={inputCls} value={editForm.registrationPhase || ""} onChange={e => setEditForm(p => ({ ...p, registrationPhase: e.target.value }))}>
                    <option value="early">Early Bird</option>
                    <option value="standard">Standard / Founding</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Assigned SPOC</label>
                  <input className={inputCls} value={editForm.assignedSPOC || ""} onChange={e => setEditForm(p => ({ ...p, assignedSPOC: e.target.value }))} />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded accent-green-600"
                    checked={!!editForm.paymentVerified}
                    onChange={e => setEditForm(p => ({ ...p, paymentVerified: e.target.checked }))}
                  />
                  <span className="text-sm font-medium text-gray-700">Payment Verified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded accent-blue-600"
                    checked={!!editForm.dashboardAccess}
                    onChange={e => setEditForm(p => ({ ...p, dashboardAccess: e.target.checked }))}
                  />
                  <span className="text-sm font-medium text-gray-700">Dashboard Access</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes (internal)</label>
                <textarea className={inputCls} rows={2} value={editForm.notes || ""} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={editLoading} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
                  {editLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : "Save Changes"}
                </button>
                <button type="button" onClick={() => setEditTarget(null)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Manual Registration Modal ── */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowManualModal(false)}>
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Manual Registration</h2>
                <p className="text-sm text-orange-600 font-medium mt-0.5">For students who already paid but registration failed</p>
              </div>
              <button onClick={() => setShowManualModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
            </div>

            {manualError && (
              <div className="flex items-start gap-2 bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{manualError}
              </div>
            )}
            {manualSuccess && (
              <div className="flex items-start gap-2 bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 mb-4 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />{manualSuccess}
              </div>
            )}

            <form onSubmit={handleManualRegister} className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-700">
                ⚠️ Get the student details from your <strong>Razorpay Dashboard → Payments</strong>. The Payment ID is mandatory.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Razorpay Payment ID *</label>
                  <input required className={`${inputCls} font-mono`} placeholder="pay_xxxxxxxxxxxxxxx" value={manualForm.razorpayPaymentId} onChange={e => setManualForm(p => ({ ...p, razorpayPaymentId: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Razorpay Order ID (optional)</label>
                  <input className={`${inputCls} font-mono`} placeholder="order_xxxxxxxxxxxxxxx" value={manualForm.razorpayOrderId} onChange={e => setManualForm(p => ({ ...p, razorpayOrderId: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                  <input required className={inputCls} placeholder="Student Name" value={manualForm.name} onChange={e => setManualForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" className={inputCls} placeholder="student@example.com" value={manualForm.email} onChange={e => setManualForm(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone (10 digits) *</label>
                  <input required className={inputCls} placeholder="9876543210" value={manualForm.phone} onChange={e => setManualForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fee Amount (₹) *</label>
                  <input required type="number" className={inputCls} value={manualForm.feeAmount} onChange={e => setManualForm(p => ({ ...p, feeAmount: Number(e.target.value) }))} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">College *</label>
                <input required className={inputCls} placeholder="College Name" value={manualForm.college} onChange={e => setManualForm(p => ({ ...p, college: e.target.value }))} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Branch *</label>
                  <input required className={inputCls} placeholder="CSE" value={manualForm.branch} onChange={e => setManualForm(p => ({ ...p, branch: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Year *</label>
                  <select className={inputCls} value={manualForm.year} onChange={e => setManualForm(p => ({ ...p, year: e.target.value }))}>
                    <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Track *</label>
                  <select className={inputCls} value={manualForm.trackPreference} onChange={e => setManualForm(p => ({ ...p, trackPreference: e.target.value }))}>
                    <option>AI + Web Development</option>
                    <option>Startup &amp; Entrepreneurship</option>
                    <option>Industry Productivity Tools</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Used Promo / Referral Code (optional)</label>
                <input className={`${inputCls} font-mono`} placeholder="e.g. SAVE500, JOHN123" value={manualForm.usedReferralCode} onChange={e => setManualForm(p => ({ ...p, usedReferralCode: e.target.value.toUpperCase().trim() }))} />
              </div>

              <button type="submit" disabled={manualLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
                {manualLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : "Save Registration"}
              </button>
            </form>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
