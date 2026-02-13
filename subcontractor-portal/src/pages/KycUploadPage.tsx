import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { scApi } from '@/api';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload, CheckCircle2, XCircle, Clock, FileText, CreditCard, Building2,
  ArrowRight, ArrowLeft, ExternalLink, AlertCircle, Shield, Landmark, RefreshCw
} from 'lucide-react';

interface KycDocument {
  type: string;
  label: string;
  description: string;
  required: boolean;
  icon: React.ComponentType<{ className?: string }>;
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<{
    overall: string;
    documents: Record<string, { uploaded: boolean; url?: string; status?: string; rejectionReason?: string }>;
    bankDetailsVerified: boolean;
    bankDetails?: { accountNumber?: string; ifscCode?: string; bankName?: string; branchName?: string; accountHolderName?: string };
  } | null>(null);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '', ifscCode: '', bankName: '', branchName: '', accountHolderName: ''
  });
  const [savingBank, setSavingBank] = useState(false);
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
          accountHolderName: res.data.bankDetails.accountHolderName || ''
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

  const getDocumentStatus = (docType: string) => {
    const doc = kycStatus?.documents?.[docType];
    if (!doc || !doc.uploaded) return 'NOT_UPLOADED';
    return doc.status || 'PENDING';
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

  const progress = calculateProgress();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC Document Upload</h1>
        <p className="text-gray-500">Complete your Know Your Customer (KYC) verification</p>
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
                    <Button variant="outline" size="sm" onClick={() => fileInputRefs.current[doc.type]?.click()} isLoading={uploading === doc.type} className="ml-auto">
                      {uploading !== doc.type && (status === 'NOT_UPLOADED' ? <Upload className="h-4 w-4 mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />)}
                      {status === 'NOT_UPLOADED' ? 'Upload' : 'Re-upload'}
                    </Button>
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
                <Input value={bankDetails.accountHolderName} onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))} placeholder="Name as per bank records" />
              </div>
              <div className="space-y-2">
                <Label required>Account Number</Label>
                <Input value={bankDetails.accountNumber} onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))} placeholder="Enter account number" />
              </div>
              <div className="space-y-2">
                <Label required>IFSC Code</Label>
                <Input value={bankDetails.ifscCode} onChange={(e) => setBankDetails(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))} placeholder="e.g., HDFC0001234" maxLength={11} />
              </div>
              <div className="space-y-2">
                <Label required>Bank Name</Label>
                <Input value={bankDetails.bankName} onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))} placeholder="Enter bank name" />
              </div>
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input value={bankDetails.branchName} onChange={(e) => setBankDetails(prev => ({ ...prev, branchName: e.target.value }))} placeholder="Enter branch name (optional)" />
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
              <Button type="submit" isLoading={savingBank}>
                {!savingBank && <Building2 className="h-4 w-4 mr-2" />}Save Bank Details
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard
        </Button>
        {kycStatus?.overall === 'VERIFIED' && kycStatus?.bankDetailsVerified && (
          <Button variant="gradient" onClick={() => navigate('/cwcrf')}>
            Proceed to Submit CWCRF<ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default KycUploadPage;
