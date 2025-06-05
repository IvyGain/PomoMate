#!/bin/bash

echo "🚀 Supabase環境変数クイック設定"
echo "================================"
echo ""
echo "SupabaseのURLとAnon Keyを順番に入力してください"
echo ""

# 対話式で入力を受け付ける
vercel env add EXPO_PUBLIC_SUPABASE_URL production
vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY production

# 確認
echo ""
echo "✅ 設定完了！確認中..."
vercel env ls production | grep SUPABASE

echo ""
echo "📌 最後のステップ："
echo "vercel --prod --force"
echo ""
echo "👆 このコマンドを実行して再デプロイしてください"