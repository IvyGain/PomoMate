#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNewUserAuth() {
  console.log('🆕 新規ユーザー認証テスト');
  console.log('========================\n');

  // メール認証が完了したユーザーでテスト
  // ここに実際に登録したメールアドレスとパスワードを入力してください
  const userEmail = 'your-email@example.com'; // ← ここを実際のメールに変更
  const userPassword = 'your-password'; // ← ここを実際のパスワードに変更

  console.log('💡 テスト用メールアドレスとパスワードを入力してください:');
  console.log('   1. 実際に登録したメールアドレス');
  console.log('   2. 登録時に使用したパスワード');
  console.log('   3. メール確認が完了しているアカウント\n');

  // まず、登録済みユーザーを確認
  console.log('📊 Supabaseの認証ユーザー一覧を確認中...\n');

  try {
    // 登録されているユーザーを確認するための情報を表示
    console.log('🔍 以下のSQLをSupabase SQL Editorで実行して、ユーザーを確認してください:');
    console.log('');
    console.log('SELECT ');
    console.log('  email,');
    console.log('  email_confirmed_at IS NOT NULL as is_confirmed,');
    console.log('  created_at,');
    console.log('  last_sign_in_at');
    console.log('FROM auth.users ');
    console.log('ORDER BY created_at DESC');
    console.log('LIMIT 10;');
    console.log('');
    
    console.log('📝 確認できたメールアドレスとパスワードでテストする場合:');
    console.log('1. このファイル (test-new-user-auth.js) の7行目と8行目を編集');
    console.log('2. 実際のメールアドレスとパスワードに変更');
    console.log('3. 再度このスクリプトを実行\n');

    // テスト実行（デフォルトでは仮のデータなのでスキップ）
    if (userEmail === 'your-email@example.com') {
      console.log('⚠️  実際のメールアドレスとパスワードを設定してからテストしてください。');
      return;
    }

    console.log(`🚀 ログイン試行中: ${userEmail}`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });

    if (error) {
      console.error('\n❌ ログインエラー:', error.message);
      console.log('\n🔍 エラー詳細:');
      console.log('   コード:', error.code);
      console.log('   ステータス:', error.status);
      
      if (error.code === 'invalid_credentials') {
        console.log('\n💡 解決方法:');
        console.log('   1. メールアドレスが正しいか確認');
        console.log('   2. パスワードが正しいか確認');
        console.log('   3. メール確認が完了しているか確認');
        console.log('   4. 上記のSQLでユーザー状態を確認');
      }
      return;
    }

    console.log('\n✅ ログイン成功！');
    console.log('\n👤 ユーザー情報:');
    console.log('   ID:', data.user.id);
    console.log('   メール:', data.user.email);
    console.log('   確認済み:', data.user.email_confirmed_at ? 'はい' : 'いいえ');
    console.log('   作成日:', new Date(data.user.created_at).toLocaleString('ja-JP'));

    // ログアウト
    await supabase.auth.signOut();
    console.log('\n🚪 ログアウト完了');

  } catch (error) {
    console.error('\n💥 予期しないエラー:', error);
  }
}

// 実行
testNewUserAuth();