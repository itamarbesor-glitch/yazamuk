# How to Check WhatsApp Message Delivery Status

## Quick Steps

1. **Get the Message SID from logs:**
   - Look for: `messageSid: 'MM...'` in your Vercel logs
   - Example: `MM7ab90bc348a1a95f7be70a5e1437d76e`

2. **Check in Twilio Console:**
   - Go to: https://console.twilio.com/us1/monitor/logs/messaging
   - Or use the direct link from logs (if provided)
   - Search for your Message SID

3. **Check the Status:**
   - **queued** = Message accepted, waiting to be sent
   - **sent** = Message sent to WhatsApp
   - **delivered** = Message delivered to recipient
   - **failed** = Delivery failed (check error code)
   - **undelivered** = Could not deliver (check error code)

## Common Error Codes

### Error 63007: "Unsubscribed recipient"
- **Meaning:** Recipient has not joined the WhatsApp sandbox
- **Solution:** Recipient must send "join [keyword]" to the sandbox number first

### Error 63016: "Invalid WhatsApp number"
- **Meaning:** Phone number format is incorrect or not registered on WhatsApp
- **Solution:** 
  - Ensure number includes country code (e.g., `+1` for US)
  - Verify the number is registered on WhatsApp
  - Format must be: `+[country code][number]` (e.g., `+1234567890`)

### Error 21608: "Invalid 'To' Phone Number"
- **Meaning:** Phone number format is invalid
- **Solution:** Check that number is in E.164 format with country code

## If Status is "queued" but Not Delivered

1. **Check if recipient joined sandbox:**
   - Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
   - Find your sandbox number and join code
   - Recipient must send: `join [keyword]` to the sandbox number

2. **Verify phone number format:**
   - Must include country code
   - Example: `+1234567890` (not `1234567890`)
   - Check logs for the exact number sent

3. **Wait a few minutes:**
   - Sometimes delivery takes 1-2 minutes
   - Check status again after waiting

4. **Check Twilio Console for detailed error:**
   - Go to Monitor → Logs → Messaging
   - Click on your message
   - Check "Error Code" and "Error Message" fields

## Getting Help

If message shows as "queued" but never delivers:
1. Check Twilio Console for error details
2. Verify recipient joined sandbox
3. Verify phone number format
4. Check if phone number is registered on WhatsApp
