#!/bin/bash

echo "🍅 PomoMate - 安定版開発サーバー"
echo "================================"
echo ""
echo "📌 このサーバーはリロードに対応しています"
echo ""

# クリーンアップ
echo "🧹 既存プロセスをクリーンアップ中..."
pkill -f expo 2>/dev/null
pkill -f Metro 2>/dev/null
pkill -f webpack 2>/dev/null
sleep 2

# キャッシュクリア
echo "🗑️  キャッシュをクリア中..."
rm -rf .expo 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
rm -rf .cache 2>/dev/null

# ポートチェック
if lsof -i :8081 > /dev/null 2>&1; then
  echo "⚠️  ポート8081を解放中..."
  lsof -t -i :8081 | xargs kill -9 2>/dev/null
  sleep 1
fi

# 環境変数設定
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export EXPO_PACKAGER_PROXY_URL=http://localhost:8081
export NODE_OPTIONS="--max-old-space-size=4096"

echo "🚀 サーバーを起動中..."
echo ""
echo "アクセスURL:"
echo "  📱 メイン: http://localhost:8081"
echo "  🔄 リロード対応: http://127.0.0.1:8081"
echo ""
echo "💡 ヒント:"
echo "  - リロード時にエラーが出る場合は http://127.0.0.1:8081 を使用"
echo "  - 新しいタブで開くとより安定します"
echo "  - Ctrl+C で停止"
echo ""

# サーバー起動（エラーハンドリング付き）
(
  npx expo start --web --clear 2>&1 | while IFS= read -r line; do
    echo "$line"
    
    # エラー検出と自動復旧
    if [[ "$line" == *"EADDRINUSE"* ]]; then
      echo "⚠️  ポートが使用中です。再起動を試みます..."
      pkill -f expo
      sleep 2
      exec "$0"
    fi
    
    if [[ "$line" == *"Metro"*"error"* ]]; then
      echo "⚠️  Metroエラーを検出。キャッシュをクリアします..."
      rm -rf node_modules/.cache/metro
    fi
  done
) || {
  echo "❌ サーバーが予期せず終了しました"
  echo "🔄 5秒後に自動的に再起動します..."
  sleep 5
  exec "$0"
}