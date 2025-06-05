const { createClient } = require('@supabase/supabase-js');

async function checkSupabaseStatus() {
  console.log('🔍 Supabaseの接続状態を確認中...\n');

  // 環境変数から読み取り（または直接入力）
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

  if (supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.log('⚠️  環境変数が設定されていません。');
    console.log('以下のコマンドで設定してください:');
    console.log('export EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co');
    console.log('export EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. 基本的な接続テスト
    console.log('1️⃣ 基本接続テスト...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (healthError) {
      console.log('❌ データベース接続エラー:', healthError.message);
    } else {
      console.log('✅ データベース接続: 正常');
    }

    // 2. 認証サービスのテスト
    console.log('\n2️⃣ 認証サービステスト...');
    const { data: authCheck, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ 認証サービスエラー:', authError.message);
    } else {
      console.log('✅ 認証サービス: 正常');
    }

    // 3. デモユーザーの存在確認
    console.log('\n3️⃣ デモユーザー確認...');
    const { data: demoLogin, error: demoError } = await supabase.auth.signInWithPassword({
      email: 'demo@example.com',
      password: 'demo123456'
    });

    if (demoError) {
      if (demoError.message.includes('Invalid login credentials')) {
        console.log('❌ デモユーザーが存在しないか、パスワードが異なります');
        console.log('   → Supabaseダッシュボードから作成してください');
      } else {
        console.log('❌ デモユーザーログインエラー:', demoError.message);
      }
    } else {
      console.log('✅ デモユーザー: ログイン可能');
      // ログアウト
      await supabase.auth.signOut();
    }

    // 4. ストレージの確認
    console.log('\n4️⃣ ストレージ確認...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.log('❌ ストレージエラー:', storageError.message);
    } else {
      console.log('✅ ストレージ: 正常');
      console.log(`   バケット数: ${buckets.length}`);
    }

    console.log('\n📊 診断結果サマリー:');
    console.log('====================');
    console.log('Supabase URL:', supabaseUrl);
    console.log('プロジェクトID:', supabaseUrl.match(/https:\/\/(.+?)\.supabase/)?.[1] || 'Unknown');
    
  } catch (error) {
    console.error('\n❌ 予期しないエラー:', error.message);
  }

  console.log('\n💡 トラブルシューティング:');
  console.log('1. Supabaseダッシュボードでプロジェクトが稼働中か確認');
  console.log('2. Settings → API で正しいURLとキーを確認');
  console.log('3. 一時的な問題の場合は数分待って再試行');
}

// 実行
checkSupabaseStatus();