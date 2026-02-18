'use client'

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  variant?: 'transparent' | 'solid'
}

const Navbar = ({ variant = 'transparent' }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const showSolid = variant === 'solid' || isScrolled

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '#about' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Contact', href: '#contact' },
  ]

  const products = [
    { label: 'For EPCs', description: 'Accelerate your cash flow', href: '/login/sales' },
    { label: 'For Sub-Contractors', description: 'Get early payment access', href: '/login/ops' },
    { label: 'For Financiers', description: 'Secure investment opportunities', href: '/login/rmt' },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showSolid 
            ? 'bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 3 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E5AAF] to-[#3B82F6] flex items-center justify-center shadow-lg"
              >
                <span className="text-xl font-bold text-white">G</span>
              </motion.div>
              <span className={`text-xl font-bold transition-colors ${
                showSolid ? 'text-gray-900' : 'text-white'
              }`}>
                Gryork
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-white/10 ${
                    showSolid 
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              
              {/* Products Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProductsOpen(!productsOpen)}
                  onBlur={() => setTimeout(() => setProductsOpen(false), 200)}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-1 hover:bg-white/10 ${
                    showSolid 
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Products
                  <ChevronDown className={`w-4 h-4 transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {productsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                    >
                      <div className="p-2">
                        {products.map((product, i) => (
                          <Link
                            key={i}
                            to={product.href}
                            className="block p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900 group-hover:text-[#1E5AAF]">
                                  {product.label}
                                </p>
                                <p className="text-sm text-gray-500">{product.description}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1E5AAF] group-hover:translate-x-1 transition-all" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className={`font-medium ${
                  showSolid 
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/login/sales')}
                className="bg-gradient-to-r from-[#1E5AAF] to-[#3B82F6] hover:opacity-90 text-white font-medium px-5 shadow-lg shadow-blue-500/25"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                showSolid 
                  ? 'text-gray-600 hover:bg-gray-100' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl"
            >
              <div className="p-6 pt-20">
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:text-[#1E5AAF] hover:bg-gray-50 rounded-xl font-medium transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Products
                  </p>
                  {products.map((product, i) => (
                    <Link
                      key={i}
                      to={product.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <p className="font-medium text-gray-900">{product.label}</p>
                      <p className="text-sm text-gray-500">{product.description}</p>
                    </Link>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false) }}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => { navigate('/login/sales'); setMobileMenuOpen(false) }}
                    className="w-full bg-gradient-to-r from-[#1E5AAF] to-[#3B82F6] text-white"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
