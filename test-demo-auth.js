#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xjxgapahcookarqiwjww.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqeGdhcGFoY29va2FycWl3and3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Mzc3MDMsImV4cCI6MjA2NDIxMzcwM30.S2C4PwG_RTv91Fm0VVN3B3lj0A909XddBaqPjZWAKXQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDemoAuth() {
  console.log('🔐 デモユーザー認証テスト');
  console.log('=======================\n');

  const demoEmail = 'romancemorio+test@gmail.com';
  const demoPassword = 'Po8silba8';

  try {
    console.log('📧 メールアドレス:', demoEmail);
    console.log('🔑 パスワード:', '*'.repeat(demoPassword.length));
    console.log('\n🚀 ログイン試行中...');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (error) {
      console.error('\n❌ ログインエラー:', error);
      console.log('\n🔍 エラー詳細:');
      console.log('   メッセージ:', error.message);
      console.log('   ステータス:', error.status);
      console.log('   コード:', error.code);
      
      console.log('\n💡 考えられる原因:');
      console.log('   1. メールアドレスが登録されていない');
      console.log('   2. パスワードが間違っている'); 
      console.log('   3. アカウントのメール確認が済んでいない');
      console.log('   4. アカウントが無効化されている');
      
      return;
    }

    console.log('\n✅ ログイン成功！');
    console.log('\n👤 ユーザー情報:');
    console.log('   ID:', data.user.id);
    console.log('   メール:', data.user.email);
    console.log('   確認済み:', data.user.email_confirmed_at ? 'はい' : 'いいえ');
    console.log('   作成日:', new Date(data.user.created_at).toLocaleString('ja-JP'));
    console.log('   最終ログイン:', data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at).toLocaleString('ja-JP') : 'なし');

    console.log('\n🎫 セッション情報:');
    console.log('   アクセストークン:', data.session.access_token ? '✅ 取得済み' : '❌ なし');
    console.log('   リフレッシュトークン:', data.session.refresh_token ? '✅ 取得済み' : '❌ なし');
    console.log('   有効期限:', new Date(data.session.expires_at * 1000).toLocaleString('ja-JP'));

    // ログアウト
    await supabase.auth.signOut();
    console.log('\n🚪 ログアウト完了');

  } catch (error) {
    console.error('\n💥 予期しないエラー:', error);
  }
}

// 実行
testDemoAuth();