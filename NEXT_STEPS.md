# 🚀 次のステップ - 今すぐ始められること

## 1️⃣ 今日やること（Day 1）

### A. 開発環境の起動
```bash
# ターミナル1: バックエンドを起動
cd backend
npm install
cp .env.example .env
# .envを編集してデータベース設定を記入

# PostgreSQLをDockerで起動
docker-compose up -d postgres redis

# データベースマイグレーション
npx prisma migrate dev
npm run seed

# バックエンドサーバー起動
npm run dev
```

```bash
# ターミナル2: フロントエンドの依存関係追加
cd ../ # PomoMateのルートへ
npm install axios socket.io-client
```

### B. APIクライアントの基本実装

1. **API設定ファイルを作成**
```javascript
// src/config/api.js
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';

export const SOCKET_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://your-production-api.com';
```

2. **Axiosインスタンスを作成**
```javascript
// src/services/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// リクエストインターセプター（トークン自動付与）
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## 2️⃣ 今週やること（Week 1）

### 月曜日-火曜日: 認証システムの接続
- [ ] ログイン・登録APIの実装
- [ ] authStoreの更新（API連携）
- [ ] トークン管理（保存・更新・削除）
- [ ] エラーハンドリング

### 水曜日-木曜日: コア機能のAPI接続
- [ ] セッション記録API
- [ ] ユーザー統計の取得・更新
- [ ] 実績システムの連携
- [ ] 設定の同期

### 金曜日: Socket.IO統合
- [ ] Socket.IOクライアントセットアップ
- [ ] 認証付き接続
- [ ] 再接続ロジック
- [ ] チームセッションのリアルタイム同期

---

## 3️⃣ 優先順位の高いタスク

### 🔴 必須（MVP）
1. **認証フロー** - ユーザーがログインできないと何も始まらない
2. **セッション記録** - コア機能の動作
3. **データ同期** - 進捗が保存される
4. **基本的なエラーハンドリング** - アプリがクラッシュしない

### 🟡 重要（ベータ版）
1. **チームセッション** - ソーシャル機能
2. **プッシュ通知** - エンゲージメント向上
3. **オフライン対応** - 通信エラー時の対処
4. **パフォーマンス最適化** - 快適な使用感

### 🟢 あると良い（正式版以降）
1. **アプリ内課金** - 収益化
2. **詳細なアナリティクス** - 改善のためのデータ
3. **A/Bテスト** - 機能の最適化
4. **多言語対応** - グローバル展開

---

## 4️⃣ 開発のコツ

### デバッグ効率を上げる
```javascript
// src/utils/logger.js
const logger = {
  api: (message, data) => {
    if (__DEV__) {
      console.log(`🌐 API: ${message}`, data);
    }
  },
  socket: (message, data) => {
    if (__DEV__) {
      console.log(`🔌 Socket: ${message}`, data);
    }
  },
  error: (message, error) => {
    console.error(`❌ Error: ${message}`, error);
    // Sentryに送信
  }
};
```

### 開発用ショートカット
```javascript
// App.jsに追加（開発時のみ）
if (__DEV__) {
  // 自動ログイン
  const DevTools = () => {
    useEffect(() => {
      // authStore.login({ email: 'test@example.com', password: 'test123' });
    }, []);
    return null;
  };
}
```

---

## 5️⃣ よくある問題と解決策

### 問題1: CORSエラー
```javascript
// backend/src/server.js で確認
app.use(cors({
  origin: ['http://localhost:8081', 'exp://localhost:8081'],
  credentials: true
}));
```

### 問題2: ネットワークエラー（Android）
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<application
  android:usesCleartextTraffic="true"
  ...>
```

### 問題3: Socket.IO接続エラー
```javascript
// トランスポート設定を明示的に指定
const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  auth: { token }
});
```

---

## 6️⃣ 今すぐできる小さな一歩

1. **バックエンドを起動してみる**
   - まずは `npm run dev` で起動確認
   - `http://localhost:3000/health` にアクセス

2. **Postmanでテスト**
   - 登録API: `POST /api/auth/register`
   - ログインAPI: `POST /api/auth/login`

3. **簡単な接続テスト**
   ```javascript
   // App.jsに一時的に追加
   useEffect(() => {
     fetch('http://localhost:3000/health')
       .then(res => res.json())
       .then(data => console.log('API接続成功！', data))
       .catch(err => console.error('API接続失敗', err));
   }, []);
   ```

---

## 🎯 今日の目標

**最低限**: バックエンドが起動して、ヘルスチェックが通る
**理想**: 登録・ログインAPIが動作する

一歩ずつ進めていきましょう！ 🚀