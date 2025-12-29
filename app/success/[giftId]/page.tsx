'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'

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
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center px-4">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            Gift Created!
          </h1>
          <p className="text-gray-400 mb-4">
            Your gift has been successfully created
          </p>
        </div>

        <div className="mb-6 p-6 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 border border-cyan-500/30 rounded-xl">
          <div className="text-4xl mb-4">📱</div>
          <p className="text-gray-300 text-lg mb-2">
            {gift ? (
              <>
                <span className="text-cyan-400 font-semibold">{gift.receiverName}</span> will receive a WhatsApp message
              </>
            ) : (
              'Your friend will receive a WhatsApp message'
            )}
          </p>
          <p className="text-gray-400 text-sm">
            {gift ? (
              <>
                We&apos;ve sent <span className="text-cyan-400 font-semibold">{gift.receiverName}</span> a WhatsApp message with a link to claim their gift of{' '}
                <span className="text-green-400 font-semibold">${gift.amount}</span> worth of{' '}
                <span className="text-cyan-400 font-semibold">{gift.stockSymbol}</span> stock.
              </>
            ) : (
              'We&apos;ve sent your friend a WhatsApp message with a link to claim their gift.'
            )}
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400">
            💡 Your friend will receive the WhatsApp message shortly. They can click the link in the message to claim their gift and set up their account.
          </p>
        </div>

        <a
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-pink-600 transition-all transform hover:scale-105"
        >
          Create another gift
        </a>
      </div>
    </div>
  )
}
