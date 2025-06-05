#!/bin/bash

echo "🔑 Supabase キーをVercelに設定"
echo "================================"
echo ""
echo "このスクリプトを実行して、Supabaseのキーを設定します。"
echo ""

# Supabase URLとAnon Keyを入力
read -p "1. Supabase URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "2. Supabase Anon Key: " SUPABASE_ANON_KEY

echo ""
echo "📝 Vercelに環境変数を設定中..."

# Vercel CLIで環境変数を設定
vercel env rm EXPO_PUBLIC_SUPABASE_URL production 2>/dev/null
vercel env rm EXPO_PUBLIC_SUPABASE_ANON_KEY production 2>/dev/null

echo "$SUPABASE_URL" | vercel env add EXPO_PUBLIC_SUPABASE_URL production
echo "$SUPABASE_ANON_KEY" | vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY production
echo "production" | vercel env add EXPO_PUBLIC_ENV production

echo ""
echo "✅ 環境変数の設定が完了しました！"
echo ""
echo "📌 次のステップ:"
echo "1. 本番環境を再デプロイ: vercel --prod --force"
echo "2. デプロイ完了後、ブラウザで確認"
echo ""
echo "🔍 設定を確認する場合: vercel env ls production"