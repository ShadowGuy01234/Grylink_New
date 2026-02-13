import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Building2, User, MapPin, Phone, Mail, Hash, FileText, ArrowRight, CheckCircle2, Link2
} from 'lucide-react';

interface Company {
  _id: string;
  companyName: string;
}

const ProfileCompletionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [linkedEpc, setLinkedEpc] = useState<Company | null>(null);
  const [availableEpcs, setAvailableEpcs] = useState<Company[]>([]);
  const [form, setForm] = useState({
    companyName: '', ownerName: '', address: '', phone: '', email: '', vendorId: '', gstin: '', selectedEpcId: ''
  });

  useEffect(() => { fetchProfileData(); }, []);

  const fetchProfileData = async () => {
    try {
      const res = await api.get('/subcontractor/profile');
      const data = res.data;
      setForm({
        companyName: data.subContractor?.companyName || '',
        ownerName: data.subContractor?.ownerName || user?.name || '',
        address: data.subContractor?.address || '',
        phone: data.subContractor?.phone || '',
        email: data.subContractor?.email || user?.email || '',
        vendorId: data.subContractor?.vendorId || '',
        gstin: data.subContractor?.gstin || '',
        selectedEpcId: data.subContractor?.selectedEpcId || data.subContractor?.linkedEpcId || ''
      });

      if (data.subContractor?.linkedEpcId) {
        const epcRes = await api.get(`/company/info/${data.subContractor.linkedEpcId}`).catch(() => null);
        if (epcRes?.data) setLinkedEpc(epcRes.data);
      }
      const epcsRes = await api.get('/company/active').catch(() => ({ data: [] }));
      setAvailableEpcs(epcsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.ownerName || !form.address || !form.gstin) {
      return toast.error('Please fill all required fields');
    }
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(form.gstin.toUpperCase())) {
      return toast.error('Please enter a valid GSTIN');
    }
    setLoading(true);
    try {
      await api.put('/subcontractor/profile', { ...form, gstin: form.gstin.toUpperCase() });
      toast.success('Profile completed successfully!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200"
            >
              <Building2 className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>Please provide your business details to continue</CardDescription>
          </CardHeader>

          <CardContent>
            {linkedEpc && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600">Linked EPC Company</p>
                  <p className="font-semibold text-blue-900">{linkedEpc.companyName}</p>
                </div>
                <Badge variant="success" className="ml-auto"><CheckCircle2 className="h-3 w-3 mr-1" />Linked</Badge>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="space-y-2">
                  <Label required className="flex items-center gap-2"><Building2 className="h-4 w-4 text-gray-400" />Company Name</Label>
                  <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Your company name" required />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                  <Label required className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" />Owner / Contact Name</Label>
                  <Input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Full name" required />
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-2">
                <Label required className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" />Business Address</Label>
                <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Complete business address" required />
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
                  <Label className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />Phone</Label>
                  <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Contact number" />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="space-y-2">
                  <Label className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" />Email</Label>
                  <Input type="email" value={form.email} disabled className="bg-gray-50" />
                </motion.div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
                  <Label className="flex items-center gap-2"><Hash className="h-4 w-4 text-gray-400" />Vendor ID</Label>
                  <Input value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })} placeholder="Your vendor ID with EPC" />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }} className="space-y-2">
                  <Label required className="flex items-center gap-2"><FileText className="h-4 w-4 text-gray-400" />GSTIN</Label>
                  <Input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} placeholder="22AAAAA0000A1Z5" maxLength={15} required />
                </motion.div>
              </div>

              {availableEpcs.length > 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-2">
                  <Label className="flex items-center gap-2"><Building2 className="h-4 w-4 text-gray-400" />Select Primary EPC Company</Label>
                  <Select value={form.selectedEpcId} onChange={(e) => setForm({ ...form, selectedEpcId: e.target.value })}>
                    <option value="">-- Select Company --</option>
                    {availableEpcs.map((epc) => (
                      <option key={epc._id} value={epc._id}>{epc.companyName}</option>
                    ))}
                  </Select>
                  <p className="text-xs text-gray-500">Select the EPC company you primarily work with</p>
                </motion.div>
              )}
            </form>
          </CardContent>

          <CardFooter>
            <Button type="submit" variant="gradient" className="w-full" onClick={handleSubmit} isLoading={loading}>
              {!loading && <><CheckCircle2 className="h-4 w-4 mr-2" />Complete Profile<ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center mt-6 text-sm text-gray-500">
          Need help? Contact support@grylink.com
        </p>
      </motion.div>
    </div>
  );
};

export default ProfileCompletionPage;
