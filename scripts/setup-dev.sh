#!/bin/bash
# 開発環境セットアップスクリプト

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Pomodoro Play 開発環境セットアップ ===${NC}"
echo

# 1. Dockerコンテナを起動
echo -e "${YELLOW}PostgreSQLとRedisを起動中...${NC}"
cd backend
docker-compose -f docker-compose.dev.yml up -d
cd ..

# コンテナの起動を待つ
echo -e "${YELLOW}データベースの起動を待機中...${NC}"
sleep 5

# 2. バックエンドのセットアップ
echo -e "${YELLOW}バックエンドをセットアップ中...${NC}"
cd backend

# .envファイルを作成
if [ ! -f .env ]; then
    cp .env.development .env
    echo -e "${GREEN}.envファイルを作成しました${NC}"
fi

# 依存関係をインストール
npm install

# Prismaのセットアップ
echo -e "${YELLOW}データベースマイグレーションを実行中...${NC}"
npx prisma generate
npx prisma migrate dev --name init

# シードデータを投入
echo -e "${YELLOW}シードデータを投入中...${NC}"
npx prisma db seed

cd ..

# 3. フロントエンドのセットアップ
echo -e "${YELLOW}フロントエンドをセットアップ中...${NC}"

# 依存関係をインストール
npm install

# 4. 起動コマンドを表示
echo
echo -e "${GREEN}=== セットアップ完了！ ===${NC}"
echo
echo -e "${BLUE}以下のコマンドで開発サーバーを起動できます：${NC}"
echo
echo -e "${YELLOW}1. バックエンドサーバーを起動:${NC}"
echo "   cd backend && npm run dev"
echo
echo -e "${YELLOW}2. 別のターミナルでExpo開発サーバーを起動:${NC}"
echo "   ./scripts/start-expo.sh"
echo
echo -e "${GREEN}pgAdminでデータベースを確認:${NC}"
echo "   URL: http://localhost:5050"
echo "   Email: admin@pomodoro.local"
echo "   Password: admin"
echo
echo -e "${BLUE}Happy coding! 🚀${NC}"