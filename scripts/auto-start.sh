#!/bin/bash

# Auto Start Script for PomoMate Development
# This script automates the development environment startup

set -e

echo "🚀 Starting PomoMate Development Environment..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $port is already in use"
        return 0
    else
        echo "✅ Port $port is available"
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo "🔧 Killing process on port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
}

# Navigate to project directory
cd "$(dirname "$0")/.."

# Check and handle port 8081
if check_port 8081; then
    read -p "Kill process on port 8081? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port 8081
    fi
fi

# Check and handle port 8082
if check_port 8082; then
    read -p "Kill process on port 8082? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port 8082
    fi
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start Expo
echo "🎮 Starting Expo development server..."
echo "📱 Use Expo Go app to scan the QR code"
echo "💻 Web interface will open automatically"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start