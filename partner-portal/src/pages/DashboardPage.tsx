import { useState, useEffect } from "react";
import { companyApi, casesApi, bidsApi } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Components
import {
  DocumentsSection,
  DOCUMENT_TYPES,
} from "../components/dashboard/DocumentsSection";
import { SubContractorsSection } from "../components/dashboard/SubContractorsSection";
import { CasesAndBillsSection } from "../components/dashboard/CasesAndBillsSection";
import { BidsSection } from "../components/dashboard/BidsSection";

// Types
import { CompanyProfile, SubContractor, Case, Bid } from "../types";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const DashboardPage = () => {
  const { user } = useAuth();

  // Data State
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [subContractors, setSubContractors] = useState<SubContractor[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState("documents");
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Initial Data Fetch
  const fetchData = async () => {
    try {
      const promises: Promise<any>[] = [
        companyApi.getProfile(),
        companyApi.getSubContractors(),
        casesApi.getCases(),
        bidsApi.getMyBids(),
      ];
      const [profileRes, scRes, casesRes, bidsRes] =
        await Promise.all(promises);
      setProfile(profileRes.data);
      setSubContractors(scRes.data);
      setCases(casesRes.data);
      setMyBids(bidsRes.data || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---

  const handleUploadSingleDoc = async (docType: string, file: File) => {
    setUploadingDoc(docType);
    try {
      const formData = new FormData();
      formData.append("documents", file);
      formData.append("documentTypes", JSON.stringify([docType]));
      await companyApi.uploadDocuments(formData);
      toast.success(`${docType.replace(/_/g, " ")} uploaded successfully!`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleAddSC = async (scData: any) => {
    try {
      await companyApi.addSubContractors([scData]);
      toast.success("Sub-contractor added!");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add");
    }
  };

  const handleExcelUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await companyApi.bulkAddSubContractors(formData);
      toast.success(`Added ${res.data.created?.length || 0} sub-contractors`);
      if (res.data.errors?.length)
        toast.error(`${res.data.errors.length} rows had errors`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Bulk upload failed");
    }
  };

  const handleDeleteSubContractor = async (scId: string) => {
    try {
      await companyApi.deleteSubContractor(scId);
      toast.success("Sub-contractor removed successfully");
      setSubContractors((prev) => prev.filter((sc) => sc._id !== scId));
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || "Failed to remove sub-contractor",
      );
    }
  };

  const handleReviewCase = async (caseId: string, decision: string) => {
    try {
      await casesApi.reviewCase(caseId, { decision });
      toast.success(`Case ${decision === "approve" ? "approved" : "rejected"}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Review failed");
    }
  };

  const handlePlaceBid = async (bidData: any) => {
    try {
      await bidsApi.placeBid(bidData);
      toast.success("Bid placed!");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Bid failed");
    }
  };

  const handleNegotiate = async (bidId: string, counterOffer: any) => {
    try {
      await bidsApi.negotiate(bidId, counterOffer);
      toast.success("Counter-offer sent!");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Negotiation failed");
    }
  };

  const handleLockBid = async (bidId: string) => {
    try {
      await bidsApi.lockBid(bidId);
      toast.success("Commercial agreement locked!");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Lock failed");
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      LEAD_CREATED: "badge-yellow",
      CREDENTIALS_CREATED: "badge-blue",
      DOCS_SUBMITTED: "badge-purple",
      ACTION_REQUIRED: "badge-red",
      ACTIVE: "badge-green",
      pending: "badge-yellow",
      verified: "badge-green",
      rejected: "badge-red",
    };
    return (
      <span className={`badge ${colors[status] || "badge-gray"}`}>
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  const isEpc = user?.role === "epc";
  const isNbfc = user?.role === "nbfc";

  // Verification Logic
  const requiredDocTypes = DOCUMENT_TYPES.filter((d) => d.required).map(
    (d) => d.key,
  );
  const verifiedDocs =
    profile?.documents?.filter((d: any) => d.status === "verified") || [];
  const verifiedDocTypes = verifiedDocs.map((d: any) => d.documentType);
  const areDocsVerified = requiredDocTypes.every((dt) =>
    verifiedDocTypes.includes(dt),
  );
  const pendingVerification =
    profile?.company?.status === "DOCS_SUBMITTED" && !areDocsVerified;

  // Stats
  const activeBids = myBids.filter((b) =>
    ["SUBMITTED", "NEGOTIATION_IN_PROGRESS"].includes(b.status),
  );
  const uploadedDocsCount = profile?.documents?.length || 0;
  const verifiedDocsCount = verifiedDocs.length;
  const pendingCasesCount = cases.filter(
    (c: any) => c.status === "PENDING_EPC_APPROVAL",
  ).length;

  if (loading)
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        Loading dashboard...
      </div>
    );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="dashboard-page"
      style={{ minHeight: "100vh", padding: "2rem" }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div className="dashboard-header">
          <h1>{profile?.company?.companyName || "Partner Dashboard"}</h1>
          <div className="subtitle">
            {isEpc ? "EPC" : "NBFC"} Portal{" "}
            {profile?.company?.status && statusBadge(profile.company.status)}
          </div>
        </div>

        {/* Stats Cards */}
        {isEpc && (
          <motion.div
            className="stats-grid"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Stats Components - Simplified for brevity in refactor, keeping structure */}
            <motion.div variants={cardVariant} className="stat-card">
              <div className="stat-icon blue">
                {/* SVG Icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="stat-label">Documents Uploaded</div>
              <div className="stat-value">{uploadedDocsCount}</div>
            </motion.div>

            <motion.div variants={cardVariant} className="stat-card">
              <div className="stat-icon green">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="stat-label">Verified</div>
              <div className="stat-value">{verifiedDocsCount}</div>
            </motion.div>

            <motion.div variants={cardVariant} className="stat-card">
              <div className="stat-icon purple">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="stat-label">Sub-Contractors</div>
              <div className="stat-value">{subContractors.length}</div>
            </motion.div>

            <motion.div variants={cardVariant} className="stat-card">
              <div className="stat-icon orange">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <div className="stat-label">Pending Cases</div>
              <div className="stat-value">{pendingCasesCount}</div>
            </motion.div>
          </motion.div>
        )}

        {/* Pending Verification Notice */}
        {pendingVerification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="alert-banner"
          >
            {/* Alert content */}
            <span className="alert-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <div className="alert-content">
              <h3>Documents Pending Verification</h3>
              <p>
                Your documents are being reviewed by our Ops team. Other
                sections will be unlocked once verification is complete.
              </p>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="tabs-container">
          {isEpc && (
            <button
              onClick={() => setActiveTab("documents")}
              className={`tab ${activeTab === "documents" ? "active" : ""}`}
            >
              Documents
            </button>
          )}
          {isEpc && (
            <button
              onClick={() => areDocsVerified && setActiveTab("subcontractors")}
              disabled={!areDocsVerified}
              className={`tab ${activeTab === "subcontractors" ? "active" : ""}`}
            >
              Sub-Contractors
              {!areDocsVerified && <span className="lock-icon">🔒</span>}
            </button>
          )}
          <button
            onClick={() => (areDocsVerified || isNbfc) && setActiveTab("cases")}
            disabled={isEpc && !areDocsVerified}
            className={`tab ${activeTab === "cases" ? "active" : ""}`}
          >
            Cases & Bills
            {isEpc && !areDocsVerified && <span className="lock-icon">🔒</span>}
          </button>
          <button
            onClick={() => (areDocsVerified || isNbfc) && setActiveTab("bids")}
            disabled={isEpc && !areDocsVerified}
            className={`tab ${activeTab === "bids" ? "active" : ""}`}
          >
            My Bids
            {isEpc && !areDocsVerified && <span className="lock-icon">🔒</span>}
            {activeBids.length > 0 && (
              <span className="tab-badge">{activeBids.length}</span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "documents" && isEpc && (
            <DocumentsSection
              profile={profile}
              uploadingDoc={uploadingDoc}
              onUpload={handleUploadSingleDoc}
            />
          )}

          {activeTab === "subcontractors" && isEpc && areDocsVerified && (
            <SubContractorsSection
              subContractors={subContractors}
              onAddSingle={handleAddSC}
              onBulkUpload={handleExcelUpload}
              onDelete={handleDeleteSubContractor}
            />
          )}

          {activeTab === "cases" && (areDocsVerified || isNbfc) && (
            <CasesAndBillsSection
              cases={cases}
              onReviewCase={handleReviewCase}
              isEpc={isEpc}
            />
          )}

          {activeTab === "bids" && (areDocsVerified || isNbfc) && (
            <BidsSection
              bids={myBids}
              cases={cases}
              isEpc={isEpc}
              onPlaceBid={handlePlaceBid}
              onNegotiate={handleNegotiate}
              onLockBid={handleLockBid}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
