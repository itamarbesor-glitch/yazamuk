import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      giftId,
      firstName,
      lastName,
      email,
      dateOfBirth,
      taxId,
      streetAddress,
      city,
      state,
      zipCode,
      password,
    } = body

    // Fetch gift first to get receiverEmail if needed
    const gift = await prisma.gift.findUnique({
      where: { id: giftId },
    })

    if (!gift) {
      return NextResponse.json(
        { error: 'Gift not found' },
        { status: 404 }
      )
    }

    if (gift.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Gift has already been claimed' },
        { status: 400 }
      )
    }

    // Check if user already exists - if so, we can skip onboarding requirements
    // Use email from form or fallback to gift's receiverEmail
    const finalEmail = email || gift.receiverEmail
    
    const existingUser = await prisma.user.findUnique({
      where: { email: finalEmail },
    })

    const isExistingUser = !!existingUser && !!existingUser.alpacaAccountId

    // Validate required fields - for existing users, we don't need all fields
    
    if (!finalEmail) {
      return NextResponse.json(
        { error: 'Email is required. Please provide your email address.' },
        { status: 400 }
      )
    }

    if (isExistingUser) {
      // Existing user - only need giftId and email, skip all onboarding
      if (!giftId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }
      // For existing users, we'll use their existing account info
      // No need to validate onboarding fields
    } else {
      // New user - need all onboarding fields
      if (!giftId || !firstName || !lastName || !dateOfBirth || !taxId || !streetAddress || !city || !state || !zipCode || !password) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      if (password && password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      }
    }


    // Alpaca Broker API uses OAuth2, not Basic Auth
    // Base URL should be broker-api subdomain
    const baseUrl = process.env.ALPACA_BASE_URL || 'https://broker-api.sandbox.alpaca.markets'
    const apiKey = process.env.ALPACA_API_KEY
    const secretKey = process.env.ALPACA_SECRET_KEY
    const firmAccountId = process.env.FIRM_ACCOUNT_ID

    // Better error messaging to identify which variable is missing
    const missingVars = []
    if (!apiKey) missingVars.push('ALPACA_API_KEY')
    if (!secretKey) missingVars.push('ALPACA_SECRET_KEY')
    if (!firmAccountId) missingVars.push('FIRM_ACCOUNT_ID')

    if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars.join(', '))
      return NextResponse.json(
        { 
          error: 'Missing Alpaca API credentials',
          details: `Missing: ${missingVars.join(', ')}. Please check your .env.local file and restart the server.`
        },
        { status: 500 }
      )
    }

    // Step 0: Get OAuth2 Access Token using Client Credentials flow
    // Determine auth endpoint based on base URL
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
      
      if (!accessToken) {
        throw new Error('No access token received from Alpaca')
      }
    } catch (error: any) {
      console.error('Error getting access token:', {
        url: authUrl,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      return NextResponse.json(
        { 
          error: 'Failed to authenticate with Alpaca',
          details: error.response?.data?.error_description || error.response?.data?.message || error.message || 'Check your API credentials (Client ID and Client Secret)'
        },
        { status: 500 }
      )
    }

    // Step A: Check if account already exists, otherwise create new one
    let newAccountId: string
    let accountAlreadyExists = false
    let accountResponse: any = null

    if (isExistingUser && existingUser!.alpacaAccountId) {
      // User already has an Alpaca account, use it - skip account creation entirely
      newAccountId = existingUser!.alpacaAccountId
      accountAlreadyExists = true
      console.log(`Using existing Alpaca account for returning user: ${newAccountId}`)
      // Skip to Step B (account status check)
    } else {
      // New user - create account with onboarding data
      const accountPayload = {
        contact: {
          email_address: finalEmail,
          phone_number: '+12025551234', // Default for sandbox
          street_address: [streetAddress || ''],
          city: city || '',
          state: state || '',
          postal_code: zipCode || '',
          country: 'USA',
        },
        identity: {
          given_name: firstName || '',
          family_name: lastName || '',
          date_of_birth: dateOfBirth || '1990-01-01',
          tax_id: taxId || '',
          tax_id_type: 'USA_SSN',
          country_of_citizenship: 'USA',
          country_of_birth: 'USA',
          country_of_tax_residence: 'USA',
          funding_source: ['employment_income'],
        },
        disclosures: {
          is_control_person: false,
          is_affiliated_exchange_or_finra: false,
          is_politically_exposed: false,
          immediate_family_exposed: false,
        },
        agreements: [
          {
            agreement: 'customer_agreement',
            signed_at: new Date().toISOString(),
            ip_address: '127.0.0.1',
          },
          {
            agreement: 'account_agreement',
            signed_at: new Date().toISOString(),
            ip_address: '127.0.0.1',
          },
          {
            agreement: 'margin_agreement',
            signed_at: new Date().toISOString(),
            ip_address: '127.0.0.1',
          },
        ],
        documents: [],
        trusted_contact: {
          given_name: firstName || '',
          family_name: lastName || '',
          email_address: finalEmail,
        },
      }

      try {
        accountResponse = await axios.post(
          `${baseUrl}/v1/accounts`,
          accountPayload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
        newAccountId = accountResponse.data.id
        console.log(`Created new Alpaca account: ${newAccountId}`)
      } catch (error: any) {
        // Check if error is because account already exists
        const errorMessage = error.response?.data?.message || error.message || ''
        if (errorMessage.includes('already exists') || errorMessage.includes('email address')) {
          // Account exists in Alpaca, try to find it
          console.log('Account already exists in Alpaca, attempting to find it...')
          
          // Try to search for account by email using Alpaca API
          try {
            const searchResponse = await axios.get(
              `${baseUrl}/v1/accounts`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
                params: {
                  query: finalEmail,
                },
              }
            )
            
            const accounts = searchResponse.data || []
            const matchingAccount = accounts.find((acc: any) => 
              acc.contact?.email_address === finalEmail
            )
            
            if (matchingAccount) {
              newAccountId = matchingAccount.id
              accountAlreadyExists = true
              console.log(`Found existing Alpaca account: ${newAccountId}`)
              
              // Update our database with this account ID if we don't have it
              if (!existingUser) {
                // Create user record with the found Alpaca account
                const hashedPassword = await hashPassword(password || 'temp-password-' + Date.now())
                await prisma.user.create({
                  data: {
                    email: finalEmail,
                    username: finalEmail,
                    password: hashedPassword,
                    alpacaAccountId: newAccountId,
                  },
                })
              } else if (!existingUser.alpacaAccountId) {
                // Update existing user with Alpaca account ID
                await prisma.user.update({
                  where: { id: existingUser.id },
                  data: { alpacaAccountId: newAccountId },
                })
              }
            } else {
              // Check our database as fallback
              const dbUser = await prisma.user.findUnique({
                where: { email: finalEmail },
              })
              
              if (dbUser && dbUser.alpacaAccountId) {
                newAccountId = dbUser.alpacaAccountId
                accountAlreadyExists = true
                console.log(`Found existing account in database: ${newAccountId}`)
              } else {
                return NextResponse.json(
                  { 
                    error: 'An account with this email already exists. Please log in to access your portfolio.',
                    details: 'If you already claimed a gift, please use the login page to access your account.'
                  },
                  { status: 400 }
                )
              }
            }
          } catch (searchError: any) {
            console.error('Error searching for existing account:', searchError)
              // Fallback to database check
              const dbUser = await prisma.user.findUnique({
                where: { email: finalEmail },
              })
            
            if (dbUser && dbUser.alpacaAccountId) {
              newAccountId = dbUser.alpacaAccountId
              accountAlreadyExists = true
              console.log(`Found existing account in database (fallback): ${newAccountId}`)
            } else {
              return NextResponse.json(
                { 
                  error: 'An account with this email already exists. Please log in to access your portfolio.',
                  details: 'If you already claimed a gift, please use the login page to access your account.'
                },
                { status: 400 }
              )
            }
          }
        } else {
          console.error('Error creating Alpaca account:', error.response?.data || error.message)
          return NextResponse.json(
            { error: `Failed to create Alpaca account: ${errorMessage}` },
            { status: 500 }
          )
        }
      }
    }

    // Step B: Wait for Active Status (Polling) - only if account was just created
    if (!accountAlreadyExists && accountResponse) {
      let accountStatus = accountResponse.data.status
      let attempts = 0
      const maxAttempts = 30 // Increased to 30 attempts = 60 seconds total
      const pollInterval = 2000 // 2 seconds between checks

      console.log(`Initial account status: ${accountStatus}, polling for ACTIVE status...`)

      while (accountStatus !== 'ACTIVE' && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, pollInterval))

        try {
          const statusResponse = await axios.get(
            `${baseUrl}/v1/accounts/${newAccountId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          )
          accountStatus = statusResponse.data.status
          attempts++
          console.log(`Account status check ${attempts}/${maxAttempts}: ${accountStatus}`)
        } catch (error: any) {
          console.error('Error checking account status:', error.response?.data || error.message)
          attempts++
          // Don't return immediately, keep trying
          if (attempts >= maxAttempts) {
            return NextResponse.json(
              { error: `Failed to check account status: ${error.response?.data?.message || error.message}` },
              { status: 500 }
            )
          }
        }
      }

      if (accountStatus !== 'ACTIVE') {
        return NextResponse.json(
          { 
            error: 'Account did not become active in time',
            details: `Account status is "${accountStatus}" after ${maxAttempts * pollInterval / 1000} seconds. The account may need manual review or more time to process.`
          },
          { status: 500 }
        )
      }

      console.log(`Account is now ACTIVE after ${attempts} attempts`)
    } else {
      // For existing accounts, verify it's active
      try {
        const statusResponse = await axios.get(
          `${baseUrl}/v1/accounts/${newAccountId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        const accountStatus = statusResponse.data.status
        if (accountStatus !== 'ACTIVE') {
          return NextResponse.json(
            { 
              error: 'Account is not active',
              details: `Your account status is "${accountStatus}". Please contact support.`
            },
            { status: 400 }
          )
        }
        console.log(`Using existing ACTIVE account: ${newAccountId}`)
      } catch (error: any) {
        console.error('Error checking existing account:', error.response?.data || error.message)
        return NextResponse.json(
          { error: `Failed to verify account: ${error.response?.data?.message || error.message}` },
          { status: 500 }
        )
      }
    }

    // Step C: Journal Cash (Fund the Account)
    const journalPayload = {
      entry_type: 'JNLC', // Cash Journal
      from_account: firmAccountId,
      to_account: newAccountId,
      amount: gift.amount.toString(),
    }

    try {
      await axios.post(
        `${baseUrl}/v1/journals`,
        journalPayload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (error: any) {
      console.error('Error journaling cash:', error.response?.data || error.message)
      return NextResponse.json(
        { error: `Failed to journal cash: ${error.response?.data?.message || error.message}` },
        { status: 500 }
      )
    }

    // Step D: Wait for journal to settle and verify buying power
    // For amounts > $50, journals may need to wait for BOD, but in sandbox they're usually instant
    // Poll the account to check buying power is available
    let accountData: any = null
    let buyingPowerAvailable = false
    let pollingAttempts = 0
    const maxPollingAttempts = 10 // Try for up to 20 seconds

    while (!buyingPowerAvailable && pollingAttempts < maxPollingAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait 2 seconds between checks
      
      try {
        // Use the trading account endpoint to get buying power
        const accountResponse = await axios.get(
          `${baseUrl}/v1/trading/accounts/${newAccountId}/account`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        accountData = accountResponse.data
        
        // Check if we have sufficient buying power
        // We journal the full gift amount, but order amount will be reduced to account for 5% collar
        // For market orders, Alpaca needs 5% buffer, so order amount = gift amount / 1.05
        const COLLAR_BUFFER = 1.05
        const orderAmount = gift.amount / COLLAR_BUFFER
        const requiredBuyingPower = gift.amount // We need the full journaled amount as buying power
        const availableBuyingPower = parseFloat(accountData.buying_power || accountData.cash || '0')
        
        if (availableBuyingPower >= requiredBuyingPower) {
          buyingPowerAvailable = true
          console.log(`Buying power available: $${availableBuyingPower}, required: $${requiredBuyingPower.toFixed(2)} (will place order for $${orderAmount.toFixed(2)} to account for 5% collar)`)
        } else {
          pollingAttempts++
          console.log(`Waiting for buying power... Available: $${availableBuyingPower}, Required: $${requiredBuyingPower.toFixed(2)}, Attempt ${pollingAttempts}/${maxPollingAttempts}`)
        }
      } catch (error: any) {
        console.error('Error checking account:', error.response?.data || error.message)
        pollingAttempts++
        // If endpoint doesn't exist, try the regular accounts endpoint as fallback
        if (error.response?.status === 404 && pollingAttempts === 1) {
          try {
            const fallbackResponse = await axios.get(
              `${baseUrl}/v1/accounts/${newAccountId}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            )
            accountData = fallbackResponse.data
            const availableBuyingPower = parseFloat(accountData.buying_power || accountData.cash || accountData.equity || '0')
            const requiredBuyingPower = gift.amount // Need full journaled amount
            if (availableBuyingPower >= requiredBuyingPower) {
              buyingPowerAvailable = true
            }
          } catch (fallbackError) {
            // Ignore fallback errors
          }
        }
      }
    }

    if (!buyingPowerAvailable) {
      const COLLAR_BUFFER = 1.05
      const orderAmount = gift.amount / COLLAR_BUFFER
      return NextResponse.json(
        { 
          error: 'Insufficient buying power after journal',
          details: `Account has $${accountData?.buying_power || accountData?.cash || '0'} available, but need $${gift.amount.toFixed(2)} to place market order of $${orderAmount.toFixed(2)} (accounting for 5% collar requirement). The journal may need more time to settle, especially for amounts over $50.`
        },
        { status: 500 }
      )
    }

    // Step E: Buy the Stock
    // Calculate order amount to account for the 5% buying power collar requirement
    // Alpaca requires 5% buffer for market orders, so if we have $100 buying power,
    // we can only place an order for $100 / 1.05 = ~$95.24
    // This ensures we have enough buying power to cover the collar
    const COLLAR_BUFFER = 1.05 // 5% collar requirement
    const orderAmount = gift.amount / COLLAR_BUFFER
    const notionalAmount = orderAmount.toFixed(2)
    
    console.log(`Order details: Gift amount: $${gift.amount}, Order amount (accounting for 5% collar): $${notionalAmount}`)
    
    const orderPayload = {
      symbol: gift.stockSymbol,
      notional: notionalAmount,
      side: 'buy',
      type: 'market',
      time_in_force: 'day',
    }

    try {
      // Orders endpoint might need account ID in path - try both formats
      await axios.post(
        `${baseUrl}/v1/trading/accounts/${newAccountId}/orders`,
        orderPayload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (error: any) {
      console.error('Error placing order:', error.response?.data || error.message)
      return NextResponse.json(
        { error: `Failed to place order: ${error.response?.data?.message || error.message}` },
        { status: 500 }
      )
    }

    // Create or update user account
    let user = existingUser

    if (!user) {
      // Create new user - use email as username
      const hashedPassword = await hashPassword(password!)
      user = await prisma.user.create({
        data: {
          email: finalEmail,
          username: finalEmail, // Use email as username
          password: hashedPassword,
          alpacaAccountId: newAccountId,
        },
      })
    } else {
      // Update existing user - ensure Alpaca account ID is set
      if (!user.alpacaAccountId || user.alpacaAccountId !== newAccountId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            alpacaAccountId: newAccountId,
          },
        })
      }
    }

    // Update gift status and link to user
    await prisma.gift.update({
      where: { id: giftId },
      data: {
        status: 'COMPLETED',
        alpacaAccountId: newAccountId,
        userId: user.id,
      },
    })

    // Generate token for automatic login (only if new user or if they provided password)
    let token: string | null = null
    if (!isExistingUser || password) {
      token = generateToken(user.id, finalEmail)
    }

    // Create response
    const response = NextResponse.json({ 
      success: true,
      accountId: newAccountId,
      isExistingUser: isExistingUser,
      token: token || undefined, // Include token in response for frontend check
    })

    // Set auth cookie if we have a token
    if (token) {
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      })
    }

    return response
  } catch (error: any) {
    console.error('Error claiming gift:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to claim gift' },
      { status: 500 }
    )
  }
}
