import { useState, useEffect } from "react";
import { techpreneurApi } from "../../../api";
import { CheckCircle } from "lucide-react";

export function ReferralsTab() {
  const [referrals, setReferrals] = useState<any[]>([]);

  const fetchReferrals = async () => {
    try {
      const res = await techpreneurApi.getReferrals();
      setReferrals(res.data.referrals || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchReferrals(); }, []);

  const handlePayCashback = async (id: string) => {
    if (!window.confirm("Mark cashback as PAID for this referral?")) return;
    try {
      await techpreneurApi.payCashback(id);
      fetchReferrals();
    } catch (err) {
      alert("Failed to update cashback status");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Referral Management</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Referrer</th>
              <th className="px-6 py-4">Referred Student</th>
              <th className="px-6 py-4">Referral Status</th>
              <th className="px-6 py-4">Cashback Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {referrals.map(r => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{r.referrerId?.name} ({r.referrerId?.email})</td>
                <td className="px-6 py-4 text-gray-600">{r.referredUserId?.name} ({r.referredUserId?.email})</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full uppercase font-bold tracking-wider ${r.referralStatus === 'verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.referralStatus}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full uppercase font-bold tracking-wider ${
                    r.cashbackStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                    r.cashbackStatus === 'eligible' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>{r.cashbackStatus}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  {r.cashbackStatus === 'eligible' && (
                    <button onClick={() => handlePayCashback(r._id)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                      Mark as Paid
                    </button>
                  )}
                  {r.cashbackStatus === 'paid' && <span className="text-emerald-600 flex items-center justify-end gap-1 font-medium"><CheckCircle className="w-4 h-4"/> Paid</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
