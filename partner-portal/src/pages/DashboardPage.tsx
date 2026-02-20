import { useState, useEffect } from "react";
import { companyApi, casesApi, bidsApi, cwcrfApi } from "../api";
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

  // CWCRF Verification State
  const [pendingCwcrfs, setPendingCwcrfs] = useState<any[]>([]);
  const [selectedCwcrf, setSelectedCwcrf] = useState<any | null>(null);
  const [cwcrfActionMode, setCwcrfActionMode] = useState<"approve" | "reject" | null>(null);
  const [cwcrfVerifyForm, setCwcrfVerifyForm] = useState({
    approvedAmount: 0,
    repaymentTimeline: 30 as 30 | 45 | 60 | 90,
    repaymentArrangement: { source: "PAYMENT_FROM_RA_BILL", remarks: "", otherDetails: "" },
    rejectionReason: "",
    notes: "",
    buyerDeclarationAccepted: false,
  });
  const [cwcrfDecisionLoading, setCwcrfDecisionLoading] = useState(false);
  const [cwcrfReviewStep, setCwcrfReviewStep] = useState(1); // 1=SC Docs 2=Risk Report 3=Declaration 4=Bid Terms

  // UI State
  const [activeTab, setActiveTab] = useState("overview");
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

      // Fetch CWCRFs pending buyer verification (only for EPC users)
      try {
        const cwcrfsRes = await cwcrfApi.getPendingVerifications();
        setPendingCwcrfs(cwcrfsRes.data?.cwcrfs || cwcrfsRes.data || []);
      } catch {
        // ignore if not EPC
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

  const handleCwcrfApprove = async () => {
    if (!selectedCwcrf) return;
    setCwcrfDecisionLoading(true);
    try {
      await cwcrfApi.verifyCwcrf(selectedCwcrf._id, {
        approvedAmount: cwcrfVerifyForm.approvedAmount,
        repaymentTimeline: cwcrfVerifyForm.repaymentTimeline,
        repaymentArrangement: cwcrfVerifyForm.repaymentArrangement,
        notes: cwcrfVerifyForm.notes,
        buyerDeclaration: { accepted: cwcrfVerifyForm.buyerDeclarationAccepted },
      });
      toast.success("CWCRF approved successfully");
      setSelectedCwcrf(null);
      setCwcrfActionMode(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to approve CWCRF");
    } finally {
      setCwcrfDecisionLoading(false);
    }
  };

  const handleCwcrfReject = async () => {
    if (!selectedCwcrf || !cwcrfVerifyForm.rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setCwcrfDecisionLoading(true);
    try {
      await cwcrfApi.rejectCwcrf(selectedCwcrf._id, { reason: cwcrfVerifyForm.rejectionReason });
      toast.success("CWCRF rejected");
      setSelectedCwcrf(null);
      setCwcrfActionMode(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to reject CWCRF");
    } finally {
      setCwcrfDecisionLoading(false);
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
  const pendingCwcrfsCount = pendingCwcrfs.length;
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

          <button
            onClick={() => setActiveTab("overview")}
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Overview
          </button>

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

          {isEpc && areDocsVerified && (
            <button
              onClick={() => setActiveTab("cwcrfverify")}
              className={`nav-item ${activeTab === "cwcrfverify" ? "active" : ""}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              CWC Requests
              {pendingCwcrfsCount > 0 && (
                <span className="ml-auto bg-violet-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {pendingCwcrfsCount}
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
              {({
                overview: "Overview",
                documents: "Company Documents",
                subcontractors: "Sub-Contractors",
                cases: "Cases & Bills",
                billreview: "Invoice Review",
                cwcrfverify: "CWC Request Forms",
                bids: "My Bids",
              } as Record<string, string>)[activeTab] ?? "Dashboard"}
            </h2>
            <p className="text-slate-500">
              {({
                overview: "Your EPC partnership at a glance",
                documents: "Upload and manage company documents",
                subcontractors: "Manage your registered sub-contractors",
                cases: "Active cases and bills",
                billreview: "Review and approve invoices from sub-contractors",
                cwcrfverify: "Review and respond to CWC Request Forms",
                bids: "Track and manage your bid commitments",
              } as Record<string, string>)[activeTab] ?? "Manage your partnership details"}
            </p>
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
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* Onboarding Progress */}
              {isEpc && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">Onboarding Progress</h3>
                  <div className="flex items-center gap-0 mb-4">
                    {[
                      { label: "Documents", done: uploadedDocsCount > 0 },
                      { label: "Verified", done: areDocsVerified },
                      { label: "SCs Added", done: subContractors.length > 0 },
                      { label: "Cases Active", done: cases.length > 0 },
                    ].map((step, i, arr) => (
                      <div key={step.label} className="flex items-center">
                        <div className={`flex flex-col items-center`}>
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                            step.done ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-300 text-gray-400"
                          }`}>
                            {step.done ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            ) : i + 1}
                          </div>
                          <span className={`text-xs mt-1.5 font-medium ${
                            step.done ? "text-emerald-600" : "text-gray-400"
                          }`}>{step.label}</span>
                        </div>
                        {i < arr.length - 1 && (
                          <div className={`h-0.5 w-16 mb-5 mx-1 ${
                            step.done ? "bg-emerald-400" : "bg-gray-200"
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">Quick Actions</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: isEpc ? "Upload Documents" : "Manage Documents", desc: `${uploadedDocsCount} uploaded${areDocsVerified ? " (verified)" : ""}`, tab: "documents", color: "indigo", show: isEpc },
                    { label: "Sub-Contractors", desc: `${subContractors.length} registered`, tab: "subcontractors", color: "blue", show: isEpc && areDocsVerified },
                    { label: "Cases & Bills", desc: `${cases.length} active cases`, tab: "cases", color: "emerald", show: true },
                    { label: "Invoice Review", desc: `${pendingBillsCount} pending`, tab: "billreview", color: "amber", show: isEpc && areDocsVerified && pendingBillsCount > 0 },
                    { label: "CWC Requests", desc: `${pendingCwcrfsCount} to review`, tab: "cwcrfverify", color: "violet", show: isEpc && areDocsVerified && pendingCwcrfsCount > 0 },
                    { label: "My Bids", desc: `${myBids.length} submitted bids`, tab: "bids", color: "sky", show: true },
                  ].filter((a) => a.show).map((action) => {
                    const colorMap: Record<string, string> = {
                      indigo: "bg-indigo-50 text-indigo-600",
                      blue: "bg-blue-50 text-blue-600",
                      emerald: "bg-emerald-50 text-emerald-600",
                      amber: "bg-amber-50 text-amber-600",
                      violet: "bg-violet-50 text-violet-600",
                      sky: "bg-sky-50 text-sky-600",
                    };
                    return (
                      <button
                        key={action.label}
                        onClick={() => setActiveTab(action.tab)}
                        className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div className={`${colorMap[action.color]} p-2.5 rounded-lg shrink-0`}>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{action.label}</p>
                          <p className="text-xs text-gray-500">{action.desc}</p>
                        </div>
                        <svg className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

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

          {/* ===== CWC REQUEST FORM VERIFICATION TAB ===== */}
          {activeTab === "cwcrfverify" && isEpc && areDocsVerified && (
            <motion.div
              key="cwcrfverify"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Pending CWC Request Forms</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {pendingCwcrfs.length} request{pendingCwcrfs.length !== 1 ? "s" : ""} awaiting your verification
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full border border-violet-200">
                    Buyer Verification Required
                  </div>
                </div>

                {pendingCwcrfs.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                    <svg className="w-12 h-12 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium">No pending CWC request forms</p>
                    <p className="text-xs text-slate-400">All requests have been processed</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          <th className="px-6 py-3 text-left">CWCRF #</th>
                          <th className="px-6 py-3 text-left">Seller</th>
                          <th className="px-6 py-3 text-left">Invoice Amt</th>
                          <th className="px-6 py-3 text-left">Requested Amt</th>
                          <th className="px-6 py-3 text-left">Tenure</th>
                          <th className="px-6 py-3 text-left">Submitted</th>
                          <th className="px-6 py-3 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingCwcrfs.map((cwcrf: any) => (
                          <tr key={cwcrf._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-violet-700 text-sm">
                              {cwcrf.cwcRfNumber || cwcrf._id?.slice(-8).toUpperCase()}
                            </td>
                            <td className="px-6 py-4 text-slate-700">
                              {cwcrf.subContractorId?.companyName || cwcrf.subContractorId?.name || "—"}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-800">
                              {cwcrf.invoiceDetails?.invoiceAmount
                                ? `₹${Number(cwcrf.invoiceDetails.invoiceAmount).toLocaleString()}`
                                : "—"}
                            </td>
                            <td className="px-6 py-4 font-semibold text-emerald-700">
                              {cwcrf.cwcRequest?.requestedAmount
                                ? `₹${Number(cwcrf.cwcRequest.requestedAmount).toLocaleString()}`
                                : "—"}
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-sm">
                              {cwcrf.cwcRequest?.requestedTenure ? `${cwcrf.cwcRequest.requestedTenure} days` : "—"}
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
                              {new Date(cwcrf.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric"
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  setSelectedCwcrf(cwcrf);
                                  setCwcrfActionMode(null);
                                  setCwcrfReviewStep(1);
                                  setCwcrfVerifyForm({
                                    approvedAmount: cwcrf.cwcRequest?.requestedAmount || 0,
                                    repaymentTimeline: 30,
                                    repaymentArrangement: { source: "PAYMENT_FROM_RA_BILL", remarks: "", otherDetails: "" },
                                    rejectionReason: "",
                                    notes: "",
                                    buyerDeclarationAccepted: false,
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

              {/* CWCRF Review Modal */}
              {selectedCwcrf && (
                <div
                  className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                  onClick={() => { setSelectedCwcrf(null); setCwcrfActionMode(null); }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 12 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white sticky top-0 z-10">
                      <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide">CWC Request Form Review</p>
                        <h3 className="text-lg font-bold text-slate-800">
                          {selectedCwcrf.cwcRfNumber || `#${selectedCwcrf._id?.slice(-8).toUpperCase()}`}
                        </h3>
                      </div>
                      <button
                        onClick={() => { setSelectedCwcrf(null); setCwcrfActionMode(null); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-xl"
                      >×</button>
                    </div>

                    {/* Step Indicator */}
                    <div className="px-6 pt-5 pb-2 border-b border-slate-100">
                      <div className="flex items-center">
                        {["SC Documents", "Risk Report", "Declaration", "Bid Terms"].map((label, idx) => (
                          <div key={idx} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${cwcrfReviewStep > idx + 1 ? "bg-emerald-500 text-white" : cwcrfReviewStep === idx + 1 ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "bg-slate-100 text-slate-400"}`}>
                                {cwcrfReviewStep > idx + 1 ? "✓" : idx + 1}
                              </div>
                              <span className={`text-xs mt-1 whitespace-nowrap ${cwcrfReviewStep === idx + 1 ? "text-violet-600 font-semibold" : "text-slate-400"}`}>{label}</span>
                            </div>
                            {idx < 3 && <div className={`h-0.5 flex-1 mx-1 mb-4 transition-colors ${cwcrfReviewStep > idx + 1 ? "bg-emerald-400" : "bg-slate-200"}`} />}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 space-y-4">

                      {/* ── STEP 1: SC Documents ── */}
                      {cwcrfReviewStep === 1 && (
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 1 — Sub-Contractor Documents & Profile</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-xs text-slate-400 mb-0.5">Company Name</p>
                              <p className="font-semibold text-slate-800 text-sm">{selectedCwcrf.subContractorId?.companyName || "—"}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-xs text-slate-400 mb-0.5">Email</p>
                              <p className="font-semibold text-slate-800 text-sm">{selectedCwcrf.subContractorId?.email || "—"}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-xs text-slate-400 mb-0.5">GSTIN</p>
                              <p className="font-semibold text-slate-800 text-sm">{selectedCwcrf.subContractorId?.gstin || selectedCwcrf.subContractorId?.kycData?.gstin || "—"}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-xs text-slate-400 mb-0.5">PAN</p>
                              <p className="font-semibold text-slate-800 text-sm">{selectedCwcrf.subContractorId?.pan || selectedCwcrf.subContractorId?.kycData?.pan || "—"}</p>
                            </div>
                          </div>
                          {/* KYC & Bank Status Badges */}
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: "KYC Verified", ok: selectedCwcrf.subContractorId?.kycStatus === "VERIFIED" },
                              { label: "Bank Verified", ok: selectedCwcrf.subContractorId?.bankDetailsVerified === true },
                              { label: "Declaration Accepted", ok: selectedCwcrf.subContractorId?.declarationStatus === "ACCEPTED" },
                            ].map((item) => (
                              <span key={item.label} className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-semibold ${item.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                                {item.ok ? "✓" : "✗"} {item.label}
                              </span>
                            ))}
                          </div>
                          {/* Supporting docs */}
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Supporting Documents (from CWCRF)</p>
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                { label: "RA Bill", url: selectedCwcrf.documents?.raBill },
                                { label: "WCC", url: selectedCwcrf.documents?.wcc },
                                { label: "Meas. Sheet", url: selectedCwcrf.documents?.measurementSheet },
                              ].map((doc) => (
                                <div key={doc.label} className={`rounded-xl p-3 text-center ${doc.url ? "bg-blue-50 border border-blue-200" : "bg-slate-50 border border-slate-200"}`}>
                                  <p className="text-xs text-slate-500 mb-1">{doc.label}</p>
                                  {doc.url ? (
                                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:underline">View →</a>
                                  ) : (
                                    <p className="text-xs text-slate-400">Not uploaded</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Invoice summary */}
                          <div className="bg-blue-50 rounded-xl p-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice Summary</p>
                            <div className="grid grid-cols-3 gap-3">
                              <div><p className="text-xs text-slate-400">Invoice #</p><p className="font-semibold text-slate-800 text-sm">{selectedCwcrf.invoiceDetails?.invoiceNumber || "—"}</p></div>
                              <div><p className="text-xs text-slate-400">Amount</p><p className="font-bold text-emerald-700">₹{Number(selectedCwcrf.invoiceDetails?.invoiceAmount || 0).toLocaleString()}</p></div>
                              <div><p className="text-xs text-slate-400">Tenure Req.</p><p className="font-semibold text-slate-800 text-sm">{selectedCwcrf.cwcRequest?.requestedTenure} days</p></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── STEP 2: RMT Risk Report ── */}
                      {cwcrfReviewStep === 2 && (
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 2 — RMT Risk Assessment Report</p>
                          {selectedCwcrf.rmtAssessment || selectedCwcrf.cwcafData ? (
                            <>
                              {/* Risk Category Banner */}
                              {(() => {
                                const risk = selectedCwcrf.cwcafData?.riskCategory || selectedCwcrf.rmtAssessment?.riskCategory || "—";
                                const colorMap: Record<string, string> = { LOW: "bg-emerald-50 border-emerald-200 text-emerald-800", MEDIUM: "bg-amber-50 border-amber-200 text-amber-800", HIGH: "bg-red-50 border-red-300 text-red-800" };
                                return (
                                  <div className={`rounded-xl p-4 border-2 ${colorMap[risk] || "bg-slate-50 border-slate-200 text-slate-700"}`}>
                                    <p className="text-xs font-bold uppercase tracking-wider mb-1">Risk Category</p>
                                    <p className="text-2xl font-black">{risk}</p>
                                  </div>
                                );
                              })()}
                              {/* Recommendation */}
                              {(selectedCwcrf.cwcafData?.rmtRecommendation || selectedCwcrf.rmtAssessment?.recommendation) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">RMT Recommendation</p>
                                  <p className="font-semibold text-slate-800">{selectedCwcrf.cwcafData?.rmtRecommendation || selectedCwcrf.rmtAssessment?.recommendation}</p>
                                  {(selectedCwcrf.cwcafData?.rmtNotes || selectedCwcrf.rmtAssessment?.notes) && (
                                    <p className="text-sm text-slate-600 mt-2">{selectedCwcrf.cwcafData?.rmtNotes || selectedCwcrf.rmtAssessment?.notes}</p>
                                  )}
                                </div>
                              )}
                              {/* Risk Assessment Details (4-point checklist) */}
                              {selectedCwcrf.cwcafData?.riskAssessmentDetails && (
                                <div>
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assessment Breakdown</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(selectedCwcrf.cwcafData.riskAssessmentDetails).map(([key, val]: [string, any]) => (
                                      <div key={key} className="bg-slate-50 rounded-xl p-3">
                                        <p className="text-xs text-slate-400 mb-1 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                                        <p className="font-bold text-lg text-slate-800">{val?.score ?? "—"}<span className="text-xs font-normal text-slate-400">/10</span></p>
                                        {val?.remarks && <p className="text-xs text-slate-500 mt-1">{val.remarks}</p>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* Seller Profile Summary */}
                              {selectedCwcrf.cwcafData?.sellerProfileSummary && (
                                <div className="bg-slate-50 rounded-xl p-4">
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Seller Profile Summary</p>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    {[
                                      { label: "Business Age", value: `${selectedCwcrf.cwcafData.sellerProfileSummary.businessAge} yrs` },
                                      { label: "Total Transactions", value: selectedCwcrf.cwcafData.sellerProfileSummary.totalTransactions },
                                      { label: "Avg. Invoice Value", value: `₹${Number(selectedCwcrf.cwcafData.sellerProfileSummary.averageInvoiceValue || 0).toLocaleString()}` },
                                      { label: "Repayment History", value: selectedCwcrf.cwcafData.sellerProfileSummary.repaymentHistory },
                                    ].map((item) => (
                                      <div key={item.label}><p className="text-xs text-slate-400">{item.label}</p><p className="font-semibold text-slate-800">{item.value || "—"}</p></div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center py-10 text-slate-400">
                              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              </div>
                              <p className="text-sm font-medium text-slate-600">RMT assessment not yet available</p>
                              <p className="text-xs text-slate-400 mt-1">This CWCRF may still be awaiting RMT review. You can proceed to review the declaration and bid terms.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── STEP 3: Buyer Declaration ── */}
                      {cwcrfReviewStep === 3 && (
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 3 — Buyer Declaration</p>
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
                            <p className="text-sm font-bold text-amber-900">Before confirming your bid terms, you must read and accept the following declaration:</p>
                            <ul className="space-y-2 text-sm text-amber-800">
                              {[
                                "The sub-contractor named in this CWCRF is a registered and active vendor on our rolls.",
                                "The invoice referenced is genuine and represents actual work executed and accepted.",
                                "The work described has been completed or is in progress as per the contract terms.",
                                "I authorise the disbursement of the approved amount to this vendor through the GryLink CWC facility.",
                                "I understand that the EPC company (buyer) is responsible for repayment on the agreed timeline.",
                                "All information I am about to enter as bid terms is accurate to the best of my knowledge.",
                              ].map((text, i) => (
                                <li key={i} className="flex items-start gap-2"><span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>{text}</li>
                              ))}
                            </ul>
                          </div>
                          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${cwcrfVerifyForm.buyerDeclarationAccepted ? "bg-emerald-50 border-emerald-400" : "bg-white border-slate-200 hover:border-violet-300"}`}>
                            <input
                              type="checkbox"
                              checked={cwcrfVerifyForm.buyerDeclarationAccepted}
                              onChange={(e) => setCwcrfVerifyForm(prev => ({ ...prev, buyerDeclarationAccepted: e.target.checked }))}
                              className="mt-0.5 w-5 h-5 accent-emerald-600 cursor-pointer flex-shrink-0"
                            />
                            <span className={`text-sm font-semibold leading-relaxed ${cwcrfVerifyForm.buyerDeclarationAccepted ? "text-emerald-800" : "text-slate-700"}`}>
                              I have read and accept all the above terms and declare that the information in this CWCRF is accurate.
                            </span>
                          </label>
                          {!cwcrfVerifyForm.buyerDeclarationAccepted && (
                            <p className="text-xs text-amber-600 text-center">⚠ You must accept the declaration to proceed to bid terms</p>
                          )}
                        </div>
                      )}

                      {/* ── STEP 4: Bid Terms ── */}
                      {cwcrfReviewStep === 4 && (
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 4 — Enter Bid Terms</p>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Approved CWC Amount (₹) <span className="text-red-500">*</span></label>
                              <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                value={cwcrfVerifyForm.approvedAmount || ""}
                                max={selectedCwcrf.cwcRequest?.requestedAmount}
                                onChange={(e) => setCwcrfVerifyForm(prev => ({ ...prev, approvedAmount: Number(e.target.value) }))}
                                placeholder="Enter approved amount" />
                              <p className="text-xs text-slate-400 mt-1">Requested: ₹{Number(selectedCwcrf.cwcRequest?.requestedAmount || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Repayment Timeline <span className="text-red-500">*</span></label>
                              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                                value={cwcrfVerifyForm.repaymentTimeline}
                                onChange={(e) => setCwcrfVerifyForm(prev => ({ ...prev, repaymentTimeline: Number(e.target.value) as 30 | 45 | 60 | 90 }))}>
                                <option value={30}>30 days</option><option value={45}>45 days</option><option value={60}>60 days</option><option value={90}>90 days</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Repayment Source <span className="text-red-500">*</span></label>
                              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
                                value={cwcrfVerifyForm.repaymentArrangement.source}
                                onChange={(e) => setCwcrfVerifyForm(prev => ({ ...prev, repaymentArrangement: { ...prev.repaymentArrangement, source: e.target.value } }))}>
                                <option value="PAYMENT_FROM_RA_BILL">Payment from RA Bill</option>
                                <option value="PAYMENT_FROM_CLIENT_RELEASE">Payment from Client Release</option>
                                <option value="PAYMENT_FROM_INTERNAL_TREASURY">Payment from Internal Treasury</option>
                                <option value="PAYMENT_FROM_RETENTION_RELEASE">Payment from Retention Release</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>
                            {cwcrfVerifyForm.repaymentArrangement.source === "OTHER" && (
                              <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Other Details</label>
                                <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                  value={cwcrfVerifyForm.repaymentArrangement.otherDetails}
                                  onChange={(e) => setCwcrfVerifyForm(prev => ({ ...prev, repaymentArrangement: { ...prev.repaymentArrangement, otherDetails: e.target.value } }))}
                                  placeholder="Describe the repayment arrangement" />
                              </div>
                            )}
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Remarks (optional)</label>
                              <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none" rows={2}
                                value={cwcrfVerifyForm.repaymentArrangement.remarks}
                                onChange={(e) => setCwcrfVerifyForm(prev => ({ ...prev, repaymentArrangement: { ...prev.repaymentArrangement, remarks: e.target.value } }))}
                                placeholder="Any additional notes..." />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Internal Notes (optional)</label>
                              <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none" rows={2}
                                value={cwcrfVerifyForm.notes}
                                onChange={(e) => setCwcrfVerifyForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Internal notes for Ops / RMT..." />
                            </div>
                          </div>

                          {/* Reject reason (visible only when reject mode shown) */}
                          {cwcrfActionMode === "reject" && (
                            <div className="border-2 border-red-200 rounded-xl p-4 bg-red-50/30 space-y-3">
                              <p className="text-sm font-bold text-red-800">Rejection Reason <span className="text-red-500">*</span></p>
                              <textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" rows={3}
                                value={cwcrfVerifyForm.rejectionReason}
                                onChange={(e) => setCwcrfVerifyForm(prev => ({ ...prev, rejectionReason: e.target.value }))}
                                placeholder="Explain why this CWCRF is being rejected..." />
                            </div>
                          )}

                          <div className="flex gap-3 pt-1">
                            {cwcrfActionMode !== "reject" ? (
                              <>
                                <button onClick={() => setCwcrfActionMode("reject")}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-red-300 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors">
                                  ✗ Reject
                                </button>
                                <button onClick={handleCwcrfApprove}
                                  disabled={cwcrfDecisionLoading || !cwcrfVerifyForm.approvedAmount || !cwcrfVerifyForm.buyerDeclarationAccepted}
                                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                                  {cwcrfDecisionLoading ? "Processing..." : "✓ Confirm Approval"}
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => setCwcrfActionMode(null)}
                                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button onClick={handleCwcrfReject}
                                  disabled={cwcrfDecisionLoading || !cwcrfVerifyForm.rejectionReason.trim()}
                                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors">
                                  {cwcrfDecisionLoading ? "Processing..." : "Confirm Rejection"}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step Navigation Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center">
                      <button
                        onClick={() => { if (cwcrfReviewStep > 1) { setCwcrfReviewStep(prev => prev - 1); setCwcrfActionMode(null); } else { setSelectedCwcrf(null); setCwcrfActionMode(null); } }}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >{cwcrfReviewStep === 1 ? "Close" : "← Back"}</button>
                      <span className="text-xs text-slate-400">Step {cwcrfReviewStep} of 4</span>
                      {cwcrfReviewStep < 4 && (
                        <button
                          onClick={() => setCwcrfReviewStep(prev => prev + 1)}
                          disabled={cwcrfReviewStep === 3 && !cwcrfVerifyForm.buyerDeclarationAccepted}
                          className="px-5 py-2 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >Next →</button>
                      )}
                      {cwcrfReviewStep === 4 && <div />}
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardPage;
