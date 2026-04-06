import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to Gryork Discovery');
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      toast.error(error.response?.data?.error || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, redirect
  if (useAuth().user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-page">
      <div className="login-card glass-panel">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/logo.png" alt="Gryork Logo" style={{ height: 56, marginBottom: 12 }} />
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>Discovery Framework</h2>
          <p className="subtitle" style={{ marginTop: 6, fontSize: 14 }}>Secure portal for internal operatives</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group icon-input-group">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gryork.com"
                autoComplete="email"
                className="icon-input"
              />
            </div>
          </div>
          <div className="form-group icon-input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="icon-input"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={loading}>
            {loading ? <span className="spinner-small" /> : <LogIn size={20} />}
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: 'var(--color-dark-800)', borderRadius: 8 }}>
          <ShieldAlert size={16} color="var(--color-text-muted)" />
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Restricted System. Internal operatives only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
