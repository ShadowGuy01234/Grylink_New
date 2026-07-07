import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { verifyJoiningLetter } from "../lib/api";
import { FileText, CheckCircle2, AlertTriangle, Search, Printer, Calendar, ShieldCheck } from "lucide-react";

interface LetterVar {
  name: string;
  x: number;
  y: number;
  fontSize: number;
  fontColor: string;
  fontFamily: string;
}

interface LetterData {
  _id: string;
  studentName: string;
  studentEmail: string;
  college: string;
  joiningLetterId: string;
  joiningDate: string;
  issuedAt: string;
  templateId?: {
    name: string;
    imageUrl: string;
    variables: LetterVar[];
  };
  studentId?: {
    name: string;
    email: string;
    college: string;
    branch: string;
    year: string;
    trackPreference: string;
  };
}

export function VerifyJoiningLetter() {
  const { letterId } = useParams<{ letterId?: string }>();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState(letterId || "");
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState<LetterData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (letterId) {
      handleVerify(letterId);
    } else {
      setLetter(null);
      setError(null);
    }
  }, [letterId]);

  const handleVerify = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await verifyJoiningLetter(id.trim());
      if (data && data.joiningLetter) {
        setLetter(data.joiningLetter);
      } else {
        setError("Selection/joining letter not found.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify selection letter.");
      setLetter(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/verify-joining-letter/${searchId.trim().toUpperCase()}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Mask email for security
  const maskEmail = (email: string) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    if (!domain) return email;
    return `${name[0]}***${name[name.length - 1] || ""}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-[#050B1E] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Title / Search bar section - hidden on printing */}
        <div className="text-center space-y-4 print:hidden">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 text-pink-500 mb-2">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Onboarding Letter Verification</h1>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            Verify official selection & joining letters issued by Gryork Academy and the TechPreneur accelerator.
          </p>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Enter Reference ID (e.g. JL-TP26-XXXXXX)"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-3" />
            <p className="text-sm text-slate-500">Querying cryptographic records...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-md bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center mx-auto print:hidden">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
            <h3 className="text-white font-semibold text-lg mb-1">Verification Failed</h3>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        )}

        {/* Success Verified Letter display */}
        {letter && !loading && (
          <div className="space-y-6">
            
            {/* Top Verification Header Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-center print:hidden">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-extrabold text-sm tracking-wider uppercase">Cryptographically Verified</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h2 className="text-white font-bold text-lg mt-0.5">Selection Letter is Authentic</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Reference ID: {letter.joiningLetterId}</p>
                </div>
              </div>
              <a
                href={`/download-joining-letter/${letter.joiningLetterId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-xs font-semibold rounded-lg text-white transition-colors text-center shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" /> Download / Print Letter
              </a>
            </div>

            {/* Document Details Sheet */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              {/* Left Column: Metadata */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-5 print:hidden">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verification Details</h3>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs block">Full Name</span>
                    <span className="text-white font-semibold">{letter.studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">Email Address</span>
                    <span className="text-white font-semibold">{maskEmail(letter.studentEmail)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">College Institution</span>
                    <span className="text-white font-semibold">{letter.college}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">Track Specialization</span>
                    <span className="text-white font-semibold">
                      {letter.studentId?.trackPreference || letter.studentId?.track || "TechPreneur Operations Track"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-500 text-xs block">Date of Onboarding</span>
                    <span className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-pink-500" />
                      {new Date(letter.joiningDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center/Right Column: Image Canvas */}
              <div className="md:col-span-2 flex items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-2xl print:bg-white print:border-none print:p-0">
                <div 
                  id="printable-letter-container"
                  className="relative bg-white shadow-2xl border border-gray-200 rounded overflow-hidden select-none w-full max-w-md mx-auto print:shadow-none print:border-none"
                  style={{ aspectRatio: "1/1.414" }}
                >
                  {letter.templateId?.imageUrl ? (
                    <img 
                      src={letter.templateId.imageUrl} 
                      alt="Verified letterhead background" 
                      className="w-full h-full object-fill pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-white flex items-center justify-center text-slate-300">
                      Background Layout Missing
                    </div>
                  )}

                  {/* Overlaid variables */}
                  {(letter.templateId?.variables || []).map((v: any) => {
                    if (v.name === "qrCode") {
                      const verificationUrl = `${window.location.origin}/verify-joining-letter/${letter.joiningLetterId}`;
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
                            alt="Verification QR code" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      );
                    }

                    let textContent = letter.variablesData?.[v.name] || "";
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
                          transform: v.align === "left" 
                            ? "translateY(-50%)" 
                            : v.align === "right" 
                              ? "translate(-100%, -50%)" 
                              : "translate(-50%, -50%)",
                          textAlign: v.align || "center",
                          whiteSpace: "nowrap"
                        }}
                        className={`font-semibold ${v.align === "left" ? "text-left" : v.align === "right" ? "text-right" : "text-center"}`}
                      >
                        {textContent}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
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
          #printable-letter-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 141.4vw !important;
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
