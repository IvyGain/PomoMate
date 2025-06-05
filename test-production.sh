#!/bin/bash

echo "🧪 本番環境テスト"
echo "================"

# 環境変数を本番用に設定
export NODE_ENV=production
export EXPO_PUBLIC_ENV=production

# 必要な環境変数が設定されているか確認
if [ -f .env.production ]; then
    echo "✅ .env.production を読み込みます"
    source .env.production
else
    echo "⚠️  .env.production が見つかりません"
fi

# Supabase URLとキーの確認
if [ -z "$EXPO_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ EXPO_PUBLIC_SUPABASE_URL が設定されていません"
    echo "📝 .env.production に以下を追加してください:"
    echo "   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url"
    echo "   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
    exit 1
fi

echo ""
echo "📊 環境設定:"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - EXPO_PUBLIC_ENV: $EXPO_PUBLIC_ENV"
echo "  - SUPABASE_URL: ${EXPO_PUBLIC_SUPABASE_URL:0:30}..."
echo ""

# 開発サーバーを本番モードで起動
echo "🚀 本番モードで開発サーバーを起動..."
echo "   URL: http://localhost:8081"
echo ""

npm run web:stable