'use client'

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, 
  FileCheck, 
  TrendingUp, 
  Zap,
  ArrowRight,
  Shield,
  Clock,
  Building2,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

  const features = [
    {
      icon: Users,
      title: 'Vendor Management',
      description: 'Efficiently manage sub-contractors with comprehensive vendor records',
      gradient: 'from-[#1E5AAF] to-[#3B82F6]'
    },
    {
      icon: FileCheck,
      title: 'Bill Verification',
      description: 'Streamlined verification process with automated workflows',
      gradient: 'from-[#15803D] to-[#22C55E]'
    },
    {
      icon: TrendingUp,
      title: 'Competitive Bidding',
      description: 'Transparent bidding for optimal financing terms',
      gradient: 'from-[#0A2463] to-[#1E5AAF]'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Quick turnaround from submission to disbursement',
      gradient: 'from-[#1E5AAF] to-[#22C55E]'
    }
  ]

  const steps = [
    { number: '01', title: 'Onboarding', desc: 'Sales creates account & sends link' },
    { number: '02', title: 'Documentation', desc: 'Upload documents & complete KYC' },
    { number: '03', title: 'Bill Submission', desc: 'Submit bills for verification' },
    { number: '04', title: 'Funding', desc: 'Receive bids & secure financing' }
  ]

  const stats = [
    { label: 'EPCs Onboarded', value: '180+', icon: Building2 },
    { label: 'Bills Processed', value: '₹50Cr+', icon: TrendingUp },
    { label: 'Avg Processing', value: '< 48hrs', icon: Clock },
    { label: 'Success Rate', value: '99.9%', icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-600 overflow-hidden">
      {/* Navbar - Light */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E5AAF] to-[#22C55E] flex items-center justify-center font-bold text-lg text-white">
            G
          </div>
          <span className="text-xl font-bold text-[#0A2463]">GryLink</span>
          <Badge variant="outline" className="text-[#1E5AAF] border-[#1E5AAF]/30">Portal</Badge>
        </div>
        <Button onClick={() => navigate('/login')} variant="outline">
          Sign In
        </Button>
      </nav>

      {/* Hero Section - Dark Gradient */}
      <section className="relative pt-20 pb-32 px-6 bg-gradient-to-br from-[#0A2463] via-[#1E5AAF] to-[#3B82F6]">
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <Badge className="px-4 py-2 text-sm bg-white/10 border-white/20 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              B2B Supply Chain Financing
            </Badge>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white"
          >
            GryLink
            <br />
            <span className="text-[#86EFAC]">
              Financing Platform
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10"
          >
            Connecting EPCs and Sub-Contractors for seamless bill discounting. 
            Fast approvals, competitive rates, transparent process.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="bg-[#22C55E] hover:bg-[#15803D] text-white px-8"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-white text-white hover:bg-white hover:text-[#0A2463]"
            >
              Sign In
            </Button>
          </motion.div>

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
                <Card className="relative bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                  <CardContent className="p-4 text-center">
                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-[#86EFAC]" />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-blue-200">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Light */}
      <section className="relative py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0A2463]">Platform Features</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Everything you need for efficient supply chain financing</p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="h-full bg-white border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all group">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-[#0A2463]">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works - Light Gray BG */}
      <section className="relative py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0A2463]">How It Works</h2>
            <p className="text-gray-600">Simple 4-step process to get started</p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-4 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            {steps.map((step, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-[#1E5AAF] to-transparent -translate-x-1/2 z-0" />
                )}
                <Card className="relative z-10 bg-white border-gray-200 hover:shadow-lg hover:border-[#1E5AAF]/30 transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E5AAF] to-[#22C55E] flex items-center justify-center mx-auto mb-4 text-lg font-bold text-white">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-[#0A2463]">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Gradient */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-[#0A2463] via-[#1E5AAF] to-[#3B82F6]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to streamline your financing?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Join 180+ EPCs and thousands of sub-contractors already using GryLink
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/login')}
            className="bg-[#22C55E] hover:bg-[#15803D] text-white"
          >
            Get Started Today
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Footer - Light */}
      <footer className="border-t border-gray-200 py-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E5AAF] to-[#22C55E] flex items-center justify-center font-bold text-white">
              G
            </div>
            <span className="font-semibold text-[#0A2463]">GryLink</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-[#1E5AAF] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#1E5AAF] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#1E5AAF] transition-colors">Contact</a>
          </div>
          <p className="text-sm text-gray-500">
            © 2026 Gryork Technologies Pvt. Ltd.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
