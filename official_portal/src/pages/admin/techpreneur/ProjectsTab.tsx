import { useState, useEffect } from "react";
import { techpreneurApi } from "../../../api";
import { ExternalLink, X } from "lucide-react";

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

export function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Modal State
  const [activeReviewTab, setActiveReviewTab] = useState<number>(1);
  const [reviewForm, setReviewForm] = useState({ status: "reviewed", feedback: "" });
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await techpreneurApi.getProjects();
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openReviewModal = (p: Project) => {
    setSelectedProject(p);
    setActiveReviewTab(1);
    
    // Set initial form based on Day 1
    setReviewForm({
      status: p.dailyStatus.day1 || "submitted",
      feedback: p.dailyFeedback.day1 || ""
    });
    setShowModal(true);
  };

  // Keep form in sync when changing active tab inside review modal
  useEffect(() => {
    if (selectedProject) {
      const dayKeyStatus = `day${activeReviewTab}` as keyof typeof selectedProject.dailyStatus;
      const dayKeyFeedback = `day${activeReviewTab}` as keyof typeof selectedProject.dailyFeedback;
      
      setReviewForm({
        status: selectedProject.dailyStatus[dayKeyStatus] || "pending",
        feedback: selectedProject.dailyFeedback[dayKeyFeedback] || ""
      });
    }
  }, [activeReviewTab, selectedProject]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setLoading(true);
    try {
      const res = await techpreneurApi.reviewProjectDay(selectedProject._id, {
        dayNumber: activeReviewTab,
        status: reviewForm.status,
        feedback: reviewForm.feedback
      });
      
      // Update selected project in local state to refresh modal UI
      setSelectedProject(res.data.project);
      
      // Refresh list
      fetchProjects();
      alert(`Day ${activeReviewTab} review submitted successfully!`);
    } catch (err) {
      alert("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Project Week Submissions</h2>
        <button onClick={fetchProjects} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors">Refresh</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Team Details</th>
              <th className="px-6 py-4">Theme Selection</th>
              <th className="px-6 py-4 text-center">Milestones Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No teams have registered submissions yet.</td>
              </tr>
            ) : (
              projects.map(p => {
                const membersStr = p.teamMembers.map(m => m.name).join(", ");
                const totalCompleted = Object.values(p.dailyStatus).filter(s => s !== "pending").length;

                return (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{p.teamName || "Unnamed Team"}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Code: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold">{p.teamCode}</code></div>
                      <div className="text-xs text-gray-400 mt-1">Members: {membersStr}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 text-xs sm:text-sm">{p.theme}</div>
                      {p.customThemeProblem && <div className="text-xs text-red-500 italic mt-0.5">Problem: "{p.customThemeProblem}"</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5, 6, 7].map(day => {
                            const dayStatus = p.dailyStatus[`day${day}` as keyof typeof p.dailyStatus];
                            let dotColor = "bg-gray-200";
                            if (dayStatus === "submitted") dotColor = "bg-amber-400";
                            if (dayStatus === "reviewed") dotColor = "bg-blue-400";
                            if (dayStatus === "approved") dotColor = "bg-green-500";
                            
                            return (
                              <div 
                                key={day} 
                                title={`Day ${day}: ${dayStatus}`}
                                className={`w-3.5 h-3.5 rounded-full ${dotColor} flex items-center justify-center text-[8px] font-bold text-white`}
                              >
                                {day}
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">{totalCompleted} / 7 Steps</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openReviewModal(p)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Review Dialog Modal */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reviewing Team: {selectedProject.teamName}</h3>
                <p className="text-xs text-gray-500 mt-1">Theme: {selectedProject.theme} | Code: {selectedProject.teamCode}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Selector for Days 1–7 */}
            <div className="flex bg-gray-50 border-b border-gray-100 overflow-x-auto">
              {[1, 2, 3, 4, 5, 6, 7].map(day => {
                const dayStatus = selectedProject.dailyStatus[`day${day}` as keyof typeof selectedProject.dailyStatus];
                let indicator = "●";
                let color = "text-gray-300";
                if (dayStatus === "submitted") color = "text-amber-500";
                if (dayStatus === "reviewed") color = "text-blue-500";
                if (dayStatus === "approved") color = "text-green-500";

                return (
                  <button
                    key={day}
                    onClick={() => setActiveReviewTab(day)}
                    className={`flex-1 min-w-[70px] text-center py-3 text-xs font-semibold border-b-2 transition-all ${
                      activeReviewTab === day 
                        ? "border-blue-600 text-blue-600 bg-white" 
                        : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
                    }`}
                  >
                    Day {day} <span className={`text-[10px] ml-0.5 ${color}`}>{indicator}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content + Form */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Deliverable display */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Day {activeReviewTab} Deliverables</h4>
                
                {activeReviewTab === 1 && (
                  <div className="space-y-2 text-sm text-gray-700">
                    <div><strong>Team Name</strong>: {selectedProject.teamName}</div>
                    <div><strong>Theme Selected</strong>: {selectedProject.theme}</div>
                    {selectedProject.customThemeProblem && <div className="text-red-600 italic"><strong>Problem Statement</strong>: "{selectedProject.customThemeProblem}"</div>}
                    <div className="pt-2 border-t border-gray-200 mt-2">
                      <strong>Team Members</strong>:
                      <ul className="list-disc pl-5 mt-1 text-xs space-y-1">
                        {selectedProject.teamMembers.map(m => (
                          <li key={m.email}>{m.name} ({m.email}) {m.techId ? `[ID: ${m.techId}]` : ""}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeReviewTab === 2 && (
                  <div>
                    {selectedProject.submissions?.day2?.prdUrl ? (
                      <a 
                        href={selectedProject.submissions.day2.prdUrl} 
                        target="_blank" 
                        className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline text-sm"
                      >
                        Open PRD Document Link <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No PRD submitted yet.</span>
                    )}
                  </div>
                )}

                {activeReviewTab === 3 && (
                  <div>
                    {selectedProject.submissions?.day3?.githubUrl ? (
                      <a 
                        href={selectedProject.submissions.day3.githubUrl} 
                        target="_blank" 
                        className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline text-sm"
                      >
                        Open GitHub Repository <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No GitHub link submitted yet.</span>
                    )}
                  </div>
                )}

                {activeReviewTab === 4 && (
                  <div>
                    {selectedProject.submissions?.day4?.pitchDeckUrl ? (
                      <a 
                        href={selectedProject.submissions.day4.pitchDeckUrl} 
                        target="_blank" 
                        className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline text-sm"
                      >
                        Open Pitch Deck Presentation <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No Pitch Deck submitted yet.</span>
                    )}
                  </div>
                )}

                {activeReviewTab === 5 && (
                  <div className="space-y-3">
                    {selectedProject.submissions?.day5?.mvpVideoUrl ? (
                      <a 
                        href={selectedProject.submissions.day5.mvpVideoUrl} 
                        target="_blank" 
                        className="block text-blue-600 font-semibold hover:underline text-sm flex items-center gap-1.5"
                      >
                        Open MVP Demo Video <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="block text-gray-400 text-sm">No Demo Video submitted yet.</span>
                    )}

                    {selectedProject.submissions?.day5?.midReportUrl ? (
                      <a 
                        href={selectedProject.submissions.day5.midReportUrl} 
                        target="_blank" 
                        className="block text-blue-600 font-semibold hover:underline text-sm flex items-center gap-1.5"
                      >
                        Open Mid-Evaluation Report <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="block text-gray-400 text-sm">No Mid Report submitted yet.</span>
                    )}
                  </div>
                )}

                {activeReviewTab === 6 && (
                  <div>
                    {selectedProject.submissions?.day6?.businessSlidesUrl ? (
                      <a 
                        href={selectedProject.submissions.day6.businessSlidesUrl} 
                        target="_blank" 
                        className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline text-sm"
                      >
                        Open Business Presentation Slides <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No Presentation slides submitted yet.</span>
                    )}
                  </div>
                )}

                {activeReviewTab === 7 && (
                  <div className="space-y-4">
                    {selectedProject.submissions?.day7?.finalMvpUrl ? (
                      <a 
                        href={selectedProject.submissions.day7.finalMvpUrl} 
                        target="_blank" 
                        className="block text-blue-600 font-semibold hover:underline text-sm flex items-center gap-1.5"
                      >
                        Open Final Deployed MVP URL <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="block text-gray-400 text-sm">No Live MVP URL submitted yet.</span>
                    )}

                    {selectedProject.submissions?.day7?.finalPitchDeckUrl ? (
                      <a 
                        href={selectedProject.submissions.day7.finalPitchDeckUrl} 
                        target="_blank" 
                        className="block text-blue-600 font-semibold hover:underline text-sm flex items-center gap-1.5"
                      >
                        Open Final Pitch Deck <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="block text-gray-400 text-sm">No Pitch Deck submitted yet.</span>
                    )}

                    {selectedProject.submissions?.day7?.finalReportUrl ? (
                      <a 
                        href={selectedProject.submissions.day7.finalReportUrl} 
                        target="_blank" 
                        className="block text-blue-600 font-semibold hover:underline text-sm flex items-center gap-1.5"
                      >
                        Open Final Project Report <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="block text-gray-400 text-sm">No Project Report submitted yet.</span>
                    )}

                    {/* Portfolios list */}
                    <div className="pt-2 border-t border-gray-200 mt-2">
                      <strong className="text-xs text-gray-500 block mb-1">Teammates 3D Portfolios:</strong>
                      {selectedProject.submissions?.day7?.portfolios && selectedProject.submissions.day7.portfolios.length > 0 ? (
                        <ul className="space-y-1.5">
                          {selectedProject.submissions.day7.portfolios.map(p => (
                            <li key={p.email} className="flex justify-between items-center text-xs">
                              <span className="text-gray-600">{p.email}</span>
                              <a href={p.portfolioUrl} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 font-mono font-bold">
                                View Portfolio <ExternalLink className="w-3 h-3"/>
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400 text-xs">No portfolios submitted yet.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Review Input Section */}
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Milestone Status</label>
                  <select 
                    value={reviewForm.status} 
                    onChange={e => setReviewForm({ ...reviewForm, status: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 font-medium"
                  >
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                    <option value="reviewed">Reviewed (Needs revisions)</option>
                    <option value="approved">Approved / Locked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Review Feedback</label>
                  <textarea 
                    rows={4} 
                    value={reviewForm.feedback} 
                    onChange={e => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Provide constructive feedback notes to the team..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Save Review"}
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
