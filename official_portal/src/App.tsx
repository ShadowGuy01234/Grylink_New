import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SalesDashboard from './pages/SalesDashboard';
import OpsDashboard from './pages/OpsDashboard';
import CasesPage from './pages/CasesPage';
import AdminDashboard from './pages/AdminDashboard';

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  // Wait for auth to resolve before rendering any routes
  if (isLoading) {
    return <div className="page-loading">Loading...</div>;
  }

  // Not logged in — only allow login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Logged in — role-based dashboard routes
  const homeRoute =
    user.role === 'admin' ? '/admin' :
    user.role === 'sales' ? '/sales' :
    user.role === 'ops' ? '/ops' :
    '/cases';

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to={homeRoute} replace />} />
        <Route path="sales" element={
          ['sales', 'admin'].includes(user.role) ? <SalesDashboard /> : <Navigate to={homeRoute} replace />
        } />
        <Route path="ops" element={
          ['ops', 'admin'].includes(user.role) ? <OpsDashboard /> : <Navigate to={homeRoute} replace />
        } />
        <Route path="admin" element={
          user.role === 'admin' ? <AdminDashboard /> : <Navigate to={homeRoute} replace />
        } />
        <Route path="cases" element={<CasesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', borderRadius: '8px' },
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
