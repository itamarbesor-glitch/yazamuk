'use client'

import { useState, useEffect } from 'react'

interface MintboxLoaderProps {
  title: string
  subtitle?: string
  cyclingSubtitles?: string[]
  cycleInterval?: number
  showSecurityWarning?: boolean
  linearProgression?: boolean // If true, progress linearly and stop at end (no loop)
}

export default function MintboxLoader({ 
  title, 
  subtitle, 
  cyclingSubtitles, 
  cycleInterval = 1500,
  showSecurityWarning = false,
  linearProgression = false
}: MintboxLoaderProps) {
  const [statusIndex, setStatusIndex] = useState(0)
  const defaultCyclingMessages = ['Saving details...', 'Generating link...', 'Finalizing...']

  const messages = cyclingSubtitles || defaultCyclingMessages
  const displaySubtitle = subtitle || messages[statusIndex]

  useEffect(() => {
    if (!subtitle && cyclingSubtitles && cyclingSubtitles.length > 0) {
      const interval = setInterval(() => {
        if (linearProgression) {
          // Linear progression: advance until last message, then stop
          setStatusIndex((prev) => Math.min(prev + 1, messages.length - 1))
        } else {
          // Looping behavior (for gift creation)
          setStatusIndex((prev) => (prev + 1) % messages.length)
        }
      }, cycleInterval)
      return () => clearInterval(interval)
    }
  }, [subtitle, cyclingSubtitles, messages.length, cycleInterval, linearProgression])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="flex flex-col items-center max-w-md w-full">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#98FF98]/10 blur-3xl rounded-full"></div>
        
        {/* Reactor Centerpiece */}
        <div className="relative w-24 h-24 flex items-center justify-center z-10">
          {/* Spinning Glow Ring */}
          <div 
            className="absolute inset-[-10px] rounded-full border-2 border-transparent border-t-[#98FF98] animate-spin" 
            style={{ animationDuration: '3s' }}
          ></div>
          
          {/* Gift Box Logo with Pulse */}
          <div className="relative animate-pulse">
            <div className="w-16 h-16 bg-gradient-to-br from-mint-400 to-mint-600 rounded-lg flex items-center justify-center shadow-lg shadow-mint-500/30 relative overflow-visible">
              <span className="text-white font-bold text-2xl relative z-10">M</span>
              {/* Ribbon wrapping horizontally */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-mint-200/90 shadow-sm"></div>
              {/* Ribbon wrapping vertically */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 bg-mint-200/90 shadow-sm"></div>
              {/* Box lid effect */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-mint-500/50 rounded-t-lg"></div>
            </div>
            {/* Gift bow on top */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
              <div className="relative">
                {/* Bow center knot */}
                <div className="w-2.5 h-3 bg-mint-200 rounded-full mx-auto shadow-md"></div>
                {/* Left bow loop */}
                <div className="absolute -left-3.5 top-0 w-3.5 h-3.5 bg-mint-300 rounded-full shadow-sm"></div>
                {/* Right bow loop */}
                <div className="absolute -right-3.5 top-0 w-3.5 h-3.5 bg-mint-300 rounded-full shadow-sm"></div>
                {/* Ribbon tails */}
                <div className="absolute -left-4 top-3 w-0.5 h-3 bg-mint-400 rounded-full"></div>
                <div className="absolute -right-4 top-3 w-0.5 h-3 bg-mint-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Typography */}
        <h2 className="text-white font-bold text-xl mt-8 z-10 text-center">{title}</h2>
        <p className="text-[#98FF98] text-xs uppercase tracking-widest mt-2 z-10 transition-opacity duration-500 text-center">
          {displaySubtitle}
        </p>

        {/* Security Warning */}
        {showSecurityWarning && (
          <div className="mt-8 z-10 text-center space-y-2">
            <p className="text-yellow-200 text-sm font-medium">
              Please do not close or refresh this window.
            </p>
            <p className="text-gray-400 text-xs">
              This secure process may take up to 1 minute.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
