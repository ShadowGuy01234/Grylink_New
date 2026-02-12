import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { agentApi, approvalApi, rekycApi, transactionApi, cronApi } from '../api';

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  introducedEpcs: any[];
  commissions: any[];
  misconductHistory: any[];
  metrics: {
    totalEpcsIntroduced: number;
    totalCommissionEarned: number;
    totalCommissionPaid: number;
  };
}

interface Approval {
  _id: string;
  requestType: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  requestedBy: { name: string };
}

interface ReKycPending {
  entityType: string;
  entityId: string;
  name: string;
  latestTrigger: {
    trigger: string;
    reason: string;
    triggeredAt: string;
  };
}

const FounderDashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [rekyc, setRekyc] = useState<ReKycPending[]>([]);
  const [overdueTransactions, setOverdueTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('approvals');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [cronStatus, setCronStatus] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [agentsRes, approvalsRes, rekycRes, overdueRes] = await Promise.all([
        agentApi.getAll(),
        approvalApi.getMyPending(),
        rekycApi.getPending(),
        transactionApi.getOverdue(),
      ]);
      setAgents(agentsRes.data);
      setApprovals(approvalsRes.data);
      setRekyc(rekycRes.data?.data || []);
      setOverdueTransactions(overdueRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproval = async (id: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approvalApi.approve(id, 'Approved by Founder');
      } else {
        await approvalApi.reject(id, 'Rejected by Founder');
      }
      toast.success(`Request ${action}d`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleMisconductDecision = async (agentId: string, index: number, decision: string, action: string) => {
    try {
      await agentApi.handleMisconductDecision(agentId, index, decision, action);
      toast.success('Misconduct decision recorded');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process');
    }
  };

  const handleCompleteReKyc = async (entityType: string, entityId: string) => {
    try {
      await rekycApi.complete(entityType, entityId);
      toast.success('Re-KYC completed');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete');
    }
  };

  const loadCronStatus = async () => {
    try {
      const res = await cronApi.getStatus();
      setCronStatus(res.data);
    } catch {
      toast.error('Failed to load cron status');
    }
  };

  const runCronJob = async (job: string) => {
    try {
      let res;
      switch (job) {
        case 'dormant': res = await cronApi.runDormant(); break;
        case 'sla': res = await cronApi.runSlaReminders(); break;
        case 'kyc': res = await cronApi.runKycExpiry(); break;
        case 'overdue': res = await cronApi.runOverdueNotifications(); break;
        case 'all': res = await cronApi.runAll(); break;
        default: return;
      }
      toast.success(res.data.message || 'Job completed');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Job failed');
    }
  };

  const priorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'badge-gray', MEDIUM: 'badge-yellow', HIGH: 'badge-orange', CRITICAL: 'badge-red',
    };
    return <span className={`badge ${colors[priority] || 'badge-gray'}`}>{priority}</span>;
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'badge-green', WARNED: 'badge-yellow', SUSPENDED: 'badge-orange', BLACKLISTED: 'badge-red',
      PENDING: 'badge-yellow', APPROVED: 'badge-green', REJECTED: 'badge-red',
    };
    return <span className={`badge ${colors[status] || 'badge-gray'}`}>{status}</span>;
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Founder Dashboard</h1>
        <p className="subtitle">Strategic oversight and approvals</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-warning">
          <h3>{approvals.length}</h3>
          <p>Pending Approvals</p>
        </div>
        <div className="stat-card stat-info">
          <h3>{agents.length}</h3>
          <p>Active Agents</p>
        </div>
        <div className="stat-card stat-purple">
          <h3>{rekyc.length}</h3>
          <p>Pending Re-KYC</p>
        </div>
        <div className="stat-card stat-danger">
          <h3>{overdueTransactions.length}</h3>
          <p>Overdue Transactions</p>
        </div>
      </div>

      <div className="tabs">
        <button className={activeTab === 'approvals' ? 'active' : ''} onClick={() => setActiveTab('approvals')}>
          Approvals ({approvals.length})
        </button>
        <button className={activeTab === 'agents' ? 'active' : ''} onClick={() => setActiveTab('agents')}>
          Agents ({agents.length})
        </button>
        <button className={activeTab === 'rekyc' ? 'active' : ''} onClick={() => setActiveTab('rekyc')}>
          Re-KYC ({rekyc.length})
        </button>
        <button className={activeTab === 'overdue' ? 'active' : ''} onClick={() => setActiveTab('overdue')}>
          Overdue ({overdueTransactions.length})
        </button>
        <button className={activeTab === 'cron' ? 'active' : ''} onClick={() => { setActiveTab('cron'); loadCronStatus(); }}>
          System Jobs
        </button>
      </div>

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="tab-content">
          {approvals.length === 0 ? (
            <div className="empty-state">No pending approvals</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Requested By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((a) => (
                  <tr key={a._id}>
                    <td>{a.requestType}</td>
                    <td>{a.title}</td>
                    <td>{priorityBadge(a.priority)}</td>
                    <td>{a.requestedBy?.name}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-success btn-sm" onClick={() => handleApproval(a._id, 'approve')}>
                        Approve
                      </button>
                      <button className="btn btn-danger btn-sm ml-2" onClick={() => handleApproval(a._id, 'reject')}>
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <div className="tab-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>EPCs Introduced</th>
                <th>Total Commission</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent._id}>
                  <td>{agent.name}</td>
                  <td>{agent.email}</td>
                  <td>{statusBadge(agent.status)}</td>
                  <td>{agent.metrics?.totalEpcsIntroduced || 0}</td>
                  <td>₹{(agent.metrics?.totalCommissionEarned || 0).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => setSelectedAgent(agent)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr><td colSpan={6} className="empty-state">No agents registered</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Re-KYC Tab */}
      {activeTab === 'rekyc' && (
        <div className="tab-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>Entity Type</th>
                <th>Name</th>
                <th>Trigger</th>
                <th>Triggered At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rekyc.map((r, i) => (
                <tr key={i}>
                  <td><span className={`badge ${r.entityType === 'COMPANY' ? 'badge-blue' : 'badge-purple'}`}>{r.entityType}</span></td>
                  <td>{r.name}</td>
                  <td>{r.latestTrigger?.trigger}</td>
                  <td>{r.latestTrigger?.triggeredAt ? new Date(r.latestTrigger.triggeredAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <button className="btn btn-success btn-sm" onClick={() => handleCompleteReKyc(r.entityType, r.entityId)}>
                      Complete Re-KYC
                    </button>
                  </td>
                </tr>
              ))}
              {rekyc.length === 0 && (
                <tr><td colSpan={5} className="empty-state">No pending Re-KYC</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Overdue Tab */}
      {activeTab === 'overdue' && (
        <div className="tab-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction #</th>
                <th>Seller</th>
                <th>Buyer</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Days Overdue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {overdueTransactions.map((tx) => (
                <tr key={tx._id}>
                  <td>{tx.transactionNumber}</td>
                  <td>{tx.sellerId?.companyName || '-'}</td>
                  <td>{tx.buyerId?.companyName || '-'}</td>
                  <td>₹{tx.billAmount?.toLocaleString()}</td>
                  <td>{tx.repayment?.dueDate ? new Date(tx.repayment.dueDate).toLocaleDateString() : '-'}</td>
                  <td className="text-danger">{tx.repayment?.overdueBy || 0} days</td>
                  <td>{statusBadge(tx.repayment?.status || 'PENDING')}</td>
                </tr>
              ))}
              {overdueTransactions.length === 0 && (
                <tr><td colSpan={7} className="empty-state">No overdue transactions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Cron Jobs Tab */}
      {activeTab === 'cron' && (
        <div className="tab-content">
          <div className="card">
            <h3>System Scheduled Jobs</h3>
            <p className="text-muted mb-4">Manual triggers for scheduled background tasks</p>
            
            <div className="cron-grid">
              <div className="cron-job-card">
                <h4>Dormant Marking</h4>
                <p>Marks inactive SubContractors as dormant (90 days)</p>
                <button className="btn btn-primary" onClick={() => runCronJob('dormant')}>Run Now</button>
              </div>
              <div className="cron-job-card">
                <h4>SLA Reminders</h4>
                <p>Send reminders for upcoming SLA milestones</p>
                <button className="btn btn-primary" onClick={() => runCronJob('sla')}>Run Now</button>
              </div>
              <div className="cron-job-card">
                <h4>KYC Expiry Check</h4>
                <p>Check for expiring KYC documents</p>
                <button className="btn btn-primary" onClick={() => runCronJob('kyc')}>Run Now</button>
              </div>
              <div className="cron-job-card">
                <h4>Overdue Notifications</h4>
                <p>Send 1-month CWC due date reminders</p>
                <button className="btn btn-primary" onClick={() => runCronJob('overdue')}>Run Now</button>
              </div>
            </div>

            <div className="mt-4">
              <button className="btn btn-warning" onClick={() => runCronJob('all')}>Run All Jobs</button>
            </div>

            {cronStatus?.jobs && (
              <div className="mt-4">
                <h4>Job Schedules</h4>
                <table className="data-table">
                  <thead>
                    <tr><th>Job</th><th>Schedule</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    {cronStatus.jobs.map((job: any, i: number) => (
                      <tr key={i}>
                        <td>{job.name}</td>
                        <td>{job.schedule}</td>
                        <td>{job.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="modal-overlay" onClick={() => setSelectedAgent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedAgent.name}</h2>
              <button className="close-btn" onClick={() => setSelectedAgent(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="agent-details">
                <p><strong>Email:</strong> {selectedAgent.email}</p>
                <p><strong>Phone:</strong> {selectedAgent.phone}</p>
                <p><strong>Status:</strong> {statusBadge(selectedAgent.status)}</p>
                
                <h4 className="mt-4">Metrics</h4>
                <div className="stats-grid small">
                  <div className="stat-card">
                    <h3>{selectedAgent.metrics?.totalEpcsIntroduced || 0}</h3>
                    <p>EPCs Introduced</p>
                  </div>
                  <div className="stat-card">
                    <h3>₹{(selectedAgent.metrics?.totalCommissionEarned || 0).toLocaleString()}</h3>
                    <p>Total Earned</p>
                  </div>
                  <div className="stat-card">
                    <h3>₹{(selectedAgent.metrics?.totalCommissionPaid || 0).toLocaleString()}</h3>
                    <p>Paid Out</p>
                  </div>
                </div>

                {selectedAgent.misconductHistory?.length > 0 && (
                  <>
                    <h4 className="mt-4">Misconduct History</h4>
                    <table className="data-table">
                      <thead>
                        <tr><th>Type</th><th>Date</th><th>Status</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        {selectedAgent.misconductHistory.map((m: any, i: number) => (
                          <tr key={i}>
                            <td>{m.type}</td>
                            <td>{new Date(m.reportedAt).toLocaleDateString()}</td>
                            <td>{statusBadge(m.founderDecision || 'PENDING')}</td>
                            <td>
                              {!m.founderDecision && (
                                <>
                                  <button 
                                    className="btn btn-warning btn-sm"
                                    onClick={() => handleMisconductDecision(selectedAgent._id, i, 'WARNED', 'WARN')}
                                  >
                                    Warn
                                  </button>
                                  <button 
                                    className="btn btn-danger btn-sm ml-2"
                                    onClick={() => handleMisconductDecision(selectedAgent._id, i, 'SUSPENDED', 'SUSPEND')}
                                  >
                                    Suspend
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard { padding: 24px; }
        .dashboard-header { margin-bottom: 24px; }
        .dashboard-header h1 { margin: 0; color: #1e293b; }
        .subtitle { color: #64748b; margin-top: 4px; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .stats-grid.small { grid-template-columns: repeat(3, 1fr); }
        .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-card h3 { font-size: 28px; margin: 0 0 4px; }
        .stat-card p { color: #64748b; margin: 0; font-size: 14px; }
        .stat-warning { border-left: 4px solid #f59e0b; }
        .stat-info { border-left: 4px solid #3b82f6; }
        .stat-purple { border-left: 4px solid #8b5cf6; }
        .stat-danger { border-left: 4px solid #ef4444; }
        
        .tabs { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
        .tabs button { padding: 8px 16px; border: none; background: none; cursor: pointer; border-radius: 6px; }
        .tabs button.active { background: #3b82f6; color: white; }
        
        .tab-content { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
        
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .badge-gray { background: #e2e8f0; color: #475569; }
        .badge-yellow { background: #fef3c7; color: #92400e; }
        .badge-orange { background: #fed7aa; color: #c2410c; }
        .badge-red { background: #fee2e2; color: #dc2626; }
        .badge-green { background: #dcfce7; color: #16a34a; }
        .badge-blue { background: #dbeafe; color: #2563eb; }
        .badge-purple { background: #ede9fe; color: #7c3aed; }
        
        .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
        .btn-sm { padding: 4px 10px; font-size: 13px; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-success { background: #16a34a; color: white; }
        .btn-danger { background: #dc2626; color: white; }
        .btn-warning { background: #f59e0b; color: white; }
        .ml-2 { margin-left: 8px; }
        .mt-4 { margin-top: 16px; }
        .mb-4 { margin-bottom: 16px; }
        
        .empty-state { text-align: center; padding: 40px; color: #64748b; }
        .page-loading { display: flex; justify-content: center; align-items: center; height: 400px; }
        
        .card { background: white; padding: 24px; border-radius: 12px; }
        .text-muted { color: #64748b; }
        .text-danger { color: #dc2626; }
        
        .cron-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
        .cron-job-card { border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; }
        .cron-job-card h4 { margin: 0 0 8px; }
        .cron-job-card p { color: #64748b; font-size: 14px; margin: 0 0 12px; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: white; border-radius: 12px; width: 90%; max-width: 700px; max-height: 80vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e2e8f0; }
        .modal-header h2 { margin: 0; }
        .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; }
        .modal-body { padding: 20px; }
      `}</style>
    </div>
  );
};

export default FounderDashboard;
