import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { salesApi } from '../../api';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch,
  HiOutlinePhone,
  HiOutlineMail,
} from 'react-icons/hi';
import {
  HiOutlineUserGroup,
  HiOutlineArrowRight,
  HiOutlineClock,
} from 'react-icons/hi2';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SubContractor {
  _id: string;
  companyName?: string;
  contactName?: string;
  email: string;
  phone: string;
  constitutionType?: string;
  status: string;
  kycStatus: string;
  profileCompletion: number;
  contactedAt?: string;
  lastContactedAt?: string;
  createdAt: string;
  linkedEpcId?: { _id: string; companyName: string };
  contactLog?: { loggedAt: string }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  PENDING: { label: 'Pending', badge: 'badge badge-gray' },
  ACTIVE: { label: 'Active', badge: 'badge badge-green' },
  SUSPENDED: { label: 'Suspended', badge: 'badge badge-red' },
  DORMANT: { label: 'Dormant', badge: 'badge badge-yellow' },
};

const KYC_CONFIG: Record<string, { label: string; badge: string; pct: number }> = {
  NOT_STARTED: { label: 'Not Started', badge: 'badge badge-gray', pct: 0 },
  PENDING: { label: 'Pending', badge: 'badge badge-gray', pct: 10 },
  DOCS_UPLOADED: { label: 'Docs Uploaded', badge: 'badge badge-blue', pct: 60 },
  IN_REVIEW: { label: 'In Review', badge: 'badge badge-yellow', pct: 80 },
  APPROVED: { label: 'Approved', badge: 'badge badge-green', pct: 100 },
  REJECTED: { label: 'Rejected', badge: 'badge badge-red', pct: 0 },
};

const ALL_STATUSES = ['ALL', 'PENDING', 'ACTIVE', 'SUSPENDED', 'DORMANT'];
const ALL_KYC = ['ALL', 'NOT_STARTED', 'PENDING', 'DOCS_UPLOADED', 'IN_REVIEW', 'APPROVED', 'REJECTED'];
const KYC_SHORT: Record<string, string> = { NOT_STARTED: 'Not Started', PENDING: 'Pending', DOCS_UPLOADED: 'Docs Up', IN_REVIEW: 'In Review', APPROVED: 'Approved', REJECTED: 'Rejected' };

const daysSince = (d?: string) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null;

const ProfileBar = ({ value }: { value: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 999, minWidth: 56 }}>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          width: `${value}%`,
          background: value === 100 ? '#22C55E' : value > 60 ? '#F59E0B' : '#EF4444',
        }}
      />
    </div>
    <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', minWidth: 28, textAlign: 'right' }}>{value}%</span>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
const SubContractorsListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [subContractors, setSubContractors] = useState<SubContractor[]>([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'ALL';
  const kycStatus = searchParams.get('kycStatus') || 'ALL';

  const fetchSCs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesApi.getSubContractors({
        search: search || undefined,
        status: status !== 'ALL' ? status : undefined,
        kycStatus: kycStatus !== 'ALL' ? kycStatus : undefined,
      });
      setSubContractors(res.data);
    } catch {
      toast.error('Failed to load sub-contractors');
    } finally {
      setLoading(false);
    }
  }, [search, status, kycStatus]);

  useEffect(() => { fetchSCs(); }, [fetchSCs]);

  const setParam = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams);
    if (val && val !== 'ALL') p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  const pending = subContractors.filter((sc) => !sc.contactedAt).length;

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0a2463', margin: 0 }}>Sub-Contractors</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {loading ? 'Loading…' : `${subContractors.length} sub-contractor${subContractors.length !== 1 ? 's' : ''}`}
            {pending > 0 && <span style={{ color: '#DC2626', marginLeft: 4, fontWeight: 600 }}> · {pending} not contacted</span>}
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {/* Search */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <HiOutlineSearch
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16, pointerEvents: 'none' }}
          />
          <input
            value={search}
            onChange={(e) => setParam('search', e.target.value)}
            placeholder="Search name, email, phone, company…"
            style={{ width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10, border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', padding: 4, borderRadius: 10 }}>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setParam('status', s)}
              style={{ padding: '6px 12px', borderRadius: 7, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: status === s ? 'white' : 'transparent', color: status === s ? '#1E5AAF' : '#6b7280', boxShadow: status === s ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>

        {/* KYC filter */}
        <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', padding: 4, borderRadius: 10 }}>
          {ALL_KYC.map((k) => (
            <button
              key={k}
              onClick={() => setParam('kycStatus', k)}
              style={{ padding: '6px 10px', borderRadius: 7, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: kycStatus === k ? 'white' : 'transparent', color: kycStatus === k ? '#7C3AED' : '#6b7280', boxShadow: kycStatus === k ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              {k === 'ALL' ? 'All KYC' : KYC_SHORT[k] || k}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div className="page-loading" style={{ minHeight: 300 }}>Loading sub-contractors…</div>
        ) : subContractors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <HiOutlineUserGroup style={{ fontSize: 48, color: '#e5e7eb', marginBottom: 12 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>No sub-contractors found</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>
              {search || status !== 'ALL' || kycStatus !== 'ALL' ? 'Try adjusting your filters' : 'Sub-contractors will appear here as companies sign up'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Sub-Contractor', 'Linked EPC', 'Contact', 'Status', 'KYC Stage', 'Profile', 'Last Contact', ''].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subContractors.map((sc) => {
                const lastContactDays = daysSince(sc.contactedAt);
                const neverContacted = !sc.contactedAt;
                const stale = lastContactDays !== null && lastContactDays > 14;
                return (
                  <tr
                    key={sc._id}
                    onClick={() => navigate(`/sales/subcontractors/${sc._id}`)}
                    style={{ cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')}
                  >
                    {/* Name */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#7C3AED', flexShrink: 0 }}>
                          {(sc.companyName || sc.contactName || sc.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{sc.companyName || sc.contactName}</div>
                        {sc.constitutionType && (
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{sc.constitutionType}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Linked EPC */}
                    <td style={{ padding: '14px 16px', fontSize: 13, color: sc.linkedEpcId ? '#374151' : '#d1d5db', fontWeight: sc.linkedEpcId ? 500 : 400 }}>
                      {sc.linkedEpcId?.companyName || '—'}
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151' }}>
                        <HiOutlineMail style={{ color: '#9ca3af' }} /> {sc.email}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                        <HiOutlinePhone style={{ color: '#c4b5fd' }} /> {sc.phone}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <span className={STATUS_CONFIG[sc.status]?.badge || 'badge badge-gray'} style={{ fontSize: 11 }}>
                        {STATUS_CONFIG[sc.status]?.label || sc.status}
                      </span>
                    </td>

                    {/* KYC */}
                    <td style={{ padding: '14px 16px' }}>
                      <span className={KYC_CONFIG[sc.kycStatus]?.badge || 'badge badge-gray'} style={{ fontSize: 11 }}>
                        {KYC_CONFIG[sc.kycStatus]?.label || sc.kycStatus}
                      </span>
                    </td>

                    {/* Profile completion */}
                    <td style={{ padding: '14px 16px', minWidth: 120 }}>
                      <ProfileBar value={sc.profileCompletion} />
                    </td>

                    {/* Last contact */}
                    <td style={{ padding: '14px 16px' }}>
                      {neverContacted ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <HiOutlineClock /> Never
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: stale ? '#D97706' : '#6b7280', fontWeight: stale ? 600 : 400, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {stale && <HiOutlineClock style={{ color: '#F59E0B' }} />}
                          {lastContactDays !== null ? `${lastContactDays}d ago` : '—'}
                        </span>
                      )}
                    </td>

                    {/* Arrow */}
                    <td style={{ padding: '14px 16px' }}>
                      <HiOutlineArrowRight style={{ color: '#9ca3af', fontSize: 16 }} />
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

export default SubContractorsListPage;
