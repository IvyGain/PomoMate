#!/usr/bin/env node

const https = require('https');

console.log('🔍 Supabase接続診断ツール');
console.log('================================\n');

// テスト対象URL
const supabaseUrl = 'https://xjxgapahcookarqiwjww.supabase.co';

const tests = [
  { name: 'REST API', path: '/rest/v1/' },
  { name: 'Auth API', path: '/auth/v1/health' },
  { name: 'Realtime', path: '/realtime/v1/' },
  { name: 'Storage', path: '/storage/v1/health' }
];

function testEndpoint(url, name) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    https.get(url, (res) => {
      const duration = Date.now() - startTime;
      const status = res.statusCode;
      
      let statusIcon = '❌';
      let statusText = 'エラー';
      
      if (status === 200) {
        statusIcon = '✅';
        statusText = 'OK';
      } else if (status === 401 || status === 403) {
        statusIcon = '🔐';
        statusText = '認証必要（正常）';
      } else if (status === 404) {
        statusIcon = '⚠️';
        statusText = 'エンドポイント不明';
      }
      
      console.log(`${statusIcon} ${name.padEnd(12)} | ${status} | ${duration}ms | ${statusText}`);
      resolve({ name, status, duration, success: status < 500 });
      
    }).on('error', (err) => {
      const duration = Date.now() - startTime;
      console.log(`❌ ${name.padEnd(12)} | ERROR | ${duration}ms | ${err.message}`);
      resolve({ name, status: 'ERROR', duration, success: false, error: err.message });
    });
  });
}

async function runDiagnostics() {
  console.log('テスト名       | ステータス | 応答時間 | 結果');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(`${supabaseUrl}${test.path}`, test.name);
    results.push(result);
  }
  
  console.log('\n📊 診断結果サマリー');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  if (successful === total) {
    console.log('✅ すべてのサービスが正常に動作しています');
  } else if (successful > 0) {
    console.log(`⚠️  ${successful}/${total} のサービスが正常です`);
    console.log('🔧 一部のサービスに問題があります');
  } else {
    console.log('❌ すべてのサービスに問題があります');
    console.log('🚨 Supabaseプロジェクトに重大な問題が発生している可能性があります');
  }
  
  console.log('\n🛠️  推奨アクション:');
  
  if (successful >= 2) {
    console.log('1. メール設定を確認してください');
    console.log('2. Authentication → Settings → SMTP Settings');
    console.log('3. 必要に応じてデフォルト設定に戻してください');
  } else {
    console.log('1. Supabaseダッシュボードで全般的な設定を確認');
    console.log('2. プロジェクトの再起動を検討');
    console.log('3. Supabaseサポートに連絡することを検討');
  }
  
  console.log('\n🌐 ダッシュボードURL:');
  console.log(`https://app.supabase.com/project/xjxgapahcookarqiwjww`);
}

runDiagnostics().catch(console.error); 