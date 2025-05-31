# PomoMate デプロイメントガイド

## 概要

このガイドでは、PomoMateアプリケーションを本番環境にデプロイする手順を説明します。

## 前提条件

- Ubuntu 20.04+ またはそれに相当するLinuxサーバー
- Docker と Docker Compose がインストール済み
- ドメイン名（例：pomodoroplay.app）
- SSL証明書（Let's Encryptを推奨）
- 最低限のサーバースペック：
  - CPU: 2コア以上
  - RAM: 4GB以上
  - ストレージ: 20GB以上

## デプロイ手順

### 1. サーバーの準備

```bash
# 必要なパッケージをインストール
sudo apt update
sudo apt install -y docker.io docker-compose git nginx certbot python3-certbot-nginx

# Dockerグループにユーザーを追加
sudo usermod -aG docker $USER
newgrp docker
```

### 2. SSL証明書の取得

```bash
# Let's Encryptで証明書を取得
sudo certbot --nginx -d pomodoroplay.app -d www.pomodoroplay.app
```

### 3. リポジトリのクローン

```bash
# アプリケーションディレクトリを作成
sudo mkdir -p /var/www/pomodoroplay
sudo chown $USER:$USER /var/www/pomodoroplay
cd /var/www/pomodoroplay

# リポジトリをクローン
git clone https://github.com/yourusername/pomodoro-play.git .
```

### 4. 環境変数の設定

```bash
# デプロイメントディレクトリに移動
cd deployment

# シークレット設定スクリプトを実行
./scripts/setup-secrets.sh
```

### 5. SSL証明書のコピー

```bash
# Let's Encrypt証明書をNginxディレクトリにコピー
sudo cp /etc/letsencrypt/live/pomodoroplay.app/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/pomodoroplay.app/privkey.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/pomodoroplay.app/chain.pem ./nginx/ssl/
```

### 6. デプロイの実行

```bash
# デプロイスクリプトを実行
./scripts/deploy.sh
```

### 7. 初期データベース設定

```bash
# Prismaマイグレーションを実行
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# 初期シードデータを投入（必要な場合）
docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

## CI/CD設定

### GitHub Actionsのシークレット設定

GitHubリポジトリの Settings > Secrets で以下を設定：

- `DOCKER_USERNAME`: Docker Hubのユーザー名
- `DOCKER_PASSWORD`: Docker Hubのパスワード
- `DEPLOYMENT_SERVER`: デプロイ先サーバーのIP/ドメイン
- `DEPLOYMENT_USER`: デプロイ用ユーザー名
- `DEPLOYMENT_SSH_KEY`: デプロイ用SSH秘密鍵
- `SLACK_WEBHOOK`: Slack通知用Webhook URL（オプション）
- `CODECOV_TOKEN`: Codecovトークン（オプション）

### デプロイ用SSHキーの生成

```bash
# ローカルマシンで実行
ssh-keygen -t ed25519 -f deploy_key -C "github-actions"

# 公開鍵をサーバーに追加
ssh-copy-id -i deploy_key.pub user@your-server.com

# 秘密鍵をGitHub Secretsに追加
cat deploy_key
```

## モニタリング設定

### Prometheusとの統合

```bash
# Prometheusコンテナを起動
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml \
  --network pomodoro_network \
  prom/prometheus
```

### Grafanaダッシュボード

```bash
# Grafanaコンテナを起動
docker run -d \
  --name grafana \
  -p 3001:3000 \
  --network pomodoro_network \
  grafana/grafana

# ダッシュボードをインポート
# Grafana UI (http://your-server:3001) で grafana-dashboard.json をインポート
```

## バックアップとリストア

### 自動バックアップ

自動バックアップは毎日午前2時に実行されます。

### 手動バックアップ

```bash
docker-compose -f docker-compose.prod.yml run --rm backup /backup.sh
```

### リストア

```bash
# バックアップファイルを選択
BACKUP_FILE="/backups/pomodoro_backup_20240101_020000.sql.gz"

# データベースをリストア
docker-compose -f docker-compose.prod.yml exec -T postgres \
  gunzip -c $BACKUP_FILE | psql -U $DB_USER -d $DB_NAME
```

## トラブルシューティング

### ログの確認

```bash
# すべてのログを表示
docker-compose -f docker-compose.prod.yml logs

# 特定のサービスのログ
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs nginx
```

### コンテナの状態確認

```bash
docker-compose -f docker-compose.prod.yml ps
```

### データベース接続テスト

```bash
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U $DB_USER -d $DB_NAME -c "SELECT 1"
```

### ヘルスチェック

```bash
curl https://pomodoroplay.app/api/health
```

## セキュリティ考慮事項

1. **ファイアウォール設定**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

2. **定期的なアップデート**
   ```bash
   sudo apt update && sudo apt upgrade
   docker-compose -f docker-compose.prod.yml pull
   ```

3. **ログの監視**
   - Fail2banの設定を推奨
   - 異常なアクセスパターンの監視

4. **シークレットの管理**
   - 本番環境の`.env`ファイルは絶対にGitにコミットしない
   - 定期的なパスワードローテーション

## メンテナンス

### アプリケーションの更新

```bash
# 最新のコードを取得
git pull origin main

# 再デプロイ
cd deployment
./scripts/deploy.sh
```

### SSL証明書の更新

Let's Encryptの証明書は自動更新されますが、手動更新が必要な場合：

```bash
sudo certbot renew
# 新しい証明書をコピー
sudo cp /etc/letsencrypt/live/pomodoroplay.app/*.pem ./nginx/ssl/
# Nginxを再起動
docker-compose -f docker-compose.prod.yml restart nginx
```

## サポート

問題が発生した場合は、以下を確認してください：

1. [トラブルシューティングガイド](./TROUBLESHOOTING.md)
2. [GitHub Issues](https://github.com/yourusername/pomodoro-play/issues)
3. ログファイル（`/var/www/pomodoroplay/deployment/logs/`）

---

最終更新日: 2024年1月