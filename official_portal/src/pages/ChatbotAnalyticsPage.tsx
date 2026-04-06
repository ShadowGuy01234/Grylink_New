import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { chatbotApi } from '../api';

type FeedbackMetrics = {
  positive: number;
  negative: number;
  neutral: number;
};

type ChatbotSummary = {
  window?: {
    days?: number;
    since?: string;
  };
  metrics?: {
    totalEvents?: number;
    queryEvents?: number;
    cacheHitEvents?: number;
    cacheHitRate?: number;
    avgResponseTimeMs?: number;
    activeSessions?: number;
    feedback?: FeedbackMetrics;
    securityEvents?: number;
  };
  knowledgeGaps?: Array<{
    topic?: string;
    count?: number;
  }>;
};

type SecurityRecord = {
  eventType?: string;
  severity?: string;
  prompt?: string;
  issues?: string[];
  blocked?: boolean;
  reason?: string;
  userRole?: string;
  createdAt?: string;
};

type SecurityResponse = {
  count?: number;
  records?: SecurityRecord[];
};

const DAY_OPTIONS = [7, 30, 90];

function formatPercent(value?: number): string {
  if (!Number.isFinite(value)) return '0.00%';
  return `${Number(value).toFixed(2)}%`;
}

function formatMs(value?: number): string {
  if (!Number.isFinite(value)) return '0 ms';
  return `${Math.round(Number(value))} ms`;
}

function formatDate(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function getSeverityBadgeStyle(severity?: string) {
  const normalized = String(severity || '').toLowerCase();
  if (normalized === 'critical') {
    return {
      color: '#991b1b',
      backgroundColor: '#fee2e2',
      border: '1px solid #fecaca',
    };
  }
  if (normalized === 'high') {
    return {
      color: '#9a3412',
      backgroundColor: '#ffedd5',
      border: '1px solid #fed7aa',
    };
  }
  if (normalized === 'medium') {
    return {
      color: '#1d4ed8',
      backgroundColor: '#dbeafe',
      border: '1px solid #bfdbfe',
    };
  }
  return {
    color: '#166534',
    backgroundColor: '#dcfce7',
    border: '1px solid #bbf7d0',
  };
}

const ChatbotAnalyticsPage = () => {
  const [days, setDays] = useState<number>(7);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [summary, setSummary] = useState<ChatbotSummary | null>(null);
  const [securityData, setSecurityData] = useState<SecurityResponse | null>(null);

  const loadAnalytics = useCallback(
    async (nextDays: number, isManualRefresh = false) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const [summaryResponse, securityResponse] = await Promise.all([
          chatbotApi.getAnalyticsSummary(nextDays),
          chatbotApi.getSecurityAnalytics(50),
        ]);

        setSummary(summaryResponse?.data || null);
        setSecurityData(securityResponse?.data || null);
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Failed to load chatbot analytics';
        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadAnalytics(days);
  }, [days, loadAnalytics]);

  const metrics = summary?.metrics || {};
  const feedback = metrics.feedback || { positive: 0, negative: 0, neutral: 0 };
  const knowledgeGaps = useMemo(() => summary?.knowledgeGaps || [], [summary]);
  const securityRecords = useMemo(() => securityData?.records || [], [securityData]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner">Loading chatbot analytics...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Chatbot Analytics</h1>
          <p>Operational metrics, feedback quality, and security events for Grybot.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label htmlFor="analytics-days">Window</label>
          <select
            id="analytics-days"
            className="form-control"
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            style={{ minWidth: '90px' }}
          >
            {DAY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} days
              </option>
            ))}
          </select>
          <button
            className="btn-secondary"
            onClick={() => loadAnalytics(days, true)}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Events</h3>
          <div className="stat-number">{metrics.totalEvents || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Query Events</h3>
          <div className="stat-number">{metrics.queryEvents || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Cache Hit Rate</h3>
          <div className="stat-number">{formatPercent(metrics.cacheHitRate)}</div>
        </div>
        <div className="stat-card">
          <h3>Avg Response Time</h3>
          <div className="stat-number">{formatMs(metrics.avgResponseTimeMs)}</div>
        </div>
        <div className="stat-card">
          <h3>Active Sessions</h3>
          <div className="stat-number">{metrics.activeSessions || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Security Events</h3>
          <div className="stat-number">{metrics.securityEvents || 0}</div>
        </div>
      </div>

      <div className="table-section" style={{ marginTop: '1.25rem' }}>
        <h2>Feedback Breakdown</h2>
        <div className="stats-grid" style={{ marginTop: '0.75rem' }}>
          <div className="stat-card">
            <h3>Positive</h3>
            <div className="stat-number">{feedback.positive || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Negative</h3>
            <div className="stat-number">{feedback.negative || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Neutral</h3>
            <div className="stat-number">{feedback.neutral || 0}</div>
          </div>
        </div>
      </div>

      <div className="table-section" style={{ marginTop: '1.25rem' }}>
        <h2>Top Knowledge Gaps</h2>
        {knowledgeGaps.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '0.5rem' }}>
            No repeated fallback topics in the selected time window.
          </div>
        ) : (
          <div className="table-wrapper" style={{ marginTop: '0.75rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {knowledgeGaps.map((gap, index) => (
                  <tr key={`${gap.topic || 'unknown'}-${index}`}>
                    <td>{gap.topic || 'Unknown'}</td>
                    <td>{gap.count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="table-section" style={{ marginTop: '1.25rem' }}>
        <h2>Recent Security Records ({securityData?.count || 0})</h2>
        {securityRecords.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '0.5rem' }}>
            No security records found.
          </div>
        ) : (
          <div className="table-wrapper" style={{ marginTop: '0.75rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Role</th>
                  <th>Blocked</th>
                  <th>Issues</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {securityRecords.map((record, index) => (
                  <tr key={`${record.createdAt || 'event'}-${index}`}>
                    <td>{formatDate(record.createdAt)}</td>
                    <td>{record.eventType || '-'}</td>
                    <td>
                      <span
                        style={{
                          ...getSeverityBadgeStyle(record.severity),
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {record.severity || 'low'}
                      </span>
                    </td>
                    <td>{record.userRole || 'public'}</td>
                    <td>{record.blocked ? 'Yes' : 'No'}</td>
                    <td>{Array.isArray(record.issues) ? record.issues.join(', ') : '-'}</td>
                    <td>{record.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotAnalyticsPage;
