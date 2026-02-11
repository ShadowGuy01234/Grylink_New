import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Company {
  _id: string;
  companyName: string;
}

const ProfileCompletionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [linkedEpc, setLinkedEpc] = useState<Company | null>(null);
  const [availableEpcs, setAvailableEpcs] = useState<Company[]>([]);

  const [form, setForm] = useState({
    companyName: '',
    ownerName: '',
    address: '',
    phone: '',
    email: '',
    vendorId: '',
    gstin: '',
    selectedEpcId: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await api.get('/subcontractor/profile');
      const data = res.data;
      
      // Pre-fill existing data
      setForm({
        companyName: data.subContractor?.companyName || '',
        ownerName: data.subContractor?.ownerName || user?.name || '',
        address: data.subContractor?.address || '',
        phone: data.subContractor?.phone || '',
        email: data.subContractor?.email || user?.email || '',
        vendorId: data.subContractor?.vendorId || '',
        gstin: data.subContractor?.gstin || '',
        selectedEpcId: data.subContractor?.selectedEpcId || data.subContractor?.linkedEpcId || '',
      });

      // Get linked EPC info
      if (data.subContractor?.linkedEpcId) {
        const epcRes = await api.get(`/company/info/${data.subContractor.linkedEpcId}`).catch(() => null);
        if (epcRes?.data) {
          setLinkedEpc(epcRes.data);
        }
      }

      // Fetch available EPCs for selection (if they want to work with other companies)
      const epcsRes = await api.get('/company/active').catch(() => ({ data: [] }));
      setAvailableEpcs(epcsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.companyName || !form.ownerName || !form.address || !form.gstin) {
      return toast.error('Please fill all required fields');
    }

    // GSTIN validation (basic format)
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(form.gstin.toUpperCase())) {
      return toast.error('Please enter a valid GSTIN');
    }

    setLoading(true);
    try {
      await api.put('/subcontractor/profile', {
        ...form,
        gstin: form.gstin.toUpperCase(),
      });
      toast.success('Profile completed successfully!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return <div className="page-loading">Loading profile...</div>;
  }

  return (
    <div className="auth-container" style={{ padding: 24 }}>
      <div className="auth-card" style={{ maxWidth: 600 }}>
        <div className="auth-header">
          <div className="auth-logo">
            <span>Gryork</span>
          </div>
          <h1>Complete Your Profile</h1>
          <p>Please provide your business details to continue</p>
        </div>

        {linkedEpc && (
          <div style={{ background: 'rgba(88, 166, 255, 0.1)', padding: 12, borderRadius: 8, marginBottom: 20 }}>
            <p style={{ color: 'var(--accent)', fontSize: 14, margin: 0 }}>
              You are linked to: <strong>{linkedEpc.companyName}</strong>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name *</label>
              <input
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Your company name"
              />
            </div>
            <div className="form-group">
              <label>Owner / Contact Name *</label>
              <input
                required
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                placeholder="Full name"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Business Address *</label>
            <textarea
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Complete business address"
              rows={2}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Contact number"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Vendor ID</label>
              <input
                value={form.vendorId}
                onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                placeholder="Your vendor ID with EPC"
              />
            </div>
            <div className="form-group">
              <label>GSTIN *</label>
              <input
                required
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
              />
            </div>
          </div>

          {availableEpcs.length > 1 && (
            <div className="form-group">
              <label>Select Primary EPC Company</label>
              <select
                value={form.selectedEpcId}
                onChange={(e) => setForm({ ...form, selectedEpcId: e.target.value })}
              >
                <option value="">-- Select Company --</option>
                {availableEpcs.map((epc) => (
                  <option key={epc._id} value={epc._id}>
                    {epc.companyName}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Select the EPC company you primarily work with
              </p>
            </div>
          )}

          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionPage;
