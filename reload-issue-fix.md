# ブラウザ再読み込み問題の原因と解決策

## 🔍 問題の原因

Expo開発サーバーは、以下の理由で再読み込み時に接続エラーが発生します：

1. **HMR (Hot Module Replacement) 依存**
   - 初回アクセス時はWebSocketコネクションが確立される
   - ブラウザリロード時にWebSocket接続が切断される
   - サーバーがクライアントの再接続を適切に処理できない

2. **開発サーバーのライフサイクル**
   - `npx expo start` は開発用の軽量サーバー
   - プロセスが不安定になりやすい
   - メモリリークやリソース解放の問題

3. **バンドラーキャッシュ**
   - Metro Bundlerのキャッシュが壊れる
   - 再読み込み時に不整合が発生

## 🛠️ 解決策

### 方法1: 永続的な開発サーバー設定（推奨）

```bash
# 新しいスクリプトを作成
cat > start-persistent.sh << 'EOF'
#!/bin/bash

# Expo開発サーバーを永続化モードで起動
echo "🍅 PomoMate - 永続開発サーバー"
echo "================================"

# 既存プロセスをクリーンアップ
pkill -f expo 2>/dev/null
pkill -f Metro 2>/dev/null
sleep 2

# キャッシュをクリア
rm -rf .expo 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null

# 環境変数を設定
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export EXPO_PACKAGER_PROXY_URL=http://localhost:8081

# Webpackモードで起動（より安定）
npx expo start --web --clear --no-dev --minify
EOF

chmod +x start-persistent.sh
```

### 方法2: PM2を使用した永続化

```bash
# PM2をインストール
npm install -g pm2

# PM2設定ファイルを作成
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'pomomate-dev',
    script: 'npx',
    args: 'expo start --web --clear',
    env: {
      EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0',
      NODE_ENV: 'development'
    },
    watch: false,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# PM2で起動
pm2 start ecosystem.config.js
pm2 logs pomomate-dev
```

### 方法3: 開発用プロキシサーバー

```javascript
// dev-proxy.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Expoサーバーへのプロキシ
app.use('/', createProxyMiddleware({
  target: 'http://localhost:8081',
  changeOrigin: true,
  ws: true,
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(502).send('開発サーバーを再起動してください');
  }
}));

app.listen(3000, () => {
  console.log('Proxy server running on http://localhost:3000');
});
```

## 🚀 即効性のある対処法

### 1. ブラウザの設定

```javascript
// Chrome DevToolsで実行
// Service Workerを無効化
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});
```

### 2. 開発時の推奨ワークフロー

1. **新しいタブで開く** - リロードの代わりに新しいタブで開く
2. **シークレットモード使用** - キャッシュの影響を受けない
3. **ポート指定** - `http://localhost:8081` の代わりに `http://127.0.0.1:8081`

### 3. package.json スクリプト追加

```json
{
  "scripts": {
    "web": "expo start --web --clear",
    "web:stable": "expo start --web --no-dev --minify",
    "web:prod": "expo export:web && npx serve web-build"
  }
}
```

## 📝 一時的な回避策

リロード時のエラーを回避するには：

1. **Cmd+Shift+R** (ハードリロード) の代わりに
2. **アドレスバーでEnter** を押す
3. または **新しいタブ** で開く

## 🔧 根本的な解決

本番環境に近い形でテストする場合：

```bash
# ビルドして静的サーバーで配信
npx expo export:web
npx serve web-build -p 3000
```

これで `http://localhost:3000` で安定してアクセス可能になります。