import { useState, useEffect } from "react";
import { techpreneurApi } from "../../../api";
import { ExternalLink } from "lucide-react";

export function ProjectsTab() {
  const [projects, setProjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ status: "reviewed", feedback: "" });

  const fetchProjects = async () => {
    try {
      const res = await techpreneurApi.getProjects();
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await techpreneurApi.reviewProject(selectedProject._id, reviewForm);
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      alert("Failed to submit review");
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'reviewed': return 'bg-green-100 text-green-700';
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Project Submissions</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Project Title</th>
              <th className="px-6 py-4">Links</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map(p => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{p.userId?.name || "Unknown"}</div>
                  <div className="text-gray-500 text-xs">{p.userId?.email || ""}</div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{p.projectTitle}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <a href={p.githubUrl} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3"/> GitHub</a>
                    <a href={p.driveUrl} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3"/> Drive</a>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full uppercase font-bold tracking-wider ${getStatusColor(p.status)}`}>{p.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setSelectedProject(p); setReviewForm({ status: p.status === 'submitted' ? 'reviewed' : p.status, feedback: p.feedback || "" }); setShowModal(true); }} className="text-blue-600 hover:text-blue-800 font-semibold">Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold mb-4">Review Project: {selectedProject.projectTitle}</h3>
            <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{selectedProject.description}</p>
            <form onSubmit={handleReview} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select className="input-field" value={reviewForm.status} onChange={e=>setReviewForm({...reviewForm, status: e.target.value})}><option value="submitted">Submitted</option><option value="reviewed">Reviewed (Needs changes)</option><option value="approved">Approved (Final)</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Feedback Notes</label><textarea rows={4} className="input-field resize-none" value={reviewForm.feedback} onChange={e=>setReviewForm({...reviewForm, feedback: e.target.value})} placeholder="Provide feedback to the student..." /></div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="btn-primary">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
