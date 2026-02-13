import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowRight, Building2, Shield, TrendingUp, Zap } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5176';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Building2, title: 'Bill Management', desc: 'Track and manage all your invoices in one place' },
    { icon: Shield, title: 'Secure Platform', desc: 'Bank-grade security for your transactions' },
    { icon: TrendingUp, title: 'Quick Financing', desc: 'Get paid faster with bill discounting' },
    { icon: Zap, title: 'Real-time Updates', desc: 'Stay informed with instant notifications' },
  ];

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
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
              <CardDescription className="text-gray-500">
                Sign in to manage your bills and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    icon={<Mail className="h-4 w-4" />}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    icon={<Lock className="h-4 w-4" />}
                    className="h-11"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  variant="gradient"
                  isLoading={loading}
                >
                  {!loading && (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-center text-sm text-gray-600">
                  New to Gryork?{' '}
                  <Link 
                    to="/register" 
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Create an account
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center">
                <a 
                  href={`${publicSiteUrl}/for-subcontractors`}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about Gryork for Sub-Contractors →
                </a>
              </div>
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
