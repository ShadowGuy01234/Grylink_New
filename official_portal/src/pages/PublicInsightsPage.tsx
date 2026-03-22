import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../api";

type FeedbackStatus = "new" | "in_review" | "resolved" | "closed";

type InsightsResponse = {
  totals: { feedback: number; leads: number; analyticsEvents: number };
  feedbackByStatus: Array<{ _id: string; count: number }>;
  feedbackByType: Array<{ _id: string; count: number }>;
  leadBySource: Array<{ _id: string; count: number }>;
  analyticsTop: Array<{ _id: string; count: number }>;
  recentFeedback: Array<{
    _id: string;
    type: string;
    roleContext: string;
    message: string;
    status: FeedbackStatus;
    createdAt: string;
    pagePath?: string;
  }>;
  recentLeads: Array<{
    _id: string;
    source: string;
    roleInterest: string;
    name?: string;
    email: string;
    company?: string;
    status: string;
    createdAt: string;
  }>;
};

const statusOptions: FeedbackStatus[] = ["new", "in_review", "resolved", "closed"];

export default function PublicInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPublicInsights();
      setInsights(response.data);
    } catch {
      toast.error("Failed to load public insights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const topEvents = useMemo(() => insights?.analyticsTop ?? [], [insights]);

  async function updateFeedbackStatus(id: string, status: FeedbackStatus) {
    try {
      setUpdatingId(id);
      await adminApi.updatePublicFeedbackStatus(id, status);
      toast.success("Feedback status updated");
      await fetchInsights();
    } catch {
      toast.error("Unable to update feedback status");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <div className="page-loading">Loading public insights...</div>;
  if (!insights) return <div className="page-loading">No insights available.</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Public Analytics & Feedback</h1>
        <button className="btn-secondary" onClick={fetchInsights}>
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{insights.totals.analyticsEvents}</h3>
          <p>Analytics Events</p>
        </div>
        <div className="stat-card stat-info">
          <h3>{insights.totals.feedback}</h3>
          <p>Feedback Submissions</p>
        </div>
        <div className="stat-card stat-success">
          <h3>{insights.totals.leads}</h3>
          <p>Public Leads</p>
        </div>
      </div>

      <div className="table-section">
        <h2>Top Public Events (7d)</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {topEvents.map((event) => (
                <tr key={event._id}>
                  <td>{event._id}</td>
                  <td>{event.count}</td>
                </tr>
              ))}
              {topEvents.length === 0 && (
                <tr>
                  <td colSpan={2} className="empty-state">
                    No events recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-section">
        <h2>Recent Feedback</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Role</th>
                <th>Message</th>
                <th>Page</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {insights.recentFeedback.map((item) => (
                <tr key={item._id}>
                  <td>{item.type}</td>
                  <td>{item.roleContext}</td>
                  <td>{item.message.length > 120 ? `${item.message.slice(0, 120)}...` : item.message}</td>
                  <td>{item.pagePath || "-"}</td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => updateFeedbackStatus(item._id, e.target.value as FeedbackStatus)}
                      disabled={updatingId === item._id}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {insights.recentFeedback.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No feedback submitted yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-section">
        <h2>Recent Leads</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Company</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {insights.recentLeads.map((lead) => (
                <tr key={lead._id}>
                  <td>{lead.source}</td>
                  <td>{lead.name || "-"}</td>
                  <td>{lead.email}</td>
                  <td>{lead.roleInterest}</td>
                  <td>{lead.company || "-"}</td>
                  <td>{new Date(lead.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {insights.recentLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No public leads captured yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
