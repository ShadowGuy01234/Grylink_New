import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { grylinkApi } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OnboardingPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { setAuthData } = useAuth();
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
      setAuthData(res.data.user, res.data.token);
      toast.success('Account set up successfully!');
      navigate('/epc');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to set password');
    } finally {
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
          <button className="btn-primary full-width" onClick={() => navigate('/login')}>
            Go to Login
          </button>
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
      </div>
    </div>
  );
};

export default OnboardingPage;
