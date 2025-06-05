#!/bin/bash

echo "🔧 Vercel環境変数自動設定スクリプト"
echo "===================================="
echo ""

# 環境変数の値を取得
echo "以下の情報を入力してください:"
echo ""

read -p "Supabase URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "本番環境のURL (デフォルト: https://pomomate-p0iya2bod-ivygains-projects.vercel.app): " PROD_URL

# デフォルト値の設定
PROD_URL=${PROD_URL:-https://pomomate-p0iya2bod-ivygains-projects.vercel.app}

echo ""
echo "📝 Vercelに環境変数を設定中..."

# Vercel CLIを使用して環境変数を設定
vercel env add EXPO_PUBLIC_SUPABASE_URL production <<< "$SUPABASE_URL"
vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY production <<< "$SUPABASE_ANON_KEY"
vercel env add EXPO_PUBLIC_ENV production <<< "production"

# APIのURLも設定（将来のバックエンド用）
vercel env add EXPO_PUBLIC_API_URL production <<< "https://api.pomodoroplay.app"
vercel env add EXPO_PUBLIC_WS_URL production <<< "wss://api.pomodoroplay.app"

echo ""
echo "✅ 環境変数の設定が完了しました！"
echo ""
echo "📌 次のステップ:"
echo "1. 本番環境を再デプロイ: vercel --prod"
echo "2. デプロイ完了後、ブラウザでアクセスして確認"
echo ""
echo "🔍 設定された環境変数を確認: vercel env ls"