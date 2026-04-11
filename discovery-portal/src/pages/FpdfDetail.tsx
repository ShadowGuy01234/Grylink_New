import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fpdfApi } from '../api';
import ConversionMeter from '../components/ConversionMeter';
import toast from 'react-hot-toast';
import { Check, X, Rocket, CheckCircle2 } from 'lucide-react';
import { CHECKLIST_RESPONSE_LABELS, FPDF_CHECKLIST_QUESTIONS, type ChecklistResponse } from '../constants/fpdfChecklist';

const classColor: Record<string, string> = { GREEN: 'badge-green', YELLOW: 'badge-yellow', ORANGE: 'badge-orange', RED: 'badge-red' };

const TICKET_SIZE_LABELS: Record<string, string> = {
  '10L_2CR': 'Matches Rs10L-<2Cr',
  'HIGHER': 'Higher Only',
};

const CONVERSATION_QUALITY_LABELS: Record<string, string> = {
  'NONE': 'No Conversation',
  'BASIC': 'Basic Conversation',
  'MEANINGFUL': 'Meaningful Conversation',
};

const MEETING_STATUS_LABELS: Record<string, string> = {
  'OFFLINE_CONFIRMED': 'Offline Meeting Confirmed',
  'ONLINE_CONFIRMED': 'Online Meeting Confirmed',
  'NOT_CONFIRMED': 'Not Confirmed',
  // Legacy
  'OFFLINE': 'Offline Meeting Confirmed',
  'ONLINE': 'Online Meeting Confirmed',
  'NONE': 'Not Confirmed',
};

const WILLINGNESS_LABELS: Record<string, string> = {
  'OPEN': 'Open',
  'MAYBE': 'Maybe',
  'NOT_INTERESTED': 'Not Interested',
};

const COMPANY_TYPE_LABELS: Record<string, string> = {
  'NBFC': 'NBFC',
  'BANK': 'Bank',
  'FINTECH': 'Fintech',
};

const LOCATION_LABELS: Record<string, string> = {
  'NCR': 'Delhi NCR',
  'NON_NCR': 'Non-NCR',
};

const SEGMENT_LABELS: Record<string, string> = {
  'MSME_LENDING': 'MSME Lending',
  'VENDOR_FINANCING': 'Vendor Financing',
  'INFRASTRUCTURE': 'Infrastructure Exposure',
};

const PRODUCT_LABELS: Record<string, string> = {
  'WORKING_CAPITAL': 'Working Capital Loans',
  'INVOICE_FINANCING': 'Invoice / Receivable Financing',
};

const checklistBadgeClass = (response?: string) => {
  if (response === 'YES') return 'badge-green';
  if (response === 'NO') return 'badge-red';
  if (response === 'TO_CHECK_CONFIRM') return 'badge-yellow';
  return 'badge-gray';
};

const FpdfDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConvert, setShowConvert] = useState(false);
  const [convertData, setConvertData] = useState({ email: '', contactName: '', phone: '', code: '' });
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fpdfApi.getById(id!);
        setEntry(res.data);
      } catch { toast.error('Failed to load entry'); navigate('/fpdf'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleConvert = async () => {
    if (!convertData.email || !convertData.code) return toast.error('Email and Code are required');
    setConverting(true);
    try {
      await fpdfApi.convert(id!, convertData);
      toast.success('Successfully converted to NBFC!');
      const res = await fpdfApi.getById(id!);
      setEntry(res.data);
      setShowConvert(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Conversion failed');
    } finally { setConverting(false); }
  };

  if (loading) return <div className="page-loading"><span className="spinner" /> Loading...</div>;
  if (!entry) return null;

  const geographyPreference = {
    delhiNcrActive:
      entry.geographicPreference?.delhiNcrActive ??
      (entry.geography === 'NCR' || entry.geography === 'PAN_INDIA'),
    panIndiaCoverage:
      entry.geographicPreference?.panIndiaCoverage ??
      entry.geography === 'PAN_INDIA',
    regionRestricted:
      entry.geographicPreference?.regionRestricted ??
      entry.geography === 'RESTRICTED',
  };

  type ChecklistEntry = { code: string; response?: ChecklistResponse; notes?: string };
  const checklistEntries: ChecklistEntry[] = Array.isArray(entry.complianceChecklist) ? entry.complianceChecklist : [];
  const checklistByCode = new Map<string, ChecklistEntry>(checklistEntries.map((item) => [item.code, item]));
  const checklistAnsweredCount = FPDF_CHECKLIST_QUESTIONS.filter((question) => {
    const response = checklistByCode.get(question.code)?.response;
    return response === 'YES' || response === 'NO' || response === 'TO_CHECK_CONFIRM';
  }).length;

  return (
    <div>
      <Link to="/fpdf/pipeline" className="back-link">← Back to Pipeline</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>{entry.companyName}</h1>
          <p style={{ color: '#94a3b8' }}>{COMPANY_TYPE_LABELS[entry.companyType] || entry.companyType} • {LOCATION_LABELS[entry.location] || entry.location}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className={`badge ${classColor[entry.classification]}`} style={{ fontSize: 14, padding: '6px 14px' }}>{entry.classification}</span>
          <span className="badge badge-blue" style={{ fontSize: 14, padding: '6px 14px' }}>{entry.status}</span>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          {/* Institution Details */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Institution Details</h3>
            <div className="info-grid">
               <div className="info-item"><label>Ticket Size Compatibility</label><p>{TICKET_SIZE_LABELS[entry.ticketSize] || entry.ticketSize || '—'}</p></div>
               <div className="info-item"><label>Delhi NCR Active</label><p>{geographyPreference.delhiNcrActive ? 'Yes' : 'No'}</p></div>
               <div className="info-item"><label>Pan India Coverage</label><p>{geographyPreference.panIndiaCoverage ? 'Yes' : 'No'}</p></div>
               <div className="info-item"><label>Region Restricted</label><p>{geographyPreference.regionRestricted ? 'Yes' : 'No'}</p></div>
               <div className="info-item"><label>Lending Segments</label><p>{entry.lendingSegments?.map((segment: string) => SEGMENT_LABELS[segment] || segment).join(', ') || '—'}</p></div>
               <div className="info-item"><label>Product Types</label><p>{entry.products?.map((product: string) => PRODUCT_LABELS[product] || product).join(', ') || '—'}</p></div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Outreach & Engagement Details</h3>
            <div className="info-grid">
                <div className="info-item"><label>LinkedIn Contacted</label><p>{entry.outreach?.linkedinOutreach ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</p></div>
                <div className="info-item"><label>LinkedIn Responded</label><p>{entry.outreach?.linkedinResponse ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</p></div>
                <div className="info-item"><label>Call Attempted</label><p>{entry.outreach?.callAttempted ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</p></div>
                <div className="info-item"><label>Call Connected</label><p>{entry.outreach?.callConnected ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</p></div>
                <div className="info-item"><label>Conversation Quality</label><p>{CONVERSATION_QUALITY_LABELS[entry.outreach?.conversationQuality] || entry.outreach?.conversationQuality || '—'}</p></div>
                <div className="info-item"><label>Meeting Status</label><p>{MEETING_STATUS_LABELS[entry.engagement?.meetingStatus] || entry.engagement?.meetingStatus || '—'}</p></div>
                <div className="info-item"><label>Partnership Willingness</label><p>{WILLINGNESS_LABELS[entry.engagement?.willingness] || entry.engagement?.willingness || '—'}</p></div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 8 }}>Consultant Checklist Responses</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
              {checklistAnsweredCount}/{FPDF_CHECKLIST_QUESTIONS.length} questions answered
            </p>
            <div className="checklist-detail-list">
              {FPDF_CHECKLIST_QUESTIONS.map((question) => {
                const responseItem = checklistByCode.get(question.code);
                const response = responseItem?.response as ChecklistResponse | undefined;
                const notes = (responseItem?.notes || '').trim();

                return (
                  <div key={question.code} className="checklist-detail-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'start' }}>
                      <p className="checklist-detail-question">
                        <span className="checklist-detail-serial">{question.serial}.</span> {question.text}
                      </p>
                      <span className={`badge ${checklistBadgeClass(response)}`}>
                        {response ? CHECKLIST_RESPONSE_LABELS[response] : 'Not answered'}
                      </span>
                    </div>
                    {notes && <p className="checklist-detail-notes">Notes: {notes}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Score Breakdown</h3>
            <div className="info-grid">
              <div className="info-item"><label>Lending Fit (40%)</label><p style={{ fontSize: 20, fontWeight: 800 }}>{entry.scores?.lendingFit || 0}</p></div>
              <div className="info-item"><label>Ticket Size (15%)</label><p style={{ fontSize: 20, fontWeight: 800 }}>{entry.scores?.ticketSizeScore || 0}</p></div>
              <div className="info-item"><label>Engagement (25%)</label><p style={{ fontSize: 20, fontWeight: 800 }}>{entry.scores?.engagementScore || 0}</p></div>
              <div className="info-item"><label>Accessibility (10%)</label><p style={{ fontSize: 20, fontWeight: 800 }}>{entry.scores?.accessibilityScore || 0}</p></div>
              <div className="info-item"><label>Geography (10%)</label><p style={{ fontSize: 20, fontWeight: 800 }}>{entry.scores?.geographyScore || 0}</p></div>
            </div>
          </div>

          {/* Conversion */}
          {entry.status === 'SUBMITTED' && ['GREEN', 'YELLOW'].includes(entry.classification) && !entry.convertedToNbfcId && (
            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Rocket size={20} /> Convert to NBFC Partner</h3>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>This will create an NBFC record and user account.</p>
              {!showConvert ? (
                <button className="btn btn-success" onClick={() => setShowConvert(true)}>Convert to NBFC</button>
              ) : (
                <div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Email *</label>
                      <input value={convertData.email} onChange={e => setConvertData({ ...convertData, email: e.target.value })} placeholder="Contact email" />
                    </div>
                     <div className="form-group">
                      <label>Short Code *</label>
                      <input value={convertData.code} onChange={e => setConvertData({ ...convertData, code: e.target.value })} placeholder="e.g. HDFC" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Name</label>
                      <input value={convertData.contactName} onChange={e => setConvertData({ ...convertData, contactName: e.target.value })} placeholder="Contact name" />
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

          {entry.convertedToNbfcId && (
            <div className="card" style={{ borderColor: '#22c55e' }}>
              <p style={{ color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={18} /> Converted to NBFC — {entry.convertedToNbfcId.name || entry.convertedToNbfcId}</p>
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

export default FpdfDetail;
