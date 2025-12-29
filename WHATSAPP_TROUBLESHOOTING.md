# WhatsApp Troubleshooting Guide

## Common Issues and Solutions

### Issue: "I created a gift but didn't receive the WhatsApp message"

#### 1. Check WhatsApp Sandbox Setup

**If using Twilio Sandbox (testing):**
- You MUST join the sandbox first before receiving messages
- Go to [Twilio Console → Messaging → Try it out → Send a WhatsApp message](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
- Find your sandbox number (e.g., `+14155238886`)
- Find the join code (e.g., "join example-keyword")
- Open WhatsApp on your phone
- Send a message to the sandbox number: `join [keyword]`
- You should receive a confirmation message
- **Only after joining can you receive messages**

#### 2. Check Phone Number Format

Your phone number must:
- Include country code (e.g., `+1` for US, `+44` for UK)
- Be in E.164 format: `+[country code][number]`
- Examples:
  - ✅ Correct: `+1234567890`, `+447700900123`
  - ❌ Wrong: `1234567890`, `(123) 456-7890`, `123-456-7890`

#### 3. Check Vercel Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, verify:
- `TWILIO_ACCOUNT_SID` is set
- `TWILIO_AUTH_TOKEN` is set
- `TWILIO_WHATSAPP_FROM` is set (format: `whatsapp:+14155238886`)
- `NEXT_PUBLIC_BASE_URL` is set to your production URL (e.g., `https://yazamuk.vercel.app`)

**Important:** After adding/changing environment variables, you need to **redeploy** for changes to take effect.

#### 4. Check Vercel Logs

To see what's happening:
1. Go to Vercel Dashboard → Your Project → Logs
2. Look for messages starting with `📱` (WhatsApp logs)
3. Check for errors like:
   - `❌ WhatsApp API error`
   - `❌ Error sending WhatsApp message`
   - `Twilio API error`

#### 5. Test the WhatsApp API Directly

You can test if Twilio is working by checking:
- Twilio Console → Monitor → Logs → Messaging
- Look for any failed message attempts
- Check error codes and messages

## Quick Checklist

- [ ] Joined WhatsApp sandbox (sent "join [keyword]" to sandbox number)
- [ ] Phone number includes country code (e.g., `+1...`)
- [ ] Environment variables set in Vercel
- [ ] Redeployed after setting environment variables
- [ ] Checked Vercel logs for errors
- [ ] Checked Twilio Console for message status

## For Production (Non-Sandbox)

When you're ready for production:
1. Request WhatsApp Business API access from Twilio
2. Get a verified WhatsApp Business number
3. Update `TWILIO_WHATSAPP_FROM` with your production number
4. No need to join sandbox - works with any phone number

## Still Not Working?

1. **Check Vercel Logs:**
   - Look for `📱` emoji logs
   - Check for error messages

2. **Check Twilio Console:**
   - Monitor → Logs → Messaging
   - See if messages are being attempted
   - Check error codes

3. **Verify Phone Number:**
   - Make sure it's in E.164 format
   - Include country code

4. **Test with a Different Number:**
   - Try with a different phone that has joined the sandbox
