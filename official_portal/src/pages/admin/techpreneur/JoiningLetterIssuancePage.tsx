import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { techpreneurApi } from "../../../api";
import { ArrowLeft, FileText, Search, X, Mail } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  year: string;
  paymentVerified: boolean;
  trackPreference?: string;
}

interface Template {
  _id: string;
  name: string;
  isActive: boolean;
}

export default function JoiningLetterIssuancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [letters, setLetters] = useState<Record<string, any>>({}); // Key: studentId
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sendingEmails, setSendingEmails] = useState(false);

  // Modal/Drawer state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [letterForm, setLetterForm] = useState({
    joiningDate: new Date().toISOString().split("T")[0],
    templateId: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [regRes, lettersRes, templatesRes] = await Promise.all([
        techpreneurApi.getRegistrations({ limit: 200 }),
        techpreneurApi.getJoiningLetters(),
        techpreneurApi.getJoiningLetterTemplates()
      ]);
      
      const verifiedList = (regRes.data.items || []).filter((s: Student) => s.paymentVerified);
      setStudents(verifiedList);

      const lettersMap: Record<string, any> = {};
      (lettersRes.data.joiningLetters || []).forEach((l: any) => {
        lettersMap[l.studentId] = l;
      });
      setLetters(lettersMap);

      const templateList = templatesRes.data.templates || [];
      setTemplates(templateList);
      
      // Auto-select active template in form
      const activeTpl = templateList.find((t: any) => t.isActive);
      if (activeTpl) {
        setLetterForm(prev => ({ ...prev, templateId: activeTpl._id }));
      } else if (templateList.length > 0) {
        setLetterForm(prev => ({ ...prev, templateId: templateList[0]._id }));
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to load joining letter data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openLetterDrawer = (student: Student) => {
    setSelectedStudent(student);
    const existing = letters[student._id];
    
    setLetterForm({
      joiningDate: existing 
        ? new Date(existing.joiningDate).toISOString().split("T")[0] 
        : new Date().toISOString().split("T")[0],
      templateId: existing?.templateId?._id || existing?.templateId || letterForm.templateId
    });
    
    setShowDrawer(true);
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      await techpreneurApi.issueJoiningLetter({
        studentId: selectedStudent._id,
        joiningDate: new Date(letterForm.joiningDate),
        templateId: letterForm.templateId || undefined
      });
      alert(`Joining Letter issued successfully for ${selectedStudent.name}!`);
      setShowDrawer(false);
      fetchData();
    } catch (err: any) {
      alert("Failed to issue joining letter: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkIssueDefaults = async () => {
    if (!window.confirm("This will generate blank joining letter records for all paid/verified students who don't have one. Proceed?")) return;
    setLoading(true);
    try {
      const activeTpl = templates.find(t => t.isActive);
      const res = await techpreneurApi.bulkIssueJoiningLetters({
        templateId: activeTpl?._id
      });
      alert(`Successfully generated joining letters for ${res.data.count} student(s)!`);
      fetchData();
    } catch (err: any) {
      alert("Bulk issuance failed: " + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const handleSendEmails = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to dispatch joining letter onboarding emails to the ${selectedIds.length} selected student(s)?`)) return;
    setSendingEmails(true);
    try {
      const res = await techpreneurApi.sendJoiningLetterEmails({ studentIds: selectedIds });
      alert(`Successfully dispatched onboarding letters to ${res.data.count} student(s)!`);
      setSelectedIds([]);
      fetchData();
    } catch (err: any) {
      alert("Failed to send emails: " + (err.response?.data?.error || err.message));
    } finally {
      setSendingEmails(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase()) || 
    s.college.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/admin/techpreneur" className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Joining Letter Management</h1>
            <p className="text-xs text-gray-500">Issue official onboarding letters and send activation emails</p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleSendEmails}
              disabled={sendingEmails}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
            >
              <Mail className="w-4 h-4" /> Send Emails ({selectedIds.length})
            </button>
          )}
          <button
            onClick={handleBulkIssueDefaults}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" /> Generate All Defaults
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or college..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">{filteredStudents.length} Paid & Verified Registrations</span>
        </div>

        {/* Table */}
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
                  <th className="px-6 py-4">College & Track</th>
                  <th className="px-6 py-4 text-center">Letter Status</th>
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
                    const letter = letters[s._id];
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
                          {letter && (
                            <div className="mt-1 text-[11px] font-mono text-pink-600 font-semibold flex items-center gap-1.5">
                              <span>Ref: {letter.joiningLetterId}</span>
                              <a 
                                href={`https://training.gryork.com/verify-joining-letter/${letter.joiningLetterId}`} 
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
                          <div className="text-xs text-gray-500 mt-0.5">{s.trackPreference || "Not Specified"}</div>
                        </td>
                        <td className="px-6 py-4 text-center space-y-1">
                          {letter ? (
                            <>
                              <div>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Issued
                                </span>
                              </div>
                              <div>
                                {letter.emailSent ? (
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
                            onClick={() => openLetterDrawer(s)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                          >
                            {letter ? "Edit / Reissue" : "Edit / Issue"}
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

      {/* Issuance Drawer */}
      {showDrawer && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Issue Onboarding Letter</h3>
                <p className="text-xs text-gray-500 mt-1">{selectedStudent.name} · {selectedStudent.email}</p>
              </div>
              <button onClick={() => setShowDrawer(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Template */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Select Template</label>
                <select
                  value={letterForm.templateId}
                  onChange={e => setLetterForm({ ...letterForm, templateId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>-- Choose a template --</option>
                  {templates.map(t => (
                    <option key={t._id} value={t._id}>{t.name} {t.isActive ? "(Active)" : ""}</option>
                  ))}
                </select>
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Joining Date</label>
                <input
                  type="date"
                  value={letterForm.joiningDate}
                  onChange={e => setLetterForm({ ...letterForm, joiningDate: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:ring-1 focus:ring-blue-500 font-semibold"
                  required
                />
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-3">
                <button
                  type="button" onClick={() => setShowDrawer(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
                >
                  {submitting ? "Processing..." : "Confirm & Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
