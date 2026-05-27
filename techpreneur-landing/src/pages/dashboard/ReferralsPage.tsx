import { useEffect, useState } from "react";
import { Gift, Copy, CheckCircle, Clock } from "lucide-react";
import { fetchReferralStats } from "../../lib/api";

interface ReferralStats {
  referralCode: string;
  total: number;
  successful: number;
  cashbackEarned: number;
  cashbackPending: number;
  referrals: Array<{
    _id: string;
    referredEmail: string;
    referredId?: { name: string; email: string };
    status: string;
    createdAt: string;
  }>;
}

export function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralStats().then(res => {
      setStats(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const copyCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div className="animate-pulse flex gap-4"><div className="w-10 h-10 bg-white/10 rounded-xl" /><div className="flex-1 space-y-3"><div className="h-4 bg-white/10 rounded w-1/4" /><div className="h-3 bg-white/10 rounded w-1/2" /></div></div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-xl">Referral Rewards</h1>
          <p className="text-slate-400 text-sm">Share your code, earn cashback</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider opacity-60">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Share Your Code", desc: "Send your unique referral code to friends interested in TechPreneur." },
            { step: "2", title: "They Get ₹200 Off", desc: "Your friend uses your code at checkout and gets an instant ₹200 discount." },
            { step: "3", title: "You Earn ₹100", desc: "For every paid referral, you're eligible for ₹100 cashback. Admin will contact you." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">{s.step}</span>
              </div>
              <p className="text-white text-sm font-semibold">{s.title}</p>
              <p className="text-slate-400 text-xs mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral code */}
      <div className="bg-gradient-to-br from-purple-900/40 to-violet-900/40 border border-purple-500/20 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">Your Referral Code</h2>
        <p className="text-slate-400 text-sm mb-4">Copy and share with your friends</p>
        {stats?.referralCode ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <code className="w-full sm:flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-purple-300 font-mono font-bold text-2xl tracking-widest text-center">
              {stats.referralCode}
            </code>
            <button
              onClick={copyCode}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                copied
                  ? "bg-green-600 text-white"
                  : "bg-purple-600 hover:bg-purple-500 text-white"
              }`}
            >
              {copied ? <><CheckCircle className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Code</>}
            </button>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">Your referral code will be assigned by the admin once your payment is confirmed.</p>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Referrals", value: stats.total },
              { label: "Successful", value: stats.successful },
              { label: "Pending Cashback", value: `₹${stats.cashbackPending}` },
              { label: "Earned Cashback", value: `₹${stats.cashbackEarned}` },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <p className={`font-bold text-2xl ${i >= 2 ? "text-green-400" : "text-white"}`}>{s.value}</p>
                <p className="text-slate-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="text-white font-semibold">Referral History</h2>
            </div>
            {stats.referrals.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No referrals yet. Share your code to get started!
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {stats.referrals.map((r) => (
                  <div key={r._id} className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {r.referredId?.name || r.referredEmail.replace(/(.{2})(.*)(?=@)/, "$1***")}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.status === "verified" || r.status === "paid" ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-green-500/20 text-green-400 rounded-lg">
                          <CheckCircle className="w-3.5 h-3.5" /> Successful
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-lg">
                          <Clock className="w-3.5 h-3.5" /> Pending Payment
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
