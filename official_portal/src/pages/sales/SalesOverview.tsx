import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineBuildingOffice2,
  HiOutlineUsers,
  HiOutlineLink,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineBell,
} from 'react-icons/hi2';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totals: {
    companies: number;
    activeCompanies: number;
    subContractors: number;
    pendingContact: number;
    activeGryLinks: number;
    expiringSoon: number;
  };
  funnel: { stage: string; count: number }[];
  monthOverMonth: { thisMonth: number; lastMonth: number };
  stuckCompanies: any[];
  recentActivity: any[];
  expiringSoon: any[];
  gryLinkStats: { active: number; used: number; expired: number };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STAGE_LABELS: Record<string, string> = {
  LEAD_CREATED: 'Lead Created',
  CREDENTIALS_CREATED: 'Credentials Set',
  DOCS_SUBMITTED: 'Docs Submitted',
  ACTION_REQUIRED: 'Action Required',
  ACTIVE: 'Active',
};

const STAGE_COLORS: Record<string, string> = {
  LEAD_CREATED: '#3B82F6',
  CREDENTIALS_CREATED: '#8B5CF6',
  DOCS_SUBMITTED: '#F59E0B',
  ACTION_REQUIRED: '#EF4444',
  ACTIVE: '#22C55E',
};

const STATUS_BADGE: Record<string, string> = {
  LEAD_CREATED: 'badge badge-blue',
  CREDENTIALS_CREATED: 'badge badge-purple',
  DOCS_SUBMITTED: 'badge badge-yellow',
  ACTION_REQUIRED: 'badge badge-red',
  ACTIVE: 'badge badge-green',
  company: 'badge badge-blue',
  subcontractor: 'badge badge-purple',
};

const timeSince = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

// ─── Subcomponents ───────────────────────────────────────────────────────────

const KpiCard = ({
  label,
  value,
  icon,
  sub,
  color = 'blue',
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  sub?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  onClick?: () => void;
}) => {
  const colors = {
    blue: { bg: 'rgba(59,130,246,0.08)', icon: '#3B82F6', val: '#1E5AAF' },
    green: { bg: 'rgba(34,197,94,0.08)', icon: '#22C55E', val: '#15803D' },
    yellow: { bg: 'rgba(245,158,11,0.08)', icon: '#F59E0B', val: '#D97706' },
    red: { bg: 'rgba(239,68,68,0.08)', icon: '#EF4444', val: '#DC2626' },
    purple: { bg: 'rgba(139,92,246,0.08)', icon: '#8B5CF6', val: '#7C3AED' },
  };
  const c = colors[color];

  return (
    <div
      onClick={onClick}
      className="kpi-card"
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: c.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: c.icon,
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: c.val, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
};

const FunnelBar = ({ stages }: { stages: { stage: string; count: number }[] }) => {
  const max = Math.max(...stages.map((s) => s.count), 1);
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        padding: '20px 24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0a2463', margin: 0 }}>Company Onboarding Funnel</h3>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>All companies by stage</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {stages.map(({ stage, count }) => (
          <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 130, fontSize: 12, fontWeight: 500, color: '#374151', flexShrink: 0 }}>
              {STAGE_LABELS[stage] || stage}
            </div>
            <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 8, height: 28, overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.max((count / max) * 100, count > 0 ? 4 : 0)}%`,
                  background: STAGE_COLORS[stage] || '#3B82F6',
                  borderRadius: 8,
                  transition: 'width 0.6s ease',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 10,
                }}
              >
                {count > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{count}</span>
                )}
              </div>
              {count === 0 && (
                <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9ca3af' }}>
                  0
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const SalesOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ companyName: '', ownerName: '', email: '', phone: '', address: '' });

  const fetchStats = async () => {
    try {
      const res = await salesApi.getDashboard();
      setStats(res.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await salesApi.createLead(form);
      toast.success('Company lead created! Onboarding link sent via email.');
      setShowCreateModal(false);
      setForm({ companyName: '', ownerName: '', email: '', phone: '', address: '' });
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create lead');
    } finally {
      setCreating(false);
    }
  };

  const mom = stats?.monthOverMonth;
  const momDelta = mom ? mom.thisMonth - mom.lastMonth : 0;
  const momPct = mom?.lastMonth
    ? Math.round((momDelta / mom.lastMonth) * 100)
    : mom?.thisMonth
    ? 100
    : 0;

  if (loading) return <div className="page-loading">Loading dashboard…</div>;

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0a2463', margin: 0 }}>
            Sales Overview
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            Welcome back, {user?.name?.split(' ')[0]} — here's your pipeline at a glance
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <HiOutlinePlus style={{ fontSize: 16 }} />
          New Company Lead
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}
      >
        <KpiCard
          label="Total Companies"
          value={stats?.totals.companies ?? 0}
          icon={<HiOutlineBuildingOffice2 />}
          sub={`${stats?.totals.activeCompanies ?? 0} active`}
          color="blue"
          onClick={() => navigate('/sales/companies')}
        />
        <KpiCard
          label="Active Companies"
          value={stats?.totals.activeCompanies ?? 0}
          icon={<HiOutlineCheckCircle />}
          color="green"
          onClick={() => navigate('/sales/companies?status=ACTIVE')}
        />
        <KpiCard
          label="Sub-Contractors"
          value={stats?.totals.subContractors ?? 0}
          icon={<HiOutlineUsers />}
          sub={`${stats?.totals.pendingContact ?? 0} need contact`}
          color="purple"
          onClick={() => navigate('/sales/subcontractors')}
        />
        <KpiCard
          label="Active GryLinks"
          value={stats?.totals.activeGryLinks ?? 0}
          icon={<HiOutlineLink />}
          sub={
            (stats?.totals.expiringSoon ?? 0) > 0
              ? `⚠️ ${stats?.totals.expiringSoon} expiring soon`
              : 'All links healthy'
          }
          color={(stats?.totals.expiringSoon ?? 0) > 0 ? 'yellow' : 'blue'}
          onClick={() => navigate('/sales/grylinks')}
        />
        <KpiCard
          label="Pending Contact"
          value={stats?.totals.pendingContact ?? 0}
          icon={<HiOutlineBell />}
          sub="Sub-contractors not yet contacted"
          color={(stats?.totals.pendingContact ?? 0) > 0 ? 'red' : 'green'}
          onClick={() => navigate('/sales/subcontractors?contacted=false')}
        />
      </div>

      {/* ── Row: Funnel + This Month + Action Required ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 24 }}>
        {/* Funnel */}
        {stats?.funnel && <FunnelBar stages={stats.funnel} />}

        {/* Right column: Month stat + Action Required */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Month-over-month */}
          <div
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 14,
              padding: '18px 20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              This Month
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#0a2463' }}>{mom?.thisMonth ?? 0}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>new company leads</div>
            {mom && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: momDelta >= 0 ? '#15803D' : '#DC2626',
                }}
              >
                {momDelta >= 0 ? <HiOutlineArrowTrendingUp /> : <HiOutlineArrowTrendingDown />}
                {momDelta >= 0 ? '+' : ''}{momPct}% vs last month ({mom.lastMonth})
              </div>
            )}
          </div>

          {/* GryLink status pills */}
          <div
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 14,
              padding: '18px 20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0a2463', marginBottom: 14 }}>GryLink Status</div>
            {[
              { label: 'Active', count: stats?.gryLinkStats.active ?? 0, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
              { label: 'Used', count: stats?.gryLinkStats.used ?? 0, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
              { label: 'Expired', count: stats?.gryLinkStats.expired ?? 0, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
            ].map((row) => (
              <div
                key={row.label}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}
              >
                <span style={{ fontSize: 13, color: '#374151' }}>{row.label}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: row.color,
                    background: row.bg,
                    padding: '3px 10px',
                    borderRadius: 999,
                  }}
                >
                  {row.count}
                </span>
              </div>
            ))}
            <button
              onClick={() => navigate('/sales/grylinks')}
              style={{ width: '100%', marginTop: 8, fontSize: 12, color: '#1E5AAF', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View all GryLinks <HiOutlineArrowRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── Row: Action Required + Recent Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Action Required — stuck companies */}
        <div
          style={{
            background: 'white',
            border: '1px solid #fecaca',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #FEF2F2, #FFF7ED)',
              padding: '14px 20px',
              borderBottom: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <HiOutlineExclamationTriangle style={{ color: '#EF4444', fontSize: 18 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#7f1d1d' }}>
              Action Required ({stats?.stuckCompanies?.length ?? 0})
            </span>
          </div>
          <div>
            {stats?.stuckCompanies?.length === 0 && (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                <HiOutlineCheckCircle style={{ fontSize: 32, color: '#22C55E', marginBottom: 8 }} />
                <div>All companies are progressing normally!</div>
              </div>
            )}
            {stats?.stuckCompanies?.map((c: any) => {
              const lastChanged = c.statusHistory?.slice(-1)[0]?.changedAt || c.createdAt;
              const days = Math.floor((Date.now() - new Date(lastChanged).getTime()) / 86400000);
              return (
                <div
                  key={c._id}
                  style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => navigate(`/sales/companies/${c._id}`)}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = '#fef2f2')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{c.companyName}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                      <span className={STATUS_BADGE[c.status] || 'badge badge-gray'} style={{ fontSize: 10 }}>
                        {STAGE_LABELS[c.status] || c.status}
                      </span>{' '}
                      · {days}d in this stage
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>{days}d</span>
                    <HiOutlineClock style={{ color: '#EF4444', fontSize: 14 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: '10px 20px', borderTop: '1px solid #f3f4f6' }}>
            <button
              onClick={() => navigate('/sales/companies')}
              style={{ fontSize: 12, color: '#1E5AAF', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View all companies <HiOutlineArrowRight />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #EFF6FF, #F0FDF4)',
              padding: '14px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <HiOutlineArrowTrendingUp style={{ color: '#1E5AAF', fontSize: 18 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0a2463' }}>Recent Activity</span>
          </div>
          <div>
            {stats?.recentActivity?.length === 0 && (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                No recent activity
              </div>
            )}
            {stats?.recentActivity?.map((item: any, i: number) => (
              <div
                key={i}
                style={{
                  padding: '11px 20px',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onClick={() =>
                  navigate(
                    item.type === 'company'
                      ? `/sales/companies/${item.id}`
                      : `/sales/subcontractors/${item.id}`
                  )
                }
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = '#f8fafc')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: item.type === 'company' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 15,
                      color: item.type === 'company' ? '#3B82F6' : '#8B5CF6',
                      flexShrink: 0,
                    }}
                  >
                    {item.type === 'company' ? <HiOutlineBuildingOffice2 /> : <HiOutlineUsers />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                      {item.type === 'company' ? 'Company' : 'Sub-Contractor'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{timeSince(item.createdAt)}</div>
                  <span className={STATUS_BADGE[item.status] || 'badge badge-gray'} style={{ fontSize: 10, marginTop: 3, display: 'inline-block' }}>
                    {STAGE_LABELS[item.status] || item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 16 }}>
            <button
              onClick={() => navigate('/sales/companies')}
              style={{ fontSize: 12, color: '#1E5AAF', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Companies <HiOutlineArrowRight />
            </button>
            <button
              onClick={() => navigate('/sales/subcontractors')}
              style={{ fontSize: 12, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Sub-Contractors <HiOutlineArrowRight />
            </button>
          </div>
        </div>
      </div>

      {/* ── GryLinks Expiring Soon ── */}
      {(stats?.expiringSoon?.length ?? 0) > 0 && (
        <div
          style={{
            marginTop: 20,
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: 14,
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <HiOutlineExclamationTriangle style={{ color: '#D97706', fontSize: 18 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#92400E' }}>
              GryLinks Expiring Within 24 Hours
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {stats?.expiringSoon?.map((gl: any) => (
              <div
                key={gl._id}
                style={{
                  background: 'white',
                  border: '1px solid #FDE68A',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 13,
                }}
              >
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  {gl.companyId?.companyName || gl.email}
                </span>
                <span style={{ color: '#D97706', marginLeft: 8 }}>
                  expires {new Date(gl.expiresAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => navigate('/sales/companies/' + gl.companyId?._id)}
                  style={{ marginLeft: 10, fontSize: 11, color: '#1E5AAF', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  View →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>A GryLink onboarding email will be sent automatically</p>
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

export default SalesOverview;
