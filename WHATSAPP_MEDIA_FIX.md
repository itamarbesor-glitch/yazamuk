# WhatsApp Media Error 63021 Fix

## Problem
Error 63021: "Channel invalid content error indicates that the message contains content that is rejected or unsupported by the messaging channel"

This error typically occurs when:
1. The media URL is not accessible from Twilio's servers
2. The image format is not supported
3. The image is too large (WhatsApp has size limits)
4. WhatsApp sandbox has restrictions on media

## Quick Fix: Disable Images Temporarily

To test if the image is causing the issue, you can temporarily disable images:

1. Open `/app/api/create-gift/route.ts`
2. Find the line: `// const imageUrl = null`
3. Uncomment it to: `const imageUrl = null`
4. This will send messages without images

## Permanent Solutions

### Option 1: Verify Image URL is Accessible
1. Check that your production URL is correct in Vercel environment variables
2. Test the image URL directly in a browser:
   - `https://your-domain.vercel.app/images/tsla.png`
   - Should load the image successfully
3. Make sure images are in `/public/images/` folder

### Option 2: Use a CDN
Instead of hosting images on Vercel, use a CDN:
- Upload images to Cloudinary, Imgur, or similar
- Update the `stockImageMap` in `create-gift/route.ts` to use CDN URLs

### Option 3: Check Image Requirements
WhatsApp media requirements:
- **Format**: JPG, PNG, GIF
- **Size**: Max 5MB
- **URL**: Must be publicly accessible (HTTPS)
- **Sandbox**: May have additional restrictions

### Option 4: Send Without Media (Simplest)
If images continue to cause issues, you can remove them entirely:
- Remove the `mediaUrl` parameter from the WhatsApp API call
- Messages will still work, just without images

## Testing Steps

1. **Test without image:**
   - Uncomment `const imageUrl = null` in `create-gift/route.ts`
   - Deploy and test
   - If message sends successfully, the image is the problem

2. **Test image URL:**
   - Verify image URL is accessible: `https://your-domain.vercel.app/images/tsla.png`
   - Check image size (should be < 5MB)
   - Check image format (should be PNG, JPG, or GIF)

3. **Check Twilio Console:**
   - Look at the exact error message
   - Check if it mentions the media URL specifically

## Current Status

The code now includes:
- Better validation of media URLs
- Warning logs when media might cause issues
- Easy way to disable images for testing

If you want to disable images permanently, uncomment the line in `create-gift/route.ts`.
