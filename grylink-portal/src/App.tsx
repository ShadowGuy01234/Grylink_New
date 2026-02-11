import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import OnboardingPage from './pages/OnboardingPage';

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a1a2e', color: '#e0e0e0', borderRadius: '8px' },
      }} />
      <Routes>
        <Route path="/onboarding/:token" element={<OnboardingPage />} />
        <Route path="*" element={<InvalidLinkPage />} />
      </Routes>
    </BrowserRouter>
  );
};

// Simple page for invalid/missing links
const InvalidLinkPage = () => {
  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5176';
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo"><span>GryLink</span></div>
          <h1>Invalid Link</h1>
          <p>This onboarding link is invalid or has expired.</p>
        </div>
        <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>
          If you received an onboarding email from Gryork, please use the link provided in that email.
        </p>
        <a href={publicSiteUrl} className="btn-primary full-width">
          Go to Gryork.com
        </a>
      </div>
    </div>
  );
};

export default App;
