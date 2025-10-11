#!/bin/bash

echo "🚀 Starting Life Skills Prep for Client Access"
echo "=============================================="

# Get your local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n1)

echo "📡 Your local IP address: $LOCAL_IP"
echo "🌐 Client should access: http://$LOCAL_IP:5000"
echo ""
echo "📋 Instructions for your client:"
echo "1. Make sure both devices are on the same WiFi network"
echo "2. Open browser and go to: http://$LOCAL_IP:5000"
echo "3. If it doesn't work, check firewall settings"
echo ""
echo "🔧 Starting server..."

# Start the development server
npm run dev
