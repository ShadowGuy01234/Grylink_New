import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { scApi } from '@/api';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText, CheckCircle2, ArrowLeft, Shield, AlertTriangle, Scale, Eye,
  UserCheck, Calendar, Lock
} from 'lucide-react';

const SellerDeclarationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declarationStatus, setDeclarationStatus] = useState<{ accepted: boolean; acceptedAt?: string } | null>(null);
  const [checkboxes, setCheckboxes] = useState({ accuracy: false, authorization: false, compliance: false, acknowledgment: false });

  useEffect(() => { checkDeclarationStatus(); }, []);

  const checkDeclarationStatus = async () => {
    try {
      const res = await scApi.getDeclarationStatus();
      setDeclarationStatus({ accepted: res.data.declarationAccepted || false, acceptedAt: res.data.declarationAcceptedAt });
    } catch {
      console.error('Failed to check declaration status');
    } finally {
      setLoading(false);
    }
  };

  const allChecked = Object.values(checkboxes).every(v => v);

  const handleAccept = async () => {
    if (!allChecked) { toast.error('Please accept all terms to continue'); return; }
    setAccepting(true);
    try {
      await scApi.acceptDeclaration();
      toast.success('Declaration accepted successfully!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to accept declaration');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (declarationStatus?.accepted) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto mt-20">
        <Card className="text-center">
          <CardContent className="pt-8 pb-6">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Declaration Already Accepted</h2>
            <p className="text-gray-500 mb-6 flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              {declarationStatus.acceptedAt && `Accepted on ${new Date(declarationStatus.acceptedAt).toLocaleDateString()}`}
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const sections = [
    {
      id: 'accuracy',
      icon: FileText,
      title: '1. Information Accuracy',
      content: (
        <>
          <p className="text-gray-600 mb-3">I, the undersigned, hereby declare that all information provided by me in this platform, including but not limited to company details, personal identification, bank account information, and all invoices/bills submitted, is true, accurate, and complete to the best of my knowledge.</p>
          <p className="text-gray-600">I understand that any false, misleading, or fraudulent information may result in immediate termination of services and may lead to legal action.</p>
        </>
      ),
      checkbox: 'I confirm the accuracy of all information provided'
    },
    {
      id: 'authorization',
      icon: UserCheck,
      title: '2. Authorization & Consent',
      content: (
        <>
          <p className="text-gray-600 mb-3">I hereby authorize Gryork Platform to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>Verify my identity and business credentials through third-party verification services</li>
            <li>Share my profile and invoice details with registered NBFC partners for the purpose of bill discounting quotations</li>
            <li>Contact me regarding platform updates, offers, and service-related communications</li>
            <li>Store and process my data in accordance with the platform's privacy policy</li>
          </ul>
        </>
      ),
      checkbox: 'I authorize Gryork to process and share my data as described'
    },
    {
      id: 'compliance',
      icon: Scale,
      title: '3. Compliance Commitment',
      content: (
        <>
          <p className="text-gray-600 mb-3">I acknowledge and agree to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>Comply with all applicable laws and regulations related to invoice financing and bill discounting</li>
            <li>Not engage in any fraudulent, illegal, or unethical activities on this platform</li>
            <li>Submit only genuine invoices for work actually completed and accepted by the buyer</li>
            <li>Not submit duplicate invoices or fake documents</li>
            <li>Inform Gryork immediately if any submitted information changes or becomes outdated</li>
          </ul>
        </>
      ),
      checkbox: 'I commit to compliance with all platform rules and regulations'
    },
    {
      id: 'acknowledgment',
      icon: Eye,
      title: '4. Risk Acknowledgment',
      content: (
        <>
          <p className="text-gray-600 mb-3">I understand and acknowledge that:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
            <li>Bill discounting decisions are made by NBFC partners, not by Gryork</li>
            <li>Interest rates and terms are determined by NBFCs based on their risk assessment</li>
            <li>Gryork acts as a facilitator and does not guarantee loan approval</li>
            <li>I am responsible for repaying any funds disbursed according to the agreed terms</li>
            <li>Default on repayment may affect my credit score and lead to legal action</li>
          </ul>
        </>
      ),
      checkbox: 'I acknowledge and accept the risks involved'
    }
  ];

  const checkedCount = Object.values(checkboxes).filter(Boolean).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
                <Shield className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Seller Declaration</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="warning">Step 4 of Onboarding</Badge>
                  <span className="text-amber-700">Mandatory</span>
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary">{checkedCount}/4 Accepted</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-amber-100/50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">This is a mandatory step. You cannot submit CWCRF without accepting this declaration.</p>
          </div>
        </CardContent>
      </Card>

      {/* Declaration Sections */}
      {sections.map((section, idx) => {
        const Icon = section.icon;
        const isChecked = checkboxes[section.id as keyof typeof checkboxes];
        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`transition-all ${isChecked ? 'border-green-200 bg-green-50/30' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isChecked ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Icon className={`h-5 w-5 ${isChecked ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  {section.title}
                  {isChecked && <CheckCircle2 className="h-5 w-5 text-green-600 ml-auto" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm mb-4">{section.content}</div>
                <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setCheckboxes(prev => ({ ...prev, [section.id]: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                  />
                  <span className={`text-sm ${isChecked ? 'text-green-700 font-medium' : 'text-gray-700'}`}>{section.checkbox}</span>
                </label>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg"><Lock className="h-5 w-5 text-gray-500" />Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">By clicking "Accept Declaration" below, I confirm that I have read, understood, and agree to all the terms mentioned above. This declaration shall be legally binding and shall remain in effect for all transactions conducted through the Gryork platform.</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard
        </Button>
        <Button variant="gradient" onClick={handleAccept} disabled={!allChecked} isLoading={accepting}>
          {!accepting && <><CheckCircle2 className="h-4 w-4 mr-2" />Accept Declaration</>}
        </Button>
      </div>
    </motion.div>
  );
};

export default SellerDeclarationPage;
