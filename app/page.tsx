'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const STOCKS = [
  { symbol: 'TSLA', name: 'Tesla', color: 'from-red-500 to-pink-500' },
  { symbol: 'AAPL', name: 'Apple', color: 'from-gray-500 to-gray-700' },
  { symbol: 'NVDA', name: 'NVIDIA', color: 'from-green-500 to-emerald-500' },
]

export default function Home() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    senderName: '',
    senderMobile: '',
    receiverName: '',
    receiverEmail: '',
    receiverMobile: '',
    amount: '',
    stockSymbol: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.stockSymbol) {
      alert('Please select a stock')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axios.post('/api/create-gift', {
        ...formData,
        amount: parseFloat(formData.amount),
      })
      
      if (response.data.giftId) {
        router.push(`/success/${response.data.giftId}`)
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
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Yazamuk
            </h1>
            <a
              href="/login"
              className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm sm:text-base"
            >
              Login
            </a>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-12">
            Gift stocks to your friends
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.senderMobile}
                  onChange={(e) => setFormData({ ...formData, senderMobile: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="+1234567890"
                />
                <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Receiver Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="Jane Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Receiver Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.receiverMobile}
                  onChange={(e) => setFormData({ ...formData, receiverMobile: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="+1234567890"
                />
                <p className="text-xs text-gray-500 mt-1">They'll receive a WhatsApp message</p>
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gift Amount ($)
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                placeholder="100.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Select Stock
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {STOCKS.map((stock) => (
                  <button
                    key={stock.symbol}
                    type="button"
                    onClick={() => setFormData({ ...formData, stockSymbol: stock.symbol })}
                    className={`p-4 sm:p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      formData.stockSymbol === stock.symbol
                        ? 'border-cyan-400 bg-gradient-to-br ' + stock.color + ' shadow-lg shadow-cyan-500/50'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-xl sm:text-2xl font-bold mb-1">{stock.symbol}</div>
                    <div className="text-xs sm:text-sm text-gray-400">{stock.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-pink-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Create Gift'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
