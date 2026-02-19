import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { salesApi } from '../../api';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineMail,
} from 'react-icons/hi';
import {
  HiOutlineBuildingOffice2,
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Company {
  _id: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  createdAt: string;
  statusHistory?: { status: string; changedAt: string }[];
  gryLink?: { status: string; expiresAt: string; usedAt: string; createdAt: string };
  salesAgentId?: { name: string };
  scCount?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; badge: string; color: string }> = {
  LEAD_CREATED: { label: 'Lead Created', badge: 'badge badge-blue', color: '#3B82F6' },
  CREDENTIALS_CREATED: { label: 'Credentials Set', badge: 'badge badge-purple', color: '#8B5CF6' },
  DOCS_SUBMITTED: { label: 'Docs Submitted', badge: 'badge badge-yellow', color: '#F59E0B' },
  ACTION_REQUIRED: { label: 'Action Required', badge: 'badge badge-red', color: '#EF4444' },
  ACTIVE: { label: 'Active', badge: 'badge badge-green', color: '#22C55E' },
  DORMANT: { label: 'Dormant', badge: 'badge badge-gray', color: '#6B7280' },
  SUSPENDED: { label: 'Suspended', badge: 'badge badge-red', color: '#EF4444' },
};

const GRYLINK_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  active: { label: 'Link Active', color: '#15803D', bg: 'rgba(34,197,94,0.1)', icon: <HiOutlineCheckCircle /> },
  used: { label: 'Link Used ✓', color: '#1D4ED8', bg: 'rgba(59,130,246,0.1)', icon: <HiOutlineCheckCircle /> },
  expired: { label: 'Link Expired', color: '#DC2626', bg: 'rgba(239,68,68,0.1)', icon: <HiOutlineXCircle /> },
  none: { label: 'Not Sent', color: '#D97706', bg: 'rgba(245,158,11,0.1)', icon: <HiOutlineMail /> },
};

const ALL_STATUSES = ['ALL', 'LEAD_CREATED', 'CREDENTIALS_CREATED', 'DOCS_SUBMITTED', 'ACTION_REQUIRED', 'ACTIVE'];

const daysSince = (d?: string) => {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
};

const CompaniesListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ companyName: '', ownerName: '', email: '', phone: '', address: '' });

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'ALL';

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesApi.getLeads({
        search: search || undefined,
        status: status !== 'ALL' ? status : undefined,
      });
      setCompanies(res.data);
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleSearch = (val: string) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set('search', val); else p.delete('search');
    setSearchParams(p);
  };

  const handleStatusFilter = (s: string) => {
    const p = new URLSearchParams(searchParams);
    if (s !== 'ALL') p.set('status', s); else p.delete('status');
    setSearchParams(p);
  };

  const handleResendLink = async (company: Company, e: React.MouseEvent) => {
    e.stopPropagation();
    setResendingId(company._id);
    try {
      await salesApi.resendCompanyLink(company._id);
      toast.success(`GryLink resent to ${company.email}`);
      fetchCompanies();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to resend');
    } finally {
      setResendingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await salesApi.createLead(form);
      toast.success('Lead created! Onboarding link sent.');
      setShowCreateModal(false);
      setForm({ companyName: '', ownerName: '', email: '', phone: '', address: '' });
      fetchCompanies();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create lead');
    } finally {
      setCreating(false);
    }
  };

  const getGryLinkStatus = (company: Company) => {
    if (!company.gryLink) return 'none';
    return company.gryLink.status;
  };

  const getDaysInCurrentStatus = (company: Company) => {
    const last = company.statusHistory?.slice(-1)[0]?.changedAt || company.createdAt;
    return daysSince(last);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0a2463', margin: 0 }}>Companies</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {loading ? 'Loading…' : `${companies.length} company${companies.length !== 1 ? 'ies' : 'y'}`}
            {status !== 'ALL' && ` · filtered by ${STATUS_CONFIG[status]?.label || status}`}
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <HiOutlinePlus style={{ fontSize: 16 }} />
          New Lead
        </button>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {/* Search */}
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <HiOutlineSearch
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              fontSize: 16,
              pointerEvents: 'none',
            }}
          />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by company, owner, email or phone…"
            style={{
              width: '100%',
              paddingLeft: 38,
              paddingRight: 14,
              paddingTop: 10,
              paddingBottom: 10,
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              fontSize: 14,
              outline: 'none',
              background: 'white',
              color: '#111827',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', padding: 4, borderRadius: 10 }}>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: status === s ? 'white' : 'transparent',
                color: status === s ? (STATUS_CONFIG[s]?.color || '#1E5AAF') : '#6b7280',
                boxShadow: status === s ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {loading ? (
          <div className="page-loading" style={{ minHeight: 300 }}>Loading companies…</div>
        ) : companies.length === 0 ? (
          <div
            style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}
          >
            <HiOutlineBuildingOffice2 style={{ fontSize: 48, color: '#e5e7eb', marginBottom: 12 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>No companies found</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>
              {search || status !== 'ALL' ? 'Try adjusting your filters' : 'Create your first company lead to get started'}
            </div>
            {!search && status === 'ALL' && (
              <button
                className="btn-primary"
                style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={() => setShowCreateModal(true)}
              >
                <HiOutlinePlus /> Create Lead
              </button>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Company', 'Owner', 'Contact', 'Status', 'GryLink', 'In Stage', 'SCs', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => {
                const glStatus = getGryLinkStatus(company);
                const gl = GRYLINK_CONFIG[glStatus];
                const daysInStatus = getDaysInCurrentStatus(company);
                const isStuck = (daysInStatus ?? 0) > 7 && company.status !== 'ACTIVE';
                return (
                  <tr
                    key={company._id}
                    onClick={() => navigate(`/sales/companies/${company._id}`)}
                    style={{
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')}
                  >
                    {/* Company */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background: 'rgba(30,90,175,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#1E5AAF',
                            flexShrink: 0,
                          }}
                        >
                          {company.companyName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{company.companyName}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                            {new Date(company.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{company.ownerName}</td>

                    {/* Contact */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 12, color: '#374151' }}>{company.email}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{company.phone}</div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <span className={STATUS_CONFIG[company.status]?.badge || 'badge badge-gray'} style={{ fontSize: 11 }}>
                        {STATUS_CONFIG[company.status]?.label || company.status}
                      </span>
                    </td>

                    {/* GryLink status */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 11,
                          fontWeight: 600,
                          color: gl.color,
                          background: gl.bg,
                          padding: '3px 8px',
                          borderRadius: 999,
                        }}
                      >
                        {gl.icon}
                        {gl.label}
                      </span>
                      {glStatus === 'active' && company.gryLink?.expiresAt && (
                        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                          exp {new Date(company.gryLink.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </td>

                    {/* Days in stage */}
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: isStuck ? '#DC2626' : '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {isStuck && <HiOutlineClock style={{ fontSize: 13, color: '#EF4444' }} />}
                        {daysInStatus !== null ? `${daysInStatus}d` : '—'}
                      </span>
                    </td>

                    {/* SC count */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                        {company.scCount ?? 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {(glStatus === 'expired' || glStatus === 'none') && company.status !== 'ACTIVE' && (
                          <button
                            className="btn-sm btn-warning"
                            disabled={resendingId === company._id}
                            onClick={(e) => handleResendLink(company, e)}
                            title="Resend GryLink"
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <HiOutlineRefresh style={{ fontSize: 12 }} />
                            {resendingId === company._id ? '…' : 'Resend'}
                          </button>
                        )}
                        <button
                          className="btn-sm btn-secondary"
                          onClick={(e) => { e.stopPropagation(); navigate(`/sales/companies/${company._id}`); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <HiOutlineArrowRight style={{ fontSize: 12 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create Lead Modal ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(30,90,175,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E5AAF', fontSize: 20 }}>
                <HiOutlineBuildingOffice2 />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18 }}>Create Company Lead</h2>
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>GryLink email will be sent automatically</p>
              </div>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label>Company Name *</label>
                  <input required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="ABC Infra Pvt Ltd" />
                </div>
                <div className="form-group">
                  <label>Owner Name *</label>
                  <input required value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Rahul Sharma" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="owner@company.com" />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="form-group">
                <label>Address *</label>
                <textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full registered address…" rows={2} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating…' : '✉️ Create & Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesListPage;
