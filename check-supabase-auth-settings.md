# Supabase認証設定確認ガイド

## 🔧 Supabaseダッシュボードで確認する設定

### 1. Authentication → URL Configuration

以下の設定を確認・追加してください：

**Site URL:**
```
https://pomomate-p0iya2bod-ivygains-projects.vercel.app
```

**Redirect URLs (すべて追加):**
```
https://pomomate-p0iya2bod-ivygains-projects.vercel.app/**
https://pomomate-p0iya2bod-ivygains-projects.vercel.app/email-confirmed
http://localhost:8081/**
http://localhost:8081/email-confirmed
```

### 2. Authentication → Settings

**確認項目:**
- ✅ Enable email confirmations: **ON** (メール確認を有効にする)
- ✅ Email authentication: **Enabled**
- ⚠️ Secure email change: **ON**
- ⚠️ Double confirm email changes: **OFF**（推奨）

### 3. Authentication → Email Templates

**Confirm signup テンプレート:**
- Subject: `メールアドレスの確認 - PomoMate`
- 確認リンクが正しく設定されているか確認

## 📧 メール確認エラーの原因と解決法

### エラー: "Email link is invalid or has expired"

**原因:**
1. リダイレクトURLがSupabaseに登録されていない
2. トークンの有効期限切れ（通常24時間）
3. すでに確認済みのリンクを再度クリック

**解決法:**

#### A. 即座に解決する方法（推奨）
1. Supabaseダッシュボード → Authentication → Users
2. 該当ユーザーを見つける
3. **Email Confirmed** を手動で `true` に設定
4. アプリでログインを試行

#### B. 設定を修正する方法
1. 上記のURL設定を確認・修正
2. 新しい確認メールをリクエスト
3. 新しいリンクをクリック

## 🔍 デバッグ用SQLクエリ

Supabaseダッシュボードの SQL Editor で実行：

```sql
-- 認証ユーザーの状態確認
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users 
WHERE email LIKE '%romancemorio%' 
   OR email LIKE '%test%'
ORDER BY created_at DESC;

-- 特定ユーザーの詳細
SELECT * FROM auth.users 
WHERE email = 'romancemorio+test@gmail.com';

-- 手動でメール確認を有効化（必要に応じて）
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'romancemorio+test@gmail.com'
  AND email_confirmed_at IS NULL;
```

## 🚀 テスト手順

### 1. 既存ユーザーの確認
```sql
-- デモユーザーの状態確認
SELECT 
  email,
  email_confirmed_at IS NOT NULL as is_confirmed,
  created_at
FROM auth.users 
WHERE email = 'romancemorio+test@gmail.com';
```

### 2. 手動確認（推奨）
```sql
-- メール確認を手動で完了
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'romancemorio+test@gmail.com';
```

### 3. アプリでテスト
```bash
# 認証テストを実行
node test-demo-auth.js
```

## ✅ 成功確認

以下が表示されれば成功：
```
✅ ログイン成功！
👤 ユーザー情報:
   確認済み: はい
```

## 🆘 緊急時の対応

### 即座にテストしたい場合

1. **メール確認を無効化:**
   ```
   Authentication → Settings → Auth
   Enable email confirmations → OFF
   ```

2. **新しいテストユーザー作成:**
   ```
   Email: test@example.com
   Password: TestPassword123!
   Email Confirmed: ✅ (手動でチェック)
   ```

3. **アプリでテスト:**
   - デモログインボタンで新しいユーザーでテスト
   - または直接ログイン画面で入力

この設定により、メール確認のエラーが解決されるはずです。