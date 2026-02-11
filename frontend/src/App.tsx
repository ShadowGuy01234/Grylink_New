import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import EpcDashboardNew from './pages/EpcDashboardNew';
import SubContractorDashboardNew from './pages/SubContractorDashboardNew';

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  // Wait for auth to resolve before rendering any routes
  if (isLoading) {
    return <div className="page-loading">Loading...</div>;
  }

  // Not logged in — only allow login and onboarding
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding/:token" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Logged in — role-based dashboard routes
  const homeRoute = user.role === 'epc' ? '/epc' : '/subcontractor';

  return (
    <Routes>
      <Route path="/onboarding/:token" element={<OnboardingPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to={homeRoute} replace />} />
        <Route path="epc" element={
          user.role === 'epc' ? <EpcDashboardNew /> : <Navigate to={homeRoute} replace />
        } />
        <Route path="subcontractor" element={
          user.role === 'subcontractor' ? <SubContractorDashboardNew /> : <Navigate to={homeRoute} replace />
        } />
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
          style: { background: '#1a1a2e', color: '#e0e0e0', borderRadius: '8px' },
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
