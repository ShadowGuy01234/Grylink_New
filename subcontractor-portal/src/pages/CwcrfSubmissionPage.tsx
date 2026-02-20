import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { scApi } from '@/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  FileText, CheckCircle2, ArrowRight, ArrowLeft, Send, Building2,
  Receipt, Percent, AlertCircle, FileCheck, XCircle, Info, Target,
  Upload, IndianRupee, Calendar, Hash, Clock, PenLine, Zap, RotateCcw,
  ChevronRight, Shield,
} from 'lucide-react';

/* ─────────────── Types ─────────────── */
interface CwcrfFormData {
  sectionA: {
    buyerName: string; buyerGstin: string; buyerAddress: string;
    buyerContactPerson: string; buyerContactPhone: string;
    buyerContactEmail: string; buyerCreditRating: string;
  };
  sectionB: {
    invoiceNumber: string; invoiceDate: string; invoiceAmount: number;
    invoiceDueDate: string; purchaseOrderNumber: string; purchaseOrderDate: string;
    workDescription: string; workCompletionDate: string;
    gstAmount: number; netInvoiceAmount: number;
  };
  sectionC: {
    requestedAmount: number; requestedTenure: number;
    urgencyLevel: 'NORMAL' | 'URGENT' | 'CRITICAL';
    reasonForFunding: string; preferredDisbursementDate: string;
    collateralOffered: string; existingLoanDetails: string;
  };
  sectionD: {
    acceptableInterestRateMin: number; acceptableInterestRateMax: number;
    preferredRepaymentFrequency: 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY';
    processingFeeAcceptance: boolean; maxProcessingFeePercent: number;
    prepaymentPreference: 'WITH_PENALTY' | 'WITHOUT_PENALTY' | 'NO_PREPAYMENT';
  };
}

const initialFormData: CwcrfFormData = {
  sectionA: { buyerName: '', buyerGstin: '', buyerAddress: '', buyerContactPerson: '', buyerContactPhone: '', buyerContactEmail: '', buyerCreditRating: '' },
  sectionB: { invoiceNumber: '', invoiceDate: '', invoiceAmount: 0, invoiceDueDate: '', purchaseOrderNumber: '', purchaseOrderDate: '', workDescription: '', workCompletionDate: '', gstAmount: 0, netInvoiceAmount: 0 },
  sectionC: { requestedAmount: 0, requestedTenure: 30, urgencyLevel: 'NORMAL', reasonForFunding: '', preferredDisbursementDate: '', collateralOffered: '', existingLoanDetails: '' },
  sectionD: { acceptableInterestRateMin: 12, acceptableInterestRateMax: 24, preferredRepaymentFrequency: 'ONE_TIME', processingFeeAcceptance: true, maxProcessingFeePercent: 2, prepaymentPreference: 'WITHOUT_PENALTY' },
};

const steps = [
  { id: 1, label: 'Documents',       icon: Upload },
  { id: 2, label: 'Buyer & Invoice', icon: Building2 },
  { id: 3, label: 'Request',         icon: Target },
  { id: 4, label: 'Interest',        icon: Percent },
  { id: 5, label: 'Review',          icon: Send },
];

/* ─────────────── Small helpers ─────────────── */
const FieldRow = ({ children }: { children: React.ReactNode }) => (
  <div className="grid sm:grid-cols-2 gap-4">{children}</div>
);

const Field = ({ label, required, hint, col2, children }: {
  label: string; required?: boolean; hint?: string; col2?: boolean; children: React.ReactNode;
}) => (
  <div className={`flex flex-col gap-1.5 ${col2 ? 'sm:col-span-2' : ''}`}>
    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
      {hint && <span className="text-[11px] text-gray-400 font-normal ml-1">{hint}</span>}
    </Label>
    {children}
  </div>
);

const SectionHead = ({ accent, icon: Icon, title, subtitle, iconColor }: {
  accent: string; icon: any; title: string; subtitle: string; iconColor: string;
}) => (
  <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-100">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
      <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
    </div>
    <div>
      <p className="font-semibold text-gray-900 leading-tight">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

/* ─────────────── File Upload Card ─────────────── */
const UploadCard = ({ label, hint, required, file, colorClass, onChange }: {
  label: string; hint?: string; required?: boolean;
  file: File | null; colorClass: string;
  onChange: (f: File | null) => void;
}) => (
  <label className={`group relative flex items-center gap-4 p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200
    ${file ? colorClass + ' border-opacity-60' : 'border-gray-200 bg-gray-50/60 hover:border-gray-300 hover:bg-white'}`}>
    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${file ? 'bg-white/70' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
      {file
        ? <CheckCircle2 className="h-5 w-5 text-green-600" />
        : <Upload className="h-5 w-5 text-gray-400" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 flex-wrap">
        {label}
        {required
          ? <span className="text-xs font-normal text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md leading-none">Required</span>
          : <span className="text-xs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md leading-none">Optional</span>}
      </p>
      {file ? (
        <p className="text-xs text-gray-600 mt-0.5 truncate">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>
      ) : (
        <p className="text-xs text-gray-400 mt-0.5">{hint || 'PDF, JPG or PNG — max 5 MB'}</p>
      )}
    </div>
    {file ? (
      <button type="button" onClick={(e) => { e.preventDefault(); onChange(null); }}
        className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    ) : (
      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400 shrink-0 transition-colors" />
    )}
  </label>
);

/* ─────────────── Review block ─────────────── */
const ReviewBlock = ({ icon: Icon, title, headerBg, children }: {
  icon: any; title: string; headerBg: string; children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-gray-200 overflow-hidden">
    <div className={`flex items-center gap-2.5 px-5 py-3 ${headerBg}`}>
      <Icon className="h-4 w-4 opacity-70" />
      <p className="font-semibold text-sm">{title}</p>
    </div>
    <div className="px-5 py-4 grid sm:grid-cols-3 gap-x-6 gap-y-3 bg-white">{children}</div>
  </div>
);

const ReviewItem = ({ label, value }: { label: string; value?: string | number }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-900 break-words">{value || '—'}</p>
  </div>
);

/* ─────────────── Main page ─────────────── */
const CwcrfSubmissionPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CwcrfFormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eligibilityStatus, setEligibilityStatus] = useState<{
    canSubmit: boolean; declarationAccepted: boolean;
    kycCompleted: boolean; bankDetailsVerified: boolean; reasons: string[];
  } | null>(null);
  const [billFiles, setBillFiles] = useState<{
    raBill: File | null; wcc: File | null; measurementSheet: File | null;
  }>({ raBill: null, wcc: null, measurementSheet: null });

  useEffect(() => { checkEligibilityAndLoadData(); }, []);

  const checkEligibilityAndLoadData = async () => {
    try {
      const [declRes, kycRes, profileRes] = await Promise.all([
        scApi.getDeclarationStatus(),
        scApi.getKycStatus(),
        scApi.getProfile(),
      ]);
      const sc = profileRes.data.subContractor;
      const eligibility = {
        canSubmit: false,
        declarationAccepted: declRes.data.declarationAccepted || false,
        kycCompleted: kycRes.data.overall === 'COMPLETED',
        bankDetailsVerified: kycRes.data.bankDetailsVerified || false,
        reasons: [] as string[],
      };
      if (!eligibility.declarationAccepted) eligibility.reasons.push('Seller Declaration not accepted');
      if (!eligibility.kycCompleted)        eligibility.reasons.push('KYC verification pending');
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
            buyerCreditRating: sc.company.creditRating || 'NOT_RATED',
          },
        }));
      }
    } catch {
      toast.error('Failed to load eligibility data');
    } finally {
      setLoading(false);
    }
  };

  const update = (section: keyof CwcrfFormData, field: string, value: any) =>
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));

  const validate = (step: number): boolean => {
    if (step === 1 && !billFiles.raBill) {
      toast.error('Please upload the RA Bill (required)'); return false;
    }
    if (step === 2 && (!formData.sectionB.invoiceNumber || !formData.sectionB.invoiceAmount || !formData.sectionB.invoiceDate)) {
      toast.error('Please fill all required invoice fields'); return false;
    }
    if (step === 3) {
      if (!formData.sectionC.requestedAmount || !formData.sectionC.requestedTenure || !formData.sectionC.reasonForFunding) {
        toast.error('Please fill all required funding request fields'); return false;
      }
      if (formData.sectionC.requestedAmount > formData.sectionB.invoiceAmount) {
        toast.error('Requested amount cannot exceed invoice amount'); return false;
      }
    }
    if (step === 4 && formData.sectionD.acceptableInterestRateMin >= formData.sectionD.acceptableInterestRateMax) {
      toast.error('Minimum rate must be less than maximum rate'); return false;
    }
    return true;
  };

  const next = () => { if (validate(currentStep)) setCurrentStep(p => Math.min(p + 1, 5)); };
  const prev = () => setCurrentStep(p => Math.max(p - 1, 1));

  const handleSubmit = async () => {
    if (!validate(4)) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      if (billFiles.raBill)          fd.append('raBill', billFiles.raBill);
      if (billFiles.wcc)             fd.append('wcc', billFiles.wcc);
      if (billFiles.measurementSheet) fd.append('measurementSheet', billFiles.measurementSheet);
      fd.append('cwcrfData', JSON.stringify({
        buyerDetails: { projectName: formData.sectionA.buyerContactPerson || 'N/A', projectLocation: formData.sectionA.buyerAddress || 'N/A' },
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
          netInvoiceAmount: formData.sectionB.netInvoiceAmount,
        },
        cwcRequest: {
          requestedAmount: formData.sectionC.requestedAmount,
          requestedTenure: formData.sectionC.requestedTenure,
          urgencyLevel: formData.sectionC.urgencyLevel,
          reasonForFunding: formData.sectionC.reasonForFunding,
          preferredDisbursementDate: formData.sectionC.preferredDisbursementDate || undefined,
          collateralOffered: formData.sectionC.collateralOffered,
          existingLoanDetails: formData.sectionC.existingLoanDetails,
        },
        interestPreference: {
          preferenceType: 'RANGE',
          minRate: formData.sectionD.acceptableInterestRateMin,
          maxRate: formData.sectionD.acceptableInterestRateMax,
          preferredRepaymentFrequency: formData.sectionD.preferredRepaymentFrequency,
          processingFeeAcceptance: formData.sectionD.processingFeeAcceptance,
          maxProcessingFeePercent: formData.sectionD.maxProcessingFeePercent,
          prepaymentPreference: formData.sectionD.prepaymentPreference,
        },
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

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Checking eligibility…</p>
        </motion.div>
      </div>
    );
  }

  /* ── Not Eligible ── */
  if (!eligibilityStatus?.canSubmit) {
    const actionMap: Record<string, { label: string; path: string; icon: any }> = {
      'Seller Declaration not accepted': { label: 'Accept Declaration', path: '/declaration', icon: PenLine },
      'KYC verification pending':        { label: 'Complete KYC',        path: '/kyc',         icon: Shield },
      'Bank details not verified':       { label: 'Update Bank Details', path: '/kyc',         icon: IndianRupee },
    };
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto space-y-4 pt-10">
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Action Required</h2>
          <p className="text-sm text-gray-500">Complete the steps below to unlock CWCRF submission</p>
        </div>
        <div className="space-y-3">
          {eligibilityStatus?.reasons.map((reason, idx) => {
            const action = actionMap[reason];
            return (
              <div key={idx} className="flex items-center justify-between gap-3 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-800">{reason}</p>
                </div>
                {action && (
                  <Button size="sm" variant="outline" onClick={() => navigate(action.path)} className="shrink-0 text-xs gap-1">
                    <action.icon className="h-3.5 w-3.5" />{action.label}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        <Button variant="ghost" className="w-full text-gray-400 mt-2" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />Back to Dashboard
        </Button>
      </motion.div>
    );
  }

  /* ── Form ── */
  const progressPct = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto pb-28">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3 py-4">
        <button onClick={() => navigate('/')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">CWC Request Form <span className="text-gray-400 font-normal text-base">(CWCRF)</span></h1>
          <p className="text-xs text-gray-400">Working capital financing against your RA Bill</p>
        </div>
      </div>

      {/* ── Stepper card ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
        <div className="relative h-1.5 bg-gray-100 rounded-full mb-5 overflow-hidden">
          <motion.div className="absolute inset-y-0 left-0 bg-blue-600 rounded-full"
            animate={{ width: `${progressPct}%` }} transition={{ duration: 0.3, ease: 'easeInOut' }} />
        </div>
        <div className="flex justify-between">
          {steps.map((s) => {
            const Icon = s.icon;
            const done   = currentStep > s.id;
            const active = currentStep === s.id;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                  ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-[10px] text-center leading-tight font-medium hidden sm:block
                  ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step content ── */}
      <AnimatePresence mode="wait">

        {/* Step 1 — Documents */}
        {currentStep === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
            <SectionHead accent="bg-blue-50" iconColor="text-blue-600" icon={Upload}
              title="Upload Supporting Documents"
              subtitle="Attach your RA Bill and any supplementary documents" />
            <div className="space-y-3">
              <UploadCard label="Running Account (RA) Bill" required hint="PDF, JPG or PNG — max 5 MB"
                file={billFiles.raBill} colorClass="border-green-300 bg-green-50/50"
                onChange={(f) => setBillFiles(p => ({ ...p, raBill: f }))} />
              <UploadCard label="Work Completion Certificate" hint="Strengthens your application — PDF, JPG or PNG"
                file={billFiles.wcc} colorClass="border-blue-300 bg-blue-50/50"
                onChange={(f) => setBillFiles(p => ({ ...p, wcc: f }))} />
              <UploadCard label="Measurement Sheet" hint="Site measurement record — PDF, JPG or PNG"
                file={billFiles.measurementSheet} colorClass="border-violet-300 bg-violet-50/50"
                onChange={(f) => setBillFiles(p => ({ ...p, measurementSheet: f }))} />
            </div>
            <div className="flex items-start gap-3 rounded-xl p-4 bg-amber-50 border border-amber-200 text-amber-800">
              <Info className="h-4 w-4 shrink-0 mt-0.5 opacity-70" />
              <p className="text-sm">Only the RA Bill is mandatory. WCC and Measurement Sheet are optional but improve approval chances and may lead to better financing rates.</p>
            </div>
          </motion.div>
        )}

        {/* Step 2 — Buyer & Invoice */}
        {currentStep === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }} className="space-y-4">

            {/* Section A — Buyer */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <SectionHead accent="bg-blue-50" iconColor="text-blue-600" icon={Building2}
                title="Section A — Buyer Details"
                subtitle="Auto-populated from your EPC mapping · Read-only" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Buyer / EPC Company">
                  <Input value={formData.sectionA.buyerName} readOnly className="bg-gray-50 text-gray-500 cursor-default" />
                </Field>
                <Field label="GSTIN">
                  <Input value={formData.sectionA.buyerGstin} readOnly className="bg-gray-50 text-gray-500 cursor-default font-mono text-sm" />
                </Field>
                <Field label="Contact Person">
                  <Input value={formData.sectionA.buyerContactPerson} readOnly className="bg-gray-50 text-gray-500 cursor-default" />
                </Field>
                <Field label="Contact Phone">
                  <Input value={formData.sectionA.buyerContactPhone} readOnly className="bg-gray-50 text-gray-500 cursor-default" />
                </Field>
                <Field label="Address" col2>
                  <Textarea value={formData.sectionA.buyerAddress} readOnly className="bg-gray-50 text-gray-500 cursor-default resize-none" rows={2} />
                </Field>
              </div>
            </div>

            {/* Section B — Invoice */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <SectionHead accent="bg-green-50" iconColor="text-green-600" icon={Receipt}
                title="Section B — Invoice Details"
                subtitle="Enter the invoice you are raising for bill discounting" />
              <div className="space-y-4">
                <FieldRow>
                  <Field label="Invoice Number" required>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input value={formData.sectionB.invoiceNumber} onChange={(e) => update('sectionB', 'invoiceNumber', e.target.value)} placeholder="INV-2025-001" className="pl-8" />
                    </div>
                  </Field>
                  <Field label="Invoice Date" required>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input type="date" value={formData.sectionB.invoiceDate} onChange={(e) => update('sectionB', 'invoiceDate', e.target.value)} className="pl-8" />
                    </div>
                  </Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Invoice Amount" required hint="(₹)">
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input type="number" value={formData.sectionB.invoiceAmount || ''} onChange={(e) => update('sectionB', 'invoiceAmount', parseFloat(e.target.value) || 0)} placeholder="0" className="pl-8" />
                    </div>
                  </Field>
                  <Field label="Payment Due Date">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input type="date" value={formData.sectionB.invoiceDueDate} onChange={(e) => update('sectionB', 'invoiceDueDate', e.target.value)} className="pl-8" />
                    </div>
                  </Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Purchase Order Number">
                    <Input value={formData.sectionB.purchaseOrderNumber} onChange={(e) => update('sectionB', 'purchaseOrderNumber', e.target.value)} placeholder="PO-XXXX" />
                  </Field>
                  <Field label="Work Completion Date">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input type="date" value={formData.sectionB.workCompletionDate} onChange={(e) => update('sectionB', 'workCompletionDate', e.target.value)} className="pl-8" />
                    </div>
                  </Field>
                </FieldRow>
                <Field label="Work Description" col2>
                  <Textarea value={formData.sectionB.workDescription} onChange={(e) => update('sectionB', 'workDescription', e.target.value)} placeholder="Briefly describe the work / services completed…" rows={3} className="resize-none" />
                </Field>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3 — CWC Request */}
        {currentStep === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <SectionHead accent="bg-violet-50" iconColor="text-violet-600" icon={Target}
              title="Section C — CWC Request Details"
              subtitle="Tell us how much funding you need and when" />
            <div className="space-y-4">
              <FieldRow>
                <Field label="Requested Amount" required hint="(₹)">
                  <div>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <Input type="number" value={formData.sectionC.requestedAmount || ''} onChange={(e) => update('sectionC', 'requestedAmount', parseFloat(e.target.value) || 0)} placeholder="0" className="pl-8" />
                    </div>
                    {formData.sectionB.invoiceAmount > 0 && (
                      <p className="text-[11px] text-gray-400 mt-1">Invoice value: ₹{Number(formData.sectionB.invoiceAmount).toLocaleString('en-IN')}</p>
                    )}
                  </div>
                </Field>
                <Field label="Tenure" required hint="(days, 7–180)">
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input type="number" value={formData.sectionC.requestedTenure} onChange={(e) => update('sectionC', 'requestedTenure', parseInt(e.target.value))} min={7} max={180} className="pl-8" />
                  </div>
                </Field>
              </FieldRow>
              <FieldRow>
                <Field label="Urgency Level">
                  <Select value={formData.sectionC.urgencyLevel} onChange={(e) => update('sectionC', 'urgencyLevel', e.target.value)}>
                    <option value="NORMAL">🟢  Normal</option>
                    <option value="URGENT">🟡  Urgent</option>
                    <option value="CRITICAL">🔴  Critical</option>
                  </Select>
                </Field>
                <Field label="Preferred Disbursement Date">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input type="date" value={formData.sectionC.preferredDisbursementDate} onChange={(e) => update('sectionC', 'preferredDisbursementDate', e.target.value)} className="pl-8" />
                  </div>
                </Field>
              </FieldRow>
              <Field label="Reason for Funding" required col2>
                <Textarea value={formData.sectionC.reasonForFunding} onChange={(e) => update('sectionC', 'reasonForFunding', e.target.value)} placeholder="e.g. Need working capital for next site mobilisation, pay subcontractors, purchase materials…" rows={3} className="resize-none" />
              </Field>
              <Field label="Existing Loan / Credit Details" hint="(optional)" col2>
                <Textarea value={formData.sectionC.existingLoanDetails} onChange={(e) => update('sectionC', 'existingLoanDetails', e.target.value)} placeholder="List any active loans, credit limits, or overdraft facilities…" rows={2} className="resize-none" />
              </Field>
            </div>
          </motion.div>
        )}

        {/* Step 4 — Interest */}
        {currentStep === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <SectionHead accent="bg-amber-50" iconColor="text-amber-600" icon={Percent}
              title="Section D — Interest & Repayment Preference"
              subtitle="Set the financing terms you're comfortable with" />
            <div className="space-y-5">

              {/* Rate range */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-4">Acceptable Interest Rate Range (% p.a.)</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Minimum Rate" required>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">%</span>
                      <Input type="number" value={formData.sectionD.acceptableInterestRateMin} onChange={(e) => update('sectionD', 'acceptableInterestRateMin', parseFloat(e.target.value))} step="0.5" min={0} max={50} className="pl-7" />
                    </div>
                  </Field>
                  <Field label="Maximum Rate" required>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">%</span>
                      <Input type="number" value={formData.sectionD.acceptableInterestRateMax} onChange={(e) => update('sectionD', 'acceptableInterestRateMax', parseFloat(e.target.value))} step="0.5" min={0} max={50} className="pl-7" />
                    </div>
                  </Field>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[11px] font-medium">
                  <span className="text-blue-700">{formData.sectionD.acceptableInterestRateMin}%</span>
                  <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (formData.sectionD.acceptableInterestRateMax / 50) * 100)}%`, marginLeft: `${Math.min(90, (formData.sectionD.acceptableInterestRateMin / 50) * 100)}%` }} />
                  </div>
                  <span className="text-indigo-700">{formData.sectionD.acceptableInterestRateMax}%</span>
                </div>
              </div>

              <FieldRow>
                <Field label="Repayment Frequency">
                  <Select value={formData.sectionD.preferredRepaymentFrequency} onChange={(e) => update('sectionD', 'preferredRepaymentFrequency', e.target.value)}>
                    <option value="ONE_TIME">One Time (bullet)</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                  </Select>
                </Field>
                <Field label="Prepayment Preference">
                  <Select value={formData.sectionD.prepaymentPreference} onChange={(e) => update('sectionD', 'prepaymentPreference', e.target.value)}>
                    <option value="WITHOUT_PENALTY">Without Penalty</option>
                    <option value="WITH_PENALTY">With Penalty (accepted)</option>
                    <option value="NO_PREPAYMENT">No Prepayment</option>
                  </Select>
                </Field>
              </FieldRow>

              {/* Processing fee toggle */}
              <div className={`rounded-2xl border transition-colors p-4 ${formData.sectionD.processingFeeAcceptance ? 'border-green-200 bg-green-50/40' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => update('sectionD', 'processingFeeAcceptance', !formData.sectionD.processingFeeAcceptance)}>
                  <div className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors duration-200 ${formData.sectionD.processingFeeAcceptance ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${formData.sectionD.processingFeeAcceptance ? 'left-5' : 'left-1'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">I accept a processing fee</p>
                    <p className="text-xs text-gray-500">NBFCs typically charge 0.5–2% of the funded amount</p>
                  </div>
                </div>
                <AnimatePresence>
                  {formData.sectionD.processingFeeAcceptance && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                      <Field label="Maximum Processing Fee you will accept (%)">
                        <div className="relative max-w-[160px]">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">%</span>
                          <Input type="number" value={formData.sectionD.maxProcessingFeePercent} onChange={(e) => update('sectionD', 'maxProcessingFeePercent', parseFloat(e.target.value))} step="0.5" min={0} max={5} className="pl-7" />
                        </div>
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 5 — Review */}
        {currentStep === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }} className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
              <SectionHead accent="bg-green-50" iconColor="text-green-600" icon={FileCheck}
                title="Review & Submit"
                subtitle="Verify all details below before final submission" />

              {/* Docs row */}
              <div className="flex flex-wrap gap-2 pb-5 border-b border-gray-100">
                {[
                  { label: 'RA Bill', file: billFiles.raBill },
                  { label: 'WCC', file: billFiles.wcc },
                  { label: 'Measurement Sheet', file: billFiles.measurementSheet },
                ].map(({ label, file }) => (
                  <span key={label} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium
                    ${file ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                    {file ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {label}{!file && ' — not uploaded'}
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                <ReviewBlock icon={Building2} title="Buyer Details" headerBg="bg-blue-50 text-blue-800">
                  <ReviewItem label="Company" value={formData.sectionA.buyerName} />
                  <ReviewItem label="GSTIN" value={formData.sectionA.buyerGstin} />
                  <ReviewItem label="Contact" value={formData.sectionA.buyerContactPerson} />
                </ReviewBlock>
                <ReviewBlock icon={Receipt} title="Invoice" headerBg="bg-green-50 text-green-800">
                  <ReviewItem label="Invoice #" value={formData.sectionB.invoiceNumber} />
                  <ReviewItem label="Amount" value={`₹${Number(formData.sectionB.invoiceAmount).toLocaleString('en-IN')}`} />
                  <ReviewItem label="Date" value={formData.sectionB.invoiceDate} />
                </ReviewBlock>
                <ReviewBlock icon={Target} title="CWC Request" headerBg="bg-violet-50 text-violet-800">
                  <ReviewItem label="Requested" value={`₹${Number(formData.sectionC.requestedAmount).toLocaleString('en-IN')}`} />
                  <ReviewItem label="Tenure" value={`${formData.sectionC.requestedTenure} days`} />
                  <ReviewItem label="Urgency" value={formData.sectionC.urgencyLevel} />
                </ReviewBlock>
                <ReviewBlock icon={Percent} title="Interest Preference" headerBg="bg-amber-50 text-amber-800">
                  <ReviewItem label="Rate Range" value={`${formData.sectionD.acceptableInterestRateMin}% – ${formData.sectionD.acceptableInterestRateMax}% p.a.`} />
                  <ReviewItem label="Repayment" value={formData.sectionD.preferredRepaymentFrequency.replace(/_/g, ' ')} />
                  <ReviewItem label="Processing Fee" value={formData.sectionD.processingFeeAcceptance ? `Up to ${formData.sectionD.maxProcessingFeePercent}%` : 'Not accepted'} />
                </ReviewBlock>
              </div>
            </div>

            {/* Declaration */}
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 mb-3">Submission Declaration</p>
                  <ul className="space-y-2">
                    {[
                      'All information provided is true and accurate to the best of my knowledge',
                      'The invoice represents actual work completed and approved by the buyer',
                      'I authorise Gryork to share this information with NBFC financing partners',
                      'Final disbursement terms are subject to NBFC approval and due diligence',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Sticky footer nav ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <Button variant="outline" size="sm" onClick={prev} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />Previous
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1.5 text-gray-400">
              <ArrowLeft className="h-4 w-4" />Dashboard
            </Button>
          )}

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {steps.map((s) => (
              <div key={s.id} className={`rounded-full transition-all duration-200 ${
                currentStep === s.id ? 'w-5 h-2 bg-blue-600' :
                currentStep > s.id  ? 'w-2 h-2 bg-green-500' :
                                      'w-2 h-2 bg-gray-200'}`} />
            ))}
          </div>

          {currentStep < 5 ? (
            <Button size="sm" onClick={next} className="gap-1.5">
              Next<ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleSubmit} disabled={submitting}
              className="gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-70 min-w-[130px]">
              {submitting
                ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                : <><Zap className="h-4 w-4" />Submit CWCRF</>}
            </Button>
          )}
        </div>
      </div>

    </motion.div>
  );
};

export default CwcrfSubmissionPage;
