import { Outlet } from "react-router-dom";

/**
 * Layout is intentionally minimal — each page manages its own full-page layout
 * (e.g. DashboardPage uses its own sidebar + main-content-area).
 * Theme toggling and user info are handled within the individual page components.
 */
const Layout = () => {
  return <Outlet />;
};

export default Layout;
