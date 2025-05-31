# 🔧 Supabase 緊急修復手順

## 問題
1. デモアカウント `demo@example.com` が "invalid email" エラー
2. 環境変数に余分な改行文字（`\n`）が含まれている

## ✅ 修正手順

### 1. Vercelの環境変数修正

1. [Vercel Dashboard](https://vercel.com/dashboard) → プロジェクト選択
2. Settings → Environment Variables
3. 以下の変数の値から**改行文字を除去**：

```
EXPO_PUBLIC_SUPABASE_URL=https://xjxgapahcookarqiwjww.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqeGdhcGFoY29va2FycWl3and3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Mzc3MDMsImV4cCI6MjA2NDIxMzcwM30.S2C4PwG_RTv91Fm0VVN3B3lj0A909XddBaqPjZWAKXQ
```

**重要**: 値の最後に改行やスペースがないことを確認

### 2. Supabaseデータベーステーブル作成

Supabaseダッシュボード → SQL Editor で実行：

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_session_date DATE,
  focus_time_today INTEGER DEFAULT 0,
  total_focus_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  focus_duration INTEGER DEFAULT 25,
  short_break_duration INTEGER DEFAULT 5,
  long_break_duration INTEGER DEFAULT 15,
  sessions_until_long_break INTEGER DEFAULT 4,
  sound_enabled BOOLEAN DEFAULT true,
  notification_enabled BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  evolution_stage INTEGER DEFAULT 1,
  base_stats JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User characters
CREATE TABLE IF NOT EXISTS user_characters (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  experience INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (user_id, character_id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_characters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own profile" ON users 
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own settings" ON user_settings 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view characters" ON characters FOR SELECT USING (true);

CREATE POLICY "Users can manage own characters" ON user_characters 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Insert initial characters
INSERT INTO characters (id, name, description, type, evolution_stage, base_stats) 
VALUES 
  ('balanced_1', 'ポモ', 'バランス型の基本キャラクター', 'balanced', 1, '{"focus": 1, "energy": 1, "persistence": 1}'),
  ('focused_1', 'フォカっこ', '集中力特化型のキャラクター', 'focused', 1, '{"focus": 2, "energy": 0.5, "persistence": 0.5}')
ON CONFLICT (id) DO NOTHING;
```

### 3. Supabase認証設定

1. Supabaseダッシュボード → Authentication → Settings
2. **Site URL**: `https://pomomate-70nm74py6-ivygains-projects.vercel.app`
3. **Redirect URLs**: `https://pomomate-70nm74py6-ivygains-projects.vercel.app/**`
4. **Email Settings** → **Enable confirmations**: `OFF` (テスト用)

### 4. 再デプロイ

```bash
# 修正をコミット
git add .
git commit -m "Fix demo email and environment variables"
git push

# Vercelで自動デプロイ（約2-3分）
```

## 🎯 修正されたデモアカウント

- **メール**: `demo@pomomate.app`
- **パスワード**: `DemoPassword123!`

## ✅ テスト手順

1. アプリにアクセス
2. 「デモアカウントでログイン」クリック
3. 自動でアカウントが作成・ログインされる
4. 新規登録画面も正常に動作する

完了後、コンソールに "Live Mode" が表示され、環境変数の改行文字エラーが解消されます。