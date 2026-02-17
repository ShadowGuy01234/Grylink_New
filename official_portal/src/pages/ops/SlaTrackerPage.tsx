import { useState, useEffect, useCallback } from "react";
import { opsApi } from "../../api";
import toast from "react-hot-toast";
import {
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineFilter,
  HiOutlineChartBar,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlineDocumentText,
  HiOutlineExternalLink,
  HiOutlineBell,
} from "react-icons/hi";

interface SlaItem {
  _id: string;
  type: 'epc_verification' | 'bill_verification' | 'kyc_verification' | 'case_resolution';
  entityId: string;
  entityName: string;
  companyName?: string;
  assignedTo?: {
    _id: string;
    name: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'breached';
  deadline: string;
  createdAt: string;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface SlaStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  breached: number;
  avgCompletionTime: number;
  onTimeRate: number;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  activeItems: number;
  completedToday: number;
  breachedCount: number;
}

const SlaTrackerPage = () => {
  const [slaItems, setSlaItems] = useState<SlaItem[]>([]);
  const [stats, setStats] = useState<SlaStats | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  const fetchSlaData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsRes, statsRes, teamRes] = await Promise.all([
        opsApi.getSlaItems({ type: typeFilter, status: statusFilter, priority: priorityFilter }),
        opsApi.getSlaStats(),
        opsApi.getTeamWorkload(),
      ]);
      setSlaItems(itemsRes.data.items || []);
      setStats(statsRes.data);
      setTeam(teamRes.data.members || []);
    } catch {
      toast.error("Failed to load SLA data");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchSlaData();
    const interval = setInterval(fetchSlaData, 60000);
    return () => clearInterval(interval);
  }, [fetchSlaData]);

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const target = new Date(deadline);
    const diff = target.getTime() - now.getTime();
    
    if (diff < 0) {
      const hoursAgo = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
      return { text: `${hoursAgo}h overdue`, status: 'breached' };
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 2) return { text: `${hours}h ${minutes}m`, status: 'critical' };
    if (hours < 4) return { text: `${hours}h ${minutes}m`, status: 'warning' };
    if (hours < 8) return { text: `${hours}h`, status: 'attention' };
    return { text: `${hours}h`, status: 'ok' };
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      epc_verification: 'EPC Verification',
      bill_verification: 'Bill Verification',
      kyc_verification: 'KYC Verification',
      case_resolution: 'Case Resolution',
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, typeof HiOutlineClock> = {
      epc_verification: HiOutlineOfficeBuilding,
      bill_verification: HiOutlineDocumentText,
      kyc_verification: HiOutlineUser,
      case_resolution: HiOutlineDocumentText,
    };
    return icons[type] || HiOutlineClock;
  };

  const criticalItems = slaItems.filter(item => {
    const time = getTimeRemaining(item.deadline);
    return time.status === 'critical' || time.status === 'breached';
  });

  return (
    <div className="sla-tracker-page">
      <div className="page-header">
        <div className="header-content">
          <h1><HiOutlineClock /> SLA Tracker</h1>
          <p>Monitor and manage service level agreements across all operations</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={viewMode === 'list' ? 'active' : ''} 
              onClick={() => setViewMode('list')}
            >
              List
            </button>
            <button 
              className={viewMode === 'timeline' ? 'active' : ''} 
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </button>
          </div>
          <button className="btn-refresh" onClick={fetchSlaData}>
            <HiOutlineRefresh /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <HiOutlineChartBar />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.total || 0}</span>
            <span className="stat-label">Total Items</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <HiOutlineClock />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.pending || 0}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <HiOutlineCheckCircle />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.onTimeRate?.toFixed(0) || 0}%</span>
            <span className="stat-label">On-Time Rate</span>
          </div>
        </div>
        <div className="stat-card alert">
          <div className="stat-icon breached">
            <HiOutlineExclamation />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.breached || 0}</span>
            <span className="stat-label">Breached</span>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalItems.length > 0 && (
        <div className="alerts-section">
          <div className="alerts-header">
            <HiOutlineBell />
            <h2>Critical Alerts</h2>
            <span className="alert-count">{criticalItems.length}</span>
          </div>
          <div className="alerts-list">
            {criticalItems.slice(0, 5).map(item => {
              const time = getTimeRemaining(item.deadline);
              const Icon = getTypeIcon(item.type);
              return (
                <div key={item._id} className={`alert-card ${time.status}`}>
                  <Icon className="alert-icon" />
                  <div className="alert-info">
                    <span className="alert-title">{item.entityName}</span>
                    <span className="alert-type">{getTypeLabel(item.type)}</span>
                  </div>
                  <div className="alert-time">
                    <HiOutlineClock />
                    {time.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <HiOutlineFilter />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="epc_verification">EPC Verification</option>
              <option value="bill_verification">Bill Verification</option>
              <option value="kyc_verification">KYC Verification</option>
              <option value="case_resolution">Case Resolution</option>
            </select>
          </div>
          <div className="filter-group">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="breached">Breached</option>
            </select>
          </div>
          <div className="filter-group">
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <span className="result-count">{slaItems.length} items</span>
        </div>

        <div className="content-grid">
          {/* SLA Items Table/List */}
          <div className="sla-items-panel">
            {loading ? (
              <div className="loading-state">Loading SLA items...</div>
            ) : slaItems.length === 0 ? (
              <div className="empty-state">
                <HiOutlineClock />
                <p>No SLA items found</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="sla-table">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Type</th>
                      <th>Assigned To</th>
                      <th>Priority</th>
                      <th>Time Remaining</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {slaItems.map(item => {
                      const time = getTimeRemaining(item.deadline);
                      const Icon = getTypeIcon(item.type);
                      return (
                        <tr key={item._id} className={time.status}>
                          <td>
                            <div className="item-cell">
                              <Icon className="item-icon" />
                              <div>
                                <span className="item-name">{item.entityName}</span>
                                {item.companyName && (
                                  <span className="item-company">{item.companyName}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="type-badge">{getTypeLabel(item.type)}</span>
                          </td>
                          <td>
                            {item.assignedTo ? (
                              <span className="assignee">{item.assignedTo.name}</span>
                            ) : (
                              <span className="unassigned">Unassigned</span>
                            )}
                          </td>
                          <td>
                            <span className={`priority-badge ${item.priority}`}>
                              {item.priority}
                            </span>
                          </td>
                          <td>
                            <div className={`time-remaining ${time.status}`}>
                              <HiOutlineClock />
                              {time.text}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${item.status}`}>
                              {item.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>
                            <button className="btn-view" title="View Details">
                              <HiOutlineExternalLink />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="timeline-view">
                {slaItems.map(item => {
                  const time = getTimeRemaining(item.deadline);
                  const Icon = getTypeIcon(item.type);
                  return (
                    <div key={item._id} className={`timeline-item ${time.status}`}>
                      <div className="timeline-marker">
                        <Icon />
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-title">{item.entityName}</span>
                          <span className={`time-badge ${time.status}`}>
                            <HiOutlineClock />
                            {time.text}
                          </span>
                        </div>
                        <div className="timeline-meta">
                          <span className="type-tag">{getTypeLabel(item.type)}</span>
                          {item.assignedTo && (
                            <span className="assignee-tag">
                              <HiOutlineUser /> {item.assignedTo.name}
                            </span>
                          )}
                          <span className={`priority-tag ${item.priority}`}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${time.status}`}
                            style={{ width: `${Math.max(0, Math.min(100, 100 - (parseInt(time.text) / 24) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Team Workload Panel */}
          <div className="team-panel">
            <h3>Team Workload</h3>
            <div className="team-list">
              {team.map(member => (
                <div key={member._id} className="team-card">
                  <div className="team-avatar">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="team-info">
                    <span className="team-name">{member.name}</span>
                    <span className="team-email">{member.email}</span>
                  </div>
                  <div className="team-stats">
                    <div className="team-stat">
                      <span className="stat-num">{member.activeItems}</span>
                      <span className="stat-lab">Active</span>
                    </div>
                    <div className="team-stat completed">
                      <span className="stat-num">{member.completedToday}</span>
                      <span className="stat-lab">Today</span>
                    </div>
                    {member.breachedCount > 0 && (
                      <div className="team-stat breached">
                        <span className="stat-num">{member.breachedCount}</span>
                        <span className="stat-lab">Breached</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sla-tracker-page {
          padding: 24px;
          min-height: 100vh;
          background: var(--bg-secondary, #f8fafc);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .page-header h1 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary, #1e293b);
        }

        .page-header p {
          margin-top: 4px;
          color: var(--text-muted, #64748b);
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .view-toggle {
          display: flex;
          background: white;
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .view-toggle button {
          padding: 8px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }

        .view-toggle button.active {
          background: var(--primary);
          color: white;
        }

        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .stat-card.alert {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
        }

        .stat-icon.total {
          background: #dbeafe;
          color: #2563eb;
        }

        .stat-icon.pending {
          background: #fef3c7;
          color: #f59e0b;
        }

        .stat-icon.completed {
          background: #d1fae5;
          color: #10b981;
        }

        .stat-icon.breached {
          background: #fee2e2;
          color: #ef4444;
        }

        .stat-value {
          display: block;
          font-size: 28px;
          font-weight: 700;
        }

        .stat-label {
          font-size: 13px;
          color: var(--text-muted);
        }

        .alerts-section {
          background: white;
          border: 2px solid #ef4444;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }

        .alerts-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .alerts-header svg {
          color: #ef4444;
          font-size: 20px;
        }

        .alerts-header h2 {
          font-size: 16px;
          font-weight: 600;
          margin-right: auto;
        }

        .alert-count {
          background: #ef4444;
          color: white;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .alerts-list {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .alert-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #fef2f2;
          border-radius: 8px;
          min-width: 280px;
          border-left: 4px solid #ef4444;
        }

        .alert-card.critical {
          background: #fee2e2;
        }

        .alert-icon {
          font-size: 20px;
          color: #ef4444;
        }

        .alert-info {
          flex: 1;
        }

        .alert-title {
          display: block;
          font-weight: 600;
          font-size: 13px;
        }

        .alert-type {
          font-size: 11px;
          color: var(--text-muted);
        }

        .alert-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          color: #ef4444;
        }

        .main-content {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .filters-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-group select {
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          background: white;
        }

        .result-count {
          margin-left: auto;
          font-size: 13px;
          color: var(--text-muted);
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          min-height: 500px;
        }

        .sla-items-panel {
          border-right: 1px solid var(--border);
          overflow: auto;
        }

        .sla-table {
          width: 100%;
        }

        .sla-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .sla-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
        }

        .sla-table td {
          padding: 14px 16px;
          font-size: 13px;
          border-bottom: 1px solid var(--border);
        }

        .sla-table tr.critical, .sla-table tr.breached {
          background: #fef2f2;
        }

        .sla-table tr.warning {
          background: #fffbeb;
        }

        .item-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .item-icon {
          font-size: 20px;
          color: var(--primary);
        }

        .item-name {
          display: block;
          font-weight: 500;
        }

        .item-company {
          font-size: 11px;
          color: var(--text-muted);
        }

        .type-badge {
          padding: 4px 10px;
          background: var(--bg-secondary);
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
        }

        .assignee {
          font-weight: 500;
        }

        .unassigned {
          color: var(--text-muted);
          font-style: italic;
        }

        .priority-badge {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .priority-badge.critical {
          background: #fee2e2;
          color: #dc2626;
        }

        .priority-badge.high {
          background: #ffedd5;
          color: #ea580c;
        }

        .priority-badge.medium {
          background: #fef3c7;
          color: #d97706;
        }

        .priority-badge.low {
          background: #d1fae5;
          color: #059669;
        }

        .time-remaining {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          font-size: 13px;
        }

        .time-remaining.ok {
          color: #10b981;
        }

        .time-remaining.attention {
          color: #f59e0b;
        }

        .time-remaining.warning {
          color: #ea580c;
        }

        .time-remaining.critical, .time-remaining.breached {
          color: #dc2626;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.in_progress {
          background: #dbeafe;
          color: #2563eb;
        }

        .status-badge.completed {
          background: #d1fae5;
          color: #059669;
        }

        .status-badge.breached {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-view {
          width: 32px;
          height: 32px;
          border: 1px solid var(--border);
          background: white;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-view:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        /* Timeline View */
        .timeline-view {
          padding: 20px;
        }

        .timeline-item {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          padding-left: 8px;
        }

        .timeline-marker {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 2px solid var(--border);
        }

        .timeline-item.critical .timeline-marker,
        .timeline-item.breached .timeline-marker {
          border-color: #ef4444;
          background: #fee2e2;
          color: #ef4444;
        }

        .timeline-item.warning .timeline-marker {
          border-color: #f59e0b;
          background: #fef3c7;
          color: #f59e0b;
        }

        .timeline-content {
          flex: 1;
          padding: 12px 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
          border-left: 3px solid var(--border);
        }

        .timeline-item.critical .timeline-content,
        .timeline-item.breached .timeline-content {
          border-left-color: #ef4444;
          background: #fef2f2;
        }

        .timeline-item.warning .timeline-content {
          border-left-color: #f59e0b;
          background: #fffbeb;
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .timeline-title {
          font-weight: 600;
          font-size: 14px;
        }

        .time-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .time-badge.ok {
          color: #10b981;
        }

        .time-badge.attention, .time-badge.warning {
          color: #f59e0b;
        }

        .time-badge.critical, .time-badge.breached {
          color: #dc2626;
        }

        .timeline-meta {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .type-tag, .assignee-tag, .priority-tag {
          padding: 2px 8px;
          background: white;
          border-radius: 4px;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .priority-tag.critical {
          background: #fee2e2;
          color: #dc2626;
        }

        .priority-tag.high {
          background: #ffedd5;
          color: #ea580c;
        }

        .progress-bar {
          height: 4px;
          background: white;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #10b981;
          transition: width 0.3s;
        }

        .progress-fill.warning, .progress-fill.attention {
          background: #f59e0b;
        }

        .progress-fill.critical, .progress-fill.breached {
          background: #ef4444;
        }

        /* Team Panel */
        .team-panel {
          padding: 16px;
          background: var(--bg-secondary);
        }

        .team-panel h3 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .team-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .team-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border-radius: 8px;
        }

        .team-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .team-info {
          flex: 1;
          min-width: 0;
        }

        .team-name {
          display: block;
          font-weight: 600;
          font-size: 13px;
        }

        .team-email {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .team-stats {
          display: flex;
          gap: 8px;
        }

        .team-stat {
          text-align: center;
          padding: 4px 8px;
          background: var(--bg-secondary);
          border-radius: 6px;
        }

        .team-stat.completed {
          background: #d1fae5;
        }

        .team-stat.breached {
          background: #fee2e2;
        }

        .stat-num {
          display: block;
          font-size: 14px;
          font-weight: 700;
        }

        .stat-lab {
          font-size: 9px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px;
          color: var(--text-muted);
          gap: 12px;
        }

        .empty-state svg {
          font-size: 48px;
          opacity: 0.3;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .team-panel {
            border-top: 1px solid var(--border);
          }
        }

        @media (max-width: 768px) {
          .sla-tracker-page {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .page-header h1 {
            font-size: 20px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 16px;
          }

          .stat-card {
            padding: 14px;
          }

          .stat-value {
            font-size: 22px;
          }

          .alerts-bar {
            padding: 10px 12px;
            margin-bottom: 16px;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .filter-bar {
            flex-wrap: wrap;
            gap: 8px;
          }

          .filter-bar select {
            flex: 1;
            min-width: 100px;
          }

          .view-toggle {
            width: 100%;
            justify-content: center;
          }

          .content-grid {
            height: auto;
          }

          .main-content {
            min-height: 400px;
          }

          .team-panel {
            padding: 12px;
          }

          .team-card {
            padding: 10px;
          }

          .team-stats {
            flex-wrap: wrap;
          }

          .sla-item {
            padding: 12px;
          }

          .timeline-item {
            padding: 12px 16px;
          }

          .time-badge {
            font-size: 16px;
          }

          .timeline-hours {
            font-size: 10px;
          }

          .item-title {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .sla-tracker-page {
            padding: 12px;
          }

          .page-header h1 {
            font-size: 18px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filter-bar {
            flex-direction: column;
          }

          .filter-bar select {
            width: 100%;
          }

          .sla-list {
            padding: 8px;
          }

          .sla-item {
            padding: 10px;
          }

          .item-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .item-priority {
            align-self: flex-start;
          }

          .item-metrics {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .metric {
            width: 100%;
          }

          .timeline-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .timeline-time {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .timeline-meta {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default SlaTrackerPage;
