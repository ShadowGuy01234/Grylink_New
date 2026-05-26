import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useStudentAuth } from "../../context/StudentAuthContext";
import {
  LayoutDashboard, Calendar, Video, Bell, FolderOpen, Gift, Award, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home", end: true },
  { to: "/dashboard/schedule", icon: Calendar, label: "Schedule" },
  { to: "/dashboard/meetings", icon: Video, label: "Meeting Links" },
  { to: "/dashboard/announcements", icon: Bell, label: "Announcements" },
  { to: "/dashboard/projects", icon: FolderOpen, label: "Projects" },
  { to: "/dashboard/referrals", icon: Gift, label: "Referral Rewards" },
  { to: "/dashboard/certificate", icon: Award, label: "Certificate" },
];

export function DashboardLayout() {
  const { student, loading, logout } = useStudentAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050B1E] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!student) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = student.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={`${mobile ? "flex" : "hidden md:flex"} flex-col h-full bg-[#0A0F2C] border-r border-white/10 w-64 flex-shrink-0`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">TP</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm">TechPreneur</p>
          <p className="text-slate-500 text-xs">Student Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{student.name}</p>
            <p className="text-slate-500 text-xs truncate">{student.track}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-900/10 rounded-xl text-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#050B1E] flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full flex flex-col">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-[#0A0F2C]/50 backdrop-blur-sm">
          <button
            className="md:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm hidden sm:block">Welcome back,</span>
            <span className="text-white text-sm font-semibold">{student.name.split(" ")[0]}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">{initials}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
