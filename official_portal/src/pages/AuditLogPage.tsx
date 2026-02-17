import { useState, useEffect, useCallback } from "react";
import { auditApi } from "../api";
import toast from "react-hot-toast";
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineRefresh,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUser,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineEye,
} from "react-icons/hi";

// Interfaces
interface AuditLog {
  _id: string;
  userId: { _id: string; name: string; email: string; role: string } | null;
  userName?: string;
  userRole: string;
  userEmail?: string;
  action: string;
  category: string;
  entityType?: string;
  entityId?: string;
  entityRef?: string;
  description: string;
  details?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  createdAt: string;
}

interface AuditStats {
  totalLogs: number;
  byCategory: Array<{ _id: string; count: number }>;
  byAction: Array<{ _id: string; count: number }>;
  byUser: Array<{ _id: { userId: string; userName: string }; count: number }>;
  recentFailures: AuditLog[];
  dailyActivity: Array<{ _id: string; count: number }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const CATEGORIES = ['AUTH', 'DOCUMENT', 'COMPANY', 'KYC', 'BILL', 'CASE', 'BID', 'TRANSACTION', 'NBFC', 'ADMIN', 'RISK', 'SLA', 'SYSTEM'];

const AuditLogPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'stats'>('logs');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAction] = useState('');
  const [filterSuccess, setFilterSuccess] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Detail modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { page, limit: 50 };
      if (searchQuery) params.search = searchQuery;
      if (filterCategory) params.category = filterCategory;
      if (filterAction) params.action = filterAction;
      if (filterSuccess) params.success = filterSuccess === 'true';
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await auditApi.getLogs(params as Record<string, unknown>);
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterCategory, filterAction, filterSuccess, startDate, endDate]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await auditApi.getStats(7);
      setStats(res.data);
    } catch {
      toast.error('Failed to load audit statistics');
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  const handleExport = async () => {
    try {
      const res = await auditApi.exportLogs({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        category: filterCategory || undefined,
        format: 'csv',
      });
      
      // Create download
      const blob = new Blob([res.data as string], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Export started');
    } catch {
      toast.error('Failed to export logs');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ');
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      AUTH: '#3b82f6',
      DOCUMENT: '#8b5cf6',
      COMPANY: '#059669',
      KYC: '#f59e0b',
      BILL: '#06b6d4',
      CASE: '#ec4899',
      BID: '#6366f1',
      TRANSACTION: '#10b981',
      NBFC: '#7c3aed',
      ADMIN: '#ef4444',
      RISK: '#dc2626',
      SLA: '#f97316',
      SYSTEM: '#6b7280',
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="audit-log-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Audit Logs</h1>
          <p>Track all user actions and system events for compliance and debugging</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={handleExport} title="Export CSV">
            <HiOutlineDownload />
          </button>
          <button className="btn-icon" onClick={() => fetchLogs()} title="Refresh">
            <HiOutlineRefresh />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue"><HiOutlineDocumentText /></div>
            <div className="stat-content">
              <h3>{stats.totalLogs}</h3>
              <p>Total Logs (7 days)</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><HiOutlineCheckCircle /></div>
            <div className="stat-content">
              <h3>{stats.byCategory.length}</h3>
              <p>Categories Active</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><HiOutlineUser /></div>
            <div className="stat-content">
              <h3>{stats.byUser.length}</h3>
              <p>Active Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red"><HiOutlineXCircle /></div>
            <div className="stat-content">
              <h3>{stats.recentFailures.length}</h3>
              <p>Recent Failures</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Activity Log
        </button>
        <button 
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Analytics
        </button>
      </div>

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="logs-section">
          {/* Filters */}
          <div className="filters-bar">
            <div className="search-box">
              <HiOutlineSearch />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
              />
            </div>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select value={filterSuccess} onChange={(e) => setFilterSuccess(e.target.value)}>
              <option value="">All Status</option>
              <option value="true">Success</option>
              <option value="false">Failed</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
            <button className="btn-filter" onClick={() => fetchLogs()}>
              <HiOutlineFilter /> Apply
            </button>
          </div>

          {/* Logs Table */}
          {loading ? (
            <div className="loading">Loading audit logs...</div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <HiOutlineDocumentText />
              <p>No audit logs found matching your filters</p>
            </div>
          ) : (
            <>
              <div className="logs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Category</th>
                      <th>Entity</th>
                      <th>Status</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log._id} className={!log.success ? 'failed' : ''}>
                        <td className="timestamp">
                          <HiOutlineClock />
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="user">
                          <div className="user-info">
                            <span className="user-name">{log.userId?.name || log.userName || 'System'}</span>
                            <span className="user-role">{log.userRole}</span>
                          </div>
                        </td>
                        <td className="action">{formatAction(log.action)}</td>
                        <td className="category">
                          <span 
                            className="category-badge"
                            style={{ backgroundColor: getCategoryColor(log.category) }}
                          >
                            {log.category}
                          </span>
                        </td>
                        <td className="entity">
                          {log.entityRef || log.entityType || '-'}
                        </td>
                        <td className="status">
                          {log.success ? (
                            <span className="status-badge success">
                              <HiOutlineCheckCircle /> Success
                            </span>
                          ) : (
                            <span className="status-badge failed">
                              <HiOutlineXCircle /> Failed
                            </span>
                          )}
                        </td>
                        <td className="details">
                          <button 
                            className="btn-view"
                            onClick={() => setSelectedLog(log)}
                          >
                            <HiOutlineEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button 
                  disabled={pagination.page === 1}
                  onClick={() => fetchLogs(pagination.page - 1)}
                >
                  <HiOutlineChevronLeft /> Previous
                </button>
                <span>Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
                <button 
                  disabled={pagination.page === pagination.pages}
                  onClick={() => fetchLogs(pagination.page + 1)}
                >
                  Next <HiOutlineChevronRight />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="stats-section">
          <div className="stats-grid-full">
            {/* Activity by Category */}
            <div className="stat-panel">
              <h3>Activity by Category</h3>
              <div className="chart-bars">
                {stats.byCategory.map((item) => (
                  <div key={item._id} className="bar-item">
                    <div className="bar-label">{item._id}</div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill"
                        style={{
                          width: `${(item.count / Math.max(...stats.byCategory.map(c => c.count))) * 100}%`,
                          backgroundColor: getCategoryColor(item._id),
                        }}
                      />
                    </div>
                    <div className="bar-value">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Actions */}
            <div className="stat-panel">
              <h3>Top Actions</h3>
              <div className="top-list">
                {stats.byAction.map((item, idx) => (
                  <div key={item._id} className="top-item">
                    <span className="top-rank">{idx + 1}</span>
                    <span className="top-label">{formatAction(item._id)}</span>
                    <span className="top-count">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Active Users */}
            <div className="stat-panel">
              <h3>Most Active Users</h3>
              <div className="top-list">
                {stats.byUser.map((item, idx) => (
                  <div key={item._id.userId} className="top-item">
                    <span className="top-rank">{idx + 1}</span>
                    <span className="top-label">{item._id.userName || 'Unknown'}</span>
                    <span className="top-count">{item.count} actions</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Activity */}
            <div className="stat-panel wide">
              <h3>Daily Activity (Last 7 Days)</h3>
              <div className="daily-chart">
                {stats.dailyActivity.map((day) => (
                  <div key={day._id} className="daily-bar">
                    <div 
                      className="daily-fill"
                      style={{
                        height: `${(day.count / Math.max(...stats.dailyActivity.map(d => d.count))) * 100}%`,
                      }}
                    />
                    <span className="daily-label">{new Date(day._id).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                    <span className="daily-count">{day.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Failures */}
            {stats.recentFailures.length > 0 && (
              <div className="stat-panel wide">
                <h3>Recent Failures</h3>
                <div className="failures-list">
                  {stats.recentFailures.map((log) => (
                    <div key={log._id} className="failure-item">
                      <div className="failure-header">
                        <span className="failure-action">{formatAction(log.action)}</span>
                        <span className="failure-time">{formatDate(log.createdAt)}</span>
                      </div>
                      <div className="failure-details">
                        <span>{log.userId?.name || 'System'}</span>
                        {log.errorMessage && <span className="error-msg">{log.errorMessage}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Audit Log Details</h2>
              <button className="modal-close" onClick={() => setSelectedLog(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Timestamp</label>
                  <span>{formatDate(selectedLog.createdAt)}</span>
                </div>
                <div className="detail-item">
                  <label>User</label>
                  <span>{selectedLog.userId?.name || selectedLog.userName || 'System'}</span>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <span>{selectedLog.userId?.email || selectedLog.userEmail || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Role</label>
                  <span className="role-badge">{selectedLog.userRole}</span>
                </div>
                <div className="detail-item">
                  <label>Action</label>
                  <span>{formatAction(selectedLog.action)}</span>
                </div>
                <div className="detail-item">
                  <label>Category</label>
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(selectedLog.category) }}
                  >
                    {selectedLog.category}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Entity Type</label>
                  <span>{selectedLog.entityType || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Entity Reference</label>
                  <span>{selectedLog.entityRef || selectedLog.entityId || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${selectedLog.success ? 'success' : 'failed'}`}>
                    {selectedLog.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>IP Address</label>
                  <span>{selectedLog.ipAddress || '-'}</span>
                </div>
                <div className="detail-item full">
                  <label>Description</label>
                  <span>{selectedLog.description}</span>
                </div>
                {selectedLog.errorMessage && (
                  <div className="detail-item full error">
                    <label>Error Message</label>
                    <span>{selectedLog.errorMessage}</span>
                  </div>
                )}
                {selectedLog.details && (
                  <div className="detail-item full">
                    <label>Additional Details</label>
                    <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .audit-log-page {
          padding: 24px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .header-content h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .header-content p {
          color: #64748b;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #64748b;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #f8fafc;
          color: #2563eb;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid #e2e8f0;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .stat-icon.blue { background: #dbeafe; color: #2563eb; }
        .stat-icon.green { background: #d1fae5; color: #059669; }
        .stat-icon.purple { background: #ede9fe; color: #7c3aed; }
        .stat-icon.red { background: #fee2e2; color: #dc2626; }

        .stat-content h3 {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-content p {
          font-size: 13px;
          color: #64748b;
        }

        /* Tabs */
        .tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          background: white;
          padding: 4px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          width: fit-content;
        }

        .tab {
          padding: 10px 20px;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .tab:hover {
          background: #f8fafc;
        }

        .tab.active {
          background: #2563eb;
          color: white;
        }

        /* Filters */
        .filters-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          min-width: 250px;
        }

        .search-box input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 14px;
        }

        .filters-bar select,
        .filters-bar input[type="date"] {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .btn-filter {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-filter:hover {
          background: #1d4ed8;
        }

        /* Table */
        .logs-table {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .logs-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .logs-table th {
          text-align: left;
          padding: 12px 16px;
          background: #f8fafc;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
        }

        .logs-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
          color: #1e293b;
        }

        .logs-table tr:hover {
          background: #f8fafc;
        }

        .logs-table tr.failed {
          background: #fef2f2;
        }

        .timestamp {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          font-size: 13px;
          white-space: nowrap;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 500;
        }

        .user-role {
          font-size: 12px;
          color: #64748b;
          text-transform: capitalize;
        }

        .category-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.success {
          background: #d1fae5;
          color: #059669;
        }

        .status-badge.failed {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-view {
          width: 32px;
          height: 32px;
          border: none;
          background: #f1f5f9;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
        }

        .btn-view:hover {
          background: #2563eb;
          color: white;
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 16px;
        }

        .pagination button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination button:hover:not(:disabled) {
          background: #f8fafc;
        }

        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination span {
          font-size: 14px;
          color: #64748b;
        }

        /* Stats Section */
        .stats-grid-full {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .stat-panel {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }

        .stat-panel.wide {
          grid-column: span 3;
        }

        .stat-panel h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .chart-bars {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .bar-item {
          display: grid;
          grid-template-columns: 100px 1fr 50px;
          align-items: center;
          gap: 12px;
        }

        .bar-label {
          font-size: 13px;
          color: #64748b;
        }

        .bar-container {
          height: 20px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .bar-value {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          text-align: right;
        }

        .top-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .top-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          background: #f8fafc;
          border-radius: 6px;
        }

        .top-rank {
          width: 24px;
          height: 24px;
          background: #2563eb;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .top-label {
          flex: 1;
          font-size: 14px;
          color: #1e293b;
        }

        .top-count {
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
        }

        .daily-chart {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 150px;
          padding-top: 20px;
        }

        .daily-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .daily-fill {
          width: 40px;
          background: linear-gradient(to top, #2563eb, #60a5fa);
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease;
        }

        .daily-label {
          font-size: 12px;
          color: #64748b;
        }

        .daily-count {
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
        }

        .failures-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .failure-item {
          padding: 12px;
          background: #fef2f2;
          border-radius: 8px;
          border-left: 3px solid #dc2626;
        }

        .failure-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .failure-action {
          font-weight: 500;
          color: #dc2626;
        }

        .failure-time {
          font-size: 12px;
          color: #64748b;
        }

        .failure-details {
          display: flex;
          flex-direction: column;
          font-size: 13px;
          color: #64748b;
        }

        .error-msg {
          color: #dc2626;
          font-style: italic;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h2 {
          font-size: 18px;
          font-weight: 600;
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border: none;
          background: #f1f5f9;
          border-radius: 6px;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-body {
          padding: 24px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item.full {
          grid-column: span 2;
        }

        .detail-item.error span {
          color: #dc2626;
        }

        .detail-item label {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
        }

        .detail-item span {
          font-size: 14px;
          color: #1e293b;
        }

        .detail-item pre {
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          font-size: 12px;
          overflow-x: auto;
        }

        .role-badge {
          display: inline-block;
          padding: 4px 8px;
          background: #ede9fe;
          color: #7c3aed;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .stats-grid-full {
            grid-template-columns: 1fr;
          }

          .stat-panel.wide {
            grid-column: span 1;
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: 100%;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .detail-item.full {
            grid-column: span 1;
          }
        }

        .loading,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px;
          color: #64748b;
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .empty-state svg {
          font-size: 48px;
        }
      `}</style>
    </div>
  );
};

export default AuditLogPage;
