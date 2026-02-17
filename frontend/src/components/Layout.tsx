
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineLogout } from 'react-icons/hi';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-logo">GryLink</div>
          <nav className="topbar-nav">
            {user?.role === 'epc' && (
              <NavLink to="/epc" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
            )}
            {user?.role === 'subcontractor' && (
              <NavLink to="/subcontractor" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
            )}
            {user?.role === 'nbfc' && (
              <NavLink to="/nbfc" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
            )}
          </nav>
        </div>
        <div className="topbar-right">
          <span className="topbar-user">{user?.name}</span>
          <span className="topbar-role">{user?.role?.toUpperCase()}</span>
          <button onClick={handleLogout} className="topbar-logout" title="Logout">
            <HiOutlineLogout />
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
