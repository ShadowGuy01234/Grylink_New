import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fpdfApi } from '../api';
import toast from 'react-hot-toast';
import { Plus, BarChart, Landmark } from 'lucide-react';
import { FPDF_FULL_FORM } from '../constants/discoveryLabels';

interface DashboardStats {
  total: number;
  byPipeline: Record<string, number>;
  byStatus: Record<string, number>;
  byClassification: Record<string, number>;
  recentEntries: Array<{
    _id: string;
    companyName: string;
    companyType: string;
    location: string;
    classification: string;
    pipeline: string;
    scores: { totalScore: number };
    createdBy: { name: string };
    updatedAt: string;
  }>;
}

const classColor: Record<string, string> = { GREEN: 'badge-green', YELLOW: 'badge-yellow', ORANGE: 'badge-orange', RED: 'badge-red' };
const pipeColor: Record<string, string> = { PRIORITY: 'stat-green', STRATEGIC: 'stat-yellow', HOLD: 'stat-orange', ARCHIVE: 'stat-red' };

const FpdfDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fpdfApi.getDashboard();
        setStats(res.data);
      } catch { toast.error('Failed to load FPDF dashboard'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="page-loading"><span className="spinner" /> Loading FPDF Dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>{FPDF_FULL_FORM}</h1>
        <p>Identify, qualify, and prioritise NBFCs and Banks for strategic partnerships</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <h3>{stats?.total || 0}</h3>
          <p>Total Entries</p>
        </div>
        <div className="stat-card stat-green">
          <h3>{stats?.byPipeline?.PRIORITY || 0}</h3>
          <p>Priority Pipeline</p>
        </div>
        <div className="stat-card stat-yellow">
          <h3>{stats?.byPipeline?.STRATEGIC || 0}</h3>
          <p>Strategic Pipeline</p>
        </div>
        <div className="stat-card stat-orange">
          <h3>{stats?.byPipeline?.HOLD || 0}</h3>
          <p>On Hold</p>
        </div>
        <div className="stat-card stat-red">
          <h3>{stats?.byPipeline?.ARCHIVE || 0}</h3>
          <p>Archived</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <button className="btn btn-primary" onClick={() => navigate('/fpdf/new')}>
          <Plus size={18} /> New FPDF Entry
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/fpdf/pipeline')}>
          <BarChart size={18} /> View Full Pipeline
        </button>
      </div>

      {/* Classification Breakdown */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h2>Classification Breakdown</h2>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['GREEN', 'YELLOW', 'ORANGE', 'RED'].map(c => (
            <div key={c} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{stats?.byClassification?.[c] || 0}</div>
              <span className={`badge ${classColor[c]}`}>{c === 'GREEN' ? '🟢 Priority' : c === 'YELLOW' ? '🟡 Strategic' : c === 'ORANGE' ? '🟠 Hold' : '🔴 Reject'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="card">
        <div className="card-header">
          <h2>Recent Entries</h2>
        </div>
        {!stats?.recentEntries?.length ? (
          <div className="empty-state">
            <div className="empty-icon"><Landmark size={48} /></div>
            <h3>No FPDF entries yet</h3>
            <p>Start by creating your first {FPDF_FULL_FORM} entry to begin qualifying NBFCs.</p>
            <button className="btn btn-primary" onClick={() => navigate('/fpdf/new')}><Plus size={16} /> Create First Entry</button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Type</th>
                <th>Location</th>
                <th>Score</th>
                <th>Classification</th>
                <th>Pipeline</th>
                <th>Created By</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentEntries.map(e => (
                <tr key={e._id} className="clickable-row" onClick={() => navigate(`/fpdf/${e._id}`)}>
                  <td style={{ fontWeight: 600 }}>{e.companyName}</td>
                  <td>{e.companyType}</td>
                  <td>{e.location}</td>
                  <td style={{ fontWeight: 700 }}>{e.scores?.totalScore || 0}</td>
                  <td><span className={`badge ${classColor[e.classification]}`}>{e.classification}</span></td>
                  <td><span className={`badge ${pipeColor[e.pipeline]?.replace('stat-', 'badge-')}`}>{e.pipeline}</span></td>
                  <td>{e.createdBy?.name}</td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{new Date(e.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FpdfDashboard;
