import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bdfApi } from '../api';
import ConversionMeter from '../components/ConversionMeter';
import toast from 'react-hot-toast';
import { Plus, BarChart2, ClipboardList, MapPin, Building2 } from 'lucide-react';

interface BdfEntry {
  _id: string;
  companyName: string;
  companyType: string;
  projectName: string;
  location: string;
  projectValue: string;
  scores: { totalScore: number; conversionAngle: number };
  classification: string;
  pipeline: string;
  status: string;
  groundIntelligence: unknown[];
  createdBy: { name: string };
  updatedAt: string;
}

const classColor: Record<string, string> = { GREEN: 'badge-green', YELLOW: 'badge-yellow', ORANGE: 'badge-orange', RED: 'badge-red' };

const BdfPipeline: React.FC = () => {
  const [entries, setEntries] = useState<BdfEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filter) params.pipeline = filter;
      if (search) params.search = search;
      const res = await bdfApi.getAll(params);
      setEntries(res.data);
    } catch { toast.error('Failed to load entries'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleSearch = () => load();

  if (loading) return <div className="page-loading"><span className="spinner" /> Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>BDF Pipeline</h1>
        <p>All Business Discovery entries across all pipeline stages</p>
      </div>

      <div className="filters-bar">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company or project..." onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Pipelines</option>
          <option value="PRIORITY">🟢 Priority</option>
          <option value="STRATEGIC">🟡 Strategic</option>
          <option value="HOLD">🟠 Hold</option>
          <option value="ARCHIVE">🔴 Archive</option>
        </select>
        <button className="btn btn-outline btn-sm" onClick={handleSearch}>Search</button>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/bdf/new')}><Plus size={14} className="inline mr-1" /> New Entry</button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><BarChart2 size={40} /></div>
          <h3>No entries found</h3>
          <p>Try adjusting your filters or create a new BDF entry.</p>
        </div>
      ) : (
        <div className="pipeline-grid">
          {entries.map(e => (
            <div key={e._id} className={`pipeline-card ${e.classification.toLowerCase()}`} onClick={() => navigate(`/bdf/${e._id}`)}>
              <div className="pipeline-card-header">
                <h3>{e.companyName}</h3>
                <span className={`badge ${classColor[e.classification]}`}>{e.classification}</span>
              </div>
              <div className="pipeline-card-body">
                <p><span style={{verticalAlign: 'middle', display: 'inline-block'}}><ClipboardList size={14} className="mr-1" /></span> {e.projectName}</p>
                <p><span style={{verticalAlign: 'middle', display: 'inline-block'}}><MapPin size={14} className="mr-1" /></span> {e.location}</p>
                <p><span style={{verticalAlign: 'middle', display: 'inline-block'}}><Building2 size={14} className="mr-1" /></span> {e.companyType} • {e.groundIntelligence?.length || 0} convos</p>
              </div>
              <div className="pipeline-card-footer">
                <ConversionMeter angle={e.scores.conversionAngle} score={e.scores.totalScore} classification={e.classification} size="sm" />
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${classColor[e.classification]?.replace('badge', 'badge')}`}>{e.pipeline}</span>
                  <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{e.createdBy?.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BdfPipeline;
