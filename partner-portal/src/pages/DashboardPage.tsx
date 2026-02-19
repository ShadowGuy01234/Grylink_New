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
  const { user, logout } = useAuth();

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
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            G
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-600">
              Gryork
            </h1>
            <p className="text-xs text-slate-400 font-medium">Partner Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">
            Menu
          </p>

          {isEpc && (
            <button
              onClick={() => setActiveTab("documents")}
              className={`nav-item ${activeTab === "documents" ? "active" : ""}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              Documents
              {uploadedDocsCount > 0 && !areDocsVerified && (
                <span className="ml-auto w-2 h-2 rounded-full bg-amber-400"></span>
              )}
            </button>
          )}

          {isEpc && (
            <button
              onClick={() => areDocsVerified && setActiveTab("subcontractors")}
              disabled={!areDocsVerified}
              className={`nav-item ${activeTab === "subcontractors" ? "active" : ""}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
              Sub-Contractors
              {!areDocsVerified && <span className="nav-lock-icon">🔒</span>}
            </button>
          )}

          <button
            onClick={() => (areDocsVerified || isNbfc) && setActiveTab("cases")}
            disabled={isEpc && !areDocsVerified}
            className={`nav-item ${activeTab === "cases" ? "active" : ""}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
            Cases & Bills
            {isEpc && !areDocsVerified && (
              <span className="nav-lock-icon">🔒</span>
            )}
          </button>

          <button
            onClick={() => (areDocsVerified || isNbfc) && setActiveTab("bids")}
            disabled={isEpc && !areDocsVerified}
            className={`nav-item ${activeTab === "bids" ? "active" : ""}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            My Bids
            {isEpc && !areDocsVerified && (
              <span className="nav-lock-icon">🔒</span>
            )}
            {activeBids.length > 0 && (
              <span className="ml-auto bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {activeBids.length}
              </span>
            )}
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
              {profile?.company?.companyName?.[0] || "U"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-slate-700 truncate">
                {profile?.company?.companyName || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content-area">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === "documents"
                ? "Company Documents"
                : activeTab === "subcontractors"
                  ? "Sub-Contractors"
                  : activeTab === "cases"
                    ? "Cases & Bills"
                    : "My Bids"}
            </h2>
            <p className="text-slate-500">Manage your partnership details</p>
          </div>
          {profile?.company?.status && (
            <div
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
                profile.company.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-amber-50 text-amber-600 border-amber-200"
              }`}
            >
              {profile.company.status.replace(/_/g, " ")}
            </div>
          )}
        </header>

        {isEpc && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={cardVariant} className="stat-card-premium">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">
                    Documents
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800">
                    {uploadedDocsCount}
                  </h3>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div variants={cardVariant} className="stat-card-premium">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">
                    Verified
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800">
                    {verifiedDocsCount}
                  </h3>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div variants={cardVariant} className="stat-card-premium">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">
                    Sub-Contractors
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800">
                    {subContractors.length}
                  </h3>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div variants={cardVariant} className="stat-card-premium">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">
                    Pending Cases
                  </p>
                  <h3 className="text-3xl font-bold text-slate-800">
                    {pendingCasesCount}
                  </h3>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Locked Content Warning */}
        {pendingVerification && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start gap-4 shadow-sm"
          >
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-amber-800">
                Action Required: Verify Documents
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                Please upload and verify all required company documents to
                unlock Sub-Contractor Management, Cases, and Bidding features.
                Your profile is currently under limited access.
              </p>
            </div>
          </motion.div>
        )}

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
      </main>
    </div>
  );
};

export default DashboardPage;
