import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5176';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span>Gryork</span>
          </div>
          <h1>Sub-Contractor Portal</h1>
          <p>Sign in to manage your bills and payments</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12 }}>
            New user? <Link to="/register" style={{ color: 'var(--accent)' }}>Create account</Link>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            <a href={`${publicSiteUrl}/for-subcontractors`} style={{ color: 'var(--accent)' }}>Learn more about Gryork for Sub-Contractors</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
