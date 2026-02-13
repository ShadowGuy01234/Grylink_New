import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { scApi, kycApi } from '@/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  User, FileText, Send, FolderOpen, Gavel, MessageSquare,
  Upload, Building2, Phone, Hash, ArrowRight, ChevronRight,
  CheckCircle2, Clock, AlertCircle, XCircle, TrendingUp,
  LayoutDashboard, ArrowLeft, Paperclip
} from 'lucide-react';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [saving, setSaving] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    companyName: '', ownerName: '', phone: '', vendorId: '', gstin: '', address: ''
  });

  // Bill upload
  const [billFiles, setBillFiles] = useState<File[]>([]);
  const [uploadingBill, setUploadingBill] = useState(false);
  const [billData, setBillData] = useState({ billNumber: '', amount: '', description: '' });

  // CWC
  const [selectedBillForCwc, setSelectedBillForCwc] = useState('');
  const [submittingCwc, setSubmittingCwc] = useState(false);

  // Bids
  const [respondingBid, setRespondingBid] = useState<string | null>(null);
  const [counterOffer, setCounterOffer] = useState({ amount: '', duration: '', message: '' });

  // KYC Chat
  const [selectedCwcRf, setSelectedCwcRf] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const fetchDashboard = async () => {
    try {
      const res = await scApi.getDashboard();
      setDashboard(res.data);
      const sc = res.data?.subContractor;
      if (sc) {
        setProfileForm({
          companyName: sc.companyName || '',
          ownerName: sc.ownerName || '',
          phone: sc.phone || '',
          vendorId: sc.vendorId || '',
          gstin: sc.gstin || '',
          address: sc.address || '',
        });
      }
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await scApi.updateProfile(profileForm);
      toast.success('Profile saved!');
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billFiles.length === 0) return;
    setUploadingBill(true);
    try {
      for (const file of billFiles) {
        const formData = new FormData();
        formData.append('file', file);
        if (billData.billNumber) formData.append('billNumber', billData.billNumber);
        if (billData.amount) formData.append('amount', billData.amount);
        if (billData.description) formData.append('description', billData.description);
        await scApi.submitBill(formData);
      }
      toast.success('Bills uploaded!');
      setBillFiles([]);
      setBillData({ billNumber: '', amount: '', description: '' });
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
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
      toast.success('CWC RF submitted!');
      setSelectedBillForCwc('');
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmittingCwc(false);
    }
  };

  const handleBidResponse = async (bidId: string, action: 'accept' | 'reject' | 'negotiate') => {
    try {
      if (action === 'accept') {
        await scApi.respondToBid(bidId, { decision: 'accept' });
        toast.success('Bid accepted!');
      } else if (action === 'reject') {
        await scApi.respondToBid(bidId, { decision: 'reject' });
        toast.success('Bid rejected');
      } else if (action === 'negotiate') {
        await scApi.respondToBid(bidId, {
          decision: 'negotiate',
          counterOffer: Number(counterOffer.amount),
          counterDuration: Number(counterOffer.duration),
          message: counterOffer.message,
        });
        toast.success('Counter-offer sent!');
        setCounterOffer({ amount: '', duration: '', message: '' });
      }
      setRespondingBid(null);
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Action failed');
    }
  };

  const fetchChatMessages = async (cwcRfId: string) => {
    setLoadingChat(true);
    try {
      const res = await kycApi.getMessages(cwcRfId);
      setChatMessages(res.data || []);
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingChat(false);
    }
  };

  const openChat = (cwcRf: any) => {
    setSelectedCwcRf(cwcRf);
    setActiveTab('kyc-chat');
    fetchChatMessages(cwcRf._id);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() && !chatFile) return;
    setSendingChat(true);
    try {
      const formData = new FormData();
      formData.append('content', chatMessage);
      if (chatFile) formData.append('file', chatFile);
      await kycApi.sendMessage(selectedCwcRf._id, formData);
      setChatMessage('');
      setChatFile(null);
      fetchChatMessages(selectedCwcRf._id);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send');
    } finally {
      setSendingChat(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'secondary'; icon: any }> = {
      LEAD_CREATED: { variant: 'warning', icon: Clock },
      PROFILE_INCOMPLETE: { variant: 'warning', icon: AlertCircle },
      PROFILE_COMPLETED: { variant: 'success', icon: CheckCircle2 },
      UPLOADED: { variant: 'warning', icon: Clock },
      VERIFIED: { variant: 'success', icon: CheckCircle2 },
      REJECTED: { variant: 'danger', icon: XCircle },
      SUBMITTED: { variant: 'info', icon: Send },
      ACTION_REQUIRED: { variant: 'danger', icon: AlertCircle },
      KYC_COMPLETED: { variant: 'success', icon: CheckCircle2 },
      KYC_REQUIRED: { variant: 'warning', icon: AlertCircle },
      KYC_IN_PROGRESS: { variant: 'info', icon: Clock },
      EPC_VERIFIED: { variant: 'success', icon: CheckCircle2 },
      BID_PLACED: { variant: 'info', icon: Gavel },
      NEGOTIATION_IN_PROGRESS: { variant: 'warning', icon: TrendingUp },
      COMMERCIAL_LOCKED: { variant: 'success', icon: CheckCircle2 },
      ACCEPTED: { variant: 'success', icon: CheckCircle2 },
    };
    const config = statusConfig[status] || { variant: 'secondary' as const, icon: Clock };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, ' ')}
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
  const verifiedBills = dashboard?.bills?.filter((b: any) => b.status === 'VERIFIED') || [];
  const pendingBids = dashboard?.bids?.filter((b: any) => b.status === 'SUBMITTED' || b.status === 'NEGOTIATION_IN_PROGRESS') || [];
  const pendingKyc = dashboard?.cwcRfs?.filter((c: any) => ['ACTION_REQUIRED', 'KYC_REQUIRED', 'KYC_IN_PROGRESS'].includes(c.status)) || [];

  // Calculate profile completion
  const profileFields = ['companyName', 'ownerName', 'phone', 'address'];
  const filledFields = profileFields.filter((f) => sc?.[f]).length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

  const stats = [
    { label: 'Total Bills', value: dashboard?.bills?.length || 0, icon: FileText, color: 'blue' },
    { label: 'Verified Bills', value: verifiedBills.length, icon: CheckCircle2, color: 'green' },
    { label: 'Active Cases', value: dashboard?.cases?.length || 0, icon: FolderOpen, color: 'purple' },
    { label: 'Pending Bids', value: pendingBids.length, icon: Gavel, color: 'amber' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'bills', label: 'Bills', icon: FileText },
    { id: 'cwc', label: 'CWC RF', icon: Send },
    { id: 'cases', label: 'Cases', icon: FolderOpen },
    { id: 'bids', label: 'Bids', icon: Gavel, badge: pendingBids.length > 0 ? pendingBids.length : undefined },
    { id: 'kyc', label: 'KYC Chat', icon: MessageSquare, badge: pendingKyc.length > 0 ? pendingKyc.length : undefined },
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
          <h1 className="text-2xl font-bold text-gray-900">{sc?.companyName || 'Sub-Contractor Dashboard'}</h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            Sub-Contractor Dashboard
            {sc && getStatusBadge(sc.status)}
          </p>
        </div>
        {pendingBids.length > 0 && (
          <Badge variant="danger" className="gap-1 self-start">
            <AlertCircle className="h-3 w-3" />
            {pendingBids.length} pending bid{pendingBids.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'kyc' && activeTab === 'kyc-chat');
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.badge && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                }`}>
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
        {activeTab === 'overview' && (
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
                    <Card hover>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                          </div>
                          <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                            <Icon className={`h-6 w-6 text-${stat.color}-600`} />
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
                        <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
                        <p className="text-sm text-gray-500">Fill in all details to get verified faster</p>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{profileCompletion}%</span>
                    </div>
                    <Progress value={profileCompletion} className="h-2 mb-4" />
                    <Button variant="default" size="sm" onClick={() => setActiveTab('profile')}>
                      Complete Profile <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card hover className="cursor-pointer" onClick={() => setActiveTab('bills')}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Upload New Bill</h3>
                      <p className="text-sm text-gray-500">Submit invoices for verification</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card hover className="cursor-pointer" onClick={() => setActiveTab('cwc')}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-green-200">
                      <Send className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Submit CWC RF</h3>
                      <p className="text-sm text-gray-500">{verifiedBills.length} verified bill{verifiedBills.length !== 1 ? 's' : ''} ready</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Complete Your Profile
                </CardTitle>
                <CardDescription>Fill in your company details to get verified faster</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" required>Company Name</Label>
                      <Input
                        id="companyName"
                        required
                        value={profileForm.companyName}
                        onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                        icon={<Building2 className="h-4 w-4" />}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerName" required>Owner Name</Label>
                      <Input
                        id="ownerName"
                        required
                        value={profileForm.ownerName}
                        onChange={(e) => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                        icon={<User className="h-4 w-4" />}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" required>Phone</Label>
                      <Input
                        id="phone"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        icon={<Phone className="h-4 w-4" />}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vendorId">Vendor ID</Label>
                      <Input
                        id="vendorId"
                        value={profileForm.vendorId}
                        onChange={(e) => setProfileForm({ ...profileForm, vendorId: e.target.value })}
                        icon={<Hash className="h-4 w-4" />}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gstin">GSTIN</Label>
                      <Input
                        id="gstin"
                        value={profileForm.gstin}
                        onChange={(e) => setProfileForm({ ...profileForm, gstin: e.target.value })}
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address" required>Address</Label>
                      <Textarea
                        id="address"
                        required
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        placeholder="Enter your complete business address"
                      />
                    </div>
                  </div>
                  <Button type="submit" variant="gradient" isLoading={saving}>
                    {!saving && 'Save Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <motion.div
            key="bills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload New Bill
                </CardTitle>
                <CardDescription>Submit your invoices for EPC verification</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadBill} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billNumber">Bill Number</Label>
                      <Input
                        id="billNumber"
                        value={billData.billNumber}
                        onChange={(e) => setBillData({ ...billData, billNumber: e.target.value })}
                        placeholder="INV-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={billData.amount}
                        onChange={(e) => setBillData({ ...billData, amount: e.target.value })}
                        placeholder="100000"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={billData.description}
                        onChange={(e) => setBillData({ ...billData, description: e.target.value })}
                        placeholder="Brief description of the work"
                      />
                    </div>
                  </div>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setBillFiles(Array.from(e.target.files || []))}
                      className="hidden"
                      id="bill-files"
                    />
                    <label htmlFor="bill-files" className="cursor-pointer">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Click to upload bill documents</p>
                      <p className="text-sm text-gray-400 mt-1">PDF, Images accepted</p>
                    </label>
                    {billFiles.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        {billFiles.map((f, i) => (
                          <Badge key={i} variant="secondary" className="gap-1">
                            <FileText className="h-3 w-3" />
                            {f.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button type="submit" variant="gradient" isLoading={uploadingBill} disabled={billFiles.length === 0}>
                    {!uploadingBill && (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Bills
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Bills List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Bills</CardTitle>
                <CardDescription>{dashboard?.bills?.length || 0} total bills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill #</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">File</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {dashboard?.bills?.map((b: any) => (
                        <motion.tr
                          key={b._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-gray-900">{b.billNumber || '—'}</td>
                          <td className="py-3 px-4 text-gray-600">{b.amount ? `₹${b.amount.toLocaleString()}` : '—'}</td>
                          <td className="py-3 px-4">
                            <a href={b.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {b.fileName}
                            </a>
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(b.status)}</td>
                        </motion.tr>
                      ))}
                      {(!dashboard?.bills || dashboard.bills.length === 0) && (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-gray-400">
                            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            No bills uploaded yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* CWC Tab */}
        {activeTab === 'cwc' && (
          <motion.div
            key="cwc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-green-600" />
                  Submit CWC RF
                </CardTitle>
                <CardDescription>
                  Confirmation With Company Request for Funding. A ₹1,000 platform fee applies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitCwc} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cwc-bill">Select Verified Bill</Label>
                    <Select
                      id="cwc-bill"
                      value={selectedBillForCwc}
                      onChange={(e) => setSelectedBillForCwc(e.target.value)}
                    >
                      <option value="">-- Select a Bill --</option>
                      {verifiedBills.map((b: any) => (
                        <option key={b._id} value={b._id}>
                          {b.billNumber} - ₹{b.amount?.toLocaleString()}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {verifiedBills.length === 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <p className="text-sm text-amber-700">
                        No verified bills available. Bills must be verified by EPC before submitting CWC RF.
                      </p>
                    </div>
                  )}
                  <Button type="submit" variant="success" isLoading={submittingCwc} disabled={!selectedBillForCwc}>
                    {!submittingCwc && (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit CWC RF
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* CWC List */}
            <Card>
              <CardHeader>
                <CardTitle>Your CWC Requests</CardTitle>
                <CardDescription>{dashboard?.cwcRfs?.length || 0} total requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform Fee</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {dashboard?.cwcRfs?.map((c: any) => (
                        <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900">{c.billId?.billNumber || '—'}</td>
                          <td className="py-3 px-4">
                            {c.platformFeePaid ? (
                              <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>
                            ) : (
                              <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(c.status)}</td>
                          <td className="py-3 px-4 text-gray-500 text-sm">{new Date(c.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {(!dashboard?.cwcRfs || dashboard.cwcRfs.length === 0) && (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-gray-400">
                            <Send className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            No CWC requests submitted
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Cases Tab */}
        {activeTab === 'cases' && (
          <motion.div
            key="cases"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-purple-600" />
                  Your Cases
                </CardTitle>
                <CardDescription>Track your funding cases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Case #</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {dashboard?.cases?.map((c: any) => (
                        <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-gray-900">{c.caseNumber}</td>
                          <td className="py-3 px-4 text-gray-600">{c.billId?.billNumber || '—'}</td>
                          <td className="py-3 px-4 font-medium text-green-600">{c.billId?.amount ? `₹${c.billId.amount.toLocaleString()}` : '—'}</td>
                          <td className="py-3 px-4">{getStatusBadge(c.status)}</td>
                        </tr>
                      ))}
                      {(!dashboard?.cases || dashboard.cases.length === 0) && (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-gray-400">
                            <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            No cases yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Bids Tab */}
        {activeTab === 'bids' && (
          <motion.div
            key="bids"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Funding Bids</h2>
                <p className="text-gray-500">Review and respond to funding offers from buyers</p>
              </div>
            </div>

            {dashboard?.bids?.map((bid: any) => (
              <motion.div
                key={bid._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`${bid.status === 'COMMERCIAL_LOCKED' ? 'border-green-200 bg-green-50/50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">From Buyer</p>
                        <p className="font-semibold text-gray-900">{bid.buyerId?.companyName || 'Buyer'}</p>
                      </div>
                      {getStatusBadge(bid.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Offer Amount</p>
                        <p className="text-lg font-bold text-green-600">₹{bid.proposedAmount?.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Interest</p>
                        <p className="text-lg font-bold text-gray-900">{bid.interestRate}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Duration</p>
                        <p className="text-lg font-bold text-gray-900">{bid.fundingDurationDays} days</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                        <p className="text-lg font-bold text-gray-900">{new Date(bid.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {bid.notes && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">{bid.notes}</p>
                      </div>
                    )}

                    {/* Negotiation History */}
                    {bid.negotiations?.length > 0 && (
                      <div className="border-t border-gray-100 pt-4 mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">Negotiation History</p>
                        <div className="space-y-2">
                          {bid.negotiations.map((n: any, i: number) => (
                            <div key={i} className={`flex items-center gap-3 text-sm ${n.proposedByRole === 'subcontractor' ? 'justify-end' : ''}`}>
                              <div className={`px-3 py-2 rounded-lg ${n.proposedByRole === 'subcontractor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                <span className="font-medium">{n.proposedByRole === 'subcontractor' ? 'You' : 'Buyer'}:</span>
                                {' '}₹{n.counterAmount?.toLocaleString()} for {n.counterDuration} days
                                {n.message && <p className="text-xs opacity-75 mt-1">"{n.message}"</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {(bid.status === 'SUBMITTED' || bid.status === 'NEGOTIATION_IN_PROGRESS') && (
                      <>
                        {respondingBid === bid._id ? (
                          <div className="border-t border-gray-100 pt-4">
                            <p className="font-medium text-gray-900 mb-3">Counter-Offer</p>
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                              <div className="space-y-2">
                                <Label>Your Amount (₹)</Label>
                                <Input
                                  type="number"
                                  value={counterOffer.amount}
                                  onChange={(e) => setCounterOffer({ ...counterOffer, amount: e.target.value })}
                                  placeholder="Enter amount"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Duration (days)</Label>
                                <Input
                                  type="number"
                                  value={counterOffer.duration}
                                  onChange={(e) => setCounterOffer({ ...counterOffer, duration: e.target.value })}
                                  placeholder="Enter days"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Message (optional)</Label>
                                <Input
                                  value={counterOffer.message}
                                  onChange={(e) => setCounterOffer({ ...counterOffer, message: e.target.value })}
                                  placeholder="Add a note"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleBidResponse(bid._id, 'negotiate')}
                                disabled={!counterOffer.amount}
                              >
                                Send Counter-Offer
                              </Button>
                              <Button variant="outline" onClick={() => setRespondingBid(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                            <Button variant="success" onClick={() => handleBidResponse(bid._id, 'accept')}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Accept Bid
                            </Button>
                            <Button variant="warning" onClick={() => setRespondingBid(bid._id)}>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Negotiate
                            </Button>
                            <Button variant="destructive" onClick={() => handleBidResponse(bid._id, 'reject')}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Locked Terms */}
                    {bid.status === 'COMMERCIAL_LOCKED' && bid.lockedTerms && (
                      <div className="border-t border-green-200 pt-4">
                        <div className="flex items-center gap-2 text-green-700 mb-2">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-semibold">Commercial Locked</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Final Amount</p>
                            <p className="font-bold text-green-600">₹{bid.lockedTerms.finalAmount?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Duration</p>
                            <p className="font-bold text-gray-900">{bid.lockedTerms.finalDuration} days</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Locked On</p>
                            <p className="font-bold text-gray-900">{new Date(bid.lockedTerms.lockedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {(!dashboard?.bids || dashboard.bids.length === 0) && (
              <Card>
                <CardContent className="py-16 text-center">
                  <Gavel className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-1">No bids received yet</h3>
                  <p className="text-gray-500 text-sm">
                    Once your cases are verified by the EPC company, you'll receive funding offers here.
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* KYC Tab - List */}
        {activeTab === 'kyc' && (
          <motion.div
            key="kyc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                  KYC Document Requests
                </CardTitle>
                <CardDescription>Chat with Ops team to submit required documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">CWC RF</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pendingKyc.map((c: any) => (
                        <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-gray-900">
                            #{c._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(c.status)}</td>
                          <td className="py-3 px-4">
                            <Button size="sm" variant="outline" onClick={() => openChat(c)}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Open Chat
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {pendingKyc.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-12 text-center text-gray-400">
                            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            No pending KYC requests
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* KYC Chat Interface */}
        {activeTab === 'kyc-chat' && selectedCwcRf && (
          <motion.div
            key="kyc-chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('kyc')}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <div>
                      <CardTitle className="text-lg">KYC Chat</CardTitle>
                      <CardDescription>#{selectedCwcRf._id.slice(-8).toUpperCase()}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(selectedCwcRf.status)}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingChat ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Ops will request documents here</p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg: any) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.senderRole === 'subcontractor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.senderRole === 'subcontractor'
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium opacity-75">
                            {msg.senderRole === 'subcontractor' ? 'You' : 'Ops'}
                          </span>
                          <span className="text-xs opacity-50">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {msg.content && <p className="text-sm">{msg.content}</p>}
                        {msg.fileUrl && (
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center gap-1 text-sm mt-1 ${
                              msg.senderRole === 'subcontractor' ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:underline'
                            }`}
                          >
                            <Paperclip className="h-3 w-3" />
                            {msg.fileName || 'Attachment'}
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </CardContent>

              <CardFooter className="border-t p-4">
                <form onSubmit={handleSendChat} className="w-full space-y-2">
                  {chatFile && (
                    <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                      <Paperclip className="h-4 w-4" />
                      <span className="flex-1 truncate">{chatFile.name}</span>
                      <button type="button" onClick={() => setChatFile(null)} className="text-blue-500 hover:text-blue-700">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      disabled={sendingChat}
                      className="flex-1"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setChatFile(e.target.files?.[0] || null)}
                      />
                      <Button type="button" variant="outline" size="icon" asChild>
                        <span><Paperclip className="h-4 w-4" /></span>
                      </Button>
                    </label>
                    <Button type="submit" disabled={sendingChat || (!chatMessage.trim() && !chatFile)} isLoading={sendingChat}>
                      {!sendingChat && <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DashboardPage;
