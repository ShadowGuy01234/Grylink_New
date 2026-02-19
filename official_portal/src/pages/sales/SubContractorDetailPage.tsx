import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salesApi } from '../../api';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineIdentification,
  HiOutlineDocumentText,
  HiOutlineCurrencyRupee,
  HiOutlineChat,
  HiOutlinePlus,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from 'react-icons/hi';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ContactLogEntry {
  _id?: string;
  method: string;
  outcome: string;
  notes?: string;
  loggedBy?: { name: string };
  loggedAt: string;
}

interface KYCDocEntry {
  fileName?: string;
  fileUrl?: string;
  verified?: boolean;
  verifiedAt?: string;
}

interface KYCDocs {
  panCard?: KYCDocEntry;
  aadhaarCard?: KYCDocEntry;
  gstCertificate?: KYCDocEntry;
  cancelledCheque?: KYCDocEntry;
}

interface BankDetail {
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  verified?: boolean;
}

interface SubContractorDetail {
  _id: string;
  companyName?: string;
  contactName?: string;
  email: string;
  phone: string;
  constitutionType?: string;
  gstin?: string;
  pan?: string;
  address?: string;
  registeredAddress?: { street?: string; city?: string; state?: string; pincode?: string };
  status: string;
  kycStatus: string;
  profileCompletion: number;
  contactedAt?: string;
  createdAt: string;
  linkedEpcId?: { _id: string; companyName: string };
  kycDocuments?: KYCDocs;
  bankDetails?: BankDetail & { verificationStatus?: string };
  contactLog?: ContactLogEntry[];
  statusHistory?: { status: string; changedAt: string; changedBy?: { name: string } }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const KYC_STEPS = ['Profile', 'KYC Docs', 'Bank Details', 'Verification', 'Approved'];
const STATUS_BADGE: Record<string, string> = {
  PENDING: 'badge badge-gray',
  ACTIVE: 'badge badge-green',
  SUSPENDED: 'badge badge-red',
  DORMANT: 'badge badge-yellow',
};
const KYC_BADGE: Record<string, string> = {
  NOT_STARTED: 'badge badge-gray',
  DOCUMENTS_PENDING: 'badge badge-blue',
  UNDER_REVIEW: 'badge badge-yellow',
  COMPLETED: 'badge badge-green',
  REJECTED: 'badge badge-red',
};
const METHOD_COLORS: Record<string, string> = {
  Call: '#22C55E',
  Email: '#3B82F6',
  WhatsApp: '#25D366',
  'In-Person': '#F59E0B',
};
const OUTCOME_BADGE: Record<string, { bg: string; color: string }> = {
  Reached: { bg: 'rgba(34,197,94,0.1)', color: '#15803D' },
  'No Answer': { bg: 'rgba(239,68,68,0.1)', color: '#DC2626' },
  'Callback Requested': { bg: 'rgba(245,158,11,0.1)', color: '#92400E' },
  'Not Interested': { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' },
  'In Progress': { bg: 'rgba(59,130,246,0.1)', color: '#1D4ED8' },
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const mask = (s?: string) => s ? `****${s.slice(-4)}` : '—';

const ProfileBar = ({ value }: { value: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 999 }}>
      <div style={{ height: 8, borderRadius: 999, width: `${value}%`, background: value === 100 ? '#22C55E' : value > 60 ? '#F59E0B' : '#EF4444', transition: 'width 0.4s' }} />
    </div>
    <span style={{ fontSize: 13, fontWeight: 700, color: value === 100 ? '#16a34a' : '#374151', minWidth: 36 }}>{value}%</span>
  </div>
);

const Field = ({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) => (
  <div>
    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
      {icon && <span style={{ marginRight: 4, verticalAlign: 'middle' }}>{icon}</span>}{label}
    </div>
    <div style={{ fontSize: 14, color: value ? '#111827' : '#d1d5db', fontWeight: value ? 500 : 400 }}>{value || '—'}</div>
  </div>
);

const Card = ({ title, icon, children, action }: { title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) => (
  <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
    <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, color: '#0a2463' }}>
        <span style={{ fontSize: 16, color: '#7C3AED' }}>{icon}</span>{title}
      </div>
      {action}
    </div>
    <div style={{ padding: 18 }}>{children}</div>
  </div>
);

const kycStepFromStatus = (s: string) => {
  switch (s) {
    case 'NOT_STARTED': return 0;
    case 'DOCUMENTS_PENDING': return 1;
    case 'UNDER_REVIEW': return 3;
    case 'COMPLETED': return 4;
    case 'REJECTED': return 1;
    default: return 0;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
const SubContractorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sc, setSC] = useState<SubContractorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ method: 'Call', outcome: 'Reached', notes: '' });
  const [addingLog, setAddingLog] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    salesApi
      .getSubContractorDetail(id)
      .then((res) => setSC(res.data))
      .catch(() => toast.error('Failed to load sub-contractor'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setAddingLog(true);
    try {
      await salesApi.addContactLog(id, logForm);
      toast.success('Contact log added');
      setShowLogForm(false);
      setLogForm({ method: 'Call', outcome: 'Reached', notes: '' });
      const res = await salesApi.getSubContractorDetail(id);
      setSC(res.data);
    } catch {
      toast.error('Failed to add log');
    } finally {
      setAddingLog(false);
    }
  };

  const scName = sc?.companyName || sc?.contactName || 'Sub-Contractor';

  if (loading) return <div className="page-loading">Loading sub-contractor…</div>;
  if (!sc) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 48, color: '#e5e7eb' }}>👤</div>
      <p style={{ color: '#6b7280' }}>Sub-contractor not found</p>
      <button className="btn-secondary" onClick={() => navigate('/sales/subcontractors')}>← Back</button>
    </div>
  );

  const kycStep = kycStepFromStatus(sc.kycStatus);
  return (
    <div style={{ paddingBottom: 40 }}>
      {/* ── Breadcrumb ── */}
      <button
        onClick={() => navigate('/sales/subcontractors')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#7C3AED', cursor: 'pointer', fontSize: 13, fontWeight: 500, marginBottom: 16, padding: 0 }}
      >
        <HiOutlineArrowLeft /> Back to Sub-Contractors
      </button>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#7C3AED' }}>
            {scName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0a2463' }}>{scName}</h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
              <span className={STATUS_BADGE[sc.status] || 'badge badge-gray'}>{sc.status}</span>
              <span className={KYC_BADGE[sc.kycStatus] || 'badge badge-gray'}>KYC: {sc.kycStatus?.replace(/_/g, ' ')}</span>
              {sc.linkedEpcId && (
                <span
                  style={{ fontSize: 12, color: '#1E5AAF', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}
                  onClick={() => sc.linkedEpcId && navigate(`/sales/companies/${sc.linkedEpcId._id}`)}
                >
                  🏢 {sc.linkedEpcId.companyName}
                </span>
              )}
              <span style={{ fontSize: 12, color: '#9ca3af' }}>· Added {fmtDate(sc.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Profile completion ── */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0a2463' }}>Profile Completion</div>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{sc.profileCompletion}% complete</span>
        </div>
        <ProfileBar value={sc.profileCompletion} />
      </div>

      {/* ── KYC Stepper ── */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>KYC Progress</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {KYC_STEPS.map((step, idx) => {
            const done = kycStep > idx;
            const active = kycStep === idx;
            return (
              <div key={step} style={{ display: 'flex', flex: idx < KYC_STEPS.length - 1 ? 1 : 0, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid', borderColor: done || active ? '#7C3AED' : '#e5e7eb', background: done ? '#7C3AED' : active ? 'rgba(124,58,237,0.1)' : 'white', color: done ? 'white' : active ? '#7C3AED' : '#d1d5db', fontSize: 13 }}>
                    {done ? <HiOutlineCheckCircle style={{ fontSize: 16 }} /> : <span style={{ fontSize: 11, fontWeight: 700 }}>{idx + 1}</span>}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: done || active ? '#7C3AED' : '#9ca3af', whiteSpace: 'nowrap', textAlign: 'center' }}>{step}</div>
                </div>
                {idx < KYC_STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: done ? '#7C3AED' : '#e5e7eb', margin: '0 4px', marginBottom: 22 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* ── Profile info ── */}
        <Card title="Profile Details" icon={<HiOutlineIdentification />}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Constitution" value={sc.constitutionType?.replace(/_/g, ' ')} />
            <Field label="Phone" value={sc.phone} icon={<HiOutlinePhone />} />
            <Field label="Email" value={sc.email} icon={<HiOutlineMail />} />
            <Field label="PAN" value={sc.pan} />
            <Field label="GST Number" value={sc.gstin} />
            <Field label="Aadhaar" value={sc.kycDocuments?.aadhaarCard?.fileUrl ? '●●●● ●●●● ●●●● (uploaded)' : undefined} />
          </div>
          {(sc.address || sc.registeredAddress?.city) && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
              <Field
                label="Address"
                value={
                  sc.address ||
                  [sc.registeredAddress?.street, sc.registeredAddress?.city, sc.registeredAddress?.state, sc.registeredAddress?.pincode]
                    .filter(Boolean).join(', ')
                }
                icon={<HiOutlineLocationMarker />}
              />
            </div>
          )}
        </Card>

        {/* ── Bank Details ── */}
        <Card title="Bank Details" icon={<HiOutlineCurrencyRupee />}>
          {!sc.bankDetails?.accountNumber ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af' }}>
              <HiOutlineCurrencyRupee style={{ fontSize: 32, margin: '0 auto 8px', display: 'block' }} />
              <div style={{ fontSize: 13 }}>Bank details not added yet</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Account Number" value={mask(sc.bankDetails.accountNumber)} />
              <Field label="IFSC Code" value={sc.bankDetails.ifscCode} />
              <Field label="Bank Name" value={sc.bankDetails.bankName} />
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Verification</div>
                {sc.bankDetails.verificationStatus === 'VERIFIED' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#15803D', fontWeight: 600 }}>
                    <HiOutlineCheckCircle /> Verified
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#DC2626', fontWeight: 600 }}>
                    <HiOutlineXCircle /> {sc.bankDetails.verificationStatus === 'FAILED' ? 'Verification Failed' : 'Pending'}
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── KYC Documents ── */}
      {sc.kycDocuments && Object.values(sc.kycDocuments).some((v) => v?.fileUrl) && (
        <div style={{ marginBottom: 16 }}>
          <Card title="KYC Documents" icon={<HiOutlineDocumentText />}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {([
                { key: 'panCard', label: 'PAN Card' },
                { key: 'aadhaarCard', label: 'Aadhaar Card' },
                { key: 'gstCertificate', label: 'GST Certificate' },
                { key: 'cancelledCheque', label: 'Cancelled Cheque' },
              ] as { key: keyof KYCDocs; label: string }[]).map(({ key, label }) => {
                const doc = sc.kycDocuments?.[key];
                if (!doc) return null;
                return (
                  <div key={key} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', background: '#f9fafb' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {doc.fileUrl ? (
                        doc.verified ? (
                          <HiOutlineCheckCircle style={{ color: '#22C55E', fontSize: 14 }} />
                        ) : (
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                        )
                      ) : (
                        <HiOutlineXCircle style={{ color: '#9ca3af', fontSize: 14 }} />
                      )}
                      <span style={{ fontSize: 11, color: doc.verified ? '#15803D' : doc.fileUrl ? '#92400E' : '#9ca3af', fontWeight: 600 }}>
                        {doc.verified ? 'Verified' : doc.fileUrl ? 'Uploaded – Pending Review' : 'Not Uploaded'}
                      </span>
                    </div>
                    {doc.fileUrl && (
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#1E5AAF', marginTop: 6, display: 'block' }}>
                        View document →
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── Contact Log ── */}
      <div style={{ marginBottom: 16 }}>
        <Card title="Contact Log" icon={<HiOutlineChat />} action={
          <button className="btn-sm btn-secondary" onClick={() => setShowLogForm(!showLogForm)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <HiOutlinePlus /> Log Contact
          </button>
        }>
          {/* Add log form */}
          {showLogForm && (
            <form onSubmit={handleAddLog} style={{ background: '#f8f5ff', border: '1px solid #e9d5ff', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Method</label>
                  <select value={logForm.method} onChange={(e) => setLogForm({ ...logForm, method: e.target.value })}>
                    {['Call', 'Email', 'WhatsApp', 'In-Person'].map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Outcome</label>
                  <select value={logForm.outcome} onChange={(e) => setLogForm({ ...logForm, outcome: e.target.value })}>
                    {['Reached', 'No Answer', 'Callback Requested', 'Not Interested', 'In Progress'].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Notes</label>
                <textarea value={logForm.notes} onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })} rows={2} placeholder="What was discussed?" style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-sm btn-secondary" onClick={() => setShowLogForm(false)}>Cancel</button>
                <button type="submit" className="btn-sm btn-primary" disabled={addingLog}>{addingLog ? 'Saving…' : 'Save Log'}</button>
              </div>
            </form>
          )}

          {/* Log list */}
          {(!sc.contactLog || sc.contactLog.length === 0) && !showLogForm ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>
              No contact logs yet. Log your first interaction above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(sc.contactLog || []).slice().reverse().map((log, i) => {
                const outcomeBadge = OUTCOME_BADGE[log.outcome];
                return (
                  <div key={log._id || i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: '#f9f9ff', border: '1px solid #f3f4f6', borderRadius: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${METHOD_COLORS[log.method]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, color: METHOD_COLORS[log.method] || '#6b7280' }}>
                      {log.method === 'Call' ? '📞' : log.method === 'Email' ? '✉️' : log.method === 'WhatsApp' ? '💬' : '🤝'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{log.method}</span>
                        {outcomeBadge && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: outcomeBadge.color, background: outcomeBadge.bg, padding: '2px 8px', borderRadius: 999 }}>
                            {log.outcome}
                          </span>
                        )}
                      </div>
                      {log.notes && <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{log.notes}</div>}
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                        {log.loggedBy?.name || 'Unknown'} · {fmtDate(log.loggedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Status History ── */}
      {sc.statusHistory && sc.statusHistory.length > 0 && (
        <Card title="Status History" icon={<HiOutlineBuildingOffice2 />}>
          <div className="timeline">
            {sc.statusHistory.slice().reverse().map((h, i) => (
              <div key={i} className="timeline-item" style={{ paddingBottom: 14 }}>
                <div className="timeline-dot" style={{ background: '#7C3AED' }} />
                <div style={{ paddingLeft: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{h.status?.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    {fmtDate(h.changedAt)}{h.changedBy ? ` · by ${h.changedBy.name}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SubContractorDetailPage;
