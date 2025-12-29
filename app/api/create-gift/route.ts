import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderName, senderMobile, receiverName, receiverEmail, receiverMobile, amount, stockSymbol } = body

    // Email is optional since we're using WhatsApp
    if (!senderName || !senderMobile || !receiverName || !receiverMobile || !amount || !stockSymbol) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create gift in database
    // Use receiverMobile as email fallback if email not provided
    const finalReceiverEmail = receiverEmail || `${receiverMobile.replace(/[^0-9]/g, '')}@whatsapp.temp`
    
    const gift = await prisma.gift.create({
      data: {
        senderName,
        senderMobile,
        receiverName,
        receiverEmail: finalReceiverEmail,
        receiverMobile,
        amount: parseFloat(amount),
        stockSymbol,
        status: 'PENDING',
      },
    })

    // Mock payment - treat as successful
    // In a real app, you would integrate with a payment processor here

    // Send WhatsApp message to receiver (async, don't wait)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const claimUrl = `${baseUrl}/claim/${gift.id}`
    
    // Map stock symbols to image URLs
    // Images should be in /public/images/ folder or hosted publicly
    // Note: For Twilio to access images, URLs must be publicly accessible (not localhost)
    // In production, use your production domain. For localhost testing, images won't work.
    const stockImageMap: Record<string, string> = {
      'TSLA': `${baseUrl}/images/tsla.png`,
      'AAPL': `${baseUrl}/images/aapl.png`,
      'NVDA': `${baseUrl}/images/nvda.png`,
    }
    
    // Only include image URL if it's publicly accessible (not localhost)
    // Twilio cannot access localhost URLs
    const imageUrl = stockImageMap[stockSymbol] && !baseUrl.includes('localhost') 
      ? stockImageMap[stockSymbol] 
      : null
    
    // Send WhatsApp message asynchronously (don't block gift creation)
    console.log('📱 Attempting to send WhatsApp message...')
    console.log('Receiver mobile:', receiverMobile)
    console.log('Claim URL:', claimUrl)
    console.log('Image URL:', imageUrl)
    
    fetch(`${baseUrl}/api/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: receiverMobile,
        message: `🎁 You received a gift from ${senderName}! via Yazamuk 📈\n\n${senderName} gifted you $${amount} worth of ${stockSymbol} stock!\n\nClaim your gift here: ${claimUrl}`,
        mediaUrl: imageUrl,
      }),
    })
    .then(async (response) => {
      const data = await response.json()
      if (response.ok) {
        console.log('✅ WhatsApp message sent successfully:', data)
      } else {
        console.error('❌ WhatsApp API error:', data)
      }
    })
    .catch((whatsappError) => {
      console.error('❌ Error sending WhatsApp message:', whatsappError)
      // Don't fail the gift creation if WhatsApp fails
    })

    return NextResponse.json({ giftId: gift.id })
  } catch (error: any) {
    console.error('Error creating gift:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create gift',
        details: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
