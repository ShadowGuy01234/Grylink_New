import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { grylinkApi } from '../api';
import toast from 'react-hot-toast';

const OnboardingPage = () => {
  const { token } = useParams<{ token: string }>();
  const partnerPortalUrl = import.meta.env.VITE_PARTNER_PORTAL_URL || 'http://localhost:5175';
  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5176';
  
  const [linkData, setLinkData] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const validate = async () => {
      try {
        if (!token) throw new Error('No token provided');
        const res = await grylinkApi.validate(token);
        setLinkData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Invalid or expired link');
      } finally {
        setLoading(false);
      }
    };
    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    try {
      const res = await grylinkApi.setPassword(token!, password);
      // Store token for partner portal
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Account set up successfully! Redirecting...');
      // Redirect to partner portal
      setTimeout(() => {
        window.location.href = partnerPortalUrl;
      }, 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to set password');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="auth-container"><div className="page-loading">Validating your link...</div></div>;

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="error-icon">⚠️</div>
            <h1>Link Invalid</h1>
            <p>{error}</p>
          </div>
          <p style={{ marginBottom: 16, color: 'var(--text-secondary)', textAlign: 'center' }}>
            If you believe this is an error, please contact your sales representative.
          </p>
          <a href={publicSiteUrl} className="btn-primary full-width" style={{ textAlign: 'center', display: 'block' }}>
            Go to Gryork.com
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card onboarding-card">
        <div className="auth-header">
          <div className="auth-logo"><span>GryLink</span></div>
          <h1>Welcome, {linkData?.ownerName}!</h1>
          <p>Set your password to access <strong>{linkData?.companyName}</strong></p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={linkData?.email || ''} disabled className="input-disabled" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters" required minLength={8} />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password" required />
          </div>
          <button type="submit" className="btn-primary full-width" disabled={submitting}>
            {submitting ? 'Setting up...' : 'Set Password & Continue'}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;
