'use client'

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Shield, 
  Users, 
  FileCheck, 
  Briefcase,
  Zap,
  BarChart3,
  Building2,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const HomePage = () => {
  const navigate = useNavigate()

  const roles = [
    {
      id: 'sales',
      title: 'Sales',
      description: 'Lead generation & client acquisition',
      icon: TrendingUp,
      gradient: 'from-[#1E5AAF] to-[#3B82F6]',
      bgGlow: 'bg-[#1E5AAF]/20'
    },
    {
      id: 'ops',
      title: 'Operations',
      description: 'Document verification & KYC',
      icon: FileCheck,
      gradient: 'from-[#15803D] to-[#22C55E]',
      bgGlow: 'bg-[#22C55E]/20'
    },
    {
      id: 'rmt',
      title: 'Risk Management',
      description: 'Risk assessment & evaluation',
      icon: Shield,
      gradient: 'from-amber-500 to-orange-500',
      bgGlow: 'bg-amber-500/20'
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'System administration',
      icon: Users,
      gradient: 'from-[#0A2463] to-[#1E5AAF]',
      bgGlow: 'bg-[#1E5AAF]/20'
    },
    {
      id: 'founder',
      title: 'Founder',
      description: 'Strategic oversight & approvals',
      icon: Briefcase,
      gradient: 'from-[#1E5AAF] to-[#22C55E]',
      bgGlow: 'bg-[#22C55E]/20'
    }
  ]

  const stats = [
    { label: 'Active Cases', value: '2,450+', icon: BarChart3 },
    { label: 'Partners', value: '180+', icon: Building2 },
    { label: 'Bills Processed', value: '₹50Cr+', icon: TrendingUp },
    { label: 'Avg Processing', value: '< 48hrs', icon: Zap }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 bg-gradient-to-br from-[#0A2463] via-[#1E5AAF] to-[#3B82F6]">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#22C55E]/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <Badge className="px-4 py-2 text-sm bg-white/20 border-white/30 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Gryork Internal Platform
            </Badge>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            <span className="text-white">
              Bill Discounting
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#86EFAC] via-[#4ADE80] to-[#22C55E] bg-clip-text text-transparent">
              Platform Management
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12"
          >
            Streamlined operations for the construction industry's leading 
            bill discounting platform. One dashboard to rule them all.
          </motion.p>

          {/* Stats */}
          <motion.div 
            variants={fadeInUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Card className="relative bg-white/10 backdrop-blur border-white/20 hover:border-white/40 transition-colors">
                  <CardContent className="p-4 text-center">
                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-[#86EFAC]" />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/60">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Role Selection */}
      <section className="relative py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0A2463]">Select Your Role</h2>
            <p className="text-gray-500">Choose your department to access the dashboard</p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            {roles.map((role) => (
              <motion.div
                key={role.id}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => navigate(`/login/${role.id}`)}
                  className="w-full group relative"
                >
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 ${role.bgGlow} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`} />
                  
                  <Card className="relative bg-white border-gray-200 hover:border-[#1E5AAF]/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <role.icon className="w-6 h-6 text-white" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 text-left">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#1E5AAF] transition-colors">
                            {role.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {role.description}
                          </p>
                        </div>
                        
                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1E5AAF] group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8 text-sm text-gray-500"
          >
            Need access? Contact{' '}
            <a href="mailto:support@gryork.com" className="text-[#1E5AAF] hover:underline">
              support@gryork.com
            </a>
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E5AAF] to-[#3B82F6] flex items-center justify-center font-bold text-white">
              G
            </div>
            <span className="font-semibold text-gray-900">Gryork</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2026 Gryork Technologies Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
