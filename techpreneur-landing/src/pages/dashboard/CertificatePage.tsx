import { useState, useEffect } from "react";
import { fetchMyCertificate } from "../../lib/api";
import { Award, CheckCircle2, AlertTriangle, Printer, Calendar, ShieldCheck, Star, ExternalLink } from "lucide-react";

interface CertificateVar {
  name: string;
  x: number;
  y: number;
  fontSize: number;
  fontColor: string;
  fontFamily: string;
}

interface CertificateData {
  _id: string;
  studentName: string;
  studentEmail: string;
  college: string;
  certificateId: string;
  issuedAt: string;
  finalRemarks: string;
  scores: {
    week1: number;
    week2: number;
    week3: number;
    week4: number;
    projectContribution: number;
  };
  efforts: {
    week1: string;
    week2: string;
    week3: string;
    week4: string;
    projectContribution: string;
  };
  templateId?: {
    name: string;
    imageUrl: string;
    variables: CertificateVar[];
  };
}

export function CertificatePage() {
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCertificate();
  }, []);

  const loadCertificate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyCertificate();
      if (data && data.certificate) {
        setCertificate(data.certificate);
      }
    } catch (err: any) {
      console.error("Failed to load certificate:", err);
      setError("Unable to retrieve certificate details.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = (scores: CertificateData["scores"]) => {
    return (
      (scores.week1 || 0) +
      (scores.week2 || 0) +
      (scores.week3 || 0) +
      (scores.week4 || 0) +
      (scores.projectContribution || 0)
    );
  };

  const getScoreGrade = (total: number) => {
    if (total >= 90) return { text: "Outstanding (A+)", color: "text-emerald-400" };
    if (total >= 80) return { text: "Excellent (A)", color: "text-teal-400" };
    if (total >= 70) return { text: "Very Good (B)", color: "text-blue-400" };
    if (total >= 50) return { text: "Good (C)", color: "text-amber-400" };
    return { text: "Completed (D)", color: "text-slate-400" };
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading certificate data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
        <h3 className="text-white font-semibold text-lg mb-1">Error Loading Credentials</h3>
        <p className="text-sm text-slate-400 mb-4">{error}</p>
        <button
          onClick={loadCertificate}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-200 border border-slate-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Not yet issued
  if (!certificate) {
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
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            Your certificate of completion will be available here after you complete the TechPreneur 2026 program and all project submissions are reviewed.
          </p>
        </div>
      </div>
    );
  }

  const totalScore = calculateTotalScore(certificate.scores);
  const grade = getScoreGrade(totalScore);
  const verificationUrl = `${window.location.origin}/verify-certificate/${certificate.certificateId}`;

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      {/* Title Header - Hidden on printing */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Your Credential</h1>
            <p className="text-slate-400 text-sm">Official completion certificate & effort scorecard</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-lg text-white transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print Certificate
          </button>
          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold rounded-lg text-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Public View <span className="print:hidden">↗</span>
          </a>
        </div>
      </div>

      {/* Verified Banner - Hidden on print */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 print:hidden">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-left">
          <p className="text-xs text-slate-300">
            Your certificate is verified. Certificate ID: <strong className="text-white font-mono">{certificate.certificateId}</strong>
          </p>
        </div>
      </div>

      {/* Canvas container for certificate preview */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden print:p-0 print:border-none print:shadow-none print:bg-white print:rounded-none">
        {certificate.templateId ? (
          <div 
            className="relative w-full overflow-hidden select-none bg-white rounded-lg shadow-inner print:rounded-none print:shadow-none mx-auto"
            style={{ 
              aspectRatio: "16/10",
              containerType: "inline-size",
            }}
            id="printable-certificate-container"
          >
            <img 
              src={certificate.templateId.imageUrl} 
              alt="Official TechPreneur Certificate" 
              className="w-full h-full object-fill pointer-events-none"
            />

            {/* Overlaid variables */}
            {certificate.templateId.variables.map((v) => {
              if (v.name === "qrCode") {
                const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}&color=000000&bgcolor=ffffff`;
                return (
                  <img
                    key={v.name}
                    src={qrCodeUrl}
                    alt="Verification QR Code"
                    style={{
                      position: "absolute",
                      left: `${v.x}%`,
                      top: `${v.y}%`,
                      width: `calc(${v.fontSize} * 0.08cqi)`,
                      height: `calc(${v.fontSize} * 0.08cqi)`,
                      transform: "translate(-50%, -50%)"
                    }}
                  />
                );
              }

              let val = "";
              if (v.name === "studentName") val = certificate.studentName;
              if (v.name === "collegeName") val = certificate.college;
              if (v.name === "certificateId") val = certificate.certificateId;
              if (v.name === "issuedDate") {
                val = new Date(certificate.issuedAt).toLocaleDateString("en-US", { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });
              }

              return (
                <div
                  key={v.name}
                  style={{
                    position: "absolute",
                    left: `${v.x}%`,
                    top: `${v.y}%`,
                    fontSize: `calc(${v.fontSize} * 0.08cqi)`,
                    color: v.fontColor,
                    fontFamily: v.fontFamily,
                    transform: "translate(-50%, -50%)",
                    whiteSpace: "nowrap"
                  }}
                >
                  {val}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="aspect-[16/10] bg-slate-900 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 p-8 text-center text-slate-400">
            <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
            <p className="text-sm">Template background properties missing.</p>
          </div>
        )}
      </div>

      {/* Performance Report & Scorecard - Hidden on print */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 sm:p-8 space-y-8 print:hidden">
        
        {/* Header Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              YOUR PERFORMANCE SCORECARD
            </h2>
            <p className="text-xs text-slate-400">
              TechPreneur 2026 Startup Acceleration Evaluations
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/60 font-mono">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            Issued: {new Date(certificate.issuedAt).toLocaleDateString()}
          </div>
        </div>

        {/* Total Score & Grade Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Score Circular Gauge */}
          <div className="bg-slate-950/80 rounded-xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Your Total Score
            </span>
            
            {/* Gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center mb-3">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-slate-800 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-blue-500 fill-none transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - totalScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white font-display">
                  {totalScore}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold font-mono">
                  OUT OF 100
                </span>
              </div>
            </div>
            
            <span className={`text-sm font-bold ${grade.color}`}>
              {grade.text}
            </span>
          </div>

          {/* Score Details Breakdown */}
          <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 md:col-span-2 space-y-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
              Performance Breakdown
            </span>
            
            <div className="space-y-3">
              {/* W1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Week 1: Customer Discovery & Validation</span>
                  <span className="font-semibold text-white">{certificate.scores.week1} / 15</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(certificate.scores.week1 / 15) * 100}%` }} />
                </div>
              </div>

              {/* W2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Week 2: Mockups & Value Proposition</span>
                  <span className="font-semibold text-white">{certificate.scores.week2} / 15</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(certificate.scores.week2 / 15) * 100}%` }} />
                </div>
              </div>

              {/* W3 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Week 3: Tech Architecture & Git</span>
                  <span className="font-semibold text-white">{certificate.scores.week3} / 15</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(certificate.scores.week3 / 15) * 100}%` }} />
                </div>
              </div>

              {/* W4 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Week 4: Business Pitch & Economics</span>
                  <span className="font-semibold text-white">{certificate.scores.week4} / 15</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(certificate.scores.week4 / 15) * 100}%` }} />
                </div>
              </div>

              {/* Project */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Final MVP Prototype & Contribution</span>
                  <span className="font-semibold text-white">{certificate.scores.projectContribution} / 40</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(certificate.scores.projectContribution / 40) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Efforts */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-4 h-4 text-blue-500" /> Tracked Weekly Efforts
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificate.efforts.week1 && (
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
                <h4 className="text-xs font-bold text-blue-400 mb-1.5 uppercase">Week 1 Effort</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{certificate.efforts.week1}</p>
              </div>
            )}

            {certificate.efforts.week2 && (
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
                <h4 className="text-xs font-bold text-blue-400 mb-1.5 uppercase">Week 2 Effort</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{certificate.efforts.week2}</p>
              </div>
            )}

            {certificate.efforts.week3 && (
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
                <h4 className="text-xs font-bold text-blue-400 mb-1.5 uppercase">Week 3 Effort</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{certificate.efforts.week3}</p>
              </div>
            )}

            {certificate.efforts.week4 && (
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
                <h4 className="text-xs font-bold text-blue-400 mb-1.5 uppercase">Week 4 Effort</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{certificate.efforts.week4}</p>
              </div>
            )}

            {certificate.efforts.projectContribution && (
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 md:col-span-2">
                <h4 className="text-xs font-bold text-emerald-400 mb-1.5 uppercase">Final Prototype Contribution</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{certificate.efforts.projectContribution}</p>
              </div>
            )}
          </div>
        </div>

        {/* Final Remarks */}
        {certificate.finalRemarks && (
          <div className="bg-gradient-to-br from-blue-950/30 to-slate-950 border border-blue-900/30 rounded-xl p-5 space-y-2">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              Gryork Academy Evaluator Feedback
            </h4>
            <p className="text-sm text-slate-200 italic leading-relaxed">
              "{certificate.finalRemarks}"
            </p>
          </div>
        )}
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
          #printable-certificate-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 62.5vw !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background-color: white !important;
            z-index: 99999 !important;
            container-type: inline-size !important;
          }
          body > :not(#printable-certificate-container) {
            display: none !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .max-w-4xl > :not(.bg-slate-950) {
            display: none !important;
          }
          .bg-slate-950 {
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
