#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xjxgapahcookarqiwjww.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkSupabaseUsers() {
  console.log('👥 Supabase認証ユーザー確認');
  console.log('============================\n');

  try {
    // Service Roleを使って直接auth.usersテーブルを確認
    console.log('🔍 認証ユーザー一覧を取得中...\n');

    const { data, error } = await supabase
      .from('auth.users')
      .select('email, email_confirmed_at, created_at, last_sign_in_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ ユーザー情報取得エラー:', error.message);
      console.log('\n💡 代替手段: Supabase SQL Editorで以下を実行してください:');
      console.log('');
      console.log('SELECT ');
      console.log('  email,');
      console.log('  email_confirmed_at IS NOT NULL as is_confirmed,');
      console.log('  created_at,');
      console.log('  last_sign_in_at');
      console.log('FROM auth.users ');
      console.log('ORDER BY created_at DESC');
      console.log('LIMIT 10;');
      return;
    }

    if (!data || data.length === 0) {
      console.log('📭 登録済みユーザーが見つかりません');
      console.log('\n💡 考えられる原因:');
      console.log('   1. まだユーザー登録が行われていない');
      console.log('   2. 別のSupabaseプロジェクトに登録されている');
      console.log('   3. 権限の問題でデータを取得できない');
      return;
    }

    console.log(`📊 登録済みユーザー数: ${data.length}\n`);
    
    data.forEach((user, index) => {
      const isConfirmed = user.email_confirmed_at !== null;
      const hasLoggedIn = user.last_sign_in_at !== null;
      
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   確認済み: ${isConfirmed ? '✅ はい' : '❌ いいえ'}`);
      console.log(`   登録日: ${new Date(user.created_at).toLocaleString('ja-JP')}`);
      console.log(`   最終ログイン: ${hasLoggedIn ? new Date(user.last_sign_in_at).toLocaleString('ja-JP') : '未ログイン'}\n`);
    });

    // デモユーザーの状態を特別に確認
    const demoUser = data.find(user => user.email.includes('romancemorio') || user.email.includes('test'));
    if (demoUser) {
      console.log('🎯 デモユーザー詳細:');
      console.log(`   メール: ${demoUser.email}`);
      console.log(`   確認済み: ${demoUser.email_confirmed_at ? '✅ はい' : '❌ いいえ'}`);
      
      if (!demoUser.email_confirmed_at) {
        console.log('\n🔧 デモユーザーのメール確認を手動で有効化:');
        console.log('   Supabase SQL Editorで以下を実行:');
        console.log('');
        console.log('   UPDATE auth.users ');
        console.log('   SET email_confirmed_at = NOW()');
        console.log(`   WHERE email = '${demoUser.email}';`);
      }
    }

    console.log('\n🚀 次のステップ:');
    console.log('1. メール確認が未完了のユーザーは手動で確認済みに設定');
    console.log('2. 確認済みユーザーでログインテストを実行');
    console.log('3. ログインが成功しない場合はパスワードを確認');

  } catch (error) {
    console.error('💥 予期しないエラー:', error);
  }
}

// 実行
checkSupabaseUsers();