import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fpdfApi } from '../api';
import toast from 'react-hot-toast';
import ConversionMeter from '../components/ConversionMeter';
import { Landmark, Coins, Phone, Handshake, CheckCircle2, Rocket, ClipboardList } from 'lucide-react';
import {
  CHECKLIST_RESPONSE_LABELS,
  FPDF_CHECKLIST_QUESTIONS,
  FPDF_CHECKLIST_RESPONSE_VALUES,
  type ChecklistResponse,
} from '../constants/fpdfChecklist';

type GeographicPreferenceKey = 'delhiNcrActive' | 'panIndiaCoverage' | 'regionRestricted';

const LENDING_SEGMENTS = [
  { value: 'MSME_LENDING', label: 'MSME Lending' },
  { value: 'VENDOR_FINANCING', label: 'Vendor Financing' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure Exposure' },
];

const PRODUCTS = [
  { value: 'WORKING_CAPITAL', label: 'Working Capital Loans' },
  { value: 'INVOICE_FINANCING', label: 'Invoice / Receivable Financing' },
];

const TICKET_SIZE_OPTIONS = [
  { value: '10L_2CR', label: 'Matches Rs10L-<2Cr' },
  { value: 'HIGHER', label: 'Higher Only' },
];

const CONVERSATION_QUALITY_OPTIONS = [
  { value: 'NONE', label: 'No Conversation' },
  { value: 'BASIC', label: 'Basic Conversation' },
  { value: 'MEANINGFUL', label: 'Meaningful Conversation' },
];

const MEETING_STATUS_OPTIONS = [
  { value: 'OFFLINE_CONFIRMED', label: 'Offline Meeting Confirmed' },
  { value: 'ONLINE_CONFIRMED', label: 'Online Meeting Confirmed' },
  { value: 'NOT_CONFIRMED', label: 'Not Confirmed' },
];

const PARTNERSHIP_WILLINGNESS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'MAYBE', label: 'Maybe' },
  { value: 'NOT_INTERESTED', label: 'Not Interested' },
];

const GEOGRAPHY_FIELDS: Array<{ key: GeographicPreferenceKey; label: string }> = [
  { key: 'delhiNcrActive', label: 'Delhi NCR Active' },
  { key: 'panIndiaCoverage', label: 'Pan India Coverage' },
  { key: 'regionRestricted', label: 'Region Restricted' },
];

type ChecklistAnswer = {
  response?: ChecklistResponse;
  notes: string;
};

type ChecklistState = Record<string, ChecklistAnswer>;

const createChecklistState = (): ChecklistState => {
  const initial: ChecklistState = {};
  for (const question of FPDF_CHECKLIST_QUESTIONS) {
    initial[question.code] = { notes: '' };
  }
  return initial;
};

const mapChecklistStateToPayload = (state: ChecklistState) => {
  return FPDF_CHECKLIST_QUESTIONS.map((question) => {
    const answer = state[question.code];
    const item: {
      code: string;
      question: string;
      response?: ChecklistResponse;
      notes?: string;
    } = {
      code: question.code,
      question: question.text,
    };

    if (answer?.response) {
      item.response = answer.response;
    }

    if (answer?.notes?.trim()) {
      item.notes = answer.notes.trim();
    }

    return item;
  });
};

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
  const [geographicPreference, setGeographicPreference] = useState({
    delhiNcrActive: false,
    panIndiaCoverage: false,
    regionRestricted: false,
  });

  // Section C
  const [linkedinOutreach, setLinkedinOutreach] = useState(false);
  const [linkedinResponse, setLinkedinResponse] = useState(false);
  const [callAttempted, setCallAttempted] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  const [conversationQuality, setConversationQuality] = useState('NONE');

  // Section D
  const [meetingStatus, setMeetingStatus] = useState('NOT_CONFIRMED');
  const [willingness, setWillingness] = useState('NOT_INTERESTED');

  // Section E
  const [complianceChecklist, setComplianceChecklist] = useState<ChecklistState>(createChecklistState);

  const steps = [
    { label: 'Basic Info', icon: '🏦' },
    { label: 'Lending Fit', icon: '💰' },
    { label: 'Outreach', icon: '📞' },
    { label: 'Engagement', icon: '🤝' },
    { label: 'Checklist', icon: '📋' },
    { label: 'Review', icon: '✅' },
  ];

  const saveOrCreate = async () => {
    setSaving(true);
    try {
      const data = {
        companyName, companyType, location,
        lendingSegments, products, ticketSize, geographicPreference,
        outreach: { linkedinOutreach, linkedinResponse, callAttempted, callConnected, conversationQuality },
        engagement: { meetingStatus, willingness },
        complianceChecklist: mapChecklistStateToPayload(complianceChecklist),
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

    if (step === 4) {
      const checklistValidation = getChecklistValidationErrors();
      if (checklistValidation.unanswered.length > 0) {
        return toast.error(`Please answer checklist questions: ${formatSerialList(checklistValidation.unanswered)}`);
      }
      if (checklistValidation.missingNotes.length > 0) {
        return toast.error(`Write-up required for: ${formatSerialList(checklistValidation.missingNotes)}`);
      }
    }

    if (step <= 4) {
      await saveOrCreate();
    }
    setStep(s => Math.min(s + 1, steps.length - 1));
  };


  const handleSubmit = async () => {
    if (!entryId) return toast.error('Save the entry first');

    const checklistValidation = getChecklistValidationErrors();
    if (checklistValidation.unanswered.length > 0) {
      return toast.error(`Please answer checklist questions: ${formatSerialList(checklistValidation.unanswered)}`);
    }
    if (checklistValidation.missingNotes.length > 0) {
      return toast.error(`Write-up required for: ${formatSerialList(checklistValidation.missingNotes)}`);
    }

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

  const setArrayYesNo = (
    value: string,
    nextValue: boolean,
    arr: string[],
    setArr: (next: string[]) => void
  ) => {
    if (nextValue) {
      if (!arr.includes(value)) setArr([...arr, value]);
      return;
    }
    if (arr.includes(value)) {
      setArr(arr.filter(item => item !== value));
    }
  };

  const setGeoPreferenceValue = (field: GeographicPreferenceKey, nextValue: boolean) => {
    setGeographicPreference(prev => ({ ...prev, [field]: nextValue }));
  };

  const getOptionLabel = (options: Array<{ value: string; label: string }>, value: string) => {
    return options.find(option => option.value === value)?.label || value;
  };

  const setChecklistResponse = (code: string, response: ChecklistResponse) => {
    setComplianceChecklist(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        response,
      },
    }));
  };

  const setChecklistNotes = (code: string, notes: string) => {
    setComplianceChecklist(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        notes,
      },
    }));
  };

  const getChecklistValidationErrors = () => {
    const unanswered: string[] = [];
    const missingNotes: string[] = [];

    for (const question of FPDF_CHECKLIST_QUESTIONS) {
      const answer = complianceChecklist[question.code];
      if (!answer?.response) {
        unanswered.push(question.serial);
        continue;
      }

      if (question.requiresNotes && !answer.notes.trim()) {
        missingNotes.push(question.serial);
      }
    }

    return { unanswered, missingNotes };
  };

  const formatSerialList = (serials: string[]) => {
    const maxShown = 5;
    const head = serials.slice(0, maxShown).join(', ');
    if (serials.length <= maxShown) return head;
    return `${head} +${serials.length - maxShown} more`;
  };

  const checklistAnsweredCount = FPDF_CHECKLIST_QUESTIONS.filter(
    question => Boolean(complianceChecklist[question.code]?.response)
  ).length;
  const checklistNotesRequiredCount = FPDF_CHECKLIST_QUESTIONS.filter(question => question.requiresNotes).length;
  const checklistNotesCompletedCount = FPDF_CHECKLIST_QUESTIONS.filter(
    question => question.requiresNotes && Boolean(complianceChecklist[question.code]?.notes.trim())
  ).length;

  const renderYesNoField = (label: string, value: boolean, onChange: (nextValue: boolean) => void) => (
    <div className="form-group" key={label}>
      <label>{label}</label>
      <div className="toggle-group">
        <div className={`toggle-option ${value ? 'active' : ''}`} onClick={() => onChange(true)}>Yes</div>
        <div className={`toggle-option ${!value ? 'active' : ''}`} onClick={() => onChange(false)}>No</div>
      </div>
    </div>
  );

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
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Landmark size={20} /> Section A — Basic Information</h3>
              <div className="form-group">
                <label>Company Name *</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Enter institution name" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Institution Type *</label>
                  <div className="toggle-group">
                    {[{ value: 'NBFC', label: 'NBFC' }, { value: 'BANK', label: 'Bank' }, { value: 'FINTECH', label: 'Fintech' }].map(t => (
                      <div key={t.value} className={`toggle-option ${companyType === t.value ? 'active' : ''}`} onClick={() => setCompanyType(t.value)}>{t.label}</div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Headquarters Location *</label>
                  <div className="toggle-group">
                    {[{ value: 'NCR', label: 'Delhi NCR' }, { value: 'NON_NCR', label: 'Non-NCR' }].map(t => (
                      <div key={t.value} className={`toggle-option ${location === t.value ? 'active' : ''}`} onClick={() => setLocation(t.value)}>{t.label}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Lending Fit */}
          {step === 1 && (
            <div className="form-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Coins size={20} /> Section B — Lending Fit (Core Filter)</h3>

              <p className="section-desc" style={{ marginBottom: 10, marginTop: 12 }}>Sub-section: Lending Segment</p>
              <div className="form-row">
                {LENDING_SEGMENTS.map(segment => (
                  renderYesNoField(
                    segment.label,
                    lendingSegments.includes(segment.value),
                    (nextValue) => setArrayYesNo(segment.value, nextValue, lendingSegments, setLendingSegments)
                  )
                ))}
              </div>

              <p className="section-desc" style={{ marginBottom: 10, marginTop: 16 }}>Sub-section: Product Type</p>
              <div className="form-row">
                {PRODUCTS.map(product => (
                  renderYesNoField(
                    product.label,
                    products.includes(product.value),
                    (nextValue) => setArrayYesNo(product.value, nextValue, products, setProducts)
                  )
                ))}
              </div>

              <p className="section-desc" style={{ marginBottom: 10, marginTop: 16 }}>Sub-section: Ticket Size Fit</p>
              <div className="form-group">
                <label>Ticket Size Compatibility</label>
                <div className="toggle-group">
                  {TICKET_SIZE_OPTIONS.map(option => (
                    <div
                      key={option.value}
                      className={`toggle-option ${ticketSize === option.value ? 'active' : ''}`}
                      onClick={() => setTicketSize(option.value)}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              </div>

              <p className="section-desc" style={{ marginBottom: 10, marginTop: 16 }}>Sub-section: Geographic Preference</p>
              <div className="form-row">
                {GEOGRAPHY_FIELDS.map(field => (
                  renderYesNoField(
                    field.label,
                    geographicPreference[field.key],
                    (nextValue) => setGeoPreferenceValue(field.key, nextValue)
                  )
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Outreach Tracking */}
          {step === 2 && (
            <div className="form-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={20} /> Section C — Outreach Tracking</h3>
              <p className="section-desc" style={{ marginBottom: 10, marginTop: 12 }}>Sub-section: LinkedIn Outreach</p>
              <div className="form-row">
                {renderYesNoField('Outreach Attempted', linkedinOutreach, setLinkedinOutreach)}
                {renderYesNoField('Response Received', linkedinResponse, setLinkedinResponse)}
              </div>

              <p className="section-desc" style={{ marginBottom: 10, marginTop: 16 }}>Sub-section: Call Interaction</p>
              <div className="form-row">
                {renderYesNoField('Call Attempted', callAttempted, setCallAttempted)}
                {renderYesNoField('Connected Successfully', callConnected, setCallConnected)}
              </div>

              <p className="section-desc" style={{ marginBottom: 10, marginTop: 16 }}>Sub-section: Conversation Quality</p>
              <div className="form-group">
                <label>Conversation Quality</label>
                <div className="toggle-group">
                  {CONVERSATION_QUALITY_OPTIONS.map(option => (
                    <div
                      key={option.value}
                      className={`toggle-option ${conversationQuality === option.value ? 'active' : ''}`}
                      onClick={() => setConversationQuality(option.value)}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Engagement */}
          {step === 3 && (
            <div className="form-section">
               <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Handshake size={20} /> Section D — Engagement Status</h3>
               <div className="form-row">
                <div className="form-group">
                  <label>Meeting Status</label>
                  <div className="toggle-group">
                    {MEETING_STATUS_OPTIONS.map(option => (
                      <div
                        key={option.value}
                        className={`toggle-option ${meetingStatus === option.value ? 'active' : ''}`}
                        onClick={() => setMeetingStatus(option.value)}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Partnership Willingness</label>
                  <div className="toggle-group">
                    {PARTNERSHIP_WILLINGNESS_OPTIONS.map(option => (
                      <div
                        key={option.value}
                        className={`toggle-option ${willingness === option.value ? 'active' : ''}`}
                        onClick={() => setWillingness(option.value)}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                </div>
               </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="form-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={20} /> Section E — Consultant Checklist (PDF)</h3>
              <p className="section-desc">All questions from the consultant checklist PDF. Mark each one before submission.</p>
              <p className="section-desc" style={{ marginBottom: 12 }}>
                Responses completed: <strong>{checklistAnsweredCount}/{FPDF_CHECKLIST_QUESTIONS.length}</strong>
              </p>

              <div className="checklist-list">
                {FPDF_CHECKLIST_QUESTIONS.map((question) => {
                  const answer = complianceChecklist[question.code] || { notes: '' };
                  return (
                    <div className="checklist-card" key={question.code}>
                      <p className="checklist-question">
                        <span className="checklist-serial">{question.serial}.</span> {question.text}
                      </p>

                      <div className="toggle-group">
                        {FPDF_CHECKLIST_RESPONSE_VALUES.map((responseValue) => (
                          <div
                            key={`${question.code}-${responseValue}`}
                            className={`toggle-option ${answer.response === responseValue ? 'active' : ''}`}
                            onClick={() => setChecklistResponse(question.code, responseValue)}
                          >
                            {CHECKLIST_RESPONSE_LABELS[responseValue]}
                          </div>
                        ))}
                      </div>

                      {(question.requiresNotes || question.notesHint || answer.notes) && (
                        <div className="form-group" style={{ marginTop: 12 }}>
                          <label>{question.requiresNotes ? 'Write-up (required)' : 'Notes (optional)'}</label>
                          <textarea
                            value={answer.notes}
                            onChange={(e) => setChecklistNotes(question.code, e.target.value)}
                            placeholder={question.notesHint || 'Add notes for this question'}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="form-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={20} /> Review & Submit</h3>
              <p className="section-desc">Review FPDF information before final submission</p>
              <div className="info-grid mb-6">
                <div className="info-item"><label>Company</label><p>{companyName}</p></div>
                <div className="info-item"><label>Institution Type</label><p>{getOptionLabel([{ value: 'NBFC', label: 'NBFC' }, { value: 'BANK', label: 'Bank' }, { value: 'FINTECH', label: 'Fintech' }], companyType)}</p></div>
                <div className="info-item"><label>Headquarters Location</label><p>{location === 'NCR' ? 'Delhi NCR' : 'Non-NCR'}</p></div>
                <div className="info-item"><label>Ticket Size Fit</label><p>{getOptionLabel(TICKET_SIZE_OPTIONS, ticketSize)}</p></div>
                <div className="info-item"><label>Delhi NCR Active</label><p>{geographicPreference.delhiNcrActive ? 'Yes' : 'No'}</p></div>
                <div className="info-item"><label>Pan India Coverage</label><p>{geographicPreference.panIndiaCoverage ? 'Yes' : 'No'}</p></div>
                <div className="info-item"><label>Region Restricted</label><p>{geographicPreference.regionRestricted ? 'Yes' : 'No'}</p></div>
                <div className="info-item"><label>Convo Quality</label><p>{getOptionLabel(CONVERSATION_QUALITY_OPTIONS, conversationQuality)}</p></div>
                <div className="info-item"><label>Meeting Status</label><p>{getOptionLabel(MEETING_STATUS_OPTIONS, meetingStatus)}</p></div>
                <div className="info-item"><label>Partnership Willingness</label><p>{getOptionLabel(PARTNERSHIP_WILLINGNESS_OPTIONS, willingness)}</p></div>
                <div className="info-item"><label>Checklist Responses</label><p>{checklistAnsweredCount}/{FPDF_CHECKLIST_QUESTIONS.length}</p></div>
                <div className="info-item"><label>Checklist Write-ups</label><p>{checklistNotesCompletedCount}/{checklistNotesRequiredCount}</p></div>
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

      {step < 5 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button className="btn btn-outline" onClick={() => setStep(s => Math.max(s - 1, 0))} disabled={step === 0}>
            ← Previous
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={saving}>
            {saving ? 'Saving...' : step === 4 ? 'Review →' : 'Save & Next →'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FpdfForm;
