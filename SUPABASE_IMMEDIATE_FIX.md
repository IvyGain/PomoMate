# 🚨 Supabase緊急修正手順

## 現在の問題
- **データベーステーブルが存在しない** (`relation "public.users" does not exist`)
- **デモユーザーが登録されていない** (`Invalid login credentials`)
- **メール機能の設定問題** (`Error sending confirmation email`)

## 📋 実行必須項目（順番重要）

### 1. Supabaseダッシュボードにアクセス
```
https://supabase.com/dashboard/project/xjxgapahcookarqiwjww
```

### 2. データベーステーブルの作成
**SQL Editor** → **New Query** → 以下を実行：

```sql
-- supabase-setup-all.sql の内容を全て実行
-- ファイル: /Users/mashimaro/Documents/Workspace/Pomodoro Play/supabase-setup-all.sql
```

### 3. デモユーザーの作成
**Authentication** → **Users** → **Add user**:
- Email: `romancemorio+test@gmail.com`
- Password: `Po8silba8`
- **Email Confirm**: チェックを入れる

### 4. メール設定の確認
**Settings** → **Auth** → **Email Templates**:
- SMTP設定が正しく設定されているか確認
- または一時的に **Confirm email** を無効化

## 🔧 クイック修正方法（推奨）

### オプション1: テーブル作成のみ
```sql
-- 最小限のテーブル作成
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS無効化（開発中のみ）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### オプション2: 確認なしサインアップ
**Settings** → **Auth** → **Email**:
- **Enable email confirmations**: OFF

## ⚡ 即座に試せる修正

### 認証情報の確認
現在使用されているSupabaseプロジェクト:
- URL: `https://xjxgapahcookarqiwjww.supabase.co`  
- プロジェクトID: `xjxgapahcookarqiwjww`

### 設定確認コマンド
```bash
# 現在のプロジェクト状況確認
curl -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqeGdhcGFoY29va2FycWl3and3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Mzc3MDMsImV4cCI6MjA2NDIxMzcwM30.S2C4PwG_RTv91Fm0VVN3B3lj0A909XddBaqPjZWAKXQ" \
https://xjxgapahcookarqiwjww.supabase.co/rest/v1/users?select=id
```

## 🎯 今すぐ実行すべき最優先タスク

1. **Supabaseダッシュボードを開く**
2. **SQL Editorで`supabase-setup-all.sql`を実行**
3. **デモユーザーを手動作成**
4. **メール確認を一時的に無効化**

修正後は即座にアプリケーションのログイン機能が動作するはずです。