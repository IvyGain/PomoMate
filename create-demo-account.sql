-- Supabase SQL Editor で実行するSQL
-- デモアカウントの作成

-- 1. まず既存のデモユーザーを確認
SELECT id, email FROM auth.users WHERE email = 'demo@example.com';

-- 2. デモユーザーが存在しない場合は、以下を実行
-- 注意: Supabaseの管理画面から実行する必要があります

-- オプション1: Supabase Dashboardから手動作成
-- Authentication → Users → Invite → 
-- Email: demo@example.com
-- Password: demo123456

-- オプション2: SQL関数を使用（Supabase Edge Functionが必要）
-- 以下はSupabase管理画面のSQL Editorで実行

-- デモユーザー作成用の関数
CREATE OR REPLACE FUNCTION create_demo_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Check if demo user already exists
  SELECT id INTO user_id FROM auth.users WHERE email = 'demo@example.com';
  
  IF user_id IS NULL THEN
    -- Create demo user (Note: This requires using Supabase Admin API)
    -- For security reasons, use Supabase Dashboard instead
    RAISE NOTICE 'Please create demo user from Supabase Dashboard';
  ELSE
    RAISE NOTICE 'Demo user already exists with ID: %', user_id;
  END IF;
END;
$$;

-- 関数を実行
SELECT create_demo_user();