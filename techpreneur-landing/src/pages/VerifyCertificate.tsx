import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { verifyCertificate } from "../lib/api";
import { Award, CheckCircle2, AlertTriangle, Search, Printer, Calendar, ShieldCheck, Star, ArrowRight } from "lucide-react";

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
  studentId?: {
    name: string;
    email: string;
    college: string;
    branch: string;
    year: string;
    trackPreference: string;
  };
}

export function VerifyCertificate() {
  const { certId } = useParams<{ certId?: string }>();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState(certId || "");
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (certId) {
      handleVerify(certId);
    } else {
      setCertificate(null);
      setProject(null);
      setError(null);
    }
  }, [certId]);

  const handleVerify = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await verifyCertificate(id.trim());
      if (data && data.certificate) {
        setCertificate(data.certificate);
        setProject(data.project || null);
      } else {
        setError("Certificate not found.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify certificate.");
      setCertificate(null);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/verify-certificate/${searchId.trim().toUpperCase()}`);
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

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans pb-16">
      {/* Background radial effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none z-0" />

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 w-full relative z-10 pt-10">
        
        {/* Search header - Hidden on printing */}
        <div className="mb-10 text-center print:hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4" /> SECURE VERIFICATION PORTAL
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 font-display">
            Verify Certificate of Authenticity
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Enter a unique certificate ID to verify the student's status, project scores, and training milestones.
          </p>

          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. CERT-TP26-XXXXXX"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/10"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-sm text-slate-400">Querying secure records...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center max-w-md mx-auto mb-10 print:hidden">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-1">Verification Failed</h3>
            <p className="text-sm text-slate-400 mb-4">{error}</p>
            <p className="text-xs text-slate-500">
              Please double check the spelling of the certificate code or scan the QR code printed on the physical copy.
            </p>
          </div>
        )}

        {/* Not Checked State */}
        {!certId && !certificate && !loading && !error && (
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-10 text-center max-w-md mx-auto print:hidden">
            <p className="text-5xl mb-4">📜</p>
            <h3 className="text-white font-semibold text-lg mb-1">Awaiting Credentials</h3>
            <p className="text-sm text-slate-400">
              Use the search bar above to fetch the credentials or scan the certificate's QR code.
            </p>
          </div>
        )}

        {/* Certificate Display and Report Card */}
        {certificate && !loading && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Verification Status Banner - Hidden on print */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-emerald-400 font-bold text-sm tracking-wide uppercase">
                    Verified Credential
                  </h3>
                  <p className="text-xs text-slate-300">
                    This certificate of authenticity is registered under ID: <strong className="text-white font-mono">{certificate.certificateId}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold rounded-lg text-slate-200 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print Certificate
              </button>
            </div>

            {/* Certificate Print-only Container Helper */}
            {/* The canvas itself */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden print:p-0 print:border-none print:shadow-none print:bg-white print:rounded-none">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 print:hidden">
                <Award className="w-4 h-4 text-amber-500" /> Certificate Preview
              </h3>

              {/* Certificate Template Render Canvas */}
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
                    alt="Official TechPreneur Certificate Background" 
                    className="w-full h-full object-fill pointer-events-none"
                  />

                  {/* Overlaid variables */}
                  {certificate.templateId.variables.map((v) => {
                    if (v.name === "qrCode") {
                      const verificationUrl = `${window.location.origin}/verify-certificate/${certificate.certificateId}`;
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
                    if (v.name === "studentName") {
                      val = certificate.studentName;
                    } else if (v.name === "collegeName") {
                      val = certificate.college;
                    } else if (v.name === "certificateId") {
                      val = certificate.certificateId;
                    } else if (v.name === "issuedDate") {
                      val = new Date(certificate.issuedAt).toLocaleDateString("en-US", { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                    } else if (v.name === "studentEmail") {
                      val = certificate.studentEmail;
                    } else if (v.name === "finalRemarks") {
                      val = certificate.finalRemarks;
                    } else if (v.name === "branch") {
                      val = certificate.studentId?.branch || "";
                    } else if (v.name === "year") {
                      val = certificate.studentId?.year || "";
                    } else if (v.name === "trackPreference" || v.name === "track") {
                      val = certificate.studentId?.trackPreference || "";
                    } else {
                      val = (certificate as any)[v.name] || (certificate.studentId as any)?.[v.name] || "";
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
                  <p className="text-xs text-slate-500 mt-1">
                    Student name: {certificate.studentName} | College: {certificate.college} | ID: {certificate.certificateId}
                  </p>
                </div>
              )}
            </div>

            {/* Performance Report & Scorecard - Hidden when printing certificate only */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 sm:p-8 space-y-8 print:hidden">
              
              {/* Header Info */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="Gryork Consultants" className="h-10 w-auto object-contain bg-white/5 p-1.5 rounded border border-white/10" />
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-wide">
                      STUDENT PERFORMANCE SCORECARD
                    </h2>
                    <p className="text-xs text-slate-400">
                      Gryork Consultants · TechPreneur Accelerator 2026
                    </p>
                  </div>
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
                    Overall Score
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
                        strokeDashoffset={2 * Math.PI * 48 * (1 - calculateTotalScore(certificate.scores) / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-extrabold text-white font-display">
                        {calculateTotalScore(certificate.scores)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold font-mono">
                        OUT OF 100
                      </span>
                    </div>
                  </div>
                  
                  <span className={`text-sm font-bold ${getScoreGrade(calculateTotalScore(certificate.scores)).color}`}>
                    {getScoreGrade(calculateTotalScore(certificate.scores)).text}
                  </span>
                </div>

                {/* Score Details Breakdown */}
                <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800 md:col-span-2 space-y-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">
                    Evaluation Matrix
                  </span>
                  
                  <div className="space-y-3">
                    {/* W1 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold">Week 1: Foundations & Customer Discovery</span>
                        <span className="font-semibold text-white">{certificate.scores.week1} / 15</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(certificate.scores.week1 / 15) * 100}%` }} />
                      </div>
                    </div>

                    {/* W2 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold">Week 2: Value Proposition & Product Mockups</span>
                        <span className="font-semibold text-white">{certificate.scores.week2} / 15</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(certificate.scores.week2 / 15) * 100}%` }} />
                      </div>
                    </div>

                    {/* W3 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold">Week 3: Tech Architecture & Git Repositories</span>
                        <span className="font-semibold text-white">{certificate.scores.week3} / 15</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(certificate.scores.week3 / 15) * 100}%` }} />
                      </div>
                    </div>

                    {/* W4 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold">Week 4: Business Models & Pitch Decks</span>
                        <span className="font-semibold text-white">{certificate.scores.week4} / 15</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(certificate.scores.week4 / 15) * 100}%` }} />
                      </div>
                    </div>

                    {/* Project */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold">Final Project Prototype & Contribution</span>
                        <span className="font-semibold text-white">{certificate.scores.projectContribution} / 40</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(certificate.scores.projectContribution / 40) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Effort Log Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-blue-500" /> Milestone Efforts & Achievements
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* W1 */}
                  {certificate.efforts.week1 && (
                    <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-blue-400 mb-1.5 uppercase">Week 1 Effort Log</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{certificate.efforts.week1}</p>
                    </div>
                  )}

                  {/* W2 */}
                  {certificate.efforts.week2 && (
                    <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-blue-400 mb-1.5 uppercase">Week 2 Effort Log</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{certificate.efforts.week2}</p>
                    </div>
                  )}

                  {/* W3 */}
                  {certificate.efforts.week3 && (
                    <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-blue-400 mb-1.5 uppercase">Week 3 Effort Log</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{certificate.efforts.week3}</p>
                    </div>
                  )}

                  {/* W4 */}
                  {certificate.efforts.week4 && (
                    <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-blue-400 mb-1.5 uppercase">Week 4 Effort Log</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{certificate.efforts.week4}</p>
                    </div>
                  )}

                  {/* Project */}
                  {certificate.efforts.projectContribution && (
                    <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 md:col-span-2">
                      <h4 className="text-xs font-bold text-emerald-400 mb-1.5 uppercase">Prototype & Team Contribution Details</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{certificate.efforts.projectContribution}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Submissions Details Link Card */}
              {project && (
                <div className="space-y-4 pt-6 border-t border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                    Incubated Startup Initiative: <span className="text-white normal-case">{project.teamName || "Project Showcase"}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {project.submissions?.day2?.prdUrl && (
                      <a 
                        href={project.submissions.day2.prdUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-4 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
                      >
                        📄 Product Requirements (PRD) ↗
                      </a>
                    )}
                    {project.submissions?.day3?.githubUrl && (
                      <a 
                        href={project.submissions.day3.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-4 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
                      >
                        💻 GitHub Code Repository ↗
                      </a>
                    )}
                    {project.submissions?.day5?.mvpVideoUrl && (
                      <a 
                        href={project.submissions.day5.mvpVideoUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-4 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
                      >
                        🎥 Mid-Term MVP Demo ↗
                      </a>
                    )}
                    {project.submissions?.day7?.finalPitchDeckUrl && (
                      <a 
                        href={project.submissions.day7.finalPitchDeckUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-4 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
                      >
                        📊 Investor Pitch Deck ↗
                      </a>
                    )}
                    {project.submissions?.day7?.finalMvpUrl && (
                      <a 
                        href={project.submissions.day7.finalMvpUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-4 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
                      >
                        🚀 Live MVP Deployment ↗
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Startup Incubator Curriculum Outline */}
              <div className="space-y-4 pt-6 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Startup Incubator Curriculum Outline
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 space-y-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase">Week 1</span>
                    <h4 className="text-xs font-semibold text-white">Market & Customer Discovery</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">Ideation mechanics, identifying customer personas, validating pain points, and TAM/SAM/SOM sizing.</p>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 space-y-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase">Week 2</span>
                    <h4 className="text-xs font-semibold text-white">Value Prop & Specs (PRD)</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">Mapping value propositions, drafting PRDs, and wireframe designs.</p>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 space-y-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase">Week 3</span>
                    <h4 className="text-xs font-semibold text-white">Architecture & Git Workflows</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">Full-stack database models, modular project setup, and Git branching.</p>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 space-y-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase">Week 4</span>
                    <h4 className="text-xs font-semibold text-white">Revenue Models & Pitching</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">Unit economics modeling, cost/revenue canvas design, pitch deck layouts, and pitching.</p>
                  </div>
                </div>
              </div>

              {/* Final Gryork Remarks */}
              {certificate.finalRemarks && (
                <div className="bg-gradient-to-br from-blue-950/30 to-slate-950 border border-blue-900/30 rounded-xl p-5 space-y-2">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                    Gryork Academy Evaluator Remarks
                  </h4>
                  <p className="text-sm text-slate-200 italic leading-relaxed">
                    "{certificate.finalRemarks}"
                  </p>
                </div>
              )}

              {/* Verified Badge Footer */}
              <div className="flex items-center justify-center gap-2 pt-4 text-[10px] text-slate-500 font-mono">
                <span>Verification Authority: Gryork Technical Committee</span>
                <span>•</span>
                <span>Type: Program Completion & Startup Evaluation Report</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Printable certificate styles injection - ONLY active when printing */}
      <style>{`
        @media print {
          body, html {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          /* Hide everything except our target container */
          #printable-certificate-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 62.5vw !important; /* exact 16/10 aspect ratio */
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background-color: white !important;
            z-index: 99999 !important;
            container-type: inline-size !important;
          }
          
          body > :not(#printable-certificate-container):not(.min-h-screen) {
            display: none !important;
          }
          .min-h-screen {
            background: white !important;
            padding: 0 !important;
          }
          .min-h-screen > :not(.max-w-4xl) {
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
