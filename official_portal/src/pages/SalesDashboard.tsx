import React, { useState, useEffect } from 'react';
import { salesApi } from '../api';
import toast from 'react-hot-toast';

const SalesDashboard = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [subContractors, setSubContractors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    companyName: '', ownerName: '', email: '', phone: '', address: ''
  });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      const [leadsRes, scRes, statsRes] = await Promise.all([
        salesApi.getLeads(),
        salesApi.getSubContractors(),
        salesApi.getDashboard(),
      ]);
      setLeads(leadsRes.data);
      setSubContractors(scRes.data);
      setStats(statsRes.data);
    } catch (err: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await salesApi.createLead(formData);
      toast.success('Company lead created! Onboarding link sent.');
      setShowCreateModal(false);
      setFormData({ companyName: '', ownerName: '', email: '', phone: '', address: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create lead');
    } finally {
      setCreating(false);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      LEAD_CREATED: 'badge-yellow',
      CREDENTIALS_CREATED: 'badge-blue',
      DOCS_SUBMITTED: 'badge-purple',
      ACTION_REQUIRED: 'badge-red',
      ACTIVE: 'badge-green',
      PROFILE_INCOMPLETE: 'badge-yellow',
      PROFILE_COMPLETED: 'badge-green',
    };
    return <span className={`badge ${colors[status] || 'badge-gray'}`}>{status}</span>;
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Sales Dashboard</h1>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create Company Lead
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{leads.length}</h3>
          <p>Total Companies</p>
        </div>
        <div className="stat-card">
          <h3>{leads.filter(l => l.status === 'ACTIVE').length}</h3>
          <p>Active Companies</p>
        </div>
        <div className="stat-card">
          <h3>{subContractors.length}</h3>
          <p>Sub-Contractors</p>
        </div>
        <div className="stat-card">
          <h3>{leads.filter(l => l.status === 'LEAD_CREATED').length}</h3>
          <p>Pending Leads</p>
        </div>
      </div>

      {/* Company Leads Table */}
      <div className="table-section">
        <h2>Company Leads</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Owner</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead: any) => (
                <tr key={lead._id}>
                  <td>{lead.companyName}</td>
                  <td>{lead.ownerName}</td>
                  <td>{lead.email}</td>
                  <td>{lead.phone}</td>
                  <td>{statusBadge(lead.status)}</td>
                  <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={6} className="empty-state">No company leads yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sub-Contractors Table */}
      <div className="table-section">
        <h2>Sub-Contractors</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Linked EPC</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subContractors.map((sc: any) => (
                <tr key={sc._id}>
                  <td>{sc.companyName || '—'}</td>
                  <td>{sc.contactName || '—'}</td>
                  <td>{sc.email}</td>
                  <td>{sc.linkedEpcId?.companyName || '—'}</td>
                  <td>{statusBadge(sc.status)}</td>
                </tr>
              ))}
              {subContractors.length === 0 && (
                <tr><td colSpan={5} className="empty-state">No sub-contractors yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Company Lead</h2>
            <form onSubmit={handleCreateLead}>
              <div className="form-group">
                <label>Company Name *</label>
                <input required value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Owner Name *</label>
                <input required value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input required value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Address *</label>
                <textarea required value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;
