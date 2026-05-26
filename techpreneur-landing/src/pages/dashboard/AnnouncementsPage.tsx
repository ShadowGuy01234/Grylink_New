import { useEffect, useState } from "react";
import { Bell, AlertCircle, Info, CalendarClock, Zap } from "lucide-react";
import { fetchAnnouncements } from "../../lib/api";

interface Announcement {
  _id: string;
  title: string;
  body: string;
  type: "general" | "session" | "assignment" | "emergency" | "event";
  isPinned: boolean;
  createdAt: string;
}

export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements().then(res => {
      setAnnouncements(res.announcements || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse flex gap-4"><div className="w-10 h-10 bg-white/10 rounded-xl" /><div className="flex-1 space-y-3"><div className="h-4 bg-white/10 rounded w-1/4" /><div className="h-3 bg-white/10 rounded w-1/2" /></div></div>;
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "emergency": return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "session": return <CalendarClock className="w-5 h-5 text-blue-400" />;
      case "event": return <Zap className="w-5 h-5 text-amber-400" />;
      default: return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-xl">Announcements</h1>
          <p className="text-slate-400 text-sm">Updates and notices from the TechPreneur team</p>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">📢</p>
          <h2 className="text-white font-semibold text-lg mb-2">No Announcements Yet</h2>
          <p className="text-slate-400 text-sm">Important updates will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a._id} className={`bg-white/5 border rounded-xl p-5 relative overflow-hidden ${a.isPinned ? "border-amber-500/50" : "border-white/10"}`}>
              {a.isPinned && <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full pointer-events-none" />}
              <div className="flex gap-4">
                <div className="mt-1">{getTypeIcon(a.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {a.isPinned && <span className="bg-amber-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">Pinned</span>}
                    <span className="text-slate-500 text-xs font-mono">{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{a.title}</h3>
                  <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {a.body}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
