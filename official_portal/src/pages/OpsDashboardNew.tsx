import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { opsApi, casesApi, approvalApi, slaApi } from "../api";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlinePaperClip,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineChevronRight,
  HiOutlineOfficeBuilding,
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineLightningBolt,
  HiOutlineScale,
  HiOutlineSearch,
} from "react-icons/hi";

// Interfaces
interface Company {
  _id: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
}

interface Bill {
  _id: string;
  billNumber: string;
  amount: number;
  description: string;
  status: string;
  fileName: string;
  fileUrl: string;
  subContractorId?: { _id: string; companyName: string };
  linkedEpcId?: { _id: string; companyName: string };
  wcc?: { uploaded: boolean; fileUrl: string; verified: boolean };
  measurementSheet?: { uploaded: boolean; fileUrl: string; certified: boolean };
  createdAt: string;
}

interface KycItem {
  _id: string;
  status: string;
  caseNumber?: string;
  requestedAmount?: number;
  tenure?: number;
  subContractorId?: { _id: string; companyName: string };
  userId?: { _id: string; name: string; email: string };
  billId?: { amount: number; billNumber: string };
  createdAt: string;
  updatedAt: string;
}

interface CaseItem {
  _id: string;
  caseNumber: string;
  subContractorId?: { companyName: string };
  epcId?: { companyName: string };
  billId?: { amount: number };
  currentStage: string;
  status: string;
  createdAt: string;
}

interface Document {
  _id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: string;
  verificationNotes?: string;
  uploadedAt?: string;
}

interface PendingData {
  pendingCompanies: Company[];
  pendingBills: Bill[];
  pendingKyc: KycItem[];
}

interface SlaMilestone {
  name: string;
  targetDate: string;
  status: 'PENDING' | 'COMPLETED' | 'COMPLETED_LATE' | 'OVERDUE';
  completedAt?: string;
  completedBy?: string;
}

interface SlaItem {
  _id: string;
  entityType: string;
  entityId: string;
  case?: { _id: string; caseNumber: string; seller?: string; buyer?: string };
  milestones: {
    day3: SlaMilestone;
    day7: SlaMilestone;
    day10: SlaMilestone;
    day14: SlaMilestone;
  };
  status: 'ACTIVE' | 'REMINDER_1_SENT' | 'REMINDER_2_SENT' | 'ESCALATED' | 'DORMANT' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  firstReminderDue?: string;
  secondReminderDue?: string;
  escalationDue?: string;
  dormantDue?: string;
}

interface SlaStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
}

interface SlaDashboard {
  stats: SlaStats;
  recentOverdue: SlaItem[];
}

type TabType =
  | "overview"
  | "companies"
  | "bills"
  | "kyc"
  | "cases"
  | "cwcrf"
  | "nbfc"
  | "sla"
  | "rekyc";

const OpsDashboardNew = () => {
  const [pending, setPending] = useState<PendingData>({
    pendingCompanies: [],
    pendingBills: [],
    pendingKyc: [],
  });
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedKyc, setSelectedKyc] = useState<KycItem | null>(null);
  const [approvalCount, setApprovalCount] = useState(0);
  const [slaDashboard, setSlaDashboard] = useState<SlaDashboard | null>(null);
  const [activeSlas, setActiveSlas] = useState<SlaItem[]>([]);
  const [overdueSlas, setOverdueSlas] = useState<SlaItem[]>([]);
  const [cwcrfQueue, setCwcrfQueue] = useState<any[]>([]);
  const [cwcrfTriageQueue, setCwcrfTriageQueue] = useState<any[]>([]);
  const [cwcrfForwardingId, setCwcrfForwardingId] = useState<string | null>(null);
  const [cwcrfVerifyingSection, setCwcrfVerifyingSection] = useState<string | null>(null);
  const [cwcrfTriageId, setCwcrfTriageId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [pendingRes, casesRes, approvalRes, slaDashboardRes, activeSlaRes, overdueSlaRes, cwcrfRes, cwcrfTriageRes] = await Promise.all([
        opsApi.getPending(),
        casesApi.getCases(),
        approvalApi.getPendingCount().catch(() => ({ data: { count: 0 } })),
        slaApi.getDashboard().catch(() => ({ data: { stats: { total: 0, active: 0, completed: 0, overdue: 0 }, recentOverdue: [] } })),
        slaApi.getActive().catch(() => ({ data: [] })),
        slaApi.getOverdue().catch(() => ({ data: [] })),
        opsApi.getCwcrfQueue().catch(() => ({ data: { cwcrfs: [] } })),
        opsApi.getCwcrfTriageQueue().catch(() => ({ data: { cwcrfs: [] } })),
      ]);
      setPending(pendingRes.data);
      setCases(casesRes.data);
      setApprovalCount(approvalRes.data.count || 0);
      setSlaDashboard(slaDashboardRes.data);
      setActiveSlas(activeSlaRes.data);
      setOverdueSlas(overdueSlaRes.data);
      setCwcrfQueue(cwcrfRes.data.cwcrfs || []);
      setCwcrfTriageQueue(cwcrfTriageRes.data.cwcrfs || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DOCS_SUBMITTED: "badge-purple",
      UPLOADED: "badge-yellow",
      SUBMITTED: "badge-blue",
      ACTION_REQUIRED: "badge-red",
      VERIFIED: "badge-green",
      REJECTED: "badge-red",
      KYC_COMPLETED: "badge-green",
      READY_FOR_COMPANY_REVIEW: "badge-purple",
      OPS_APPROVED: "badge-blue",
      EPC_VERIFIED: "badge-green",
      EPC_REJECTED: "badge-red",
      BID_PLACED: "badge-blue",
      COMMERCIAL_LOCKED: "badge-green",
      ACTIVE: "badge-green",
      LEAD_CREATED: "badge-gray",
    };
    return (
      <span className={`badge ${colors[status] || "badge-gray"}`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getAgeInDays = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="ops-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Operations Dashboard</h1>
        <div className="header-actions">
          <button className="btn-icon" onClick={fetchData} title="Refresh">
            <HiOutlineRefresh />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div
          className="stat-card stat-warning clickable"
          onClick={() => setActiveTab("companies")}
        >
          <div className="stat-icon">
            <HiOutlineOfficeBuilding />
          </div>
          <div className="stat-content">
            <h3>{pending.pendingCompanies.length}</h3>
            <p>EPC Verification</p>
          </div>
        </div>
        <div
          className="stat-card stat-info clickable"
          onClick={() => setActiveTab("bills")}
        >
          <div className="stat-icon">
            <HiOutlineDocumentText />
          </div>
          <div className="stat-content">
            <h3>{pending.pendingBills.length}</h3>
            <p>Bill Verification</p>
          </div>
        </div>
        <div
          className="stat-card stat-danger clickable"
          onClick={() => setActiveTab("kyc")}
        >
          <div className="stat-icon">
            <HiOutlineUser />
          </div>
          <div className="stat-content">
            <h3>{pending.pendingKyc.length}</h3>
            <p>Seller KYC</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <HiOutlineCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{cases.length}</h3>
            <p>Total Cases</p>
          </div>
        </div>
        {approvalCount > 0 && (
          <div className="stat-card stat-purple">
            <div className="stat-icon">
              <HiOutlineExclamationCircle />
            </div>
            <div className="stat-content">
              <h3>{approvalCount}</h3>
              <p>Awaiting Approval</p>
            </div>
          </div>
        )}
        {(slaDashboard?.stats.overdue || 0) > 0 && (
          <div 
            className="stat-card stat-danger clickable"
            onClick={() => setActiveTab("sla")}
          >
            <div className="stat-icon">
              <HiOutlineClock />
            </div>
            <div className="stat-content">
              <h3>{slaDashboard?.stats.overdue || 0}</h3>
              <p>SLA Overdue</p>
            </div>
          </div>
        )}
      </div>

      {/* Escalation Alert Banner */}
      {overdueSlas.length > 0 && (
        <div className="escalation-banner">
          <div className="escalation-icon">
            <HiOutlineBell />
          </div>
          <div className="escalation-content">
            <strong>⚠️ SLA Escalation Required</strong>
            <span>{overdueSlas.length} task(s) have breached SLA deadlines and require immediate attention</span>
          </div>
          <button 
            className="btn-escalation"
            onClick={() => setActiveTab("sla")}
          >
            View SLA Dashboard
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          {(
            [
              "overview",
              "companies",
              "bills",
              "kyc",
              "cases",
              "cwcrf",
              "sla",
              "nbfc",
            ] as TabType[]
          ).map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "kyc"
                ? "Seller KYC"
                : tab === "companies"
                  ? "EPC Verification"
                  : tab === "bills"
                    ? "Bill Verification"
                    : tab === "sla"
                      ? "SLA Tracker"
                      : tab === "cwcrf"
                        ? "CWC Requests"
                        : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "kyc" && pending.pendingKyc.length > 0 && (
                <span className="tab-badge">{pending.pendingKyc.length}</span>
              )}
              {tab === "sla" && (slaDashboard?.stats.overdue || 0) > 0 && (
                <span className="tab-badge danger">{slaDashboard?.stats.overdue}</span>
              )}
              {tab === "companies" && pending.pendingCompanies.length > 0 && (
                <span className="tab-badge">
                  {pending.pendingCompanies.length}
                </span>
              )}
              {tab === "bills" && pending.pendingBills.length > 0 && (
                <span className="tab-badge">{pending.pendingBills.length}</span>
              )}
              {tab === "cwcrf" && cwcrfQueue.length > 0 && (
                <span className="tab-badge">{cwcrfQueue.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="overview-grid">
          {/* Urgent Items */}
          <div className="overview-section">
            <h2>
              <HiOutlineExclamationCircle /> Requires Attention
            </h2>
            <div className="urgent-list">
              {pending.pendingKyc
                .filter((k) => k.status === "ACTION_REQUIRED")
                .slice(0, 5)
                .map((k) => (
                  <div
                    key={k._id}
                    className="urgent-item"
                    onClick={() => {
                      setSelectedKyc(k);
                      setActiveTab("kyc");
                    }}
                  >
                    <div className="urgent-icon red">
                      <HiOutlineUser />
                    </div>
                    <div className="urgent-content">
                      <strong>
                        {k.subContractorId?.companyName || "Unknown"}
                      </strong>
                      <span>KYC Action Required</span>
                    </div>
                    <HiOutlineChevronRight />
                  </div>
                ))}
              {pending.pendingCompanies
                .filter((c) => getAgeInDays(c.createdAt) > 3)
                .slice(0, 3)
                .map((c) => (
                  <div
                    key={c._id}
                    className="urgent-item"
                    onClick={() => setActiveTab("companies")}
                  >
                    <div className="urgent-icon yellow">
                      <HiOutlineOfficeBuilding />
                    </div>
                    <div className="urgent-content">
                      <strong>{c.companyName}</strong>
                      <span>Pending {getAgeInDays(c.createdAt)} days</span>
                    </div>
                    <HiOutlineChevronRight />
                  </div>
                ))}
              {pending.pendingKyc.filter((k) => k.status === "ACTION_REQUIRED")
                .length === 0 &&
                pending.pendingCompanies.filter(
                  (c) => getAgeInDays(c.createdAt) > 3
                ).length === 0 && (
                  <div className="empty-state">
                    <HiOutlineCheckCircle />
                    <span>All caught up!</span>
                  </div>
                )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="overview-section">
            <h2>
              <HiOutlineClock /> Recent Cases
            </h2>
            <div className="recent-list">
              {cases.slice(0, 5).map((c) => (
                <div key={c._id} className="recent-item">
                  <div className="recent-content">
                    <strong>{c.caseNumber}</strong>
                    <span>{c.subContractorId?.companyName}</span>
                  </div>
                  {statusBadge(c.status)}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Companies Tab */}
      {activeTab === "companies" && (
        <CompaniesTab
          companies={pending.pendingCompanies}
          onRefresh={fetchData}
          statusBadge={statusBadge}
          formatDate={formatDate}
          getAgeInDays={getAgeInDays}
        />
      )}

      {/* Bills Tab */}
      {activeTab === "bills" && (
        <BillsTab
          bills={pending.pendingBills}
          onRefresh={fetchData}
          statusBadge={statusBadge}
          formatDate={formatDate}
        />
      )}

      {/* KYC Tab */}
      {activeTab === "kyc" && (
        <KycVerificationTab
          kycItems={pending.pendingKyc}
          selectedKyc={selectedKyc}
          setSelectedKyc={setSelectedKyc}
          onRefresh={fetchData}
          statusBadge={statusBadge}
          formatDate={formatDate}
        />
      )}

      {/* Cases Tab */}
      {activeTab === "cases" && (
        <CasesTab cases={cases} statusBadge={statusBadge} />
      )}

      {/* NBFC Tab */}
      {activeTab === "nbfc" && <NbfcInviteTab />}

      {/* SLA Tracker Tab */}
      {activeTab === "sla" && (
        <SlaTrackerTab
          slaDashboard={slaDashboard}
          activeSlas={activeSlas}
          overdueSlas={overdueSlas}
          onRefresh={fetchData}
          pendingCompanies={pending.pendingCompanies.length}
          pendingBills={pending.pendingBills.length}
          pendingKyc={pending.pendingKyc.length}
        />
      )}

      {/* CWC Requests Tab */}
      {activeTab === "cwcrf" && (
        <CwcrfOpsTab
          cwcrfs={cwcrfQueue}
          triageCwcrfs={cwcrfTriageQueue}
          forwardingId={cwcrfForwardingId}
          verifyingSection={cwcrfVerifyingSection}
          triageId={cwcrfTriageId}
          onForwardToRmt={async (id: string) => {
            setCwcrfForwardingId(id);
            try {
              await opsApi.forwardCwcrfToRmt(id);
              toast.success("CWCRF forwarded to RMT queue");
              fetchData();
            } catch (err: any) {
              toast.error(err.response?.data?.error || "Failed to forward CWCRF");
            } finally {
              setCwcrfForwardingId(null);
            }
          }}
          onVerifySection={async (id: string, section: string, verified: boolean, notes: string) => {
            setCwcrfVerifyingSection(`${id}-${section}`);
            try {
              await opsApi.verifyCwcrfSection(id, { section, verified, notes });
              toast.success(`Section ${section.toUpperCase()} marked as ${verified ? "verified" : "unverified"}`);
              fetchData();
            } catch (err: any) {
              toast.error(err.response?.data?.error || "Failed to verify section");
            } finally {
              setCwcrfVerifyingSection(null);
            }
          }}
          onTriage={async (id: string, action: string, notes: string) => {
            setCwcrfTriageId(id);
            try {
              await opsApi.triageCwcrf(id, { action, notes });
              toast.success(action === "forward_to_epc" ? "CWCRF forwarded to EPC for buyer verification" : "CWCRF rejected");
              fetchData();
            } catch (err: any) {
              toast.error(err.response?.data?.error || "Failed to triage CWCRF");
            } finally {
              setCwcrfTriageId(null);
            }
          }}
          formatDate={formatDate}
          statusBadge={statusBadge}
        />
      )}

      <style>{`
        .ops-dashboard {
          padding: 24px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .dashboard-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary, #1e293b);
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 1px solid var(--border, #e2e8f0);
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: var(--text-muted, #64748b);
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: var(--bg-secondary, #f8fafc);
          color: var(--primary, #2563eb);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
          border: 1px solid var(--border, #e2e8f0);
          transition: all 0.2s;
        }

        .stat-card.clickable {
          cursor: pointer;
        }

        .stat-card.clickable:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background: var(--bg-secondary, #f8fafc);
          color: var(--text-muted, #64748b);
        }

        .stat-warning .stat-icon { background: #fef3c7; color: #d97706; }
        .stat-info .stat-icon { background: #dbeafe; color: #2563eb; }
        .stat-danger .stat-icon { background: #fee2e2; color: #dc2626; }
        .stat-purple .stat-icon { background: #ede9fe; color: #7c3aed; }

        .stat-content h3 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary, #1e293b);
        }

        .stat-content p {
          font-size: 14px;
          color: var(--text-muted, #64748b);
        }

        .tabs-container {
          background: white;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
          border: 1px solid var(--border, #e2e8f0);
        }

        .tabs {
          display: flex;
          gap: 4px;
          overflow-x: auto;
        }

        .tab {
          padding: 12px 20px;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-muted, #64748b);
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .tab:hover {
          background: var(--bg-secondary, #f8fafc);
          color: var(--text-primary, #1e293b);
        }

        .tab.active {
          background: var(--primary, #2563eb);
          color: white;
        }

        .tab-badge {
          background: #ef4444;
          color: white;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 600;
        }

        .tab.active .tab-badge {
          background: white;
          color: var(--primary, #2563eb);
        }

        /* Overview Grid */
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .overview-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid var(--border, #e2e8f0);
        }

        .overview-section.full-width {
          grid-column: 1 / -1;
        }

        .overview-section h2 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary, #1e293b);
        }

        .urgent-list, .recent-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .urgent-item, .recent-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-secondary, #f8fafc);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .urgent-item:hover, .recent-item:hover {
          background: var(--bg-hover, #f1f5f9);
        }

        .urgent-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .urgent-icon.red { background: #fee2e2; color: #dc2626; }
        .urgent-icon.yellow { background: #fef3c7; color: #d97706; }

        .urgent-content, .recent-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .urgent-content strong, .recent-content strong {
          font-size: 14px;
          color: var(--text-primary, #1e293b);
        }

        .urgent-content span, .recent-content span {
          font-size: 12px;
          color: var(--text-muted, #64748b);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 40px;
          color: var(--text-muted, #64748b);
        }

        .empty-state svg {
          font-size: 48px;
          color: #10b981;
        }

        /* Badges */
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .badge-green { background: #d1fae5; color: #059669; }
        .badge-yellow { background: #fef3c7; color: #d97706; }
        .badge-red { background: #fee2e2; color: #dc2626; }
        .badge-blue { background: #dbeafe; color: #2563eb; }
        .badge-purple { background: #ede9fe; color: #7c3aed; }
        .badge-gray { background: #f3f4f6; color: #6b7280; }

        /* Escalation Banner */
        .escalation-banner {
          background: linear-gradient(135deg, #fef3c7 0%, #fee2e2 100%);
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
        }

        .escalation-icon {
          width: 48px;
          height: 48px;
          background: #f59e0b;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .escalation-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .escalation-content strong {
          font-size: 16px;
          color: #92400e;
        }

        .escalation-content span {
          font-size: 14px;
          color: #b45309;
        }

        .btn-escalation {
          padding: 10px 20px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-escalation:hover {
          background: #b91c1c;
          transform: translateY(-1px);
        }

        .tab-badge.danger {
          background: #dc2626;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @media (max-width: 768px) {
          .overview-grid {
            grid-template-columns: 1fr;
          }

          .escalation-banner {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

// ==================== SUB-COMPONENTS ====================

// SLA Tracker Tab Component with Countdown Timers
const SlaTrackerTab = ({
  slaDashboard,
  activeSlas,
  overdueSlas,
  onRefresh,
  pendingCompanies,
  pendingBills,
  pendingKyc,
}: {
  slaDashboard: SlaDashboard | null;
  activeSlas: SlaItem[];
  overdueSlas: SlaItem[];
  onRefresh: () => void;
  pendingCompanies: number;
  pendingBills: number;
  pendingKyc: number;
}) => {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Update time every second for countdown timers
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate time remaining until deadline
  const getTimeRemaining = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - currentTime;
    if (diff <= 0) return { expired: true, display: 'OVERDUE', urgency: 'critical' };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let urgency = 'normal';
    if (days === 0 && hours < 4) urgency = 'critical';
    else if (days === 0) urgency = 'warning';
    else if (days === 1) urgency = 'attention';

    if (days > 0) {
      return { expired: false, display: `${days}d ${hours}h ${minutes}m`, urgency };
    } else if (hours > 0) {
      return { expired: false, display: `${hours}h ${minutes}m ${seconds}s`, urgency };
    } else {
      return { expired: false, display: `${minutes}m ${seconds}s`, urgency };
    }
  };

  // Get next milestone for an SLA
  const getNextMilestone = (sla: SlaItem) => {
    if (!sla.milestones) return null;
    const milestones = [
      { key: 'day3', ...sla.milestones.day3 },
      { key: 'day7', ...sla.milestones.day7 },
      { key: 'day10', ...sla.milestones.day10 },
      { key: 'day14', ...sla.milestones.day14 },
    ];
    return milestones.find(m => m.status === 'PENDING' || m.status === 'OVERDUE');
  };

  // Workload distribution (simulated based on pending items)
  const workloadData = [
    { label: 'EPC Verification', count: pendingCompanies, color: '#f59e0b' },
    { label: 'Bill Verification', count: pendingBills, color: '#3b82f6' },
    { label: 'Seller KYC', count: pendingKyc, color: '#ef4444' },
    { label: 'Active SLAs', count: activeSlas.length, color: '#8b5cf6' },
  ];
  const totalWorkload = workloadData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="sla-tracker-tab">
      {/* Section Header with Refresh */}
      <div className="sla-header">
        <h2>SLA Performance Tracker</h2>
        <button className="btn-refresh" onClick={onRefresh}>
          <HiOutlineRefresh /> Refresh
        </button>
      </div>

      {/* SLA Stats Overview */}
      <div className="sla-stats-grid">
        <div className="sla-stat-card">
          <div className="sla-stat-icon active">
            <HiOutlineClock />
          </div>
          <div className="sla-stat-content">
            <h3>{slaDashboard?.stats.active || 0}</h3>
            <p>Active SLAs</p>
          </div>
        </div>
        <div className="sla-stat-card">
          <div className="sla-stat-icon overdue">
            <HiOutlineExclamationCircle />
          </div>
          <div className="sla-stat-content">
            <h3>{slaDashboard?.stats.overdue || 0}</h3>
            <p>Overdue</p>
          </div>
        </div>
        <div className="sla-stat-card">
          <div className="sla-stat-icon completed">
            <HiOutlineCheckCircle />
          </div>
          <div className="sla-stat-content">
            <h3>{slaDashboard?.stats.completed || 0}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="sla-stat-card">
          <div className="sla-stat-icon total">
            <HiOutlineScale />
          </div>
          <div className="sla-stat-content">
            <h3>{slaDashboard?.stats.total || 0}</h3>
            <p>Total</p>
          </div>
        </div>
      </div>

      {/* Workload Distribution */}
      <div className="workload-section">
        <h2><HiOutlineLightningBolt /> Workload Distribution</h2>
        <div className="workload-container">
          <div className="workload-bar">
            {workloadData.map((item, idx) => (
              item.count > 0 && (
                <div
                  key={idx}
                  className="workload-segment"
                  style={{
                    width: `${(item.count / totalWorkload) * 100}%`,
                    backgroundColor: item.color,
                  }}
                  title={`${item.label}: ${item.count}`}
                />
              )
            ))}
          </div>
          <div className="workload-legend">
            {workloadData.map((item, idx) => (
              <div key={idx} className="legend-item">
                <span className="legend-color" style={{ backgroundColor: item.color }} />
                <span className="legend-label">{item.label}</span>
                <span className="legend-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue SLAs - Priority Section */}
      {overdueSlas.length > 0 && (
        <div className="sla-section overdue">
          <h2><HiOutlineExclamationCircle /> Overdue - Immediate Action Required</h2>
          <div className="sla-countdown-grid">
            {overdueSlas.map((sla) => {
              const milestone = getNextMilestone(sla);
              return (
                <div key={sla._id} className="sla-countdown-card critical">
                  <div className="sla-card-header">
                    <span className="case-number">{sla.case?.caseNumber || 'Unknown Case'}</span>
                    <span className="sla-status overdue">OVERDUE</span>
                  </div>
                  <div className="sla-countdown-display critical">
                    <HiOutlineExclamationCircle />
                    <span>BREACH</span>
                  </div>
                  {milestone && (
                    <div className="sla-milestone">
                      <span className="milestone-name">{milestone.name}</span>
                      <span className="milestone-date">
                        Due: {new Date(milestone.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="sla-card-actions">
                    <button className="btn-escalate">
                      <HiOutlineBell />
                      Escalate
                    </button>
                    <button className="btn-resolve">Resolve</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active SLAs with Countdown Timers */}
      <div className="sla-section">
        <h2><HiOutlineClock /> Active SLA Timers</h2>
        {activeSlas.length === 0 ? (
          <div className="empty-sla-state">
            <HiOutlineCheckCircle />
            <p>No active SLAs to track</p>
          </div>
        ) : (
          <div className="sla-countdown-grid">
            {activeSlas.map((sla) => {
              const milestone = getNextMilestone(sla);
              const timeInfo = milestone ? getTimeRemaining(milestone.targetDate) : null;
              
              return (
                <div key={sla._id} className={`sla-countdown-card ${timeInfo?.urgency || ''}`}>
                  <div className="sla-card-header">
                    <span className="case-number">{sla.case?.caseNumber || 'Unknown Case'}</span>
                    <span className={`sla-status ${sla.status.toLowerCase()}`}>{sla.status.replace(/_/g, ' ')}</span>
                  </div>
                  
                  {timeInfo && (
                    <div className={`sla-countdown-display ${timeInfo.urgency}`}>
                      <HiOutlineClock />
                      <span className="countdown-time">{timeInfo.display}</span>
                    </div>
                  )}
                  
                  {milestone && (
                    <div className="sla-milestone">
                      <span className="milestone-name">{milestone.name}</span>
                      <span className="milestone-date">
                        Due: {new Date(milestone.targetDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                  
                  {/* Milestone Progress */}
                  <div className="milestone-progress">
                    {sla.milestones && Object.entries(sla.milestones).map(([key, m]) => (
                      <div
                        key={key}
                        className={`milestone-dot ${m.status.toLowerCase()}`}
                        title={`${m.name}: ${m.status}`}
                      />
                    ))}
                  </div>
                  
                  <div className="sla-card-actions">
                    <button className="btn-view">View Details</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .sla-tracker-tab {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sla-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sla-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary, #1e293b);
        }

        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-muted, #64748b);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-refresh:hover {
          background: var(--bg-secondary, #f8fafc);
          color: var(--primary, #2563eb);
        }

        .sla-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .sla-stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid var(--border, #e2e8f0);
        }

        .sla-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .sla-stat-icon.active { background: #dbeafe; color: #2563eb; }
        .sla-stat-icon.overdue { background: #fee2e2; color: #dc2626; }
        .sla-stat-icon.completed { background: #d1fae5; color: #059669; }
        .sla-stat-icon.total { background: #f3f4f6; color: #6b7280; }

        .sla-stat-content h3 {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary, #1e293b);
        }

        .sla-stat-content p {
          font-size: 14px;
          color: var(--text-muted, #64748b);
        }

        /* Workload Distribution */
        .workload-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid var(--border, #e2e8f0);
        }

        .workload-section h2 {
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .workload-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .workload-bar {
          height: 24px;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          background: #f3f4f6;
        }

        .workload-segment {
          height: 100%;
          transition: width 0.3s ease;
        }

        .workload-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .legend-label {
          font-size: 14px;
          color: var(--text-muted, #64748b);
        }

        .legend-count {
          font-weight: 600;
          color: var(--text-primary, #1e293b);
        }

        /* SLA Section */
        .sla-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid var(--border, #e2e8f0);
        }

        .sla-section.overdue {
          border-color: #dc2626;
          background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
        }

        .sla-section h2 {
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          color: var(--text-primary, #1e293b);
        }

        .sla-section.overdue h2 {
          color: #dc2626;
        }

        .sla-countdown-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .sla-countdown-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          border: 2px solid #e2e8f0;
          transition: all 0.2s;
        }

        .sla-countdown-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .sla-countdown-card.attention { border-color: #fcd34d; }
        .sla-countdown-card.warning { border-color: #f59e0b; background: #fffbeb; }
        .sla-countdown-card.critical { border-color: #dc2626; background: #fef2f2; animation: urgentPulse 2s infinite; }

        @keyframes urgentPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
        }

        .sla-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .case-number {
          font-weight: 600;
          color: var(--text-primary, #1e293b);
        }

        .sla-status {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .sla-status.active { background: #dbeafe; color: #2563eb; }
        .sla-status.overdue { background: #fee2e2; color: #dc2626; }
        .sla-status.completed { background: #d1fae5; color: #059669; }

        .sla-countdown-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          border-radius: 8px;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .sla-countdown-display.normal { background: #f0fdf4; color: #16a34a; }
        .sla-countdown-display.attention { background: #fef3c7; color: #d97706; }
        .sla-countdown-display.warning { background: #ffedd5; color: #ea580c; }
        .sla-countdown-display.critical { background: #fee2e2; color: #dc2626; }

        .countdown-time {
          font-family: 'SF Mono', 'Monaco', monospace;
          letter-spacing: 1px;
        }

        .sla-milestone {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 12px;
        }

        .milestone-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary, #1e293b);
        }

        .milestone-date {
          font-size: 12px;
          color: var(--text-muted, #64748b);
        }

        .milestone-progress {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .milestone-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e2e8f0;
        }

        .milestone-dot.pending { background: #fcd34d; }
        .milestone-dot.completed { background: #10b981; }
        .milestone-dot.completed_late { background: #f59e0b; }
        .milestone-dot.overdue { background: #dc2626; animation: dotPulse 1s infinite; }

        @keyframes dotPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        .sla-card-actions {
          display: flex;
          gap: 8px;
        }

        .sla-card-actions button {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-escalate {
          background: #dc2626;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn-escalate:hover { background: #b91c1c; }

        .btn-resolve {
          background: #059669;
          color: white;
        }

        .btn-resolve:hover { background: #047857; }

        .btn-view {
          background: #2563eb;
          color: white;
        }

        .btn-view:hover { background: #1d4ed8; }

        .empty-sla-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 40px;
          color: var(--text-muted, #64748b);
        }

        .empty-sla-state svg {
          font-size: 48px;
          color: #10b981;
        }

        @media (max-width: 768px) {
          .sla-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .sla-countdown-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Companies Tab Component
const CompaniesTab = ({
  companies,
  onRefresh,
  statusBadge,
  formatDate,
  getAgeInDays,
}: {
  companies: Company[];
  onRefresh: () => void;
  statusBadge: (status: string) => React.ReactElement;
  formatDate: (date: string) => string;
  getAgeInDays: (date: string) => number;
}) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>EPC Company Verification (Buyers)</h2>
        <span className="count">{companies.length} pending</span>
      </div>

      {companies.length === 0 ? (
        <div className="empty-card">
          <HiOutlineCheckCircle />
          <p>No pending EPC verifications</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Owner</th>
                <th>Email</th>
                <th>Submitted</th>
                <th>Age</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr
                  key={c._id}
                  className={getAgeInDays(c.createdAt) > 3 ? "urgent-row" : ""}
                >
                  <td className="company-cell">
                    <strong>{c.companyName}</strong>
                  </td>
                  <td>{c.ownerName}</td>
                  <td>{c.email}</td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td>
                    <span
                      className={`age-badge ${getAgeInDays(c.createdAt) > 3 ? "old" : ""}`}
                    >
                      {getAgeInDays(c.createdAt)}d
                    </span>
                  </td>
                  <td>{statusBadge(c.status)}</td>
                  <td>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => setSelectedCompany(c)}
                    >
                      <HiOutlineEye /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Company Review Modal */}
      {selectedCompany && (
        <CompanyReviewModal
          company={selectedCompany}
          onClose={() => {
            setSelectedCompany(null);
            onRefresh();
          }}
        />
      )}

      <style>{`
        .tab-content {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border, #e2e8f0);
          overflow: hidden;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border, #e2e8f0);
        }

        .section-header h2 {
          font-size: 18px;
          font-weight: 600;
        }

        .section-header .count {
          font-size: 14px;
          color: var(--text-muted, #64748b);
        }

        .empty-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 60px 20px;
          color: var(--text-muted, #64748b);
        }

        .empty-card svg {
          font-size: 48px;
          color: #10b981;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 14px 20px;
          text-align: left;
          border-bottom: 1px solid var(--border, #e2e8f0);
        }

        th {
          background: var(--bg-secondary, #f8fafc);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted, #64748b);
        }

        .urgent-row {
          background: #fef2f2;
        }

        .company-cell strong {
          color: var(--text-primary, #1e293b);
        }

        .age-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          background: var(--bg-secondary, #f8fafc);
          color: var(--text-muted, #64748b);
        }

        .age-badge.old {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--primary, #2563eb);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

// Company Review Modal Component
const CompanyReviewModal = ({
  company,
  onClose,
}: {
  company: Company;
  onClose: () => void;
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const res = await opsApi.getCompanyDocuments(company._id);
        setDocuments(res.data);
      } catch {
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };
    loadDocs();
  }, [company._id]);

  const handleVerifyDoc = async (docId: string, decision: string) => {
    try {
      await opsApi.verifyDocument(docId, { decision, notes });
      toast.success(
        `Document ${decision === "approve" ? "verified" : "rejected"}`
      );
      setDocuments((docs) =>
        docs.map((d) =>
          d._id === docId
            ? { ...d, status: decision === "approve" ? "verified" : "rejected" }
            : d
        )
      );
    } catch {
      toast.error("Failed to update document");
    }
  };

  const handleVerifyCompany = async (decision: string) => {
    try {
      await opsApi.verifyCompany(company._id, { decision, notes });
      toast.success(
        `Company ${decision === "approve" ? "approved" : "rejected"}`
      );
      onClose();
    } catch {
      toast.error("Failed to update company");
    }
  };

  const openDocument = async (url: string, fileName: string) => {
    const isPdf = fileName?.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      try {
        toast.loading("Loading document...", { id: "pdf-load" });
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        toast.dismiss("pdf-load");
        window.open(blobUrl, "_blank");
      } catch {
        toast.dismiss("pdf-load");
        window.open(url, "_blank");
      }
    } else {
      window.open(url, "_blank");
    }
  };

  const allDocsVerified = documents.every((d) => d.status === "verified");
  const anyDocRejected = documents.some((d) => d.status === "rejected");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Review: {company.companyName}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Company Info */}
          <div className="company-info-grid">
            <div className="info-item">
              <label>Owner</label>
              <span>{company.ownerName}</span>
            </div>
            <div className="info-item">
              <label>Email</label>
              <span>{company.email}</span>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <span>{company.phone || "N/A"}</span>
            </div>
          </div>

          {/* Documents Section */}
          <div className="documents-section">
            <h3>
              <HiOutlineDocumentText /> Submitted Documents
            </h3>

            {loading ? (
              <div className="loading">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="no-docs">No documents uploaded</div>
            ) : (
              <div className="docs-grid">
                {documents.map((doc) => (
                  <div key={doc._id} className="doc-card">
                    <div className="doc-header">
                      <span className="doc-type">{doc.documentType}</span>
                      <span
                        className={`doc-status ${doc.status}`}
                      >
                        {doc.status}
                      </span>
                    </div>
                    <div className="doc-name">{doc.fileName}</div>
                    <div className="doc-actions">
                      <button
                        className="btn-outline btn-sm"
                        onClick={() => openDocument(doc.fileUrl, doc.fileName)}
                      >
                        <HiOutlineEye /> View
                      </button>
                      {doc.status === "pending" && (
                        <>
                          <button
                            className="btn-success btn-sm"
                            onClick={() => handleVerifyDoc(doc._id, "approve")}
                          >
                            <HiOutlineCheckCircle />
                          </button>
                          <button
                            className="btn-danger btn-sm"
                            onClick={() => handleVerifyDoc(doc._id, "reject")}
                          >
                            <HiOutlineXCircle />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="notes-section">
            <label>Verification Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this verification..."
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-info">
            {allDocsVerified && (
              <span className="info-text success">
                ✓ All documents verified
              </span>
            )}
            {anyDocRejected && (
              <span className="info-text danger">
                ⚠ Some documents rejected
              </span>
            )}
          </div>
          <div className="footer-actions">
            <button className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={() => handleVerifyCompany("reject")}
            >
              Reject Company
            </button>
            <button
              className="btn-success"
              onClick={() => handleVerifyCompany("approve")}
              disabled={!allDocsVerified}
            >
              Approve Company
            </button>
          </div>
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .modal-content {
            background: white;
            border-radius: 16px;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            width: 600px;
          }

          .modal-content.large {
            width: 900px;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid var(--border, #e2e8f0);
          }

          .modal-header h2 {
            font-size: 20px;
            font-weight: 600;
          }

          .modal-close {
            width: 32px;
            height: 32px;
            border: none;
            background: var(--bg-secondary, #f8fafc);
            border-radius: 8px;
            font-size: 24px;
            cursor: pointer;
            color: var(--text-muted, #64748b);
          }

          .modal-body {
            padding: 24px;
            overflow-y: auto;
            flex: 1;
          }

          .company-info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 24px;
            padding: 16px;
            background: var(--bg-secondary, #f8fafc);
            border-radius: 8px;
          }

          .info-item label {
            display: block;
            font-size: 12px;
            color: var(--text-muted, #64748b);
            margin-bottom: 4px;
          }

          .info-item span {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-primary, #1e293b);
          }

          .documents-section h3 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .docs-grid {
            display: grid;
            gap: 12px;
          }

          .doc-card {
            border: 1px solid var(--border, #e2e8f0);
            border-radius: 8px;
            padding: 14px;
          }

          .doc-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .doc-type {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary, #1e293b);
          }

          .doc-status {
            font-size: 12px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 4px;
          }

          .doc-status.pending { background: #fef3c7; color: #d97706; }
          .doc-status.verified { background: #d1fae5; color: #059669; }
          .doc-status.rejected { background: #fee2e2; color: #dc2626; }

          .doc-name {
            font-size: 13px;
            color: var(--text-muted, #64748b);
            margin-bottom: 12px;
          }

          .doc-actions {
            display: flex;
            gap: 8px;
          }

          .notes-section {
            margin-top: 24px;
          }

          .notes-section label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
          }

          .notes-section textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--border, #e2e8f0);
            border-radius: 8px;
            font-size: 14px;
            resize: vertical;
          }

          .modal-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            border-top: 1px solid var(--border, #e2e8f0);
            background: var(--bg-secondary, #f8fafc);
          }

          .footer-info {
            font-size: 13px;
          }

          .info-text.success { color: #059669; }
          .info-text.danger { color: #dc2626; }

          .footer-actions {
            display: flex;
            gap: 12px;
          }

          .btn-outline {
            padding: 10px 16px;
            border: 1px solid var(--border, #e2e8f0);
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .btn-success {
            padding: 10px 16px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          }

          .btn-success:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .btn-danger {
            padding: 10px 16px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          }
        `}</style>
      </div>
    </div>
  );
};

// Bills Tab Component
const BillsTab = ({
  bills,
  onRefresh,
  statusBadge,
  formatDate,
}: {
  bills: Bill[];
  onRefresh: () => void;
  statusBadge: (status: string) => React.ReactElement;
  formatDate: (date: string) => string;
}) => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [notes, setNotes] = useState("");

  const handleVerify = async (decision: string) => {
    if (!selectedBill) return;
    try {
      await opsApi.verifyBill(selectedBill._id, { decision, notes });
      toast.success(`Bill ${decision === "approve" ? "approved" : "rejected"}`);
      setSelectedBill(null);
      setNotes("");
      onRefresh();
    } catch {
      toast.error("Failed to verify bill");
    }
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>SubContractor Invoice Verification</h2>
        <span className="count">{bills.length} pending</span>
      </div>

      {bills.length === 0 ? (
        <div className="empty-card">
          <HiOutlineCheckCircle />
          <p>No pending invoice verifications</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Bill #</th>
                <th>Sub-Contractor</th>
                <th>EPC</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b._id}>
                  <td>
                    <strong>{b.billNumber || "—"}</strong>
                  </td>
                  <td>{b.subContractorId?.companyName || "—"}</td>
                  <td>{b.linkedEpcId?.companyName || "—"}</td>
                  <td className="amount">
                    {b.amount ? `₹${b.amount.toLocaleString()}` : "—"}
                  </td>
                  <td>{formatDate(b.createdAt)}</td>
                  <td>{statusBadge(b.status)}</td>
                  <td>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => setSelectedBill(b)}
                    >
                      <HiOutlineEye /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bill Review Modal */}
      {selectedBill && (
        <div className="bill-modal-overlay" onClick={() => setSelectedBill(null)}>
          <div
            className="bill-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bill-modal-header">
              <div className="bill-modal-title-group">
                <span className="bill-modal-icon"><HiOutlineDocumentText /></span>
                <div>
                  <p className="bill-modal-label">Invoice Review</p>
                  <h2 className="bill-modal-title">Bill #{selectedBill.billNumber || "N/A"}</h2>
                </div>
              </div>
              <button
                className="bill-modal-close"
                onClick={() => setSelectedBill(null)}
              >
                ×
              </button>
            </div>

            <div className="bill-modal-body">
              {/* Info Banner */}
              <div className="bill-info-banner">
                <div className="bill-info-party">
                  <HiOutlineUser />
                  <div>
                    <p className="party-label">Sub-Contractor</p>
                    <p className="party-name">{selectedBill.subContractorId?.companyName || "—"}</p>
                  </div>
                </div>
                <div className="bill-info-divider" />
                <div className="bill-info-party">
                  <HiOutlineOfficeBuilding />
                  <div>
                    <p className="party-label">EPC Company</p>
                    <p className="party-name">{selectedBill.linkedEpcId?.companyName || "—"}</p>
                  </div>
                </div>
                <div className="bill-info-divider" />
                <div className="bill-info-amount">
                  <p className="party-label">Invoice Amount</p>
                  <p className="amount-hero">
                    {selectedBill.amount ? `₹${selectedBill.amount.toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedBill.description && (
                <div className="bill-description-row">
                  <span className="desc-label">Description</span>
                  <span className="desc-value">{selectedBill.description}</span>
                </div>
              )}

              {/* Documents */}
              <div className="bill-docs-section">
                <p className="bill-docs-heading">Attached Documents</p>
                <div className="bill-docs-grid">
                  {selectedBill.fileUrl && (
                    <a
                      href={selectedBill.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bill-doc-card primary"
                    >
                      <span className="bill-doc-icon"><HiOutlineDocumentText /></span>
                      <div className="bill-doc-info">
                        <span className="bill-doc-name">Bill Document</span>
                        <span className="bill-doc-action">Click to open →</span>
                      </div>
                    </a>
                  )}
                  {selectedBill.wcc?.uploaded && (
                    <a
                      href={selectedBill.wcc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bill-doc-card"
                    >
                      <span className="bill-doc-icon"><HiOutlinePaperClip /></span>
                      <div className="bill-doc-info">
                        <span className="bill-doc-name">WCC</span>
                        <span className="bill-doc-action">
                          {selectedBill.wcc.verified ? "✓ Verified" : "Click to open →"}
                        </span>
                      </div>
                      {selectedBill.wcc.verified && <span className="doc-verified-chip">Verified</span>}
                    </a>
                  )}
                  {selectedBill.measurementSheet?.uploaded && (
                    <a
                      href={selectedBill.measurementSheet.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bill-doc-card"
                    >
                      <span className="bill-doc-icon"><HiOutlinePaperClip /></span>
                      <div className="bill-doc-info">
                        <span className="bill-doc-name">Measurement Sheet</span>
                        <span className="bill-doc-action">
                          {selectedBill.measurementSheet.certified ? "✓ Certified" : "Click to open →"}
                        </span>
                      </div>
                      {selectedBill.measurementSheet.certified && <span className="doc-verified-chip">Certified</span>}
                    </a>
                  )}
                  {!selectedBill.fileUrl && !selectedBill.wcc?.uploaded && !selectedBill.measurementSheet?.uploaded && (
                    <p className="no-docs-note">No documents attached</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="bill-notes-section">
                <label className="bill-notes-label">Verification Notes <span>(optional)</span></label>
                <textarea
                  className="bill-notes-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this verification..."
                  rows={3}
                />
              </div>
            </div>

            <div className="bill-modal-footer">
              <button
                className="bill-btn-cancel"
                onClick={() => setSelectedBill(null)}
              >
                Cancel
              </button>
              <div className="bill-footer-actions">
                <button
                  className="bill-btn-reject"
                  onClick={() => handleVerify("reject")}
                >
                  <HiOutlineXCircle /> Reject
                </button>
                <button
                  className="bill-btn-approve"
                  onClick={() => handleVerify("approve")}
                >
                  <HiOutlineCheckCircle /> Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .amount {
          font-weight: 600;
          color: var(--text-primary, #1e293b);
        }

        /* ── Bill Review Modal ── */
        .bill-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .bill-modal-container {
          background: white;
          border-radius: 16px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          width: 720px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          animation: billModalIn 0.2s ease;
        }

        @keyframes billModalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .bill-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border, #e2e8f0);
          background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
          border-radius: 16px 16px 0 0;
        }

        .bill-modal-title-group {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .bill-modal-icon {
          width: 44px;
          height: 44px;
          background: #dbeafe;
          color: #2563eb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .bill-modal-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--text-muted, #64748b);
          margin-bottom: 2px;
        }

        .bill-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary, #1e293b);
          margin: 0;
        }

        .bill-modal-close {
          width: 34px;
          height: 34px;
          border: none;
          background: #f1f5f9;
          border-radius: 8px;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          color: var(--text-muted, #64748b);
          transition: background 0.2s;
        }
        .bill-modal-close:hover { background: #e2e8f0; }

        .bill-modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Info Banner */
        .bill-info-banner {
          display: flex;
          align-items: center;
          gap: 0;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .bill-info-party {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          flex: 1;
          font-size: 22px;
          color: #94a3b8;
        }

        .bill-info-divider {
          width: 1px;
          height: 48px;
          background: #e2e8f0;
          flex-shrink: 0;
        }

        .bill-info-amount {
          padding: 16px 20px;
          flex-shrink: 0;
        }

        .party-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted, #64748b);
          margin: 0 0 3px;
        }

        .party-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary, #1e293b);
          margin: 0;
        }

        .amount-hero {
          font-size: 22px;
          font-weight: 800;
          color: #2563eb;
          margin: 0;
          font-variant-numeric: tabular-nums;
        }

        /* Description row */
        .bill-description-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
          padding: 12px 16px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
        }

        .desc-label {
          font-size: 12px;
          font-weight: 600;
          color: #92400e;
          white-space: nowrap;
        }

        .desc-value {
          font-size: 14px;
          color: #78350f;
        }

        /* Documents section */
        .bill-docs-section {}

        .bill-docs-heading {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted, #64748b);
          margin: 0 0 12px;
        }

        .bill-docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .bill-doc-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
          position: relative;
          cursor: pointer;
        }

        .bill-doc-card:hover {
          border-color: #2563eb;
          box-shadow: 0 2px 8px rgba(37,99,235,0.12);
          transform: translateY(-1px);
        }

        .bill-doc-card.primary {
          border-color: #93c5fd;
          background: #f0f7ff;
        }

        .bill-doc-card.primary:hover {
          background: #dbeafe;
          border-color: #2563eb;
        }

        .bill-doc-icon {
          width: 38px;
          height: 38px;
          background: #dbeafe;
          color: #2563eb;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .bill-doc-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .bill-doc-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary, #1e293b);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bill-doc-action {
          font-size: 11px;
          color: var(--text-muted, #64748b);
        }

        .doc-verified-chip {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 10px;
          font-weight: 700;
          background: #d1fae5;
          color: #059669;
          padding: 2px 7px;
          border-radius: 20px;
        }

        .no-docs-note {
          font-size: 14px;
          color: var(--text-muted, #64748b);
          font-style: italic;
        }

        /* Notes section */
        .bill-notes-section {}

        .bill-notes-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary, #1e293b);
          margin-bottom: 8px;
        }

        .bill-notes-label span {
          font-weight: 400;
          color: var(--text-muted, #64748b);
        }

        .bill-notes-textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          resize: vertical;
          font-family: inherit;
          color: var(--text-primary, #1e293b);
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .bill-notes-textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }

        /* Footer */
        .bill-modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 0 0 16px 16px;
        }

        .bill-footer-actions {
          display: flex;
          gap: 10px;
        }

        .bill-btn-cancel {
          padding: 10px 18px;
          border: 1.5px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-muted, #64748b);
          transition: all 0.2s;
        }
        .bill-btn-cancel:hover { background: #f1f5f9; border-color: #cbd5e1; }

        .bill-btn-reject {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 20px;
          background: white;
          border: 1.5px solid #ef4444;
          color: #ef4444;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .bill-btn-reject:hover { background: #fef2f2; }

        .bill-btn-approve {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 24px;
          background: #10b981;
          border: none;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 2px 6px rgba(16,185,129,0.3);
          transition: all 0.2s;
        }
        .bill-btn-approve:hover { background: #059669; box-shadow: 0 4px 10px rgba(16,185,129,0.35); }

        .verified-badge {
          background: #d1fae5;
          color: #059669;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          margin-left: 8px;
        }

        /* ── Shared tab layout styles (self-contained) ── */
        .tab-content {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border, #e2e8f0);
          overflow: hidden;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border, #e2e8f0);
        }

        .section-header h2 {
          font-size: 18px;
          font-weight: 600;
        }

        .section-header .count {
          font-size: 14px;
          color: var(--text-muted, #64748b);
        }

        .empty-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 60px 20px;
          color: var(--text-muted, #64748b);
        }

        .empty-card svg {
          font-size: 48px;
          color: #10b981;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 14px 20px;
          text-align: left;
          border-bottom: 1px solid var(--border, #e2e8f0);
        }

        th {
          background: var(--bg-secondary, #f8fafc);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted, #64748b);
        }

        td .amount {
          font-weight: 600;
          color: var(--text-primary, #1e293b);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--primary, #2563eb);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-primary:hover { background: #1d4ed8; }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .badge-green  { background: #d1fae5; color: #059669; }
        .badge-yellow { background: #fef3c7; color: #d97706; }
        .badge-red    { background: #fee2e2; color: #dc2626; }
        .badge-blue   { background: #dbeafe; color: #2563eb; }
        .badge-purple { background: #ede9fe; color: #7c3aed; }
        .badge-gray   { background: #f1f5f9; color: #64748b; }
      `}</style>
    </div>
  );
};

// KYC Verification Tab Component
const KycVerificationTab = ({
  kycItems,
  selectedKyc,
  setSelectedKyc,
  onRefresh,
  statusBadge,
  formatDate,
}: {
  kycItems: KycItem[];
  selectedKyc: KycItem | null;
  setSelectedKyc: (item: KycItem | null) => void;
  onRefresh: () => void;
  statusBadge: (status: string) => React.ReactElement;
  formatDate: (date: string) => string;
}) => {
  return (
    <div className="kyc-layout">
      {/* KYC List Panel */}
      <div className="kyc-list-panel">
        <div className="panel-header">
          <h3>Seller KYC Queue</h3>
          <span className="count">{kycItems.length}</span>
        </div>

        <div className="kyc-list">
          {kycItems.map((k) => (
            <div
              key={k._id}
              className={`kyc-item ${selectedKyc?._id === k._id ? "selected" : ""} ${k.status === "ACTION_REQUIRED" ? "urgent" : ""}`}
              onClick={() => setSelectedKyc(k)}
            >
              <div className="kyc-item-header">
                <strong>{k.subContractorId?.companyName || "Unknown"}</strong>
                {statusBadge(k.status)}
              </div>
              <div className="kyc-item-meta">
                <span className="entity-tag">SubContractor</span>
                <span>
                  <HiOutlineUser /> {k.userId?.name || "N/A"}
                </span>
                <span>
                  <HiOutlineClock /> {formatDate(k.createdAt)}
                </span>
              </div>
              {k.requestedAmount && (
                <div className="kyc-item-amount">
                  ₹{k.requestedAmount.toLocaleString()}
                </div>
              )}
            </div>
          ))}

          {kycItems.length === 0 && (
            <div className="empty-state">
              <HiOutlineCheckCircle />
              <span>No pending Seller KYC</span>
            </div>
          )}
        </div>
      </div>

      {/* KYC Detail Panel */}
      <div className="kyc-detail-panel">
        {selectedKyc ? (
          <KycDetailPanel
            kyc={selectedKyc}
            onClose={() => setSelectedKyc(null)}
            onRefresh={onRefresh}
          />
        ) : (
          <div className="no-selection">
            <HiOutlineDocumentText />
            <p>Select a SubContractor KYC to review</p>
          </div>
        )}
      </div>

      <style>{`
        .kyc-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 24px;
          min-height: 600px;
        }

        .kyc-list-panel {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border, #e2e8f0);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border, #e2e8f0);
          background: var(--bg-secondary, #f8fafc);
        }

        .panel-header h3 {
          font-size: 16px;
          font-weight: 600;
        }

        .panel-header .count {
          background: var(--primary, #2563eb);
          color: white;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }

        .kyc-list {
          flex: 1;
          overflow-y: auto;
        }

        .kyc-item {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border, #e2e8f0);
          cursor: pointer;
          transition: all 0.2s;
        }

        .kyc-item:hover {
          background: var(--bg-secondary, #f8fafc);
        }

        .kyc-item.selected {
          background: #dbeafe;
          border-left: 3px solid var(--primary, #2563eb);
        }

        .kyc-item.urgent {
          border-left: 3px solid #ef4444;
        }

        .kyc-item.urgent.selected {
          border-left-color: var(--primary, #2563eb);
        }

        .kyc-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .kyc-item-header strong {
          font-size: 14px;
          color: var(--text-primary, #1e293b);
        }

        .kyc-item-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 12px;
          color: var(--text-muted, #64748b);
        }

        .kyc-item-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .entity-tag {
          background: #dbeafe;
          color: #2563eb;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 10px;
          text-transform: uppercase;
        }

        .kyc-item-amount {
          margin-top: 8px;
          font-size: 16px;
          font-weight: 600;
          color: var(--primary, #2563eb);
        }

        .kyc-detail-panel {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--border, #e2e8f0);
          overflow: hidden;
        }

        .no-selection {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted, #64748b);
          gap: 12px;
        }

        .no-selection svg {
          font-size: 64px;
          opacity: 0.3;
        }

        @media (max-width: 1024px) {
          .kyc-layout {
            grid-template-columns: 1fr;
          }

          .kyc-list-panel {
            max-height: 300px;
          }
        }
      `}</style>
    </div>
  );
};

// KYC Detail Panel - Shows KYC info and links to full review page
const KycDetailPanel = ({
  kyc,
  onClose,
  onRefresh,
}: {
  kyc: KycItem;
  onClose: () => void;
  onRefresh: () => void;
}) => {
  const navigate = useNavigate();
  const [completingKyc, setCompletingKyc] = useState(false);

  const handleCompleteKyc = async () => {
    setCompletingKyc(true);
    try {
      await opsApi.completeKyc(kyc._id);
      toast.success("KYC completed — Case created");
      onClose();
      onRefresh();
    } catch {
      toast.error("Failed to complete KYC");
    } finally {
      setCompletingKyc(false);
    }
  };

  const statusColors: Record<string, string> = {
    KYC_PENDING: "#f59e0b",
    KYC_IN_PROGRESS: "#3b82f6",
    KYC_COMPLETED: "#10b981",
    UNDER_REVIEW: "#3b82f6",
    DOCUMENTS_PENDING: "#f59e0b",
    COMPLETED: "#10b981",
    REJECTED: "#ef4444",
  };

  const color = statusColors[kyc.status] || "#64748b";

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            {kyc.subContractorId?.companyName || "Unknown Company"}
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>
            {kyc.userId?.name || ""}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#64748b", lineHeight: 1, padding: 0 }}
        >
          ×
        </button>
      </div>

      {/* Status & Date */}
      <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8, fontSize: 13, display: "flex", flexDirection: "column", gap: 8, border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600, color: "#374151" }}>Status:</span>
          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: color + "20", color: color, fontWeight: 600, fontSize: 12 }}>
            {kyc.status}
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 600, color: "#374151" }}>Submitted:</span>{" "}
          <span style={{ color: "#64748b" }}>{new Date(kyc.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
        {kyc.requestedAmount && (
          <div>
            <span style={{ fontWeight: 600, color: "#374151" }}>Requested Amount:</span>{" "}
            <span style={{ color: "#64748b" }}>₹{kyc.requestedAmount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Open Full KYC Review Button */}
      <button
        onClick={() => navigate("/ops/kyc", { state: { sellerId: kyc.subContractorId?._id, sellerName: kyc.subContractorId?.companyName } })}
        style={{
          padding: "14px 24px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <span>🔍</span>
        <span>Open Full KYC Review</span>
        <span style={{ marginLeft: 4 }}>→</span>
      </button>

      {/* Complete KYC (only when in progress) */}
      {kyc.status === "KYC_IN_PROGRESS" && (
        <button
          onClick={handleCompleteKyc}
          disabled={completingKyc}
          style={{
            padding: "12px 24px",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: completingKyc ? "not-allowed" : "pointer",
            fontWeight: 600,
            opacity: completingKyc ? 0.7 : 1,
          }}
        >
          {completingKyc ? "Processing..." : "✓ Complete KYC"}
        </button>
      )}
    </div>
  );
};

// Cases Tab Component
const CasesTab = ({
  cases,
  statusBadge,
}: {
  cases: CaseItem[];
  statusBadge: (status: string) => React.ReactElement;
}) => {
  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>All Cases</h2>
        <span className="count">{cases.length} total</span>
      </div>

      {cases.length === 0 ? (
        <div className="empty-card">
          <HiOutlineDocumentText />
          <p>No cases yet</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Case #</th>
                <th>Sub-Contractor</th>
                <th>EPC</th>
                <th>Bill Amount</th>
                <th>Stage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c._id}>
                  <td>
                    <strong>{c.caseNumber}</strong>
                  </td>
                  <td>{c.subContractorId?.companyName || "—"}</td>
                  <td>{c.epcId?.companyName || "—"}</td>
                  <td className="amount">
                    {c.billId?.amount
                      ? `₹${c.billId.amount.toLocaleString()}`
                      : "—"}
                  </td>
                  <td>{c.currentStage || "—"}</td>
                  <td>{statusBadge(c.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// NBFC Invite Tab Component
const NbfcInviteTab = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await opsApi.inviteNbfc(formData);
      toast.success("NBFC invited successfully!");
      setFormData({
        companyName: "",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
      });
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      toast.error(axiosErr.response?.data?.error || "Failed to invite NBFC");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>Invite NBFC Partner</h2>
      </div>

      <div className="invite-form-container">
        <form onSubmit={handleSubmit} className="invite-form">
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              placeholder="NBFC Company Name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contact Person *</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
                placeholder="Full Name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@company.com"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+91 98765 43210"
                required
              />
            </div>
            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Office Address"
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Sending..." : "Send Invitation"}
          </button>
        </form>
      </div>

      <style>{`
        .invite-form-container {
          padding: 24px;
        }

        .invite-form {
          max-width: 600px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--text-primary, #1e293b);
        }

        .form-group input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary, #2563eb);
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: var(--primary, #2563eb);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-btn:hover {
          background: #1d4ed8;
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default OpsDashboardNew;

// ========================================
// CWCRF Ops Tab Component
// ========================================
interface CwcrfOpsTabProps {
  cwcrfs: any[];        // Phase 6: SUBMITTED / OPS_REVIEW
  triageCwcrfs: any[]; // Phase 8: RMT_APPROVED
  forwardingId: string | null;
  verifyingSection: string | null;
  triageId: string | null;
  onForwardToRmt: (id: string) => Promise<void>;
  onVerifySection: (id: string, section: string, verified: boolean, notes: string) => Promise<void>;
  onTriage: (id: string, action: string, notes: string) => Promise<void>;
  formatDate: (date: string) => string;
  statusBadge: (status: string) => JSX.Element;
}

const CWCRF_SECTIONS = [
  { key: "sectionA", label: "Section A", desc: "Seller / SC Details" },
  { key: "sectionB", label: "Section B", desc: "Buyer / EPC Details" },
  { key: "sectionC", label: "Section C", desc: "CWC Request & Invoice" },
  { key: "sectionD", label: "Section D", desc: "Supporting Documents" },
  { key: "raBillVerified", label: "RA Bill", desc: "Running Account Bill" },
  { key: "wccVerified", label: "WCC", desc: "Work Completion Certificate" },
  { key: "measurementSheetVerified", label: "Meas. Sheet", desc: "Measurement Sheet" },
];

const CwcrfOpsTab: React.FC<CwcrfOpsTabProps> = ({
  cwcrfs, triageCwcrfs, forwardingId, verifyingSection, triageId,
  onForwardToRmt, onVerifySection, onTriage, formatDate, statusBadge,
}) => {
  const [subTab, setSubTab] = React.useState<"verify" | "triage">("verify");
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [sectionNotes, setSectionNotes] = React.useState<Record<string, string>>({});
  const [triageNotes, setTriageNotes] = React.useState<Record<string, string>>({});

  const totalBadge = cwcrfs.length + triageCwcrfs.length;

  return (
    <div style={{ padding: "0 0 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>
          CWC Request Forms — Ops Dashboard
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
          Phase 6: Verify CWCRF sections &bull; Phase 8: Risk triage after RMT assessment
        </p>
      </div>

      {/* Sub-tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid #e2e8f0", paddingBottom: 0 }}>
        {([
          { key: "verify", label: "Section Verify (Phase 6)", count: cwcrfs.length },
          { key: "triage", label: "Risk Triage (Phase 8)", count: triageCwcrfs.length },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "none",
              fontSize: 13,
              fontWeight: subTab === t.key ? 700 : 500,
              color: subTab === t.key ? "#7c3aed" : "#64748b",
              borderBottom: subTab === t.key ? "2px solid #7c3aed" : "2px solid transparent",
              cursor: "pointer",
              marginBottom: -2,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                background: subTab === t.key ? "#7c3aed" : "#94a3b8",
                color: "#fff",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                padding: "1px 7px",
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Phase 6: Section Verify ── */}
      {subTab === "verify" && (
        <div>
          {cwcrfs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: "#94a3b8" }}>
              <HiOutlineCheckCircle style={{ width: 48, height: 48, margin: "0 auto 12px", display: "block", color: "#86efac" }} />
              <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>No CWCRFs pending section verification</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Submitted CWCRFs will appear here</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cwcrfs.map((cwcrf) => {
                const ov = cwcrf.opsVerification || {};
                const allSectionsVerified = ["sectionA","sectionB","sectionC","sectionD"].every(
                  (s) => ov[s]?.verified
                );
                return (
                  <div key={cwcrf._id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    {/* Row header */}
                    <div
                      style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 16, cursor: "pointer",
                        background: expanded === cwcrf._id ? "#f8fafc" : "#fff",
                        borderBottom: expanded === cwcrf._id ? "1px solid #e2e8f0" : "none" }}
                      onClick={() => setExpanded(expanded === cwcrf._id ? null : cwcrf._id)}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, color: "#6d28d9", fontSize: 14 }}>
                            {cwcrf.cwcRfNumber || `#${cwcrf._id?.slice(-8).toUpperCase()}`}
                          </span>
                          {statusBadge(cwcrf.status)}
                          {allSectionsVerified && (
                            <span style={{ fontSize: 11, background: "#d1fae5", color: "#065f46", borderRadius: 999, padding: "2px 8px", fontWeight: 600 }}>✓ All Sections Verified</span>
                          )}
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                          Seller: <strong>{cwcrf.subContractorId?.companyName || "—"}</strong>
                          {cwcrf.epcId?.companyName && (<> &bull; EPC: <strong>{cwcrf.epcId.companyName}</strong></>)}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontWeight: 700, color: "#059669", fontSize: 16, margin: 0 }}>
                          ₹{Number(cwcrf.cwcRequest?.requestedAmount || 0).toLocaleString()}
                        </p>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Requested</p>
                      </div>
                      {allSectionsVerified && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onForwardToRmt(cwcrf._id); }}
                          disabled={forwardingId === cwcrf._id}
                          style={{ padding: "8px 16px", background: forwardingId === cwcrf._id ? "#a78bfa" : "#7c3aed", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", flexShrink: 0 }}
                        >
                          {forwardingId === cwcrf._id ? "Forwarding..." : "Forward to RMT →"}
                        </button>
                      )}
                      <HiOutlineChevronRight style={{ width: 20, height: 20, color: "#94a3b8", transform: expanded === cwcrf._id ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
                    </div>

                    {/* Expandable: section verify */}
                    {expanded === cwcrf._id && (
                      <div style={{ padding: 20, background: "#fafafa" }}>
                        {/* Invoice summary */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Invoice No.</p>
                            <p style={{ fontWeight: 600, color: "#1e293b", fontSize: 14, margin: 0 }}>{cwcrf.invoiceDetails?.invoiceNumber || "—"}</p>
                          </div>
                          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Invoice Amount</p>
                            <p style={{ fontWeight: 700, color: "#059669", fontSize: 15, margin: 0 }}>₹{Number(cwcrf.invoiceDetails?.invoiceAmount || 0).toLocaleString()}</p>
                          </div>
                          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Tenure</p>
                            <p style={{ fontWeight: 600, color: "#1e293b", fontSize: 14, margin: 0 }}>{cwcrf.cwcRequest?.requestedTenure ? `${cwcrf.cwcRequest.requestedTenure} days` : "—"}</p>
                          </div>
                        </div>

                        {/* Section verify grid */}
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>Section Verification</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                          {CWCRF_SECTIONS.map((sec) => {
                            const isBool = sec.key.endsWith("Verified");
                            const isVerified = isBool ? ov[sec.key] === true : ov[sec.key]?.verified === true;
                            const noteKey = `${cwcrf._id}-${sec.key}`;
                            const isVerifying = verifyingSection === noteKey;
                            return (
                              <div key={sec.key} style={{
                                background: isVerified ? "#f0fdf4" : "#fff",
                                border: `1px solid ${isVerified ? "#86efac" : "#e2e8f0"}`,
                                borderRadius: 10,
                                padding: 14,
                              }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                  <div>
                                    <p style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", margin: 0 }}>{sec.label}</p>
                                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{sec.desc}</p>
                                  </div>
                                  {isVerified && <span style={{ fontSize: 18, color: "#22c55e" }}>✓</span>}
                                </div>
                                <textarea
                                  placeholder="Notes (optional)"
                                  value={sectionNotes[noteKey] || ""}
                                  onChange={(e) => setSectionNotes((prev) => ({ ...prev, [noteKey]: e.target.value }))}
                                  rows={2}
                                  style={{ width: "100%", fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 8px", resize: "vertical", boxSizing: "border-box", marginBottom: 8, fontFamily: "inherit" }}
                                />
                                <div style={{ display: "flex", gap: 6 }}>
                                  {!isVerified ? (
                                    <button
                                      disabled={isVerifying}
                                      onClick={() => onVerifySection(cwcrf._id, sec.key, true, sectionNotes[noteKey] || "")}
                                      style={{ flex: 1, padding: "6px 0", background: isVerifying ? "#a7f3d0" : "#10b981", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                                    >
                                      {isVerifying ? "Saving..." : "Mark Verified"}
                                    </button>
                                  ) : (
                                    <button
                                      disabled={isVerifying}
                                      onClick={() => onVerifySection(cwcrf._id, sec.key, false, sectionNotes[noteKey] || "")}
                                      style={{ flex: 1, padding: "6px 0", background: isVerifying ? "#fca5a5" : "#ef4444", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                                    >
                                      {isVerifying ? "Saving..." : "Unmark"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 14, marginBottom: 0 }}>Submitted: {formatDate(cwcrf.createdAt)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Phase 8: Risk Triage ── */}
      {subTab === "triage" && (
        <div>
          {triageCwcrfs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: "#94a3b8" }}>
              <HiOutlineCheckCircle style={{ width: 48, height: 48, margin: "0 auto 12px", display: "block", color: "#86efac" }} />
              <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>No CWCRFs in triage queue</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>RMT-assessed CWCRFs will appear here</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {triageCwcrfs.map((cwcrf) => {
                const risk = cwcrf.cwcafData?.riskCategory || cwcrf.rmtAssessment?.riskCategory || "—";
                const riskColor = risk === "LOW" ? "#10b981" : risk === "MEDIUM" ? "#f59e0b" : risk === "HIGH" ? "#ef4444" : "#94a3b8";
                const noteKey = `triage-${cwcrf._id}`;
                const isTriaging = triageId === cwcrf._id;
                return (
                  <div key={cwcrf._id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    {/* Row header */}
                    <div
                      style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 16, cursor: "pointer",
                        background: expanded === `t-${cwcrf._id}` ? "#f8fafc" : "#fff",
                        borderBottom: expanded === `t-${cwcrf._id}` ? "1px solid #e2e8f0" : "none" }}
                      onClick={() => setExpanded(expanded === `t-${cwcrf._id}` ? null : `t-${cwcrf._id}`)}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, color: "#6d28d9", fontSize: 14 }}>
                            {cwcrf.cwcRfNumber || `#${cwcrf._id?.slice(-8).toUpperCase()}`}
                          </span>
                          {statusBadge(cwcrf.status)}
                          <span style={{ fontSize: 11, background: `${riskColor}20`, color: riskColor, borderRadius: 999, padding: "2px 8px", fontWeight: 700, border: `1px solid ${riskColor}40` }}>
                            Risk: {risk}
                          </span>
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                          Seller: <strong>{cwcrf.subContractorId?.companyName || "—"}</strong>
                          {cwcrf.epcId?.companyName && (<> &bull; EPC: <strong>{cwcrf.epcId.companyName}</strong></>)}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontWeight: 700, color: "#059669", fontSize: 16, margin: 0 }}>
                          ₹{Number(cwcrf.cwcRequest?.requestedAmount || 0).toLocaleString()}
                        </p>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Requested</p>
                      </div>
                      <HiOutlineChevronRight style={{ width: 20, height: 20, color: "#94a3b8", transform: expanded === `t-${cwcrf._id}` ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
                    </div>

                    {/* Expandable: triage actions */}
                    {expanded === `t-${cwcrf._id}` && (
                      <div style={{ padding: 20, background: "#fafafa" }}>
                        {/* RMT recommendation banner */}
                        {cwcrf.rmtAssessment?.recommendation && (
                          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 14, marginBottom: 16 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", marginBottom: 6 }}>RMT Recommendation</p>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                              {cwcrf.rmtAssessment.recommendation}
                            </p>
                            {cwcrf.rmtAssessment.notes && (
                              <p style={{ fontSize: 13, color: "#374151", marginTop: 6, marginBottom: 0 }}>{cwcrf.rmtAssessment.notes}</p>
                            )}
                          </div>
                        )}

                        {risk === "HIGH" && (
                          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: "#b91c1c" }}>
                            ⚠️ <strong>High-risk case:</strong> Ensure Founder / Senior Ops approval has been obtained before forwarding to EPC.
                          </div>
                        )}

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Invoice Amount</p>
                            <p style={{ fontWeight: 700, color: "#059669", fontSize: 15, margin: 0 }}>₹{Number(cwcrf.invoiceDetails?.invoiceAmount || 0).toLocaleString()}</p>
                          </div>
                          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Requested Tenure</p>
                            <p style={{ fontWeight: 600, color: "#1e293b", fontSize: 14, margin: 0 }}>{cwcrf.cwcRequest?.requestedTenure ? `${cwcrf.cwcRequest.requestedTenure} days` : "—"}</p>
                          </div>
                          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
                            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Submitted</p>
                            <p style={{ fontWeight: 600, color: "#1e293b", fontSize: 14, margin: 0 }}>{formatDate(cwcrf.createdAt)}</p>
                          </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Notes / Reason (required for rejection)</label>
                          <textarea
                            value={triageNotes[noteKey] || ""}
                            onChange={(e) => setTriageNotes((prev) => ({ ...prev, [noteKey]: e.target.value }))}
                            rows={3}
                            placeholder="Add notes for this triage decision..."
                            style={{ width: "100%", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                          />
                        </div>

                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            disabled={isTriaging}
                            onClick={() => onTriage(cwcrf._id, "forward_to_epc", triageNotes[noteKey] || "")}
                            style={{ flex: 1, padding: "10px 0", background: isTriaging ? "#a7f3d0" : "#10b981", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                          >
                            {isTriaging ? "Processing..." : "✓ Forward to EPC"}
                          </button>
                          <button
                            disabled={isTriaging || !triageNotes[noteKey]?.trim()}
                            onClick={() => onTriage(cwcrf._id, "reject", triageNotes[noteKey] || "")}
                            style={{ flex: 1, padding: "10px 0", background: isTriaging || !triageNotes[noteKey]?.trim() ? "#fca5a5" : "#ef4444", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                          >
                            {isTriaging ? "Processing..." : "✕ Reject"}
                          </button>
                        </div>
                        {!triageNotes[noteKey]?.trim() && (
                          <p style={{ fontSize: 11, color: "#f59e0b", marginTop: 6 }}>* Notes are required to reject a CWCRF</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
