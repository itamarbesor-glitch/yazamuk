'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'

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
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: '',
    dateOfBirth: '1990-01-01',
    taxId: '123-45-6789',
    streetAddress: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    password: '',
    confirmPassword: '',
  })

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
          // If existing user, they might need to log in first
          if (response.data.isExistingUser && !response.data.token) {
            // User exists but wasn't logged in - redirect to login with message
            router.push(`/login?redirect=/portfolio/${accountId}&message=Gift+claimed!+Please+log+in+to+view+your+portfolio`)
          } else {
            // New user or logged in - go to portfolio
            router.push(`/portfolio/${accountId}`)
          }
        } else {
          router.push(`/claim-success/${giftId}`)
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

  // Map stock symbols to image paths
  const stockImageMap: Record<string, string> = {
    'TSLA': '/images/tsla.png',
    'AAPL': '/images/aapl.png',
    'NVDA': '/images/nvda.png',
  }
  
  const stockImage = stockImageMap[gift.stockSymbol] || null

  // Show amazing loading view when claiming
  if (isClaiming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-6">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-mint-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-2xl w-full">
          <div className="glass rounded-xl overflow-hidden shadow-2xl">
            {/* Stock Image - Full Width Hero */}
            {stockImage && (
              <div className="relative w-full h-56 sm:h-64 md:h-80 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                <img 
                  src={stockImage} 
                  alt={gift.stockSymbol}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-slate-950/80 pt-20 sm:pt-24 md:pt-28 pb-3 sm:pb-4 md:pb-6 px-3 sm:px-4 md:px-6">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-mint-400 mb-1 sm:mb-2">
                    Congratulations! 🎉
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-white leading-tight">
                    We're creating your account and buying your {gift.stockSymbol} stock!
                  </p>
                </div>
              </div>
            )}
            
            {/* Loading Content */}
            <div className="p-4 sm:p-6 md:p-8 text-center">
              <div className="mb-4 sm:mb-6">
                {/* Animated Loader */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                    {/* Outer spinning ring */}
                    <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 border-r-pink-400 rounded-full animate-spin"></div>
                    
                    {/* Inner pulsing circle */}
                    <div className="absolute inset-3 sm:inset-4 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full animate-pulse"></div>
                    
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl sm:text-2xl md:text-3xl">📈</span>
                    </div>
                  </div>
                </div>
                
                {/* Loading Steps */}
                <div className="space-y-2.5 sm:space-y-3 text-left max-w-md mx-auto">
                  <div className="flex items-start sm:items-center space-x-2.5 sm:space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-mint-500 flex items-center justify-center mt-0.5 sm:mt-0">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">Setting up your Alpaca account...</p>
                  </div>
                  
                  <div className="flex items-start sm:items-center space-x-2.5 sm:space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-mint-500/50 flex items-center justify-center mt-0.5 sm:mt-0">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-mint-400 animate-pulse"></div>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed">Activating your account...</p>
                  </div>
                  
                  <div className="flex items-start sm:items-center space-x-2.5 sm:space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-700 flex items-center justify-center mt-0.5 sm:mt-0">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-500"></div>
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed">Transferring ${gift.amount.toFixed(2)} to your account...</p>
                  </div>
                  
                  <div className="flex items-start sm:items-center space-x-2.5 sm:space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-700 flex items-center justify-center mt-0.5 sm:mt-0">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-500"></div>
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed">Purchasing {gift.stockSymbol} stock...</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                This usually takes 10-20 seconds. Please don't close this page!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 sm:py-12 md:py-16 px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-mint-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Beta Disclaimer */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="text-base sm:text-lg flex-shrink-0">⚠️</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-amber-300 leading-relaxed">
                <strong className="font-semibold">Beta Version:</strong> This is a beta testing environment. All transactions use play money (Alpaca Sandbox) and are not real.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            You received a gift! 🎁
          </h1>
          <div className="glass rounded-xl overflow-hidden mb-4 sm:mb-6 shadow-xl">
            {/* Stock Image - Full Width Hero */}
            {stockImage && (
              <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                <img 
                  src={stockImage} 
                  alt={gift.stockSymbol}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-slate-950/80 pt-24 sm:pt-28 md:pt-32 pb-4 sm:pb-6 md:pb-8 px-4 sm:px-6 md:px-8">
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2">
                    You received a gift from <span className="text-mint-400">{gift.senderName}</span>
                  </p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-mint-400">
                    ${gift.amount.toFixed(2)} worth of {gift.stockSymbol}
                  </p>
                </div>
              </div>
            )}
            
            {/* Content below image */}
            <div className="p-4 sm:p-6 md:p-8">
              {!stockImage && (
                <>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-3 sm:mb-4">
                    You received a gift from <span className="text-cyan-400">{gift.senderName}</span>
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4 sm:mb-6">
                    ${gift.amount.toFixed(2)} worth of {gift.stockSymbol}
                  </p>
                </>
              )}
              <div className="space-y-2 sm:space-y-3">
                <p className="text-gray-300 text-base sm:text-lg">
                  Complete the form below to claim your gift
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Already have an account?{' '}
                  <a 
                    href="/login" 
                    className="text-mint-400 hover:text-mint-300 underline font-medium"
                  >
                    Log in to your profile
                  </a>
                  {' '}to claim this gift
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 md:space-y-6 shadow-xl">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 md:mb-6">Account Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="your@email.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Required for account creation and login
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="For Sandbox testing only"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is for Sandbox testing purposes only
            </p>
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
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zip Code *
              </label>
              <input
                type="text"
                required
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Password section - only show for new users */}
          <div className="border-t border-gray-700 pt-4 sm:pt-5 md:pt-6 mt-4 sm:mt-5 md:mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Account Setup</h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 leading-relaxed">
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500/50 transition-all text-white placeholder-gray-500"
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500/50 transition-all text-white placeholder-gray-500"
                  placeholder="Re-enter your password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isClaiming}
            className="w-full py-3 sm:py-4 text-base sm:text-lg bg-gradient-to-r from-mint-500 to-mint-600 text-white font-semibold rounded-xl hover:from-mint-600 hover:to-mint-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-mint-500/30"
          >
            {isClaiming ? 'Processing...' : 'Claim Gift'}
          </button>
        </form>
      </div>
    </div>
  )
}
