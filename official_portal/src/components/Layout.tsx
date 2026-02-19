import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HiOutlineLogout,
  HiOutlineClipboardList,
  HiOutlineShieldCheck,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineExclamationCircle,
  HiOutlineStar,
  HiOutlineDocumentReport,
  HiOutlineDocumentText,
  HiOutlineIdentification,
  HiOutlineUserGroup,
  HiOutlineLink,
  HiOutlineViewGrid,
  HiOutlineOfficeBuilding as HiBuilding,
} from "react-icons/hi";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin" || user?.role === "founder";
  const isFounder = user?.role === "founder";
  const isOps = user?.role === "ops";
  const isSales = user?.role === "sales";
  const showOpsSubnav = (isOps || isAdmin) && location.pathname.startsWith("/ops");
  const showSalesSubnav = (isSales || isAdmin) && location.pathname.startsWith("/sales");

  const opsSubNavItems = [
    { to: "/ops", icon: <HiOutlineViewGrid />, label: "Overview", exact: true },
    { to: "/ops/companies", icon: <HiBuilding />, label: "Companies" },
    { to: "/ops/bills", icon: <HiOutlineDocumentText />, label: "Bills" },
    { to: "/ops/kyc", icon: <HiOutlineIdentification />, label: "KYC" },
    { to: "/ops/cases", icon: <HiOutlineClipboardList />, label: "Cases" },
  ];

  const navItems = [
    ...(isFounder
      ? [{ to: "/founder", icon: <HiOutlineStar />, label: "Founder" }]
      : []),
    ...(isAdmin
      ? [{ to: "/admin", icon: <HiOutlineCog />, label: "Admin" }]
      : []),
    ...(user?.role === "sales" || isAdmin
      ? [{ to: "/sales", icon: <HiOutlineChartBar />, label: "Sales" }]
      : []),
    ...(user?.role === "ops" || isAdmin
      ? [{ to: "/ops", icon: <HiOutlineShieldCheck />, label: "Ops" }]
      : []),
    ...(user?.role === "rmt" || isAdmin
      ? [{ to: "/rmt", icon: <HiOutlineExclamationCircle />, label: "RMT" }]
      : []),
    { to: "/cases", icon: <HiOutlineClipboardList />, label: "Cases" },
    ...(isAdmin || isOps
      ? [
          {
            to: "/audit",
            icon: <HiOutlineDocumentReport />,
            label: "Audit Logs",
          },
        ]
      : []),
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">G</div>
          <span className="sidebar-title">Gryork</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sales Sub-navigation */}
        {showSalesSubnav && (
          <div className="subnav-section">
            <div className="subnav-header">Sales Tools</div>
            <nav className="subnav">
              {[
                { to: "/sales", icon: <HiOutlineViewGrid />, label: "Overview", exact: true },
                { to: "/sales/companies", icon: <HiBuilding />, label: "Companies" },
                { to: "/sales/subcontractors", icon: <HiOutlineUserGroup />, label: "Sub-Contractors" },
                { to: "/sales/grylinks", icon: <HiOutlineLink />, label: "GryLinks" },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) => `subnav-item ${isActive ? "active" : ""}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Ops Sub-navigation */}
        {showOpsSubnav && (
          <div className="subnav-section">
            <div className="subnav-header">Ops Tools</div>
            <nav className="subnav">
              {opsSubNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `subnav-item ${isActive ? "active" : ""}`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role?.toUpperCase()}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <HiOutlineLogout />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
