import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { grylinkApi } from '@/api';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Lock, Mail, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

const OnboardingPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [linkData, setLinkData] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const validate = async () => {
      try {
        if (!token) throw new Error('No token provided');
        const res = await grylinkApi.validate(token);
        setLinkData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Invalid or expired link');
      } finally {
        setLoading(false);
      }
    };
    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    try {
      const res = await grylinkApi.setPassword(token!, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Account set up successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to set password');
      setSubmitting(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
    if (password.length < 12) return { strength: 75, label: 'Good', color: 'bg-blue-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Validating your link...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border-red-200">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-red-900">Link Invalid</CardTitle>
              <CardDescription className="text-red-600">{error}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-500 text-sm mb-6">
                If you believe this is an error, please contact your sales representative.
              </p>
              <Button variant="default" className="w-full" onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200"
            >
              <span className="text-white font-bold text-2xl">G</span>
            </motion.div>
            <CardTitle className="text-2xl">
              Welcome, {linkData?.ownerName || linkData?.companyName}!
            </CardTitle>
            <CardDescription>
              Set your password to access your sub-contractor dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email (disabled) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={linkData?.email || ''}
                  disabled
                  className="bg-gray-50"
                  icon={<Mail className="h-4 w-4" />}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" required>Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                  icon={<Lock className="h-4 w-4" />}
                />
                {/* Password strength */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1"
                  >
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength.strength}%` }}
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      />
                    </div>
                    <p className={`text-xs ${
                      passwordStrength.strength < 50 ? 'text-red-500' :
                      passwordStrength.strength < 75 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      Password strength: {passwordStrength.label}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" required>Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  icon={<Lock className="h-4 w-4" />}
                />
                {/* Match indicator */}
                {confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-xs flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Passwords match
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        Passwords do not match
                      </>
                    )}
                  </motion.p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                isLoading={submitting}
                disabled={!passwordsMatch || password.length < 8}
              >
                {!submitting && (
                  <>
                    Set Password & Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-4 pt-0">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="h-3 w-3" />
              Your password is encrypted and secure
            </div>
            <p className="text-xs text-gray-400 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
