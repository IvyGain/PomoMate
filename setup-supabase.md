# Supabase セットアップガイド

現在、アプリはデモモードで動作しています。実際のユーザー登録とデータ保存を有効にするには、Supabaseの設定が必要です。

## 🚨 現在の問題

- **デモモード**: すべてのログインが同じデモユーザーになる
- **データ保存なし**: ログアウトするとすべてのデータが失われる
- **ユーザー登録無効**: 新規登録してもデモユーザーとして扱われる

## 🛠️ セットアップ手順

### 1. Supabaseプロジェクトを作成

1. [Supabase](https://app.supabase.com) にアクセス
2. 無料アカウントを作成（GitHubでログイン可能）
3. 「New Project」をクリック
4. プロジェクト名: `pomodoro-play`
5. データベースパスワードを設定（安全な場所に保存）
6. リージョン: `Northeast Asia (Tokyo)`を選択

### 2. データベーステーブルを作成

Supabaseダッシュボードで「SQL Editor」を開き、以下のSQLを実行：

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

-- Achievements
CREATE TABLE achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User achievements
CREATE TABLE user_achievements (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (user_id, achievement_id)
);

-- Characters
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

-- Friends
CREATE TABLE friends (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (user_id, friend_id)
);

-- Team sessions
CREATE TABLE team_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  session_type TEXT NOT NULL,
  duration INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Team session participants
CREATE TABLE team_session_participants (
  team_session_id UUID NOT NULL REFERENCES team_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  left_at TIMESTAMP WITH TIME ZONE,
  is_ready BOOLEAN DEFAULT false,
  PRIMARY KEY (team_session_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_session_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own data and update their profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create initial characters
INSERT INTO characters (id, name, description, type, evolution_stage, base_stats) VALUES
('balanced_1', 'ポモ', 'バランス型の基本キャラクター', 'balanced', 1, '{"focus": 1, "energy": 1, "persistence": 1}'),
('focused_1', 'フォカっこ', '集中力特化型のキャラクター', 'focused', 1, '{"focus": 2, "energy": 0.5, "persistence": 0.5}'),
('energetic_1', 'エナジン', 'エネルギー特化型のキャラクター', 'energetic', 1, '{"focus": 0.5, "energy": 2, "persistence": 0.5}'),
('persistent_1', 'ツヅケル', '継続力特化型のキャラクター', 'persistent', 1, '{"focus": 0.5, "energy": 0.5, "persistence": 2}');

-- Create initial achievements
INSERT INTO achievements (name, description, category, requirement_type, requirement_value, xp_reward, icon) VALUES
('初めの一歩', '初めてのポモドーロセッションを完了', 'beginner', 'sessions', 1, 50, '🎯'),
('集中の達人', '10回のフォーカスセッションを完了', 'focus', 'sessions', 10, 100, '🧘'),
('週末戦士', '土日に5セッション完了', 'special', 'weekend_sessions', 5, 150, '⚔️'),
('早起きは三文の徳', '朝6時前にセッションを開始', 'special', 'early_bird', 1, 100, '🌅'),
('夜型人間', '夜10時以降にセッションを完了', 'special', 'night_owl', 1, 100, '🦉');
```

### 3. 環境変数を設定

1. `.env.local.example` を `.env.local` にコピー
2. Supabaseダッシュボードから以下の情報を取得：
   - Settings → API → Project URL
   - Settings → API → Project API keys → anon public

```bash
cp .env.local.example .env.local
```

`.env.local` を編集：
```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. アプリを再起動

```bash
# サーバーを停止 (Ctrl+C)
# 再起動
./start-web.sh
```

## ✅ 確認方法

1. ブラウザのコンソールで確認：
   - `🚀 Live Mode` と表示されればOK
   - `🎮 Demo Mode` の場合は環境変数を確認

2. 新規登録してみる：
   - 実際にアカウントが作成される
   - ログアウト後も同じアカウントでログイン可能

## 🆘 トラブルシューティング

### エラー: "User already registered"
- そのメールアドレスは既に登録済み
- 別のメールアドレスを使用

### エラー: "Invalid API key"
- `.env.local` の `EXPO_PUBLIC_SUPABASE_ANON_KEY` を確認
- Supabaseダッシュボードから正しいキーをコピー

### データが保存されない
- RLS（Row Level Security）ポリシーを確認
- Supabaseダッシュボードで直接データを確認

## 📝 メモ

- Supabaseの無料プランで十分動作します
- 本番環境では追加のセキュリティ設定を推奨
- バックアップは定期的に実行してください