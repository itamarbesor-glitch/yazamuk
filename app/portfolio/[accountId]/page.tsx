'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'

interface Position {
  symbol: string
  qty: string
  market_value: string
  cost_basis: string
  unrealized_pl: string
  unrealized_plpc: string
  current_price: string
}

interface AccountInfo {
  cash: string
  buying_power: string
  equity: string
}

interface Order {
  id: string
  symbol: string
  side: string
  qty: string
  filled_qty: string
  filled_avg_price: string
  notional: string
  status: string
  order_type: string
  time_in_force: string
  submitted_at: string
  filled_at: string | null
}

export default function PortfolioPage() {
  const params = useParams()
  const router = useRouter()
  const accountId = params.accountId as string
  const [positions, setPositions] = useState<Position[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/me', {
          withCredentials: true,
        })
        if (response.data.user) {
          setUser(response.data.user)
          
          // If user has different account ID, redirect them
          if (response.data.user.alpacaAccountId && response.data.user.alpacaAccountId !== accountId) {
            router.push(`/portfolio/${response.data.user.alpacaAccountId}`)
            return
          }
        }
      } catch (err) {
        // Not authenticated - redirect to login
        router.push(`/login?redirect=/portfolio/${accountId}`)
        return
      }
      
      // Only fetch data if authenticated
      fetchData()
    }
    checkAuth()
  }, [accountId, router])

  const fetchData = async () => {
    try {
      // Fetch positions and account info
      const positionsResponse = await axios.get(`/api/positions/${accountId}`)
      setPositions(positionsResponse.data.positions || [])
      setAccountInfo(positionsResponse.data.account)

      // Fetch orders
      const ordersResponse = await axios.get(`/api/orders/${accountId}?status=all`)
      const allOrders = ordersResponse.data.orders || []
      setOrders(allOrders)

      // Show welcome message if this is a new account (no positions, has recent buy orders)
      const recentBuyOrders = allOrders.filter((o: Order) => 
        o.side === 'buy' && 
        (o.status === 'new' || o.status === 'accepted' || o.status === 'pending_new' || o.status === 'partially_filled')
      )
      const currentPositions = positionsResponse.data.positions || []
      if (currentPositions.length === 0 && recentBuyOrders.length > 0) {
        setShowWelcome(true)
      }
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.response?.data?.error || 'Failed to load portfolio')
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh every 5 seconds if there are pending orders
  useEffect(() => {
    if (!user) return // Don't set up refresh if not authenticated
    
    const interval = setInterval(() => {
      const hasPendingOrders = orders.some((o: Order) => 
        o.status === 'new' || o.status === 'accepted' || o.status === 'pending_new' || o.status === 'partially_filled'
      )
      if (hasPendingOrders) {
        fetchData()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [orders, user])

  const formatCurrency = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return '$0.00'
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  const formatNumber = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return '0.00'
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '0.00'
    return num.toFixed(2)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'filled':
      case 'done_for_day':
        return 'text-green-400'
      case 'new':
      case 'accepted':
      case 'pending_new':
        return 'text-yellow-400'
      case 'partially_filled':
        return 'text-blue-400'
      case 'canceled':
      case 'expired':
      case 'rejected':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'new': 'New',
      'accepted': 'Accepted',
      'pending_new': 'Pending',
      'partially_filled': 'Partially Filled',
      'filled': 'Filled',
      'done_for_day': 'Completed',
      'canceled': 'Canceled',
      'expired': 'Expired',
      'rejected': 'Rejected',
    }
    return statusMap[status.toLowerCase()] || status
  }

  const totalPortfolioValue = positions.reduce((sum, pos) => {
    return sum + parseFloat(pos.market_value || '0')
  }, 0)

  const totalUnrealizedPL = positions.reduce((sum, pos) => {
    return sum + parseFloat(pos.unrealized_pl || '0')
  }, 0)

  // Filter orders: show open/pending first, then recent filled
  const openOrders = orders.filter((o: Order) => 
    ['new', 'accepted', 'pending_new', 'partially_filled'].includes(o.status.toLowerCase())
  )
  const recentFilledOrders = orders
    .filter((o: Order) => o.status.toLowerCase() === 'filled')
    .sort((a, b) => new Date(b.filled_at || b.submitted_at).getTime() - new Date(a.filled_at || a.submitted_at).getTime())
    .slice(0, 5) // Show last 5 filled orders

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading portfolio...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-900 border border-red-500 rounded-2xl p-8 text-center">
          <div className="text-red-400 text-xl mb-4">Error</div>
          <div className="text-gray-300">{error}</div>
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

      <div className="relative max-w-6xl mx-auto">
        {/* Beta Disclaimer */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="text-base sm:text-lg flex-shrink-0">⚠️</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-amber-300 leading-relaxed">
                <strong className="font-semibold">Beta Version:</strong> This is a beta testing environment using Alpaca Sandbox. All money shown is play money and not real. No actual funds are involved.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Your Portfolio
            </h1>
            <p className="text-sm sm:text-base text-gray-400">Track your stocks and their current value</p>
          </div>
          {user && (
            <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="text-xs sm:text-sm text-gray-400">Logged in as</div>
              <div className="text-mint-400 font-semibold text-sm sm:text-base break-all">{user.email}</div>
              <button
                onClick={async () => {
                  try {
                    await axios.post('/api/auth/logout')
                  } catch (err) {
                    // Ignore errors
                  }
                  router.push('/login')
                }}
                className="text-xs text-gray-500 hover:text-gray-300 mt-1"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Welcome Message */}
        {showWelcome && (
          <div className="mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-mint-500/10 to-purple-500/10 border border-mint-500/30 rounded-xl p-3 sm:p-4 md:p-6">
            <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
              <div className="text-xl sm:text-2xl md:text-4xl flex-shrink-0">🎉</div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-mint-400 mb-1.5 sm:mb-2">Welcome to Your Portfolio!</h2>
                <p className="text-gray-300 mb-2 sm:mb-3 text-sm sm:text-base leading-relaxed">
                  Your gift has been received and your account has been set up! Here's what's happening:
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-1 mb-3 sm:mb-4 text-xs sm:text-sm">
                  <li><span className="text-yellow-400">Pending Orders</span> - Your buy order is being processed by the market</li>
                  <li><span className="text-green-400">Filled Orders</span> - Orders that have been completed</li>
                  <li><span className="text-cyan-400">Positions</span> - Once your order fills, your stock will appear here</li>
                </ul>
                <div className="bg-mint-500/10 border border-mint-500/30 rounded-lg p-2 sm:p-3 mt-3 sm:mt-4">
                  <p className="text-xs sm:text-sm text-mint-300 leading-relaxed">
                    <strong>💡 Remember:</strong> You can always log in again using your email and password to access your portfolio anytime!
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 leading-relaxed">
                  This page will automatically update as your orders are processed. Market orders typically fill within seconds!
                </p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0 text-lg sm:text-xl md:text-2xl mt-0.5"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Login Reminder (if not showing welcome) */}
        {!showWelcome && user && (
          <div className="mb-6 sm:mb-8 glass rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400">
              <span className="text-mint-400">💡 Tip:</span> You can log in anytime using your email (<span className="break-all">{user.email}</span>) and password to access your portfolio.
            </p>
          </div>
        )}

        {/* Status Explanation */}
        {openOrders.length > 0 && (
          <div className="mb-4 sm:mb-6 glass rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              <span className="text-mint-400 font-semibold">📊 Current Status:</span> You have {openOrders.length} active order{openOrders.length > 1 ? 's' : ''} being processed. Once filled, your stock will appear in "Your Holdings" below. Market orders typically fill within seconds.
            </p>
          </div>
        )}

        {/* Open Orders Section */}
        {openOrders.length > 0 && (
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-white">Active Orders</h2>
            <div className="glass rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/50 border-b border-slate-700">
                      <tr>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Symbol</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Side</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-xs sm:text-sm font-semibold text-gray-300">Qty</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-xs sm:text-sm font-semibold text-gray-300 hidden sm:table-cell">Filled</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-xs sm:text-sm font-semibold text-gray-300">Amount</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-xs sm:text-sm font-semibold text-gray-300">Status</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-xs sm:text-sm font-semibold text-gray-300 hidden md:table-cell">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {openOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
                            <div className="text-sm sm:text-base md:text-lg font-bold text-white">{order.symbol}</div>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
                            <span className={`px-2 py-1 rounded text-xs sm:text-sm font-semibold ${
                              order.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {order.side.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-gray-300 text-xs sm:text-sm md:text-base">
                            {formatNumber(order.qty || '0')}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-gray-300 text-xs sm:text-sm md:text-base hidden sm:table-cell">
                            {formatNumber(order.filled_qty || '0')}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-white font-semibold text-xs sm:text-sm md:text-base">
                            {formatCurrency(order.notional || '0')}
                          </td>
                          <td className={`px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right font-semibold text-xs sm:text-sm ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-gray-400 text-xs sm:text-sm hidden md:table-cell">
                            {formatDate(order.submitted_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Summary */}
        {accountInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            <div className="glass rounded-xl p-4 sm:p-5 md:p-6 shadow-xl">
              <div className="text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">Cash</div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-mint-400 break-words">
                {formatCurrency(accountInfo.cash)}
              </div>
            </div>
            <div className="glass rounded-xl p-4 sm:p-5 md:p-6 shadow-xl">
              <div className="text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">Total Portfolio Value</div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-400 break-words">
                {formatCurrency(totalPortfolioValue + parseFloat(accountInfo.cash || '0'))}
              </div>
            </div>
            <div className="glass rounded-xl p-4 sm:p-5 md:p-6 sm:col-span-2 md:col-span-1 shadow-xl">
              <div className="text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">Unrealized P/L</div>
              <div className={`text-lg sm:text-xl md:text-2xl font-bold break-words ${totalUnrealizedPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totalUnrealizedPL)}
              </div>
            </div>
          </div>
        )}

        {/* Positions Section */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-white">Your Holdings</h2>
          {positions.length === 0 ? (
            <div className="glass rounded-xl p-6 sm:p-8 md:p-12 text-center shadow-xl">
              <div className="text-gray-300 text-base sm:text-lg mb-2 font-medium">No positions yet</div>
              <div className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                {openOrders.length > 0 
                  ? 'Your order is being processed by the market. Once your order fills, your stock will appear here. Market orders typically fill within seconds.'
                  : 'Your stock holdings will appear here once you have open positions. When you receive a gift, the stock will show up here after the order is filled.'}
              </div>
            </div>
          ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800 border-b border-gray-700">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Symbol</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Qty</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-300 hidden sm:table-cell">Price</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-300">Value</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-300 hidden md:table-cell">Cost</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-300">P/L</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-gray-300">P/L %</th>
                    </tr>
                  </thead>
                    <tbody className="divide-y divide-slate-700">
                      {positions.map((position, index) => {
                        const unrealizedPL = parseFloat(position.unrealized_pl || '0')
                        const unrealizedPLPercent = parseFloat(position.unrealized_plpc || '0')
                        return (
                          <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
                              <div className="text-sm sm:text-base md:text-lg font-bold text-white">{position.symbol}</div>
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-gray-300 text-xs sm:text-sm md:text-base">
                              {formatNumber(position.qty)} <span className="hidden sm:inline">shares</span>
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-gray-300 text-xs sm:text-sm md:text-base hidden sm:table-cell">
                              {formatCurrency(position.current_price)}
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-white font-semibold text-xs sm:text-sm md:text-base">
                              {formatCurrency(position.market_value)}
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-gray-400 text-xs sm:text-sm md:text-base hidden md:table-cell">
                              {formatCurrency(position.cost_basis)}
                            </td>
                            <td className={`px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right font-semibold text-xs sm:text-sm md:text-base ${
                              unrealizedPL >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(unrealizedPL)}
                            </td>
                            <td className={`px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right font-semibold text-xs sm:text-sm ${
                              unrealizedPLPercent >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {unrealizedPLPercent >= 0 ? '+' : ''}{formatNumber(unrealizedPLPercent)}%
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Filled Orders */}
        {recentFilledOrders.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-white">Recent Orders</h2>
            <div className="glass rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/50 border-b border-slate-700">
                      <tr>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Symbol</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Side</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-xs sm:text-sm font-semibold text-gray-300">Qty</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-xs sm:text-sm font-semibold text-gray-300 hidden sm:table-cell">Avg Price</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-xs sm:text-sm font-semibold text-gray-300">Total</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-xs sm:text-sm font-semibold text-gray-300 hidden md:table-cell">Filled At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {recentFilledOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
                            <div className="text-sm sm:text-base md:text-lg font-bold text-white">{order.symbol}</div>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
                            <span className={`px-2 py-1 rounded text-xs sm:text-sm font-semibold ${
                              order.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {order.side.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-gray-300 text-xs sm:text-sm md:text-base">
                            {formatNumber(order.filled_qty || order.qty || '0')}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-white font-semibold text-xs sm:text-sm md:text-base hidden sm:table-cell">
                            {formatCurrency(order.filled_avg_price || '0')}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-white font-semibold text-xs sm:text-sm md:text-base">
                            {formatCurrency(
                              parseFloat(order.filled_qty || '0') * parseFloat(order.filled_avg_price || '0')
                            )}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 text-right text-gray-400 text-xs sm:text-sm hidden md:table-cell">
                            {formatDate(order.filled_at || order.submitted_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
