import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cwcrfApi } from '@/api';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Building2, Receipt, Target, Percent, Clock, CheckCircle2,
  AlertCircle, FileText, Banknote, Calendar, MapPin, Hash,
  TrendingUp, Timer, History, ChevronRight
} from 'lucide-react';

interface CwcrfDetail {
  _id: string;
  cwcrfNumber: string;
  status: string;
  buyerDetails: {
    buyerName: string;
    buyerGstin: string;
    projectName: string;
    projectLocation: string;
  };
  invoiceDetails: {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceAmount: number;
    expectedPaymentDate: string;
    workDescription: string;
  };
  cwcRequest: {
    requestedAmount: number;
    requestedTenure: number;
    urgencyLevel: string;
    reasonForFunding: string;
  };
  interestPreference: {
    preferenceType: string;
    minRate: number;
    maxRate: number;
  };
  nbfcQuotations: Array<{
    nbfc: { _id: string; name: string };
    offeredAmount: number;
    interestRate: number;
    tenure: number;
    processingFee: number;
    quotedAt: string;
    status: string;
  }>;
  selectedNbfc?: {
    nbfc: { name: string };
    offeredAmount: number;
    interestRate: number;
    selectedAt: string;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    updatedBy: string;
    notes: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const statusSteps = [
  { key: 'SUBMITTED', label: 'Submitted', icon: FileText },
  { key: 'BUYER_PENDING', label: 'Awaiting Buyer', icon: Clock },
  { key: 'BUYER_APPROVED', label: 'Buyer Approved', icon: CheckCircle2 },
  { key: 'UNDER_RISK_REVIEW', label: 'Risk Review', icon: Target },
  { key: 'CWCAF_READY', label: 'CWCAF Ready', icon: FileText },
  { key: 'SHARED_WITH_NBFC', label: 'Shared with NBFCs', icon: Building2 },
  { key: 'QUOTATIONS_RECEIVED', label: 'Quotes Received', icon: Banknote },
  { key: 'NBFC_SELECTED', label: 'NBFC Selected', icon: CheckCircle2 },
  { key: 'DOCUMENTATION_PENDING', label: 'Documentation', icon: FileText },
  { key: 'DISBURSED', label: 'Disbursed', icon: Banknote }
];

const statusLabels: Record<string, string> = {
  SUBMITTED: 'Submitted',
  BUYER_PENDING: 'Awaiting Buyer Verification',
  BUYER_APPROVED: 'Buyer Approved',
  BUYER_REJECTED: 'Buyer Rejected',
  UNDER_RISK_REVIEW: 'Under Risk Review',
  CWCAF_READY: 'CWCAF Generated',
  SHARED_WITH_NBFC: 'Shared with NBFCs',
  QUOTATIONS_RECEIVED: 'Quotations Received',
  NBFC_SELECTED: 'NBFC Selected',
  DOCUMENTATION_PENDING: 'Documentation Pending',
  DISBURSED: 'Disbursed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled'
};

const CwcrfDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cwcrf, setCwcrf] = useState<CwcrfDetail | null>(null);
  const [selectingNbfc, setSelectingNbfc] = useState(false);

  useEffect(() => {
    loadCwcrfDetail();
  }, [id]);

  const loadCwcrfDetail = async () => {
    if (!id) return;
    try {
      const res = await cwcrfApi.getById(id);
      setCwcrf(res.data.cwcrf || res.data);
    } catch {
      toast.error('Failed to load CWCRF details');
      navigate('/my-cwcrfs');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNbfc = async (nbfcId: string) => {
    if (!cwcrf) return;
    setSelectingNbfc(true);
    try {
      await cwcrfApi.selectNbfc(cwcrf._id, nbfcId);
      toast.success('NBFC selected successfully!');
      loadCwcrfDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to select NBFC');
    } finally {
      setSelectingNbfc(false);
    }
  };

  const getStatusIndex = (status: string) => {
    const idx = statusSteps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const getStatusVariant = (status: string): 'success' | 'destructive' | 'warning' | 'secondary' => {
    if (['DISBURSED'].includes(status)) return 'success';
    if (['REJECTED', 'CANCELLED', 'BUYER_REJECTED'].includes(status)) return 'destructive';
    if (['QUOTATIONS_RECEIVED', 'NBFC_SELECTED'].includes(status)) return 'warning';
    return 'secondary';
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading CWCRF details...</p>
        </motion.div>
      </div>
    );
  }

  if (!cwcrf) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto mt-20">
        <Card className="text-center">
          <CardContent className="pt-8 pb-6">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">CWCRF Not Found</h3>
            <p className="text-gray-500 mb-6">The requested CWCRF could not be found.</p>
            <Button onClick={() => navigate('/my-cwcrfs')}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back to My CWCRFs
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const currentStatusIndex = getStatusIndex(cwcrf.status);
  const isRejected = ['REJECTED', 'CANCELLED', 'BUYER_REJECTED'].includes(cwcrf.status);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/my-cwcrfs')} className="mb-2 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              CWCRF #{cwcrf.cwcrfNumber || cwcrf._id.slice(-8).toUpperCase()}
            </h1>
            <Badge variant={getStatusVariant(cwcrf.status)}>
              {statusLabels[cwcrf.status] || cwcrf.status}
            </Badge>
          </div>
          <p className="text-gray-500 mt-1">Submitted on {formatDate(cwcrf.createdAt)}</p>
        </div>
      </div>

      {/* Progress Timeline */}
      {!isRejected && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-600" />Progress Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between overflow-x-auto pb-2">
              {statusSteps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx < currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                return (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center min-w-[80px]">
                      <motion.div
                        animate={{ scale: isCurrent ? 1.15 : 1 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' :
                          'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                      </motion.div>
                      <span className={`text-xs mt-2 text-center ${isCurrent ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-1 flex-shrink-0 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Banner */}
      <AnimatePresence>
        {cwcrf.status === 'QUOTATIONS_RECEIVED' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Action Required</p>
              <p className="text-amber-700 text-sm">You have received quotations from NBFCs. Please review and select one to proceed.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buyer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-600" />Section A - Buyer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Building2, label: 'Buyer Name', value: cwcrf.buyerDetails?.buyerName },
                  { icon: Hash, label: 'GSTIN', value: cwcrf.buyerDetails?.buyerGstin },
                  { icon: FileText, label: 'Project Name', value: cwcrf.buyerDetails?.projectName },
                  { icon: MapPin, label: 'Project Location', value: cwcrf.buyerDetails?.projectLocation }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <item.icon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="font-medium text-gray-900">{item.value || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-green-600" />Section B - Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Invoice Number</p>
                    <p className="font-medium text-gray-900">{cwcrf.invoiceDetails?.invoiceNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Invoice Date</p>
                    <p className="font-medium text-gray-900">{cwcrf.invoiceDetails?.invoiceDate ? formatDate(cwcrf.invoiceDetails.invoiceDate) : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-lg sm:col-span-2">
                  <Banknote className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-green-600">Invoice Amount</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(cwcrf.invoiceDetails?.invoiceAmount || 0)}</p>
                  </div>
                </div>
                {cwcrf.invoiceDetails?.workDescription && (
                  <div className="sm:col-span-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Work Description</p>
                    <p className="text-gray-700">{cwcrf.invoiceDetails.workDescription}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CWC Request */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-purple-600" />Section C - CWC Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg text-center">
                  <Banknote className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs text-purple-600">Requested Amount</p>
                  <p className="text-xl font-bold text-purple-700">{formatCurrency(cwcrf.cwcRequest?.requestedAmount || 0)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <Timer className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Tenure</p>
                  <p className="text-xl font-bold text-gray-900">{cwcrf.cwcRequest?.requestedTenure} days</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <AlertCircle className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Urgency</p>
                  <Badge variant={cwcrf.cwcRequest?.urgencyLevel === 'CRITICAL' ? 'destructive' : cwcrf.cwcRequest?.urgencyLevel === 'URGENT' ? 'warning' : 'secondary'}>
                    {cwcrf.cwcRequest?.urgencyLevel || 'NORMAL'}
                  </Badge>
                </div>
              </div>
              {cwcrf.cwcRequest?.reasonForFunding && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Reason for Funding</p>
                  <p className="text-gray-700">{cwcrf.cwcRequest.reasonForFunding}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interest Preference */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5 text-amber-600" />Section D - Interest Preference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-gray-500">Preference Type</p>
                  <p className="font-medium text-gray-900">{cwcrf.interestPreference?.preferenceType || 'RANGE'}</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div>
                  <p className="text-xs text-gray-500">Acceptable Rate Range</p>
                  <p className="font-medium text-gray-900">{cwcrf.interestPreference?.minRate}% - {cwcrf.interestPreference?.maxRate}% p.a.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quotations & History */}
        <div className="space-y-6">
          {/* NBFC Quotations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-green-600" />
                NBFC Quotations
                {cwcrf.nbfcQuotations?.length > 0 && (
                  <Badge variant="secondary">{cwcrf.nbfcQuotations.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cwcrf.selectedNbfc ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">Selected NBFC</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-3">{cwcrf.selectedNbfc.nbfc?.name}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sanctioned Amount</span>
                      <span className="font-medium text-green-700">{formatCurrency(cwcrf.selectedNbfc.offeredAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Interest Rate</span>
                      <span className="font-medium">{cwcrf.selectedNbfc.interestRate}% p.a.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Selected On</span>
                      <span>{cwcrf.selectedNbfc.selectedAt ? formatDate(cwcrf.selectedNbfc.selectedAt) : 'Recently'}</span>
                    </div>
                  </div>
                </motion.div>
              ) : cwcrf.nbfcQuotations && cwcrf.nbfcQuotations.length > 0 ? (
                <div className="space-y-3">
                  {cwcrf.nbfcQuotations.map((quote, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                    >
                      <p className="font-semibold text-gray-900 mb-3">{quote.nbfc?.name || `NBFC ${idx + 1}`}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <p className="text-gray-500 text-xs">Offered</p>
                          <p className="font-medium text-green-600">{formatCurrency(quote.offeredAmount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Rate</p>
                          <p className="font-medium">{quote.interestRate}% p.a.</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Tenure</p>
                          <p className="font-medium">{quote.tenure} days</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Processing Fee</p>
                          <p className="font-medium">{quote.processingFee}%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400">Quoted: {formatDate(quote.quotedAt)}</span>
                        {cwcrf.status === 'QUOTATIONS_RECEIVED' && (
                          <Button size="sm" onClick={() => handleSelectNbfc(quote.nbfc?._id)} isLoading={selectingNbfc}>
                            Select<ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Banknote className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    {cwcrf.status === 'SHARED_WITH_NBFC' ? 'Waiting for NBFCs to submit quotations...' :
                     cwcrf.status === 'SUBMITTED' || cwcrf.status === 'BUYER_PENDING' ? 'Quotations will be available after buyer verification.' :
                     'No quotations received yet.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          {cwcrf.timeline && cwcrf.timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-gray-500" />Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-4">
                    {cwcrf.timeline.map((entry, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative pl-6"
                      >
                        <div className="absolute left-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{statusLabels[entry.status] || entry.status}</p>
                          <p className="text-xs text-gray-400">{formatDateTime(entry.timestamp)}</p>
                          {entry.notes && <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CwcrfDetailPage;
