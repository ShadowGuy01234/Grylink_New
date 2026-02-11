import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import ProfileCompletionPage from './pages/ProfileCompletionPage';
import api from './api';

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (user) {
        try {
          const res = await api.get('/subcontractor/profile');
          setProfileStatus(res.data.subContractor?.status || 'PROFILE_INCOMPLETE');
        } catch {
          setProfileStatus('PROFILE_INCOMPLETE');
        }
      }
      setCheckingProfile(false);
    };

    if (user) {
      checkProfileStatus();
    } else {
      setCheckingProfile(false);
    }
  }, [user]);

  if (isLoading || (user && checkingProfile)) {
    return <div className="page-loading">Loading...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Profile incomplete - force completion (Step 10)
  if (profileStatus === 'PROFILE_INCOMPLETE' || profileStatus === 'LEAD_CREATED') {
    return (
      <Routes>
        <Route path="/complete-profile" element={<ProfileCompletionPage />} />
        <Route path="*" element={<Navigate to="/complete-profile" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="complete-profile" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
