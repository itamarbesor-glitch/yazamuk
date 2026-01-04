'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import Logo from '@/components/Logo'
import StockLogo from '@/components/StockLogo'
import FlyingLogos from '@/components/FlyingLogos'

interface Gift {
  id: string
  senderName: string
  receiverName: string
  receiverEmail: string
  amount: number
  stockSymbol: string
  status: string
}

export default function ClaimPage() {
  const params = useParams()
  const router = useRouter()
  const giftId = params.id as string
  const [gift, setGift] = useState<Gift | null>(null)
  const [loading, setLoading] = useState(true)
  const [isClaiming, setIsClaiming] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showMintboxLogo, setShowMintboxLogo] = useState(true)
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: '',
    dateOfBirth: '1990-01-01',
    taxId: '456789123',
    streetAddress: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    password: '',
    confirmPassword: '',
  })

  // Flip animation between logos
  useEffect(() => {
    if (isClaiming) {
      const interval = setInterval(() => {
        setShowMintboxLogo(prev => !prev)
      }, 1500) // Switch every 1.5 seconds
      return () => clearInterval(interval)
    }
  }, [isClaiming])

  useEffect(() => {
    const fetchGift = async () => {
      try {
        const response = await axios.get(`/api/gift/${giftId}`)
        setGift(response.data)
        // Pre-fill email if available, but it's optional now
        if (response.data.receiverEmail && !response.data.receiverEmail.includes('@whatsapp.temp')) {
          setFormData((prev) => ({
            ...prev,
            email: response.data.receiverEmail,
          }))
        }
        
        // Check if user already exists with this email
        try {
          const userCheck = await axios.post('/api/auth/check-user', {
            email: response.data.receiverEmail,
          })
          if (userCheck.data.exists) {
            // User exists - show simplified form or auto-claim option
            // For now, we'll just pre-fill and let them proceed
          }
        } catch (err) {
          // User doesn't exist, continue with full form
        }
      } catch (error) {
        console.error('Error fetching gift:', error)
        alert('Gift not found')
      } finally {
        setLoading(false)
      }
    }

    if (giftId) {
      fetchGift()
    }
  }, [giftId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user already exists
    let isExistingUser = false
    try {
      const userCheck = await axios.post('/api/auth/check-user', {
        email: formData.email,
      })
      isExistingUser = userCheck.data.exists && userCheck.data.hasAlpacaAccount
    } catch (err) {
      // User doesn't exist, continue with validation
    }

    // Validate password only for new users
    if (!isExistingUser) {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match')
        return
      }

      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters')
        return
      }
    }

    setIsClaiming(true)

    try {
      const response = await axios.post('/api/claim-gift', {
        giftId,
        ...formData,
      })

      if (response.data.success) {
        // Redirect directly to portfolio
        const accountId = response.data.accountId
        if (accountId) {
          // Use window.location.href for more reliable redirects on iOS Chrome
          // Add small delay to ensure page is ready
          setTimeout(() => {
            try {
              if (response.data.isExistingUser && !response.data.token) {
                // User exists but wasn't logged in - redirect to login with message
                const loginUrl = `/login?redirect=/portfolio/${accountId}&message=Gift+claimed!+Please+log+in+to+view+your+portfolio`
                window.location.href = loginUrl
              } else {
                // New user or logged in - go to portfolio
                window.location.href = `/portfolio/${accountId}`
              }
            } catch (error) {
              // Fallback to router.push if window.location fails
              console.error('Redirect error, using router.push:', error)
              if (response.data.isExistingUser && !response.data.token) {
                router.push(`/login?redirect=/portfolio/${accountId}&message=Gift+claimed!+Please+log+in+to+view+your+portfolio`)
              } else {
                router.push(`/portfolio/${accountId}`)
              }
            }
          }, 100)
        } else {
          setTimeout(() => {
            try {
              window.location.href = `/claim-success/${giftId}`
            } catch (error) {
              console.error('Redirect error, using router.push:', error)
              router.push(`/claim-success/${giftId}`)
            }
          }, 100)
        }
      } else {
        alert(response.data.error || 'Failed to claim gift')
      }
    } catch (error: any) {
      console.error('Error claiming gift:', error)
      alert(error.response?.data?.error || 'Failed to claim gift. Please try again.')
    } finally {
      setIsClaiming(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    )
  }

  if (!gift) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-red-400 text-xl">Gift not found</div>
      </div>
    )
  }

  // Show amazing loading view when claiming
  if (isClaiming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-mint-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-6 sm:py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 sm:mb-8 animate-fade-in">
              <Logo size="lg" />
              <a
                href="/login"
                className="text-sm sm:text-base text-gray-400 hover:text-mint-400 transition-colors font-medium"
              >
                Sign In
              </a>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Loading Content */}
              <div className="p-4 sm:p-6 md:p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2 sm:mb-3">
                  Finalizing Your Gift...
                </h2>
                <p className="text-sm text-gray-400 mb-6 sm:mb-8 leading-relaxed">
                  Securely minting your portfolio assets.
                </p>
                <div className="mb-6 sm:mb-8">
                  {/* Animated Loader with Stock Logo */}
                  <div className="flex justify-center mb-6 sm:mb-8">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28">
                      {/* Outer spinning ring - Mint Green Glowing */}
                      <div className="absolute inset-0 border-4 border-[#98FF98]/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-transparent border-t-[#98FF98] border-r-[#98FF98] rounded-full animate-spin shadow-[0_0_20px_rgba(152,255,152,0.5)]"></div>
                      
                    {/* Center Logo - Flipping between Mintbox and Stock Logo */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className={`transition-all duration-700 ease-in-out ${showMintboxLogo ? 'opacity-100 scale-100 rotate-y-0' : 'opacity-0 scale-75 rotate-y-180 absolute'}`}
                        style={{ 
                          transformStyle: 'preserve-3d',
                          backfaceVisibility: 'hidden'
                        }}
                      >
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14">
                          <div className="w-full h-full bg-gradient-to-br from-mint-400 to-mint-600 rounded-lg flex items-center justify-center shadow-lg shadow-mint-500/30 relative overflow-visible">
                            <span className="text-white font-bold text-base sm:text-lg md:text-xl relative z-10">M</span>
                            {/* Ribbon wrapping horizontally */}
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-mint-200/90 shadow-sm"></div>
                            {/* Ribbon wrapping vertically */}
                            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-mint-200/90 shadow-sm"></div>
                            {/* Box lid effect */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-mint-500/50 rounded-t-lg"></div>
                          </div>
                          {/* Gift bow on top - smaller */}
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10">
                            <div className="relative">
                              {/* Bow center knot */}
                              <div className="w-1.5 h-2 bg-mint-200 rounded-full mx-auto shadow-md"></div>
                              {/* Left bow loop */}
                              <div className="absolute -left-2 top-0 w-2 h-2 bg-mint-300 rounded-full shadow-sm"></div>
                              {/* Right bow loop */}
                              <div className="absolute -right-2 top-0 w-2 h-2 bg-mint-300 rounded-full shadow-sm"></div>
                              {/* Ribbon tails */}
                              <div className="absolute -left-2.5 top-2 w-0.5 h-2 bg-mint-400 rounded-full"></div>
                              <div className="absolute -right-2.5 top-2 w-0.5 h-2 bg-mint-400 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {gift && (
                        <div 
                          className={`text-white transition-all duration-700 ease-in-out ${!showMintboxLogo ? 'opacity-100 scale-100 rotate-y-0' : 'opacity-0 scale-75 rotate-y-180 absolute'}`}
                          style={{ 
                            transformStyle: 'preserve-3d',
                            backfaceVisibility: 'hidden'
                          }}
                        >
                          <StockLogo symbol={gift.stockSymbol} size="md" />
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                  
                {/* Status List - Terminal Look */}
                <div className="bg-black/40 rounded-xl p-6 border border-white/5 font-mono text-left max-w-md mx-auto space-y-2.5 sm:space-y-3">
                  <div className="text-green-400 text-xs sm:text-sm">
                    [SUCCESS] Setting up your Alpaca account...
                  </div>
                  
                  <div className="text-white text-xs sm:text-sm flex items-center">
                    <span>&gt; Activating your account...</span>
                    <span className="ml-1 animate-pulse">|</span>
                  </div>
                  
                  <div className="text-gray-600 text-xs sm:text-sm">
                    Waiting: Transferring ${gift.amount.toFixed(2)} to your account...
                  </div>
                  
                  <div className="text-gray-600 text-xs sm:text-sm">
                    Waiting: Purchasing {gift.stockSymbol} stock...
                  </div>
                </div>
                </div>
                
                {/* Footer - System Note */}
                <div className="flex items-center justify-center gap-2 text-gray-500 text-xs sm:text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="leading-relaxed">
                    This usually takes 10-20 seconds. Secure transaction in progress. Please don't close this window.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Flying Logos Animation */}
      {gift && <FlyingLogos symbol={gift.stockSymbol} duration={3000} />}
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-mint-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 sm:mb-8 animate-fade-in">
            <Logo size="lg" />
            <a
              href="/login"
              className="text-sm sm:text-base text-gray-400 hover:text-mint-400 transition-colors font-medium"
            >
              Sign In
            </a>
          </div>

          {/* VIEW 1: The Reveal - Gift Card Only */}
          {!showForm && (
            <div className={`transition-all duration-500 ${showForm ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {/* Beta Disclaimer - Subtle Footer Note */}
              <div className="mb-4 sm:mb-6 text-center">
                <p className="text-xs text-gray-600">
                  <span className="text-amber-400">⚠️ Beta Version:</span> This is a beta testing environment. All transactions use play money (Alpaca Sandbox) and are not real.
                </p>
              </div>

              {/* Digital Gift Card - Hero Section */}
              <div className="mb-8 sm:mb-10">
                <div className="bg-gradient-to-b from-white/10 to-transparent backdrop-blur-lg border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
                  {/* Enhanced ambient glow behind logo */}
                  {gift && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div 
                        className="w-64 h-64 rounded-full blur-3xl"
                        style={{
                          background: 'radial-gradient(circle, rgba(152, 255, 152, 0.25) 0%, transparent 70%)'
                        }}
                      ></div>
                    </div>
                  )}
                  
                  <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Headline */}
                    <p className="text-sm sm:text-base tracking-[0.2em] text-[#98FF98] uppercase mb-4 font-semibold">
                      YOU RECEIVED A STOCK GIFT
                    </p>
                    
                    {/* Sender Badge/Pill */}
                    <div className="bg-white/10 rounded-full px-6 py-2 border border-white/10 flex items-center gap-3 mb-6">
                      <span className="text-lg">🎁</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-sm">Gift from</span>
                        <span className="text-white font-bold text-base break-words">{gift.senderName}</span>
                      </div>
                    </div>
                    
                    {/* MIDDLE: Hero Asset - Vertical Stack (Tightened) */}
                    <div className="flex flex-col items-center gap-2 mb-8 sm:mb-10 mt-6">
                      {/* Step 1: Logo with Enhanced Glow Effect */}
                      {gift && (
                        <div className="w-28 h-28 flex items-center justify-center relative -mb-1">
                          {/* Backlight Glow - Radial Gradient Effect */}
                          <div 
                            className="absolute -inset-4 rounded-full -z-10 blur-3xl"
                            style={{
                              background: 'radial-gradient(circle, rgba(152, 255, 152, 0.3) 0%, transparent 70%)'
                            }}
                          ></div>
                          {/* Logo SVG */}
                          <div className="relative z-10 drop-shadow-[0_0_15px_rgba(152,255,152,0.6)] scale-[1.65]">
                            <StockLogo symbol={gift.stockSymbol} size="lg" />
                          </div>
                        </div>
                      )}
                      
                      {/* Step 2: Price */}
                      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight break-words">
                        ${gift.amount.toFixed(2)}
                      </div>
                      
                      {/* Step 3: Ticker */}
                      <div className="text-xl font-bold tracking-widest text-[#98FF98] uppercase">
                        {gift.stockSymbol} STOCK
                      </div>
                    </div>
                    
                    {/* Claim Button */}
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full py-4 text-lg bg-[#98FF98] text-black font-semibold rounded-full hover:bg-[#85FF85] transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(152,255,152,0.4)]"
                    >
                      Claim Your ${gift.amount.toFixed(2)} Gift
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: The Sign Up - Form with Mini Summary */}
          {showForm && (
            <div className={`transition-all duration-500 ${showForm ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              {/* Locked Asset Bar */}
              {gift && (
                <div className="w-full bg-[#98FF98]/5 border border-[#98FF98]/20 rounded-xl p-4 flex items-center justify-between mb-6 animate-pulse" style={{ boxShadow: '0 0 20px rgba(152, 255, 152, 0.1)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔒</span>
                    <span className="text-gray-400 text-xs uppercase tracking-wide">Pending Asset</span>
                  </div>
                  <div className="text-white font-bold text-lg">
                    ${gift.amount.toFixed(2)} {gift.stockSymbol}
                  </div>
                </div>
              )}

              {/* Form Header */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 break-words">
                  Create your account to claim assets
                </h2>
                <p className="text-gray-400 text-sm mb-3 break-words">
                  Complete the form below to claim your gift
                </p>
                {/* Already have account message */}
                <p className="text-xs text-gray-500 text-left">
                  Already have a Mintbox account?{' '}
                  <a 
                    href="/login" 
                    className="text-mint-400 hover:text-mint-300 underline"
                  >
                    Log in to your profile
                  </a>
                  {' '}to claim this gift
                </p>
              </div>

              {/* Form Container */}
              <form onSubmit={handleSubmit} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 shadow-2xl relative">
                {/* Back Button - Inside Card */}
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="absolute top-4 left-4 z-20 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                  aria-label="Back to gift card"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {/* Section 1: Identity Verification */}
                <div className="space-y-4 sm:space-y-5">
                  <div className="mb-4 mt-6">
                    <h2 className="text-xs font-bold text-[#98FF98] uppercase tracking-[0.15em] mb-4">
                      1. IDENTITY VERIFICATION
                    </h2>
                    <div className="border-b border-white/5"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all text-white placeholder-gray-400"
                placeholder="your@email.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Required for account creation and login
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tax ID / SSN *
                </label>
                <input
                  type="text"
                  required
                  value={formData.taxId}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, '')
                    setFormData({ ...formData, taxId: value })
                  }}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all text-white placeholder-gray-400"
                  placeholder="123456789 (numbers only)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is for Sandbox testing purposes only
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all text-white placeholder-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all text-white placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
            </div>

                {/* Section 2: Account Setup */}
                <div className="border-t border-white/10 pt-6 sm:pt-8">
                  <div className="mb-4 mt-6">
                    <h2 className="text-xs font-bold text-[#98FF98] uppercase tracking-[0.15em] mb-4">
                      2. ACCOUNT SETUP
                    </h2>
                    <div className="border-b border-white/5"></div>
                  </div>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-5 leading-relaxed">
              {formData.email ? (
                <>If you already have an account with {formData.email}, you can skip the password fields below. Otherwise, set up a password to access your portfolio later.</>
              ) : (
                <>Set up a password so you can log in later to view your portfolio</>
              )}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password {formData.email ? '(optional if you already have an account)' : '*'}
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all text-white placeholder-gray-400"
                  placeholder="At least 6 characters (optional for existing users)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password {formData.email ? '(optional if you already have an account)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all text-white placeholder-gray-400"
                  placeholder="Re-enter your password"
                />
              </div>
            </div>
            </div>

                <button
                  type="submit"
                  disabled={isClaiming}
                  className="w-full py-3 sm:py-4 min-h-[48px] text-base sm:text-lg bg-[#98FF98] text-black font-semibold rounded-full hover:bg-[#85FF85] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_0_20px_rgba(152,255,152,0.4)]"
                >
                  {isClaiming ? 'Processing...' : 'Complete Claim'}
                </button>

                {/* Beta Disclaimer - Footer Note */}
                <div className="mt-4">
                  <p className="text-xs text-gray-600 text-center">
                    <span className="text-amber-400">⚠️ Beta Version:</span> This is a beta testing environment. All transactions use play money (Alpaca Sandbox) and are not real.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
