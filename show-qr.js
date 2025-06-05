const os = require('os');

// Get local IP address
const networkInterfaces = os.networkInterfaces();
const ip = Object.values(networkInterfaces)
  .flat()
  .find(i => i.family === 'IPv4' && !i.internal)?.address;

const expUrl = `exp://${ip}:8081`;
const tunnelUrl = 'exp://exp.host/@anonymous/pomodoro-play';

console.log('\n🎯 Pomodoro Play - スマホでテスト\n');
console.log('📱 アクセス方法:');
console.log('');
console.log('方法1: ローカルIP経由');
console.log(`   ${expUrl}`);
console.log('');
console.log('方法2: Tunnel経由 (推奨)');
console.log(`   ${tunnelUrl}`);
console.log('');
console.log('🚀 手順:');
console.log('1. スマホでExpo Goアプリを開く');
console.log('2. "Enter URL manually" をタップ');
console.log('3. 上記URLのいずれかを入力');
console.log('');
console.log('🎮 デモ用ログイン:');
console.log('Email: demo@pomodoroplay.com');
console.log('Password: demo123');
console.log('');

// ASCII QR code representation
console.log('📊 QRコード的表示 (参考):');
console.log('┌─────────────────────────────┐');
console.log('│ ▄▄▄▄▄ ▄▄ ▄ ▄▄▄ ▄▄▄ ▄▄▄▄▄ │');
console.log('│ █   █ ██ █ █ █ █ █ █   █ │');
console.log('│ █▄▄▄█ ▄█▄█ ▄▄▄ █▄█ █▄▄▄█ │');
console.log('│ ▄▄▄▄▄ █ █ █ █ █ █ █ ▄▄▄▄▄ │');
console.log('│ ▄ ▄█▄ ███▄█▄▄ ▄██▄ ▄█▄ ▄ │');
console.log('│ ██▄ ▄ ▄ █▄ ██▄██ █ ▄ ▄██ │');
console.log('│ ▄▄▄▄▄ ▄ █▄█ █▄ █▄▄ ▄▄▄▄▄ │');
console.log('│ █   █ █▄█ ▄▄█▄ ▄▄█ █   █ │');
console.log('│ █▄▄▄█ ▄█ ███ ▄█▄█▄ █▄▄▄█ │');
console.log('└─────────────────────────────┘');
console.log('');
console.log('⚡ サーバー状態: http://localhost:8081 で実行中');
console.log('');