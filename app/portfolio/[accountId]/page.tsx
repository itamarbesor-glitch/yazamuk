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
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Your Portfolio
            </h1>
            <p className="text-gray-400">Track your stocks and their current value</p>
          </div>
          {user && (
            <div className="text-right">
              <div className="text-sm text-gray-400">Logged in as</div>
              <div className="text-cyan-400 font-semibold">{user.email}</div>
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
          <div className="mb-8 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 border border-cyan-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🎉</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-cyan-400 mb-2">Welcome to Your Portfolio!</h2>
                <p className="text-gray-300 mb-3">
                  Your gift has been received and your account is being set up. Here's what's happening:
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-1 mb-4">
                  <li><span className="text-yellow-400">Pending Orders</span> - Your buy order is being processed by the market</li>
                  <li><span className="text-green-400">Filled Orders</span> - Orders that have been completed</li>
                  <li><span className="text-cyan-400">Positions</span> - Once your order fills, your stock will appear here</li>
                </ul>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mt-4">
                  <p className="text-sm text-cyan-300">
                    <strong>💡 Remember:</strong> You can always log in again using your email and password to access your portfolio anytime!
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  This page will automatically update as your orders are processed. Market orders typically fill within seconds!
                </p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Login Reminder (if not showing welcome) */}
        {!showWelcome && user && (
          <div className="mb-8 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <p className="text-sm text-gray-400">
              <span className="text-cyan-400">💡 Tip:</span> You can log in anytime using your email ({user.email}) and password to access your portfolio.
            </p>
          </div>
        )}

        {/* Open Orders Section */}
        {openOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Active Orders</h2>
            <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Symbol</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Side</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Quantity</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Filled</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Notional</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {openOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-lg font-bold text-white">{order.symbol}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${
                            order.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {order.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-300">
                          {formatNumber(order.qty || '0')}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-300">
                          {formatNumber(order.filled_qty || '0')}
                        </td>
                        <td className="px-6 py-4 text-right text-white font-semibold">
                          {formatCurrency(order.notional || '0')}
                        </td>
                        <td className={`px-6 py-4 text-right font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400 text-sm">
                          {formatDate(order.submitted_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Account Summary */}
        {accountInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-1">Cash</div>
              <div className="text-2xl font-bold text-cyan-400">
                {formatCurrency(accountInfo.cash)}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-1">Total Portfolio Value</div>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(totalPortfolioValue + parseFloat(accountInfo.cash || '0'))}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-1">Unrealized P/L</div>
              <div className={`text-2xl font-bold ${totalUnrealizedPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totalUnrealizedPL)}
              </div>
            </div>
          </div>
        )}

        {/* Positions Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Your Holdings</h2>
          {positions.length === 0 ? (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-12 text-center">
              <div className="text-gray-400 text-lg mb-2">No positions yet</div>
              <div className="text-gray-500 text-sm">
                {openOrders.length > 0 
                  ? 'Your order is being processed. Positions will appear here once filled.'
                  : 'Your stock holdings will appear here once you have open positions.'}
              </div>
            </div>
          ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Symbol</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Quantity</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Current Price</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Market Value</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Cost Basis</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Unrealized P/L</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">P/L %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {positions.map((position, index) => {
                    const unrealizedPL = parseFloat(position.unrealized_pl || '0')
                    const unrealizedPLPercent = parseFloat(position.unrealized_plpc || '0')
                    return (
                      <tr key={index} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-lg font-bold text-white">{position.symbol}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {formatNumber(position.qty)} shares
                        </td>
                        <td className="px-6 py-4 text-right text-gray-300">
                          {formatCurrency(position.current_price)}
                        </td>
                        <td className="px-6 py-4 text-right text-white font-semibold">
                          {formatCurrency(position.market_value)}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400">
                          {formatCurrency(position.cost_basis)}
                        </td>
                        <td className={`px-6 py-4 text-right font-semibold ${
                          unrealizedPL >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(unrealizedPL)}
                        </td>
                        <td className={`px-6 py-4 text-right font-semibold ${
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
          )}
        </div>

        {/* Recent Filled Orders */}
        {recentFilledOrders.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-white">Recent Orders</h2>
            <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Symbol</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Side</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Quantity</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Avg Price</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Total Value</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Filled At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {recentFilledOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-lg font-bold text-white">{order.symbol}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${
                            order.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {order.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-300">
                          {formatNumber(order.filled_qty || order.qty || '0')}
                        </td>
                        <td className="px-6 py-4 text-right text-white font-semibold">
                          {formatCurrency(order.filled_avg_price || '0')}
                        </td>
                        <td className="px-6 py-4 text-right text-white font-semibold">
                          {formatCurrency(
                            parseFloat(order.filled_qty || '0') * parseFloat(order.filled_avg_price || '0')
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400 text-sm">
                          {formatDate(order.filled_at || order.submitted_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
