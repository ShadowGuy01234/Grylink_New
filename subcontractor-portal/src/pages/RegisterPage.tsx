import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Mail, User, Building2, Phone, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'register'>('email');
  const [emailCheck, setEmailCheck] = useState<{ found: boolean; hasAccount: boolean; linkedEpc: string } | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const checkEmail = async () => {
    if (!form.email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      const res = await api.get(`/auth/check-email/${form.email}`);
      const data = res.data;
      setEmailCheck(data);
      
      if (!data.found) {
        toast.error('Email not found. Your EPC company must add you as a sub-contractor first.');
      } else if (data.hasAccount) {
        toast.error('Account already exists. Please login instead.');
        navigate('/login');
      } else {
        setStep('register');
        toast.success(`Found! You're linked to ${data.linkedEpc}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await api.post('/auth/register-subcontractor', {
        name: form.name,
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        phone: form.phone,
      });
      toast.success('Account created! Please complete your profile.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6 text-center">
            <Link to="/" className="inline-block mb-4">
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gryork
              </span>
            </Link>
            <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
            <CardDescription className="text-gray-500">
              Register as a sub-contractor
            </CardDescription>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step === 'email' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'
                }`}>
                  {step === 'register' ? <CheckCircle2 className="h-5 w-5" /> : '1'}
                </div>
                <span className={`text-sm ${step === 'email' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Verify Email</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-200">
                <div className={`h-full bg-green-500 transition-all ${step === 'register' ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className={`text-sm ${step === 'register' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>Details</span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {step === 'email' && (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Enter email provided to your EPC company"
                      icon={<Mail className="h-4 w-4" />}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> Your EPC company must have added you as a vendor before you can register.
                    </p>
                  </div>

                  <Button 
                    type="button" 
                    className="w-full h-11" 
                    variant="gradient"
                    onClick={checkEmail}
                    isLoading={loading}
                  >
                    {!loading && (
                      <>
                        Verify Email
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {step === 'register' && (
                <motion.form
                  key="register-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {emailCheck && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-green-700 font-medium">Email Verified!</p>
                        <p className="text-sm text-green-600">Linked to: <Badge variant="success">{emailCheck.linkedEpc}</Badge></p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email-disabled" className="text-gray-700">Email</Label>
                    <Input 
                      id="email-disabled"
                      type="email" 
                      value={form.email} 
                      disabled 
                      className="bg-gray-50"
                      icon={<Mail className="h-4 w-4" />}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" required className="text-gray-700">Your Name</Label>
                      <Input 
                        id="name"
                        required 
                        value={form.name} 
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                        icon={<User className="h-4 w-4" />}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" required className="text-gray-700">Company Name</Label>
                      <Input 
                        id="company"
                        required 
                        value={form.companyName} 
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                        placeholder="ABC Corp"
                        icon={<Building2 className="h-4 w-4" />}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                    <Input 
                      id="phone"
                      type="tel" 
                      value={form.phone} 
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      icon={<Phone className="h-4 w-4" />}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" required className="text-gray-700">Password</Label>
                      <Input 
                        id="password"
                        type="password" 
                        required 
                        minLength={6} 
                        value={form.password} 
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••"
                        icon={<Lock className="h-4 w-4" />}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" required className="text-gray-700">Confirm Password</Label>
                      <Input 
                        id="confirm-password"
                        type="password" 
                        required 
                        minLength={6} 
                        value={form.confirmPassword} 
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        icon={<Lock className="h-4 w-4" />}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="flex-1 h-11"
                      onClick={() => setStep('email')}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-11" 
                      variant="gradient"
                      isLoading={loading}
                    >
                      {!loading && 'Create Account'}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
