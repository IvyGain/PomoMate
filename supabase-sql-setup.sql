-- PomoMate Database Setup
-- Run this in Supabase SQL Editor

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

-- Achievements table
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

-- Friends table
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
-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements policies (public read, admin write)
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Characters policies (public read)
CREATE POLICY "Anyone can view characters" ON characters FOR SELECT USING (true);

-- User characters policies
CREATE POLICY "Users can view own characters" ON user_characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own characters" ON user_characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can unlock characters" ON user_characters FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Friends policies
CREATE POLICY "Users can view own friends" ON friends FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can send friend requests" ON friends FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update friend status" ON friends FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Team sessions policies
CREATE POLICY "Users can view team sessions" ON team_sessions FOR SELECT USING (true);
CREATE POLICY "Users can create team sessions" ON team_sessions FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Session creator can update" ON team_sessions FOR UPDATE 
  USING (auth.uid() = creator_id);

-- Team participants policies
CREATE POLICY "Anyone can view participants" ON team_session_participants FOR SELECT USING (true);
CREATE POLICY "Users can join sessions" ON team_session_participants FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON team_session_participants FOR UPDATE 
  USING (auth.uid() = user_id);

-- Insert initial characters
INSERT INTO characters (id, name, description, type, evolution_stage, base_stats) VALUES
('balanced_1', 'ポモ', 'バランス型の基本キャラクター', 'balanced', 1, '{"focus": 1, "energy": 1, "persistence": 1}'),
('focused_1', 'フォカっこ', '集中力特化型のキャラクター', 'focused', 1, '{"focus": 2, "energy": 0.5, "persistence": 0.5}'),
('energetic_1', 'エナジン', 'エネルギー特化型のキャラクター', 'energetic', 1, '{"focus": 0.5, "energy": 2, "persistence": 0.5}'),
('persistent_1', 'ツヅケル', '継続力特化型のキャラクター', 'persistent', 1, '{"focus": 0.5, "energy": 0.5, "persistence": 2}');

-- Insert initial achievements
INSERT INTO achievements (name, description, category, requirement_type, requirement_value, xp_reward, icon) VALUES
('初めの一歩', '初めてのポモドーロセッションを完了', 'beginner', 'sessions', 1, 50, '🎯'),
('集中の達人', '10回のフォーカスセッションを完了', 'focus', 'sessions', 10, 100, '🧘'),
('週末戦士', '土日に5セッション完了', 'special', 'weekend_sessions', 5, 150, '⚔️'),
('早起きは三文の徳', '朝6時前にセッションを開始', 'special', 'early_bird', 1, 100, '🌅'),
('夜型人間', '夜10時以降にセッションを完了', 'special', 'night_owl', 1, 100, '🦉'),
('連続記録', '7日間連続でセッションを完了', 'streak', 'streak_days', 7, 200, '🔥'),
('マラソンランナー', '合計100セッションを完了', 'milestone', 'total_sessions', 100, 500, '🏃'),
('時間の管理者', '合計50時間のフォーカスタイムを達成', 'milestone', 'total_hours', 50, 300, '⏰');

-- Create indexes for better performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_completed_at ON sessions(completed_at);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
CREATE INDEX idx_team_participants_session ON team_session_participants(team_session_id);
CREATE INDEX idx_team_participants_user ON team_session_participants(user_id);