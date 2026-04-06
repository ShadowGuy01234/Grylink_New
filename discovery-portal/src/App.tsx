import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';

// BDF Pages
import BdfDashboard from './pages/BdfDashboard';
import BdfForm from './pages/BdfForm';
import BdfPipeline from './pages/BdfPipeline';
import BdfDetail from './pages/BdfDetail';

// FPDF Pages
import FpdfDashboard from './pages/FpdfDashboard';
import FpdfForm from './pages/FpdfForm';
import FpdfPipeline from './pages/FpdfPipeline';
import FpdfDetail from './pages/FpdfDetail';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="page-loading"><span className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/bdf" replace />} />
        
        {/* BDF Routes */}
        <Route path="bdf" element={<BdfDashboard />} />
        <Route path="bdf/new" element={<BdfForm />} />
        <Route path="bdf/pipeline" element={<BdfPipeline />} />
        <Route path="bdf/:id" element={<BdfDetail />} />
        
        {/* FPDF Routes */}
        <Route path="fpdf" element={<FpdfDashboard />} />
        <Route path="fpdf/new" element={<FpdfForm />} />
        <Route path="fpdf/pipeline" element={<FpdfPipeline />} />
        <Route path="fpdf/:id" element={<FpdfDetail />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ 
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } 
        }} />
      </AuthProvider>
    </Router>
  );
}

export default App;
