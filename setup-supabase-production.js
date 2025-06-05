#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupSupabase() {
  console.log('🚀 Supabase本番環境セットアップ');
  console.log('================================\n');

  // 必要な情報を収集
  const supabaseUrl = await question('SupabaseプロジェクトURL (https://xxx.supabase.co): ');
  const supabaseServiceKey = await question('Supabase Service Role Key (secret): ');
  
  console.log('\n⚠️  注意: Service Role Keyは管理者権限を持つため、このスクリプト実行後は安全に保管してください。\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('📝 データベーステーブルとRLSポリシーを設定中...\n');

    // 1. デモユーザーの作成
    console.log('1️⃣ デモユーザーを作成中...');
    const demoUserSQL = `
      -- デモユーザーの作成（既存の場合はスキップ）
      INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        aud,
        role
      )
      SELECT 
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'demo@example.com',
        crypt('demo123456', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        'authenticated',
        'authenticated'
      WHERE NOT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'demo@example.com'
      );
    `;

    const { error: demoError } = await supabase.rpc('exec_sql', { sql: demoUserSQL });
    if (demoError) {
      console.log('⚠️  デモユーザー作成をスキップ（既に存在する可能性があります）');
    } else {
      console.log('✅ デモユーザー作成完了');
    }

    // 2. RLSポリシーの設定
    console.log('\n2️⃣ Row Level Security ポリシーを設定中...');
    
    const rlsPolicies = [
      // users table
      {
        table: 'users',
        policies: [
          {
            name: 'Users can view own profile',
            definition: 'CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);'
          },
          {
            name: 'Users can update own profile',
            definition: 'CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);'
          }
        ]
      },
      // sessions table
      {
        table: 'sessions',
        policies: [
          {
            name: 'Users can create own sessions',
            definition: 'CREATE POLICY "Users can create own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);'
          },
          {
            name: 'Users can view own sessions',
            definition: 'CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);'
          },
          {
            name: 'Users can update own sessions',
            definition: 'CREATE POLICY "Users can update own sessions" ON sessions FOR UPDATE USING (auth.uid() = user_id);'
          }
        ]
      },
      // user_settings table
      {
        table: 'user_settings',
        policies: [
          {
            name: 'Users can manage own settings',
            definition: 'CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);'
          }
        ]
      }
    ];

    for (const table of rlsPolicies) {
      console.log(`\n  📋 ${table.table} テーブルのRLSを有効化...`);
      
      // Enable RLS
      const { error: rlsError } = await supabase.rpc('exec_sql', { 
        sql: `ALTER TABLE ${table.table} ENABLE ROW LEVEL SECURITY;` 
      });
      
      if (!rlsError) {
        console.log(`  ✅ ${table.table} RLS有効化完了`);
      }

      // Create policies
      for (const policy of table.policies) {
        try {
          const { error: policyError } = await supabase.rpc('exec_sql', { 
            sql: policy.definition 
          });
          
          if (!policyError) {
            console.log(`  ✅ ポリシー作成: ${policy.name}`);
          }
        } catch (e) {
          console.log(`  ⚠️  ポリシー作成スキップ: ${policy.name} (既存の可能性)`);
        }
      }
    }

    // 3. ストレージバケットの設定
    console.log('\n3️⃣ ストレージバケットを設定中...');
    
    const buckets = [
      { name: 'avatars', public: true },
      { name: 'game-assets', public: true }
    ];

    for (const bucket of buckets) {
      const { error: bucketError } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
      });

      if (bucketError?.message?.includes('already exists')) {
        console.log(`  ⚠️  ${bucket.name} バケット: 既に存在`);
      } else if (!bucketError) {
        console.log(`  ✅ ${bucket.name} バケット作成完了`);
      }
    }

    // 4. 環境変数の出力
    console.log('\n4️⃣ 環境変数の設定値:');
    console.log('=====================================');
    console.log(`EXPO_PUBLIC_SUPABASE_URL=${supabaseUrl}`);
    
    // anon keyを取得（通常はプロジェクト設定から）
    console.log(`EXPO_PUBLIC_SUPABASE_ANON_KEY=[Supabaseダッシュボードから取得してください]`);
    console.log(`EXPO_PUBLIC_ENV=production`);
    console.log('=====================================\n');

    // 5. 重要な手動設定項目
    console.log('📌 以下の設定は手動で行ってください:\n');
    console.log('1. Supabaseダッシュボード → Authentication → URL Configuration');
    console.log('   - Site URL: https://pomomate-p0iya2bod-ivygains-projects.vercel.app');
    console.log('   - Redirect URLs に上記URLを追加\n');
    
    console.log('2. Supabaseダッシュボード → Authentication → Email Templates');
    console.log('   - 各テンプレートを日本語版に更新（supabase-email-templates-ja.mdを参照）\n');
    
    console.log('3. Vercelダッシュボード → Settings → Environment Variables');
    console.log('   - 上記の環境変数を設定\n');

    console.log('✅ 自動設定が完了しました！');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  } finally {
    rl.close();
  }
}

// SQL実行用の関数（存在しない場合は作成）
async function createExecSqlFunction(supabase) {
  const functionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;

  try {
    await supabase.rpc('query', { query: functionSQL });
  } catch (e) {
    // 関数作成に失敗した場合は、手動でのSQL実行が必要
    console.log('⚠️  SQL実行関数の作成に失敗しました。一部の設定は手動で行う必要があります。');
  }
}

// メイン実行
setupSupabase();