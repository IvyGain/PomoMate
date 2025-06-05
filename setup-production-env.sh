#!/bin/bash

echo "🔧 本番環境変数の設定"
echo "===================="

# Vercelの環境変数を設定
echo "📝 Vercelに環境変数を設定します..."

# Supabase
vercel env add EXPO_PUBLIC_SUPABASE_URL production
vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY production

# API URLs
vercel env add EXPO_PUBLIC_API_URL production
vercel env add EXPO_PUBLIC_WS_URL production

# Environment
vercel env add EXPO_PUBLIC_ENV production

echo ""
echo "✅ 環境変数の設定が完了しました"
echo ""
echo "📝 以下の値を設定してください:"
echo "  - EXPO_PUBLIC_SUPABASE_URL: あなたのSupabaseプロジェクトURL"
echo "  - EXPO_PUBLIC_SUPABASE_ANON_KEY: あなたのSupabase匿名キー"
echo "  - EXPO_PUBLIC_API_URL: https://api.pomodoroplay.app (本番APIのURL)"
echo "  - EXPO_PUBLIC_WS_URL: wss://api.pomodoroplay.app (WebSocketのURL)"
echo "  - EXPO_PUBLIC_ENV: production"