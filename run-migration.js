#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function runMigration() {
  console.log('🚀 Supabaseデータベースマイグレーション実行');
  console.log('==========================================\n');

  try {
    // SQLファイルを読み込み
    const sqlPath = path.join(__dirname, 'supabase-setup-all.sql');
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error('supabase-setup-all.sql ファイルが見つかりません');
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('📄 SQLファイルを読み込みました');

    // SQLをセクションに分割して実行
    const sections = sqlContent.split(';').filter(section => 
      section.trim() && !section.trim().startsWith('--'),
    );

    console.log(`📝 ${sections.length} のSQLコマンドを実行します...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < sections.length; i++) {
      const sql = sections[i].trim();
      if (!sql) continue;

      try {
        console.log(`⏳ [${i + 1}/${sections.length}] 実行中...`);
        
        // RPC経由でSQLを実行
        const { error } = await supabase.rpc('exec_sql', { sql: sql + ';' });
        
        if (error) {
          // 既存テーブルエラーなどは警告として扱う
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.message.includes('does not exist')) {
            console.log(`⚠️  [${i + 1}] 警告: ${error.message.substring(0, 50)}...`);
          } else {
            console.error(`❌ [${i + 1}] エラー: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log(`✅ [${i + 1}] 完了`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ [${i + 1}] 例外: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 マイグレーション結果:');
    console.log(`✅ 成功: ${successCount}`);
    console.log(`❌ エラー: ${errorCount}`);

    // テーブル作成の確認
    console.log('\n🔍 テーブル作成を確認中...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (tablesError) {
      console.error('❌ テーブル確認エラー:', tablesError.message);
    } else {
      console.log('📋 作成されたテーブル:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }

    console.log('\n✅ マイグレーション完了！');

  } catch (error) {
    console.error('❌ マイグレーション失敗:', error.message);
    process.exit(1);
  }
}

// exec_sql 関数が存在しない場合は作成
async function createExecFunction() {
  const createFunctionSQL = `
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
    const { error } = await supabase.rpc('query', { query: createFunctionSQL });
    if (error) {
      console.log('⚠️  exec_sql関数作成をスキップ（既存または権限不足）');
    } else {
      console.log('✅ exec_sql関数を作成しました');
    }
  } catch (err) {
    console.log('⚠️  exec_sql関数作成をスキップ');
  }
}

// メイン実行
createExecFunction().then(() => runMigration());