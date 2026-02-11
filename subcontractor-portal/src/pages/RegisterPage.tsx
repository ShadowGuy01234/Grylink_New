import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'register'>('email');
  const [emailCheck, setEmailCheck] = useState<{ found: boolean; hasAccount: boolean; linkedEpc: string } | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const checkEmail = async () => {
    if (!form.email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      const res = await api.get(`/auth/check-email/${form.email}`);
      const data = res.data;
      setEmailCheck(data);
      
      if (!data.found) {
        toast.error('Email not found. Your EPC company must add you as a sub-contractor first.');
      } else if (data.hasAccount) {
        toast.error('Account already exists. Please login instead.');
        navigate('/login');
      } else {
        setStep('register');
        toast.success(`Found! You're linked to ${data.linkedEpc}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await api.post('/auth/register-subcontractor', {
        name: form.name,
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        phone: form.phone,
      });
      toast.success('Account created! Please complete your profile.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <div className="auth-logo">
            <span>Gryork</span>
          </div>
          <h1>Create Account</h1>
          <p>Register as a sub-contractor</p>
        </div>

        {step === 'email' && (
          <div className="auth-form">
            <div className="form-group">
              <label>Email Address *</label>
              <input 
                type="email" 
                required 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter email provided to your EPC company"
              />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Your EPC company must have added you as a vendor before you can register.
            </p>
            <button 
              type="button" 
              className="btn-primary full-width" 
              onClick={checkEmail}
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Verify Email'}
            </button>
          </div>
        )}

        {step === 'register' && (
          <form onSubmit={handleSubmit} className="auth-form">
            {emailCheck && (
              <div style={{ background: 'rgba(63, 185, 80, 0.1)', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <p style={{ color: 'var(--success)', fontSize: 14, margin: 0 }}>
                  ✓ Verified! Linked to: <strong>{emailCheck.linkedEpc}</strong>
                </p>
              </div>
            )}
            <div className="form-group">
              <label>Email *</label>
              <input type="email" value={form.email} disabled style={{ opacity: 0.7 }} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Your Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Company Name *</label>
                <input required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Password *</label>
                <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input type="password" required minLength={6} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            <button type="button" className="btn-secondary full-width" onClick={() => setStep('email')} style={{ marginTop: 8 }}>
              ← Back
            </button>
          </form>
        )}

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
