import { useState, useEffect } from "react";
import { fetchMyJoiningLetter } from "../../lib/api";
import { FileText, AlertTriangle, Printer, ExternalLink } from "lucide-react";

export function JoiningLetterPage() {
  const [letter, setLetter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLetter = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchMyJoiningLetter();
      setLetter(res.joiningLetter);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load selection/joining letter.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLetter();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading onboarding details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center mx-auto mt-6">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
        <h3 className="text-white font-semibold text-lg mb-1">Error Loading Letter</h3>
        <p className="text-sm text-slate-400 mb-4">{error}</p>
        <button
          onClick={loadLetter}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-200 border border-slate-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="max-w-2xl mx-auto mt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Selection & Joining Letter</h1>
            <p className="text-slate-400 text-sm">Official onboarding documentation</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-5xl mb-4">✉️</p>
          <h2 className="text-white font-semibold text-lg mb-2">Letter Not Yet Issued</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            Your Selection & Onboarding Joining Letter will be generated here shortly after your startup track allocation is approved by the evaluation committee.
          </p>
        </div>
      </div>
    );
  }

  const template = letter.templateId || {};
  const variables = template.variables || [];
  const verificationUrl = `${window.location.origin}/verify-joining-letter/${letter.joiningLetterId}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title Header - Hidden on printing */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Selection & Joining Letter</h1>
            <p className="text-slate-400 text-sm">Official program onboarding document & reference credentials</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-xs font-semibold rounded-lg text-white transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold rounded-lg text-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Public View ↗
          </a>
        </div>
      </div>

      {/* Outer Preview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center justify-center print:bg-white print:border-none print:p-0">
        
        {/* Printable Canvas */}
        <div 
          id="printable-letter-container"
          className="relative bg-white shadow-2xl border border-gray-200 rounded overflow-hidden select-none w-full max-w-lg mx-auto print:shadow-none print:border-none"
          style={{ aspectRatio: "1/1.414" }}
        >
          {template.imageUrl ? (
            <img 
              src={template.imageUrl} 
              alt="Letterhead background" 
              className="w-full h-full object-fill pointer-events-none"
            />
          ) : (
            <div className="w-full h-full bg-white flex items-center justify-center text-slate-300">
              No Background Loaded
            </div>
          )}

          {/* Absolute coordinates variables placement */}
          {variables.map((v: any) => {
            const val = letter.variablesData?.[v.name] || "";
            
            if (v.name === "qrCode") {
              const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}&color=000000&bgcolor=ffffff`;
              return (
                <div
                  key={v.name}
                  style={{
                    position: "absolute",
                    left: `${v.x}%`,
                    top: `${v.y}%`,
                    width: `${v.fontSize * 1.5}px`,
                    height: `${v.fontSize * 1.5}px`,
                    transform: "translate(-50%, -50%)"
                  }}
                  className="bg-white p-0.5 border border-gray-200"
                >
                  <img 
                    src={qrCodeApiUrl} 
                    alt="Onboarding verification code" 
                    className="w-full h-full object-contain"
                  />
                </div>
              );
            }

            let textContent = val;
            if (v.name === "studentName") textContent = letter.studentName;
            else if (v.name === "collegeName") textContent = letter.college;
            else if (v.name === "joiningLetterId") textContent = letter.joiningLetterId;
            else if (v.name === "joiningDate") {
              textContent = new Date(letter.joiningDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric"
              });
            } else if (v.name === "trackPreference") {
              textContent = letter.studentId?.trackPreference || letter.studentId?.track || "Track Cohort Access";
            }

            return (
              <div
                key={v.name}
                style={{
                  position: "absolute",
                  left: `${v.x}%`,
                  top: `${v.y}%`,
                  fontSize: `${v.fontSize * 0.8}px`,
                  color: v.fontColor || "#1e293b",
                  fontFamily: v.fontFamily || "Outfit",
                  transform: "translate(-50%, -50%)",
                  whiteSpace: "nowrap"
                }}
                className="font-medium"
              >
                {textContent}
              </div>
            );
          })}
        </div>
      </div>

      {/* Printable styles - ONLY active when printing */}
      <style>{`
        @media print {
          body, html {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          #printable-letter-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 141.4vw !important; /* maintaining aspect ratio of 1 : 1.414 */
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background-color: white !important;
            z-index: 99999 !important;
          }
          body > :not(#printable-letter-container) {
            display: none !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
