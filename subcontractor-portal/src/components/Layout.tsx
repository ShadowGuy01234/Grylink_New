import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5176';

  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="topbar-left">
          <a href={publicSiteUrl} className="topbar-logo">Gryork</a>
          <nav className="topbar-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
            <NavLink to="/cwcrf" className={({ isActive }) => isActive ? 'active' : ''}>New CWCRF</NavLink>
            <NavLink to="/my-cwcrfs" className={({ isActive }) => isActive ? 'active' : ''}>My CWCRFs</NavLink>
            <NavLink to="/kyc" className={({ isActive }) => isActive ? 'active' : ''}>KYC</NavLink>
          </nav>
        </div>
        <div className="topbar-right">
          <span className="topbar-user">{user?.name}</span>
          <span className="role-badge">SUB-CONTRACTOR</span>
          <button onClick={logout} className="btn-secondary btn-sm">Logout</button>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
