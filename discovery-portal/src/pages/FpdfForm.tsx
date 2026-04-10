import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fpdfApi } from '../api';
import toast from 'react-hot-toast';
import ConversionMeter from '../components/ConversionMeter';
import { Landmark, Coins, Phone, Handshake, CheckCircle2, Check, Rocket } from 'lucide-react';

const LENDING_SEGMENTS = [
  { value: 'MSME_LENDING', label: 'MSME Lending' },
  { value: 'VENDOR_FINANCING', label: 'Vendor Financing' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
];

const PRODUCTS = [
  { value: 'WORKING_CAPITAL', label: 'Working Capital' },
  { value: 'INVOICE_FINANCING', label: 'Invoice Financing' },
];

const FpdfForm: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [liveScore, setLiveScore] = useState<{ scores: { totalScore: number; conversionAngle: number }; classification: string } | null>(null);

  // Section A
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('NBFC');
  const [location, setLocation] = useState('NCR');

  // Section B
  const [lendingSegments, setLendingSegments] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [ticketSize, setTicketSize] = useState('10L_2CR');
  const [geography, setGeography] = useState('NCR');

  // Section C
  const [linkedinOutreach, setLinkedinOutreach] = useState(false);
  const [linkedinResponse, setLinkedinResponse] = useState(false);
  const [callAttempted, setCallAttempted] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  const [conversationQuality, setConversationQuality] = useState('NONE');

  // Section D
  const [meetingStatus, setMeetingStatus] = useState('NONE');
  const [willingness, setWillingness] = useState('NOT_INTERESTED');

  const steps = [
    { label: 'Basic Info', icon: '🏦' },
    { label: 'Lending Fit', icon: '💰' },
    { label: 'Outreach', icon: '📞' },
    { label: 'Engagement', icon: '🤝' },
    { label: 'Review', icon: '✅' },
  ];

  const saveOrCreate = async () => {
    setSaving(true);
    try {
      const data = {
        companyName, companyType, location,
        lendingSegments, products, ticketSize, geography,
        outreach: { linkedinOutreach, linkedinResponse, callAttempted, callConnected, conversationQuality },
        engagement: { meetingStatus, willingness }
      };

      let res;
      if (entryId) {
        res = await fpdfApi.update(entryId, data);
      } else {
        res = await fpdfApi.create(data);
        setEntryId(res.data._id);
      }
      setLiveScore({
        scores: res.data.scores,
        classification: res.data.classification,
      });
      return res.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Save failed');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (step === 0) {
      if (!companyName || !companyType || !location) {
        return toast.error('Please fill all Section A fields');
      }
    }
    if (step <= 3) {
      await saveOrCreate();
    }
    setStep(s => Math.min(s + 1, steps.length - 1));
  };


  const handleSubmit = async () => {
    if (!entryId) return toast.error('Save the entry first');

    let outreachCount = 0;
    if (linkedinOutreach) outreachCount++;
    if (callAttempted) outreachCount++;
    if (outreachCount < 2) return toast.error('Minimum 2 outreach attempts required for submission.');
    if (!linkedinResponse && !callConnected) return toast.error('At least 1 human interaction (response/connected) required.');

    setSaving(true);
    try {
      const res = await fpdfApi.submit(entryId);
      toast.success(`Entry submitted! Classified as ${res.data.classification} → ${res.data.pipeline}`);
      navigate(`/fpdf/${entryId}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Submission failed. Ensure 2+ outreach attempts & 1+ human interaction.');
    } finally {
      setSaving(false);
    }
  };

  const toggleArray = (val: string, arr: string[], setArr: (val: string[]) => void) => {
    if (arr.includes(val)) {
      setArr(arr.filter(v => v !== val));
    } else {
      setArr([...arr, val]);
    }
  };

  return (
    <div>
      <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); navigate('/fpdf'); }}>← Back to Dashboard</a>
      <div className="page-header">
        <h1>New FPDF Entry</h1>
        <p>Structured discovery form for NBFC/Bank qualification</p>
      </div>

      <div className="stepper">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`step ${i === step ? 'active' : i < step ? 'completed' : ''}`} onClick={() => i <= step && setStep(i)} style={{ cursor: i <= step ? 'pointer' : 'default' }}>
              <div className="step-number">{i < step ? '✓' : i + 1}</div>
              <span className="step-label">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`step-line ${i < step ? 'completed' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="form-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Landmark size={20} /> Section A — Basic Info</h3>
              <div className="form-group">
                <label>Company Name *</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Enter institution name" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Company Type *</label>
                  <div className="toggle-group">
                    {['NBFC', 'BANK', 'FINTECH'].map(t => (
                      <div key={t} className={`toggle-option ${companyType === t ? 'active' : ''}`} onClick={() => setCompanyType(t)}>{t}</div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <div className="toggle-group">
                    {['NCR', 'NON_NCR'].map(t => (
                      <div key={t} className={`toggle-option ${location === t ? 'active' : ''}`} onClick={() => setLocation(t)}>{t.replace('_', ' ')}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Lending Fit */}
          {step === 1 && (
            <div className="form-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Coins size={20} /> Section B — Lending Fit</h3>
              <div className="form-group">
                <label>Lending Segments</label>
                <div className="toggle-group">
                  {LENDING_SEGMENTS.map(s => (
                    <div key={s.value} className={`toggle-option ${lendingSegments.includes(s.value) ? 'active' : ''}`} onClick={() => toggleArray(s.value, lendingSegments, setLendingSegments)}>
                      {s.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Products</label>
                <div className="toggle-group">
                  {PRODUCTS.map(p => (
                    <div key={p.value} className={`toggle-option ${products.includes(p.value) ? 'active' : ''}`} onClick={() => toggleArray(p.value, products, setProducts)}>
                      {p.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-row">
                 <div className="form-group">
                  <label>Ticket Size</label>
                  <div className="toggle-group">
                    {[{value: '10L_2CR', label: '10 Lakhs - 2 Cr'}, {value: 'HIGHER', label: 'Higher (> 2Cr)'}].map(t => (
                      <div key={t.value} className={`toggle-option ${ticketSize === t.value ? 'active' : ''}`} onClick={() => setTicketSize(t.value)}>{t.label}</div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Geography focus</label>
                  <div className="toggle-group">
                    {[{value: 'PAN_INDIA', label: 'Pan India'}, {value: 'NCR', label: 'NCR Only'}, {value: 'RESTRICTED', label: 'Restricted'}].map(g => (
                      <div key={g.value} className={`toggle-option ${geography === g.value ? 'active' : ''}`} onClick={() => setGeography(g.value)}>{g.label}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Outreach Tracking */}
          {step === 2 && (
            <div className="form-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={20} /> Section C — Outreach Tracking</h3>
              <div className="form-row">
                 <div className="form-group">
                  <label>LinkedIn</label>
                  <div className={`checkbox-toggle ${linkedinOutreach ? 'checked' : ''} mb-2`} onClick={() => setLinkedinOutreach(!linkedinOutreach)}>
                    <div className="check-icon">{linkedinOutreach ? <Check size={14} /> : ''}</div> <span>Outreach attempt made</span>
                  </div>
                  <div className={`checkbox-toggle ${linkedinResponse ? 'checked' : ''}`} onClick={() => setLinkedinResponse(!linkedinResponse)}>
                    <div className="check-icon">{linkedinResponse ? <Check size={14} /> : ''}</div> <span>Response received</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Cold Calling</label>
                  <div className={`checkbox-toggle ${callAttempted ? 'checked' : ''} mb-2`} onClick={() => setCallAttempted(!callAttempted)}>
                    <div className="check-icon">{callAttempted ? <Check size={14} /> : ''}</div> <span>Call attempted</span>
                  </div>
                   <div className={`checkbox-toggle ${callConnected ? 'checked' : ''}`} onClick={() => setCallConnected(!callConnected)}>
                    <div className="check-icon">{callConnected ? <Check size={14} /> : ''}</div> <span>Call successfully connected</span>
                  </div>
                </div>
              </div>
              <div className="form-group mt-4">
                <label>Conversation Quality</label>
                <div className="toggle-group">
                  {['NONE', 'BASIC', 'MEANINGFUL'].map(c => (
                    <div key={c} className={`toggle-option ${conversationQuality === c ? 'active' : ''}`} onClick={() => setConversationQuality(c)}>{c}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Engagement */}
          {step === 3 && (
            <div className="form-section">
               <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Handshake size={20} /> Section D — Engagement</h3>
               <div className="form-row">
                <div className="form-group">
                  <label>Meeting Status</label>
                  <div className="toggle-group">
                    {['NONE', 'ONLINE', 'OFFLINE'].map(m => (
                      <div key={m} className={`toggle-option ${meetingStatus === m ? 'active' : ''}`} onClick={() => setMeetingStatus(m)}>{m}</div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Partner Willingness</label>
                  <div className="toggle-group">
                    {['NOT_INTERESTED', 'MAYBE', 'OPEN'].map(w => (
                      <div key={w} className={`toggle-option ${willingness === w ? 'active' : ''}`} onClick={() => setWillingness(w)}>{w.replace('_', ' ')}</div>
                    ))}
                  </div>
                </div>
               </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="form-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={20} /> Review & Submit</h3>
              <p className="section-desc">Review FPDF information before final submission</p>
              <div className="info-grid mb-6">
                <div className="info-item"><label>Company</label><p>{companyName}</p></div>
                <div className="info-item"><label>Type</label><p>{companyType}</p></div>
                <div className="info-item"><label>Location</label><p>{location}</p></div>
                <div className="info-item"><label>Ticket Size</label><p>{ticketSize}</p></div>
                <div className="info-item"><label>Geography</label><p>{geography}</p></div>
                <div className="info-item"><label>Convo Quality</label><p>{conversationQuality}</p></div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={saving}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {saving ? 'Submitting...' : <><Rocket size={18} /> Submit for Scoring</>}
                  </span>
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/fpdf')}>Save as Draft</button>
              </div>
            </div>
          )}
        </div>

        {/* Live Score Preview sidebar */}
         <div>
          <div className="card" style={{ position: 'sticky', top: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: 'var(--color-text-primary)' }}>
              Live Score Preview
            </h3>
            <p style={{ fontSize: 13, marginBottom: 12, color: 'var(--color-text-secondary)' }}>
              Updated on every save step
            </p>
            {liveScore ? (
              <ConversionMeter
                angle={liveScore.scores.conversionAngle}
                score={liveScore.scores.totalScore}
                classification={liveScore.classification}
                size="md"
                showReadout
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-secondary)', fontSize: 13 }}>
                Score will appear after saving
              </div>
            )}
          </div>
        </div>

      </div>

      {step < 4 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button className="btn btn-outline" onClick={() => setStep(s => Math.max(s - 1, 0))} disabled={step === 0}>
            ← Previous
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={saving}>
            {saving ? 'Saving...' : step === 3 ? 'Review →' : 'Save & Next →'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FpdfForm;
