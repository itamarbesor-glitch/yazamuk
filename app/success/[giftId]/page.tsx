'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import Logo from '@/components/Logo'

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

          <div className="glass rounded-2xl p-8 sm:p-10 text-center shadow-2xl animate-fade-in">

        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-mint-400 to-mint-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-mint-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Gift Created!
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Your gift has been successfully sent
          </p>
        </div>

        {/* Gift Details */}
        <div className="mb-6 p-5 bg-gradient-to-r from-mint-500/10 to-purple-500/10 border border-mint-500/30 rounded-xl">
          <div className="text-4xl mb-3">📱</div>
          <p className="text-gray-200 text-base sm:text-lg mb-2 font-medium">
            {gift ? (
              <>
                <span className="text-mint-400 font-semibold">{gift.receiverName}</span> will receive a WhatsApp message to{' '}
                <span className="text-mint-400 font-semibold">{gift.receiverMobile || 'their phone number'}</span>
              </>
            ) : (
              'Your friend will receive a WhatsApp message'
            )}
          </p>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            {gift ? (
              <>
                We&apos;ve sent <span className="text-mint-400 font-semibold">{gift.receiverName}</span> a WhatsApp message with a link to claim their gift of{' '}
                <span className="text-mint-400 font-semibold">${gift.amount.toFixed(2)}</span> worth of{' '}
                <span className="text-mint-400 font-semibold">{gift.stockSymbol}</span> stock.
              </>
            ) : (
              'We&apos;ve sent your friend a WhatsApp message with a link to claim their gift.'
            )}
          </p>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            💡 Your friend will receive the WhatsApp message shortly. They can click the link in the message to claim their gift and set up their account.
          </p>
        </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-mint-500 to-mint-600 text-white font-semibold rounded-xl hover:from-mint-600 hover:to-mint-700 transition-all transform hover:scale-105 active:scale-95 text-sm sm:text-base shadow-lg shadow-mint-500/30"
              >
                Create Another Gift
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
