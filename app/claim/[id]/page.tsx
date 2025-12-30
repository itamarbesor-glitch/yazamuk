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
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    taxId: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
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
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            {/* Stock Image - Full Width Hero */}
            {stockImage && (
              <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                <img 
                  src={stockImage} 
                  alt={gift.stockSymbol}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent pt-16 sm:pt-20 md:pt-24 pb-4 sm:pb-6 md:pb-8 px-4 sm:px-6 md:px-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                    Congratulations! 🎉
                  </h2>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
                    We're creating your account and buying your {gift.stockSymbol} stock!
                  </p>
                </div>
              </div>
            )}
            
            {/* Loading Content */}
            <div className="p-6 sm:p-8 md:p-10 text-center">
              <div className="mb-6 sm:mb-8">
                {/* Animated Loader */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                    {/* Outer spinning ring */}
                    <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 border-r-pink-400 rounded-full animate-spin"></div>
                    
                    {/* Inner pulsing circle */}
                    <div className="absolute inset-4 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full animate-pulse"></div>
                    
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl">📈</span>
                    </div>
                  </div>
                </div>
                
                {/* Loading Steps */}
                <div className="space-y-3 sm:space-y-4 text-left max-w-md mx-auto">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-sm sm:text-base">Setting up your Alpaca account...</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/50 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base">Activating your account...</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    </div>
                    <p className="text-gray-500 text-sm sm:text-base">Transferring ${gift.amount.toFixed(2)} to your account...</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    </div>
                    <p className="text-gray-500 text-sm sm:text-base">Purchasing {gift.stockSymbol} stock...</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-400 text-xs sm:text-sm">
                This usually takes 10-20 seconds. Please don't close this page!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black py-8 sm:py-12 md:py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            You received a gift! 🎁
          </h1>
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden mb-4 sm:mb-6">
            {/* Stock Image - Full Width Hero */}
            {stockImage && (
              <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                <img 
                  src={stockImage} 
                  alt={gift.stockSymbol}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent pt-16 sm:pt-20 md:pt-24 pb-4 sm:pb-6 md:pb-8 px-4 sm:px-6 md:px-8">
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2">
                    You received a gift from <span className="text-cyan-400">{gift.senderName}</span>
                  </p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400">
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
                    className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                  >
                    Log in to your profile
                  </a>
                  {' '}to claim this gift
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Account Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Password section - only show for new users */}
          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Account Setup</h3>
            <p className="text-sm text-gray-400 mb-4">
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
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Re-enter your password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isClaiming}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-pink-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClaiming ? 'Processing...' : 'Claim Gift'}
          </button>
        </form>
      </div>
    </div>
  )
}
