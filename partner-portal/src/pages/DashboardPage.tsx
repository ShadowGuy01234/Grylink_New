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
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Bill Review Modal State
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [billNotes, setBillNotes] = useState("");
  const [billDecisionLoading, setBillDecisionLoading] = useState(false);

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

      // Fetch bills pending EPC review (only for EPC users)
      try {
        const billsRes = await companyApi.getBillsForReview();
        setBills(billsRes.data?.bills || []);
      } catch {
        // ignore if not EPC or endpoint not ready
      }
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

  const handleBillDecision = async (decision: string) => {
    if (!selectedBill) return;
    setBillDecisionLoading(true);
    try {
      await companyApi.verifyBill(selectedBill._id, { decision, notes: billNotes });
      toast.success(`Bill ${decision === "approve" ? "approved" : "rejected"} successfully`);
      setSelectedBill(null);
      setBillNotes("");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update bill");
    } finally {
      setBillDecisionLoading(false);
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
  const pendingBillsCount = bills.length;
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

          {isEpc && areDocsVerified && (
            <button
              onClick={() => setActiveTab("billreview")}
              className={`nav-item ${activeTab === "billreview" ? "active" : ""}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              Invoice Review
              {pendingBillsCount > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {pendingBillsCount}
                </span>
              )}
            </button>
          )}

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
                    : activeTab === "billreview"
                      ? "Invoice Review"
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

          {activeTab === "billreview" && isEpc && areDocsVerified && (
            <motion.div
              key="billreview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Pending Invoice Verifications</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{bills.length} bill{bills.length !== 1 ? "s" : ""} awaiting your approval</p>
                  </div>
                </div>

                {bills.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                    <svg className="w-12 h-12 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium">No pending invoice verifications</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          <th className="px-6 py-3 text-left">Bill #</th>
                          <th className="px-6 py-3 text-left">Sub-Contractor</th>
                          <th className="px-6 py-3 text-left">Amount</th>
                          <th className="px-6 py-3 text-left">Date</th>
                          <th className="px-6 py-3 text-left">Status</th>
                          <th className="px-6 py-3 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bills.map((bill: any) => (
                          <tr key={bill._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-800">{bill.billNumber || "—"}</td>
                            <td className="px-6 py-4 text-slate-600">{bill.subContractorId?.companyName || "—"}</td>
                            <td className="px-6 py-4 font-semibold text-slate-800">
                              {bill.amount ? `₹${Number(bill.amount).toLocaleString()}` : "—"}
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
                              {new Date(bill.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                                Ops Approved
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => { setSelectedBill(bill); setBillNotes(""); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bill Review Modal */}
              {selectedBill && (
                <div
                  className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                  onClick={() => setSelectedBill(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 12 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
                      <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Invoice Review</p>
                        <h3 className="text-lg font-bold text-slate-800">Bill #{selectedBill.billNumber || "N/A"}</h3>
                      </div>
                      <button
                        onClick={() => setSelectedBill(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-xl"
                      >
                        ×
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 space-y-5">
                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Sub-Contractor</p>
                          <p className="font-semibold text-slate-800">{selectedBill.subContractorId?.companyName || "—"}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Invoice Amount</p>
                          <p className="text-xl font-bold text-emerald-700">
                            {selectedBill.amount ? `₹${Number(selectedBill.amount).toLocaleString()}` : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Documents */}
                      {selectedBill.fileUrl && (
                        <div>
                          <p className="text-sm font-semibold text-slate-600 mb-2">Attached Documents</p>
                          <a
                            href={selectedBill.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors group"
                          >
                            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-indigo-700">Bill Document</span>
                            <span className="ml-auto text-xs text-indigo-400 group-hover:text-indigo-600">Open →</span>
                          </a>
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                          Verification Notes <span className="font-normal text-slate-400">(optional)</span>
                        </label>
                        <textarea
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-none"
                          rows={3}
                          placeholder="Add notes about this verification..."
                          value={billNotes}
                          onChange={(e) => setBillNotes(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedBill(null)}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleBillDecision("reject")}
                          disabled={billDecisionLoading}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Reject
                        </button>
                        <button
                          onClick={() => handleBillDecision("approve")}
                          disabled={billDecisionLoading}
                          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {billDecisionLoading ? "Processing..." : "Approve"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
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
