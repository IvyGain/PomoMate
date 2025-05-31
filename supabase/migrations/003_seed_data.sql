-- Seed characters data
INSERT INTO characters (id, name, description, type, base_stats, unlock_requirement, evolution_requirement, rarity) VALUES
-- Balanced Type
('balanced_1', 'ポモ', '時間の精霊の卵から生まれたばかり', 'balanced', 
 '{"health": 100, "attack": 20, "defense": 20, "speed": 20, "special": 20}'::jsonb,
 NULL,
 '{"level": 15, "sessions": 50}'::jsonb,
 'common'),

('balanced_2', 'ポモチャン', '成長して可愛らしい姿になった', 'balanced',
 '{"health": 150, "attack": 35, "defense": 35, "speed": 35, "special": 35}'::jsonb,
 '{"character": "balanced_1", "evolved": true}'::jsonb,
 '{"level": 30, "sessions": 150}'::jsonb,
 'uncommon'),

('balanced_3', 'ポモマスター', '時間管理の達人に成長', 'balanced',
 '{"health": 250, "attack": 60, "defense": 60, "speed": 60, "special": 60}'::jsonb,
 '{"character": "balanced_2", "evolved": true}'::jsonb,
 NULL,
 'rare'),

-- Focus Type
('focus_1', 'フォーカ', '集中の炎を宿す小さな存在', 'focus',
 '{"health": 80, "attack": 30, "defense": 15, "speed": 15, "special": 25}'::jsonb,
 '{"level": 5}'::jsonb,
 '{"level": 20, "sessions": 70}'::jsonb,
 'common'),

('focus_2', 'フォーカリス', '燃える集中力の化身', 'focus',
 '{"health": 130, "attack": 50, "defense": 25, "speed": 25, "special": 40}'::jsonb,
 '{"character": "focus_1", "evolved": true}'::jsonb,
 '{"level": 35, "sessions": 200}'::jsonb,
 'uncommon'),

('focus_3', 'インフェルノフォーカス', '灼熱の集中力で全てを成し遂げる', 'focus',
 '{"health": 200, "attack": 80, "defense": 40, "speed": 40, "special": 65}'::jsonb,
 '{"character": "focus_2", "evolved": true}'::jsonb,
 NULL,
 'rare'),

-- Speed Type
('speed_1', 'スピー', '素早い動きが特徴の小さな相棒', 'speed',
 '{"health": 70, "attack": 25, "defense": 10, "speed": 35, "special": 20}'::jsonb,
 '{"sessions": 30}'::jsonb,
 '{"level": 18, "sessions": 60}'::jsonb,
 'common'),

('speed_2', 'ライトニー', '光速で動く時間の妖精', 'speed',
 '{"health": 120, "attack": 40, "defense": 20, "speed": 55, "special": 35}'::jsonb,
 '{"character": "speed_1", "evolved": true}'::jsonb,
 '{"level": 32, "sessions": 180}'::jsonb,
 'uncommon'),

('speed_3', 'ソニックテンポ', '音速を超える時間管理の達人', 'speed',
 '{"health": 180, "attack": 65, "defense": 35, "speed": 85, "special": 55}'::jsonb,
 '{"character": "speed_2", "evolved": true}'::jsonb,
 NULL,
 'rare'),

-- Defense Type
('defense_1', 'シールド', '守りに特化した頑丈な相棒', 'defense',
 '{"health": 120, "attack": 15, "defense": 35, "speed": 10, "special": 15}'::jsonb,
 '{"coins": 500}'::jsonb,
 '{"level": 25, "sessions": 100}'::jsonb,
 'common'),

('defense_2', 'フォートレス', '鉄壁の守りを誇る', 'defense',
 '{"health": 180, "attack": 25, "defense": 60, "speed": 20, "special": 25}'::jsonb,
 '{"character": "defense_1", "evolved": true}'::jsonb,
 '{"level": 40, "sessions": 250}'::jsonb,
 'uncommon'),

('defense_3', 'アイアンウォール', '絶対防御の境地に達した', 'defense',
 '{"health": 280, "attack": 40, "defense": 90, "speed": 30, "special": 40}'::jsonb,
 '{"character": "defense_2", "evolved": true}'::jsonb,
 NULL,
 'rare'),

-- Special Type
('special_1', 'ミスティ', '神秘的な力を秘めた存在', 'special',
 '{"health": 90, "attack": 20, "defense": 20, "speed": 20, "special": 35}'::jsonb,
 '{"achievements": 5}'::jsonb,
 '{"level": 22, "sessions": 80}'::jsonb,
 'uncommon'),

('special_2', 'ミラクル', '奇跡を起こす特別な力の持ち主', 'special',
 '{"health": 140, "attack": 35, "defense": 35, "speed": 35, "special": 55}'::jsonb,
 '{"character": "special_1", "evolved": true}'::jsonb,
 '{"level": 38, "sessions": 220}'::jsonb,
 'rare'),

('special_3', 'レジェンダリー', '伝説級の力を解放した究極体', 'special',
 '{"health": 220, "attack": 55, "defense": 55, "speed": 55, "special": 85}'::jsonb,
 '{"character": "special_2", "evolved": true}'::jsonb,
 NULL,
 'legendary');

-- Seed achievements data
INSERT INTO achievements (id, name, description, icon, requirement, coins_reward, experience_reward) VALUES
('first_session', '初めてのセッション', '最初のポモドーロセッションを完了', 'clock',
 '{"type": "session_count", "value": 1}'::jsonb, 50, 10),

('focus_10', '集中の達人', '10回のポモドーロセッションを完了', 'fire',
 '{"type": "session_count", "value": 10}'::jsonb, 100, 25),

('focus_50', '集中の鬼', '50回のポモドーロセッションを完了', 'flame',
 '{"type": "session_count", "value": 50}'::jsonb, 300, 75),

('focus_100', '集中の神', '100回のポモドーロセッションを完了', 'star',
 '{"type": "session_count", "value": 100}'::jsonb, 500, 150),

('streak_7', '一週間の継続', '7日連続でセッションを完了', 'calendar',
 '{"type": "streak_days", "value": 7}'::jsonb, 200, 50),

('streak_30', '一ヶ月の継続', '30日連続でセッションを完了', 'trophy',
 '{"type": "streak_days", "value": 30}'::jsonb, 1000, 200),

('early_bird', '朝型人間', '朝6時前にセッションを完了', 'sun',
 '{"type": "time_based", "before": "06:00"}'::jsonb, 150, 30),

('night_owl', '夜型人間', '夜10時以降にセッションを完了', 'moon',
 '{"type": "time_based", "after": "22:00"}'::jsonb, 150, 30),

('team_player', 'チームプレイヤー', '初めてのチームセッションに参加', 'users',
 '{"type": "team_sessions", "value": 1}'::jsonb, 100, 20),

('social_butterfly', 'ソーシャルバタフライ', '5人の友達を追加', 'heart',
 '{"type": "friends_count", "value": 5}'::jsonb, 200, 40);

-- Seed shop items data
INSERT INTO shop_items (id, name, description, type, price, data, is_available) VALUES
('theme_dark', 'ダークテーマ', 'アプリをダークモードに変更', 'theme', 500,
 '{"theme": "dark"}'::jsonb, true),

('theme_nature', '自然テーマ', '自然をモチーフにした癒しのテーマ', 'theme', 800,
 '{"theme": "nature"}'::jsonb, true),

('theme_cyberpunk', 'サイバーパンクテーマ', '近未来的なネオンテーマ', 'theme', 1200,
 '{"theme": "cyberpunk"}'::jsonb, true),

('sound_pack_lofi', 'Lo-Fi サウンドパック', 'リラックスできるLo-Fi音楽', 'sound', 600,
 '{"sound_pack": "lofi"}'::jsonb, true),

('sound_pack_nature', '自然音サウンドパック', '森や海の自然音', 'sound', 600,
 '{"sound_pack": "nature"}'::jsonb, true),

('character_boost_xp', '経験値ブースト', 'キャラクターの経験値獲得量が2倍（24時間）', 'boost', 300,
 '{"boost_type": "xp", "multiplier": 2, "duration": 86400}'::jsonb, true),

('character_boost_coins', 'コインブースト', 'コイン獲得量が2倍（24時間）', 'boost', 300,
 '{"boost_type": "coins", "multiplier": 2, "duration": 86400}'::jsonb, true),

('avatar_frame_gold', 'ゴールドフレーム', 'プロフィール画像に豪華な金枠', 'cosmetic', 1000,
 '{"frame": "gold"}'::jsonb, true),

('avatar_frame_rainbow', 'レインボーフレーム', 'プロフィール画像に虹色の枠', 'cosmetic', 1500,
 '{"frame": "rainbow"}'::jsonb, true);