'use client'

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ArrowLeft, Eye, EyeOff, Loader2, Sparkles, Check } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }, message?: string }
      toast.error(error.response?.data?.error || error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const features = ['Fast bill processing', 'Competitive rates', 'Secure platform']

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Panel - Branding with Gradient */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative bg-gradient-to-br from-[#0A2463] via-[#1E5AAF] to-[#3B82F6]"
      >
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors w-fit group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to home</span>
        </Link>

        <div className="space-y-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">GryLink Portal</h1>
            <p className="text-lg text-blue-100">B2B Supply Chain Financing Platform</p>
          </div>

          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white">{f}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <p className="text-white italic mb-4">
              "GryLink has streamlined our payment processing. We now get bills financed 3x faster than before."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#22C55E] flex items-center justify-center text-white font-semibold text-sm">
                AK
              </div>
              <div>
                <p className="text-white font-medium text-sm">Amit Kumar</p>
                <p className="text-blue-200 text-xs">Finance Head, BuildPro Ltd</p>
              </div>
            </div>
          </motion.div>
        </div>

        <p className="text-sm text-blue-200">
          Trusted by 180+ EPCs across India
        </p>
      </motion.div>

      {/* Right Panel - Login Form (Light) */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50"
      >
        <div className="w-full max-w-md">
          <Link 
            to="/" 
            className="lg:hidden inline-flex items-center gap-2 text-gray-500 hover:text-[#1E5AAF] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>

          <Card className="bg-white border-gray-200 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <div className="lg:hidden mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E5AAF] to-[#22C55E] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#0A2463]">Welcome back</h2>
              <p className="text-gray-600">Sign in to your GryLink account</p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="company@example.com"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1E5AAF] focus:ring-2 focus:ring-[#1E5AAF]/10 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1E5AAF] focus:ring-2 focus:ring-[#1E5AAF]/10 transition-colors pr-10"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 bg-white text-[#1E5AAF] focus:ring-[#1E5AAF]/20"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-[#1E5AAF] hover:text-[#0A2463] transition-colors">
                    Forgot password?
                  </a>
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-[#1E5AAF] to-[#3B82F6] hover:opacity-90 transition-opacity text-white font-medium"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500">
                  Need help?{' '}
                  <a href="mailto:support@gryork.com" className="text-[#1E5AAF] hover:underline">
                    Contact support
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-500 mt-6">
            © 2026 Gryork Technologies Pvt. Ltd.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
