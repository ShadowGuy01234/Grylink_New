import { Award } from "lucide-react";
export function CertificatePage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-xl">Certificate</h1>
          <p className="text-slate-400 text-sm">Your completion certificate</p>
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <p className="text-5xl mb-4">🎓</p>
        <h2 className="text-white font-semibold text-lg mb-2">Certificate Not Yet Available</h2>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          Your certificate of completion will be available here after you complete the TechPreneur 2026 program and all project submissions are reviewed.
        </p>
      </div>
    </div>
  );
}
