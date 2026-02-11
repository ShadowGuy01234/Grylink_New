import React from 'react';
import { Outlet } from 'react-router-dom';
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
            <a href="/" className="active">Dashboard</a>
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
