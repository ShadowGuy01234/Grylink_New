'use client'

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import type { LucideIcon } from 'lucide-react'
import { 
  TrendingUp, 
  Shield, 
  Users, 
  FileCheck, 
  Briefcase,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RoleConfig {
  title: string
  subtitle: string
  icon: LucideIcon
  gradient: string
  glowColor: string
  features: string[]
  allowedRoles: string[]
}

const roleConfigs: Record<string, RoleConfig> = {
  sales: {
    title: 'Sales Portal',
    subtitle: 'Lead management & client acquisition',
    icon: TrendingUp,
    gradient: 'from-[#1E5AAF] to-[#3B82F6]',
    glowColor: 'bg-[#1E5AAF]/20',
    features: ['Lead tracking', 'Client dashboard', 'Analytics'],
    allowedRoles: ['sales', 'admin', 'founder']
  },
  ops: {
    title: 'Operations Portal',
    subtitle: 'Document verification & KYC',
    icon: FileCheck,
    gradient: 'from-[#15803D] to-[#22C55E]',
    glowColor: 'bg-[#22C55E]/20',
    features: ['KYC verification', 'Document review', 'Compliance'],
    allowedRoles: ['ops', 'admin', 'founder']
  },
  rmt: {
    title: 'Risk Management',
    subtitle: 'Risk assessment & evaluation',
    icon: Shield,
    gradient: 'from-amber-500 to-orange-500',
    glowColor: 'bg-amber-500/20',
    features: ['Risk scoring', 'Seller evaluation', 'Reports'],
    allowedRoles: ['rmt', 'ops', 'admin', 'founder']
  },
  admin: {
    title: 'Admin Portal',
    subtitle: 'System administration',
    icon: Users,
    gradient: 'from-[#0A2463] to-[#1E5AAF]',
    glowColor: 'bg-[#1E5AAF]/20',
    features: ['User management', 'System config', 'Audit logs'],
    allowedRoles: ['admin', 'founder']
  },
  founder: {
    title: 'Founder Portal',
    subtitle: 'Strategic oversight & approvals',
    icon: Briefcase,
    gradient: 'from-[#1E5AAF] to-[#22C55E]',
    glowColor: 'bg-[#22C55E]/20',
    features: ['Approvals', 'Agent management', 'Analytics'],
    allowedRoles: ['founder']
  }
}

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { role } = useParams<{ role?: string }>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const config = role ? roleConfigs[role] : null
  const IconComponent = config?.icon || Sparkles
  const gradientClass = config?.gradient || 'from-blue-500 to-violet-500'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(email, password)
      
      if (config && !config.allowedRoles.includes(user.role)) {
        toast.error(`Access denied. You don't have ${role} privileges.`)
        setLoading(false)
        return
      }
      
      toast.success('Welcome back!')
      navigate('/')
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Background split: gradient left, light right */}
      <div className="fixed inset-0 -z-10 flex">
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-[#0A2463] via-[#1E5AAF] to-[#3B82F6]" />
        <div className="flex-1 bg-gray-50" />
      </div>

      {/* Left Panel - Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative"
      >
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to home</span>
        </Link>

        {/* Brand Content */}
        <div className="space-y-8">
          <div className="space-y-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-2xl`}
            >
              <IconComponent className="w-8 h-8 text-white" />
            </motion.div>
            
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{config?.title || 'Gryork'}</h1>
              <p className="text-lg text-white/70">{config?.subtitle || 'Internal Platform'}</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {(config?.features || ['Real-time tracking', 'Secure access', 'Analytics']).map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/90">{f}</span>
              </motion.div>
            ))}
          </div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-2xl bg-white/10 backdrop-blur border border-white/20"
          >
            <p className="text-white/90 italic mb-4">
              "Gryork transformed how we manage our construction payments. The platform is intuitive and saves us hours every week."
            </p>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-semibold text-sm`}>
                RK
              </div>
              <div>
                <p className="text-white font-medium text-sm">Rajesh Kumar</p>
                <p className="text-white/60 text-xs">CFO, BuildCorp India</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <p className="text-sm text-white/50">
          Trusted by 180+ construction companies across India
        </p>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12"
      >
        <div className="w-full max-w-md">
          {/* Mobile Back Link */}
          <Link 
            to="/" 
            className="lg:hidden inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>

          <Card className="bg-white border-gray-200 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <div className="lg:hidden mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500">Enter your credentials to continue</p>
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
                    placeholder="name@company.com"
                    required
                    autoComplete="email"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#1E5AAF] focus:ring-[#1E5AAF]/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#1E5AAF] focus:ring-[#1E5AAF]/20 pr-10"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
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
                  className={`w-full h-11 bg-gradient-to-r ${gradientClass} hover:opacity-90 transition-opacity text-white font-medium`}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
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
