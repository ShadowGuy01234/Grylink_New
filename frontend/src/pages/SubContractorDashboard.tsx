import React, { useState, useEffect } from 'react';
import { subContractorApi, bidsApi, kycApi } from '../api';
import toast from 'react-hot-toast';

const SubContractorDashboard = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    companyName: '', ownerName: '', address: '', phone: '', vendorId: '', gstin: '',
  });
  const [saving, setSaving] = useState(false);

  // Bill upload
  const [billFiles, setBillFiles] = useState<File[]>([]);
  const [billData, setBillData] = useState({ billNumber: '', amount: '', description: '' });
  const [uploadingBill, setUploadingBill] = useState(false);

  // CWC
  const [cwcBillId, setCwcBillId] = useState('');
  const [paymentRef, setPaymentRef] = useState('');

  const fetchData = async () => {
    try {
      const res = await subContractorApi.getDashboard();
      setDashboard(res.data);
      if (res.data.subContractor) {
        const sc = res.data.subContractor;
        setProfileForm({
          companyName: sc.companyName || '', ownerName: sc.ownerName || '',
          address: sc.address || '', phone: sc.phone || '',
          vendorId: sc.vendorId || '', gstin: sc.gstin || '',
        });
      }
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await subContractorApi.updateProfile(profileForm);
      toast.success('Profile updated!');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billFiles.length === 0) return toast.error('Select bill files');
    setUploadingBill(true);
    try {
      const formData = new FormData();
      billFiles.forEach((f) => formData.append('bills', f));
      formData.append('billNumber', billData.billNumber);
      formData.append('amount', billData.amount);
      formData.append('description', billData.description);
      await subContractorApi.uploadBills(formData);
      toast.success('Bills uploaded!');
      setBillFiles([]); setBillData({ billNumber: '', amount: '', description: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploadingBill(false);
    }
  };

  const handleSubmitCwc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await subContractorApi.submitCwc({ billId: cwcBillId, paymentReference: paymentRef });
      toast.success('CWC RF submitted!');
      setCwcBillId(''); setPaymentRef('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Submit failed');
    }
  };

  const handleBidResponse = async (bidId: string, decision: string) => {
    try {
      await subContractorApi.respondToBid(bidId, { decision });
      toast.success(`Bid ${decision}ed!`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Response failed');
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      LEAD_CREATED: 'badge-yellow', PROFILE_INCOMPLETE: 'badge-yellow', PROFILE_COMPLETED: 'badge-green',
      UPLOADED: 'badge-yellow', VERIFIED: 'badge-green', REJECTED: 'badge-red',
      SUBMITTED: 'badge-blue', ACTION_REQUIRED: 'badge-red', KYC_COMPLETED: 'badge-green',
    };
    return <span className={`badge ${colors[status] || 'badge-gray'}`}>{status.replace(/_/g, ' ')}</span>;
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  const sc = dashboard?.subContractor;
  const verifiedBills = dashboard?.bills?.filter((b: any) => b.status === 'VERIFIED') || [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>{sc?.companyName || 'Sub-Contractor'}</h1>
          <p className="subtitle">Sub-Contractor Dashboard {sc && statusBadge(sc.status)}</p>
        </div>
      </div>

      <div className="tabs">
        {['profile', 'bills', 'cwc'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="section">
          <h2>Complete Your Profile</h2>
          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="form-grid">
              <div className="form-group"><label>Company Name *</label>
                <input required value={profileForm.companyName} onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })} /></div>
              <div className="form-group"><label>Owner Name *</label>
                <input required value={profileForm.ownerName} onChange={(e) => setProfileForm({ ...profileForm, ownerName: e.target.value })} /></div>
              <div className="form-group"><label>Phone *</label>
                <input required value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></div>
              <div className="form-group"><label>Vendor ID</label>
                <input value={profileForm.vendorId} onChange={(e) => setProfileForm({ ...profileForm, vendorId: e.target.value })} /></div>
              <div className="form-group"><label>GSTIN</label>
                <input value={profileForm.gstin} onChange={(e) => setProfileForm({ ...profileForm, gstin: e.target.value })} /></div>
              <div className="form-group full-span"><label>Address *</label>
                <textarea required value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} /></div>
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
          </form>
        </div>
      )}

      {/* Bills Tab */}
      {activeTab === 'bills' && (
        <div className="section">
          <h2>Upload Bills</h2>
          <form onSubmit={handleUploadBill} className="upload-form">
            <div className="form-grid">
              <div className="form-group"><label>Bill Number</label>
                <input value={billData.billNumber} onChange={(e) => setBillData({ ...billData, billNumber: e.target.value })} /></div>
              <div className="form-group"><label>Amount (₹)</label>
                <input type="number" value={billData.amount} onChange={(e) => setBillData({ ...billData, amount: e.target.value })} /></div>
              <div className="form-group full-span"><label>Description</label>
                <input value={billData.description} onChange={(e) => setBillData({ ...billData, description: e.target.value })} /></div>
            </div>
            <input type="file" multiple onChange={(e) => setBillFiles(Array.from(e.target.files || []))} />
            <button type="submit" className="btn-primary" disabled={uploadingBill || billFiles.length === 0}>
              {uploadingBill ? 'Uploading...' : 'Upload Bills'}
            </button>
          </form>

          <h3 style={{ marginTop: 24 }}>Your Bills</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Bill #</th><th>Amount</th><th>File</th><th>Status</th></tr></thead>
              <tbody>
                {dashboard?.bills?.map((b: any) => (
                  <tr key={b._id}>
                    <td>{b.billNumber || '—'}</td>
                    <td>{b.amount ? `₹${b.amount.toLocaleString()}` : '—'}</td>
                    <td><a href={b.fileUrl} target="_blank" rel="noreferrer">{b.fileName}</a></td>
                    <td>{statusBadge(b.status)}</td>
                  </tr>
                ))}
                {(!dashboard?.bills || dashboard.bills.length === 0) && (
                  <tr><td colSpan={4} className="empty-state">No bills uploaded</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CWC Tab */}
      {activeTab === 'cwc' && (
        <div className="section">
          <h2>CWC Request Form</h2>
          <p className="section-note">Platform fee: ₹1,000</p>

          {verifiedBills.length > 0 ? (
            <form onSubmit={handleSubmitCwc} className="upload-form">
              <div className="form-group">
                <label>Select Verified Bill *</label>
                <select required value={cwcBillId} onChange={(e) => setCwcBillId(e.target.value)}>
                  <option value="">Select a bill</option>
                  {verifiedBills.map((b: any) => (
                    <option key={b._id} value={b._id}>{b.billNumber || b._id} — ₹{b.amount?.toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Payment Reference</label>
                <input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Transaction ID / Reference" />
              </div>
              <button type="submit" className="btn-primary">Submit CWC RF</button>
            </form>
          ) : (
            <p className="empty-hint">No verified bills available. Bills must be verified by Ops before CWC submission.</p>
          )}

          <h3 style={{ marginTop: 24 }}>CWC Requests</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Bill</th><th>Fee Paid</th><th>Status</th></tr></thead>
              <tbody>
                {dashboard?.cwcRfs?.map((c: any) => (
                  <tr key={c._id}>
                    <td>{c.billId}</td>
                    <td>{c.platformFeePaid ? '✅ Yes' : '❌ No'}</td>
                    <td>{statusBadge(c.status)}</td>
                  </tr>
                ))}
                {(!dashboard?.cwcRfs || dashboard.cwcRfs.length === 0) && (
                  <tr><td colSpan={3} className="empty-state">No CWC requests</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubContractorDashboard;
