#!/bin/bash
# Expo Go開発環境起動スクリプト

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Pomodoro Play - Expo Go 開発環境セットアップ ===${NC}"
echo

# ローカルIPアドレスを取得
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
else
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

if [ -z "$LOCAL_IP" ]; then
    echo -e "${RED}エラー: ローカルIPアドレスを取得できませんでした${NC}"
    echo "手動でIPアドレスを入力してください:"
    read -p "IP Address: " LOCAL_IP
fi

echo -e "${GREEN}ローカルIPアドレス: $LOCAL_IP${NC}"

# .envファイルを作成/更新
if [ ! -f .env ]; then
    cp .env.development .env
fi

# IPアドレスを.envに設定
sed -i.bak \
    -e "s|YOUR_LOCAL_IP|$LOCAL_IP|g" \
    .env
rm -f .env.bak

echo -e "${GREEN}.envファイルを更新しました${NC}"

# バックエンドが起動しているか確認
echo -e "${YELLOW}バックエンドサーバーの状態を確認中...${NC}"

if ! curl -s "http://localhost:3000/api/health" > /dev/null; then
    echo -e "${YELLOW}バックエンドサーバーが起動していません${NC}"
    echo -e "${BLUE}バックエンドを起動しますか? (y/n)${NC}"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}バックエンドを起動中...${NC}"
        cd backend
        npm run dev &
        BACKEND_PID=$!
        cd ..
        
        # バックエンドの起動を待つ
        echo -e "${YELLOW}バックエンドの起動を待機中...${NC}"
        sleep 5
        
        # ヘルスチェック
        for i in {1..30}; do
            if curl -s "http://localhost:3000/api/health" > /dev/null; then
                echo -e "${GREEN}バックエンドが起動しました！${NC}"
                break
            fi
            echo -n "."
            sleep 1
        done
    fi
else
    echo -e "${GREEN}バックエンドは既に起動しています${NC}"
fi

# パッケージのインストール
echo -e "${YELLOW}依存関係をインストール中...${NC}"
npm install

# Expo開発サーバーを起動
echo
echo -e "${BLUE}=== Expo開発サーバーを起動します ===${NC}"
echo -e "${GREEN}QRコードが表示されたら、Expo Goアプリでスキャンしてください${NC}"
echo
echo -e "${YELLOW}接続情報:${NC}"
echo -e "API URL: ${GREEN}http://$LOCAL_IP:3000/api${NC}"
echo -e "WebSocket URL: ${GREEN}ws://$LOCAL_IP:3000${NC}"
echo
echo -e "${YELLOW}注意事項:${NC}"
echo "1. スマートフォンとPCが同じWi-Fiネットワークに接続されていることを確認してください"
echo "2. ファイアウォールが3000番と8081番ポートをブロックしていないことを確認してください"
echo "3. バックエンドサーバーが http://localhost:3000 で起動していることを確認してください"
echo

# QRコードビューアーを開く（オプション）
echo
echo -e "${BLUE}QRコードビューアーを開きますか? (y/n)${NC}"
read -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # HTMLファイルをブラウザで開く
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "scripts/qr-viewer.html?ip=$LOCAL_IP"
    else
        xdg-open "scripts/qr-viewer.html?ip=$LOCAL_IP"
    fi
fi

# Expoを起動
npx expo start --clear