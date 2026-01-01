# Testing on Mobile Devices

There are several ways to test your local Next.js development server on a mobile device. Here are the most common methods:

## Method 1: Same Network (Recommended - Easiest)

This method allows you to access your local dev server from any device on the same Wi-Fi network.

### Step 1: Find Your Local IP Address

**On macOS:**
```bash
# Option 1: Using ifconfig
ifconfig | grep "inet " | grep -v 127.0.0.1

# Option 2: Using networksetup
ipconfig getifaddr en0

# Option 3: System Preferences
# System Preferences → Network → Select your Wi-Fi → Your IP is shown
```

**On Linux:**
```bash
hostname -I | awk '{print $1}'
# or
ip addr show | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

You'll get something like: `192.168.1.100` or `10.0.0.5`

### Step 2: Start Dev Server on Network

Update your `package.json` dev script to allow network access:

```bash
# Run with explicit host binding
npm run dev -- -H 0.0.0.0
```

Or use the new script I'll add (see below).

### Step 3: Access from Mobile

1. **Make sure your phone is on the same Wi-Fi network** as your computer
2. **Open your mobile browser** (Safari on iOS, Chrome on Android)
3. **Navigate to:** `http://YOUR_IP_ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`

### Troubleshooting Same Network Method

**Firewall blocking connection?**
- **macOS:** System Preferences → Security & Privacy → Firewall → Firewall Options → Allow incoming connections for Node
- **Windows:** Windows Defender → Allow an app through firewall → Add Node.js
- **Linux:** `sudo ufw allow 3000/tcp`

**Can't connect?**
- Make sure both devices are on the same Wi-Fi network
- Try disabling VPN if you're using one
- Check that your router allows device-to-device communication
- Try accessing from another device on the network first (like another computer)

---

## Method 2: Using ngrok (For External Access)

ngrok creates a secure tunnel to your local server, allowing access from anywhere (even outside your network).

### Step 1: Install ngrok

```bash
# macOS (using Homebrew)
brew install ngrok

# Or download from: https://ngrok.com/download
```

### Step 2: Start Your Dev Server

```bash
npm run dev
```

### Step 3: Create Tunnel

In a new terminal:
```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### Step 4: Access from Mobile

Open the HTTPS URL shown by ngrok on your mobile device:
- Example: `https://abc123.ngrok.io`

**Note:** Free ngrok URLs change each time you restart. For a stable URL, you need a paid ngrok account.

---

## Method 3: Chrome DevTools Remote Debugging (Advanced)

This method allows you to debug your mobile browser from your computer.

### For Android:

1. **Enable USB Debugging** on your Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"

2. **Connect via USB** and allow debugging

3. **Open Chrome** on your computer: `chrome://inspect`

4. **Start dev server** with network access (Method 1)

5. **Access from mobile** using your local IP

6. **Inspect and debug** from Chrome DevTools on your computer

### For iOS (macOS only):

1. **Enable Web Inspector** on iOS:
   - Settings → Safari → Advanced → Web Inspector

2. **Connect iPhone to Mac** via USB

3. **On Mac:** Safari → Develop → [Your iPhone] → [Your Page]

4. **Start dev server** with network access (Method 1)

5. **Access from iPhone** using your local IP

---

## Quick Setup Script

I'll add a new npm script to make this easier. After updating, you can simply run:

```bash
npm run dev:mobile
```

This will:
1. Find your local IP automatically
2. Start the server on 0.0.0.0 (accessible from network)
3. Display the URL you need to use on your mobile device

---

## Tips for Mobile Testing

1. **Keep DevTools Open**: Use Chrome DevTools device emulation to get a quick preview, but always test on real devices for accurate results

2. **Test Different Devices**: 
   - iPhone SE (smallest modern iPhone)
   - iPhone 12/13/14 (standard size)
   - iPhone Pro Max (largest)
   - Various Android devices

3. **Test Different Browsers**:
   - Safari (iOS) - most restrictive
   - Chrome (Android)
   - Firefox Mobile

4. **Check Network Speed**: Test on both Wi-Fi and cellular data

5. **Test Touch Interactions**: 
   - Tap targets (should be at least 44x44px)
   - Swipe gestures
   - Form inputs
   - Button presses

6. **Check Performance**:
   - Page load time
   - Animation smoothness
   - Image loading

---

## Common Issues

### "This site can't be reached"
- Make sure dev server is running
- Check that you're using the correct IP address
- Verify both devices are on the same network
- Check firewall settings

### "Connection refused"
- Server might only be listening on localhost
- Use `-H 0.0.0.0` flag to bind to all interfaces

### Slow loading on mobile
- This is normal for local development
- Consider using ngrok for better performance
- Or test on production/staging environment

---

## Recommended Workflow

1. **Quick Preview**: Use Chrome DevTools device emulation
2. **Real Device Testing**: Use Method 1 (Same Network) for regular testing
3. **External Testing**: Use Method 2 (ngrok) if you need to test from outside your network
4. **Debugging**: Use Method 3 (Remote Debugging) when you need to inspect and debug
