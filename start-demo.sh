#!/bin/bash

echo "🚀 Starting Pomodoro Play Demo..."
echo ""
echo "📱 スマホでテストする方法:"
echo "1. App Store / Google Play で 'Expo Go' アプリをダウンロード"
echo "2. 下記のQRコードをExpo Goアプリでスキャン"
echo "3. または下記のURLを直接開く"
echo ""

# Start Expo in background
cd "/Users/mashimaro/Documents/Workspace/Pomodoro Play"
npx expo start --tunnel --clear &
EXPO_PID=$!

echo "Expo server starting (PID: $EXPO_PID)..."
echo ""

# Wait a bit for server to start
sleep 10

# Check if server is running
if curl -s http://localhost:8081/status > /dev/null 2>&1; then
    echo "✅ Expo server is running!"
    echo ""
    echo "🌐 アクセス方法:"
    echo "• Web: http://localhost:8081"
    echo "• QRコード: Expo Goアプリでスキャンしてください"
    echo ""
    echo "🎮 デモ用ログイン情報:"
    echo "• Email: demo@pomodoroplay.com"
    echo "• Password: demo123"
    echo ""
    echo "⚡ 機能テスト項目:"
    echo "• ユーザー登録・ログイン"
    echo "• ポモドーロタイマー (25分/5分/15分)"
    echo "• キャラクター育成システム"
    echo "• アチーブメント解除"
    echo "• 統計表示"
    echo "• 設定変更"
    echo ""
    echo "🛑 サーバーを停止するには: kill $EXPO_PID"
else
    echo "❌ Server not responding, trying alternative..."
    
    # Try tunnel mode for mobile access
    echo "🌐 Tunnel mode for mobile access..."
    npx expo start --tunnel --clear
fi