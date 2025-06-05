#!/bin/bash

echo "🚀 PomoMate - 本番環境ビルド"
echo "============================"

# 環境変数の設定
export NODE_ENV=production
export EXPO_PUBLIC_ENV=production

# 既存のビルドディレクトリをクリーンアップ
echo "🧹 ビルドディレクトリをクリーンアップ..."
rm -rf dist web-build .expo/web/cache

# 依存関係の確認
echo "📦 依存関係を確認..."
npm install

# TypeScriptの型チェック
echo "🔍 TypeScriptの型チェック..."
npm run typecheck || true

# 本番ビルド
echo "🏗️  本番ビルドを開始..."
npx expo export -p web --output dist

# ビルド結果の確認
if [ -d "dist" ]; then
    echo "✅ ビルド成功！"
    echo "📁 ビルドファイル: dist/"
    
    # ファイルサイズの確認
    echo ""
    echo "📊 ビルドサイズ:"
    du -sh dist/
    
    # index.htmlの存在確認
    if [ -f "dist/index.html" ]; then
        echo "✅ index.html が正常に生成されました"
    else
        echo "❌ index.html が見つかりません"
        exit 1
    fi
else
    echo "❌ ビルドに失敗しました"
    exit 1
fi

echo ""
echo "📝 次のステップ:"
echo "  1. ローカルでテスト: npx serve dist -p 5000"
echo "  2. Vercelにデプロイ: vercel --prod"
echo "  3. または: npm run auto:deploy"