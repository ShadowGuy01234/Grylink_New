import { useState, useEffect } from 'react';
import { salesApi } from '../api';
import toast from 'react-hot-toast';

const SalesDashboard = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [subContractors, setSubContractors] = useState<any[]>([]);
  const [_stats, setStats] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contactModal, setContactModal] = useState<any>(null);
  const [contactNotes, setContactNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    companyName: '', ownerName: '', email: '', phone: '', address: '',
    gstNumber: '', city: '', state: '', notes: ''
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
      setFormData({ companyName: '', ownerName: '', email: '', phone: '', address: '', gstNumber: '', city: '', state: '', notes: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create lead');
    } finally {
      setCreating(false);
    }
  };

  const handleMarkContacted = async () => {
    if (!contactModal) return;
    try {
      await salesApi.markContacted(contactModal._id, contactNotes);
      toast.success('Sub-contractor marked as contacted');
      setContactModal(null);
      setContactNotes('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update');
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

  const contactedBadge = (sc: any) => {
    if (sc.contactedAt) {
      return <span className="badge badge-green">✓ Contacted</span>;
    }
    return <span className="badge badge-yellow">Not contacted</span>;
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  const pendingContact = subContractors.filter(sc => !sc.contactedAt);

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
        <div className="stat-card highlight">
          <h3>{pendingContact.length}</h3>
          <p>Pending Contact</p>
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
                <th>Contact Status</th>
                <th>Actions</th>
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
                  <td>{contactedBadge(sc)}</td>
                  <td>
                    {!sc.contactedAt && (
                      <button className="btn-sm btn-primary" onClick={() => setContactModal(sc)}>
                        📞 Mark Contacted
                      </button>
                    )}
                    {sc.contactedAt && sc.contactNotes && (
                      <span className="notes-hint" title={sc.contactNotes}>📝 Has notes</span>
                    )}
                  </td>
                </tr>
              ))}
              {subContractors.length === 0 && (
                <tr><td colSpan={7} className="empty-state">No sub-contractors yet</td></tr>
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
              <div className="form-group">
                <label>GST Number</label>
                <input placeholder="e.g. 22AAAAA0000A1Z5 (optional)" value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input placeholder="City" value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <select value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}>
                    <option value="">-- Select State --</option>
                    {['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea placeholder="Internal notes about this lead..." value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
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

      {/* Contact Modal */}
      {contactModal && (
        <div className="modal-overlay" onClick={() => setContactModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Mark as Contacted</h2>
            <p>Sub-Contractor: <strong>{contactModal.companyName || contactModal.email}</strong></p>
            <p>Email: {contactModal.email}</p>
            {contactModal.phone && <p>Phone: {contactModal.phone}</p>}
            <div className="form-group">
              <label>Contact Notes (optional)</label>
              <textarea
                placeholder="Notes from the call..."
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setContactModal(null)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={handleMarkContacted}>
                Mark as Contacted
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;
