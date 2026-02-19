import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { scApi } from "@/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User, FileText, Send, FolderOpen, Gavel, Upload, Building2, Phone,
  Hash, ChevronRight, CheckCircle2, Clock, AlertCircle, XCircle,
  TrendingUp, LayoutDashboard, MapPin, CreditCard, IndianRupee,
  ArrowUpRight, CalendarDays, ClipboardList, FilePlus2, FolderUp, Paperclip,
} from "lucide-react";

const DashboardPage = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    companyName: "",
    ownerName: "",
    phone: "",
    vendorId: "",
    gstin: "",
    address: "",
  });

  // Bill upload
  const [billFiles, setBillFiles] = useState<File[]>([]);
  const [uploadingBill, setUploadingBill] = useState(false);
  const [billData, setBillData] = useState({
    billNumber: "",
    amount: "",
    description: "",
  });

  // Declaration dialog
  const [showDeclarationDialog, setShowDeclarationDialog] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [pendingBillForm, setPendingBillForm] = useState<FormData | null>(null);

  // Additional Documents
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [additionalDocFile, setAdditionalDocFile] = useState<File | null>(null);

  // Bids
  const [respondingBid, setRespondingBid] = useState<string | null>(null);
  const [counterOffer, setCounterOffer] = useState({
    amount: "",
    duration: "",
    message: "",
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await scApi.getDashboard();
      setDashboard(res.data);
      const sc = res.data?.subContractor;
      if (sc) {
        setProfileForm({
          companyName: sc.companyName || "",
          ownerName: sc.ownerName || "",
          phone: sc.phone || "",
          vendorId: sc.vendorId || "",
          gstin: sc.gstin || "",
          address: sc.address || "",
        });
      }
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await scApi.updateProfile(profileForm);
      toast.success("Profile saved!");
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleBillFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billFiles[0]) {
      toast.error("Please select a bill file");
      return;
    }
    if (!billData.billNumber || !billData.amount) {
      toast.error("Please fill in Bill Number and Amount");
      return;
    }
    const formData = new FormData();
    formData.append("bill", billFiles[0]);
    formData.append("billNumber", billData.billNumber);
    formData.append("amount", billData.amount);
    if (billData.description) formData.append("description", billData.description);
    setPendingBillForm(formData);
    setDeclarationAccepted(false);
    setShowDeclarationDialog(true);
  };

  const handleUploadAdditionalDoc = async (docId: string) => {
    if (!additionalDocFile) { toast.error("Please select a file"); return; }
    setUploadingDocId(docId);
    try {
      const formData = new FormData();
      formData.append("document", additionalDocFile);
      await scApi.uploadAdditionalDocument(docId, formData);
      toast.success("Document uploaded successfully!");
      setAdditionalDocFile(null);
      setUploadingDocId(null);
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleConfirmBillSubmit = async () => {
    if (!pendingBillForm || !declarationAccepted) return;
    setUploadingBill(true);
    setShowDeclarationDialog(false);
    try {
      await scApi.submitBillWithCwcrf(pendingBillForm);
      toast.success("Bill & CWC RF submitted for verification!");
      setBillFiles([]);
      setBillData({ billNumber: "", amount: "", description: "" });
      setPendingBillForm(null);
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Submission failed");
    } finally {
      setUploadingBill(false);
    }
  };

  const handleBidResponse = async (
    bidId: string,
    action: "accept" | "reject" | "negotiate",
  ) => {
    try {
      if (action === "accept") {
        await scApi.respondToBid(bidId, { decision: "accept" });
        toast.success("Bid accepted!");
      } else if (action === "reject") {
        await scApi.respondToBid(bidId, { decision: "reject" });
        toast.success("Bid rejected");
      } else if (action === "negotiate") {
        await scApi.respondToBid(bidId, {
          decision: "negotiate",
          counterOffer: Number(counterOffer.amount),
          counterDuration: Number(counterOffer.duration),
          message: counterOffer.message,
        });
        toast.success("Counter-offer sent!");
        setCounterOffer({ amount: "", duration: "", message: "" });
      }
      setRespondingBid(null);
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Action failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const sc = dashboard?.subContractor;
  const verifiedBills = dashboard?.bills?.filter((b: any) => b.status === "VERIFIED") || [];
  const pendingBids = dashboard?.bids?.filter(
    (b: any) => b.status === "SUBMITTED" || b.status === "NEGOTIATION_IN_PROGRESS"
  ) || [];
  const profileFields = ["companyName", "ownerName", "phone", "address"];
  const filledFields = profileFields.filter((f) => sc?.[f]).length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

  const stats = [
    { label: "Total Bills", value: dashboard?.bills?.length || 0, icon: FileText, color: "blue", sub: "submitted" },
    { label: "Verified Bills", value: verifiedBills.length, icon: CheckCircle2, color: "emerald", sub: "approved" },
    { label: "Active Cases", value: dashboard?.cases?.length || 0, icon: FolderOpen, color: "violet", sub: "in progress" },
    { label: "Pending Bids", value: pendingBids.length, icon: Gavel, color: "amber", sub: "awaiting action" },
  ];

  const colorMap: Record<string, { bg: string; text: string; light: string }> = {
    blue:    { bg: "bg-blue-600",    text: "text-blue-600",    light: "bg-blue-50" },
    emerald: { bg: "bg-emerald-600", text: "text-emerald-600", light: "bg-emerald-50" },
    violet:  { bg: "bg-violet-600",  text: "text-violet-600",  light: "bg-violet-50" },
    amber:   { bg: "bg-amber-500",   text: "text-amber-600",   light: "bg-amber-50" },
    teal:    { bg: "bg-teal-600",    text: "text-teal-600",    light: "bg-teal-50" },
  };

  const tabs = [
    { id: "overview",       label: "Overview",      icon: LayoutDashboard },
    { id: "profile",        label: "Profile",       icon: User },
    { id: "bills",          label: "CWC RF",        icon: FileText },
    { id: "cwcaf",          label: "CWC AF",        icon: ClipboardList },
    { id: "additional-docs",label: "Extra Docs",    icon: FolderUp,
      badge: (() => { const n = sc?.additionalDocuments?.filter((d: any) => d.status === "REQUESTED").length; return n > 0 ? n : undefined; })() },
    { id: "cases",          label: "Cases",         icon: FolderOpen },
    { id: "bids",           label: "Bids",          icon: Gavel, badge: pendingBids.length > 0 ? pendingBids.length : undefined },
  ];

  const statusConfig: Record<string, { variant: "success" | "warning" | "destructive" | "secondary"; label: string }> = {
    LEAD_CREATED:             { variant: "secondary",   label: "Lead Created" },
    PROFILE_INCOMPLETE:       { variant: "warning",     label: "Profile Incomplete" },
    PROFILE_COMPLETED:        { variant: "success",     label: "Profile Completed" },
    UPLOADED:                 { variant: "warning",     label: "Uploaded" },
    VERIFIED:                 { variant: "success",     label: "Verified" },
    REJECTED:                 { variant: "destructive", label: "Rejected" },
    SUBMITTED:                { variant: "secondary",   label: "Submitted" },
    ACTION_REQUIRED:          { variant: "destructive", label: "Action Required" },
    KYC_COMPLETED:            { variant: "success",     label: "KYC Completed" },
    KYC_REQUIRED:             { variant: "warning",     label: "KYC Required" },
    KYC_IN_PROGRESS:          { variant: "secondary",   label: "KYC In Progress" },
    EPC_VERIFIED:             { variant: "success",     label: "EPC Verified" },
    BID_PLACED:               { variant: "secondary",   label: "Bid Placed" },
    NEGOTIATION_IN_PROGRESS:  { variant: "warning",     label: "Negotiating" },
    COMMERCIAL_LOCKED:        { variant: "success",     label: "Commercial Locked" },
    ACCEPTED:                 { variant: "success",     label: "Accepted" },
  };

  const getStatusBadge = (status: string) => {
    const cfg = statusConfig[status] || { variant: "secondary" as const, label: status.replace(/_/g, " ") };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  const tabTitles: Record<string, string> = {
    overview:         "Dashboard",
    profile:          "My Profile",
    bills:            "CWC RF Form",
    cwcaf:            "CWC AF Form",
    "additional-docs":"Additional Documents",
    cases:            "Cases",
    bids:             "My Bids",
  };

  const tabDescriptions: Record<string, string> = {
    overview:         "Manage your bills, cases, and bids",
    profile:          "Update your business information",
    bills:            "Submit invoice — each submission automatically creates a CWC RF request for ops review",
    cwcaf:            "Submit your CWC Agreement Form for working capital financing",
    "additional-docs":"Upload documents requested by the operations team",
    cases:            "Track your financing cases",
    bids:             "View and respond to bid offers",
  };

  return (
    <div className="app-container">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {sc?.companyName?.[0]?.toUpperCase() || "S"}
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-600">
              Gryork
            </h1>
            <p className="text-xs text-slate-400 font-medium">Sub-Contractor Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">
            Menu
          </p>

          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.badge && (
                  <span className="ml-auto bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
              {sc?.companyName?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-slate-700 truncate">
                {sc?.companyName || "Sub-Contractor"}
              </p>
              <p className="text-xs text-slate-500 truncate">{sc?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content-area">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {tabTitles[activeTab] || "Dashboard"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {tabDescriptions[activeTab]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sc && getStatusBadge(sc.status)}
          </div>
        </header>

      {/* Tab Content */}
      <AnimatePresence mode="wait">

        {/* ── Overview ── */}
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                const c = colorMap[stat.color];
                return (
                  <Card key={stat.label} className="border border-gray-200 shadow-none hover:shadow-sm transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                          <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                          <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                        </div>
                        <div className={`${c.light} p-2.5 rounded-lg`}>
                          <Icon className={`h-5 w-5 ${c.text}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Profile Completion Banner */}
            {profileCompletion < 100 && (
              <div className="flex items-center justify-between gap-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-blue-900">Complete your profile</p>
                    <span className="text-sm font-semibold text-blue-700">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-1.5" />
                </div>
                <Button size="sm" variant="outline" onClick={() => setActiveTab("profile")} className="shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100">
                  Complete <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-3">Quick Actions</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { id: "bills",  label: "Start CWC RF Form", desc: "Submit invoice & CWC RF",       icon: FilePlus2,     color: "blue" },
                  { id: "cwcaf", label: "Start CWC AF Form", desc: "Working capital agreement",     icon: ClipboardList, color: "teal" },
                  { id: "bids",  label: "View Bids",         desc: `${pendingBids.length} pending`,  icon: Gavel,         color: "amber" },
                ].map((action) => {
                  const Icon = action.icon;
                  const c = colorMap[action.color];
                  return (
                    <button
                      key={action.id}
                      onClick={() => setActiveTab(action.id)}
                      className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all text-left group"
                    >
                      <div className={`${c.light} p-2.5 rounded-lg`}>
                        <Icon className={`h-5 w-5 ${c.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{action.label}</p>
                        <p className="text-xs text-gray-500">{action.desc}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Bills */}
            {dashboard?.bills?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-500">Recent Bills</p>
                  <button onClick={() => setActiveTab("bills")} className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                    View all <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <Card className="border border-gray-200 shadow-none">
                  <div className="divide-y divide-gray-100">
                    {dashboard.bills.slice(0, 4).map((bill: any) => (
                      <div key={bill._id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{bill.billNumber || "—"}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-0.5">
                              <IndianRupee className="h-3 w-3" />{bill.amount?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(bill.status)}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Profile ── */}
        {activeTab === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <Card className="border border-gray-200 shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Business Profile</CardTitle>
                <CardDescription>Update your company information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { id: "companyName", label: "Company Name", icon: Building2, placeholder: "Your Company Name", field: "companyName" },
                      { id: "ownerName",   label: "Owner / Contact Name", icon: User, placeholder: "Owner Name", field: "ownerName" },
                      { id: "phone",       label: "Phone Number", icon: Phone, placeholder: "+91 98765 43210", field: "phone" },
                      { id: "vendorId",    label: "Vendor ID (from EPC)", icon: Hash, placeholder: "VND-12345", field: "vendorId" },
                      { id: "gstin",       label: "GSTIN", icon: CreditCard, placeholder: "22AAAAA0000A1Z5", field: "gstin" },
                    ].map(({ id, label, icon: Icon, placeholder, field }) => (
                      <div key={id} className="space-y-1.5">
                        <Label htmlFor={id}>{label}</Label>
                        <div className="relative">
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id={id}
                            value={(profileForm as any)[field]}
                            onChange={(e) => setProfileForm({ ...profileForm, [field]: e.target.value })}
                            placeholder={placeholder}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="address">Business Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          id="address"
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          placeholder="Full business address"
                          className="pl-9 min-h-[80px] resize-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Bills & CWC RF ── */}
        {activeTab === "bills" && (
          <motion.div key="bills" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="space-y-4">

            {/* Info Banner */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <Send className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Bill + CWC RF in one step</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Each bill submission automatically creates a linked CWC RF request. Both are sent to the operations team for verification.
                </p>
              </div>
            </div>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Submit New Bill</CardTitle>
                <CardDescription>Fill in the invoice details and upload the bill document</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBillFormSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="billNumber">Bill Number <span className="text-red-500">*</span></Label>
                      <Input id="billNumber" value={billData.billNumber} onChange={(e) => setBillData({ ...billData, billNumber: e.target.value })} placeholder="INV-001" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="amount">Amount (₹) <span className="text-red-500">*</span></Label>
                      <Input id="amount" type="number" value={billData.amount} onChange={(e) => setBillData({ ...billData, amount: e.target.value })} placeholder="100000" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" value={billData.description} onChange={(e) => setBillData({ ...billData, description: e.target.value })} placeholder="Work description" />
                    </div>
                  </div>
                  <label
                    htmlFor="billFile"
                    className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
                      billFiles[0] ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setBillFiles(e.target.files ? [e.target.files[0]] : [])} className="hidden" id="billFile" />
                    <Upload className={`h-8 w-8 ${billFiles[0] ? "text-blue-500" : "text-gray-300"}`} />
                    <div className="text-center">
                      <p className={`text-sm font-medium ${billFiles[0] ? "text-blue-700" : "text-gray-600"}`}>
                        {billFiles[0] ? billFiles[0].name : "Click to upload bill document"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  </label>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={uploadingBill}>
                      {uploadingBill ? "Submitting..." : "Review & Submit"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Bill History</CardTitle>
                <CardDescription>{dashboard?.bills?.length || 0} total bills</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {dashboard?.bills?.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {dashboard.bills.map((bill: any) => (
                      <div key={bill._id} className="flex items-center justify-between px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{bill.billNumber || "No Number"}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <IndianRupee className="h-3 w-3" />{bill.amount?.toLocaleString() || 0}
                              {bill.description && <span className="text-gray-400">· {bill.description}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(bill.status)}
                          {bill.status === "VERIFIED" && (
                            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                              <Send className="h-2.5 w-2.5" />CWC RF Active
                            </span>
                          )}
                          {bill.status === "REJECTED" && bill.rejectionReason && (
                            <span className="text-[10px] text-red-500">{bill.rejectionReason}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <FileText className="h-8 w-8 text-gray-200 mb-2" />
                    <p className="text-sm text-gray-500">No bills submitted yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Seller Declaration Dialog ── */}
            {showDeclarationDialog && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Seller Declaration</h3>
                      <p className="text-xs text-gray-500">Required before bill submission</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-gray-700 leading-relaxed border border-gray-200">
                    I hereby declare that the bill submitted is genuine, all work described has been completed as per the contract, and I authorize Gryork to process this invoice for working capital financing. I confirm that this bill has not been submitted elsewhere for financing and I am liable for any misrepresentation.
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer mb-6">
                    <input
                      type="checkbox"
                      checked={declarationAccepted}
                      onChange={(e) => setDeclarationAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      I have read and accept the terms of the <span className="font-medium text-blue-700">Seller Declaration</span>
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => { setShowDeclarationDialog(false); setPendingBillForm(null); }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={!declarationAccepted || uploadingBill}
                      onClick={handleConfirmBillSubmit}
                    >
                      {uploadingBill ? "Submitting..." : "Accept & Submit"}
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Cases ── */}
        {activeTab === "cases" && (
          <motion.div key="cases" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <Card className="border border-gray-200 shadow-none">
              <CardHeader>
                <CardTitle className="text-base">My Cases</CardTitle>
                <CardDescription>Track your financing case progress</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {dashboard?.cases?.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {dashboard.cases.map((c: any) => (
                      <div key={c._id} className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center shrink-0">
                            <FolderOpen className="h-4 w-4 text-violet-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Case #{c.caseNumber || c._id.slice(-6)}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-0.5 mt-0.5">
                              <IndianRupee className="h-3 w-3" />{c.amount?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(c.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <FolderOpen className="h-8 w-8 text-gray-200 mb-2" />
                    <p className="text-sm text-gray-500">No cases yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Bids ── */}
        {activeTab === "bids" && (
          <motion.div key="bids" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="space-y-4">
            {dashboard?.bids?.length > 0 ? (
              dashboard.bids.map((bid: any) => (
                <Card key={bid._id} className="border border-gray-200 shadow-none">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-semibold text-gray-900">{bid.epcId?.companyName || "Company"}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5">
                            <div className="p-1.5 bg-blue-50 rounded-lg">
                              <IndianRupee className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Bid Amount</p>
                              <p className="text-sm font-semibold text-gray-900">₹{bid.bidAmount?.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="p-1.5 bg-emerald-50 rounded-lg">
                              <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Duration</p>
                              <p className="text-sm font-semibold text-gray-900">{bid.fundingDurationDays} days</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(bid.status)}
                    </div>

                    {(bid.status === "SUBMITTED" || bid.status === "NEGOTIATION_IN_PROGRESS") && (
                      <>
                        {respondingBid === bid._id ? (
                          <div className="space-y-3 pt-4 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-700">Counter Offer</p>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label>Counter Amount (₹)</Label>
                                <Input type="number" value={counterOffer.amount} onChange={(e) => setCounterOffer({ ...counterOffer, amount: e.target.value })} placeholder="e.g., 500000" />
                              </div>
                              <div className="space-y-1.5">
                                <Label>Counter Duration (days)</Label>
                                <Input type="number" value={counterOffer.duration} onChange={(e) => setCounterOffer({ ...counterOffer, duration: e.target.value })} placeholder="e.g., 45" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label>Message (Optional)</Label>
                              <Textarea value={counterOffer.message} onChange={(e) => setCounterOffer({ ...counterOffer, message: e.target.value })} placeholder="Add a note to your counter-offer..." className="min-h-[72px] resize-none" />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" size="sm" onClick={() => setRespondingBid(null)}>Cancel</Button>
                              <Button size="sm" onClick={() => handleBidResponse(bid._id, "negotiate")}>
                                <TrendingUp className="h-3.5 w-3.5 mr-1.5" />Send Counter-Offer
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2 pt-4 border-t border-gray-100">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleBidResponse(bid._id, "accept")}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setRespondingBid(bid._id)}>
                              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />Negotiate
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 ml-auto" onClick={() => handleBidResponse(bid._id, "reject")}>
                              <XCircle className="h-3.5 w-3.5 mr-1.5" />Reject
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border border-gray-200 shadow-none">
                <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                  <Gavel className="h-8 w-8 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-500">No bids received yet</p>
                  <p className="text-xs text-gray-400 mt-1">Bids from companies will appear here</p>
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* ── Additional Documents ── */}
        {activeTab === "additional-docs" && (
          <motion.div key="additional-docs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="space-y-4">

            {/* Info Banner */}
            <div className="flex items-start gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
              <Paperclip className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-violet-900">Additional Documents Requested</p>
                <p className="text-xs text-violet-700 mt-0.5">
                  The operations team may request additional supporting documents during verification. Upload each requested document below.
                </p>
              </div>
            </div>

            {sc?.additionalDocuments?.length > 0 ? (
              <div className="space-y-3">
                {sc.additionalDocuments.map((doc: any) => {
                  const isRequested = doc.status === "REQUESTED";
                  const isUploaded  = doc.status === "UPLOADED";
                  const isVerified  = doc.status === "VERIFIED";
                  const isRejected  = doc.status === "REJECTED";
                  const isActive    = uploadingDocId === doc._id;

                  return (
                    <Card key={doc._id} className={`border shadow-none ${
                      isRequested ? "border-amber-200 bg-amber-50/50" :
                      isRejected  ? "border-red-200 bg-red-50/50" :
                      isVerified  ? "border-emerald-200 bg-emerald-50/50" :
                      "border-gray-200"
                    }`}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isRequested ? "bg-amber-100" :
                              isRejected  ? "bg-red-100" :
                              isVerified  ? "bg-emerald-100" :
                              "bg-blue-100"
                            }`}>
                              <Paperclip className={`h-4 w-4 ${
                                isRequested ? "text-amber-600" :
                                isRejected  ? "text-red-600" :
                                isVerified  ? "text-emerald-600" :
                                "text-blue-600"
                              }`} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{doc.label}</p>
                              {doc.description && <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>}
                              <p className="text-xs text-gray-400 mt-0.5">
                                Requested {new Date(doc.requestedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            {isRequested && <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full"><AlertCircle className="h-3 w-3" />Action Required</span>}
                            {isUploaded  && <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full"><Clock className="h-3 w-3" />Under Review</span>}
                            {isVerified  && <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full"><CheckCircle2 className="h-3 w-3" />Verified</span>}
                            {isRejected  && <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2.5 py-1 rounded-full"><XCircle className="h-3 w-3" />Rejected</span>}
                          </div>
                        </div>

                        {/* Show uploaded file name */}
                        {doc.fileName && (
                          <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Uploaded: <span className="font-medium">{doc.fileName}</span>
                            {doc.fileUrl && (
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">View</a>
                            )}
                          </p>
                        )}

                        {/* Upload area for REQUESTED or REJECTED */}
                        {(isRequested || isRejected) && (
                          <div className="mt-3 space-y-2">
                            <label
                              htmlFor={`addoc-${doc._id}`}
                              className={`flex items-center gap-2 border-2 border-dashed rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                                isActive && additionalDocFile ? "border-violet-300 bg-violet-50" : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/50"
                              }`}
                            >
                              <input
                                type="file"
                                id={`addoc-${doc._id}`}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  setAdditionalDocFile(e.target.files?.[0] || null);
                                  setUploadingDocId(doc._id);
                                }}
                              />
                              <Upload className="h-4 w-4 text-gray-400 shrink-0" />
                              <span className="text-sm text-gray-600">
                                {isActive && additionalDocFile ? additionalDocFile.name : (isRejected ? "Re-upload document" : "Select document to upload")}
                              </span>
                            </label>
                            {isActive && additionalDocFile && (
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  className="bg-violet-600 hover:bg-violet-700 text-white"
                                  disabled={uploadingDocId === doc._id && !additionalDocFile}
                                  onClick={() => handleUploadAdditionalDoc(doc._id)}
                                >
                                  {uploadingDocId === doc._id ? "Uploading..." : "Submit Document"}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border border-gray-200 shadow-none">
                <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                  <FolderUp className="h-10 w-10 text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-600">No additional documents requested</p>
                  <p className="text-xs text-gray-400 mt-1">The operations team will notify you here if they need more documents</p>
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* ── CWC AF ── */}
        {activeTab === "cwcaf" && (
          <motion.div key="cwcaf" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="space-y-4">

            {/* Info Banner */}
            <div className="flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-xl p-4">
              <ClipboardList className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-teal-900">CWC Agreement Form</p>
                <p className="text-xs text-teal-700 mt-0.5">
                  Complete the CWC AF to finalise your working capital financing agreement. This is required after your CWC RF has been approved by the operations team.
                </p>
              </div>
            </div>

            <Card className="border border-gray-200 shadow-none">
              <CardHeader>
                <CardTitle className="text-base">CWC Agreement Form</CardTitle>
                <CardDescription>Fill in the agreement details for working capital financing</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="cwcaf-ref">CWC RF Reference Number <span className="text-red-500">*</span></Label>
                      <Input id="cwcaf-ref" placeholder="RF-00001" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cwcaf-amount">Agreed Amount (₹) <span className="text-red-500">*</span></Label>
                      <Input id="cwcaf-amount" type="number" placeholder="100000" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cwcaf-duration">Financing Duration (days) <span className="text-red-500">*</span></Label>
                      <Input id="cwcaf-duration" type="number" placeholder="45" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cwcaf-bank">Bank Account Number <span className="text-red-500">*</span></Label>
                      <Input id="cwcaf-bank" placeholder="XXXX XXXX XXXX" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cwcaf-ifsc">IFSC Code <span className="text-red-500">*</span></Label>
                      <Input id="cwcaf-ifsc" placeholder="SBIN0001234" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cwcaf-pan">PAN Number <span className="text-red-500">*</span></Label>
                      <Input id="cwcaf-pan" placeholder="ABCDE1234F" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cwcaf-remarks">Additional Remarks</Label>
                    <Textarea id="cwcaf-remarks" placeholder="Any additional information for the agreement..." className="min-h-[80px] resize-none" />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                      Submit CWC AF
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardPage;
