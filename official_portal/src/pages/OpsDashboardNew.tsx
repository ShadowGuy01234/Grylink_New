import React, { useState, useEffect, useRef, useCallback } from "react";
import { opsApi, casesApi, approvalApi, slaApi } from "../api";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  HiOutlineDocumentText,
  HiOutlineChat,
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

interface ChatMessage {
  _id: string;
  senderId: { _id: string; name: string; email?: string };
  senderRole: "ops" | "subcontractor" | "admin" | "nbfc";
  messageType: "text" | "file" | "system" | "action_required";
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  thumbnailUrl?: string;
  replyTo?: {
    _id: string;
    content: string;
    senderId: { _id: string; name: string };
    senderRole: string;
    createdAt: string;
  };
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  createdAt: string;
  isRead: boolean;
  readAt?: string;
  readBy?: Array<{ _id: string; name: string }>;
  reactions?: Array<{
    emoji: string;
    userId: { _id: string; name: string };
    createdAt: string;
  }>;
  actionType?: "REQUEST_DOCUMENT" | "CLARIFICATION" | "APPROVAL_NEEDED" | "URGENT";
  actionResolved?: boolean;
  actionResolvedAt?: string;
  isEdited?: boolean;
  editedAt?: string;
  isDeleted?: boolean;
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

  const fetchData = useCallback(async () => {
    try {
      const [pendingRes, casesRes, approvalRes, slaDashboardRes, activeSlaRes, overdueSlaRes] = await Promise.all([
        opsApi.getPending(),
        casesApi.getCases(),
        approvalApi.getPendingCount().catch(() => ({ data: { count: 0 } })),
        slaApi.getDashboard().catch(() => ({ data: { stats: { total: 0, active: 0, completed: 0, overdue: 0 }, recentOverdue: [] } })),
        slaApi.getActive().catch(() => ({ data: [] })),
        slaApi.getOverdue().catch(() => ({ data: [] })),
      ]);
      setPending(pendingRes.data);
      setCases(casesRes.data);
      setApprovalCount(approvalRes.data.count || 0);
      setSlaDashboard(slaDashboardRes.data);
      setActiveSlas(activeSlaRes.data);
      setOverdueSlas(overdueSlaRes.data);
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

// KYC Detail Panel with Enhanced Chat
const KycDetailPanel = ({
  kyc,
  onClose,
  onRefresh,
}: {
  kyc: KycItem;
  onClose: () => void;
  onRefresh: () => void;
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [actionType, setActionType] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const REACTION_EMOJIS = ['👍', '✅', '❌', '⏳', '📄', '❓'];

  const loadMessages = useCallback(async () => {
    try {
      const res = await opsApi.getChatMessages(kyc._id);
      setMessages(res.data);
      // Mark as read when loaded
      opsApi.markMessagesAsRead(kyc._id).catch(() => {});
    } catch {
      console.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [kyc._id]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await opsApi.getUnreadCount(kyc._id);
      setUnreadCount(res.data.count);
    } catch {
      // Ignore
    }
  }, [kyc._id]);

  useEffect(() => {
    loadMessages();
    loadUnreadCount();
    // Poll for new messages every 5 seconds (faster for real-time feel)
    const interval = setInterval(() => {
      loadMessages();
      loadUnreadCount();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadMessages, loadUnreadCount]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Search messages
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await opsApi.searchMessages(kyc._id, searchQuery);
      setSearchResults(res.data);
    } catch {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  }, [kyc._id, searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [handleSearch]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !file) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("content", newMessage);
      if (file) formData.append("file", file);
      if (replyingTo) formData.append("replyTo", replyingTo._id);
      if (actionType) formData.append("actionType", actionType);

      await opsApi.sendChatMessage(kyc._id, formData);
      setNewMessage("");
      setFile(null);
      setReplyingTo(null);
      setActionType("");
      loadMessages();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleRequestDocs = async () => {
    if (!newMessage.trim()) {
      toast.error("Please enter a message describing what documents are needed");
      return;
    }

    try {
      await opsApi.requestKyc(kyc._id, newMessage);
      toast.success("Document request sent");
      setNewMessage("");
      loadMessages();
      onRefresh();
    } catch {
      toast.error("Failed to send request");
    }
  };

  const handleCompleteKyc = async () => {
    try {
      await opsApi.completeKyc(kyc._id);
      toast.success("KYC completed — Case created");
      onClose();
      onRefresh();
    } catch {
      toast.error("Failed to complete KYC");
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      await opsApi.addReaction(messageId, emoji);
      loadMessages();
      setShowEmojiPicker(null);
    } catch {
      toast.error("Failed to add reaction");
    }
  };

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    try {
      await opsApi.removeReaction(messageId, emoji);
      loadMessages();
    } catch {
      toast.error("Failed to remove reaction");
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim()) return;
    try {
      await opsApi.editMessage(messageId, editContent);
      setEditingMessage(null);
      setEditContent("");
      loadMessages();
      toast.success("Message edited");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to edit message");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await opsApi.deleteMessage(messageId);
      loadMessages();
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const handleResolveAction = async (messageId: string) => {
    try {
      await opsApi.resolveAction(messageId);
      loadMessages();
      toast.success("Action resolved");
    } catch {
      toast.error("Failed to resolve action");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  return (
    <div className="kyc-detail">
      {/* Header */}
      <div className="detail-header">
        <div>
          <h2>{kyc.subContractorId?.companyName || "Unknown"}</h2>
          <span className="user-info">
            {kyc.userId?.name} • {kyc.userId?.email}
          </span>
        </div>
        <div className="header-actions">
          {kyc.status !== "KYC_COMPLETED" && (
            <button className="btn-success" onClick={handleCompleteKyc}>
              <HiOutlineCheckCircle /> Complete KYC
            </button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="info-cards">
        <div className="info-card">
          <label>Requested Amount</label>
          <span className="value">
            {kyc.requestedAmount
              ? `₹${kyc.requestedAmount.toLocaleString()}`
              : "—"}
          </span>
        </div>
        <div className="info-card">
          <label>Tenure</label>
          <span className="value">{kyc.tenure ? `${kyc.tenure} days` : "—"}</span>
        </div>
        <div className="info-card">
          <label>Bill Amount</label>
          <span className="value">
            {kyc.billId?.amount
              ? `₹${kyc.billId.amount.toLocaleString()}`
              : "—"}
          </span>
        </div>
        <div className="info-card">
          <label>Status</label>
          <span
            className={`status-badge ${kyc.status === "ACTION_REQUIRED" ? "danger" : kyc.status === "KYC_COMPLETED" ? "success" : ""}`}
          >
            {kyc.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Chat Section */}
      <div className="chat-section">
        <div className="chat-header">
          <h3>
            <HiOutlineChat /> KYC Chat
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </h3>
          <div className="chat-header-actions">
            <button 
              className={`icon-btn ${showSearch ? 'active' : ''}`}
              onClick={() => setShowSearch(!showSearch)}
              title="Search messages"
            >
              <HiOutlineSearch />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="chat-search">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              autoFocus
            />
            {isSearching && <span className="searching">Searching...</span>}
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((msg) => (
                  <div key={msg._id} className="search-result-item">
                    <span className="result-sender">{msg.senderId?.name}</span>
                    <span className="result-content">{msg.content}</span>
                    <span className="result-time">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="chat-messages">
          {loading ? (
            <div className="loading">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="no-messages">
              <HiOutlineChat />
              <p>No messages yet. Start the conversation to request documents.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`message ${msg.senderRole === "ops" || msg.senderRole === "admin" ? "sent" : "received"} ${msg.messageType === 'action_required' ? 'action-message' : ''} ${msg.actionResolved ? 'resolved' : ''}`}
              >
                {/* Reply Reference */}
                {msg.replyTo && (
                  <div className="reply-reference">
                    <span className="reply-sender">{msg.replyTo.senderId?.name}</span>
                    <span className="reply-content">{msg.replyTo.content?.substring(0, 50)}...</span>
                  </div>
                )}

                {/* Action Badge */}
                {msg.messageType === 'action_required' && (
                  <div className={`action-badge ${msg.actionType?.toLowerCase()}`}>
                    {msg.actionType?.replace(/_/g, ' ')}
                    {msg.actionResolved && <span className="resolved-tag">✓ Resolved</span>}
                  </div>
                )}

                <div className="message-header">
                  <span className="sender">
                    {msg.senderRole === "ops" || msg.senderRole === "admin" ? "Ops Team" : msg.senderId?.name}
                  </span>
                  <span className="time">
                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.isEdited && <span className="edited-tag">(edited)</span>}
                    {(msg.senderRole === "ops" || msg.senderRole === "admin") && (
                      <span className={`status-indicator ${msg.status}`}>
                        {getMessageStatusIcon(msg.status)}
                      </span>
                    )}
                  </span>
                </div>

                {/* Message Content or Edit Form */}
                {editingMessage === msg._id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEditMessage(msg._id)}
                    />
                    <button onClick={() => handleEditMessage(msg._id)}>Save</button>
                    <button onClick={() => setEditingMessage(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    {msg.content && <div className="message-content">{msg.content}</div>}
                  </>
                )}

                {/* File Attachment */}
                {msg.fileUrl && (
                  <div className="message-file-container">
                    {msg.thumbnailUrl || msg.fileType?.startsWith('image/') ? (
                      <img src={msg.thumbnailUrl || msg.fileUrl} alt={msg.fileName} className="file-thumbnail" />
                    ) : null}
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="message-file"
                    >
                      <HiOutlinePaperClip /> {msg.fileName || "Attachment"}
                      {msg.fileSize && <span className="file-size">{formatFileSize(msg.fileSize)}</span>}
                    </a>
                  </div>
                )}

                {/* Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="reactions">
                    {msg.reactions.map((reaction, idx) => (
                      <span 
                        key={idx} 
                        className="reaction"
                        onClick={() => handleRemoveReaction(msg._id, reaction.emoji)}
                        title={reaction.userId?.name}
                      >
                        {reaction.emoji}
                      </span>
                    ))}
                  </div>
                )}

                {/* Message Actions */}
                <div className="message-actions">
                  <button 
                    className="action-btn"
                    onClick={() => setShowEmojiPicker(showEmojiPicker === msg._id ? null : msg._id)}
                    title="React"
                  >
                    😀
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => setReplyingTo(msg)}
                    title="Reply"
                  >
                    ↩
                  </button>
                  {(msg.senderRole === "ops" || msg.senderRole === "admin") && (
                    <>
                      <button 
                        className="action-btn"
                        onClick={() => {
                          setEditingMessage(msg._id);
                          setEditContent(msg.content || "");
                        }}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteMessage(msg._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                  {msg.messageType === 'action_required' && !msg.actionResolved && (
                    <button 
                      className="action-btn resolve"
                      onClick={() => handleResolveAction(msg._id)}
                      title="Mark as Resolved"
                    >
                      ✓
                    </button>
                  )}
                </div>

                {/* Emoji Picker */}
                {showEmojiPicker === msg._id && (
                  <div className="emoji-picker">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleAddReaction(msg._id, emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        {kyc.status !== "KYC_COMPLETED" && (
          <div className="chat-input-area">
            {/* Reply Indicator */}
            {replyingTo && (
              <div className="reply-indicator">
                <span>Replying to {replyingTo.senderId?.name}</span>
                <span className="reply-preview">{replyingTo.content?.substring(0, 40)}...</span>
                <button onClick={() => setReplyingTo(null)}>×</button>
              </div>
            )}

            {file && (
              <div className="file-preview">
                <HiOutlinePaperClip /> {file.name}
                <button onClick={() => setFile(null)}>×</button>
              </div>
            )}

            {/* Action Type Selector */}
            <div className="action-type-selector">
              <label>Message Type:</label>
              <select value={actionType} onChange={(e) => setActionType(e.target.value)}>
                <option value="">Regular Message</option>
                <option value="REQUEST_DOCUMENT">📄 Request Document</option>
                <option value="CLARIFICATION">❓ Request Clarification</option>
                <option value="APPROVAL_NEEDED">☑️ Approval Needed</option>
                <option value="URGENT">🚨 Urgent</option>
              </select>
            </div>

            <div className="chat-input">
              <button
                className="attach-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
                <HiOutlinePaperClip />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message or document request..."
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={sending || (!newMessage.trim() && !file)}
              >
                Send
              </button>
              <button
                className="request-btn"
                onClick={handleRequestDocs}
                disabled={!newMessage.trim()}
                title="Send as document request (updates status to ACTION_REQUIRED)"
              >
                Request Docs
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .kyc-detail {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border, #e2e8f0);
        }

        .detail-header h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .user-info {
          font-size: 14px;
          color: var(--text-muted, #64748b);
        }

        .info-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding: 16px 24px;
          background: var(--bg-secondary, #f8fafc);
        }

        .info-card {
          padding: 12px;
          background: white;
          border-radius: 8px;
        }

        .info-card label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-muted, #64748b);
          margin-bottom: 4px;
        }

        .info-card .value {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #1e293b);
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          background: var(--bg-secondary, #f8fafc);
        }

        .status-badge.danger {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-badge.success {
          background: #d1fae5;
          color: #059669;
        }

        .chat-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          padding: 12px 24px;
          border-bottom: 1px solid var(--border, #e2e8f0);
        }

        .chat-header h3 {
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .no-messages {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted, #64748b);
          gap: 8px;
        }

        .no-messages svg {
          font-size: 48px;
          opacity: 0.3;
        }

        .message {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 12px;
        }

        .message.sent {
          align-self: flex-end;
          background: var(--primary, #2563eb);
          color: white;
        }

        .message.received {
          align-self: flex-start;
          background: var(--bg-secondary, #f8fafc);
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 11px;
          margin-bottom: 4px;
          opacity: 0.8;
        }

        .message-content {
          font-size: 14px;
          line-height: 1.5;
        }

        .message-file {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          padding: 6px 10px;
          background: rgba(255,255,255,0.2);
          border-radius: 6px;
          font-size: 12px;
          color: inherit;
          text-decoration: none;
        }

        .chat-input-area {
          border-top: 1px solid var(--border, #e2e8f0);
          padding: 16px 24px;
        }

        .file-preview {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--bg-secondary, #f8fafc);
          border-radius: 6px;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .file-preview button {
          margin-left: auto;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: var(--text-muted, #64748b);
        }

        .chat-input {
          display: flex;
          gap: 8px;
        }

        .attach-btn {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border, #e2e8f0);
          background: white;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: var(--text-muted, #64748b);
        }

        .chat-input input[type="text"] {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 8px;
          font-size: 14px;
        }

        .send-btn {
          padding: 10px 20px;
          background: var(--primary, #2563eb);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .request-btn {
          padding: 10px 14px;
          background: #f59e0b;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 13px;
        }

        .request-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Enhanced Chat Styles */
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-header-actions {
          display: flex;
          gap: 8px;
        }

        .icon-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted, #64748b);
        }

        .icon-btn:hover, .icon-btn.active {
          background: var(--bg-secondary, #f1f5f9);
          color: var(--primary, #2563eb);
        }

        .unread-badge {
          background: #ef4444;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 8px;
        }

        .chat-search {
          padding: 12px 24px;
          border-bottom: 1px solid var(--border, #e2e8f0);
          background: var(--bg-secondary, #f8fafc);
        }

        .chat-search input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 6px;
          font-size: 13px;
        }

        .search-results {
          margin-top: 8px;
          max-height: 200px;
          overflow-y: auto;
        }

        .search-result-item {
          padding: 8px;
          background: white;
          border-radius: 4px;
          margin-bottom: 4px;
          font-size: 12px;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .result-sender {
          font-weight: 600;
          color: var(--text-primary);
        }

        .result-content {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--text-muted);
        }

        .result-time {
          font-size: 10px;
          color: var(--text-muted);
        }

        .reply-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #dbeafe;
          border-radius: 6px;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .reply-indicator .reply-preview {
          flex: 1;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .reply-indicator button {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 0 4px;
        }

        .action-type-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .action-type-selector label {
          color: var(--text-muted);
        }

        .action-type-selector select {
          padding: 4px 8px;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 4px;
          font-size: 12px;
          background: white;
        }

        /* Action Messages */
        .message.action-message {
          border-left: 3px solid #f59e0b;
        }

        .message.action-message.resolved {
          border-left-color: #10b981;
          opacity: 0.8;
        }

        .action-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          margin-bottom: 8px;
          background: #fef3c7;
          color: #92400e;
        }

        .action-badge.urgent {
          background: #fee2e2;
          color: #dc2626;
        }

        .action-badge.request_document {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .resolved-tag {
          margin-left: 8px;
          color: #059669;
        }

        /* Reply Reference */
        .reply-reference {
          background: rgba(255,255,255,0.15);
          padding: 6px 10px;
          border-radius: 6px;
          margin-bottom: 8px;
          font-size: 11px;
          border-left: 2px solid rgba(255,255,255,0.3);
        }

        .message.received .reply-reference {
          background: rgba(0,0,0,0.05);
          border-left-color: var(--text-muted);
        }

        .reply-sender {
          font-weight: 600;
          margin-right: 6px;
        }

        .reply-content {
          opacity: 0.8;
        }

        /* Status Indicator */
        .status-indicator {
          margin-left: 4px;
          font-size: 10px;
        }

        .status-indicator.read {
          color: #10b981;
        }

        .edited-tag {
          font-style: italic;
          margin-left: 4px;
          opacity: 0.7;
        }

        /* Edit Form */
        .edit-form {
          display: flex;
          gap: 6px;
          margin-top: 8px;
        }

        .edit-form input {
          flex: 1;
          padding: 6px 10px;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 4px;
          font-size: 13px;
          background: rgba(255,255,255,0.2);
          color: inherit;
        }

        .edit-form button {
          padding: 6px 10px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          background: rgba(255,255,255,0.2);
          color: inherit;
        }

        /* File Preview */
        .message-file-container {
          margin-top: 8px;
        }

        .file-thumbnail {
          max-width: 200px;
          max-height: 150px;
          border-radius: 8px;
          margin-bottom: 6px;
          display: block;
        }

        .file-size {
          margin-left: 6px;
          opacity: 0.7;
          font-size: 10px;
        }

        /* Reactions */
        .reactions {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 8px;
        }

        .reaction {
          display: inline-flex;
          padding: 2px 6px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          font-size: 12px;
          cursor: pointer;
        }

        .message.received .reaction {
          background: rgba(0,0,0,0.08);
        }

        /* Message Actions */
        .message-actions {
          display: none;
          gap: 4px;
          margin-top: 8px;
        }

        .message:hover .message-actions {
          display: flex;
        }

        .action-btn {
          width: 24px;
          height: 24px;
          border: none;
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .message.received .action-btn {
          background: rgba(0,0,0,0.08);
        }

        .action-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .action-btn.delete:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .action-btn.resolve {
          background: #d1fae5;
          color: #059669;
        }

        /* Emoji Picker */
        .emoji-picker {
          display: flex;
          gap: 4px;
          margin-top: 6px;
          padding: 6px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .emoji-picker button {
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .emoji-picker button:hover {
          background: var(--bg-secondary, #f1f5f9);
        }

        @media (max-width: 768px) {
          .info-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
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
