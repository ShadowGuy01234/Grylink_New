import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { verifyCertificate } from "../lib/api";
import { Printer, Image as ImageIcon, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export function DownloadCertificatePage() {
  const { certId } = useParams<{ certId: string }>();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (certId) {
      loadCertificate(certId);
    }
  }, [certId]);

  const loadCertificate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await verifyCertificate(id);
      setCertificate(res.certificate);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load certificate data.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPNG = async () => {
    if (!certificate || !certificate.templateId) return;
    setExporting(true);
    try {
      const template = certificate.templateId;
      const variables = template.variables || [];
      const verificationUrl = `https://training.gryork.com/verify-certificate/${certificate.certificateId}`;

      // Create offscreen canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Load background template image
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = template.imageUrl;

      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = () => reject(new Error("Failed to load certificate background template image."));
      });

      // Set canvas dimensions matching background template resolution
      canvas.width = bgImg.naturalWidth || 1920;
      canvas.height = bgImg.naturalHeight || 1200;

      // Draw background
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Draw variables
      for (const v of variables) {
        const x = (v.x / 100) * canvas.width;
        const y = (v.y / 100) * canvas.height;

        if (v.name === "qrCode") {
          // Load QR code image
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}&color=000000&bgcolor=ffffff`;
          const qrImg = new Image();
          qrImg.crossOrigin = "anonymous";
          qrImg.src = qrCodeUrl;

          await new Promise((resolve) => {
            qrImg.onload = resolve;
            qrImg.onerror = resolve; // fallback if QR fails
          });

          // Draw QR Code centered
          const qrSize = (v.fontSize || 70) * (canvas.width / 1000);
          ctx.drawImage(qrImg, x - qrSize / 2, y - qrSize / 2, qrSize, qrSize);
          continue;
        }

        let val = "";
        if (v.name === "studentName") val = certificate.studentName;
        else if (v.name === "collegeName") val = certificate.college;
        else if (v.name === "certificateId") val = certificate.certificateId;
        else if (v.name === "issuedDate") {
          val = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          });
        } else if (v.name === "studentEmail") val = certificate.studentEmail;
        else if (v.name === "finalRemarks") val = certificate.finalRemarks;
        else if (v.name === "branch") val = certificate.studentId?.branch || "";
        else if (v.name === "year") val = certificate.studentId?.year || "";
        else if (v.name === "trackPreference" || v.name === "track") val = certificate.studentId?.trackPreference || "";
        else val = certificate[v.name] || "";

        ctx.fillStyle = v.fontColor || "#000000";
        // Scale font size proportionally to background resolution
        const scaledFontSize = (v.fontSize || 24) * (canvas.width / 1000);
        ctx.font = `bold ${scaledFontSize}px ${v.fontFamily || "Inter"}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(val, x, y);
      }

      // Trigger download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `TechPreneur_Certificate_${certificate.certificateId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      alert("Failed to export image: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-sm font-semibold">Generating print canvas...</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200 p-6">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Document</h2>
        <p className="text-sm text-slate-400 mb-6 max-w-md text-center">{error || "No certificate data found."}</p>
        <Link to="/" className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
          Go to Homepage
        </Link>
      </div>
    );
  }

  const template = certificate.templateId || {};
  const variables = template.variables || [];
  const verificationUrl = `https://training.gryork.com/verify-certificate/${certificate.certificateId}`;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-8 select-none">
      
      {/* Floating Toolbar - Hidden during print */}
      <div className="fixed top-6 right-6 flex items-center gap-3 bg-slate-900/90 backdrop-blur border border-slate-800 px-4 py-2.5 rounded-xl z-50 shadow-2xl print:hidden">
        <Link 
          to={`/verify-certificate/${certificate.certificateId}`}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Back to verification"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </Link>
        <div className="w-px h-5 bg-slate-800" />
        <button
          onClick={handleExportPNG}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-bold text-slate-200 rounded-lg transition-colors border border-slate-700"
        >
          {exporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5" />
          )}
          Download PNG
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg transition-colors shadow-lg shadow-blue-500/10"
        >
          <Printer className="w-3.5 h-3.5" /> Save PDF / Print
        </button>
      </div>

      {/* Main Print Container */}
      <div 
        ref={canvasContainerRef}
        className="w-full max-w-4xl bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200 relative print:border-none print:shadow-none print:rounded-none"
        style={{ 
          aspectRatio: "16/10",
          containerType: "inline-size",
        }}
        id="printable-certificate-container"
      >
        {template.imageUrl ? (
          <img 
            src={template.imageUrl} 
            alt="Certificate background template" 
            className="w-full h-full object-fill pointer-events-none"
          />
        ) : (
          <div className="w-full h-full bg-white flex items-center justify-center text-gray-300">
            No Template Image Loaded
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
                  width: `calc(${v.fontSize} * 0.08cqi)`,
                  height: `calc(${v.fontSize} * 0.08cqi)`,
                  transform: "translate(-50%, -50%)"
                }}
              />
            );
          }

          let val = "";
          if (v.name === "studentName") val = certificate.studentName;
          else if (v.name === "collegeName") val = certificate.college;
          else if (v.name === "certificateId") val = certificate.certificateId;
          else if (v.name === "issuedDate") {
            val = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            });
          } else if (v.name === "studentEmail") val = certificate.studentEmail;
          else if (v.name === "finalRemarks") val = certificate.finalRemarks;
          else if (v.name === "branch") val = certificate.studentId?.branch || "";
          else if (v.name === "year") val = certificate.studentId?.year || "";
          else if (v.name === "trackPreference" || v.name === "track") val = certificate.studentId?.trackPreference || "";
          else val = certificate[v.name] || "";

          return (
            <div
              key={v.name}
              style={{
                position: "absolute",
                left: `${v.x}%`,
                top: `${v.y}%`,
                fontSize: `calc(${v.fontSize} * 0.08cqi)`,
                color: v.fontColor || "#000000",
                fontFamily: v.fontFamily || "Inter",
                transform: v.align === "left" 
                  ? "translateY(-50%)" 
                  : v.align === "right" 
                    ? "translate(-100%, -50%)" 
                    : "translate(-50%, -50%)",
                textAlign: v.align || "center",
                whiteSpace: "nowrap"
              }}
              className={`font-bold ${v.align === "left" ? "text-left" : v.align === "right" ? "text-right" : "text-center"}`}
            >
              {val}
            </div>
          );
        })}
      </div>

      {/* CSS Print Styles */}
      <style>{`
        @page {
          size: A4 landscape;
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
          #printable-certificate-container {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            max-height: none !important;
            aspect-ratio: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background-color: white !important;
            z-index: 99999 !important;
            container-type: inline-size !important;
          }
        }
      `}</style>

    </div>
  );
}
