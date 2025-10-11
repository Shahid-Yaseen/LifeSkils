#!/bin/bash

echo "🌐 Life Skills Prep - ngrok Setup"
echo "================================="

# Start the app in background
echo "🚀 Starting Life Skills Prep app..."
npm run dev &
APP_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Check if server is running
if ! curl -s http://localhost:5000 > /dev/null; then
    echo "❌ Server failed to start. Please check for errors above."
    kill $APP_PID 2>/dev/null
    exit 1
fi

echo "✅ Server is running on localhost:5000"
echo ""
echo "🌐 Starting ngrok tunnel..."
echo "=========================="
echo "📱 Your client can access the app using the ngrok URL that appears below:"
echo ""

# Start ngrok
ngrok http 5000
