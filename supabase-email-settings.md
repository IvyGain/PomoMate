# Supabase Email設定ガイド

## メール確認を無効にする方法（開発時）

1. Supabaseダッシュボードにログイン
2. **Authentication** → **Providers** → **Email** を選択
3. 以下の設定を変更：
   - **Confirm email**: OFF にする
   - **Secure email change**: OFF にする
   
これで新規登録時にメール確認なしですぐにログインできるようになります。

## 本番環境では

セキュリティのため、本番環境では必ずメール確認を有効にしてください：
- **Confirm email**: ON
- **Secure email change**: ON

## カスタムメールテンプレート

1. **Authentication** → **Email Templates** で各種メールテンプレートをカスタマイズ可能
2. 推奨カスタマイズ：
   - ブランド名を「PomoMate」に変更
   - ロゴやカラーを追加
   - 日本語メッセージに変更