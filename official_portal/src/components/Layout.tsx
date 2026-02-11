import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HiOutlineLogout,
  HiOutlineClipboardList,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineCog,
} from "react-icons/hi";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    ...(user?.role === "admin"
      ? [{ to: "/admin", icon: <HiOutlineCog />, label: "Admin" }]
      : []),
    ...(user?.role === "sales" || user?.role === "admin"
      ? [{ to: "/sales", icon: <HiOutlineChartBar />, label: "Sales" }]
      : []),
    ...(user?.role === "ops" || user?.role === "admin"
      ? [{ to: "/ops", icon: <HiOutlineShieldCheck />, label: "Ops" }]
      : []),
    { to: "/cases", icon: <HiOutlineClipboardList />, label: "Cases" },
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
