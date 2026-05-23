import { useEffect, useState } from "react";
import { techpreneurApi } from "../../api";
import { CheckCircle2, Search, Filter, Image as ImageIcon, XCircle, Clock } from "lucide-react";

interface Registration {
  _id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  trackPreference: string;
  transactionId: string;
  screenshotUrl: string;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      await techpreneurApi.updateRegistration(id, {
        status: "rejected",
      });
      fetchRegistrations();
    } catch (err) {
      alert("Failed to reject registration");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TechPreneur Registrations</h1>
          <p className="text-gray-500 text-sm mt-1">Manage attendees and verify payments for the 2026 Industrial Training</p>
        </div>
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
          <p className="text-sm text-gray-500 font-medium">Pending Verification</p>
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
              placeholder="Search by name, email, or UTR..."
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
                <th className="px-6 py-3 font-medium">Payment (UTR)</th>
                <th className="px-6 py-3 font-medium">Screenshot</th>
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
                      <p className="font-mono text-gray-900">{reg.transactionId}</p>
                      <p className="text-gray-500 text-xs">₹{reg.feeAmount} ({reg.registrationPhase})</p>
                    </td>
                    <td className="px-6 py-4">
                      {reg.screenshotUrl ? (
                        <button 
                          onClick={() => setSelectedImage(reg.screenshotUrl)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          <ImageIcon className="w-4 h-4" /> View
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
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

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <XCircle className="w-8 h-8" />
            </button>
            <img src={selectedImage} alt="Payment Screenshot" className="w-full h-auto max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
