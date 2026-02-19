import { useNavigate } from 'react-router-dom';

const ROLES = [
  {
    id: 'sales',
    label: 'Sales',
    description: 'Lead management, company & sub-contractor onboarding, GryLinks',
    colorFrom: '#1E5AAF',
    colorTo: '#3B82F6',
    bgLight: 'rgba(30,90,175,0.06)',
    border: 'rgba(30,90,175,0.18)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: 'ops',
    label: 'Operations',
    description: 'KYC verification, document review, EPC & bill processing',
    colorFrom: '#15803D',
    colorTo: '#22C55E',
    bgLight: 'rgba(21,128,61,0.06)',
    border: 'rgba(21,128,61,0.18)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'rmt',
    label: 'Risk Management',
    description: 'Seller risk scoring, evaluation reports, credit decisioning',
    colorFrom: '#B45309',
    colorTo: '#F59E0B',
    bgLight: 'rgba(180,83,9,0.06)',
    border: 'rgba(180,83,9,0.18)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'User management, system configuration, audit logs',
    colorFrom: '#0A2463',
    colorTo: '#1E5AAF',
    bgLight: 'rgba(10,36,99,0.06)',
    border: 'rgba(10,36,99,0.18)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 10-16 0" />
      </svg>
    ),
  },
  {
    id: 'founder',
    label: 'Founder',
    description: 'Strategic oversight, approvals, platform analytics',
    colorFrom: '#7C3AED',
    colorTo: '#A78BFA',
    bgLight: 'rgba(124,58,237,0.06)',
    border: 'rgba(124,58,237,0.18)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Bar ── */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 40px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: 'linear-gradient(135deg, #0A2463 0%, #1E5AAF 60%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 17,
            color: 'white',
            letterSpacing: -0.5,
            boxShadow: '0 2px 8px rgba(30,90,175,0.35)',
          }}>
            G
          </div>
          <span style={{
            fontWeight: 700,
            fontSize: 18,
            background: 'linear-gradient(135deg, #0A2463, #1E5AAF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Gryork
          </span>
          <span style={{
            marginLeft: 4,
            fontSize: 11,
            fontWeight: 600,
            color: '#6b7280',
            background: '#f3f4f6',
            padding: '2px 8px',
            borderRadius: 999,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}>
            Internal Platform
          </span>
        </div>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>v2.0 · Gryork Technologies Pvt. Ltd.</span>
      </header>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', padding: '64px 24px 48px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(30,90,175,0.08)',
          border: '1px solid rgba(30,90,175,0.18)',
          borderRadius: 999,
          padding: '5px 14px',
          marginBottom: 20,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 0 2px rgba(34,197,94,0.25)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1E5AAF', letterSpacing: 0.3 }}>All Systems Operational</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0A2463', margin: '0 0 12px', lineHeight: 1.2 }}>
          Gryork Operations Portal
        </h1>
        <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
          Select your role below to access your dedicated workspace.
        </p>
      </div>

      {/* ── Role Cards Grid ── */}
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => navigate(`/login/${role.id}`)}
            style={{
              background: 'white',
              border: `1.5px solid ${role.border}`,
              borderRadius: 16,
              padding: '28px 24px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.transform = 'translateY(-3px)';
              el.style.boxShadow = `0 12px 30px ${role.border.replace('0.18', '0.25')}`;
              el.style.borderColor = role.colorFrom;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.transform = 'translateY(0)';
              el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
              el.style.borderColor = role.border;
            }}
          >
            {/* Top accent strip */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${role.colorFrom}, ${role.colorTo})`,
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                background: role.bgLight,
                color: role.colorFrom,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {role.icon}
              </div>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: role.bgLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: role.colorFrom,
                flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                {role.label}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>
                {role.description}
              </div>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12,
              fontWeight: 600,
              color: role.colorFrom,
              padding: '5px 12px',
              background: role.bgLight,
              borderRadius: 999,
              width: 'fit-content',
            }}>
              Sign in to {role.label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: 'center', padding: '64px 24px 40px', marginTop: 'auto' }}>
        <p style={{ fontSize: 12, color: '#9ca3af' }}>
          © 2026 Gryork Technologies Pvt. Ltd. · Internal use only · Unauthorized access is prohibited
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
