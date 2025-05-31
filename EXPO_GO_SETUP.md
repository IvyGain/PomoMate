# Expo Go での動作確認ガイド

## 前提条件

- Node.js 18以上がインストールされていること
- Dockerがインストールされていること
- スマートフォンにExpo Goアプリがインストールされていること
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## セットアップ手順

### 1. 開発環境の初期セットアップ

```bash
# リポジトリのルートディレクトリで実行
./scripts/setup-dev.sh
```

このスクリプトは以下を実行します：
- PostgreSQLとRedisのDockerコンテナを起動
- バックエンドの依存関係をインストール
- データベースマイグレーションを実行
- シードデータを投入
- フロントエンドの依存関係をインストール

### 2. バックエンドサーバーの起動

新しいターミナルウィンドウを開いて：

```bash
cd backend
npm run dev
```

サーバーが `http://localhost:3000` で起動します。

### 3. Expo開発サーバーの起動

別のターミナルウィンドウで：

```bash
./scripts/start-expo.sh
```

このスクリプトは：
- ローカルIPアドレスを自動検出
- `.env`ファイルを設定
- バックエンドの状態を確認
- Expo開発サーバーを起動

### 4. スマートフォンでの確認

1. **同じWi-Fiネットワークに接続**
   - PCとスマートフォンが同じWi-Fiネットワークに接続されていることを確認

2. **QRコードをスキャン**
   - ターミナルに表示されるQRコードをExpo Goアプリでスキャン
   - または、表示されるURLを手動で入力

3. **アプリの起動**
   - Expo Goでアプリが自動的に起動します

## トラブルシューティング

### 接続できない場合

1. **ファイアウォールの確認**
   ```bash
   # macOS
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
   
   # ポート3000と8081を許可
   ```

2. **IPアドレスの確認**
   ```bash
   # macOS
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Linux
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

3. **手動で.envファイルを編集**
   ```bash
   # .envファイルを開く
   nano .env
   
   # YOUR_LOCAL_IPを実際のIPアドレスに置き換える
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
   EXPO_PUBLIC_WS_URL=ws://192.168.1.100:3000
   ```

### バックエンドエラーの場合

1. **データベースの確認**
   ```bash
   cd backend
   docker-compose -f docker-compose.dev.yml ps
   ```

2. **ログの確認**
   ```bash
   docker-compose -f docker-compose.dev.yml logs postgres
   docker-compose -f docker-compose.dev.yml logs redis
   ```

3. **データベースの再起動**
   ```bash
   docker-compose -f docker-compose.dev.yml restart
   ```

### Expo Goでのエラー

1. **キャッシュのクリア**
   ```bash
   npx expo start --clear
   ```

2. **依存関係の再インストール**
   ```bash
   rm -rf node_modules
   npm install
   ```

## 開発用アカウント

テスト用アカウント：
- Email: `test@example.com`
- Password: `password123`

## 便利なコマンド

### データベース管理

```bash
# pgAdminで確認
# URL: http://localhost:5050
# Email: admin@pomodoro.local
# Password: admin

# データベースに直接接続
cd backend
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d pomodoro_dev
```

### ログの確認

```bash
# バックエンドのログ
cd backend
npm run dev

# Redisモニター
docker-compose -f docker-compose.dev.yml exec redis redis-cli monitor
```

### データのリセット

```bash
cd backend
# データベースをリセット
npx prisma migrate reset
# シードデータを再投入
npm run seed
```

## 注意事項

- **セキュリティ**: 開発環境では全てのオリジンからのアクセスを許可しています。本番環境では適切なCORS設定が必要です。
- **パフォーマンス**: Expo Goでは一部の最適化が効かない場合があります。
- **ホットリロード**: コードを変更すると自動的にアプリがリロードされます。

## 次のステップ

開発が完了したら：

1. **ビルド**: `npx expo build`
2. **テスト**: `npm test`
3. **デプロイ**: [デプロイメントガイド](./DEPLOYMENT_GUIDE.md)を参照

Happy coding! 🚀