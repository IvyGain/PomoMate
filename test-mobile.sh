#!/bin/bash

echo "🍅 Pomodoro Play - モバイルテスト"
echo "=================================="

# Stop any existing processes
echo "🛑 既存のプロセスを停止中..."
pkill -f expo 2>/dev/null
pkill -f Metro 2>/dev/null
sleep 2

# Check network
echo "🌐 ネットワークチェック:"
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print "  " $2}'

# Method 1: Try LAN connection
echo ""
echo "📱 方法1: LAN接続でテスト"
echo "export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0"
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Get IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "🏠 ローカルIP: $LOCAL_IP"

# Start Expo with LAN
echo "🚀 Expoサーバーを起動中..."
echo ""
echo "📋 手動接続手順:"
echo "1. スマートフォンとパソコンが同じWi-Fiに接続されていることを確認"
echo "2. Expo Goアプリを開く"
echo "3. 'Scan QR code' または 'Enter URL manually' を選択"
echo "4. QRコードをスキャンまたは下記URLを入力:"
echo "   exp://$LOCAL_IP:8081"
echo ""
echo "🎯 接続できない場合:"
echo "- ファイアウォール設定を確認"
echo "- Wi-Fiルーターの設定を確認"
echo "- または Ctrl+C で停止後、./test-mobile.sh tunnel を実行"
echo ""

# Start Expo
npx expo start --clear --lan