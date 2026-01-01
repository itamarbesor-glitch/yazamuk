#!/bin/bash

# Get local IP address for mobile testing
# Works on macOS and Linux

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}' 2>/dev/null || ip addr show | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}' | cut -d'/' -f1)
else
    IP="unknown"
fi

if [ -z "$IP" ] || [ "$IP" == "unknown" ]; then
    echo "⚠️  Could not detect IP address automatically"
    echo "   Please find your IP manually:"
    echo "   macOS: System Preferences → Network"
    echo "   Linux: hostname -I"
    echo ""
    echo "   Then access: http://YOUR_IP:3000"
else
    echo ""
    echo "📱 Mobile Testing Setup"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Your local IP: $IP"
    echo ""
    echo "On your mobile device (same Wi-Fi network):"
    echo "👉 Open: http://$IP:3000"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
fi
