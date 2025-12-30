# Moving from WhatsApp Sandbox to Production

This guide explains how to enable production WhatsApp messaging so users can receive messages without joining a sandbox.

## Current Status: Sandbox Mode

Right now, you're using **Twilio WhatsApp Sandbox**, which has these limitations:
- ❌ Recipients must send "join [keyword]" to your sandbox number first
- ❌ Only works for testing with limited recipients
- ❌ Not suitable for real users

## What You Need: Production WhatsApp Business API

To send WhatsApp messages to **any user** without them joining a sandbox, you need:

1. **Twilio WhatsApp Business API access** (approved by Twilio)
2. **A verified WhatsApp Business number**
3. **Updated environment variables**

## Step-by-Step: Request Production Access

### Step 1: Request WhatsApp Business API Access

1. **Log in to Twilio Console:**
   - Go to [https://console.twilio.com](https://console.twilio.com)
   - Navigate to your account

2. **Go to WhatsApp Senders:**
   - Click **Messaging** → **Senders** → **WhatsApp Senders**
   - Or go directly: [https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders](https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders)

3. **Request a WhatsApp Sender:**
   - Click **"Request WhatsApp Sender"** or **"Add WhatsApp Sender"**
   - Fill out the application form:

   **Required Information:**
   - **Business Name:** Your company/product name (e.g., "Yazamuk")
   - **Business Description:** What your business does
   - **Use Case:** Describe how you'll use WhatsApp
     - Example: "Sending gift notifications to users when they receive stock gifts"
   - **Sample Messages:** Provide examples of messages you'll send
     - Example: "🎁 You received a gift from John! via Yazamuk 📈\n\nJohn gifted you $250 worth of TSLA stock!\n\nClaim your gift here: [link]"
   - **Business Website:** Your website URL
   - **Business Address:** Your business address (if applicable)

4. **Submit for Approval:**
   - Review your information
   - Submit the application
   - **Approval typically takes 1-3 business days**

### Step 2: Wait for Approval

- Twilio will review your application
- You'll receive email notifications about the status
- Check your Twilio Console for updates

### Step 3: Get Your Production WhatsApp Number

Once approved:

1. **Check Twilio Console:**
   - Go to **Messaging** → **Senders** → **WhatsApp Senders**
   - You'll see your approved WhatsApp number
   - Format: `whatsapp:+[country code][number]` (e.g., `whatsapp:+14155238886`)

2. **Note the Number:**
   - Copy this number exactly as shown
   - This is your production WhatsApp sender number

### Step 4: Update Environment Variables

Update your production environment variables:

**In Vercel:**
1. Go to your project → **Settings** → **Environment Variables**
2. Update `TWILIO_WHATSAPP_FROM`:
   ```
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```
   (Replace with your actual production number)

3. **Redeploy** your application

**In Other Platforms:**
- Update the `TWILIO_WHATSAPP_FROM` environment variable
- Restart your application

### Step 5: Test Production WhatsApp

1. **Test with a Real Number:**
   - Create a test gift
   - Use a real WhatsApp number (with country code, e.g., `+1234567890`)
   - The recipient should receive the message **without** joining any sandbox

2. **Verify in Twilio Console:**
   - Go to **Monitor** → **Logs** → **Messaging**
   - Check that messages are being sent successfully
   - Look for delivery status: `delivered`, `sent`, etc.

## Key Differences: Sandbox vs Production

| Feature | Sandbox | Production |
|---------|---------|------------|
| **Recipients must join** | ✅ Yes (send "join [keyword]") | ❌ No |
| **Works with any number** | ❌ No | ✅ Yes |
| **Approval required** | ❌ No | ✅ Yes (1-3 days) |
| **Suitable for** | Testing only | Real users |
| **Cost** | Free tier available | Pay per message |

## Important Notes

### Phone Number Format
- Always include country code: `+1234567890` (not `1234567890`)
- The code automatically adds `whatsapp:` prefix
- Example: User enters `+1234567890` → Code sends to `whatsapp:+1234567890`

### Message Templates (24-Hour Window)
- **First message:** Must use a pre-approved message template
- **After user replies:** You can send free-form messages for 24 hours
- **After 24 hours:** Must use templates again

**For your use case (gift notifications):**
- You'll likely need to create message templates in Twilio
- Templates must be approved by WhatsApp
- This adds another approval step (1-2 business days)

### Template Creation

1. **Go to Twilio Console:**
   - **Messaging** → **Content Templates** → **WhatsApp Templates**

2. **Create a Template:**
   - Click **"Create Template"**
   - Fill out:
     - **Name:** e.g., "gift_notification"
     - **Category:** Choose appropriate category
     - **Language:** English (or your language)
     - **Body:** Your message template
       ```
       🎁 You received a gift from {{1}}! via Yazamuk 📈

       {{1}} gifted you ${{2}} worth of {{3}} stock!

       Claim your gift here: {{4}}
       ```
   - **Variables:** Define variables ({{1}}, {{2}}, etc.)
   - Submit for approval

3. **Wait for Template Approval:**
   - WhatsApp reviews templates (1-2 business days)
   - Once approved, you can use it

4. **Update Your Code:**
   - Modify `/app/api/send-whatsapp/route.ts` to use template ID
   - Or use the template name with variables

### Alternative: Use Free-Form Messages (24-Hour Window)

If users can reply to your messages, you get a 24-hour window to send free-form messages:

1. **User receives template message**
2. **User replies** (even with "OK" or emoji)
3. **You can send free-form messages for 24 hours**
4. **After 24 hours:** Must use templates again

**For gift notifications:** This might work if users can quickly reply, but templates are more reliable.

## Cost Considerations

- **WhatsApp messages:** Typically $0.005 - $0.01 per message (varies by country)
- **Template messages:** Usually same price as regular messages
- **Free tier:** Twilio may offer some free messages for new accounts
- **Check pricing:** [https://www.twilio.com/whatsapp/pricing](https://www.twilio.com/whatsapp/pricing)

## Quick Checklist

- [ ] Request WhatsApp Business API access in Twilio Console
- [ ] Wait for approval (1-3 business days)
- [ ] Get your production WhatsApp number
- [ ] Create message templates (if needed)
- [ ] Wait for template approval (1-2 business days)
- [ ] Update `TWILIO_WHATSAPP_FROM` environment variable
- [ ] Update code to use templates (if using templates)
- [ ] Test with real phone numbers
- [ ] Monitor usage and costs

## Need Help?

- **Twilio Support:** [https://support.twilio.com](https://support.twilio.com)
- **WhatsApp Business API Docs:** [https://www.twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- **Template Guidelines:** [https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates](https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates)

## Summary

**To move from sandbox to production:**

1. **Request WhatsApp Business API access** (1-3 days approval)
2. **Create message templates** (1-2 days approval) - if needed
3. **Update environment variable** with production number
4. **Test and deploy**

The main blocker is the approval process - plan for 2-5 business days total.
