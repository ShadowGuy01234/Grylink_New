import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { scApi } from '@/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload, CheckCircle2, XCircle, Clock, FileText, CreditCard, Building2,
  ExternalLink, AlertCircle, Shield, Landmark, RefreshCw, Hourglass, LogOut, Send
} from 'lucide-react';

interface KycDocument {
  type: string;
  label: string;
  description: string;
  required: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

interface AdditionalDocument {
  _id: string;
  label: string;
  description?: string;
  requestedAt: string;
  fileName?: string;
  fileUrl?: string;
  uploadedAt?: string;
  status: 'REQUESTED' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';
  rejectionNotes?: string;
}

const KYC_DOCUMENTS: KycDocument[] = [
  { type: 'panCard', label: 'PAN Card', description: 'Upload clear copy of your company/proprietor PAN card', required: true, icon: CreditCard },
  { type: 'aadhaarCard', label: 'Aadhaar Card', description: 'Upload front and back of Aadhaar card (for proprietor/director)', required: true, icon: CreditCard },
  { type: 'gstCertificate', label: 'GST Certificate', description: 'Upload GST registration certificate', required: true, icon: FileText },
  { type: 'cancelledCheque', label: 'Cancelled Cheque', description: 'Upload a cancelled cheque for bank account verification', required: true, icon: Landmark },
  { type: 'incorporationCertificate', label: 'Certificate of Incorporation', description: 'Required for Pvt Ltd, LLP, or Partnership firms', required: false, icon: FileText },
  { type: 'bankStatement', label: 'Bank Statement (6 months)', description: 'Last 6 months bank statement for financial assessment', required: false, icon: Landmark }
];

const KycUploadPage = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<{
    overall: string;
    documents: Record<string, { uploaded: boolean; url?: string; status?: string; rejectionReason?: string }>;
    bankDetailsVerified: boolean;
    bankDetails?: { accountNumber?: string; ifscCode?: string; bankName?: string; branchName?: string; accountHolderName?: string; accountType?: string };
    additionalDocuments?: AdditionalDocument[];
  } | null>(null);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '', ifscCode: '', bankName: '', branchName: '', accountHolderName: '',
    accountType: 'savings' as 'savings' | 'current'
  });
  const [savingBank, setSavingBank] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState<string | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => { loadKycStatus(); }, []);

  const loadKycStatus = async () => {
    try {
      const res = await scApi.getKycStatus();
      setKycStatus(res.data);
      if (res.data.bankDetails) {
        setBankDetails({
          accountNumber: res.data.bankDetails.accountNumber || '',
          ifscCode: res.data.bankDetails.ifscCode || '',
          bankName: res.data.bankDetails.bankName || '',
          branchName: res.data.bankDetails.branchName || '',
          accountHolderName: res.data.bankDetails.accountHolderName || '',
          accountType: (res.data.bankDetails.accountType as 'savings' | 'current') || 'savings'
        });
      }
    } catch {
      toast.error('Failed to load KYC status');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (docType: string, file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) { toast.error('Only JPG, PNG, or PDF files are allowed'); return; }

    setUploading(docType);
    try {
      const formData = new FormData();
      formData.append('document', file);
      await scApi.uploadKycDocument(docType, formData);
      toast.success('Document uploaded successfully!');
      loadKycStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName) {
      toast.error('Please fill all required bank details'); return;
    }
    setSavingBank(true);
    try {
      await scApi.updateBankDetails(bankDetails);
      toast.success('Bank details saved!');
      loadKycStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save bank details');
    } finally {
      setSavingBank(false);
    }
  };

  const handleAdditionalDocUpload = async (docId: string, file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) { toast.error('Only JPG, PNG, or PDF files are allowed'); return; }

    setUploadingAdditional(docId);
    try {
      const formData = new FormData();
      formData.append('document', file);
      await scApi.uploadAdditionalDocument(docId, formData);
      toast.success('Document uploaded successfully!');
      loadKycStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploadingAdditional(null);
    }
  };

  const getDocumentStatus = (docType: string) => {
    const doc = kycStatus?.documents?.[docType];
    if (!doc || !doc.uploaded) return 'NOT_UPLOADED';
    return doc.status || 'PENDING';
  };

  // A doc can be re-uploaded only if NOT_UPLOADED or REJECTED (PENDING = locked until ops acts)
  const canEditDoc = (docType: string) => {
    const status = getDocumentStatus(docType);
    return status === 'NOT_UPLOADED' || status === 'REJECTED';
  };

  // Submit button is available when all required docs uploaded + bank details saved + not already submitted
  const allRequiredUploaded = KYC_DOCUMENTS.filter(d => d.required)
    .every(d => getDocumentStatus(d.type) !== 'NOT_UPLOADED');
  const bankSaved = !!(kycStatus?.bankDetails?.accountNumber);
  const isAlreadySubmitted = kycStatus?.overall === 'UNDER_REVIEW' || kycStatus?.overall === 'COMPLETED';
  const canSubmit = allRequiredUploaded && bankSaved && !isAlreadySubmitted;
  const hasRejections = KYC_DOCUMENTS.filter(d => d.required)
    .some(d => getDocumentStatus(d.type) === 'REJECTED');

  const handleSubmitKyc = async () => {
    setSubmitting(true);
    try {
      await scApi.submitKycForReview();
      toast.success('KYC submitted for review!');
      setShowSubmitDialog(false);
      loadKycStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusVariant = (status: string): 'success' | 'destructive' | 'warning' | 'secondary' => {
    if (status === 'VERIFIED') return 'success';
    if (status === 'REJECTED') return 'destructive';
    if (status === 'PENDING') return 'warning';
    return 'secondary';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { NOT_UPLOADED: 'Not Uploaded', PENDING: 'Pending Review', VERIFIED: 'Verified', REJECTED: 'Rejected' };
    return labels[status] || 'Not Uploaded';
  };

  const calculateProgress = () => {
    const requiredDocs = KYC_DOCUMENTS.filter(d => d.required);
    const uploadedRequired = requiredDocs.filter(d => getDocumentStatus(d.type) !== 'NOT_UPLOADED').length;
    const verifiedRequired = requiredDocs.filter(d => getDocumentStatus(d.type) === 'VERIFIED').length;
    return {
      uploaded: Math.round((uploadedRequired / requiredDocs.length) * 100),
      verified: Math.round((verifiedRequired / requiredDocs.length) * 100)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading KYC status...</p>
        </motion.div>
      </div>
    );
  }

  // Pending verification screen — all docs submitted, waiting for ops review
  // But if any docs are rejected, let SC see them and re-upload
  const anyRejected = KYC_DOCUMENTS.some(d => getDocumentStatus(d.type) === 'REJECTED');
  if (kycStatus?.overall === 'UNDER_REVIEW' && !anyRejected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
            <Hourglass className="h-10 w-10 text-amber-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Documents Under Review</h2>
            <p className="text-gray-500 mt-2">
              Your KYC documents have been submitted and are now being reviewed by our operations team. This usually takes 1–2 business days.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-1">
            <p className="text-sm font-medium text-amber-800">What happens next?</p>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>Our team verifies each document</li>
              <li>You'll be notified upon approval</li>
              <li>If any document needs re-submission, it will be flagged here</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />Refresh Status
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-red-600">
              <LogOut className="h-4 w-4 mr-2" />Logout
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Minimal header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Gryork</span>
          <div className="flex items-center gap-3">
            <Badge variant="warning" className="gap-1"><Shield className="h-3 w-3" />KYC Verification Required</Badge>
            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-red-600">
              <LogOut className="h-4 w-4 mr-2" />Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC Document Upload</h1>
        <p className="text-gray-500">Complete your Know Your Customer (KYC) verification to access the platform</p>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Documents Uploaded</span>
                  <span className="font-medium text-blue-600">{progress.uploaded}%</span>
                </div>
                <Progress value={progress.uploaded} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Documents Verified</span>
                  <span className="font-medium text-green-600">{progress.verified}%</span>
                </div>
                <Progress value={progress.verified} className="h-2" indicatorClassName="bg-green-500" />
              </div>
            </div>
            {kycStatus?.overall === 'VERIFIED' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">KYC Verified!</p>
                  <p className="text-sm text-green-600">You can now submit CWCRF</p>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" />Required Documents</CardTitle>
          <CardDescription>Upload all required documents for KYC verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {KYC_DOCUMENTS.filter(d => d.required).map((doc, idx) => {
              const status = getDocumentStatus(doc.type);
              const docData = kycStatus?.documents?.[doc.type];
              const Icon = doc.icon;

              return (
                <motion.div
                  key={doc.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    status === 'VERIFIED' ? 'border-green-200 bg-green-50/50' :
                    status === 'REJECTED' ? 'border-red-200 bg-red-50/50' :
                    status === 'PENDING' ? 'border-amber-200 bg-amber-50/50' :
                    'border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        status === 'VERIFIED' ? 'bg-green-100' :
                        status === 'REJECTED' ? 'bg-red-100' :
                        status === 'PENDING' ? 'bg-amber-100' :
                        'bg-gray-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          status === 'VERIFIED' ? 'text-green-600' :
                          status === 'REJECTED' ? 'text-red-600' :
                          status === 'PENDING' ? 'text-amber-600' :
                          'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.label}</p>
                        <Badge variant={getStatusVariant(status)} className="mt-1">
                          {status === 'VERIFIED' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {status === 'REJECTED' && <XCircle className="h-3 w-3 mr-1" />}
                          {status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                          {getStatusLabel(status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{doc.description}</p>

                  {status === 'REJECTED' && docData?.rejectionReason && (
                    <div className="bg-red-100 border border-red-200 rounded-lg p-2 mb-3 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{docData.rejectionReason}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {docData?.url && (
                      <a href={docData.url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />View
                      </a>
                    )}
                    <input
                      ref={el => { fileInputRefs.current[doc.type] = el; }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(doc.type, file); }}
                      className="hidden"
                    />
                    {canEditDoc(doc.type) ? (
                      <Button
                        variant={status === 'NOT_UPLOADED' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => fileInputRefs.current[doc.type]?.click()}
                        isLoading={uploading === doc.type}
                        className="ml-auto"
                      >
                        {uploading !== doc.type && <Upload className="h-4 w-4 mr-1" />}
                        {status === 'NOT_UPLOADED' ? 'Upload' : 'Re-upload'}
                      </Button>
                    ) : (
                      <span className="ml-auto text-xs text-gray-400">
                        {status === 'VERIFIED' ? 'Locked — Verified' : 'Locked — Under Review'}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Optional Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-gray-500" />Optional Documents</CardTitle>
          <CardDescription>These documents may speed up your verification process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {KYC_DOCUMENTS.filter(d => !d.required).map((doc, idx) => {
              const status = getDocumentStatus(doc.type);
              const docData = kycStatus?.documents?.[doc.type];
              const Icon = doc.icon;

              return (
                <motion.div
                  key={doc.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    status === 'VERIFIED' ? 'border-green-200 bg-green-50/50' :
                    status === 'PENDING' ? 'border-amber-200 bg-amber-50/50' :
                    'border-dashed border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-5 w-5 text-gray-400" />
                    <p className="font-medium text-gray-900">{doc.label}</p>
                    {status !== 'NOT_UPLOADED' && (
                      <Badge variant={getStatusVariant(status)} className="ml-auto">{getStatusLabel(status)}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{doc.description}</p>
                  <div className="flex items-center gap-2">
                    {docData?.url && (
                      <a href={docData.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />View
                      </a>
                    )}
                    <input
                      ref={el => { fileInputRefs.current[doc.type] = el; }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(doc.type, file); }}
                      className="hidden"
                    />
                    {canEditDoc(doc.type) ? (
                      <Button variant="outline" size="sm" onClick={() => fileInputRefs.current[doc.type]?.click()} isLoading={uploading === doc.type} className="ml-auto">
                        {uploading !== doc.type && (status === 'NOT_UPLOADED' ? <Upload className="h-4 w-4 mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />)}
                        {status === 'NOT_UPLOADED' ? 'Upload' : 'Re-upload'}
                      </Button>
                    ) : status !== 'NOT_UPLOADED' && (
                      <span className="ml-auto text-xs text-gray-400">
                        {status === 'VERIFIED' ? 'Verified' : 'Under Review'}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5 text-blue-600" />Bank Account Details</CardTitle>
          <CardDescription>Provide your bank account for fund disbursement</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveBankDetails} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label required>Account Holder Name</Label>
                <Input value={bankDetails.accountHolderName} onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))} placeholder="Name as per bank records" disabled={kycStatus?.bankDetailsVerified} />
              </div>
              <div className="space-y-2">
                <Label required>Account Number</Label>
                <Input value={bankDetails.accountNumber} onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))} placeholder="Enter account number" disabled={kycStatus?.bankDetailsVerified} />
              </div>
              <div className="space-y-2">
                <Label required>IFSC Code</Label>
                <Input value={bankDetails.ifscCode} onChange={(e) => setBankDetails(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))} placeholder="e.g., HDFC0001234" maxLength={11} disabled={kycStatus?.bankDetailsVerified} />
              </div>
              <div className="space-y-2">
                <Label required>Bank Name</Label>
                <Input value={bankDetails.bankName} onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))} placeholder="Enter bank name" disabled={kycStatus?.bankDetailsVerified} />
              </div>
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input value={bankDetails.branchName} onChange={(e) => setBankDetails(prev => ({ ...prev, branchName: e.target.value }))} placeholder="Enter branch name (optional)" disabled={kycStatus?.bankDetailsVerified} />
              </div>
              <div className="space-y-2">
                <Label required>Account Type</Label>
                <select
                  value={bankDetails.accountType}
                  onChange={(e) => setBankDetails(prev => ({ ...prev, accountType: e.target.value as 'savings' | 'current' }))}
                  disabled={kycStatus?.bankDetailsVerified}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="savings">Savings Account</option>
                  <option value="current">Current Account</option>
                </select>
              </div>
              <div className="flex items-end">
                {kycStatus?.bankDetailsVerified ? (
                  <Badge variant="success" className="h-10 px-4"><CheckCircle2 className="h-4 w-4 mr-2" />Bank Details Verified</Badge>
                ) : bankDetails.accountNumber ? (
                  <Badge variant="warning" className="h-10 px-4"><Clock className="h-4 w-4 mr-2" />Pending Verification</Badge>
                ) : (
                  <Badge variant="secondary" className="h-10 px-4">Not Submitted</Badge>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              {!kycStatus?.bankDetailsVerified && (
                <Button type="submit" isLoading={savingBank}>
                  {!savingBank && <Building2 className="h-4 w-4 mr-2" />}Save Bank Details
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Submit KYC for Review */}
      {canSubmit && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <p className="font-semibold text-blue-900">
              {hasRejections ? 'Re-submit for Review' : 'Ready to Submit KYC'}
            </p>
            <p className="text-sm text-blue-700 mt-0.5">
              {hasRejections
                ? 'You have re-uploaded rejected documents. Submit again for ops review.'
                : 'All required documents and bank details are filled. Submit for verification.'}
            </p>
          </div>
          <Button
            onClick={() => setShowSubmitDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
          >
            <Send className="h-4 w-4 mr-2" />
            {hasRejections ? 'Re-submit for Review' : 'Submit for Review'}
          </Button>
        </motion.div>
      )}

      {/* Additional Documents Requested by Ops */}
      {(kycStatus?.additionalDocuments ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />Additional Documents Requested
            </CardTitle>
            <CardDescription>The operations team has requested these documents from you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {(kycStatus?.additionalDocuments ?? []).map((doc) => (
                <div
                  key={doc._id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    doc.status === 'VERIFIED' ? 'border-green-200 bg-green-50/50' :
                    doc.status === 'REJECTED' ? 'border-red-200 bg-red-50/50' :
                    doc.status === 'UPLOADED' ? 'border-amber-200 bg-amber-50/50' :
                    'border-dashed border-amber-300 bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{doc.label}</p>
                      {doc.description && <p className="text-sm text-gray-500 mt-0.5">{doc.description}</p>}
                      {doc.status === 'REJECTED' && doc.rejectionNotes && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          <span><strong>Reason:</strong> {doc.rejectionNotes}</span>
                        </p>
                      )}
                    </div>
                    <Badge variant={
                      doc.status === 'VERIFIED' ? 'success' :
                      doc.status === 'REJECTED' ? 'destructive' :
                      doc.status === 'UPLOADED' ? 'warning' : 'secondary'
                    }>
                      {doc.status === 'VERIFIED' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {doc.status === 'REJECTED' && <XCircle className="h-3 w-3 mr-1" />}
                      {doc.status === 'UPLOADED' && <Clock className="h-3 w-3 mr-1" />}
                      {doc.status === 'REQUESTED' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {doc.status === 'REQUESTED' ? 'Action Required' : doc.status.charAt(0) + doc.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {doc.fileUrl && (
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />View
                      </a>
                    )}
                    {doc.status !== 'VERIFIED' && (
                      <>
                        <input
                          ref={el => { fileInputRefs.current[`additional_${doc._id}`] = el; }}
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleAdditionalDocUpload(doc._id, file); }}
                          className="hidden"
                        />
                        <Button
                          variant={doc.status === 'REQUESTED' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => fileInputRefs.current[`additional_${doc._id}`]?.click()}
                          isLoading={uploadingAdditional === doc._id}
                          className="ml-auto"
                        >
                          {uploadingAdditional !== doc._id && <Upload className="h-4 w-4 mr-1" />}
                          {doc.status === 'REQUESTED' ? 'Upload' : 'Re-upload'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </motion.div>
    </div>

      {/* Submit KYC Confirmation Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Submit KYC for Review?</h3>
                <p className="text-sm text-gray-500">You cannot edit documents after submission</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 space-y-1">
              <p className="font-medium">What happens after you submit:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                <li>Our team will review all your documents</li>
                <li>We will contact you if any correction is needed</li>
                <li>Verified documents will be locked for security</li>
                <li>Rejected documents can be re-uploaded</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowSubmitDialog(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitKyc}
                isLoading={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {!submitting && <Send className="h-4 w-4 mr-2" />}
                Confirm & Submit
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default KycUploadPage;
