import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/api';
import { 
  Mail, Lock, ArrowRight, Building2, Shield, TrendingUp, Zap, 
  ArrowLeft, AlertCircle, CheckCircle2, User 
} from 'lucide-react';

type Step = 'email' | 'not-found' | 'create-password' | 'login';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [nameFromEpc, setNameFromEpc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkedEpc, setLinkedEpc] = useState('');

  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5176';

  const features = [
    { icon: Building2, title: 'Bill Management', desc: 'Track and manage all your invoices in one place' },
    { icon: Shield, title: 'Secure Platform', desc: 'Bank-grade security for your transactions' },
    { icon: TrendingUp, title: 'Quick Financing', desc: 'Get paid faster with bill discounting' },
    { icon: Zap, title: 'Real-time Updates', desc: 'Stay informed with instant notifications' },
  ];

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.checkEmail(email.trim().toLowerCase());
      const data = res.data;

      if (!data.found) {
        setStep('not-found');
      } else if (data.hasAccount) {
        setStep('login');
      } else {
        setLinkedEpc(data.linkedEpc || 'your EPC company');
        if (data.contactName) {
          setName(data.contactName);
          setNameFromEpc(true);
        }
        setStep('create-password');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to check email');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.registerSubcontractor({
        name: name.trim() || email.split('@')[0],
        email: email.trim().toLowerCase(),
        password,
      });
      localStorage.setItem('token', res.data.token);
      toast.success('Account created successfully!');
      window.location.href = '/';
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter your password');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setNameFromEpc(false);
  };

  const getStepTitle = () => {
    switch (step) {
      case 'email': return 'Welcome to Gryork';
      case 'not-found': return 'Email Not Found';
      case 'create-password': return 'Create Your Account';
      case 'login': return 'Welcome Back';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email': return 'Enter your email to continue';
      case 'not-found': return 'This email is not registered';
      case 'create-password': return `You've been added by ${linkedEpc}`;
      case 'login': return 'Enter your password to sign in';
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Features */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-12 flex-col justify-between relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">Gryork</h1>
            <p className="text-blue-100 text-lg">Sub-Contractor Portal</p>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-blue-100">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 text-sm text-blue-100"
        >
          Trusted by 500+ Infrastructure companies across India
        </motion.p>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <div className="lg:hidden mb-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Gryork</h1>
              </div>
              {step !== 'email' && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              <CardTitle className="text-2xl font-bold text-gray-900">{getStepTitle()}</CardTitle>
              <CardDescription className="text-gray-500">
                {getStepDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {/* Step 1: Email Input */}
                {step === 'email' && (
                  <motion.form
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleCheckEmail}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          autoFocus
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                      disabled={loading}
                    >
                      {loading ? 'Checking...' : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}

                {/* Step 2a: Email Not Found */}
                {step === 'not-found' && (
                  <motion.div
                    key="not-found"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800">Email Not Registered</p>
                          <p className="text-sm text-red-600 mt-1">
                            The email <strong>{email}</strong> is not in our system.
                          </p>
                          <p className="text-sm text-red-600 mt-2">
                            Please contact your EPC company to add you as a sub-contractor vendor first.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleBack}
                      variant="outline"
                      className="w-full h-11"
                    >
                      Try Another Email
                    </Button>
                  </motion.div>
                )}

                {/* Step 2b: Create Password (First Time) */}
                {step === 'create-password' && (
                  <motion.form
                    key="create-password"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleCreatePassword}
                    className="space-y-5"
                  >
                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">Welcome!</p>
                          <p className="text-sm text-green-600">
                            You've been added by <strong>{linkedEpc}</strong>. Create a password to get started.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700">Email</Label>
                      <Input
                        type="email"
                        value={email}
                        disabled
                        className="h-11 bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700">
                        Your Name {!nameFromEpc && <span className="text-gray-400">(Optional)</span>}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => !nameFromEpc && setName(e.target.value)}
                          placeholder="John Doe"
                          className={`h-11 pl-10 ${nameFromEpc ? 'bg-gray-50' : ''}`}
                          readOnly={nameFromEpc}
                        />
                      </div>
                      {nameFromEpc && (
                        <p className="text-xs text-gray-500">Name provided by {linkedEpc}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">Create Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          required
                          minLength={6}
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          required
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </motion.form>
                )}

                {/* Step 2c: Login with Password */}
                {step === 'login' && (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleLogin}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label className="text-gray-700">Email</Label>
                      <Input
                        type="email"
                        value={email}
                        disabled
                        className="h-11 bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          autoFocus
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

              {step === 'email' && (
                <div className="mt-6 text-center">
                  <a 
                    href={`${publicSiteUrl}/for-subcontractors`}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more about Gryork for Sub-Contractors →
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center text-xs text-gray-400"
          >
            By signing in, you agree to our{' '}
            <a href="#" className="text-gray-500 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-gray-500 hover:underline">Privacy Policy</a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
