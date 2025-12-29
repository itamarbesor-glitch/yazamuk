# WhatsApp Production Setup Guide

This guide will walk you through enabling WhatsApp messaging in production using Twilio.

## Prerequisites

- A Twilio account (sign up at [twilio.com](https://www.twilio.com))
- A credit card for Twilio account verification
- Your production environment variables configured

## Step-by-Step Instructions

### Step 1: Create a Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number
4. Complete account verification (may require credit card for production use)

### Step 2: Get Your Twilio Credentials

1. Log in to your [Twilio Console](https://console.twilio.com)
2. Navigate to **Account** → **API Keys & Tokens**
3. Copy your **Account SID** (starts with `AC...`)
4. Copy your **Auth Token** (click "View" to reveal it)

**⚠️ Security Note:** Never commit these credentials to version control. Always use environment variables.

### Step 3: Set Up WhatsApp Sender Number

You have two options for WhatsApp messaging:

#### Option A: Use Twilio Sandbox (Quick Start - Testing Only)

1. Go to [Twilio Console → Messaging → Try it out → Send a WhatsApp message](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. Follow the instructions to join the Twilio Sandbox
3. You'll get a WhatsApp number like `whatsapp:+14155238886`
4. **Limitation:** Recipients must first send "join [keyword]" to this number before they can receive messages

#### Option B: Use Your Own WhatsApp Business Number (Production)

For production, you'll need to:

1. **Request WhatsApp Business API Access:**
   - Go to [Twilio Console → Messaging → Senders → WhatsApp Senders](https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders)
   - Click **"Request WhatsApp Sender"**
   - Fill out the form with:
     - Business name and description
     - Use case (e.g., "Stock gift notifications")
     - Sample messages
   - Submit for approval (can take 1-3 business days)

2. **Verify Your Business (if required):**
   - Twilio may require business verification for certain regions
   - Follow their verification process

3. **Get Your WhatsApp Number:**
   - Once approved, you'll receive a WhatsApp-enabled number
   - Format: `whatsapp:+[country code][number]` (e.g., `whatsapp:+14155238886`)

### Step 4: Configure Environment Variables

Add these variables to your production environment (e.g., Vercel, Railway, AWS, etc.):

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
```

**For Vercel:**
1. Go to your project → Settings → Environment Variables
2. Add each variable above
3. Redeploy your application

**For other platforms:**
- Add these as environment variables in your hosting platform's dashboard
- Restart your application after adding variables

### Step 5: Test WhatsApp Integration

1. **Test in Development First:**
   ```bash
   # Add to your .env.local
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```

2. **Create a test gift:**
   - Use your own WhatsApp number as the receiver
   - Create a gift through the app
   - Check if you receive the WhatsApp message

3. **Check Logs:**
   - Monitor your application logs for any Twilio API errors
   - Check Twilio Console → Monitor → Logs → Messaging for delivery status

### Step 6: Monitor Usage and Costs

1. **Check Twilio Console:**
   - Go to [Twilio Console → Monitor → Usage](https://console.twilio.com/us1/monitor/usage)
   - Monitor WhatsApp message costs

2. **Pricing:**
   - WhatsApp messages are typically charged per message
   - Check [Twilio's pricing page](https://www.twilio.com/whatsapp/pricing) for current rates
   - Free tier may include some free messages

3. **Set Up Alerts:**
   - Configure billing alerts in Twilio Console
   - Set spending limits if needed

## Troubleshooting

### Messages Not Sending

1. **Check Environment Variables:**
   ```bash
   # Verify variables are set
   echo $TWILIO_ACCOUNT_SID
   echo $TWILIO_WHATSAPP_FROM
   ```

2. **Check Twilio Logs:**
   - Go to Twilio Console → Monitor → Logs → Messaging
   - Look for error messages

3. **Common Issues:**
   - **"Invalid 'To' number"**: Ensure phone numbers include country code (e.g., `+1234567890`)
   - **"Unverified sender"**: Your WhatsApp sender may not be approved yet
   - **"Rate limit exceeded"**: You may be sending too many messages too quickly

### Sandbox Limitations

If using Twilio Sandbox:
- Recipients must first send "join [keyword]" to your sandbox number
- Only works for testing with a limited number of recipients
- **Not suitable for production** - you need a verified WhatsApp Business number

### Phone Number Format

Ensure phone numbers are in E.164 format:
- ✅ Correct: `+1234567890`, `whatsapp:+1234567890`
- ❌ Incorrect: `(123) 456-7890`, `123-456-7890`

The code automatically adds `whatsapp:` prefix if missing, but the number itself must include country code.

## Production Checklist

- [ ] Twilio account created and verified
- [ ] WhatsApp Business number approved (or sandbox configured for testing)
- [ ] Environment variables set in production
- [ ] Test message sent successfully
- [ ] Monitoring and alerts configured
- [ ] Billing limits set (if desired)
- [ ] Error handling tested

## Security Best Practices

1. **Never commit credentials:**
   - Keep `.env.local` in `.gitignore`
   - Use environment variables in production

2. **Rotate credentials:**
   - Regularly rotate your Auth Token
   - Use API keys with limited permissions when possible

3. **Monitor usage:**
   - Set up alerts for unusual activity
   - Review logs regularly

4. **Rate limiting:**
   - Consider implementing rate limiting in your API to prevent abuse
   - Twilio has its own rate limits - be aware of them

## Support

- **Twilio Documentation:** [https://www.twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- **Twilio Support:** [https://support.twilio.com](https://support.twilio.com)
- **WhatsApp Business API:** [https://www.twilio.com/whatsapp](https://www.twilio.com/whatsapp)

## Alternative: Other WhatsApp Providers

If Twilio doesn't meet your needs, consider:
- **MessageBird** - WhatsApp Business API provider
- **360dialog** - WhatsApp Business API provider
- **WhatsApp Business API directly** (more complex setup)

You would need to modify `/app/api/send-whatsapp/route.ts` to use their APIs instead.
