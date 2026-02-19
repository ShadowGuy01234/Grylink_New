import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { salesApi } from '../../api';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineLink,
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
} from 'react-icons/hi';
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineArrowRight,
} from 'react-icons/hi2';

// ─── Types ────────────────────────────────────────────────────────────────────
interface GryLink {
  _id: string;
  token: string;
  status: string;
  linkType: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  sentTo?: string;
  companyId?: { _id: string; companyName: string; ownerName: string; email: string };
  subContractorId?: { _id: string; companyName?: string; contactName?: string; email: string };
  createdBy?: { name: string };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active: {
    label: 'Active',
    icon: <HiOutlineClock style={{ fontSize: 12 }} />,
    color: '#1D4ED8',
    bg: 'rgba(59,130,246,0.1)',
    badge: 'badge badge-blue',
  },
  used: {
    label: 'Used ✓',
    icon: <HiOutlineCheckCircle style={{ fontSize: 12 }} />,
    color: '#15803D',
    bg: 'rgba(34,197,94,0.1)',
    badge: 'badge badge-green',
  },
  expired: {
    label: 'Expired',
    icon: <HiOutlineXCircle style={{ fontSize: 12 }} />,
    color: '#DC2626',
    bg: 'rgba(239,68,68,0.1)',
    badge: 'badge badge-red',
  },
};
const ALL_STATUSES = ['ALL', 'active', 'used', 'expired'];
const ALL_TYPES = ['ALL', 'company', 'subcontractor'];

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d?: string) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

const isExpiringSoon = (d?: string) => {
  if (!d) return false;
  return new Date(d).getTime() - Date.now() < 24 * 60 * 60 * 1000 && new Date(d).getTime() > Date.now();
};

// ─── Component ────────────────────────────────────────────────────────────────
const GryLinksPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [links, setLinks] = useState<GryLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const glStatus = searchParams.get('status') || 'ALL';
  const glType = searchParams.get('type') || 'ALL';
  const search = searchParams.get('search') || '';

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesApi.getGryLinks({
        status: glStatus !== 'ALL' ? glStatus : undefined,
        linkType: glType !== 'ALL' ? glType : undefined,
      });
      setLinks(res.data);
    } catch {
      toast.error('Failed to load GryLinks');
    } finally {
      setLoading(false);
    }
  }, [glStatus, glType]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const setParam = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams);
    if (val && val !== 'ALL') p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  const handleResend = async (link: GryLink, e: React.MouseEvent) => {
    e.stopPropagation();
    setResendingId(link._id);
    try {
      await salesApi.resendGryLink(link._id);
      toast.success('GryLink resent!');
      fetchLinks();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to resend');
    } finally {
      setResendingId(null);
    }
  };

  const handleViewEntity = (link: GryLink, e: React.MouseEvent) => {
    e.stopPropagation();
    if (link.linkType === 'company' && link.companyId) {
      navigate(`/sales/companies/${link.companyId._id}`);
    } else if (link.linkType === 'subcontractor' && link.subContractorId) {
      navigate(`/sales/subcontractors/${link.subContractorId._id}`);
    }
  };

  // Stats
  const stats = {
    active: links.filter((l) => l.status === 'active').length,
    used: links.filter((l) => l.status === 'used').length,
    expired: links.filter((l) => l.status === 'expired').length,
    expiringSoon: links.filter((l) => l.status === 'active' && isExpiringSoon(l.expiresAt)).length,
  };

  const filtered = links.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = l.linkType === 'company' ? l.companyId?.companyName : l.subContractorId?.contactName;
    const email = l.linkType === 'company' ? l.companyId?.email : l.subContractorId?.email;
    return name?.toLowerCase().includes(q) || email?.toLowerCase().includes(q) || l.sentTo?.toLowerCase().includes(q);
  });

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0a2463', margin: 0 }}>GryLinks</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {loading ? 'Loading…' : `${filtered.length} link${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* ── Stat pills ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['active', 'used', 'expired'] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <div
              key={s}
              onClick={() => setParam('status', glStatus === s ? 'ALL' : s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${glStatus === s ? cfg.color : '#e5e7eb'}`,
                background: glStatus === s ? cfg.bg : 'white',
                transition: 'all 0.15s',
                boxShadow: glStatus === s ? `0 2px 8px ${cfg.bg}` : '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ fontSize: 20, color: cfg.color }}>{cfg.icon}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color, lineHeight: 1.1 }}>{stats[s]}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginTop: 1 }}>{cfg.label}</div>
              </div>
            </div>
          );
        })}
        {stats.expiringSoon > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, border: '2px solid #F59E0B', background: 'rgba(245,158,11,0.08)' }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#92400E', lineHeight: 1.1 }}>{stats.expiringSoon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#92400E' }}>Expiring &lt;24h</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <HiOutlineSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16, pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={(e) => setParam('search', e.target.value)}
            placeholder="Search by name or email…"
            style={{ width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }}
          />
        </div>

        {/* Status */}
        <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', padding: 4, borderRadius: 10 }}>
          {ALL_STATUSES.map((s) => {
            const cfg = s !== 'ALL' ? STATUS_CONFIG[s as keyof typeof STATUS_CONFIG] : null;
            return (
              <button
                key={s}
                onClick={() => setParam('status', s)}
                style={{ padding: '6px 12px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: glStatus === s ? 'white' : 'transparent', color: glStatus === s ? (cfg?.color || '#1E5AAF') : '#6b7280', boxShadow: glStatus === s ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              >
                {s === 'ALL' ? 'All Status' : cfg?.label || s}
              </button>
            );
          })}
        </div>

        {/* Type */}
        <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', padding: 4, borderRadius: 10 }}>
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setParam('type', t)}
              style={{ padding: '6px 12px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 4, background: glType === t ? 'white' : 'transparent', color: glType === t ? '#1E5AAF' : '#6b7280', boxShadow: glType === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              {t === 'company' && <HiOutlineOfficeBuilding />}
              {t === 'subcontractor' && <HiOutlineUserGroup />}
              {t === 'ALL' ? 'All Types' : t === 'company' ? 'Companies' : 'Sub-Contractors'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div className="page-loading" style={{ minHeight: 300 }}>Loading GryLinks…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <HiOutlineLink style={{ fontSize: 48, color: '#e5e7eb', marginBottom: 12 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>No GryLinks found</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>GryLinks are generated when you create company leads</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Recipient', 'Type', 'Status', 'Sent At', 'Expires At', 'Used At', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((link) => {
                const hasEntity = (link.linkType === 'company' && link.companyId) || (link.linkType === 'subcontractor' && link.subContractorId);
                const entityName = link.linkType === 'company' ? link.companyId?.companyName : (link.subContractorId?.companyName || link.subContractorId?.contactName);
                const entityEmail = link.linkType === 'company' ? link.companyId?.email : link.subContractorId?.email;
                const cfg = STATUS_CONFIG[link.status as keyof typeof STATUS_CONFIG];
                const expSoon = link.status === 'active' && isExpiringSoon(link.expiresAt);
                const canResend = link.status === 'active' || link.status === 'expired';
                return (
                  <tr
                    key={link._id}
                    style={{ borderBottom: '1px solid #f3f4f6', background: expSoon ? 'rgba(245,158,11,0.03)' : undefined }}
                  >
                    {/* Recipient */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: link.linkType === 'company' ? 'rgba(30,90,175,0.1)' : 'rgba(124,58,237,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 700,
                          color: link.linkType === 'company' ? '#1E5AAF' : '#7C3AED',
                          flexShrink: 0,
                        }}>
                          {entityName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{entityName || link.sentTo || '—'}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{entityEmail || link.sentTo}</div>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999,
                        background: link.linkType === 'company' ? 'rgba(30,90,175,0.1)' : 'rgba(124,58,237,0.1)',
                        color: link.linkType === 'company' ? '#1E5AAF' : '#7C3AED',
                      }}>
                        {link.linkType === 'company' ? <HiOutlineOfficeBuilding /> : <HiOutlineUserGroup />}
                        {link.linkType === 'company' ? 'Company' : 'Sub-Contractor'}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      {cfg ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '4px 10px', borderRadius: 999 }}>
                          {cfg.icon}{cfg.label}
                        </span>
                      ) : (
                        <span className="badge badge-gray">{link.status}</span>
                      )}
                      {expSoon && (
                        <div style={{ fontSize: 10, color: '#D97706', marginTop: 3, fontWeight: 600 }}>⚠ Expires soon!</div>
                      )}
                    </td>

                    {/* Sent At */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 12, color: '#374151' }}>{fmtDate(link.createdAt)}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{fmtTime(link.createdAt)}</div>
                    </td>

                    {/* Expires At */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 12, color: expSoon ? '#D97706' : '#374151', fontWeight: expSoon ? 700 : 400 }}>
                        {fmtDate(link.expiresAt)}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{fmtTime(link.expiresAt)}</div>
                    </td>

                    {/* Used At */}
                    <td style={{ padding: '14px 16px' }}>
                      {link.usedAt ? (
                        <>
                          <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 500 }}>{fmtDate(link.usedAt)}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{fmtTime(link.usedAt)}</div>
                        </>
                      ) : (
                        <span style={{ fontSize: 12, color: '#d1d5db' }}>—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {canResend && (
                          <button
                            className="btn-sm btn-warning"
                            disabled={resendingId === link._id}
                            onClick={(e) => handleResend(link, e)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <HiOutlineRefresh style={{ fontSize: 11 }} />
                            {resendingId === link._id ? '…' : 'Resend'}
                          </button>
                        )}
                        {hasEntity && (
                          <button
                            className="btn-sm btn-secondary"
                            onClick={(e) => handleViewEntity(link, e)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            View <HiOutlineArrowRight style={{ fontSize: 11 }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GryLinksPage;
