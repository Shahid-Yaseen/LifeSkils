#!/bin/bash

echo "🌐 Starting Life Skills Prep with ngrok"
echo "======================================="

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Installing..."
    brew install ngrok/ngrok/ngrok
fi

# Check if ngrok is authenticated
if ! ngrok config check &> /dev/null; then
    echo "🔑 ngrok needs authentication. Please sign up at https://ngrok.com and get your authtoken"
    echo "Then run: ngrok config add-authtoken YOUR_TOKEN"
    echo "Or run: ngrok authtoken YOUR_TOKEN"
    read -p "Press Enter after setting up your authtoken..."
fi

echo "🚀 Starting your Life Skills Prep app..."
npm run dev &

# Wait for the server to start
echo "⏳ Waiting for server to start..."
sleep 5

echo ""
echo "🌐 Starting ngrok tunnel..."
echo "=========================="
echo "Your client can access the app using the ngrok URL below:"
echo ""

# Start ngrok and capture the output
ngrok http 5000 --log stdout
