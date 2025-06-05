const { createClient } = require('@supabase/supabase-js');

// 環境変数から設定を読み込み
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xjxgapahcookarqiwjww.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqeGdhcGFoY29va2FycWl3and3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Mzc3MDMsImV4cCI6MjA2NDIxMzcwM30.S2C4PwG_RTv91Fm0VVN3B3lj0A909XddBaqPjZWAKXQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createDemoUser() {
  console.log('🚀 デモユーザープロファイル作成スクリプト');
  console.log('=======================================\n');

  try {
    // 1. 既存のデモユーザーでログイン
    console.log('1️⃣ 既存のデモユーザーでログイン中...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'romancemorio+test@gmail.com',
      password: 'Po8silba8'
    });

    if (loginError) {
      console.error('❌ デモユーザーのログインに失敗:', loginError.message);
      console.log('💡 Supabaseダッシュボードでユーザーが存在し、パスワードが正しいことを確認してください');
      return;
    }

    console.log('✅ デモユーザーでログイン成功');
    const user = loginData.user;

    // 2. プロファイル情報を確認/作成
    console.log('\n2️⃣ デモユーザープロファイルを確認中...');
    
    if (user) {
      // プロファイルが存在するか確認
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // プロファイルが存在しない場合は作成
        console.log('   プロファイルを作成中...');
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: 'romancemorio+test@gmail.com',
            username: 'demo_user',
            display_name: 'デモユーザー'
          });

        if (createError) {
          console.error('❌ プロファイル作成エラー:', createError.message);
        } else {
          console.log('✅ プロファイル作成完了');
        }
      } else {
        console.log('✅ プロファイルは既に存在します:', profile.display_name);
      }

      // デフォルト設定を作成
      const { error: settingsError } = await supabase
        .from('user_settings')
        .insert({ user_id: user.id })
        .select();

      if (!settingsError) {
        console.log('✅ デフォルト設定を作成しました');
      }

      // デフォルトキャラクターを割り当て
      const { error: charError } = await supabase
        .from('user_characters')
        .insert({
          user_id: user.id,
          character_id: 'balanced_1',
          is_active: true
        })
        .select();

      if (!charError) {
        console.log('✅ デフォルトキャラクターを割り当てました');
      }
    }

    console.log('\n✅ デモユーザーのセットアップが完了しました！');
    console.log('\n📝 ログイン情報:');
    console.log('   メールアドレス: romancemorio+test@gmail.com');
    console.log('   パスワード: Po8silba8');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }

  // ログアウト
  await supabase.auth.signOut();
}

// 実行
createDemoUser();