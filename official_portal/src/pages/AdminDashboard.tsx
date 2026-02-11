import React, { useState, useEffect } from 'react';
import { adminApi } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  companyId?: { companyName: string };
  subContractorId?: { companyName: string };
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  byRole: Array<{ _id: string; total: number; active: number; inactive: number }>;
}

const ROLES = ['sales', 'ops', 'rmt', 'admin'];

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'sales',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const params: any = {};
      if (filterRole) params.role = filterRole;
      if (filterActive) params.isActive = filterActive === 'active';
      if (searchQuery) params.search = searchQuery;

      const [usersRes, statsRes] = await Promise.all([
        adminApi.getUsers(params),
        adminApi.getStats(),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterRole, filterActive, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingUser) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await adminApi.updateUser(editingUser._id, updateData);
        toast.success('User updated successfully');
      } else {
        await adminApi.createUser(formData);
        toast.success('User created successfully');
      }
      closeModal();
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      if (user.isActive) {
        await adminApi.deleteUser(user._id);
        toast.success('User deactivated');
      } else {
        await adminApi.restoreUser(user._id);
        toast.success('User activated');
      }
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update user status');
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', phone: '', role: 'sales' });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', phone: '', role: 'sales' });
  };

  const statusBadge = (isActive: boolean) => (
    <span className={`badge ${isActive ? 'badge-green' : 'badge-red'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'badge-purple',
      sales: 'badge-blue',
      ops: 'badge-yellow',
      rmt: 'badge-green',
      epc: 'badge-cyan',
      subcontractor: 'badge-orange',
    };
    return <span className={`badge ${colors[role] || 'badge-gray'}`}>{role.toUpperCase()}</span>;
  };

  const getRoleCount = (role: string) => {
    const roleStats = stats?.byRole.find((r) => r._id === role);
    return roleStats?.total || 0;
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          + Create User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats?.totalUsers || 0}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card stat-success">
          <h3>{stats?.activeUsers || 0}</h3>
          <p>Active Users</p>
        </div>
        <div className="stat-card stat-danger">
          <h3>{stats?.inactiveUsers || 0}</h3>
          <p>Inactive Users</p>
        </div>
        <div className="stat-card stat-info">
          <h3>{getRoleCount('admin')}</h3>
          <p>Admins</p>
        </div>
      </div>

      {/* Role breakdown */}
      <div className="stats-grid small-stats">
        {ROLES.map((role) => (
          <div key={role} className="stat-card-mini">
            <span className="stat-label">{role.toUpperCase()}</span>
            <span className="stat-value">{getRoleCount(role)}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Role</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">All Roles</option>
            {['sales', 'ops', 'rmt', 'admin', 'epc', 'subcontractor'].map((r) => (
              <option key={r} value={r}>{r.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-section">
        <h2>Users ({users.length})</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className={!user.isActive ? 'inactive-row' : ''}>
                  <td>
                    {user.name}
                    {currentUser?.id === user._id && <span className="you-badge">(You)</span>}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || '—'}</td>
                  <td>{roleBadge(user.role)}</td>
                  <td>{statusBadge(user.isActive)}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-sm btn-secondary" onClick={() => openEditModal(user)}>
                        Edit
                      </button>
                      {currentUser?.id !== user._id && (
                        <button
                          className={`btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleActive(user)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingUser ? 'Edit User' : 'Create User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{editingUser ? 'Password (leave blank to keep current)' : 'Password *'}</label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? '••••••••' : ''}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={editingUser && currentUser?.id === editingUser._id}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.toUpperCase()}</option>
                  ))}
                </select>
                {editingUser && currentUser?.id === editingUser._id && (
                  <span className="form-hint">You cannot change your own role</span>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
