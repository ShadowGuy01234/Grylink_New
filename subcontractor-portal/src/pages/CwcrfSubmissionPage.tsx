import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { scApi } from '@/api';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  FileText, CheckCircle2, ArrowRight, ArrowLeft, Send, Building2,
  Receipt, Percent, AlertCircle, FileCheck, XCircle, Info, Target, CreditCard, Upload
} from 'lucide-react';

interface CwcrfFormData {
  sectionA: {
    buyerName: string;
    buyerGstin: string;
    buyerAddress: string;
    buyerContactPerson: string;
    buyerContactPhone: string;
    buyerContactEmail: string;
    buyerCreditRating: string;
  };
  sectionB: {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceAmount: number;
    invoiceDueDate: string;
    purchaseOrderNumber: string;
    purchaseOrderDate: string;
    workDescription: string;
    workCompletionDate: string;
    gstAmount: number;
    netInvoiceAmount: number;
  };
  sectionC: {
    requestedAmount: number;
    requestedTenure: number;
    urgencyLevel: 'NORMAL' | 'URGENT' | 'CRITICAL';
    reasonForFunding: string;
    preferredDisbursementDate: string;
    collateralOffered: string;
    existingLoanDetails: string;
  };
  sectionD: {
    acceptableInterestRateMin: number;
    acceptableInterestRateMax: number;
    preferredRepaymentFrequency: 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY';
    processingFeeAcceptance: boolean;
    maxProcessingFeePercent: number;
    prepaymentPreference: 'WITH_PENALTY' | 'WITHOUT_PENALTY' | 'NO_PREPAYMENT';
  };
}

const initialFormData: CwcrfFormData = {
  sectionA: {
    buyerName: '', buyerGstin: '', buyerAddress: '', buyerContactPerson: '',
    buyerContactPhone: '', buyerContactEmail: '', buyerCreditRating: ''
  },
  sectionB: {
    invoiceNumber: '', invoiceDate: '', invoiceAmount: 0, invoiceDueDate: '',
    purchaseOrderNumber: '', purchaseOrderDate: '', workDescription: '',
    workCompletionDate: '', gstAmount: 0, netInvoiceAmount: 0
  },
  sectionC: {
    requestedAmount: 0, requestedTenure: 30, urgencyLevel: 'NORMAL',
    reasonForFunding: '', preferredDisbursementDate: '', collateralOffered: '',
    existingLoanDetails: ''
  },
  sectionD: {
    acceptableInterestRateMin: 12, acceptableInterestRateMax: 24,
    preferredRepaymentFrequency: 'ONE_TIME', processingFeeAcceptance: true,
    maxProcessingFeePercent: 2, prepaymentPreference: 'WITHOUT_PENALTY'
  }
};

const steps = [
  { id: 1, label: 'Upload Documents', icon: Upload },
  { id: 2, label: 'Buyer & Invoice', icon: Building2 },
  { id: 3, label: 'Request Details', icon: Target },
  { id: 4, label: 'Interest Preference', icon: Percent },
  { id: 5, label: 'Platform Fee', icon: CreditCard },
  { id: 6, label: 'Review & Submit', icon: Send }
];

const CwcrfSubmissionPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CwcrfFormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eligibilityStatus, setEligibilityStatus] = useState<{
    canSubmit: boolean;
    declarationAccepted: boolean;
    kycCompleted: boolean;
    bankDetailsVerified: boolean;
    reasons: string[];
  } | null>(null);
  const [billFiles, setBillFiles] = useState<{ raBill: File | null; wcc: File | null; measurementSheet: File | null }>({ raBill: null, wcc: null, measurementSheet: null });
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    checkEligibilityAndLoadData();
  }, []);

  const checkEligibilityAndLoadData = async () => {
    try {
      const declRes = await scApi.getDeclarationStatus();
      const kycRes = await scApi.getKycStatus();
      const profileRes = await scApi.getProfile();

      const sc = profileRes.data.subContractor;

      const eligibility = {
        canSubmit: false,
        declarationAccepted: declRes.data.declarationAccepted || false,
        kycCompleted: kycRes.data.kycStatus === 'VERIFIED',
        bankDetailsVerified: kycRes.data.bankDetailsVerified || false,
        reasons: [] as string[]
      };

      if (!eligibility.declarationAccepted) eligibility.reasons.push('Seller Declaration not accepted');
      if (!eligibility.kycCompleted) eligibility.reasons.push('KYC verification pending');
      if (!eligibility.bankDetailsVerified) eligibility.reasons.push('Bank details not verified');

      eligibility.canSubmit = eligibility.reasons.length === 0;
      setEligibilityStatus(eligibility);

      if (sc?.company) {
        setFormData(prev => ({
          ...prev,
          sectionA: {
            ...prev.sectionA,
            buyerName: sc.company.name || '',
            buyerGstin: sc.company.gstin || '',
            buyerAddress: sc.company.address || '',
            buyerContactPerson: sc.company.contactPerson || '',
            buyerContactPhone: sc.company.contactPhone || '',
            buyerContactEmail: sc.company.contactEmail || '',
            buyerCreditRating: sc.company.creditRating || 'NOT_RATED'
          }
        }));
      }
    } catch {
      toast.error('Failed to load eligibility data');
    } finally {
      setLoading(false);
    }
  };

  const updateSection = (section: keyof CwcrfFormData, field: string, value: any) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!billFiles.raBill) { toast.error('Please upload the RA Bill (required)'); return false; }
        return true;
      case 2:
        if (!formData.sectionB.invoiceNumber || !formData.sectionB.invoiceAmount || !formData.sectionB.invoiceDate) {
          toast.error('Please fill all required invoice details'); return false;
        }
        return true;
      case 3:
        if (!formData.sectionC.requestedAmount || !formData.sectionC.requestedTenure || !formData.sectionC.reasonForFunding) {
          toast.error('Please fill all required CWC request details'); return false;
        }
        if (formData.sectionC.requestedAmount > formData.sectionB.invoiceAmount) {
          toast.error('Requested amount cannot exceed invoice amount'); return false;
        }
        return true;
      case 4:
        if (formData.sectionD.acceptableInterestRateMin >= formData.sectionD.acceptableInterestRateMax) {
          toast.error('Minimum interest rate must be less than maximum'); return false;
        }
        return true;
      case 5:
        if (!paymentConfirmed) { toast.error('Please confirm the platform fee payment'); return false; }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      if (billFiles.raBill) fd.append('raBill', billFiles.raBill);
      if (billFiles.wcc) fd.append('wcc', billFiles.wcc);
      if (billFiles.measurementSheet) fd.append('measurementSheet', billFiles.measurementSheet);
      fd.append('cwcrfData', JSON.stringify({
        buyerDetails: {
          projectName: formData.sectionA.buyerContactPerson || 'N/A',
          projectLocation: formData.sectionA.buyerAddress || 'N/A'
        },
        invoiceDetails: {
          invoiceNumber: formData.sectionB.invoiceNumber,
          invoiceDate: formData.sectionB.invoiceDate,
          invoiceAmount: formData.sectionB.invoiceAmount,
          expectedPaymentDate: formData.sectionB.invoiceDueDate,
          workDescription: formData.sectionB.workDescription,
          purchaseOrderNumber: formData.sectionB.purchaseOrderNumber,
          purchaseOrderDate: formData.sectionB.purchaseOrderDate,
          workCompletionDate: formData.sectionB.workCompletionDate,
          gstAmount: formData.sectionB.gstAmount,
          netInvoiceAmount: formData.sectionB.netInvoiceAmount
        },
        cwcRequest: {
          requestedAmount: formData.sectionC.requestedAmount,
          requestedTenure: formData.sectionC.requestedTenure,
          urgencyLevel: formData.sectionC.urgencyLevel,
          reasonForFunding: formData.sectionC.reasonForFunding,
          preferredDisbursementDate: formData.sectionC.preferredDisbursementDate || undefined,
          collateralOffered: formData.sectionC.collateralOffered,
          existingLoanDetails: formData.sectionC.existingLoanDetails
        },
        interestPreference: {
          preferenceType: 'RANGE',
          minRate: formData.sectionD.acceptableInterestRateMin,
          maxRate: formData.sectionD.acceptableInterestRateMax,
          preferredRepaymentFrequency: formData.sectionD.preferredRepaymentFrequency,
          processingFeeAcceptance: formData.sectionD.processingFeeAcceptance,
          maxProcessingFeePercent: formData.sectionD.maxProcessingFeePercent,
          prepaymentPreference: formData.sectionD.prepaymentPreference
        }
      }));
      await scApi.submitBillWithCwcrf(fd);
      toast.success('CWCRF submitted successfully!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit CWCRF');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Checking eligibility...</p>
        </motion.div>
      </div>
    );
  }

  if (!eligibilityStatus?.canSubmit) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <Card className="border-amber-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle>CWCRF Submission Not Available</CardTitle>
            <CardDescription>Complete the following requirements to submit a CWC Request Form</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {eligibilityStatus?.reasons.map((reason, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">{reason}</span>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
            {!eligibilityStatus?.declarationAccepted && (
              <Button onClick={() => navigate('/declaration')}>Accept Declaration</Button>
            )}
            {!eligibilityStatus?.kycCompleted && (
              <Button onClick={() => navigate('/kyc')}>Complete KYC</Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">CWC Request Form (CWCRF)</h1>
        <p className="text-gray-500 mt-1">Complete all sections to submit your bill discounting request</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' :
                    'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
                </motion.div>
                <span className={`text-xs mt-2 text-center hidden sm:block ${isActive ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-12 md:w-20 h-0.5 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Upload Documents */}
        {currentStep === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-blue-600" />Upload Supporting Documents</CardTitle>
                <CardDescription>Upload your RA Bill and supporting documents to initiate the CWCRF submission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* RA Bill — Required */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    RA Bill <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-400 ml-1">(Running Account Bill — required)</span>
                  </Label>
                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${billFiles.raBill ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setBillFiles(prev => ({ ...prev, raBill: f }));
                    }} />
                    {billFiles.raBill ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <p className="text-sm font-medium text-green-700">{billFiles.raBill.name}</p>
                        <p className="text-xs text-gray-400">{(billFiles.raBill.size / 1024).toFixed(1)} KB · Click to replace</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload RA Bill</p>
                        <p className="text-xs text-gray-400">PDF, JPG or PNG</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* WCC — Optional */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Work Completion Certificate
                    <span className="text-xs text-gray-400 ml-1">(optional)</span>
                  </Label>
                  <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${billFiles.wcc ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setBillFiles(prev => ({ ...prev, wcc: f }));
                    }} />
                    {billFiles.wcc ? (
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle2 className="h-6 w-6 text-blue-500" />
                        <p className="text-sm font-medium text-blue-700">{billFiles.wcc.name}</p>
                        <p className="text-xs text-gray-400">Click to replace</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <FileCheck className="h-6 w-6 text-gray-300" />
                        <p className="text-sm text-gray-500">Click to upload WCC</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Measurement Sheet — Optional */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Measurement Sheet
                    <span className="text-xs text-gray-400 ml-1">(optional)</span>
                  </Label>
                  <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${billFiles.measurementSheet ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setBillFiles(prev => ({ ...prev, measurementSheet: f }));
                    }} />
                    {billFiles.measurementSheet ? (
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle2 className="h-6 w-6 text-purple-500" />
                        <p className="text-sm font-medium text-purple-700">{billFiles.measurementSheet.name}</p>
                        <p className="text-xs text-gray-400">Click to replace</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <FileText className="h-6 w-6 text-gray-300" />
                        <p className="text-sm text-gray-500">Click to upload Measurement Sheet</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">Only the RA Bill is mandatory. WCC and Measurement Sheet strengthen your application and are recommended if available.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Buyer & Invoice Details */}
        {currentStep === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            {/* Section A */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-600" />Section A - Buyer Details</CardTitle>
                <CardDescription>Auto-populated from your EPC mapping</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Buyer Name</Label>
                    <Input value={formData.sectionA.buyerName} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Buyer GSTIN</Label>
                    <Input value={formData.sectionA.buyerGstin} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input value={formData.sectionA.buyerContactPerson} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input value={formData.sectionA.buyerContactPhone} readOnly className="bg-gray-50" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                    <Textarea value={formData.sectionA.buyerAddress} readOnly className="bg-gray-50 resize-none" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section B */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-green-600" />Section B - Invoice Details</CardTitle>
                <CardDescription>Review and confirm your invoice information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label required>Invoice Number</Label>
                    <Input value={formData.sectionB.invoiceNumber} onChange={(e) => updateSection('sectionB', 'invoiceNumber', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label required>Invoice Date</Label>
                    <Input type="date" value={formData.sectionB.invoiceDate} onChange={(e) => updateSection('sectionB', 'invoiceDate', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label required>Invoice Amount (₹)</Label>
                    <Input type="number" value={formData.sectionB.invoiceAmount} onChange={(e) => updateSection('sectionB', 'invoiceAmount', parseFloat(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" value={formData.sectionB.invoiceDueDate} onChange={(e) => updateSection('sectionB', 'invoiceDueDate', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>PO Number</Label>
                    <Input value={formData.sectionB.purchaseOrderNumber} onChange={(e) => updateSection('sectionB', 'purchaseOrderNumber', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Work Completion Date</Label>
                    <Input type="date" value={formData.sectionB.workCompletionDate} onChange={(e) => updateSection('sectionB', 'workCompletionDate', e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Work Description</Label>
                    <Textarea value={formData.sectionB.workDescription} onChange={(e) => updateSection('sectionB', 'workDescription', e.target.value)} placeholder="Describe the work completed" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: CWC Request Details */}
        {currentStep === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-purple-600" />Section C - CWC Request Details</CardTitle>
                <CardDescription>Specify your funding requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label required>Requested Amount (₹)</Label>
                    <Input type="number" value={formData.sectionC.requestedAmount} onChange={(e) => updateSection('sectionC', 'requestedAmount', parseFloat(e.target.value))} />
                    <p className="text-xs text-gray-500">Max: ₹{formData.sectionB.invoiceAmount?.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label required>Requested Tenure (days)</Label>
                    <Input type="number" value={formData.sectionC.requestedTenure} onChange={(e) => updateSection('sectionC', 'requestedTenure', parseInt(e.target.value))} min={7} max={180} />
                  </div>
                  <div className="space-y-2">
                    <Label>Urgency Level</Label>
                    <Select value={formData.sectionC.urgencyLevel} onChange={(e) => updateSection('sectionC', 'urgencyLevel', e.target.value)}>
                      <option value="NORMAL">Normal</option>
                      <option value="URGENT">Urgent</option>
                      <option value="CRITICAL">Critical</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Disbursement Date</Label>
                    <Input type="date" value={formData.sectionC.preferredDisbursementDate} onChange={(e) => updateSection('sectionC', 'preferredDisbursementDate', e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label required>Reason for Funding</Label>
                    <Textarea value={formData.sectionC.reasonForFunding} onChange={(e) => updateSection('sectionC', 'reasonForFunding', e.target.value)} placeholder="Explain why you need this funding" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Existing Loan Details (if any)</Label>
                    <Textarea value={formData.sectionC.existingLoanDetails} onChange={(e) => updateSection('sectionC', 'existingLoanDetails', e.target.value)} placeholder="Details of any existing loans or credit facilities" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Interest Preference */}
        {currentStep === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5 text-amber-600" />Section D - Interest Preference</CardTitle>
                <CardDescription>Set your acceptable terms for funding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label required>Minimum Acceptable Rate (% p.a.)</Label>
                    <Input type="number" value={formData.sectionD.acceptableInterestRateMin} onChange={(e) => updateSection('sectionD', 'acceptableInterestRateMin', parseFloat(e.target.value))} step="0.5" min={0} max={50} />
                  </div>
                  <div className="space-y-2">
                    <Label required>Maximum Acceptable Rate (% p.a.)</Label>
                    <Input type="number" value={formData.sectionD.acceptableInterestRateMax} onChange={(e) => updateSection('sectionD', 'acceptableInterestRateMax', parseFloat(e.target.value))} step="0.5" min={0} max={50} />
                  </div>
                  <div className="space-y-2">
                    <Label>Repayment Frequency</Label>
                    <Select value={formData.sectionD.preferredRepaymentFrequency} onChange={(e) => updateSection('sectionD', 'preferredRepaymentFrequency', e.target.value)}>
                      <option value="ONE_TIME">One Time</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prepayment Preference</Label>
                    <Select value={formData.sectionD.prepaymentPreference} onChange={(e) => updateSection('sectionD', 'prepaymentPreference', e.target.value)}>
                      <option value="WITHOUT_PENALTY">Without Penalty</option>
                      <option value="WITH_PENALTY">With Penalty</option>
                      <option value="NO_PREPAYMENT">No Prepayment</option>
                    </Select>
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.sectionD.processingFeeAcceptance} onChange={(e) => updateSection('sectionD', 'processingFeeAcceptance', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-gray-700">I accept a processing fee for this funding</span>
                    </label>
                    {formData.sectionD.processingFeeAcceptance && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pl-8">
                        <Label>Maximum Processing Fee (%)</Label>
                        <Input type="number" value={formData.sectionD.maxProcessingFeePercent} onChange={(e) => updateSection('sectionD', 'maxProcessingFeePercent', parseFloat(e.target.value))} step="0.5" min={0} max={5} className="max-w-xs" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 5: Platform Fee Payment */}
        {currentStep === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-indigo-600" />Platform Fee Payment</CardTitle>
                <CardDescription>A one-time non-refundable platform processing fee is required to submit your CWCRF</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fee summary */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
                  <p className="text-4xl font-bold text-indigo-700 mb-1">₹1,000</p>
                  <p className="text-sm text-indigo-600 font-medium">Platform Processing Fee (incl. GST)</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <Info className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">This fee covers platform processing, document verification coordination, and NBFC matchmaking services. It is non-refundable once the CWCRF is submitted.</p>
                  </div>
                </div>

                {/* Payment button / stub */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                  <h4 className="font-semibold text-gray-900">Pay via UPI / Net Banking</h4>
                  <button
                    type="button"
                    onClick={() => setPaymentConfirmed(true)}
                    disabled={paymentConfirmed}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-colors ${
                      paymentConfirmed ? 'bg-green-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                    }`}
                  >
                    {paymentConfirmed ? '✓ Payment Confirmed' : 'Pay ₹1,000 Now'}
                  </button>
                  {!paymentConfirmed && (
                    <p className="text-xs text-gray-400 text-center">You will be redirected to the payment gateway</p>
                  )}
                </div>

                {/* Manual confirmation checkbox */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentConfirmed}
                    onChange={(e) => setPaymentConfirmed(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-700 text-sm">I confirm that I have paid the platform processing fee of <strong>₹1,000</strong></span>
                </label>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 6: Review & Submit */}
        {currentStep === 6 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5 text-green-600" />Review Your CWCRF</CardTitle>
                <CardDescription>Please verify all details before submission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary Sections */}
                {[
                  { title: 'Buyer Details', icon: Building2, items: [
                    { label: 'Buyer', value: formData.sectionA.buyerName },
                    { label: 'GSTIN', value: formData.sectionA.buyerGstin },
                    { label: 'Contact', value: formData.sectionA.buyerContactPerson }
                  ]},
                  { title: 'Invoice Details', icon: Receipt, items: [
                    { label: 'Invoice #', value: formData.sectionB.invoiceNumber },
                    { label: 'Amount', value: `₹${formData.sectionB.invoiceAmount?.toLocaleString()}` },
                    { label: 'Date', value: formData.sectionB.invoiceDate }
                  ]},
                  { title: 'CWC Request', icon: Target, items: [
                    { label: 'Requested Amount', value: `₹${formData.sectionC.requestedAmount?.toLocaleString()}` },
                    { label: 'Tenure', value: `${formData.sectionC.requestedTenure} days` },
                    { label: 'Urgency', value: formData.sectionC.urgencyLevel }
                  ]},
                  { title: 'Interest Preference', icon: Percent, items: [
                    { label: 'Rate Range', value: `${formData.sectionD.acceptableInterestRateMin}% - ${formData.sectionD.acceptableInterestRateMax}% p.a.` },
                    { label: 'Repayment', value: formData.sectionD.preferredRepaymentFrequency.replace(/_/g, ' ') },
                    { label: 'Processing Fee', value: formData.sectionD.processingFeeAcceptance ? `Up to ${formData.sectionD.maxProcessingFeePercent}%` : 'Not Accepted' }
                  ]}
                ].map((section, idx) => {
                  const Icon = section.icon;
                  return (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                        <Icon className="h-4 w-4 text-gray-500" />{section.title}
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        {section.items.map((item, i) => (
                          <div key={i}>
                            <p className="text-xs text-gray-500">{item.label}</p>
                            <p className="font-medium text-gray-900">{item.value || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Declaration */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Declaration</h4>
                      <p className="text-sm text-blue-700">By submitting this CWCRF, I declare that:</p>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                        <li>All information provided is true and accurate</li>
                        <li>The invoice represents actual work completed</li>
                        <li>I authorize sharing this information with NBFC partners</li>
                        <li>Final terms are subject to NBFC approval and due diligence</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {currentStep > 1 ? (
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeft className="h-4 w-4 mr-2" />Previous
          </Button>
        ) : (
          <div />
        )}
        {currentStep < 6 ? (
          <Button onClick={nextStep}>
            Next<ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button variant="gradient" onClick={handleSubmit} isLoading={submitting}>
            {!submitting && (
              <>
                <Send className="h-4 w-4 mr-2" />Submit CWCRF
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default CwcrfSubmissionPage;
