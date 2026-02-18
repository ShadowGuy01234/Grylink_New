'use client'

import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
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
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  Play,
  Receipt,
  BadgeCheck,
  LineChart,
  FileText,
  BanknoteIcon,
  Timer,
  ShieldCheck,
  CircleDollarSign,
  Landmark,
  HardHat,
  Building
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import { useRef } from 'react'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
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
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

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
    { label: 'Active Cases', value: '2,450+', icon: BarChart3, suffix: '' },
    { label: 'Partner Companies', value: '180+', icon: Building2, suffix: '' },
    { label: 'Bills Processed', value: '₹50', icon: TrendingUp, suffix: 'Cr+' },
    { label: 'Avg Processing', value: '< 48', icon: Zap, suffix: 'hrs' }
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Bill Submission',
      description: 'Sub-contractor submits certified bills through our secure platform with all supporting documents.',
      icon: FileText,
      color: 'from-[#1E5AAF] to-[#3B82F6]'
    },
    {
      step: '02', 
      title: 'Verification & KYC',
      description: 'Our ops team verifies documents, completes KYC, and validates bill authenticity.',
      icon: BadgeCheck,
      color: 'from-[#15803D] to-[#22C55E]'
    },
    {
      step: '03',
      title: 'Risk Assessment',
      description: 'AI-powered risk engine evaluates the case and assigns a risk score with recommendations.',
      icon: Shield,
      color: 'from-amber-500 to-orange-500'
    },
    {
      step: '04',
      title: 'Fund Disbursement',
      description: 'Upon approval, funds are disbursed within 48 hours directly to the sub-contractor.',
      icon: BanknoteIcon,
      color: 'from-[#0A2463] to-[#1E5AAF]'
    }
  ]

  const features = [
    {
      title: '48-Hour Processing',
      description: 'Lightning-fast disbursement with our streamlined verification pipeline.',
      icon: Timer,
      gradient: 'from-[#1E5AAF] to-[#3B82F6]'
    },
    {
      title: 'AI Risk Engine',
      description: 'Advanced algorithms assess risk with 95%+ accuracy for better decisions.',
      icon: LineChart,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Secure & Compliant',
      description: 'Bank-grade security with full regulatory compliance and audit trails.',
      icon: ShieldCheck,
      gradient: 'from-[#15803D] to-[#22C55E]'
    },
    {
      title: 'Real-time Tracking',
      description: 'Monitor every stage of your bill from submission to disbursement.',
      icon: BarChart3,
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Competitive Rates',
      description: 'Industry-leading discounting rates with transparent fee structure.',
      icon: CircleDollarSign,
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      title: 'Dedicated Support',
      description: '24/7 expert support team to guide you through every step.',
      icon: Users,
      gradient: 'from-[#0A2463] to-[#1E5AAF]'
    }
  ]

  const benefits = [
    {
      audience: 'For EPCs',
      icon: Building,
      items: [
        'Maintain supplier relationships',
        'Improve cash flow management',
        'Zero liability financing'
      ],
      gradient: 'from-[#1E5AAF] to-[#3B82F6]'
    },
    {
      audience: 'For Sub-Contractors',
      icon: HardHat,
      items: [
        'Early payment access',
        'Grow without capital constraints',
        'Simple application process'
      ],
      gradient: 'from-[#15803D] to-[#22C55E]'
    },
    {
      audience: 'For Financiers',
      icon: Landmark,
      items: [
        'Secured investment opportunities',
        'Attractive risk-adjusted returns',
        'Diversified portfolio options'
      ],
      gradient: 'from-amber-500 to-orange-500'
    }
  ]

  const testimonials = [
    {
      quote: "Gryork transformed how we manage our construction payments. The platform is intuitive and saves us hours every week.",
      author: "Rajesh Kumar",
      role: "CFO, BuildCorp India",
      avatar: "RK"
    },
    {
      quote: "As a sub-contractor, getting early payments was always a challenge. Gryork solved that completely. Now I can take on bigger projects.",
      author: "Priya Sharma",
      role: "Director, Prime Electricals",
      avatar: "PS"
    },
    {
      quote: "The risk assessment is spot on. We've seen a 30% improvement in our portfolio performance since partnering with Gryork.",
      author: "Amit Patel",
      role: "VP Finance, Infrastructure Fund",
      avatar: "AP"
    }
  ]

  const trustedBy = [
    "L&T Construction",
    "Tata Projects",
    "Shapoorji Pallonji",
    "Godrej Properties",
    "Sobha Ltd",
    "Brigade Group"
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-gray-900 overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 pb-20 px-6 bg-gradient-to-br from-[#0A2463] via-[#1E5AAF] to-[#3B82F6] overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ 
              x: [0, -20, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#22C55E]/20 rounded-full blur-[100px]"
          />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative max-w-7xl mx-auto w-full"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial="initial"
              animate="animate"
              variants={stagger}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <Badge className="px-4 py-2 text-sm bg-white/15 border-white/25 text-white backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  India's Leading Bill Discounting Platform
                </Badge>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 tracking-tight leading-tight"
              >
                <span className="text-white">
                  Unlock Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#86EFAC] via-[#4ADE80] to-[#22C55E] bg-clip-text text-transparent">
                  Working Capital
                </span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-lg md:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 mb-8"
              >
                Convert your pending bills into instant cash. Get funded in under 48 hours 
                with India's fastest bill discounting platform built for construction.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => navigate('/login/sales')}
                  className="bg-white text-[#0A2463] hover:bg-white/90 font-semibold px-8 h-14 text-lg shadow-xl shadow-black/20 group"
                >
                  Start Now — It's Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-14 text-lg group"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                variants={fadeInUp}
                className="mt-10 pt-8 border-t border-white/10"
              >
                <p className="text-sm text-white/50 mb-4">Trusted by India's leading construction companies</p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                  {trustedBy.slice(0, 4).map((company, i) => (
                    <span key={i} className="text-sm text-white/60 font-medium">
                      {company}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Card className="relative bg-white/10 backdrop-blur-md border-white/20 hover:border-white/40 transition-colors overflow-hidden">
                      <CardContent className="p-6">
                        <stat.icon className="w-8 h-8 mb-3 text-[#86EFAC]" />
                        <div className="flex items-baseline gap-1">
                          <p className="text-3xl font-bold text-white">{stat.value}</p>
                          <span className="text-xl text-white/70">{stat.suffix}</span>
                        </div>
                        <p className="text-sm text-white/60 mt-1">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#22C55E]/20 to-[#22C55E]/10 border border-[#22C55E]/30 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#22C55E] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">₹2.5 Cr disbursed today</p>
                    <p className="text-sm text-white/60">12 bills processed in last hour</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-white/50 uppercase tracking-wider">Scroll to explore</span>
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-white rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-[#1E5AAF]/10 text-[#1E5AAF] border-[#1E5AAF]/20">
              Simple Process
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[#0A2463]">
              How Gryork Works
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              From bill submission to fund disbursement in just 4 simple steps.
              We've streamlined the entire process to get you funded faster.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                {/* Connector line */}
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-transparent z-0" />
                )}
                
                <Card className="relative bg-white border-gray-200 hover:border-[#1E5AAF]/50 hover:shadow-xl transition-all duration-300 overflow-hidden z-10">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-4xl font-bold text-gray-100 absolute top-4 right-4">
                      {step.step}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeInLeft}>
                <Badge className="mb-4 bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20">
                  Platform Features
                </Badge>
              </motion.div>
              <motion.h2 
                variants={fadeInLeft}
                className="text-3xl md:text-5xl font-bold mb-6 text-[#0A2463]"
              >
                Built for
                <span className="bg-gradient-to-r from-[#1E5AAF] to-[#22C55E] bg-clip-text text-transparent"> Speed & Security</span>
              </motion.h2>
              <motion.p 
                variants={fadeInLeft}
                className="text-gray-500 text-lg mb-8"
              >
                Every feature is designed to get you funded faster while maintaining 
                the highest standards of security and compliance.
              </motion.p>

              <motion.div variants={fadeInLeft} className="grid sm:grid-cols-2 gap-4">
                {features.slice(0, 4).map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-[#0A2463] via-[#1E5AAF] to-[#3B82F6] rounded-3xl p-8 overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                
                {/* Mock dashboard */}
                <div className="relative space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Bill #GRY-2024-1847</p>
                        <p className="text-xs text-white/60">Submitted 2 hours ago</p>
                      </div>
                    </div>
                    <Badge className="bg-[#22C55E]/20 text-[#86EFAC] border-[#22C55E]/30">
                      In Progress
                    </Badge>
                  </div>

                  {/* Progress steps */}
                  <div className="p-4 rounded-xl bg-white/10">
                    <div className="flex items-center justify-between mb-3">
                      {['Submitted', 'Verified', 'Approved', 'Funded'].map((step, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            i < 2 ? 'bg-[#22C55E]' : 'bg-white/20'
                          }`}>
                            {i < 2 ? (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            ) : (
                              <span className="text-xs text-white/60">{i + 1}</span>
                            )}
                          </div>
                          <span className="text-xs text-white/60 mt-1">{step}</span>
                        </div>
                      ))}
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '50%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-[#22C55E] to-[#4ADE80] rounded-full"
                      />
                    </div>
                  </div>

                  {/* Amount card */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-white/10">
                      <p className="text-xs text-white/60 mb-1">Bill Amount</p>
                      <p className="text-2xl font-bold text-white">₹18.5L</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#22C55E]/20 to-[#22C55E]/10 border border-[#22C55E]/30">
                      <p className="text-xs text-[#86EFAC] mb-1">You'll Receive</p>
                      <p className="text-2xl font-bold text-white">₹17.8L</p>
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#86EFAC]" />
                      <span className="text-sm text-white/80">Est. time to funding</span>
                    </div>
                    <span className="text-sm font-semibold text-[#86EFAC]">~18 hours</span>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="absolute -left-4 top-1/4 p-3 rounded-xl bg-white shadow-xl border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-medium text-gray-900">Fast Track</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="absolute -right-4 bottom-1/4 p-3 rounded-xl bg-white shadow-xl border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
                  <span className="text-sm font-medium text-gray-900">100% Secure</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="about" className="relative py-24 px-6 bg-gradient-to-br from-gray-900 via-[#0A2463] to-[#1E5AAF] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-white/10 text-white border-white/20">
              Benefits
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              Built for Everyone in the
              <span className="bg-gradient-to-r from-[#86EFAC] to-[#22C55E] bg-clip-text text-transparent"> Ecosystem</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Whether you're an EPC, sub-contractor, or financier, Gryork creates value for all stakeholders.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                      <benefit.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{benefit.audience}</h3>
                    <ul className="space-y-3">
                      {benefit.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-3 text-white/70">
                          <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-[#1E5AAF]/10 text-[#1E5AAF] border-[#1E5AAF]/20">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[#0A2463]">
              What Our Partners Say
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Hear from the companies that have transformed their cash flow with Gryork.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white border-gray-200 hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Sparkles key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 italic mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E5AAF] to-[#3B82F6] flex items-center justify-center text-white font-semibold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.author}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection - Internal Portal Access */}
      <section className="relative py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-gray-100 text-gray-700 border-gray-200">
              Internal Access
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0A2463]">Team Portal Access</h2>
            <p className="text-gray-500">Choose your department to access the internal dashboard</p>
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

      <Footer />
    </div>
  )
}

export default HomePage
