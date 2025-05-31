#!/usr/bin/env node

const qrcode = require('qrcode-terminal');
const os = require('os');

// ローカルIPアドレスを取得
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIP = getLocalIP();
const expoPort = process.env.EXPO_PORT || 8081;

// Expo GoのURL形式
const expoUrl = `exp://${localIP}:${expoPort}`;

console.log('\n\x1b[36m=== Expo Go QRコード ===\x1b[0m\n');
console.log(`\x1b[32mExpo URL:\x1b[0m ${expoUrl}`);
console.log('\n\x1b[33m以下のQRコードをExpo Goアプリでスキャンしてください:\x1b[0m\n');

// QRコードを生成
qrcode.generate(expoUrl, { small: false }, function(qr) {
  console.log(qr);
});

console.log('\n\x1b[34m注意事項:\x1b[0m');
console.log('1. スマートフォンとPCが同じWi-Fiネットワークに接続されていることを確認してください');
console.log('2. Expo開発サーバーが起動していることを確認してください (npm start)');
console.log('3. バックエンドサーバーがhttp://localhost:3000で起動していることを確認してください');
console.log('\n\x1b[32mローカルIP:\x1b[0m', localIP);
console.log('\x1b[32mExpoポート:\x1b[0m', expoPort);
console.log('');