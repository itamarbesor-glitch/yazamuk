'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Logo from '@/components/Logo'
import StockLogo from '@/components/StockLogo'

export default function DevLoadingPage() {
  // Mock gift data for preview
  const mockGift = {
    stockSymbol: 'TSLA',
    amount: 119.98
  }
  
  const [showMintboxLogo, setShowMintboxLogo] = useState(true)
  
  // Flip animation between logos
  useEffect(() => {
    const interval = setInterval(() => {
      setShowMintboxLogo(prev => !prev)
    }, 1500) // Switch every 1.5 seconds
    return () => clearInterval(interval)
  }, [])

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
                      <div 
                        className={`text-white transition-all duration-700 ease-in-out ${!showMintboxLogo ? 'opacity-100 scale-100 rotate-y-0' : 'opacity-0 scale-75 rotate-y-180 absolute'}`}
                        style={{ 
                          transformStyle: 'preserve-3d',
                          backfaceVisibility: 'hidden'
                        }}
                      >
                        <StockLogo symbol={mockGift.stockSymbol} size="md" />
                      </div>
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
                    Waiting: Transferring ${mockGift.amount.toFixed(2)} to your account...
                  </div>
                  
                  <div className="text-gray-600 text-xs sm:text-sm">
                    Waiting: Purchasing {mockGift.stockSymbol} stock...
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

          {/* Dev Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              🛠️ Dev Preview - <a href="/" className="text-mint-400 hover:text-mint-300 underline">Back to Home</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
