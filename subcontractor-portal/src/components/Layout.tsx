import { Outlet } from 'react-router-dom';

/**
 * Layout is minimal — DashboardPage manages its own full-page sidebar layout.
 */
const Layout = () => {
  return <Outlet />;
};

export default Layout;
