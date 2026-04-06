import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bdfApi } from '../api';
import toast from 'react-hot-toast';
import { Plus, BarChart, Building } from 'lucide-react';

interface DashboardStats {
  total: number;
  byPipeline: Record<string, number>;
  byStatus: Record<string, number>;
  byClassification: Record<string, number>;
  recentEntries: Array<{
    _id: string;
    companyName: string;
    projectName: string;
    classification: string;
    pipeline: string;
    scores: { totalScore: number };
    createdBy: { name: string };
    updatedAt: string;
  }>;
}

const classColor: Record<string, string> = { GREEN: 'badge-green', YELLOW: 'badge-yellow', ORANGE: 'badge-orange', RED: 'badge-red' };
const pipeColor: Record<string, string> = { PRIORITY: 'stat-green', STRATEGIC: 'stat-yellow', HOLD: 'stat-orange', ARCHIVE: 'stat-red' };

const BdfDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await bdfApi.getDashboard();
        setStats(res.data);
      } catch { toast.error('Failed to load BDF dashboard'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="page-loading"><span className="spinner" /> Loading BDF Dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Business Discovery Framework</h1>
        <p>Identify, qualify, and prioritise EPC companies with genuine financing needs</p>
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
        <button className="btn btn-primary" onClick={() => navigate('/bdf/new')}>
          <Plus size={18} /> New BDF Entry
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/bdf/pipeline')}>
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
            <div className="empty-icon"><Building size={48} /></div>
            <h3>No BDF entries yet</h3>
            <p>Start by creating your first Business Discovery entry to begin qualifying EPC partners.</p>
            <button className="btn btn-primary" onClick={() => navigate('/bdf/new')}><Plus size={16} /> Create First Entry</button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Project</th>
                <th>Score</th>
                <th>Classification</th>
                <th>Pipeline</th>
                <th>Created By</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentEntries.map(e => (
                <tr key={e._id} className="clickable-row" onClick={() => navigate(`/bdf/${e._id}`)}>
                  <td style={{ fontWeight: 600 }}>{e.companyName}</td>
                  <td>{e.projectName}</td>
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

export default BdfDashboard;
