import { useEffect, useState } from "react";
import { FolderOpen, Github, HardDrive, CheckCircle, AlertCircle } from "lucide-react";
import { fetchMyProject, submitProject } from "../../lib/api";

interface Project {
  _id: string;
  githubUrl: string;
  driveUrl: string;
  projectTitle: string;
  description: string;
  status: string;
  feedback?: string;
}

export function ProjectsPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    projectTitle: "",
    githubUrl: "",
    driveUrl: "",
    description: "",
  });

  useEffect(() => {
    fetchMyProject().then(res => {
      if (res.project) {
        setProject(res.project);
        setFormData({
          projectTitle: res.project.projectTitle || "",
          githubUrl: res.project.githubUrl || "",
          driveUrl: res.project.driveUrl || "",
          description: res.project.description || "",
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await submitProject(formData);
      setProject(res.project);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse flex gap-4"><div className="w-10 h-10 bg-white/10 rounded-xl" /><div className="flex-1 space-y-3"><div className="h-4 bg-white/10 rounded w-1/4" /><div className="h-3 bg-white/10 rounded w-1/2" /></div></div>;
  }

  const isReviewed = project?.status === "reviewed" || project?.status === "approved";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center">
          <FolderOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-xl">Project Submission</h1>
          <p className="text-slate-400 text-sm">Submit your final project links for review</p>
        </div>
      </div>

      {project && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 flex items-start gap-4">
          {isReviewed ? (
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <h3 className="text-white font-semibold mb-1">
              Status: <span className="uppercase tracking-wider ml-1">{project.status}</span>
            </h3>
            <p className="text-slate-400 text-sm">
              {isReviewed
                ? "Your project has been reviewed by the team."
                : "Your project is currently submitted and pending review. You can still update the links below if needed."}
            </p>
            {project.feedback && (
              <div className="mt-3 bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-emerald-300 text-sm font-medium mb-1">Mentor Feedback:</p>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{project.feedback}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
        <h2 className="text-white font-semibold text-lg mb-6">Project Details</h2>
        
        {error && (
          <div className="bg-red-900/30 border border-red-700/40 text-red-300 rounded-xl px-4 py-3 text-sm mb-6 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Title</label>
            <input
              type="text" required
              value={formData.projectTitle}
              onChange={e => setFormData(p => ({ ...p, projectTitle: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500/50"
              placeholder="E.g., AI Resume Analyzer"
              disabled={isReviewed}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <Github className="w-4 h-4" /> GitHub Repository Link
            </label>
            <input
              type="url" required pattern="https://github.com/.*"
              value={formData.githubUrl}
              onChange={e => setFormData(p => ({ ...p, githubUrl: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500/50"
              placeholder="https://github.com/username/repo"
              disabled={isReviewed}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <HardDrive className="w-4 h-4" /> Google Drive Link (Presentation/Demo)
            </label>
            <input
              type="url" required
              value={formData.driveUrl}
              onChange={e => setFormData(p => ({ ...p, driveUrl: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Ensure link access is set to 'Anyone with the link'"
              disabled={isReviewed}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Short Description</label>
            <textarea
              required rows={4}
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500/50 resize-none"
              placeholder="Briefly describe what your project does..."
              disabled={isReviewed}
            />
          </div>
        </div>

        {!isReviewed && (
          <button
            type="submit" disabled={submitting}
            className="mt-8 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
          >
            {submitting ? "Saving..." : project ? "Update Submission" : "Submit Project"}
          </button>
        )}
      </form>
    </div>
  );
}
