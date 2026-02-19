import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { scApi, kycApi } from "@/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User,
  FileText,
  Send,
  FolderOpen,
  Gavel,
  MessageSquare,
  Upload,
  Building2,
  Phone,
  Hash,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  LayoutDashboard,
  ArrowLeft,
  Paperclip,
  MapPin,
  CreditCard,
} from "lucide-react";

const DashboardPage = () => {
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

  // CWC
  const [selectedBillForCwc, setSelectedBillForCwc] = useState("");
  const [submittingCwc, setSubmittingCwc] = useState(false);

  // Bids
  const [respondingBid, setRespondingBid] = useState<string | null>(null);
  const [counterOffer, setCounterOffer] = useState({
    amount: "",
    duration: "",
    message: "",
  });

  // KYC Chat
  const [selectedCwcRf, setSelectedCwcRf] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

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

  const handleUploadBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billFiles.length === 0) {
      toast.error("Please upload at least one bill file");
      return;
    }
    if (!billData.billNumber || !billData.amount) {
      toast.error("Please fill in Bill Number and Amount");
      return;
    }
    setUploadingBill(true);
    try {
      for (const file of billFiles) {
        const formData = new FormData();
        formData.append("bills", file);
        if (billData.billNumber)
          formData.append("billNumber", billData.billNumber);
        if (billData.amount) formData.append("amount", billData.amount);
        if (billData.description)
          formData.append("description", billData.description);
        await scApi.submitBill(formData);
      }
      toast.success("Bills uploaded!");
      setBillFiles([]);
      setBillData({ billNumber: "", amount: "", description: "" });
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploadingBill(false);
    }
  };

  const handleSubmitCwc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForCwc) return;
    setSubmittingCwc(true);
    try {
      await scApi.submitCwc({ billId: selectedBillForCwc });
      toast.success("CWC RF submitted!");
      setSelectedBillForCwc("");
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Submission failed");
    } finally {
      setSubmittingCwc(false);
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

  const fetchChatMessages = async (cwcRfId: string) => {
    setLoadingChat(true);
    try {
      const res = await kycApi.getMessages(cwcRfId);
      setChatMessages(res.data?.messages || res.data || []);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoadingChat(false);
    }
  };

  const openChat = (cwcRf: any) => {
    setSelectedCwcRf(cwcRf);
    setActiveTab("kyc-chat");
    fetchChatMessages(cwcRf._id);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() && !chatFile) return;
    setSendingChat(true);
    try {
      const formData = new FormData();
      formData.append("content", chatMessage);
      if (chatFile) formData.append("file", chatFile);
      await kycApi.sendMessage(selectedCwcRf._id, formData);
      setChatMessage("");
      setChatFile(null);
      fetchChatMessages(selectedCwcRf._id);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send");
    } finally {
      setSendingChat(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        variant: "success" | "warning" | "destructive" | "secondary";
        icon: any;
      }
    > = {
      LEAD_CREATED: { variant: "warning", icon: Clock },
      PROFILE_INCOMPLETE: { variant: "warning", icon: AlertCircle },
      PROFILE_COMPLETED: { variant: "success", icon: CheckCircle2 },
      UPLOADED: { variant: "warning", icon: Clock },
      VERIFIED: { variant: "success", icon: CheckCircle2 },
      REJECTED: { variant: "destructive", icon: XCircle },
      SUBMITTED: { variant: "secondary", icon: Send },
      ACTION_REQUIRED: { variant: "destructive", icon: AlertCircle },
      KYC_COMPLETED: { variant: "success", icon: CheckCircle2 },
      KYC_REQUIRED: { variant: "warning", icon: AlertCircle },
      KYC_IN_PROGRESS: { variant: "secondary", icon: Clock },
      EPC_VERIFIED: { variant: "success", icon: CheckCircle2 },
      BID_PLACED: { variant: "secondary", icon: Gavel },
      NEGOTIATION_IN_PROGRESS: { variant: "warning", icon: TrendingUp },
      COMMERCIAL_LOCKED: { variant: "success", icon: CheckCircle2 },
      ACCEPTED: { variant: "success", icon: CheckCircle2 },
    };
    const config = statusConfig[status] || {
      variant: "secondary" as const,
      icon: Clock,
    };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const sc = dashboard?.subContractor;
  const verifiedBills =
    dashboard?.bills?.filter((b: any) => b.status === "VERIFIED") || [];
  const pendingBids =
    dashboard?.bids?.filter(
      (b: any) =>
        b.status === "SUBMITTED" || b.status === "NEGOTIATION_IN_PROGRESS",
    ) || [];
  const pendingKyc =
    dashboard?.cwcRfs?.filter((c: any) =>
      ["ACTION_REQUIRED", "KYC_REQUIRED", "KYC_IN_PROGRESS"].includes(c.status),
    ) || [];

  // Calculate profile completion
  const profileFields = ["companyName", "ownerName", "phone", "address"];
  const filledFields = profileFields.filter((f) => sc?.[f]).length;
  const profileCompletion = Math.round(
    (filledFields / profileFields.length) * 100,
  );

  const stats = [
    {
      label: "Total Bills",
      value: dashboard?.bills?.length || 0,
      icon: FileText,
      color: "blue",
    },
    {
      label: "Verified Bills",
      value: verifiedBills.length,
      icon: CheckCircle2,
      color: "green",
    },
    {
      label: "Active Cases",
      value: dashboard?.cases?.length || 0,
      icon: FolderOpen,
      color: "purple",
    },
    {
      label: "Pending Bids",
      value: pendingBids.length,
      icon: Gavel,
      color: "amber",
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "profile", label: "Profile", icon: User },
    { id: "bills", label: "Bills", icon: FileText },
    { id: "cwc", label: "CWC RF", icon: Send },
    { id: "cases", label: "Cases", icon: FolderOpen },
    {
      id: "bids",
      label: "Bids",
      icon: Gavel,
      badge: pendingBids.length > 0 ? pendingBids.length : undefined,
    },
    {
      id: "kyc",
      label: "KYC Chat",
      icon: MessageSquare,
      badge: pendingKyc.length > 0 ? pendingKyc.length : undefined,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {sc?.companyName || "Sub-Contractor Dashboard"}
          </h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            Sub-Contractor Dashboard
            {sc && getStatusBadge(sc.status)}
          </p>
        </div>
        {pendingBids.length > 0 && (
          <Badge variant="destructive" className="gap-1 self-start">
            <AlertCircle className="h-3 w-3" />
            {pendingBids.length} pending bid
            {pendingBids.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id ||
            (tab.id === "kyc" && activeTab === "kyc-chat");
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.5 text-xs rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">
                              {stat.label}
                            </p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                              {stat.value}
                            </p>
                          </div>
                          <div
                            className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}
                          >
                            <Icon
                              className={`h-6 w-6 text-${stat.color}-600`}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Profile Completion */}
            {profileCompletion < 100 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Complete Your Profile
                        </h3>
                        <p className="text-sm text-gray-500">
                          Fill in all details to get verified faster
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">
                        {profileCompletion}%
                      </span>
                    </div>
                    <Progress value={profileCompletion} className="h-2" />
                    <Button
                      onClick={() => setActiveTab("profile")}
                      variant="outline"
                      className="mt-4"
                    >
                      Complete Profile
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab("bills")}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Upload Bills
                    </h3>
                    <p className="text-sm text-gray-500">Submit new invoices</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab("cwc")}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Send className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Submit CWC RF
                    </h3>
                    <p className="text-sm text-gray-500">Request financing</p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab("bids")}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Gavel className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">View Bids</h3>
                    <p className="text-sm text-gray-500">
                      {pendingBids.length} pending
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>
                  Update your company information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="companyName"
                          value={profileForm.companyName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              companyName: e.target.value,
                            })
                          }
                          placeholder="Your Company Name"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Owner Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="ownerName"
                          value={profileForm.ownerName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              ownerName: e.target.value,
                            })
                          }
                          placeholder="Owner / Contact Name"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              phone: e.target.value,
                            })
                          }
                          placeholder="+91 98765 43210"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vendorId">Vendor ID (from EPC)</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="vendorId"
                          value={profileForm.vendorId}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              vendorId: e.target.value,
                            })
                          }
                          placeholder="VND-12345"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gstin">GSTIN</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="gstin"
                          value={profileForm.gstin}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              gstin: e.target.value,
                            })
                          }
                          placeholder="22AAAAA0000A1Z5"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Business Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          id="address"
                          value={profileForm.address}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              address: e.target.value,
                            })
                          }
                          placeholder="Full business address"
                          className="pl-10 min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full md:w-auto"
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Bills Tab */}
        {activeTab === "bills" && (
          <motion.div
            key="bills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle>Upload New Bill</CardTitle>
                <CardDescription>
                  Submit invoices for verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadBill} className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billNumber">
                        Bill Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="billNumber"
                        value={billData.billNumber}
                        onChange={(e) =>
                          setBillData({
                            ...billData,
                            billNumber: e.target.value,
                          })
                        }
                        placeholder="INV-001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        Amount (₹) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        value={billData.amount}
                        onChange={(e) =>
                          setBillData({ ...billData, amount: e.target.value })
                        }
                        placeholder="100000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={billData.description}
                        onChange={(e) =>
                          setBillData({
                            ...billData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Work description"
                      />
                    </div>
                  </div>

                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center ${billFiles.length > 0 ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}
                  >
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setBillFiles(Array.from(e.target.files || []))
                      }
                      className="hidden"
                      id="billFiles"
                      required={billFiles.length === 0}
                    />
                    <label htmlFor="billFiles" className="cursor-pointer block">
                      <Upload
                        className={`h-10 w-10 mx-auto mb-2 ${billFiles.length > 0 ? "text-blue-500" : "text-gray-400"}`}
                      />
                      <p
                        className={`font-medium ${billFiles.length > 0 ? "text-blue-700" : "text-gray-600"}`}
                      >
                        {billFiles.length > 0
                          ? `${billFiles.length} file(s) selected`
                          : "Click to upload bills"}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        PDF, JPG, PNG up to 10MB{" "}
                        <span className="text-red-500">*</span>
                      </p>
                    </label>
                  </div>

                  <Button type="submit" disabled={uploadingBill}>
                    {uploadingBill ? "Uploading..." : "Upload Bills"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Bills List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Bills</CardTitle>
                <CardDescription>
                  {dashboard?.bills?.length || 0} total bills
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard?.bills?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.bills.map((bill: any) => (
                      <div
                        key={bill._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {bill.billNumber || "No Number"}
                            </p>
                            <p className="text-sm text-gray-500">
                              ₹{bill.amount?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(bill.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No bills uploaded yet
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* CWC RF Tab */}
        {activeTab === "cwc" && (
          <motion.div
            key="cwc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Submit CWC Request</CardTitle>
                <CardDescription>
                  Select a verified bill to request financing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitCwc} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Verified Bill</Label>
                    {verifiedBills.length > 0 ? (
                      <div className="space-y-2">
                        {verifiedBills.map((bill: any) => (
                          <label
                            key={bill._id}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedBillForCwc === bill._id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="cwcBill"
                              value={bill._id}
                              checked={selectedBillForCwc === bill._id}
                              onChange={(e) =>
                                setSelectedBillForCwc(e.target.value)
                              }
                              className="hidden"
                            />
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedBillForCwc === bill._id
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedBillForCwc === bill._id && (
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{bill.billNumber}</p>
                              <p className="text-sm text-gray-500">
                                ₹{bill.amount?.toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="success">Verified</Badge>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 py-4">
                        No verified bills available. Upload and get bills
                        verified first.
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={submittingCwc || !selectedBillForCwc}
                  >
                    {submittingCwc ? "Submitting..." : "Submit CWC Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Cases Tab */}
        {activeTab === "cases" && (
          <motion.div
            key="cases"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Your Cases</CardTitle>
                <CardDescription>Track your financing cases</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard?.cases?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.cases.map((c: any) => (
                      <div key={c._id} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Case #{c.caseNumber || c._id.slice(-6)}
                            </p>
                            <p className="text-sm text-gray-500">
                              ₹{c.amount?.toLocaleString() || 0}
                            </p>
                          </div>
                          {getStatusBadge(c.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No cases yet</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Bids Tab */}
        {activeTab === "bids" && (
          <motion.div
            key="bids"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>NBFC Bids</CardTitle>
                <CardDescription>
                  Review and respond to financing offers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard?.bids?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboard.bids.map((bid: any) => (
                      <div
                        key={bid._id}
                        className="p-6 bg-gray-50 rounded-xl space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {bid.nbfc?.name || "NBFC"}
                            </p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                              {bid.interestRate}%{" "}
                              <span className="text-sm font-normal text-gray-500">
                                p.a.
                              </span>
                            </p>
                            <p className="text-sm text-gray-500">
                              {bid.tenure} days tenure
                            </p>
                          </div>
                          {getStatusBadge(bid.status)}
                        </div>

                        {(bid.status === "SUBMITTED" ||
                          bid.status === "NEGOTIATION_IN_PROGRESS") && (
                          <>
                            {respondingBid === bid._id ? (
                              <div className="space-y-4 p-4 bg-white rounded-lg">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Counter Rate (%)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={counterOffer.amount}
                                      onChange={(e) =>
                                        setCounterOffer({
                                          ...counterOffer,
                                          amount: e.target.value,
                                        })
                                      }
                                      placeholder="e.g., 12.5"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Counter Tenure (days)</Label>
                                    <Input
                                      type="number"
                                      value={counterOffer.duration}
                                      onChange={(e) =>
                                        setCounterOffer({
                                          ...counterOffer,
                                          duration: e.target.value,
                                        })
                                      }
                                      placeholder="e.g., 45"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Message (Optional)</Label>
                                  <Textarea
                                    value={counterOffer.message}
                                    onChange={(e) =>
                                      setCounterOffer({
                                        ...counterOffer,
                                        message: e.target.value,
                                      })
                                    }
                                    placeholder="Add a message to your counter-offer..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() =>
                                      handleBidResponse(bid._id, "negotiate")
                                    }
                                  >
                                    Send Counter-Offer
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setRespondingBid(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    handleBidResponse(bid._id, "accept")
                                  }
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setRespondingBid(bid._id)}
                                >
                                  Negotiate
                                </Button>
                                <Button
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() =>
                                    handleBidResponse(bid._id, "reject")
                                  }
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No bids received yet
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* KYC Tab */}
        {activeTab === "kyc" && (
          <motion.div
            key="kyc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>KYC Chat</CardTitle>
                <CardDescription>
                  Document exchange with Ops team
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard?.cwcRfs?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.cwcRfs.map((cwcRf: any) => (
                      <div
                        key={cwcRf._id}
                        onClick={() => openChat(cwcRf)}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              CWC RF #{cwcRf._id.slice(-6)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Click to open chat
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(cwcRf.status)}
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No CWC RFs to chat about
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* KYC Chat View */}
        {activeTab === "kyc-chat" && selectedCwcRf && (
          <motion.div
            key="kyc-chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("kyc")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <CardTitle>
                      KYC Chat - #{selectedCwcRf._id.slice(-6)}
                    </CardTitle>
                    <CardDescription>
                      Exchange documents with Ops team
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Messages */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {loadingChat ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                  ) : chatMessages.length > 0 ? (
                    chatMessages.map((msg: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === "subcontractor" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-xl ${
                            msg.sender === "subcontractor"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {msg.content && <p>{msg.content}</p>}
                          {msg.file && (
                            <a
                              href={msg.file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 mt-2 text-sm ${
                                msg.sender === "subcontractor"
                                  ? "text-blue-100"
                                  : "text-blue-600"
                              }`}
                            >
                              <Paperclip className="h-4 w-4" />
                              {msg.file.name}
                            </a>
                          )}
                          <p
                            className={`text-xs mt-1 ${msg.sender === "subcontractor" ? "text-blue-200" : "text-gray-400"}`}
                          >
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">
                      No messages yet. Start the conversation!
                    </p>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendChat} className="border-t p-4">
                  <div className="flex gap-2">
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <input
                        type="file"
                        onChange={(e) =>
                          setChatFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                        id="chatFileInput"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("chatFileInput")?.click()
                        }
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      disabled={
                        sendingChat || (!chatMessage.trim() && !chatFile)
                      }
                    >
                      {sendingChat ? "..." : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                  {chatFile && (
                    <p className="text-sm text-gray-500 mt-2">
                      📎 {chatFile.name}
                      <button
                        type="button"
                        onClick={() => setChatFile(null)}
                        className="ml-2 text-red-500"
                      >
                        Remove
                      </button>
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DashboardPage;
