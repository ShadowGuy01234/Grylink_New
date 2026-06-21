import { useEffect, useState } from "react";
import { 
  FolderOpen, Github, HardDrive, CheckCircle, AlertCircle, 
  Users, Plus, Key, Copy, ExternalLink, FileText, Video, 
  Lock, Unlock, ShieldAlert, Award
} from "lucide-react";
import { fetchMyProject, createTeam, joinTeam, submitDay } from "../../lib/api";
import { useStudentAuth } from "../../context/StudentAuthContext";

const THEMES = [
  "AI-Powered EdTech & Learning Assistants",
  "FinTech & Smart Personal Finance",
  "HealthTech & Remote Patient Care",
  "GreenTech & Sustainability Tracking",
  "AI-Driven SaaS & B2B Productivity",
  "Smart Cities & IoT Logistics",
  "E-Commerce & Hyperlocal Delivery",
  "Creator Economy & Content AI",
  "LegalTech & Document Automation",
  "CyberSecurity & Data Privacy"
];

interface Teammate {
  name: string;
  email: string;
  techId?: string;
}

interface Project {
  _id: string;
  teamName: string;
  teamCode: string;
  theme: string;
  customThemeProblem?: string;
  teamMembers: Teammate[];
  submissions?: {
    day1?: { teamName: string; theme: string; customThemeProblem?: string; members: Teammate[]; submittedAt: string };
    day2?: { prdUrl: string; submittedAt: string };
    day3?: { githubUrl: string; submittedAt: string };
    day4?: { pitchDeckUrl: string; submittedAt: string };
    day5?: { mvpVideoUrl: string; midReportUrl: string; submittedAt: string };
    day6?: { businessSlidesUrl: string; submittedAt: string };
    day7?: { finalMvpUrl: string; finalPitchDeckUrl: string; finalReportUrl: string; portfolios: Array<{ email: string; portfolioUrl: string }>; submittedAt: string };
  };
  dailyStatus: {
    day1: string;
    day2: string;
    day3: string;
    day4: string;
    day5: string;
    day6: string;
    day7: string;
  };
  dailyFeedback: {
    day1: string;
    day2: string;
    day3: string;
    day4: string;
    day5: string;
    day6: string;
    day7: string;
  };
}

const PROGRAM_DAYS = [
  { day: 1, title: "Kickoff & Setup", dateStr: "Sunday, 21 June 2026", date: new Date("2026-06-21T00:00:00+05:30"), desc: "Finalise team name, members, and project theme selection." },
  { day: 2, title: "Ideation & PRD", dateStr: "Monday, 22 June 2026", date: new Date("2026-06-22T00:00:00+05:30"), desc: "Conduct market research and submit your Product Requirement Document (PRD)." },
  { day: 3, title: "Planning & Execution", dateStr: "Tuesday, 23 June 2026", date: new Date("2026-06-23T00:00:00+05:30"), desc: "UI/UX architectural review and GitHub repository initialisation." },
  { day: 4, title: "Pitch Deck Day", dateStr: "Wednesday, 24 June 2026", date: new Date("2026-06-24T00:00:00+05:30"), desc: "Draft and submit your Startup Pitch Deck covering revenue model and business canvas." },
  { day: 5, title: "Mid Evaluation", dateStr: "Thursday, 25 June 2026", date: new Date("2026-06-25T00:00:00+05:30"), desc: "Present a working MVP demo video and submit your Mid-Evaluation Report." },
  { day: 6, title: "Technical Doubt Session", dateStr: "Friday, 26 June 2026", date: new Date("2026-06-26T00:00:00+05:30"), desc: "Mentors review MVPs and business slide final improvements." },
  { day: 7, title: "Final Submission Day", dateStr: "Saturday, 27 June 2026", date: new Date("2026-06-27T00:00:00+05:30"), desc: "Submit your final live MVP, polished Pitch Deck, project report, and individual 3D portfolio." },
  { day: 8, title: "Final Demo Day", dateStr: "Sunday, 28 June 2026", date: new Date("2026-06-28T00:00:00+05:30"), desc: "Pitch your startup idea live to the jury panel and celebrate program completion!" }
];

export function ProjectsPage() {
  const { student } = useStudentAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Dashboard view toggle: "create" | "join" | null (only when project is null)
  const [authMode, setAuthMode] = useState<"create" | "join" | null>(null);

  // Active Day Timeline Accordion
  const [expandedDay, setExpandedDay] = useState<number>(1);

  // Day 1 Creation State
  const [createData, setCreateData] = useState({
    teamName: "",
    theme: THEMES[0],
    customThemeProblem: "",
    members: [
      { name: "", email: "", techId: "" },
      { name: "", email: "", techId: "" },
      { name: "", email: "", techId: "" }
    ]
  });

  // Join Team State
  const [teamCodeInput, setTeamCodeInput] = useState("");

  // Daily Deliverables Forms States
  const [day2Form, setDay2Form] = useState({ prdUrl: "" });
  const [day3Form, setDay3Form] = useState({ githubUrl: "" });
  const [day4Form, setDay4Form] = useState({ pitchDeckUrl: "" });
  const [day5Form, setDay5Form] = useState({ mvpVideoUrl: "", midReportUrl: "" });
  const [day6Form, setDay6Form] = useState({ businessSlidesUrl: "" });
  const [day7Form, setDay7Form] = useState({ finalMvpUrl: "", finalPitchDeckUrl: "", finalReportUrl: "", portfolioUrl: "" });

  const loadProject = async () => {
    try {
      const res = await fetchMyProject();
      if (res.project) {
        setProject(res.project);
        // Pre-populate input fields
        if (res.project.submissions) {
          setDay2Form({ prdUrl: res.project.submissions.day2?.prdUrl || "" });
          setDay3Form({ githubUrl: res.project.submissions.day3?.githubUrl || "" });
          setDay4Form({ pitchDeckUrl: res.project.submissions.day4?.pitchDeckUrl || "" });
          setDay5Form({ 
            mvpVideoUrl: res.project.submissions.day5?.mvpVideoUrl || "", 
            midReportUrl: res.project.submissions.day5?.midReportUrl || "" 
          });
          setDay6Form({ businessSlidesUrl: res.project.submissions.day6?.businessSlidesUrl || "" });
          
          const matchingPortfolio = res.project.submissions.day7?.portfolios?.find((p: any) => p.email === student?.email);
          setDay7Form({
            finalMvpUrl: res.project.submissions.day7?.finalMvpUrl || "",
            finalPitchDeckUrl: res.project.submissions.day7?.finalPitchDeckUrl || "",
            finalReportUrl: res.project.submissions.day7?.finalReportUrl || "",
            portfolioUrl: matchingPortfolio?.portfolioUrl || ""
          });
        }
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, []);

  const handleCopyCode = () => {
    if (project?.teamCode) {
      navigator.clipboard.writeText(project.teamCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isDayUnlocked = (dayNumber: number): boolean => {
    const dayObj = PROGRAM_DAYS.find(d => d.day === dayNumber);
    if (!dayObj) return false;
    const now = new Date();
    return now >= dayObj.date;
  };

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const filteredMembers = createData.members.filter(m => m.name.trim() !== "" && m.email.trim() !== "");
      const res = await createTeam({
        teamName: createData.teamName,
        theme: createData.theme,
        customThemeProblem: createData.customThemeProblem,
        members: filteredMembers
      });
      setSuccess("Team created successfully!");
      setProject(res.project);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await joinTeam({ teamCode: teamCodeInput });
      setSuccess("Successfully joined the team!");
      setProject(res.project);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDaySubmit = async (dayNumber: number, formData: any) => {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await submitDay(dayNumber, formData);
      setProject(res.project);
      setSuccess(`Day ${dayNumber} submission saved successfully!`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Guidelines component to prevent direct uploads
  const SubmissionGuidelines = () => (
    <div className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-4 mb-4 text-xs space-y-2 text-amber-200">
      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
        <ShieldAlert className="w-4 h-4 text-amber-400" /> Deliverables Upload Guidelines
      </div>
      <ul className="list-disc pl-4 space-y-1">
        <li><strong>No Direct Uploads</strong>: Please do not attempt to upload raw files. Host your work externally and paste links.</li>
        <li><strong>Google Drive / Docs</strong>: Set access permissions to <strong>"Anyone with the link can view"</strong> so mentors can open your files.</li>
        <li><strong>GitHub Repos</strong>: Make sure repositories are set to <strong>"Public"</strong>.</li>
        <li><strong>MVP Videos</strong>: Upload demo videos to YouTube (set as <strong>Public</strong> or <strong>Unlisted</strong>) or Google Drive.</li>
      </ul>
    </div>
  );

  // 1. NO TEAM REGISTERED YET
  if (!project) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Project Week Cohort</h1>
            <p className="text-slate-400 text-sm">Create or join a startup team to start submitting deliverables</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/40 text-red-300 rounded-xl p-4 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/30 border border-green-700/40 text-green-300 rounded-xl p-4 text-sm flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {success}
          </div>
        )}

        {!authMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Create Team option */}
            <button
              onClick={() => setAuthMode("create")}
              className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 hover:border-emerald-500/40 rounded-2xl group transition-all text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 group-hover:bg-emerald-600/20 flex items-center justify-center transition-colors">
                <Plus className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Create a Startup Team</h3>
                <p className="text-slate-400 text-xs mt-1">Start a fresh team, select a project theme, and invite up to 3 teammates.</p>
              </div>
            </button>

            {/* Join Team option */}
            <button
              onClick={() => setAuthMode("join")}
              className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 hover:border-blue-500/40 rounded-2xl group transition-all text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 group-hover:bg-blue-600/20 flex items-center justify-center transition-colors">
                <Key className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Join an Existing Team</h3>
                <p className="text-slate-400 text-xs mt-1">Teammate already created a team? Enter their TEAM code to jump in.</p>
              </div>
            </button>
          </div>
        ) : authMode === "create" ? (
          <form onSubmit={handleCreateTeamSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h2 className="text-white font-bold text-lg">Create Startup Team</h2>
              <button type="button" onClick={() => setAuthMode(null)} className="text-slate-400 hover:text-white text-xs underline">Back</button>
            </div>

            <div className="space-y-4">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Team Name</label>
                <input
                  type="text" required
                  value={createData.teamName}
                  onChange={e => setCreateData(p => ({ ...p, teamName: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="E.g., Visionary Devs"
                />
              </div>

              {/* Theme selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Theme</label>
                <select
                  value={createData.theme}
                  onChange={e => setCreateData(p => ({ ...p, theme: e.target.value }))}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-emerald-500/50"
                >
                  {THEMES.map(theme => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                  <option value="other">Other (Custom Startup Idea / Problem)</option>
                </select>
              </div>

              {/* Custom Theme text */}
              {createData.theme === "other" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Define Your Problem / Custom Idea</label>
                  <textarea
                    required rows={3}
                    value={createData.customThemeProblem}
                    onChange={e => setCreateData(p => ({ ...p, customThemeProblem: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    placeholder="Describe the startup idea or user problem you plan to address..."
                  />
                </div>
              )}

              {/* Add Teammates */}
              <div className="pt-4 border-t border-white/5">
                <h3 className="text-white font-semibold text-sm mb-3">Teammates Details (Optional - maximum 3 extra members)</h3>
                <p className="text-slate-400 text-xs mb-4">Teammates can also join later using your unique Team Code.</p>
                <div className="space-y-4">
                  {createData.members.map((member, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Teammate {index + 1} Name</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={e => {
                            const newM = [...createData.members];
                            newM[index].name = e.target.value;
                            setCreateData(p => ({ ...p, members: newM }));
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 text-xs"
                          placeholder="Name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Teammate {index + 1} Email</label>
                        <input
                          type="email"
                          value={member.email}
                          onChange={e => {
                            const newM = [...createData.members];
                            newM[index].email = e.target.value;
                            setCreateData(p => ({ ...p, members: newM }));
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 text-xs"
                          placeholder="registered@email.com"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Team & Submit Day 1"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinTeamSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h2 className="text-white font-bold text-lg">Join Existing Team</h2>
              <button type="button" onClick={() => setAuthMode(null)} className="text-slate-400 hover:text-white text-xs underline">Back</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Enter Team Code</label>
                <input
                  type="text" required
                  value={teamCodeInput}
                  onChange={e => setTeamCodeInput(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-white placeholder-slate-600 text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500/50"
                  placeholder="TEAM_XXXXXX"
                />
              </div>
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
            >
              {submitting ? "Joining..." : "Join Team"}
            </button>
          </form>
        )}
      </div>
    );
  }

  // 2. HAS REGISTERED TEAM
  const overallProgress = Object.keys(project.dailyStatus).filter(k => project.dailyStatus[k as keyof typeof project.dailyStatus] !== "pending").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Team Details Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">Active Startup Team</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium">Track: {project.track}</span>
            </div>
            <h1 className="text-white font-bold text-2xl mb-1">{project.teamName}</h1>
            <p className="text-slate-400 text-sm flex items-center gap-1.5">
              Theme: <span className="text-slate-200 font-semibold">{project.theme === "other" ? "Custom Idea" : project.theme}</span>
            </p>
            {project.customThemeProblem && (
              <p className="text-slate-500 text-xs italic mt-1 max-w-xl">Problem: "{project.customThemeProblem}"</p>
            )}
          </div>

          {/* Team Code box */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-4 sm:self-center">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Team Code</p>
              <code className="text-emerald-400 font-mono font-bold text-base">{project.teamCode}</code>
            </div>
            <button
              onClick={handleCopyCode}
              className={`p-2 rounded-lg transition-all ${
                copied ? "bg-green-600/20 text-green-400 border border-green-500/30" : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
              }`}
            >
              {copied ? "Copied!" : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Member names */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-2">
          {project.teamMembers.map((m, idx) => (
            <div key={m.email} className="flex items-center gap-1.5 text-xs text-slate-300">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{m.name}</span>
              {m.techId && <span className="text-[10px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded">ID: {m.techId}</span>}
              {idx === 0 && <span className="text-[9px] text-emerald-400 font-bold">(Founder)</span>}
            </div>
          ))}
        </div>

        {/* Overall Completion Progress */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(overallProgress / 7) * 100}%` }}
            />
          </div>
          <span className="text-white text-xs font-bold font-mono">{overallProgress} / 7 Submitted</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/40 text-red-300 rounded-xl p-4 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-700/40 text-green-300 rounded-xl p-4 text-sm flex items-start gap-2">
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {success}
        </div>
      )}

      {/* 8-Day Accordion Timeline */}
      <div className="space-y-4">
        <h2 className="text-white font-bold text-lg px-1">Daily Milestones</h2>

        {PROGRAM_DAYS.map((d) => {
          const isExpanded = expandedDay === d.day;
          const unlocked = isDayUnlocked(d.day);
          
          // Get Day Status
          let statusText = "Pending Submission";
          let badgeColor = "bg-slate-800 text-slate-400";
          if (d.day === 8) {
            statusText = "Presentation";
            badgeColor = "bg-indigo-900/30 text-indigo-300 border border-indigo-500/20";
          } else {
            const dayKey = `day${d.day}` as keyof typeof project.dailyStatus;
            const status = project.dailyStatus[dayKey];
            if (status === "submitted") {
              statusText = "Submitted";
              badgeColor = "bg-amber-900/30 text-amber-300 border border-amber-500/20";
            } else if (status === "approved" || status === "reviewed") {
              statusText = status === "approved" ? "Approved" : "Reviewed";
              badgeColor = "bg-emerald-900/30 text-emerald-300 border border-emerald-500/20";
            }
          }

          return (
            <div 
              key={d.day} 
              className={`bg-white/5 border rounded-2xl overflow-hidden transition-all duration-300 ${
                isExpanded ? "border-slate-700 shadow-xl bg-white/[0.07]" : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Accordion Header */}
              <button
                onClick={() => setExpandedDay(isExpanded ? 0 : d.day)}
                className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5 text-left transition-colors"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold text-emerald-400">DAY {d.day}</span>
                    <span className="text-xs text-slate-500">• {d.dateStr}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
                      {statusText}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-base flex items-center gap-1.5">
                    {d.title}
                    {!unlocked && <Lock className="w-3.5 h-3.5 text-slate-600" />}
                    {unlocked && <Unlock className="w-3.5 h-3.5 text-emerald-600/60" />}
                  </h3>
                </div>
                
                <span className="text-slate-400 text-xs hidden sm:block">
                  {isExpanded ? "Collapse ▲" : "Expand ▼"}
                </span>
              </button>

              {/* Accordion Expand Content */}
              {isExpanded && (
                <div className="p-5 border-t border-white/5 bg-slate-950/40 space-y-4">
                  <p className="text-slate-300 text-sm leading-relaxed">{d.desc}</p>
                  
                  {/* Lock Callout */}
                  {!unlocked && (
                    <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
                      <Lock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <div className="text-slate-300 text-xs">
                        This submission portal is locked. It unlocks on <strong className="text-white">{d.dateStr}</strong> based on the program schedule.
                      </div>
                    </div>
                  )}

                  {/* Submission Form and Info */}
                  {unlocked && (
                    <div className="space-y-4">
                      {/* Guidelines info */}
                      {d.day < 8 && <SubmissionGuidelines />}

                      {/* DAY 1 VIEW TEAM */}
                      {d.day === 1 && (
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 space-y-2">
                          <h4 className="text-white font-semibold text-xs uppercase tracking-wider text-slate-400">Day 1 Deliverable Details</h4>
                          <p className="text-slate-300 text-sm">Team name & Theme submitted successfully during creation.</p>
                          <div className="text-xs text-slate-400 space-y-1">
                            <div><strong>Team Name</strong>: {project.teamName}</div>
                            <div><strong>Theme</strong>: {project.theme}</div>
                            {project.customThemeProblem && <div><strong>Custom Problem</strong>: {project.customThemeProblem}</div>}
                          </div>
                        </div>
                      )}

                      {/* DAY 2 FORM */}
                      {d.day === 2 && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Product Requirement Document (PRD) Link</label>
                            <input
                              type="url" required
                              value={day2Form.prdUrl}
                              onChange={e => setDay2Form({ prdUrl: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-emerald-500/50"
                              placeholder="https://docs.google.com/document/d/... (Google Doc link)"
                              disabled={project.dailyStatus.day2 === "approved"}
                            />
                          </div>
                          {project.dailyStatus.day2 !== "approved" && (
                            <button
                              onClick={() => handleDaySubmit(2, day2Form)}
                              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                            >
                              <FileText className="w-4 h-4" /> Save Submission
                            </button>
                          )}
                        </div>
                      )}

                      {/* DAY 3 FORM */}
                      {d.day === 3 && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5"><Github className="w-4 h-4" /> GitHub Repository Link</label>
                            <input
                              type="url" required
                              value={day3Form.githubUrl}
                              onChange={e => setDay3Form({ githubUrl: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-emerald-500/50"
                              placeholder="https://github.com/username/repo"
                              disabled={project.dailyStatus.day3 === "approved"}
                            />
                          </div>
                          {project.dailyStatus.day3 !== "approved" && (
                            <button
                              onClick={() => handleDaySubmit(3, day3Form)}
                              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                            >
                              <FileText className="w-4 h-4" /> Save Submission
                            </button>
                          )}
                        </div>
                      )}

                      {/* DAY 4 FORM */}
                      {d.day === 4 && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5"><HardDrive className="w-4 h-4" /> Startup Pitch Deck Document Link</label>
                            <input
                              type="url" required
                              value={day4Form.pitchDeckUrl}
                              onChange={e => setDay4Form({ pitchDeckUrl: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-emerald-500/50"
                              placeholder="https://docs.google.com/presentation/d/... (Google Slides link)"
                              disabled={project.dailyStatus.day4 === "approved"}
                            />
                          </div>
                          {project.dailyStatus.day4 !== "approved" && (
                            <button
                              onClick={() => handleDaySubmit(4, day4Form)}
                              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                            >
                              <FileText className="w-4 h-4" /> Save Submission
                            </button>
                          )}
                        </div>
                      )}

                      {/* DAY 5 FORM */}
                      {d.day === 5 && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5"><Video className="w-4 h-4" /> MVP Demo Video Link (3–5 min YouTube/Drive)</label>
                            <input
                              type="url" required
                              value={day5Form.mvpVideoUrl}
                              onChange={e => setDay5Form(p => ({ ...p, mvpVideoUrl: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-emerald-500/50 mb-3"
                              placeholder="YouTube or Google Drive URL"
                              disabled={project.dailyStatus.day5 === "approved"}
                            />
                            
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5"><FileText className="w-4 h-4" /> Mid-Evaluation Report Link</label>
                            <input
                              type="url" required
                              value={day5Form.midReportUrl}
                              onChange={e => setDay5Form(p => ({ ...p, midReportUrl: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-emerald-500/50"
                              placeholder="Google Drive link containing report"
                              disabled={project.dailyStatus.day5 === "approved"}
                            />
                          </div>
                          {project.dailyStatus.day5 !== "approved" && (
                            <button
                              onClick={() => handleDaySubmit(5, day5Form)}
                              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                            >
                              <FileText className="w-4 h-4" /> Save Submission
                            </button>
                          )}
                        </div>
                      )}

                      {/* DAY 6 FORM */}
                      {d.day === 6 && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5"><HardDrive className="w-4 h-4" /> Business Presentation Slides Link</label>
                            <input
                              type="url" required
                              value={day6Form.businessSlidesUrl}
                              onChange={e => setDay6Form({ businessSlidesUrl: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-emerald-500/50"
                              placeholder="Google Slides / PowerPoint link"
                              disabled={project.dailyStatus.day6 === "approved"}
                            />
                          </div>
                          {project.dailyStatus.day6 !== "approved" && (
                            <button
                              onClick={() => handleDaySubmit(6, day6Form)}
                              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                            >
                              <FileText className="w-4 h-4" /> Save Submission
                            </button>
                          )}
                        </div>
                      )}

                      {/* DAY 7 FORM */}
                      {d.day === 7 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> Deployed MVP Live URL</label>
                              <input
                                type="url" required
                                value={day7Form.finalMvpUrl}
                                onChange={e => setDay7Form(p => ({ ...p, finalMvpUrl: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 text-xs focus:ring-1 focus:ring-emerald-500"
                                placeholder="https://my-app.vercel.app"
                                disabled={project.dailyStatus.day7 === "approved"}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> Final Pitch Deck URL</label>
                              <input
                                type="url" required
                                value={day7Form.finalPitchDeckUrl}
                                onChange={e => setDay7Form(p => ({ ...p, finalPitchDeckUrl: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 text-xs focus:ring-1 focus:ring-emerald-500"
                                placeholder="Google Slides / PowerPoint link"
                                disabled={project.dailyStatus.day7 === "approved"}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Final Project Report URL</label>
                              <input
                                type="url" required
                                value={day7Form.finalReportUrl}
                                onChange={e => setDay7Form(p => ({ ...p, finalReportUrl: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 text-xs focus:ring-1 focus:ring-emerald-500"
                                placeholder="Google Docs link (15–20 pages)"
                                disabled={project.dailyStatus.day7 === "approved"}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Individual 3D Portfolio URL</label>
                              <input
                                type="url" required
                                value={day7Form.portfolioUrl}
                                onChange={e => setDay7Form(p => ({ ...p, portfolioUrl: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 text-xs focus:ring-1 focus:ring-emerald-500"
                                placeholder="Submit your individual live portfolio link"
                                disabled={project.dailyStatus.day7 === "approved"}
                              />
                            </div>
                          </div>
                          
                          {/* Portfolio list display */}
                          <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3 text-xs space-y-1.5">
                            <span className="font-bold text-slate-400">Team Portfolios Submitted:</span>
                            {project.submissions?.day7?.portfolios && project.submissions.day7.portfolios.length > 0 ? (
                              <div className="space-y-1 mt-1">
                                {project.submissions.day7.portfolios.map((p) => (
                                  <div key={p.email} className="flex items-center justify-between text-slate-300">
                                    <span>{p.email}</span>
                                    <a href={p.portfolioUrl} target="_blank" className="text-emerald-400 hover:underline flex items-center gap-1 font-mono">
                                      Link <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-500">No portfolios submitted yet. Submit yours above.</p>
                            )}
                          </div>

                          {project.dailyStatus.day7 !== "approved" && (
                            <button
                              onClick={() => handleDaySubmit(7, day7Form)}
                              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                            >
                              <FileText className="w-4 h-4" /> Save Submission
                            </button>
                          )}
                        </div>
                      )}

                      {/* DAY 8 DETAILS */}
                      {d.day === 8 && (
                        <div className="bg-slate-900/40 rounded-xl p-4 border border-white/5 space-y-3">
                          <h4 className="text-white font-semibold text-sm">Demo Day Instructions</h4>
                          <p className="text-slate-300 text-xs leading-relaxed">
                            Each startup team will present their ideas live to the jury panel. Ensure your Pitch Deck is ready and your MVP links are live and working. The jury Q&A will follow immediately after your demo. Good luck!
                          </p>
                        </div>
                      )}

                      {/* MENTOR FEEDBACK */}
                      {project.dailyFeedback[`day${d.day}` as keyof typeof project.dailyFeedback] && (
                        <div className="mt-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 text-xs">
                          <p className="text-emerald-400 font-bold mb-1 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Mentor Feedback:
                          </p>
                          <p className="text-slate-300 whitespace-pre-wrap">
                            {project.dailyFeedback[`day${d.day}` as keyof typeof project.dailyFeedback]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
