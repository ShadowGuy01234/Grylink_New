import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fpdfApi } from '../api';
import ConversionMeter from '../components/ConversionMeter';
import toast from 'react-hot-toast';
import { Plus, BarChart2, MapPin, Building2, Info } from 'lucide-react';

interface FpdfEntry {
  _id: string;
  companyName: string;
  companyType: string;
  location: string;
  scores: { totalScore: number; conversionAngle: number };
  classification: string;
  pipeline: string;
  status: string;
  createdBy: { name: string };
  updatedAt: string;
}

const classColor: Record<string, string> = { GREEN: 'badge-green', YELLOW: 'badge-yellow', ORANGE: 'badge-orange', RED: 'badge-red' };

const FpdfPipeline: React.FC = () => {
  const [entries, setEntries] = useState<FpdfEntry[]>([]);
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
      const res = await fpdfApi.getAll(params);
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
        <h1>FPDF Pipeline</h1>
        <p>All Financial Partner Discovery entries across all pipeline stages</p>
      </div>

      <div className="filters-bar">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company or location..." onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Pipelines</option>
          <option value="PRIORITY">🟢 Priority</option>
          <option value="STRATEGIC">🟡 Strategic</option>
          <option value="HOLD">🟠 Hold</option>
          <option value="ARCHIVE">🔴 Archive</option>
        </select>
        <button className="btn btn-outline btn-sm" onClick={handleSearch}>Search</button>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/fpdf/new')}><Plus size={14} className="inline mr-1" /> New Entry</button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><BarChart2 size={40} /></div>
          <h3>No entries found</h3>
          <p>Try adjusting your filters or create a new FPDF entry.</p>
        </div>
      ) : (
        <div className="pipeline-grid">
          {entries.map(e => (
            <div key={e._id} className={`pipeline-card ${e.classification.toLowerCase()}`} onClick={() => navigate(`/fpdf/${e._id}`)}>
              <div className="pipeline-card-header">
                <h3>{e.companyName}</h3>
                <span className={`badge ${classColor[e.classification]}`}>{e.classification}</span>
              </div>
              <div className="pipeline-card-body">
                <p><span style={{verticalAlign: 'middle', display: 'inline-block'}}><Building2 size={14} className="mr-1" /></span> Type: {e.companyType}</p>
                <p><span style={{verticalAlign: 'middle', display: 'inline-block'}}><MapPin size={14} className="mr-1" /></span> Location: {e.location}</p>
                <p><span style={{verticalAlign: 'middle', display: 'inline-block'}}><Info size={14} className="mr-1" /></span> Status: {e.status}</p>
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

export default FpdfPipeline;
