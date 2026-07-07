import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { techpreneurApi } from "../../../api";
import { ArrowLeft, Award, FileSpreadsheet, Search, X } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  year: string;
  paymentVerified: boolean;
}


export default function CertificateIssuancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [certificates, setCertificates] = useState<Record<string, any>>({}); // Key: studentId
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sendingEmails, setSendingEmails] = useState(false);
  
  // Modal/Drawer state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [scoreForm, setScoreForm] = useState({
    week1Score: 0,
    week2Score: 0,
    week3Score: 0,
    week4Score: 0,
    projectScore: 0,
    week1Remarks: "",
    week2Remarks: "",
    week3Remarks: "",
    week4Remarks: "",
    projectRemarks: "",
    finalRemarks: ""
  });

  // Bulk Upload state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [csvInput, setCsvInput] = useState("");
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch registrations and certificates in parallel
      const [regRes, certsRes] = await Promise.all([
        techpreneurApi.getRegistrations({ limit: 200 }),
        techpreneurApi.getCertificates()
      ]);
      
      const verifiedList = (regRes.data.items || []).filter((s: Student) => s.paymentVerified);
      setStudents(verifiedList);

      const certsMap: Record<string, any> = {};
      (certsRes.data.certificates || []).forEach((c: any) => {
        certsMap[c.studentId] = c;
      });
      setCertificates(certsMap);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openScorecardDrawer = async (student: Student) => {
    setSelectedStudent(student);
    
    // Check if certificate already exists in state
    const existingCert = certificates[student._id];
    if (existingCert) {
      setScoreForm({
        week1Score: existingCert.scores?.week1 || 0,
        week2Score: existingCert.scores?.week2 || 0,
        week3Score: existingCert.scores?.week3 || 0,
        week4Score: existingCert.scores?.week4 || 0,
        projectScore: existingCert.scores?.projectContribution || 0,
        week1Remarks: existingCert.efforts?.week1 || "",
        week2Remarks: existingCert.efforts?.week2 || "",
        week3Remarks: existingCert.efforts?.week3 || "",
        week4Remarks: existingCert.efforts?.week4 || "",
        projectRemarks: existingCert.efforts?.projectContribution || "",
        finalRemarks: existingCert.finalRemarks || ""
      });
    } else {
      setScoreForm({
        week1Score: 0, week2Score: 0, week3Score: 0, week4Score: 0, projectScore: 0,
        week1Remarks: "Participated actively in kickoff sessions and set up team theme.",
        week2Remarks: "Formulated problem statement and target audience specs inside PRD.",
        week3Remarks: "Structured GitHub project folders and set up repository setup.",
        week4Remarks: "Developed revenue canvas slides and competitor matrices for pitch deck.",
        projectRemarks: "Contributed effectively to core programming and live MVP execution.",
        finalRemarks: "Excellent performance and technical delivery throughout the cohort."
      });
    }
    
    setShowDrawer(true);
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      await techpreneurApi.issueCertificate({
        studentId: selectedStudent._id,
        scores: {
          week1: Number(scoreForm.week1Score),
          week2: Number(scoreForm.week2Score),
          week3: Number(scoreForm.week3Score),
          week4: Number(scoreForm.week4Score),
          projectContribution: Number(scoreForm.projectScore)
        },
        efforts: {
          week1: scoreForm.week1Remarks,
          week2: scoreForm.week2Remarks,
          week3: scoreForm.week3Remarks,
          week4: scoreForm.week4Remarks,
          projectContribution: scoreForm.projectRemarks
        },
        finalRemarks: scoreForm.finalRemarks
      });
      alert(`Certificate issued successfully for ${selectedStudent.name}!`);
      setShowDrawer(false);
      fetchData();
    } catch (err: any) {
      alert("Failed to issue certificate: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkIssueDefaults = async () => {
    if (!window.confirm("This will generate blank default certificate numbers and scorecards for all paid/verified students who don't have one yet. Proceed?")) return;
    setLoading(true);
    try {
      const res = await techpreneurApi.bulkIssueCertificates({});
      alert(`Successfully generated certificates for ${res.data.count} students!`);
      fetchData();
    } catch (err: any) {
      alert("Bulk issuance failed: " + err.message);
      setLoading(false);
    }
  };

  const handleCsvBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvInput.trim()) return;
    setBulkProcessing(true);
    try {
      // Simple CSV parser
      const lines = csvInput.split("\n");
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      
      const parsedData: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(",").map(v => v.trim());
        const rowObj: any = {};
        headers.forEach((header, index) => {
          rowObj[header] = values[index] || "";
        });
        parsedData.push(rowObj);
      }

      const res = await techpreneurApi.bulkIssueCertificates({ csvData: parsedData });
      alert(`CSV Bulk Upload success! Issued/updated certificates for ${res.data.count} students.`);
      setShowBulkModal(false);
      setCsvInput("");
      fetchData();
    } catch (err: any) {
      alert("CSV Bulk Upload failed: " + err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleSendEmails = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to dispatch certificate emails to the ${selectedIds.length} selected student(s)?`)) return;
    setSendingEmails(true);
    try {
      const res = await techpreneurApi.sendCertificateEmails({ studentIds: selectedIds });
      alert(`Successfully dispatched emails to ${res.data.count} student(s)!`);
      setSelectedIds([]);
      fetchData();
    } catch (err: any) {
      alert("Failed to dispatch emails: " + (err.response?.data?.error || err.message));
    } finally {
      setSendingEmails(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase()) || 
    s.college.toLowerCase().includes(search.toLowerCase())
  );

  const totalScore = 
    Number(scoreForm.week1Score) + 
    Number(scoreForm.week2Score) + 
    Number(scoreForm.week3Score) + 
    Number(scoreForm.week4Score) + 
    Number(scoreForm.projectScore);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/admin/techpreneur" className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Certificate & Report Management</h1>
            <p className="text-xs text-gray-500">Issue certificates, scorecards, and import bulk review score sheets</p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleSendEmails}
              disabled={sendingEmails}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
            >
              ✉️ Send Emails ({selectedIds.length})
            </button>
          )}
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Bulk CSV Import
          </button>
          <button
            onClick={handleBulkIssueDefaults}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
          >
            <Award className="w-4 h-4" /> Generate All Defaults
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Search row */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or college..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">{filteredStudents.length} Verified Student Registrations</span>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredStudents.map(s => s._id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">College & Program Track</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No matching students found.</td>
                  </tr>
                ) : (
                  filteredStudents.map(s => {
                    const cert = certificates[s._id];
                    const isChecked = selectedIds.includes(s._id);
                    return (
                      <tr key={s._id} className={`hover:bg-gray-50/80 transition-colors ${isChecked ? "bg-blue-50/20" : ""}`}>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds(prev => [...prev, s._id]);
                              } else {
                                setSelectedIds(prev => prev.filter(id => id !== s._id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{s.name}</div>
                          <div className="text-xs text-gray-500">{s.email}</div>
                          {cert && (
                            <div className="mt-1 text-[11px] font-mono text-blue-600 font-semibold flex items-center gap-1.5">
                              <span>ID: {cert.certificateId}</span>
                              <a 
                                href={`https://techpreneur.grylink.com/verify-certificate/${cert.certificateId}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:underline text-[10px] text-gray-400 font-normal"
                              >
                                (View ↗)
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 font-medium text-xs sm:text-sm">{s.college}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{s.branch} · {s.year}</div>
                        </td>
                        <td className="px-6 py-4 text-center space-y-1">
                          {cert ? (
                            <>
                              <div>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Issued
                                </span>
                              </div>
                              <div>
                                {cert.emailSent ? (
                                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                    ✓ Emailed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                                    Not Emailed
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              Not Issued
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openScorecardDrawer(s)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                          >
                            {cert ? "Edit Scorecard / Reissue" : "Edit Scorecard / Issue"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* 1. Scorecard Drawer Modal */}
      {showDrawer && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Scorecard & Report Card Details</h3>
                <p className="text-xs text-gray-500 mt-1">Student: {selectedStudent.name} ({selectedStudent.email})</p>
              </div>
              <button onClick={() => setShowDrawer(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Form */}
            <form onSubmit={handleIssueSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Total Scorecard Counter */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="text-blue-800 font-bold text-sm">Overall Report Score</h4>
                  <p className="text-[10px] text-blue-600">Scores must add up out of 100 points maximum</p>
                </div>
                <span className="text-3xl font-extrabold text-blue-700 font-mono">{totalScore} <span className="text-sm font-semibold text-blue-500">/ 100</span></span>
              </div>

              {/* Weekly Score inputs */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Weekly Score Allocations (Max 20 each)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[
                    { key: "week1Score", label: "Week 1" },
                    { key: "week2Score", label: "Week 2" },
                    { key: "week3Score", label: "Week 3" },
                    { key: "week4Score", label: "Week 4" },
                    { key: "projectScore", label: "Project" }
                  ].map(w => (
                    <div key={w.key}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{w.label}</label>
                      <input
                        type="number" min="0" max="20" required
                        value={scoreForm[w.key as keyof typeof scoreForm]}
                        onChange={e => setScoreForm({ ...scoreForm, [w.key]: Number(e.target.value) })}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 text-center font-semibold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Effort Remark text fields */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Teammate Effort Descriptions</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Week 1 Effort Details</label>
                    <input
                      type="text" required
                      value={scoreForm.week1Remarks}
                      onChange={e => setScoreForm({ ...scoreForm, week1Remarks: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Week 2 (Ideation & PRD) Effort Details</label>
                    <input
                      type="text" required
                      value={scoreForm.week2Remarks}
                      onChange={e => setScoreForm({ ...scoreForm, week2Remarks: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Week 3 (Planning & GitHub) Effort Details</label>
                    <input
                      type="text" required
                      value={scoreForm.week3Remarks}
                      onChange={e => setScoreForm({ ...scoreForm, week3Remarks: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Week 4 (Pitch Deck) Effort Details</label>
                    <input
                      type="text" required
                      value={scoreForm.week4Remarks}
                      onChange={e => setScoreForm({ ...scoreForm, week4Remarks: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Team Project & Contribution Details</label>
                    <input
                      type="text" required
                      value={scoreForm.projectRemarks}
                      onChange={e => setScoreForm({ ...scoreForm, projectRemarks: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Overall review remarks */}
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Gryork Final Review</h4>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mentor Overall Review & Remarks</label>
                  <textarea
                    rows={3} required
                    value={scoreForm.finalRemarks}
                    onChange={e => setScoreForm({ ...scoreForm, finalRemarks: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 resize-none"
                    placeholder="Describe student performance, dedication, and leadership qualities..."
                  />
                </div>
              </div>

              {/* Submit panel */}
              <div className="pt-6 border-t border-gray-100 flex gap-3">
                <button
                  type="button" onClick={() => setShowDrawer(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting || totalScore > 100}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Issue Certificate & Report"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. CSV Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-lg font-bold text-gray-900">CSV Bulk Upload Scores</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCsvBulkUpload} className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-700">Required CSV Headers (Case-insensitive):</p>
                <code className="block bg-gray-100 p-1.5 rounded font-mono text-[10px] select-all overflow-x-auto">
                  email,week1Score,week2Score,week3Score,week4Score,projectScore,week1Remarks,week2Remarks,week3Remarks,week4Remarks,projectRemarks,finalRemarks
                </code>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Paste CSV Contents (Plain Text)</label>
                <textarea
                  rows={8} required
                  value={csvInput}
                  onChange={e => setCsvInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-xs text-gray-900 font-mono resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="email,week1Score,week2Score,...\nstudent@college.edu,18,17,..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button" onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={bulkProcessing || !csvInput.trim()}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {bulkProcessing ? "Processing..." : "Process Bulk Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
