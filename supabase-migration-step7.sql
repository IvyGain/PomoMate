-- Step 7: Seed initial data
-- Run this in Supabase SQL Editor after Step 6

-- Insert default characters
INSERT INTO characters (id, name, description, type, base_stats, rarity) VALUES
('balanced_1', 'バランス猫', '全能力がバランスよく成長', 'balanced', '{"focus": 50, "speed": 50, "stamina": 50}', 'common'),
('focus_1', '集中犬', '集中力特化で成長', 'focus', '{"focus": 70, "speed": 40, "stamina": 40}', 'common'),
('speed_1', 'スピードウサギ', '作業速度特化で成長', 'speed', '{"focus": 40, "speed": 70, "stamina": 40}', 'common')
ON CONFLICT (id) DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (id, name, description, requirement, coins_reward, experience_reward) VALUES
('first_session', '初めての一歩', '初めてのポモドーロセッションを完了', '{"type": "session_count", "value": 1}', 50, 10),
('streak_3', '3日連続！', '3日連続でセッションを完了', '{"type": "streak_days", "value": 3}', 100, 20),
('focus_1hour', '1時間の集中', '合計1時間の集中時間を達成', '{"type": "total_focus_time", "value": 60}', 150, 30)
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;