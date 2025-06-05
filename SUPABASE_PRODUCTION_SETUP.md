# Supabase 本番環境設定ガイド

## 1. 環境変数の設定

### Vercelダッシュボードで設定する環境変数

```
EXPO_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
EXPO_PUBLIC_ENV=production
```

## 2. Supabase Authentication設定

### 2.1 認証プロバイダー設定

1. Supabaseダッシュボード → Authentication → Providers
2. Email認証を有効化
3. 以下の設定を確認：
   - **Enable Email Confirmations**: ON（メール確認を有効化）
   - **Enable Email Change Confirmations**: ON
   - **Secure Email Change**: ON

### 2.2 URLコンフィギュレーション

**重要**: Authentication → URL Configuration で以下を設定

```
Site URL: https://pomomate-p0iya2bod-ivygains-projects.vercel.app
Redirect URLs:
  - https://pomomate-p0iya2bod-ivygains-projects.vercel.app/**
  - https://pomomate-p0iya2bod-ivygains-projects.vercel.app/email-confirmed
  - https://pomomate-p0iya2bod-ivygains-projects.vercel.app/reset-password
```

### 2.3 メールテンプレート設定

Authentication → Email Templates で各テンプレートをカスタマイズ：

#### 確認メール (Confirm signup)
```html
<h2>PomoMateへようこそ！</h2>
<p>ご登録ありがとうございます。以下のボタンをクリックしてメールアドレスを確認してください。</p>
<p><a href="{{ .ConfirmationURL }}">メールアドレスを確認</a></p>
<p>リンクが機能しない場合は、以下のURLをブラウザにコピー＆ペーストしてください：</p>
<p>{{ .ConfirmationURL }}</p>
<hr>
<p>このメールに心当たりがない場合は、無視していただいて構いません。</p>
```

#### パスワードリセット (Reset Password)
```html
<h2>パスワードリセット</h2>
<p>パスワードをリセットするには、以下のボタンをクリックしてください。</p>
<p><a href="{{ .ConfirmationURL }}">パスワードをリセット</a></p>
<p>リンクが機能しない場合は、以下のURLをブラウザにコピー＆ペーストしてください：</p>
<p>{{ .ConfirmationURL }}</p>
<p>このリンクは1時間有効です。</p>
<hr>
<p>このメールに心当たりがない場合は、無視していただいて構いません。</p>
```

#### 招待メール (Invite user)
```html
<h2>PomoMateへの招待</h2>
<p>PomoMateにご招待されました！以下のボタンをクリックしてアカウントを作成してください。</p>
<p><a href="{{ .ConfirmationURL }}">アカウントを作成</a></p>
<p>リンクが機能しない場合は、以下のURLをブラウザにコピー＆ペーストしてください：</p>
<p>{{ .ConfirmationURL }}</p>
```

### 2.4 メール設定

Authentication → SMTP Settings で設定（オプション）:

カスタムSMTPサーバーを使用する場合：
```
Host: smtp.sendgrid.net (例)
Port: 587
User: apikey
Pass: [YOUR-SENDGRID-API-KEY]
Sender Email: noreply@pomodoroplay.app
Sender Name: PomoMate
```

## 3. Database設定

### 3.1 Row Level Security (RLS)

各テーブルでRLSが有効になっていることを確認：

```sql
-- users テーブル
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみ参照可能
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- ユーザーは自分のデータのみ更新可能
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 3.2 必要なテーブル

以下のテーブルが作成されていることを確認：
- users
- sessions
- user_settings
- user_characters
- user_achievements
- teams
- team_members
- friends

## 4. Storage設定

### 4.1 バケットの作成

Storage → New bucket で以下を作成：
- `avatars` (公開バケット) - ユーザーアバター用
- `game-assets` (公開バケット) - ゲームアセット用

### 4.2 ポリシーの設定

```sql
-- avatarsバケット: ユーザーは自分のアバターのみアップロード可能
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 公開読み取り
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
```

## 5. Edge Functions設定（オプション）

カスタムロジックが必要な場合：

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // 通知送信ロジック
})
```

## 6. 本番環境のセキュリティ設定

### 6.1 API設定

Settings → API で確認：
- **anon public** キーのみをフロントエンドで使用
- **service_role** キーは絶対に公開しない

### 6.2 認証設定

Settings → Auth で設定：
- **JWT有効期限**: 3600秒（1時間）
- **リフレッシュトークン再利用**: OFF
- **パスワード最小文字数**: 8

## 7. モニタリング設定

### 7.1 ログ設定

Settings → Logs で以下を有効化：
- API logs
- Auth logs
- Database logs

### 7.2 アラート設定

必要に応じて以下のアラートを設定：
- 認証エラー率
- データベース接続エラー
- ストレージ使用量

## 8. バックアップ設定

Settings → Database → Backups で設定：
- **自動バックアップ**: 毎日
- **保持期間**: 30日

## デプロイ後のチェックリスト

- [ ] 本番URLがSupabaseのRedirect URLsに登録されている
- [ ] メールテンプレートが日本語にカスタマイズされている
- [ ] RLSが全テーブルで有効になっている
- [ ] 環境変数がVercelに設定されている
- [ ] メール確認機能が正常に動作する
- [ ] パスワードリセット機能が正常に動作する
- [ ] デモアカウントでログインできる

## トラブルシューティング

### メール確認リンクが機能しない場合

1. URL Configurationを再確認
2. リダイレクトURLのパスが正しいか確認
3. Vercelの環境変数が正しく設定されているか確認

### CORS エラーが発生する場合

Supabaseダッシュボード → Settings → API → CORS Allowed Origins に本番URLを追加

### 認証エラーが発生する場合

1. anon keyが正しいか確認
2. RLSポリシーを確認
3. JWTの有効期限を確認