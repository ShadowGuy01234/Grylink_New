import { useState, useEffect } from "react";
import { techpreneurApi } from "../../../api";
import { Calendar, Video, Clock, User, Trash2, PlusCircle, Pencil } from "lucide-react";

export function SessionsTab() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "", type: "daily", sessionDate: "", startTime: "", endTime: "", meetLink: "", guestName: "", targetTrack: "all"
  });

  const fetchSessions = async () => {
    try {
      const res = await techpreneurApi.getSessions();
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await techpreneurApi.updateSession(editingId, formData);
      } else {
        await techpreneurApi.createSession(formData);
      }
      setShowModal(false);
      setEditingId(null);
      fetchSessions();
    } catch (err) {
      alert("Failed to save session");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await techpreneurApi.deleteSession(id);
      fetchSessions();
    } catch (err) {
      alert("Failed to delete session");
    }
  };

  const openEdit = (session: any) => {
    setFormData({
      title: session.title, type: session.type, sessionDate: session.sessionDate.split('T')[0],
      startTime: session.startTime, endTime: session.endTime, meetLink: session.meetLink || "",
      guestName: session.guestName || "", targetTrack: session.targetTrack || "all"
    });
    setEditingId(session._id);
    setShowModal(true);
  };

  const openCreate = () => {
    setFormData({ title: "", type: "daily", sessionDate: "", startTime: "", endTime: "", meetLink: "", guestName: "", targetTrack: "all" });
    setEditingId(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Session Management</h2>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Add Session
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Title & Type</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Meet Link</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.map(s => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900 mb-1">{s.title}</div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">{s.type}</span>
                  {s.guestName && <div className="text-xs text-gray-500 mt-1"><User className="w-3 h-3 inline mr-1"/>{s.guestName}</div>}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <div className="flex items-center gap-1.5 mb-1"><Calendar className="w-4 h-4"/> {new Date(s.sessionDate).toLocaleDateString()}</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> {s.startTime} - {s.endTime}</div>
                </td>
                <td className="px-6 py-4">
                  {s.meetLink ? (
                    <a href={s.meetLink} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1"><Video className="w-4 h-4"/> Join</a>
                  ) : <span className="text-gray-400">Not assigned</span>}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openEdit(s)} className="text-gray-500 hover:text-blue-600"><Pencil className="w-5 h-5"/></button>
                  <button onClick={() => handleDelete(s._id)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Session' : 'Create Session'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" required className="input-field" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select className="input-field" value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})}><option value="daily">Daily</option><option value="guest">Guest</option><option value="opening">Opening</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" required className="input-field" value={formData.sessionDate} onChange={e=>setFormData({...formData, sessionDate: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label><input type="time" required className="input-field" value={formData.startTime} onChange={e=>setFormData({...formData, startTime: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">End Time</label><input type="time" required className="input-field" value={formData.endTime} onChange={e=>setFormData({...formData, endTime: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Meet Link</label><input type="url" className="input-field" value={formData.meetLink} onChange={e=>setFormData({...formData, meetLink: e.target.value})} /></div>
              {formData.type === 'guest' && <div><label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label><input type="text" className="input-field" value={formData.guestName} onChange={e=>setFormData({...formData, guestName: e.target.value})} /></div>}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="btn-primary">Save Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
