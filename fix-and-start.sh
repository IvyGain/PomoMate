#!/bin/bash

echo "🔧 Fixing Expo configuration..."

# Clear any existing processes
pkill -f expo 2>/dev/null || true
pkill -f metro 2>/dev/null || true

echo "📱 Starting Expo server..."
cd "/Users/mashimaro/Documents/Workspace/Pomodoro Play"

# Clear cache and start fresh
npx expo start --clear --tunnel --no-dev --minify=false

echo "✅ Server should be running now!"
echo ""
echo "📱 スマホでアクセス:"
echo "1. Expo Go アプリを開く"
echo "2. QRコードをスキャンするか"
echo "3. 'Enter URL manually' で exp://exp.host/@anonymous/pomodoro-play を入力"
echo ""
echo "🎮 ログイン情報:"
echo "Email: demo@pomodoroplay.com"
echo "Password: demo123"