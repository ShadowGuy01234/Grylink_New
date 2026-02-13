import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const Layout = () => {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Default to light mode, check localStorage for saved preference
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light",
    );
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  return (
    <div className="app-layout">
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-logo">Gryork</div>
          <nav className="topbar-nav">
            <a href="/" className="active">
              Dashboard
            </a>
          </nav>
        </div>
        <div className="topbar-right">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <div className="topbar-user">
            <div className="user-avatar">{getInitials(user?.name || "")}</div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="role-badge">{user?.role?.toUpperCase()}</span>
            </div>
          </div>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
