import { useEffect, useState } from "react";
import { techpreneurApi } from "../../api";
import { CheckCircle2, Search, Filter, XCircle, Clock, FileText, PlusCircle, AlertCircle } from "lucide-react";

interface Registration {
  _id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  trackPreference: string;
  transactionId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  feeAmount: number;
  registrationPhase: string;
  paymentVerified: boolean;
  status: string;
  createdAt: string;
}

export default function TechPreneurRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualSuccess, setManualSuccess] = useState<string | null>(null);
  const [manualForm, setManualForm] = useState({
    name: "", email: "", phone: "", college: "", branch: "",
    year: "1st Year", trackPreference: "AI + Web Development",
    razorpayPaymentId: "", razorpayOrderId: "", feeAmount: 799,
  });

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await techpreneurApi.getRegistrations({
        search,
        status: statusFilter || undefined,
      });
      setRegistrations(res.data.items);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [search, statusFilter]);

  const handleVerify = async (id: string) => {
    if (!window.confirm("Mark this payment as verified?")) return;
    try {
      await techpreneurApi.updateRegistration(id, {
        paymentVerified: true,
        status: "confirmed",
      });
      fetchRegistrations();
    } catch (err) {
      alert("Failed to verify payment");
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("Reject this registration?")) return;
    try {
      await techpreneurApi.updateRegistration(id, { status: "rejected" });
      fetchRegistrations();
    } catch (err) {
      alert("Failed to reject registration");
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
      setManualForm({ name: "", email: "", phone: "", college: "", branch: "", year: "1st Year", trackPreference: "AI + Web Development", razorpayPaymentId: "", razorpayOrderId: "", feeAmount: 799 });
      fetchRegistrations();
    } catch (err: any) {
      setManualError(err.response?.data?.error || "Failed to save registration.");
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TechPreneur Registrations</h1>
          <p className="text-gray-500 text-sm mt-1">Manage attendees and view Razorpay transactions for the 2026 Industrial Training</p>
        </div>
        <button
          onClick={() => { setShowManualModal(true); setManualError(null); setManualSuccess(null); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Add Manual Registration
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Registrations</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Verified / Confirmed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.confirmed || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Pending</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">{stats.pending || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">₹{stats.totalRevenue || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4 items-center bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or Payment ID..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Student</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Track</th>
                <th className="px-6 py-3 font-medium">Payment Info</th>
                <th className="px-6 py-3 font-medium">Invoice</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Loading registrations...
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No registrations found.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{reg.name}</p>
                      <p className="text-gray-500 text-xs">{reg.college}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{reg.email}</p>
                      <p className="text-gray-500 text-xs">{reg.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {reg.trackPreference}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-gray-900 font-medium">PID: {reg.razorpayPaymentId || reg.transactionId}</p>
                      <p className="text-gray-500 text-xs font-mono">OID: {reg.razorpayOrderId || "N/A"}</p>
                      <p className="text-green-600 text-xs font-medium mt-0.5">₹{reg.feeAmount} ({reg.registrationPhase})</p>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={`https://grylink-backend.vercel.app/api/techpreneur/invoice/${reg._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        <FileText className="w-4 h-4" /> View Invoice
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      {reg.status === "confirmed" ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Confirmed
                        </span>
                      ) : reg.status === "rejected" ? (
                        <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                          <XCircle className="w-4 h-4" /> Rejected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-500 text-xs font-medium">
                          <Clock className="w-4 h-4" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {reg.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleVerify(reg._id)}
                            className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-xs font-medium transition-colors"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleReject(reg._id)}
                            className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-md text-xs font-medium transition-colors"
                          >
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
      </div>

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
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" placeholder="pay_xxxxxxxxxxxxxxx" value={manualForm.razorpayPaymentId} onChange={e => setManualForm(p => ({ ...p, razorpayPaymentId: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Razorpay Order ID (optional)</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" placeholder="order_xxxxxxxxxxxxxxx" value={manualForm.razorpayOrderId} onChange={e => setManualForm(p => ({ ...p, razorpayOrderId: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Student Name" value={manualForm.name} onChange={e => setManualForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="student@example.com" value={manualForm.email} onChange={e => setManualForm(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone (10 digits) *</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="9876543210" value={manualForm.phone} onChange={e => setManualForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fee Amount (₹) *</label>
                  <input required type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={manualForm.feeAmount} onChange={e => setManualForm(p => ({ ...p, feeAmount: Number(e.target.value) }))} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">College *</label>
                <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="College Name" value={manualForm.college} onChange={e => setManualForm(p => ({ ...p, college: e.target.value }))} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Branch *</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="CSE" value={manualForm.branch} onChange={e => setManualForm(p => ({ ...p, branch: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Year *</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={manualForm.year} onChange={e => setManualForm(p => ({ ...p, year: e.target.value }))}>
                    <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Track *</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={manualForm.trackPreference} onChange={e => setManualForm(p => ({ ...p, trackPreference: e.target.value }))}>
                    <option>AI + Web Development</option>
                    <option>Startup &amp; Entrepreneurship</option>
                    <option>Industry Productivity Tools</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={manualLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
                {manualLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : "Save Registration"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
