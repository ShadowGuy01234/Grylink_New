import { useEffect, useState } from "react";
import { Video, Calendar, Clock, ExternalLink } from "lucide-react";
import { fetchSessions } from "../../lib/api";

interface Session {
  _id: string;
  title: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  meetLink?: string;
}

export function MeetingsPage() {
  const [meetings, setMeetings] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions().then(res => {
      // Filter sessions that have a meet link and are for today or future
      const valid = (res.sessions || []).filter((s: Session) => !!s.meetLink);
      setMeetings(valid);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse flex gap-4"><div className="w-10 h-10 bg-white/10 rounded-xl" /><div className="flex-1 space-y-3"><div className="h-4 bg-white/10 rounded w-1/4" /><div className="h-3 bg-white/10 rounded w-1/2" /></div></div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
          <Video className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-xl">Meeting Links</h1>
          <p className="text-slate-400 text-sm">Join your live sessions here</p>
        </div>
      </div>

      {meetings.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">🎥</p>
          <h2 className="text-white font-semibold text-lg mb-2">No Active Meeting Links</h2>
          <p className="text-slate-400 text-sm">Your admin will publish today's Google Meet link here before each session.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {meetings.map((m) => (
            <div key={m._id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-indigo-500/30 transition-colors group">
              <h3 className="text-white font-semibold mb-3">{m.title}</h3>
              <div className="space-y-1.5 mb-5">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(m.sessionDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Clock className="w-4 h-4" />
                  {m.startTime} - {m.endTime}
                </div>
              </div>
              <a
                href={m.meetLink}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <Video className="w-4 h-4" /> Join Meeting
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
