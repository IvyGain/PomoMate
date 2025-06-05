const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createDemoUser() {
  console.log('🎯 デモユーザー作成スクリプト');
  console.log('==============================\n');

  try {
    // Supabase接続情報を取得
    const supabaseUrl = await question('Supabase URL: ');
    const supabaseServiceKey = await question('Supabase Service Role Key (管理者用): ');
    
    console.log('\n⚠️  Service Role Keyは管理者権限を持つため、慎重に扱ってください。\n');

    // Supabaseクライアントを作成（Service Role Keyを使用）
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('📝 デモユーザーを作成中...\n');

    // デモユーザーを作成
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'demo@example.com',
      password: 'demo123456',
      email_confirm: true,
      user_metadata: {
        username: 'DemoUser',
        display_name: 'デモユーザー'
      }
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('ℹ️  デモユーザーは既に存在します。');
        
        // 既存ユーザーの情報を取得
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
          filter: 'email.eq.demo@example.com'
        });
        
        if (!listError && users.length > 0) {
          console.log('✅ デモユーザー情報:');
          console.log(`   - ID: ${users[0].id}`);
          console.log(`   - Email: ${users[0].email}`);
          console.log(`   - 作成日: ${users[0].created_at}`);
        }
      } else {
        throw authError;
      }
    } else {
      console.log('✅ デモユーザーが作成されました！');
      console.log(`   - ID: ${authData.user.id}`);
      console.log(`   - Email: ${authData.user.email}`);

      // usersテーブルにプロフィールを作成
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: 'demo@example.com',
          username: 'DemoUser',
          display_name: 'デモユーザー',
          level: 1,
          experience: 0,
          coins: 100,
          streak_days: 0,
          focus_time_today: 0,
          total_focus_time: 0
        });

      if (profileError && profileError.code !== '23505') {
        console.log('⚠️  プロフィール作成エラー:', profileError.message);
      } else {
        console.log('✅ ユーザープロフィールが作成されました！');
      }

      // デフォルト設定を作成
      const { error: settingsError } = await supabase
        .from('user_settings')
        .insert({
          user_id: authData.user.id,
          work_duration: 25,
          break_duration: 5,
          long_break_duration: 15,
          sessions_before_long_break: 4
        });

      if (settingsError && settingsError.code !== '23505') {
        console.log('⚠️  設定作成エラー:', settingsError.message);
      }
    }

    console.log('\n📌 デモアカウントのログイン情報:');
    console.log('   Email: demo@example.com');
    console.log('   Password: demo123456');
    console.log('\n✅ セットアップ完了！');

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    console.log('\n💡 代替方法:');
    console.log('1. Supabaseダッシュボード → Authentication → Users');
    console.log('2. 「Invite user」をクリック');
    console.log('3. Email: demo@example.com, Password: demo123456 で作成');
  } finally {
    rl.close();
  }
}

// スクリプトを実行
createDemoUser();