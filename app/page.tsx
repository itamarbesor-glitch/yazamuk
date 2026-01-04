'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import Logo from '@/components/Logo'
import StockLogo from '@/components/StockLogo'

const STOCKS = [
  { symbol: 'TSLA', name: 'Tesla', color: 'from-gray-400 to-gray-600' },
  { symbol: 'AAPL', name: 'Apple', color: 'from-gray-400 to-gray-600' },
  { symbol: 'NVDA', name: 'NVIDIA', color: 'from-gray-400 to-gray-600' },
]

const COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+972', country: 'IL', flag: '🇮🇱' },
]

export default function Home() {
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    senderName: '',
    senderMobile: '',
    receiverName: '',
    receiverEmail: '',
    receiverMobile: '',
    amount: '',
    stockSymbol: '',
  })
  const [senderCountryCode, setSenderCountryCode] = useState('+1')
  const [receiverCountryCode, setReceiverCountryCode] = useState('+1')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Format phone number based on country code
  const formatPhoneNumber = (value: string, countryCode: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // US/Canada format: (XXX) XXX-XXXX (10 digits)
    if (countryCode === '+1') {
      if (digits.length <= 3) return digits
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
    
    // Israel format: XX-XXX-XXXX (9 digits after country code, but we show 10 digits including leading 0)
    if (countryCode === '+972') {
      if (digits.length <= 2) return digits
      if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`
      return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 9)}`
    }
    
    // For other countries, just limit to 15 digits (international standard)
    return digits.slice(0, 15)
  }

  // Get max length for phone input based on country
  const getMaxPhoneLength = (countryCode: string): number => {
    if (countryCode === '+1') return 14 // (XXX) XXX-XXXX format length
    if (countryCode === '+972') return 12 // XX-XXX-XXXX format length
    return 15 // International standard
  }

  // Get unformatted phone number (digits only)
  const getUnformattedPhone = (value: string): string => {
    return value.replace(/\D/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.stockSymbol) {
      alert('Please select a stock')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount < 1) {
      alert('Please enter a valid amount (minimum $1)')
      return
    }

    if (amount > 500) {
      alert('Beta limit: Maximum gift amount is $500. Please enter a lower amount.')
      return
    }

    setIsSubmitting(true)
    try {
      // Get unformatted phone numbers (digits only) before submitting
      const senderPhoneDigits = getUnformattedPhone(formData.senderMobile)
      const receiverPhoneDigits = getUnformattedPhone(formData.receiverMobile)
      
      const response = await axios.post('/api/create-gift', {
        ...formData,
        senderMobile: senderCountryCode + senderPhoneDigits,
        receiverMobile: receiverCountryCode + receiverPhoneDigits,
        amount: parseFloat(formData.amount),
      })
      
      if (response.data.giftId) {
        // Use window.location.href for more reliable redirects on iOS Chrome
        // Add small delay to ensure page is ready
        setTimeout(() => {
          try {
            window.location.href = `/success/${response.data.giftId}`
          } catch (error) {
            // Fallback to router.push if window.location fails
            console.error('Redirect error, using router.push:', error)
            router.push(`/success/${response.data.giftId}`)
          }
        }, 100)
      } else {
        throw new Error('No gift ID returned')
      }
    } catch (error: any) {
      console.error('Error creating gift:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create gift. Please try again.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-mint-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative">
        {/* Header */}
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex justify-between items-center animate-fade-in">
            <Logo size="lg" />
            <a
              href="/login"
              className="text-sm sm:text-base text-gray-400 hover:text-mint-400 transition-colors font-medium"
            >
              Sign In
            </a>
          </div>
        </div>

        {/* Hero Section - Full Width */}
        <div className="w-full mb-16 sm:mb-20 md:mb-24 py-16 md:py-20 animate-slide-up">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
              {/* Left Side - Text Content */}
              <div className="text-center md:text-left flex flex-col justify-start items-center md:items-start">
                <h1 className="text-5xl sm:text-6xl md:text-6xl font-bold mb-4 sm:mb-5 leading-[1.1] tracking-tight">
                  <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent inline-block">
                    The Gift That Grows.
                  </span>
                </h1>
                <p className="text-lg sm:text-xl md:text-xl text-gray-400 mb-5 sm:mb-6 leading-relaxed">
                  Don&apos;t just give cash. Give a piece of the future. Send stocks like Tesla, Apple, and NVIDIA instantly via WhatsApp.
                </p>
                <button
                  onClick={scrollToForm}
                  className="px-6 py-3 bg-[#98FF98] text-black rounded-full font-semibold text-sm sm:text-base hover:bg-[#85FF85] transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(152,255,152,0.4)] w-fit"
                >
                  Start Gifting
                </button>
              </div>

              {/* Right Side - Image */}
              <div className="flex justify-center md:justify-start relative items-start md:ml-24">
                <div className="relative w-full max-w-[90vw] sm:max-w-[28rem] md:max-w-[33.6rem]">
                  {/* Glow blob behind image */}
                  <div className="absolute inset-0 bg-mint-500/20 rounded-3xl blur-3xl transform scale-110 pointer-events-none" style={{ zIndex: 0 }}></div>
                  
                  {/* Image without container */}
                  <div className="relative" style={{ zIndex: 1 }}>
                    <Image
                      src="/images/design/hero-mockup.png"
                      alt="Mintbox Hero Mockup"
                      width={800}
                      height={600}
                      className="object-contain w-full h-auto"
                      style={{ 
                        border: 'none',
                        outline: 'none',
                        display: 'block'
                      }}
                      sizes="(max-width: 640px) 90vw, (max-width: 768px) 28rem, 33.6rem"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div ref={formRef} className="container mx-auto px-4 pb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Send a Gift in Seconds
              </span>
            </h2>

          {/* Form Card */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sender Info */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Your Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.senderName}
                      onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                      className="w-full px-4 py-3 text-base bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500/50 transition-all text-white placeholder-gray-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Mobile Number
                    </label>
                    <div className="flex gap-1.5 sm:gap-2">
                      <div className="relative flex-shrink-0">
                        <select
                          value={senderCountryCode}
                          onChange={(e) => {
                            setSenderCountryCode(e.target.value)
                            // Reformat phone number when country code changes
                            const digits = getUnformattedPhone(formData.senderMobile)
                            const formatted = formatPhoneNumber(digits, e.target.value)
                            setFormData({ ...formData, senderMobile: formatted })
                          }}
                          className="appearance-none bg-black/20 border border-white/10 rounded-xl px-2.5 sm:px-3 py-3 pr-7 sm:pr-8 text-white text-xs sm:text-sm focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all cursor-pointer w-auto"
                        >
                          {COUNTRY_CODES.map((country) => (
                            <option key={country.code} value={country.code} className="bg-black">
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 sm:pr-2 pointer-events-none">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <input
                        type="tel"
                        required
                        value={formData.senderMobile}
                        onChange={(e) => {
                          const inputValue = e.target.value
                          // Remove any existing country code if user types one
                          const cleaned = inputValue.replace(/^\+\d+/, '')
                          const formatted = formatPhoneNumber(cleaned, senderCountryCode)
                          const maxLength = getMaxPhoneLength(senderCountryCode)
                          if (formatted.length <= maxLength) {
                            setFormData({ ...formData, senderMobile: formatted })
                          }
                        }}
                        maxLength={getMaxPhoneLength(senderCountryCode)}
                        className="flex-1 min-w-0 px-3 sm:px-4 py-3 text-base bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all text-white placeholder-gray-400"
                        placeholder={senderCountryCode === '+1' ? '(123) 456-7890' : senderCountryCode === '+972' ? '50-123-4567' : '1234567890'}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">Country code selected automatically</p>
                  </div>
                </div>
              </div>

              {/* Receiver Info */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Recipient Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.receiverName}
                      onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                      className="w-full px-4 py-3 text-base bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-500 focus:border-mint-500/50 transition-all text-white placeholder-gray-500"
                      placeholder="Jane Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Recipient Mobile Number
                    </label>
                    <div className="flex gap-1.5 sm:gap-2">
                      <div className="relative flex-shrink-0">
                        <select
                          value={receiverCountryCode}
                          onChange={(e) => {
                            setReceiverCountryCode(e.target.value)
                            // Reformat phone number when country code changes
                            const digits = getUnformattedPhone(formData.receiverMobile)
                            const formatted = formatPhoneNumber(digits, e.target.value)
                            setFormData({ ...formData, receiverMobile: formatted })
                          }}
                          className="appearance-none bg-black/20 border border-white/10 rounded-xl px-2.5 sm:px-3 py-3 pr-7 sm:pr-8 text-white text-xs sm:text-sm focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all cursor-pointer w-auto"
                        >
                          {COUNTRY_CODES.map((country) => (
                            <option key={country.code} value={country.code} className="bg-black">
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 sm:pr-2 pointer-events-none">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <input
                        type="tel"
                        required
                        value={formData.receiverMobile}
                        onChange={(e) => {
                          const inputValue = e.target.value
                          // Remove any existing country code if user types one
                          const cleaned = inputValue.replace(/^\+\d+/, '')
                          const formatted = formatPhoneNumber(cleaned, receiverCountryCode)
                          const maxLength = getMaxPhoneLength(receiverCountryCode)
                          if (formatted.length <= maxLength) {
                            setFormData({ ...formData, receiverMobile: formatted })
                          }
                        }}
                        maxLength={getMaxPhoneLength(receiverCountryCode)}
                        className="flex-1 min-w-0 px-3 sm:px-4 py-3 text-base bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all text-white placeholder-gray-400"
                        placeholder={receiverCountryCode === '+1' ? '(123) 456-7890' : receiverCountryCode === '+972' ? '50-123-4567' : '1234567890'}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">They'll receive a WhatsApp message</p>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gift Amount (Max $500 for Beta)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">$</span>
                  <input
                    type="number"
                    required
                    min="1"
                    max="500"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => {
                      const value = e.target.value
                      // Only allow values up to 500
                      if (value === '' || (parseFloat(value) >= 1 && parseFloat(value) <= 500)) {
                        setFormData({ ...formData, amount: value })
                      }
                    }}
                    className="w-full pl-8 pr-4 py-3 text-base bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-[#98FF98] focus:ring-1 focus:ring-[#98FF98] transition-all text-white placeholder-gray-400"
                      placeholder="100.00"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Beta limit: Maximum $500 per gift
                </p>
              </div>

              {/* Stock Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Choose a Stock
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {STOCKS.map((stock) => (
                    <button
                      key={stock.symbol}
                      type="button"
                      onClick={() => setFormData({ ...formData, stockSymbol: stock.symbol })}
                      className={`group relative p-5 rounded-xl transition-all card-hover ${
                        formData.stockSymbol === stock.symbol
                          ? 'border-2 border-[#98FF98] bg-[#98FF98]/10'
                          : 'border-2 border-transparent bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="mb-3 flex justify-center">
                        <div className="text-mint-400">
                          <StockLogo symbol={stock.symbol} size="md" />
                        </div>
                      </div>
                      <div className="text-xl font-bold text-white mb-1">{stock.symbol}</div>
                      <div className="text-xs text-gray-400">{stock.name}</div>
                      {formData.stockSymbol === stock.symbol && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-[#98FF98] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 min-h-[48px] bg-[#98FF98] text-black rounded-full font-semibold hover:bg-[#85FF85] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-[0_0_20px_rgba(152,255,152,0.4)] text-base"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Gift...
                  </span>
                ) : (
                  'Create Gift'
                )}
              </button>
            </form>
            
            {/* Beta Disclaimer - Footer Note */}
            <div className="mt-4">
              <p className="text-xs text-gray-600 text-center">
                <span className="text-amber-400">⚠️ Beta Version:</span> This is a beta testing environment. All transactions use play money (Alpaca Sandbox) and are not real.
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 sm:mt-12 text-center animate-fade-in">
            <p className="text-sm text-gray-500 mb-4">Trusted by investors worldwide</p>
            <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-mint-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-mint-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span>Real Stocks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-mint-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Instant</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
