import { useEffect, useState } from "react";
import { Calendar, Clock, Video } from "lucide-react";
import { fetchSessions } from "../../lib/api";

interface Session {
  _id: string;
  title: string;
  type: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  meetLink?: string;
  guestName?: string;
  targetTrack: string;
}

export function SchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions().then(res => {
      setSessions(res.sessions || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse flex gap-4"><div className="w-10 h-10 bg-white/10 rounded-xl" /><div className="flex-1 space-y-3"><div className="h-4 bg-white/10 rounded w-1/4" /><div className="h-3 bg-white/10 rounded w-1/2" /></div></div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-xl">Session Schedule</h1>
          <p className="text-slate-400 text-sm">Upcoming live classes and guest sessions</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">📅</p>
          <h2 className="text-white font-semibold text-lg mb-2">Schedule Coming Soon</h2>
          <p className="text-slate-400 text-sm">Session timetable will be published here by admin.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s) => (
            <div key={s._id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    s.type === 'guest' ? 'bg-purple-500/20 text-purple-300' :
                    s.type === 'opening' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {s.type.toUpperCase()}
                  </span>
                  {s.targetTrack !== "all" && <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">{s.targetTrack}</span>}
                </div>
                <h3 className="text-white font-semibold">{s.title}</h3>
                {s.guestName && <p className="text-slate-400 text-sm">Guest: {s.guestName}</p>}
              </div>
              
              <div className="flex flex-col sm:items-end gap-1">
                <div className="flex items-center gap-1.5 text-blue-300 text-sm font-mono">
                  <Calendar className="w-4 h-4" />
                  {new Date(s.sessionDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-sm font-mono">
                  <Clock className="w-4 h-4" />
                  {s.startTime} - {s.endTime}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
