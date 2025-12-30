import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, message, mediaUrl } = body

    console.log('📱 WhatsApp API called with:', { to, messageLength: message?.length, hasMedia: !!mediaUrl })

    if (!to || !message) {
      console.error('❌ Missing required fields:', { to: !!to, message: !!message })
      return NextResponse.json(
        { error: 'Missing required fields: to and message' },
        { status: 400 }
      )
    }

    // Check if Twilio credentials are configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM // Format: whatsapp:+14155238886

    console.log('🔑 Twilio config check:', {
      hasAccountSid: !!accountSid,
      hasAuthToken: !!authToken,
      whatsappFrom: whatsappFrom,
    })

    if (!accountSid || !authToken || !whatsappFrom) {
      // In development, just log the message
      console.log('📱 WhatsApp Message (Twilio not configured):')
      console.log(`To: ${to}`)
      console.log(`Message: ${message}`)
      console.log('\nTo enable WhatsApp messaging, add to .env.local:')
      console.log('TWILIO_ACCOUNT_SID=your_account_sid')
      console.log('TWILIO_AUTH_TOKEN=your_auth_token')
      console.log('TWILIO_WHATSAPP_FROM=whatsapp:+14155238886')
      
      return NextResponse.json({
        success: true,
        message: 'WhatsApp message logged (Twilio not configured)',
        note: 'In production, this would send via Twilio WhatsApp API',
      })
    }

    // Format phone number (ensure it starts with whatsapp:)
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
    const formattedFrom = whatsappFrom.startsWith('whatsapp:') ? whatsappFrom : `whatsapp:${whatsappFrom}`

    console.log('📤 Sending to Twilio:', {
      from: formattedFrom,
      to: formattedTo,
      originalTo: to,
      messagePreview: message.substring(0, 50) + '...',
      phoneNumberFormat: 'Make sure phone number includes country code (e.g., +1234567890)',
    })

    // Send WhatsApp message via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    
    const formData = new URLSearchParams()
    formData.append('From', formattedFrom)
    formData.append('To', formattedTo)
    formData.append('Body', message)
    
    // Add media URL if provided (for images)
    // Note: Twilio requires publicly accessible URLs (not localhost)
    // WhatsApp sandbox has restrictions on media - may need to skip for testing
    if (mediaUrl) {
      // Validate that URL is publicly accessible
      if (mediaUrl.includes('localhost') || mediaUrl.includes('127.0.0.1')) {
        console.warn('⚠️ Media URL is localhost - Twilio cannot access it. Skipping media.')
        console.warn('   For production, use a publicly accessible URL or CDN.')
      } else {
        // Validate URL format
        try {
          const url = new URL(mediaUrl)
          if (!['http:', 'https:'].includes(url.protocol)) {
            console.warn('⚠️ Media URL must use http or https protocol. Skipping media.')
          } else {
            // For WhatsApp sandbox, media might cause issues - log but try anyway
            console.log('📷 Adding media to message:', mediaUrl)
            console.log('⚠️ Note: WhatsApp sandbox may reject media. If you get error 63021, try without image.')
            formData.append('MediaUrl', mediaUrl)
          }
        } catch (urlError) {
          console.warn('⚠️ Invalid media URL format. Skipping media:', mediaUrl)
          console.warn('   Error:', urlError)
        }
      }
    }

    console.log('🌐 Calling Twilio API:', twilioUrl)

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    const data = await response.json()

    console.log('📥 Twilio response:', {
      status: response.status,
      statusText: response.statusText,
      data: data,
    })

    if (!response.ok) {
      console.error('❌ Twilio API error:', {
        status: response.status,
        error: data.message || data.error || 'Unknown error',
        code: data.code,
        more_info: data.more_info,
      })
      return NextResponse.json(
        { 
          error: `Failed to send WhatsApp message: ${data.message || data.error || 'Unknown error'}`,
          details: data,
        },
        { status: response.status }
      )
    }

    console.log('✅ WhatsApp message sent successfully!', {
      messageSid: data.sid,
      status: data.status,
      to: formattedTo,
      from: formattedFrom,
      twilioConsoleUrl: `https://console.twilio.com/us1/monitor/logs/messaging?msgSid=${data.sid}`,
    })

    // Log important troubleshooting info
    if (data.status === 'queued') {
      console.log('ℹ️ Message is queued. Check delivery status in Twilio Console:')
      console.log(`   https://console.twilio.com/us1/monitor/logs/messaging?msgSid=${data.sid}`)
      console.log('ℹ️ If message fails to deliver, common reasons:')
      console.log('   1. Recipient has not joined WhatsApp sandbox')
      console.log('   2. Phone number format incorrect (must include country code)')
      console.log('   3. Phone number not registered on WhatsApp')
    }

    return NextResponse.json({
      success: true,
      messageSid: data.sid,
      status: data.status,
      twilioConsoleUrl: `https://console.twilio.com/us1/monitor/logs/messaging?msgSid=${data.sid}`,
    })
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send WhatsApp message' },
      { status: 500 }
    )
  }
}
