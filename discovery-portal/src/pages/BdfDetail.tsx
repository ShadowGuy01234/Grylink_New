import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bdfApi } from '../api';
import ConversionMeter from '../components/ConversionMeter';
import toast from 'react-hot-toast';
import { Check, X, Rocket, CheckCircle2 } from 'lucide-react';

const valLabels: Record<string, string> = { BELOW_100CR: '< ₹100 Cr', '100_500CR': '₹100-500 Cr', '500_1500CR': '₹500-1500 Cr', ABOVE_1500CR: '₹1500 Cr+' };
const stageLabels: Record<string, string> = { '0_30': '0-30%', '30_60': '30-60%', ABOVE_60: '60%+' };
const classColor: Record<string, string> = { GREEN: 'badge-green', YELLOW: 'badge-yellow', ORANGE: 'badge-orange', RED: 'badge-red' };

const BdfDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConvert, setShowConvert] = useState(false);
  const [convertData, setConvertData] = useState({ email: '', ownerName: '', phone: '' });
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await bdfApi.getById(id!);
        setEntry(res.data);
      } catch { toast.error('Failed to load entry'); navigate('/bdf'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleConvert = async () => {
    if (!convertData.email) return toast.error('Email is required');
    setConverting(true);
    try {
      await bdfApi.convert(id!, convertData);
      toast.success('Successfully converted to Company Lead + GryLink sent!');
      const res = await bdfApi.getById(id!);
      setEntry(res.data);
      setShowConvert(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Conversion failed');
    } finally { setConverting(false); }
  };

  if (loading) return <div className="page-loading"><span className="spinner" /> Loading...</div>;
  if (!entry) return null;

  return (
    <div>
      <Link to="/bdf/pipeline" className="back-link">← Back to Pipeline</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>{entry.companyName}</h1>
          <p style={{ color: '#94a3b8' }}>{entry.projectName} • {entry.location}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className={`badge ${classColor[entry.classification]}`} style={{ fontSize: 14, padding: '6px 14px' }}>{entry.classification}</span>
          <span className="badge badge-blue" style={{ fontSize: 14, padding: '6px 14px' }}>{entry.status}</span>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          {/* Project Details */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Project Details</h3>
            <div className="info-grid">
              <div className="info-item"><label>Company Type</label><p>{entry.companyType}</p></div>
              <div className="info-item"><label>Project Value</label><p>{valLabels[entry.projectValue] || entry.projectValue}</p></div>
              <div className="info-item"><label>Stage</label><p>{stageLabels[entry.projectStage] || entry.projectStage}</p></div>
              <div className="info-item"><label>Company Size</label><p>{entry.companySize || '—'}</p></div>
              <div className="info-item"><label>Website</label><p>{entry.websiteAvailable ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</p></div>
              <div className="info-item"><label>LinkedIn</label><p>{entry.linkedinPresence ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</p></div>
              <div className="info-item"><label>Reachability</label><p>{entry.reachability || '—'}</p></div>
              <div className="info-item"><label>Phone Available</label><p>{entry.phoneNumberAvailable ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</p></div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Score Breakdown</h3>
            <div className="info-grid">
              <div className="info-item"><label>Project Fit (30%)</label><p style={{ fontSize: 20, fontWeight: 800 }}>{entry.scores?.projectFit || 0}</p></div>
              <div className="info-item"><label>Ground Signals (30%)</label><p style={{ fontSize: 20, fontWeight: 800 }}>{entry.scores?.groundSignals || 0}</p></div>
              <div className="info-item"><label>Accessibility (20%)</label><p style={{ fontSize: 20, fontWeight: 800 }}>{entry.scores?.accessibility || 0}</p></div>
              <div className="info-item"><label>Engagement (20%)</label><p style={{ fontSize: 20, fontWeight: 800 }}>{entry.scores?.engagement || 0}</p></div>
            </div>
          </div>

          {/* Ground Intelligence */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Ground Intelligence ({entry.groundIntelligence?.length || 0} conversations)</h3>
            {entry.groundIntelligence?.map((g: any, i: number) => (
              <div key={i} className="gi-card">
                <div className="gi-card-header">
                  <h4>#{i + 1} — {g.contactName || 'Unknown'} ({g.contactRole || '—'})</h4>
                  <span className="badge badge-cyan">{g.channel}</span>
                </div>
                <div className="gi-signals">
                  <div className="gi-signal">Billing Flow: <span>{g.billingFlow}</span></div>
                  <div className="gi-signal">SC Usage: <span>{g.subcontractorUsage}</span></div>
                  <div className="gi-signal">Pressure: <span>{g.executionPressure}</span></div>
                  <div className="gi-signal">Sentiment: <span>{g.sentiment}</span></div>
                </div>
                {g.notes && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>{g.notes}</p>}
              </div>
            ))}
          </div>

          {/* Conversion */}
          {entry.status === 'SUBMITTED' && ['GREEN', 'YELLOW'].includes(entry.classification) && !entry.convertedToCompanyId && (
            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Rocket size={20} /> Convert to Sales Lead</h3>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>This will create a Company record, EPC user account, and send a GryLink onboarding email.</p>
              {!showConvert ? (
                <button className="btn btn-success" onClick={() => setShowConvert(true)}>Convert to Lead</button>
              ) : (
                <div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Email *</label>
                      <input value={convertData.email} onChange={e => setConvertData({ ...convertData, email: e.target.value })} placeholder="Owner email" />
                    </div>
                    <div className="form-group">
                      <label>Owner Name</label>
                      <input value={convertData.ownerName} onChange={e => setConvertData({ ...convertData, ownerName: e.target.value })} placeholder="Owner name" />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input value={convertData.phone} onChange={e => setConvertData({ ...convertData, phone: e.target.value })} placeholder="Phone number" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success" onClick={handleConvert} disabled={converting}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {converting ? 'Converting...' : <><CheckCircle2 size={16} /> Confirm Conversion</>}
                      </span>
                    </button>
                    <button className="btn btn-outline" onClick={() => setShowConvert(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {entry.convertedToCompanyId && (
            <div className="card" style={{ borderColor: '#22c55e' }}>
              <p style={{ color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={18} /> Converted to Company Lead — {entry.convertedToCompanyId.companyName || entry.convertedToCompanyId}</p>
              <p style={{ fontSize: 12, color: '#64748b' }}>Converted at {new Date(entry.convertedAt).toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Sidebar — Meter */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 32 }}>
            <ConversionMeter
              angle={entry.scores?.conversionAngle || 0}
              score={entry.scores?.totalScore || 0}
              classification={entry.classification}
            />
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span className={`badge ${classColor[entry.classification]}`} style={{ fontSize: 14, padding: '8px 16px' }}>
                {entry.pipeline}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BdfDetail;
