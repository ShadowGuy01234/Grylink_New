import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building, PlusCircle, BarChart3, Landmark } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Gryork Logo" style={{ height: 42, marginBottom: 8 }} />
          <p>Discovery Framework</p>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Business Discovery</span>
          <NavLink to="/bdf" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><Building size={18} /></span> BDF Dashboard
          </NavLink>
          <NavLink to="/bdf/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><PlusCircle size={18} /></span> New BDF Entry
          </NavLink>
          <NavLink to="/bdf/pipeline" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><BarChart3 size={18} /></span> BDF Pipeline
          </NavLink>

          <span className="nav-section-label">Financial Partners</span>
          <NavLink to="/fpdf" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><Landmark size={18} /></span> FPDF Dashboard
          </NavLink>
          <NavLink to="/fpdf/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><PlusCircle size={18} /></span> New FPDF Entry
          </NavLink>
          <NavLink to="/fpdf/pipeline" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon"><BarChart3 size={18} /></span> FPDF Pipeline
          </NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <p>{user?.name}</p>
            <p>{user?.role?.toUpperCase()}</p>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
