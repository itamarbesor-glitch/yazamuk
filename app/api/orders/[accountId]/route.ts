import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const accountId = params.accountId
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all' // all, open, closed

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.ALPACA_BASE_URL || 'https://broker-api.sandbox.alpaca.markets'
    const apiKey = process.env.ALPACA_API_KEY
    const secretKey = process.env.ALPACA_SECRET_KEY

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: 'Missing Alpaca API credentials' },
        { status: 500 }
      )
    }

    // Get OAuth2 Access Token
    const isSandbox = baseUrl.includes('sandbox')
    const authUrl = isSandbox 
      ? 'https://authx.sandbox.alpaca.markets/v1/oauth2/token'
      : 'https://authx.alpaca.markets/v1/oauth2/token'
    
    let accessToken: string
    try {
      const tokenResponse = await axios.post(
        authUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: apiKey,
          client_secret: secretKey,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      accessToken = tokenResponse.data.access_token
    } catch (error: any) {
      console.error('Error getting access token:', error.response?.data || error.message)
      return NextResponse.json(
        { error: 'Failed to authenticate with Alpaca' },
        { status: 500 }
      )
    }

    // Get account orders
    try {
      const ordersResponse = await axios.get(
        `${baseUrl}/v1/trading/accounts/${accountId}/orders`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            status: status === 'all' ? undefined : status,
            limit: 50, // Get recent orders
          },
        }
      )

      return NextResponse.json({
        orders: ordersResponse.data || [],
      })
    } catch (error: any) {
      console.error('Error fetching orders:', error.response?.data || error.message)
      return NextResponse.json(
        { 
          error: 'Failed to fetch orders',
          details: error.response?.data?.message || error.message
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in orders API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
