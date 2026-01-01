'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import Confetti from 'react-confetti'
import Logo from '@/components/Logo'
import FlyingLogos from '@/components/FlyingLogos'
import StockLogo from '@/components/StockLogo'

interface Gift {
  senderName: string
  receiverName: string
  receiverMobile: string | null
  amount: number
  stockSymbol: string
}

export default function SuccessPage() {
  const params = useParams()
  const giftId = params.giftId as string
  const [gift, setGift] = useState<Gift | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Set window dimensions for confetti
    setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
    
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleShareManually = async () => {
    const claimUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/claim/${giftId}`
      : ''
    
    try {
      await navigator.clipboard.writeText(claimUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback: show the URL
      alert(`Copy this link: ${claimUrl}`)
    }
  }

  useEffect(() => {
    const fetchGift = async () => {
      try {
        const response = await axios.get(`/api/gift/${giftId}`)
        setGift(response.data)
      } catch (error) {
        console.error('Error fetching gift:', error)
      } finally {
        setLoading(false)
      }
    }

    if (giftId) {
      fetchGift()
    }
  }, [giftId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="text-mint-400 text-xl">Loading...</div>
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

          <div className="bg-gradient-to-b from-white/10 to-transparent backdrop-blur-lg border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden animate-fade-in">
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
              {/* Success Icon */}
              <div className="mb-8">
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 animate-success-bounce">
                  <svg 
                    className="w-full h-full text-[#98FF98] drop-shadow-[0_0_15px_rgba(152,255,152,0.6)]" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Gift Created!
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  Your gift has been successfully sent
                </p>
              </div>

              {/* Gift Details - Matching Claim Page Style */}
              <div className="flex flex-col items-center gap-2 mb-8">
                {/* Step 1: Logo with Enhanced Glow Effect */}
                {gift?.stockSymbol && (
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
                <div className="text-7xl font-black text-white leading-none tracking-tight">
                  ${gift?.amount.toFixed(2) || '0.00'}
                </div>
                
                {/* Step 3: Ticker */}
                <div className="text-xl font-bold tracking-widest text-[#98FF98] uppercase">
                  {gift?.stockSymbol || 'STOCK'} STOCK
                </div>
              </div>

              {/* Delivery Status Section */}
              <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl overflow-hidden w-full">

                {/* Dashed Border Separator */}
                <div className="border-t border-dashed border-white/20"></div>

                {/* BOTTOM SECTION: The Delivery Status */}
                <div className="p-6 sm:p-8 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left Side: Delivery Info */}
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  <svg 
                    className="w-6 h-6 text-[#98FF98]" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#98FF98] text-base sm:text-lg font-semibold">✅ Sent via WhatsApp</span>
                  </div>
                  <p className="text-white font-bold text-base sm:text-lg mb-1">
                    {gift?.receiverName || 'Recipient'}
                  </p>
                  <p className="text-gray-400 text-sm sm:text-base">
                    {gift?.receiverMobile || '+1 (XXX) XXX-XXXX'}
                  </p>
                </div>
              </div>

              {/* Right Side: Share Manually Button */}
              <button
                onClick={handleShareManually}
                className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-all text-sm font-medium text-gray-300 hover:text-white whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-[#98FF98]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[#98FF98]">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Share Manually</span>
                  </>
                )}
              </button>
            </div>
          </div>
              </div>

              {/* Local Development Link - Subtle Footer Note */}
              {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
                <div className="mb-4 text-center w-full">
                  <p className="text-xs text-gray-600">
                    Local Development: {' '}
                    <a
                      href={`/claim/${giftId}`}
                      className="text-gray-500 underline hover:text-white break-all font-mono"
                    >
                      {window.location.origin}/claim/{giftId}
                    </a>
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <a
                  href="/"
                  className="flex-1 px-6 py-3 bg-[#98FF98] text-black font-semibold rounded-full hover:bg-[#85FF85] transition-all transform hover:scale-105 active:scale-95 text-sm sm:text-base shadow-[0_0_20px_rgba(152,255,152,0.4)]"
                >
                  Create Another Gift
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
