import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── Role colour map ──────────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, { primary: string; light: string; gradient: string }> = {
  sales:   { primary: '#1E5AAF', light: 'rgba(30,90,175,0.09)',   gradient: 'linear-gradient(135deg,#1E5AAF,#3B82F6)' },
  ops:     { primary: '#15803D', light: 'rgba(21,128,61,0.09)',    gradient: 'linear-gradient(135deg,#15803D,#22C55E)' },
  rmt:     { primary: '#B45309', light: 'rgba(180,83,9,0.09)',     gradient: 'linear-gradient(135deg,#B45309,#F59E0B)' },
  admin:   { primary: '#0A2463', light: 'rgba(10,36,99,0.09)',     gradient: 'linear-gradient(135deg,#0A2463,#1E5AAF)' },
  founder: { primary: '#7C3AED', light: 'rgba(124,58,237,0.09)',   gradient: 'linear-gradient(135deg,#7C3AED,#A78BFA)' },
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Ico = {
  grid:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  building:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4h6v4M9 10h.01M12 10h.01M15 10h.01M9 14h.01M12 14h.01M15 14h.01"/></svg>,
  users:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  link:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  chart:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  shield:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  check:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  clipboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  cog:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M22 12h-2M4 12H2M12 2V4M12 22v-2"/></svg>,
  star:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  bill:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  sla:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  audit:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/><polyline points="14 2 14 8 20 8"/></svg>,
  epc:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  kyc:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M3 20l4-4 2 2 4-5 5 7"/></svg>,
  logout:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

// ─── Reusable NavItem ─────────────────────────────────────────────────────────
interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
  roleColor: { primary: string; light: string };
  sub?: boolean;
}

const SidebarNavItem = ({ to, icon, label, exact, roleColor, sub }: NavItemProps) => (
  <NavLink
    to={to}
    end={exact}
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: sub ? 8 : 10,
      padding: sub ? '7px 12px 7px 36px' : '9px 12px',
      borderRadius: 9,
      fontSize: sub ? 13 : 14,
      fontWeight: isActive ? 600 : 500,
      color: isActive ? roleColor.primary : '#4b5563',
      background: isActive ? roleColor.light : 'transparent',
      textDecoration: 'none',
      transition: 'all 0.15s',
      position: 'relative',
    })}
    onMouseEnter={(e) => {
      const el = e.currentTarget as HTMLAnchorElement;
      if (!el.getAttribute('aria-current')) {
        el.style.background = '#f9fafb';
        el.style.color = '#111827';
      }
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget as HTMLAnchorElement;
      el.style.background = '';
      el.style.color = '';
    }}
  >
    {({ isActive }) => (
      <>
        {sub && isActive && (
          <span style={{
            position: 'absolute',
            left: 22,
            top: '50%',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: roleColor.primary,
            transform: 'translateY(-50%)',
          }} />
        )}
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: isActive ? roleColor.primary : '#9ca3af',
          transition: 'color 0.15s',
        }}>
          {icon}
        </span>
        <span>{label}</span>
        {isActive && !sub && (
          <span style={{
            marginLeft: 'auto',
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: roleColor.primary,
            flexShrink: 0,
          }} />
        )}
      </>
    )}
  </NavLink>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SidebarSection = ({ label }: { label: string }) => (
  <div style={{
    padding: '14px 12px 6px',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#9ca3af',
  }}>
    {label}
  </div>
);

// ─── Main Layout ──────────────────────────────────────────────────────────────
const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role ?? 'sales';
  const rc = ROLE_COLORS[role] ?? ROLE_COLORS.sales;

  const isAdmin   = role === 'admin' || role === 'founder';
  const isOps     = role === 'ops';
  const isSales   = role === 'sales';
  const isRmt     = role === 'rmt';
  const isFounder = role === 'founder';

  const inSales = location.pathname.startsWith('/sales');
  const inOps   = location.pathname.startsWith('/ops');

  const handleLogout = () => { logout(); navigate('/'); };

  const ROLE_LABELS: Record<string, string> = {
    sales: 'Sales', ops: 'Operations', rmt: 'Risk Mgmt', admin: 'Admin', founder: 'Founder',
  };

  const salesSubNav = [
    { to: '/sales',                icon: Ico.grid,     label: 'Overview',       exact: true },
    { to: '/sales/companies',      icon: Ico.building, label: 'Companies' },
    { to: '/sales/subcontractors', icon: Ico.users,    label: 'Sub-Contractors' },
    { to: '/sales/grylinks',       icon: Ico.link,     label: 'GryLinks' },
  ];

  const opsSubNav = [
    { to: '/ops',       icon: Ico.grid,  label: 'Overview',   exact: true },
    { to: '/ops/epc',   icon: Ico.epc,   label: 'EPC Review' },
    { to: '/ops/bills', icon: Ico.bill,  label: 'Bills' },
    { to: '/ops/kyc',   icon: Ico.kyc,   label: 'KYC' },
    { to: '/ops/sla',   icon: Ico.sla,   label: 'SLA Tracker' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>

      {/* ═══════════════════ SIDEBAR ═══════════════════ */}
      <aside style={{
        width: 256,
        background: 'white',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>

        {/* ── Logo ── */}
        <div style={{
          padding: '18px 16px 16px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: 'linear-gradient(135deg,#0A2463 0%,#1E5AAF 60%,#3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 15,
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(30,90,175,0.3)',
          }}>G</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700,
              fontSize: 16,
              background: 'linear-gradient(135deg,#0A2463,#1E5AAF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Gryork</div>
          </div>
          <div style={{
            padding: '3px 8px',
            borderRadius: 999,
            background: rc.light,
            color: rc.primary,
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            flexShrink: 0,
            border: `1px solid ${rc.primary}22`,
          }}>
            {ROLE_LABELS[role] ?? role}
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav style={{ flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>

          {isFounder && (
            <>
              <SidebarSection label="Executive" />
              <SidebarNavItem to="/founder" icon={Ico.star}      label="Founder Overview" roleColor={rc} exact />
            </>
          )}

          {isAdmin && (
            <>
              <SidebarSection label="Administration" />
              <SidebarNavItem to="/admin"   icon={Ico.cog}       label="Admin Dashboard"  roleColor={rc} exact />
            </>
          )}

          {(isSales || isAdmin) && (
            <>
              <SidebarSection label="Sales" />
              <SidebarNavItem to="/sales" icon={Ico.chart} label="Sales Dashboard" roleColor={rc} exact />
              {(inSales || isSales) && (
                <div style={{
                  margin: '3px 0',
                  borderLeft: `2px solid ${rc.light}`,
                  marginLeft: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}>
                  {salesSubNav.map((item) => (
                    <SidebarNavItem key={item.to} {...item} roleColor={rc} sub />
                  ))}
                </div>
              )}
            </>
          )}

          {(isOps || isAdmin) && (
            <>
              <SidebarSection label="Operations" />
              <SidebarNavItem to="/ops" icon={Ico.check} label="Ops Dashboard" roleColor={rc} exact />
              {(inOps || isOps) && (
                <div style={{
                  margin: '3px 0',
                  borderLeft: `2px solid ${rc.light}`,
                  marginLeft: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}>
                  {opsSubNav.map((item) => (
                    <SidebarNavItem key={item.to} {...item} roleColor={rc} sub />
                  ))}
                </div>
              )}
            </>
          )}

          {(isRmt || isAdmin) && (
            <>
              <SidebarSection label="Risk Management" />
              <SidebarNavItem to="/rmt" icon={Ico.shield} label="Risk Dashboard" roleColor={rc} exact />
            </>
          )}

          <SidebarSection label="Shared" />
          <SidebarNavItem to="/cases" icon={Ico.clipboard} label="Cases" roleColor={rc} />
          {(isAdmin || isOps) && (
            <SidebarNavItem to="/audit" icon={Ico.audit} label="Audit Logs" roleColor={rc} />
          )}
        </nav>

        {/* ── User Footer ── */}
        <div style={{
          padding: '12px 12px',
          borderTop: '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
          background: '#fafafa',
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: rc.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 12,
            color: 'white',
            flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 500 }}>
              {user?.role}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: '6px',
              borderRadius: 7,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af';
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
            }}
          >
            {Ico.logout}
          </button>
        </div>
      </aside>

      {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
      <main style={{
        flex: 1,
        marginLeft: 256,
        minHeight: '100vh',
        background: '#f8fafc',
        padding: 24,
        boxSizing: 'border-box',
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
