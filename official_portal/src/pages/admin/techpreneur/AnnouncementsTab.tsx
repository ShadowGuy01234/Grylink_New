import { useState, useEffect } from "react";
import { techpreneurApi } from "../../../api";
import { Trash2, PlusCircle, Pencil, Pin } from "lucide-react";

export function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "", body: "", type: "general", isPinned: false
  });

  const fetchAnnouncements = async () => {
    try {
      const res = await techpreneurApi.getAnnouncements();
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await techpreneurApi.updateAnnouncement(editingId, formData);
      } else {
        await techpreneurApi.createAnnouncement(formData);
      }
      setShowModal(false);
      setEditingId(null);
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to save announcement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await techpreneurApi.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
        <button onClick={() => { setFormData({title: "", body: "", type: "general", isPinned: false}); setEditingId(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Announcement
        </button>
      </div>

      <div className="grid gap-4">
        {announcements.map(a => (
          <div key={a._id} className={`bg-white border rounded-xl p-5 shadow-sm ${a.isPinned ? 'border-amber-400' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {a.isPinned && <Pin className="w-4 h-4 text-amber-500"/>}
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase font-semibold">{a.type}</span>
                <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingId(a._id); setFormData({title: a.title, body: a.body, type: a.type, isPinned: a.isPinned}); setShowModal(true); }} className="text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4"/></button>
                <button onClick={() => handleDelete(a._id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{a.title}</h3>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">{a.body}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit' : 'New'} Announcement</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" required className="input-field" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select className="input-field" value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})}><option value="general">General</option><option value="session">Session Update</option><option value="assignment">Assignment Notice</option><option value="emergency">Emergency</option><option value="event">Event</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Body</label><textarea required rows={5} className="input-field resize-none" value={formData.body} onChange={e=>setFormData({...formData, body: e.target.value})} /></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="pinned" checked={formData.isPinned} onChange={e=>setFormData({...formData, isPinned: e.target.checked})} className="w-4 h-4 text-blue-600 rounded border-gray-300" /><label htmlFor="pinned" className="text-sm text-gray-700 font-medium">Pin to top</label></div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="btn-primary">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
