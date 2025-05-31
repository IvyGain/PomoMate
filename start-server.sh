#!/bin/bash

echo "🔧 Starting Pomodoro Play Server..."
echo ""

# Check current directory
echo "📁 Current directory: $(pwd)"

# Kill any existing processes
echo "🛑 Stopping existing processes..."
pkill -f expo 2>/dev/null || true
pkill -f metro 2>/dev/null || true
sleep 2

# Check network connectivity
echo "🌐 Network check:"
ifconfig | grep "inet " | head -3

# Clear cache and node_modules issues
echo "🧹 Clearing cache..."
npx expo install --fix >/dev/null 2>&1 || true

# Start Expo with debug info
echo "🚀 Starting Expo server..."
echo "   - Local access: http://localhost:8081"
echo "   - Network access: http://$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1):8081"
echo ""

# Start with explicit network binding
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
npx expo start --dev-client --clear