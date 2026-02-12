import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NbfcDashboard from './pages/NbfcDashboard';

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="page-loading">Loading...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // NBFC users get NBFC dashboard, EPC users get EPC dashboard
  const defaultRoute = user.role === 'nbfc' ? '/nbfc' : '/dashboard';

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to={defaultRoute} replace />} />
        <Route 
          path="dashboard" 
          element={user.role === 'epc' ? <DashboardPage /> : <Navigate to={defaultRoute} replace />} 
        />
        <Route 
          path="nbfc" 
          element={user.role === 'nbfc' ? <NbfcDashboard /> : <Navigate to={defaultRoute} replace />} 
        />
        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a1a2e', color: '#e0e0e0', borderRadius: '8px' },
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
