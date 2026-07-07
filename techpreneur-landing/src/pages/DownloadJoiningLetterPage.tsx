import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { verifyJoiningLetter } from "../lib/api";
import { Printer, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export function DownloadJoiningLetterPage() {
  const { letterId } = useParams<{ letterId: string }>();
  const [letter, setLetter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (letterId) {
      loadLetter(letterId);
    }
  }, [letterId]);

  const loadLetter = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await verifyJoiningLetter(id);
      setLetter(res.joiningLetter);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load selection letter data.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
        <p className="text-sm font-semibold">Generating print canvas...</p>
      </div>
    );
  }

  if (error || !letter) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200 p-6">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Document</h2>
        <p className="text-sm text-slate-400 mb-6 max-w-md text-center">{error || "No joining letter data found."}</p>
        <Link to="/" className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
          Go to Homepage
        </Link>
      </div>
    );
  }

  const template = letter.templateId || {};
  const variables = template.variables || [];
  const verificationUrl = `https://training.gryork.com/verify-joining-letter/${letter.joiningLetterId}`;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-8 select-none">
      
      {/* Floating Toolbar - Hidden during print */}
      <div className="fixed top-6 right-6 flex items-center gap-3 bg-slate-900/90 backdrop-blur border border-slate-800 px-4 py-2.5 rounded-xl z-50 shadow-2xl print:hidden">
        <Link 
          to={`/verify-joining-letter/${letter.joiningLetterId}`}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Back to verification"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </Link>
        <div className="w-px h-5 bg-slate-800" />
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-pink-600 hover:bg-pink-500 text-xs font-bold text-white rounded-lg transition-colors shadow-lg shadow-pink-500/10"
        >
          <Printer className="w-3.5 h-3.5" /> Save PDF / Print Letter
        </button>
      </div>

      {/* Main Print Container */}
      <div 
        id="printable-letter-container"
        className="w-full max-w-lg bg-white shadow-2xl rounded border border-gray-200 relative print:border-none print:shadow-none print:rounded-none"
        style={{ 
          aspectRatio: "1/1.414",
          containerType: "inline-size"
        }}
      >
        {template.imageUrl ? (
          <img 
            src={template.imageUrl} 
            alt="Letterhead template background" 
            className="w-full h-full object-fill pointer-events-none"
          />
        ) : (
          <div className="w-full h-full bg-white flex items-center justify-center text-gray-300">
            No Background Image Loaded
          </div>
        )}

        {/* Variables Render Overlay */}
        {variables.map((v: any) => {
          if (v.name === "qrCode") {
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}&color=000000&bgcolor=ffffff`;
            return (
              <img
                key={v.name}
                src={qrCodeUrl}
                alt="Onboarding verification code"
                style={{
                  position: "absolute",
                  left: `${v.x}%`,
                  top: `${v.y}%`,
                  width: `calc(${v.fontSize} * 0.3cqi)`,
                  height: `calc(${v.fontSize} * 0.3cqi)`,
                  transform: "translate(-50%, -50%)"
                }}
                className="bg-white p-0.5 border border-gray-200"
              />
            );
          }

          let val = "";
          if (v.name === "studentName") val = letter.studentName;
          else if (v.name === "collegeName") val = letter.college;
          else if (v.name === "joiningLetterId") val = letter.joiningLetterId;
          else if (v.name === "joiningDate") {
            val = new Date(letter.joiningDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric"
            });
          } else if (v.name === "trackPreference") {
            val = letter.studentId?.trackPreference || letter.studentId?.track || "Track Cohort Access";
          } else {
            val = letter.variablesData?.[v.name] || "";
          }

          return (
            <div
              key={v.name}
              style={{
                position: "absolute",
                left: `${v.x}%`,
                top: `${v.y}%`,
                fontSize: `calc(${v.fontSize} * 0.16cqi)`,
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
              className={`font-medium ${v.align === "left" ? "text-left" : v.align === "right" ? "text-right" : "text-center"}`}
            >
              {val}
            </div>
          );
        })}
      </div>

      {/* CSS Print Styles */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          body, html {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          #root, .min-h-screen {
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #printable-letter-container {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background-color: white !important;
            z-index: 99999 !important;
          }
        }
      `}</style>

    </div>
  );
}
