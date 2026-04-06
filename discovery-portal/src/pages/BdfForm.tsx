import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bdfApi } from '../api';
import toast from 'react-hot-toast';
import ConversionMeter from '../components/ConversionMeter';
import { Building, Search, Phone, Target, CheckCircle2, MessageCircle, Link, Save, Plus, Rocket, Check } from 'lucide-react';

const PROJECT_VALUES = [
  { value: 'BELOW_100CR', label: '< ₹100 Cr' },
  { value: '100_500CR', label: '₹100 – 500 Cr' },
  { value: '500_1500CR', label: '₹500 – 1500 Cr' },
  { value: 'ABOVE_1500CR', label: '₹1500 Cr+' },
];

const STAGES = [
  { value: '0_30', label: '0% – 30%' },
  { value: '30_60', label: '30% – 60%' },
  { value: 'ABOVE_60', label: '60%+' },
];

const CHANNELS = ['WHATSAPP', 'CALL', 'LINKEDIN', 'SITE_VISIT'];

const BdfForm: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [liveScore, setLiveScore] = useState<{ scores: { totalScore: number; conversionAngle: number }; classification: string } | null>(null);

  // Section A
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('EPC');
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [projectValue, setProjectValue] = useState('');
  const [projectStage, setProjectStage] = useState('');

  // Section B
  const [websiteAvailable, setWebsiteAvailable] = useState(false);
  const [linkedinPresence, setLinkedinPresence] = useState(false);
  const [companySize, setCompanySize] = useState('');

  // Section C
  const [employeesIdentified, setEmployeesIdentified] = useState(false);
  const [phoneNumberAvailable, setPhoneNumberAvailable] = useState(false);
  const [reachability, setReachability] = useState('');

  // Section D — Ground Intelligence conversations
  const [conversations, setConversations] = useState<Array<{
    contactName: string; contactRole: string; channel: string;
    billingFlow: string; subcontractorUsage: string; executionPressure: string; sentiment: string; notes: string;
  }>>([]);
  const [showConvoForm, setShowConvoForm] = useState(false);
  const [convo, setConvo] = useState({
    contactName: '', contactRole: '', channel: 'CALL',
    billingFlow: '', subcontractorUsage: '', executionPressure: '', sentiment: '', notes: '',
  });

  const steps = [
    { label: 'Project Qualification', icon: '🏗️' },
    { label: 'Company Validation', icon: '🔍' },
    { label: 'Accessibility', icon: '📞' },
    { label: 'Ground Intelligence', icon: '🎯' },
    { label: 'Review & Submit', icon: '✅' },
  ];

  const saveOrCreate = async () => {
    setSaving(true);
    try {
      const data: any = {
        companyName, companyType, projectName, location, projectValue, projectStage,
        websiteAvailable, linkedinPresence,
        employeesIdentified, phoneNumberAvailable,
      };
      
      // Omit empty enums to prevent Mongoose validation errors
      if (companySize) data.companySize = companySize;
      if (reachability) data.reachability = reachability;

      let res;
      if (entryId) {
        res = await bdfApi.update(entryId, data);
      } else {
        res = await bdfApi.create(data);
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
      if (!companyName || !projectName || !location || !projectValue || !projectStage) {
        return toast.error('Please fill all Section A fields');
      }
    }
    if (step === 2) {
      if (!reachability) return toast.error('Please specify reachability');
    }
    if (step <= 2) {
      await saveOrCreate();
    }
    setStep(s => Math.min(s + 1, steps.length - 1));
  };

  const handleAddConvo = async () => {
    if (!convo.channel || !convo.billingFlow || !convo.subcontractorUsage || !convo.executionPressure || !convo.sentiment) {
      return toast.error('Fill all required signal fields');
    }
    if (!entryId) {
      toast.error('Save the entry first');
      return;
    }
    try {
      const res = await bdfApi.addGroundIntelligence(entryId, convo);
      setConversations([...conversations, convo]);
      setLiveScore({ scores: res.data.scores, classification: res.data.classification });
      setConvo({ contactName: '', contactRole: '', channel: 'CALL', billingFlow: '', subcontractorUsage: '', executionPressure: '', sentiment: '', notes: '' });
      setShowConvoForm(false);
      toast.success(`Conversation ${conversations.length + 1} recorded`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to add conversation');
    }
  };

  const handleSubmit = async () => {
    if (!entryId) return toast.error('Save the entry first');
    if (conversations.length < 3) return toast.error('Minimum 3 conversations required for submission.');
    
    setSaving(true);
    try {
      const res = await bdfApi.submit(entryId);
      toast.success(`Entry submitted! Classified as ${res.data.classification} → ${res.data.pipeline}`);
      navigate(`/bdf/${entryId}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Submission failed');
    } finally {
      setSaving(false);
    }
  };

  const SignalSelect = ({ label, value, onChange, options }: {
    label: string; value: string; onChange: (v: string) => void;
    options: { value: string; label: string; }[];
  }) => (
    <div className="form-group">
      <label>{label}</label>
      <div className="toggle-group">
        {options.map(o => (
          <div key={o.value} className={`toggle-option ${value === o.value ? 'active' : ''}`} onClick={() => onChange(o.value)}>
            {o.label}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); navigate('/bdf'); }}>← Back to Dashboard</a>
      <div className="page-header">
        <h1>New BDF Entry</h1>
        <p>Structured discovery form for EPC/Developer qualification</p>
      </div>

      {/* Stepper */}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        <div>
          {/* Step 0: Section A — Project Qualification */}
          {step === 0 && (
            <div className="form-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Building size={20} /> Section A — Project Qualification</h3>
              <p className="section-desc">Basic details about the prospective EPC company and their project</p>
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Enter company name" />
                </div>
                <div className="form-group">
                  <label>Company Type *</label>
                  <div className="toggle-group">
                    {['EPC', 'DEVELOPER'].map(t => (
                      <div key={t} className={`toggle-option ${companyType === t ? 'active' : ''}`} onClick={() => setCompanyType(t)}>{t}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Project Name *</label>
                  <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Enter project name" />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City / Region" />
                </div>
              </div>
              <div className="form-group">
                <label>Project Value *</label>
                <div className="toggle-group">
                  {PROJECT_VALUES.map(v => (
                    <div key={v.value} className={`toggle-option ${projectValue === v.value ? 'active' : ''}`} onClick={() => setProjectValue(v.value)}>
                      {v.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Project Stage *</label>
                <div className="toggle-group">
                  {STAGES.map(s => (
                    <div key={s.value} className={`toggle-option ${projectStage === s.value ? 'active' : ''}`} onClick={() => setProjectStage(s.value)}>
                      {s.label}
                    </div>
                  ))}
                </div>
                {projectStage && projectStage !== '0_30' && (
                  <p style={{ color: '#f97316', fontSize: 12, marginTop: 6 }}>⚠️ Stage &gt; 30% — Cannot achieve Green classification</p>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Section B — Company Validation */}
          {step === 1 && (
            <div className="form-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Search size={20} /> Section B — Company Validation</h3>
              <p className="section-desc">Validate the company's digital presence and scale</p>
              <div className="form-row">
                <div className="form-group">
                  <label>Website Available</label>
                  <div className={`checkbox-toggle ${websiteAvailable ? 'checked' : ''}`} onClick={() => setWebsiteAvailable(!websiteAvailable)}>
                    <div className="check-icon">{websiteAvailable ? <Check size={14} /> : ''}</div>
                    <span>{websiteAvailable ? 'Yes — Website found' : 'No website found'}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>LinkedIn Presence</label>
                  <div className={`checkbox-toggle ${linkedinPresence ? 'checked' : ''}`} onClick={() => setLinkedinPresence(!linkedinPresence)}>
                    <div className="check-icon">{linkedinPresence ? <Check size={14} /> : ''}</div>
                    <span>{linkedinPresence ? 'Yes — LinkedIn found' : 'No LinkedIn found'}</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Company Size</label>
                <div className="toggle-group">
                  {['SMALL', 'MID', 'LARGE'].map(s => (
                    <div key={s} className={`toggle-option ${companySize === s ? 'active' : ''}`} onClick={() => setCompanySize(s)}>{s}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Section C — Accessibility */}
          {step === 2 && (
            <div className="form-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={20} /> Section C — Accessibility</h3>
              <p className="section-desc">How reachable is this company for outreach?</p>
              <div className="form-row">
                <div className="form-group">
                  <label>Employees Identified</label>
                  <div className={`checkbox-toggle ${employeesIdentified ? 'checked' : ''}`} onClick={() => setEmployeesIdentified(!employeesIdentified)}>
                    <div className="check-icon">{employeesIdentified ? <Check size={14} /> : ''}</div>
                    <span>{employeesIdentified ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone Number Available</label>
                  <div className={`checkbox-toggle ${phoneNumberAvailable ? 'checked' : ''}`} onClick={() => setPhoneNumberAvailable(!phoneNumberAvailable)}>
                    <div className="check-icon">{phoneNumberAvailable ? <Check size={14} /> : ''}</div>
                    <span>{phoneNumberAvailable ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Reachability *</label>
                <div className="toggle-group">
                  {['EASY', 'MODERATE', 'DIFFICULT'].map(r => (
                    <div key={r} className={`toggle-option ${reachability === r ? 'active' : ''}`} onClick={() => setReachability(r)}>{r}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Section D — Ground Intelligence */}
          {step === 3 && (
            <div className="form-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Target size={20} /> Section D — Ground Intelligence</h3>
              <p className="section-desc">Minimum 3 conversations required. Record call insights with the approved question set.</p>

              {conversations.map((c, i) => (
                <div key={i} className="gi-card">
                  <div className="gi-card-header">
                    <h4>Conversation #{i + 1} — {c.contactName || 'Unknown'}</h4>
                    <span className="badge badge-cyan">{c.channel}</span>
                  </div>
                  <div className="gi-signals">
                    <div className="gi-signal">Billing: <span>{c.billingFlow}</span></div>
                    <div className="gi-signal">SC Usage: <span>{c.subcontractorUsage}</span></div>
                    <div className="gi-signal">Pressure: <span>{c.executionPressure}</span></div>
                    <div className="gi-signal">Sentiment: <span>{c.sentiment}</span></div>
                  </div>
                </div>
              ))}

              <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${conversations.length >= 3 ? 'badge-green' : 'badge-orange'}`}>
                  {conversations.length} / 3 conversations
                </span>
                {conversations.length < 3 && <span style={{ fontSize: 12, color: '#f97316' }}>⚠️ Need at least 3</span>}
              </div>

              {showConvoForm ? (
                <div className="card" style={{ background: 'var(--color-dark-700)' }}>
                  <h4 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>Add Conversation #{conversations.length + 1}</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Name</label>
                      <input value={convo.contactName} onChange={e => setConvo({ ...convo, contactName: e.target.value })} placeholder="Who did you speak to?" />
                    </div>
                    <div className="form-group">
                      <label>Contact Role</label>
                      <input value={convo.contactRole} onChange={e => setConvo({ ...convo, contactRole: e.target.value })} placeholder="Their designation" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Channel *</label>
                    <div className="toggle-group">
                      {CHANNELS.map(ch => (
                        <div key={ch} className={`toggle-option ${convo.channel === ch ? 'active' : ''}`} onClick={() => setConvo({ ...convo, channel: ch })}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            {ch === 'WHATSAPP' ? <MessageCircle size={14} /> : ch === 'CALL' ? <Phone size={14} /> : ch === 'LINKEDIN' ? <Link size={14} /> : <Building size={14} />} {ch.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <SignalSelect label="Billing Flow *" value={convo.billingFlow} onChange={v => setConvo({ ...convo, billingFlow: v })}
                    options={[{ value: 'SMOOTH', label: 'Smooth' }, { value: 'SLIGHT_DELAY', label: 'Slight Delay' }, { value: 'NOTICEABLE_DELAY', label: 'Noticeable Delay' }]} />
                  <SignalSelect label="Subcontractor Usage *" value={convo.subcontractorUsage} onChange={v => setConvo({ ...convo, subcontractorUsage: v })}
                    options={[{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }]} />
                  <SignalSelect label="Execution Pressure *" value={convo.executionPressure} onChange={v => setConvo({ ...convo, executionPressure: v })}
                    options={[{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }]} />
                  <SignalSelect label="Overall Sentiment *" value={convo.sentiment} onChange={v => setConvo({ ...convo, sentiment: v })}
                    options={[{ value: 'POSITIVE', label: 'Positive' }, { value: 'NEUTRAL', label: 'Neutral' }, { value: 'SLIGHTLY_NEGATIVE', label: 'Slightly Negative' }]} />

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea value={convo.notes} onChange={e => setConvo({ ...convo, notes: e.target.value })} placeholder="Additional observations..." />
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={handleAddConvo}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Save size={16} /> Save Conversation</span>
                    </button>
                    <button className="btn btn-outline" onClick={() => setShowConvoForm(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-outline" onClick={() => setShowConvoForm(true)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16} /> Add Conversation</span>
                </button>
              )}
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="form-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={20} /> Review & Submit</h3>
              <p className="section-desc">Review all information before final submission</p>

              <div className="info-grid" style={{ marginBottom: 24 }}>
                <div className="info-item"><label>Company</label><p>{companyName}</p></div>
                <div className="info-item"><label>Type</label><p>{companyType}</p></div>
                <div className="info-item"><label>Project</label><p>{projectName}</p></div>
                <div className="info-item"><label>Location</label><p>{location}</p></div>
                <div className="info-item"><label>Value</label><p>{PROJECT_VALUES.find(v => v.value === projectValue)?.label}</p></div>
                <div className="info-item"><label>Stage</label><p>{STAGES.find(s => s.value === projectStage)?.label}</p></div>
                <div className="info-item"><label>Website</label><p>{websiteAvailable ? 'Yes' : 'No'}</p></div>
                <div className="info-item"><label>LinkedIn</label><p>{linkedinPresence ? 'Yes' : 'No'}</p></div>
                <div className="info-item"><label>Size</label><p>{companySize || '—'}</p></div>
                <div className="info-item"><label>Reachability</label><p>{reachability || '—'}</p></div>
                <div className="info-item"><label>Conversations</label><p>{conversations.length}</p></div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={saving}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {saving ? 'Submitting...' : <><Rocket size={18} /> Submit for Scoring</>}
                  </span>
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/bdf')}>Save as Draft</button>
              </div>
            </div>
          )}
        </div>

        {/* Live Score Sidebar */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 32 }}>
            <h3 style={{ fontSize: 14, marginBottom: 12, color: 'var(--color-text-secondary)' }}>Live Score Preview</h3>
            {liveScore ? (
              <ConversionMeter
                angle={liveScore.scores.conversionAngle}
                score={liveScore.scores.totalScore}
                classification={liveScore.classification}
                size="sm"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-muted)', fontSize: 13 }}>
                Score will appear after saving
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
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

export default BdfForm;
