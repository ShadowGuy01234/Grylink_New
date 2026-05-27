import { useState, useEffect } from "react";
import { techpreneurApi } from "../../../api";
import { 
  CheckCircle, Ticket, PlusCircle, Trash2, 
  RefreshCw, BadgePercent
} from "lucide-react";

interface PromoCode {
  _id: string;
  code: string;
  discount: number;
  isUsed: boolean;
  usedByEmail?: string;
  usedById?: string;
  usedAt?: string;
  createdBy?: string;
  createdAt: string;
}

export function PromoCodesTab() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  
  // Form state
  const [customCode, setCustomCode] = useState("");
  const [discount, setDiscount] = useState<300 | 500>(500);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const res = await techpreneurApi.getPromoCodes();
      setPromoCodes(res.data.promoCodes || []);
    } catch (err) {
      console.error("Failed to load promo codes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBtnLoading(true);

    try {
      const res = await techpreneurApi.createPromoCode({
        code: customCode.trim() || undefined,
        discount: Number(discount),
      });

      if (res.data.success) {
        setSuccess(`✅ Promo Code "${res.data.promoCode.code}" generated successfully!`);
        setCustomCode("");
        fetchPromoCodes();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate promo code. Please try again.");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete the promo code "${code}"?`)) return;
    try {
      await techpreneurApi.deletePromoCode(id);
      fetchPromoCodes();
    } catch (err) {
      alert("Failed to delete promo code");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-blue-600" /> Single-Use Promo Code Generator
        </h2>
        <p className="text-gray-500 text-sm mt-1">Generate one-time use coupon codes of ₹300 off or ₹500 off for checkout discounts.</p>
      </div>

      {/* Creation card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <BadgePercent className="w-4 h-4 text-gray-400" /> Select Discount
            </label>
            <select
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value) as 300 | 500)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value={500}>₹500 OFF (Premium Discount)</option>
              <option value={300}>₹300 OFF (Standard Discount)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Custom Code <span className="text-xs text-gray-400 font-normal">(Optional — leaves blank to auto-generate)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. WELCOME500, SPECIAL300"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono placeholder:font-sans"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={btnLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 h-[38px]"
            >
              {btnLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" /> Generate Promo Code
                </>
              )}
            </button>
          </div>
        </form>

        {error && <p className="text-sm text-red-600 mt-4 font-medium">{error}</p>}
        {success && <p className="text-sm text-green-600 mt-4 font-medium">{success}</p>}
      </div>

      {/* Codes List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Generated Codes</h3>
          <button 
            onClick={fetchPromoCodes} 
            className="text-gray-500 hover:text-blue-600 p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium">Loading promo codes...</p>
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Ticket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-500">No promo codes generated yet.</p>
            <p className="text-xs text-gray-400 mt-1">Select a discount above and click Generate to create one.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Promo Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Usage Details</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promoCodes.map((pc) => (
                <tr key={pc._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-gray-900 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 px-2.5 py-1 rounded text-sm tracking-wider">
                      {pc.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1.5 rounded-full font-bold ${
                      pc.discount === 500 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      ₹{pc.discount} OFF
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      pc.isUsed 
                        ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {pc.isUsed ? "USED" : "AVAILABLE"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {pc.isUsed ? (
                      <div className="space-y-0.5">
                        <p className="text-gray-900 font-medium">{pc.usedByEmail}</p>
                        <p className="text-xs text-gray-400">
                          {pc.usedAt ? new Date(pc.usedAt).toLocaleString() : "Date unknown"}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Unused — single use only</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    <p className="font-medium text-gray-700">{pc.createdBy || "system"}</p>
                    <p className="text-gray-400 mt-0.5">{new Date(pc.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!pc.isUsed ? (
                      <button
                        onClick={() => handleDelete(pc._id, pc.code)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Delete Unused Code"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1 text-xs">
                        <CheckCircle className="w-3.5 h-3.5" /> Redeemed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
