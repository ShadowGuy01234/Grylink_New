import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cwcrfApi } from '@/api';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Plus, FileText, Building2, Receipt, Banknote, Timer, Calendar,
  CheckCircle2, AlertCircle, ChevronRight, Eye
} from 'lucide-react';

interface Cwcrf {
  _id: string;
  cwcrfNumber?: string;
  status: string;
  buyerDetails: { buyerName: string };
  invoiceDetails: { invoiceNumber: string; invoiceAmount: number };
  cwcRequest: { requestedAmount: number; requestedTenure: number; urgencyLevel: string };
  nbfcQuotations: Array<{
    nbfc: { _id: string; name: string };
    offeredAmount: number;
    interestRate: number;
    tenure: number;
    processingFee: number;
    quotedAt: string;
  }>;
  selectedNbfc?: { nbfc: { name: string }; offeredAmount: number; interestRate: number };
  createdAt: string;
}

const statusSteps = ['SUBMITTED', 'BUYER_PENDING', 'BUYER_APPROVED', 'UNDER_RISK_REVIEW', 'CWCAF_READY', 'SHARED_WITH_NBFC', 'QUOTATIONS_RECEIVED', 'NBFC_SELECTED', 'DOCUMENTATION_PENDING', 'DISBURSED'];

const statusLabels: Record<string, string> = {
  SUBMITTED: 'Submitted',
  BUYER_PENDING: 'Awaiting Buyer',
  BUYER_APPROVED: 'Buyer Approved',
  BUYER_REJECTED: 'Buyer Rejected',
  UNDER_RISK_REVIEW: 'Risk Review',
  CWCAF_READY: 'CWCAF Ready',
  SHARED_WITH_NBFC: 'With NBFCs',
  QUOTATIONS_RECEIVED: 'Quotes Received',
  NBFC_SELECTED: 'NBFC Selected',
  DOCUMENTATION_PENDING: 'Documentation',
  DISBURSED: 'Disbursed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled'
};

const MyCwcrfsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cwcrfs, setCwcrfs] = useState<Cwcrf[]>([]);
  const [selectingNbfc, setSelectingNbfc] = useState<string | null>(null);

  useEffect(() => { loadMyCwcrfs(); }, []);

  const loadMyCwcrfs = async () => {
    try {
      const res = await cwcrfApi.getMyCwcrfs();
      setCwcrfs(res.data.cwcrfs || []);
    } catch {
      toast.error('Failed to load your CWCRFs');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNbfc = async (cwcrfId: string, nbfcId: string) => {
    setSelectingNbfc(nbfcId);
    try {
      await cwcrfApi.selectNbfc(cwcrfId, nbfcId);
      toast.success('NBFC selected successfully!');
      loadMyCwcrfs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to select NBFC');
    } finally {
      setSelectingNbfc(null);
    }
  };

  const getStatusIndex = (status: string) => {
    const idx = statusSteps.indexOf(status);
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading your CWCRFs...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My CWC Requests</h1>
          <p className="text-gray-500">Track and manage your bill discounting requests</p>
        </div>
        <Button onClick={() => navigate('/cwcrf')} variant="gradient">
          <Plus className="h-4 w-4 mr-2" />New CWCRF
        </Button>
      </div>

      {/* Empty State */}
      {cwcrfs.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="text-center py-16">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No CWCRFs Yet</h3>
              <p className="text-gray-500 mb-6">You haven't submitted any CWC Request Forms yet.</p>
              <Button onClick={() => navigate('/cwcrf')} variant="gradient">
                <Plus className="h-4 w-4 mr-2" />Submit Your First CWCRF
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {cwcrfs.map((cwcrf, idx) => {
              const isRejected = ['REJECTED', 'CANCELLED', 'BUYER_REJECTED'].includes(cwcrf.status);
              const progressPercent = ((getStatusIndex(cwcrf.status) + 1) / statusSteps.length) * 100;

              return (
                <motion.div
                  key={cwcrf._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      {/* Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              CWCRF #{cwcrf.cwcrfNumber || cwcrf._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />{formatDate(cwcrf.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusVariant(cwcrf.status)}>
                          {cwcrf.status === 'QUOTATIONS_RECEIVED' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {statusLabels[cwcrf.status] || cwcrf.status}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      {!isRejected && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progressPercent)}%</span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      )}

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Buyer</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{cwcrf.buyerDetails?.buyerName || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Receipt className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Invoice</p>
                            <p className="text-sm font-medium text-gray-900">{cwcrf.invoiceDetails?.invoiceNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Banknote className="h-4 w-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Requested</p>
                            <p className="text-sm font-medium text-green-600">{formatCurrency(cwcrf.cwcRequest?.requestedAmount || 0)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Timer className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">Tenure</p>
                            <p className="text-sm font-medium text-gray-900">{cwcrf.cwcRequest?.requestedTenure} days</p>
                          </div>
                        </div>
                      </div>

                      {/* NBFC Quotations */}
                      {cwcrf.nbfcQuotations && cwcrf.nbfcQuotations.length > 0 && (
                        <div className="border-t border-gray-100 pt-4 mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <Banknote className="h-4 w-4 text-blue-600" />
                              NBFC Quotations
                              <Badge variant="secondary">{cwcrf.nbfcQuotations.length}</Badge>
                            </p>
                          </div>

                          {cwcrf.selectedNbfc ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="font-medium text-green-800">{cwcrf.selectedNbfc.nbfc?.name}</p>
                                <p className="text-sm text-green-700">
                                  {formatCurrency(cwcrf.selectedNbfc.offeredAmount)} @ {cwcrf.selectedNbfc.interestRate}% p.a.
                                </p>
                              </div>
                              <Badge variant="success">Selected</Badge>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {cwcrf.nbfcQuotations.slice(0, 3).map((quote, qIdx) => (
                                <motion.div
                                  key={qIdx}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: qIdx * 0.05 }}
                                  className="flex-1 min-w-[200px] border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                                >
                                  <p className="font-medium text-gray-900 text-sm mb-1">{quote.nbfc?.name || `NBFC ${qIdx + 1}`}</p>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-green-600 font-medium">{formatCurrency(quote.offeredAmount)}</span>
                                    <span className="text-gray-500">{quote.interestRate}% p.a.</span>
                                  </div>
                                  {cwcrf.status === 'QUOTATIONS_RECEIVED' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full mt-2"
                                      onClick={() => handleSelectNbfc(cwcrf._id, quote.nbfc?._id)}
                                      isLoading={selectingNbfc === quote.nbfc?._id}
                                    >
                                      Select
                                    </Button>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div>
                          {cwcrf.status === 'QUOTATIONS_RECEIVED' && !cwcrf.selectedNbfc && (
                            <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />Action Required - Select NBFC
                            </span>
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/cwcrf/${cwcrf._id}`)}>
                          <Eye className="h-4 w-4 mr-1" />View Details<ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default MyCwcrfsPage;
