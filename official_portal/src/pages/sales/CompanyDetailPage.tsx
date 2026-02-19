import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salesApi } from '../../api';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft,
  HiOutlineRefresh,
  HiOutlinePaperAirplane,
  HiOutlineOfficeBuilding,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineDocumentText,
  HiOutlineChat,
  HiOutlinePlus,
  HiOutlineUserGroup,
} from 'react-icons/hi';
import {
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
} from 'react-icons/hi2';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Company {
  _id: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  cin?: string;
  gstin?: string;
  pan?: string;
  status: string;
  createdAt: string;
  statusHistory?: { status: string; changedAt: string; changedBy?: { name: string } }[];
  gryLink?: { status: string; expiresAt: string; usedAt?: string; createdAt: string; token?: string };
  salesAgentId?: { name: string; email: string };
  salesNotes?: { _id: string; text: string; addedBy?: { name: string }; addedAt: string }[];
  scCount?: number;
}

interface SubContractor {
  _id: string;
  companyName?: string;
  contactName?: string;
  email: string;
  phone: string;
  status: string;
  kycStatus: string;
  profileCompletion: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_STEPS = ['LEAD_CREATED', 'CREDENTIALS_CREATED', 'DOCS_SUBMITTED', 'ACTIVE'];
const STATUS_LABELS: Record<string, string> = {
  LEAD_CREATED: 'Lead Created',
  CREDENTIALS_CREATED: 'Credentials Set',
  DOCS_SUBMITTED: 'Docs Submitted',
  ACTION_REQUIRED: 'Action Required',
  ACTIVE: 'Active',
  DORMANT: 'Dormant',
  SUSPENDED: 'Suspended',
};
const STATUS_BADGE: Record<string, string> = {
  LEAD_CREATED: 'badge badge-blue',
  CREDENTIALS_CREATED: 'badge badge-purple',
  DOCS_SUBMITTED: 'badge badge-yellow',
  ACTION_REQUIRED: 'badge badge-red',
  ACTIVE: 'badge badge-green',
  DORMANT: 'badge badge-gray',
  SUSPENDED: 'badge badge-red',
};
const KYC_BADGE: Record<string, string> = {
  PENDING: 'badge badge-gray',
  IN_REVIEW: 'badge badge-yellow',
  APPROVED: 'badge badge-green',
  REJECTED: 'badge badge-red',
};
const SC_STATUS_BADGE: Record<string, string> = {
  PENDING: 'badge badge-gray',
  ACTIVE: 'badge badge-green',
  SUSPENDED: 'badge badge-red',
};

const pct = (v: number) => `${v}%`;
const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const ProfileCompletionBar = ({ value }: { value: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 999 }}>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          width: pct(value),
          background: value === 100 ? '#22C55E' : value > 60 ? '#F59E0B' : '#EF4444',
          transition: 'width 0.4s',
        }}
      />
    </div>
    <span style={{ fontSize: 11, fontWeight: 700, color: value === 100 ? '#16a34a' : '#374151', minWidth: 30 }}>
      {value}%
    </span>
  </div>
);

// ─── Info Field ───────────────────────────────────────────────────────────────
const Field = ({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) => (
  <div>
    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
      {icon && <span style={{ marginRight: 4, verticalAlign: 'middle' }}>{icon}</span>}
      {label}
    </div>
    <div style={{ fontSize: 14, color: value ? '#111827' : '#d1d5db', fontWeight: value ? 500 : 400 }}>
      {value || '—'}
    </div>
  </div>
);

// ─── Card Wrapper ─────────────────────────────────────────────────────────────
const Card = ({ title, icon, children, action }: { title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) => (
  <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
    <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, color: '#0a2463' }}>
        <span style={{ fontSize: 16, color: '#1E5AAF' }}>{icon}</span>
        {title}
      </div>
      {action}
    </div>
    <div style={{ padding: 18 }}>{children}</div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
const CompanyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [subContractors, setSubContractors] = useState<SubContractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showNoteBox, setShowNoteBox] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([salesApi.getLeadDetail(id), salesApi.getLeadSubContractors(id)])
      .then(([compRes, scRes]) => {
        setCompany(compRes.data);
        setSubContractors(scRes.data);
      })
      .catch(() => toast.error('Failed to load company'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleResend = async () => {
    if (!id) return;
    setResending(true);
    try {
      await salesApi.resendCompanyLink(id);
      toast.success('GryLink resent!');
      const res = await salesApi.getLeadDetail(id);
      setCompany(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteText.trim()) return;
    setAddingNote(true);
    try {
      await salesApi.addCompanyNote(id, noteText.trim());
      toast.success('Note added');
      setNoteText('');
      setShowNoteBox(false);
      const res = await salesApi.getLeadDetail(id);
      setCompany(res.data);
    } catch {
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) return <div className="page-loading">Loading company…</div>;
  if (!company) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 48, color: '#e5e7eb' }}>🏢</div>
      <p style={{ color: '#6b7280' }}>Company not found</p>
      <button className="btn-secondary" onClick={() => navigate('/sales/companies')}>← Back</button>
    </div>
  );

  const currentStepIdx = STATUS_STEPS.indexOf(company.status);
  const glStatus = company.gryLink?.status;
  const glExpired = glStatus === 'expired';
  const glNone = !company.gryLink;
  const canResend = (glExpired || glNone) && company.status !== 'ACTIVE';

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* ── Breadcrumb nav ── */}
      <button
        onClick={() => navigate('/sales/companies')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#1E5AAF', cursor: 'pointer', fontSize: 13, fontWeight: 500, marginBottom: 16, padding: 0 }}
      >
        <HiOutlineArrowLeft /> Back to Companies
      </button>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(30,90,175,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#1E5AAF' }}>
            {company.companyName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0a2463' }}>{company.companyName}</h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <span className={STATUS_BADGE[company.status] || 'badge badge-gray'}>{STATUS_LABELS[company.status] || company.status}</span>
              {company.salesAgentId && (
                <span style={{ fontSize: 12, color: '#6b7280' }}>Managed by {company.salesAgentId.name}</span>
              )}
              <span style={{ fontSize: 12, color: '#9ca3af' }}>· Added {fmtDate(company.createdAt)}</span>
            </div>
          </div>
        </div>
        {canResend && (
          <button
            className="btn-primary"
            disabled={resending}
            onClick={handleResend}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <HiOutlineRefresh />
            {resending ? 'Sending…' : 'Resend GryLink'}
          </button>
        )}
      </div>

      {/* ── Status stepper ── */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>
          Onboarding Progress
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STATUS_STEPS.map((s, idx) => {
            const done = currentStepIdx > idx || (currentStepIdx === -1 && company.status === 'ACTIVE');
            const active = currentStepIdx === idx;
            const histEntry = company.statusHistory?.find((h) => h.status === s);
            return (
              <div key={s} style={{ display: 'flex', flex: idx < STATUS_STEPS.length - 1 ? 1 : 0, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 700,
                      border: '2px solid',
                      borderColor: done || active ? '#1E5AAF' : '#e5e7eb',
                      background: done ? '#1E5AAF' : active ? 'rgba(30,90,175,0.1)' : 'white',
                      color: done ? 'white' : active ? '#1E5AAF' : '#d1d5db',
                    }}
                  >
                    {done ? <HiOutlineCheckCircle style={{ fontSize: 18 }} /> : <span style={{ fontSize: 12 }}>{idx + 1}</span>}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: done || active ? '#1E5AAF' : '#9ca3af', whiteSpace: 'nowrap' }}>
                      {STATUS_LABELS[s]}
                    </div>
                    {histEntry?.changedAt && (
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>
                        {new Date(histEntry.changedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </div>
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: done ? '#1E5AAF' : '#e5e7eb', margin: '0 4px', marginBottom: 28 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2-col grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* ── Company Info ── */}
        <Card title="Company Info" icon={<HiOutlineOfficeBuilding />}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Owner" value={company.ownerName} />
            <Field label="Phone" value={company.phone} icon={<HiOutlinePhone />} />
            <Field label="Email" value={company.email} icon={<HiOutlineMail />} />
            <Field label="CIN" value={company.cin} />
            <Field label="GST Number" value={company.gstin} />
            <Field label="PAN" value={company.pan} />
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
            <Field label="Address" value={company.address} icon={<HiOutlineLocationMarker />} />
          </div>
        </Card>

        {/* ── GryLink Card ── */}
        <Card title="GryLink Status" icon={<HiOutlinePaperAirplane />}>
          {!company.gryLink ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af' }}>
              <HiOutlineMail style={{ fontSize: 32, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
              <div style={{ fontSize: 13 }}>No GryLink generated yet</div>
              <button className="btn-primary" style={{ marginTop: 12 }} onClick={handleResend} disabled={resending}>
                Send GryLink
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>Link Status</div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    background: glStatus === 'used' ? 'rgba(34,197,94,0.1)' : glStatus === 'active' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                    color: glStatus === 'used' ? '#15803D' : glStatus === 'active' ? '#1D4ED8' : '#DC2626',
                  }}
                >
                  {glStatus === 'used' ? '✓ Used' : glStatus === 'active' ? '◉ Active' : '✗ Expired'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Sent At" value={fmtDate(company.gryLink.createdAt)} />
                <Field label="Expires At" value={fmtDate(company.gryLink.expiresAt)} />
                {company.gryLink.usedAt && <Field label="Used At" value={fmtDate(company.gryLink.usedAt)} />}
              </div>
              {canResend && (
                <button className="btn-warning btn-sm" onClick={handleResend} disabled={resending} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <HiOutlineRefresh /> Resend GryLink
                </button>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* ── Sub-Contractors table ── */}
      <Card title={`Linked Sub-Contractors (${subContractors.length})`} icon={<HiOutlineUserGroup />} action={
        <button className="btn-sm btn-secondary" onClick={() => navigate('/sales/subcontractors')} style={{ fontSize: 11 }}>
          View All <HiOutlineArrowRight style={{ verticalAlign: 'middle' }} />
        </button>
      }>
        {subContractors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>
            No sub-contractors linked yet
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Name', 'Contact', 'Status', 'KYC', 'Profile'].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subContractors.map((sc) => (
                <tr key={sc._id}
                  onClick={() => navigate(`/sales/subcontractors/${sc._id}`)}
                  style={{ cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: '#111827' }}>{sc.companyName || sc.contactName}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, color: '#374151' }}>{sc.email}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{sc.phone}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}><span className={SC_STATUS_BADGE[sc.status] || 'badge badge-gray'} style={{ fontSize: 10 }}>{sc.status}</span></td>
                  <td style={{ padding: '10px 12px' }}><span className={KYC_BADGE[sc.kycStatus] || 'badge badge-gray'} style={{ fontSize: 10 }}>{sc.kycStatus}</span></td>
                  <td style={{ padding: '10px 12px', minWidth: 100 }}><ProfileCompletionBar value={sc.profileCompletion} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* ── Notes ── */}
      <div style={{ marginTop: 16 }}>
        <Card title="Internal Notes" icon={<HiOutlineChat />} action={
          <button className="btn-sm btn-secondary" onClick={() => setShowNoteBox(!showNoteBox)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <HiOutlinePlus /> Add Note
          </button>
        }>
          {showNoteBox && (
            <form onSubmit={handleAddNote} style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, marginBottom: 14 }}>
              <textarea
                autoFocus
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write a note…"
                rows={2}
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-sm btn-secondary" onClick={() => { setShowNoteBox(false); setNoteText(''); }}>Cancel</button>
                <button type="submit" className="btn-sm btn-primary" disabled={addingNote || !noteText.trim()}>
                  {addingNote ? 'Adding…' : 'Add Note'}
                </button>
              </div>
            </form>
          )}
          {(!company.salesNotes || company.salesNotes.length === 0) && !showNoteBox ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af', fontSize: 13 }}>
              No notes yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(company.salesNotes || []).slice().reverse().map((n) => (
                <div key={n._id} style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                    {n.addedBy?.name || 'Unknown'} · {fmtDate(n.addedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Audit trail ── */}
      {company.statusHistory && company.statusHistory.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Card title="Status History" icon={<HiOutlineDocumentText />}>
            <div className="timeline">
              {company.statusHistory.slice().reverse().map((h, i) => (
                <div key={i} className="timeline-item" style={{ paddingBottom: 14 }}>
                  <div className="timeline-dot" style={{ background: '#1E5AAF' }} />
                  <div style={{ paddingLeft: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{STATUS_LABELS[h.status] || h.status}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                      {fmtDate(h.changedAt)}{h.changedBy ? ` · by ${h.changedBy.name}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CompanyDetailPage;
