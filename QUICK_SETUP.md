# 🚀 PomoMate 緊急修復ガイド

## 問題の状況
- CSS "Illegal invocation" エラーで新規登録画面がクラッシュ
- Supabaseデータベーステーブルが未作成

## 🔧 修復手順

### 1. 最新の修正をデプロイ
```bash
# 変更をコミット＆プッシュ
git add .
git commit -m "Fix CSS illegal invocation errors with universal patch"
git push

# Vercelで自動デプロイされるまで待機（約2-3分）
```

### 2. Supabaseデータベーステーブルを作成

**Supabaseダッシュボードで以下を実行：**

1. [Supabase Dashboard](https://app.supabase.com) → プロジェクト選択
2. 左メニュー「SQL Editor」をクリック
3. 以下のSQLを貼り付けて実行：

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
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

-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('focus', 'short_break', 'long_break')),
  duration INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User settings
CREATE TABLE user_settings (
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
CREATE TABLE characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  evolution_stage INTEGER DEFAULT 1,
  base_stats JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User characters
CREATE TABLE user_characters (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  experience INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (user_id, character_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_characters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view characters" ON characters FOR SELECT USING (true);

CREATE POLICY "Users can view own characters" ON user_characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own characters" ON user_characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can unlock characters" ON user_characters FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert initial characters
INSERT INTO characters (id, name, description, type, evolution_stage, base_stats) VALUES
('balanced_1', 'ポモ', 'バランス型の基本キャラクター', 'balanced', 1, '{"focus": 1, "energy": 1, "persistence": 1}'),
('focused_1', 'フォカっこ', '集中力特化型のキャラクター', 'focused', 1, '{"focus": 2, "energy": 0.5, "persistence": 0.5}'),
('energetic_1', 'エナジン', 'エネルギー特化型のキャラクター', 'energetic', 1, '{"focus": 0.5, "energy": 2, "persistence": 0.5}'),
('persistent_1', 'ツヅケル', '継続力特化型のキャラクター', 'persistent', 1, '{"focus": 0.5, "energy": 0.5, "persistence": 2}');
```

### 3. Supabase認証設定

1. Supabaseダッシュボード → Authentication → Settings
2. **Site URL**: `https://pomomate-70nm74py6-ivygains-projects.vercel.app`
3. **Redirect URLs**: `https://pomomate-70nm74py6-ivygains-projects.vercel.app/**`
4. **Enable email confirmations**: OFF (テスト用)

### 4. テスト

1. アプリにアクセス: https://pomomate-70nm74py6-ivygains-projects.vercel.app
2. 「新規登録」ボタンをクリック
3. 新規登録画面が正常に表示されることを確認
4. デモアカウントでログインを試行

## 🔍 修正内容

### CSS Illegal Invocation 修正
- `universalFix.js` - 包括的なCSS修正パッチ
- CSSStyleDeclarationメソッドの安全なラッピング
- エラーバウンダリーのクラッシュ防止
- numeric propertyアクセスの完全ブロック

### インポート順序の最適化
- CSS修正を最初に読み込み
- React コンポーネントより先にパッチを適用

## ✅ 期待される結果

- ✅ 新規登録画面が正常に表示される
- ✅ CSS illegal invocation エラーが発生しない
- ✅ デモアカウントでログインできる
- ✅ データベースの「users table does not exist」エラーが解消される

問題が解決しない場合は、ブラウザの開発者コンソールでエラーメッセージを確認してください。