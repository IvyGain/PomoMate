# PomoMate Automation Guide

このガイドでは、PomoMateプロジェクトで使用できる自動化スクリプトとコマンドについて説明します。

## 🚀 クイックスタート

### 開発環境の起動
```bash
# npm スクリプトを使用
npm run auto:start

# または Makefile を使用
make start
```

### プロダクションへのデプロイ
```bash
# インタラクティブなデプロイ
npm run auto:deploy

# または Makefile を使用
make deploy

# クイックデプロイ（自動コミット＆プッシュ）
make quick
```

## 📋 利用可能なコマンド

### NPM Scripts

| コマンド | 説明 |
|---------|------|
| `npm run auto:start` | 開発サーバーを自動起動 |
| `npm run auto:deploy` | インタラクティブなデプロイプロセス |
| `npm run auto:git-deploy` | 自動コミット、プッシュ、デプロイ |
| `npm run auto:check` | アプリケーションの稼働状況確認 |

### Makefile Commands

| コマンド | 説明 |
|---------|------|
| `make help` | 利用可能なコマンド一覧を表示 |
| `make start` | 開発サーバー起動 |
| `make deploy` | プロダクションデプロイ |
| `make test` | テスト実行 |
| `make clean` | ビルドファイルのクリーンアップ |
| `make install` | 依存関係のインストール |
| `make update` | 依存関係の更新 |
| `make check` | アプリケーション稼働確認 |
| `make quick` | クイックデプロイ |

## 🤖 GitHub Actions 自動タスク

### スケジュール実行
- 毎日午前2時（UTC）に自動ヘルスチェック
- 1週間以上古いアーティファクトの自動削除

### 手動実行
GitHub Actions ページから以下のタスクを手動実行できます：
- `health-check`: アプリケーションのヘルスチェック
- `cleanup`: 古いアーティファクトの削除
- `backup`: バックアップ（実装予定）
- `dependency-update`: 依存関係の更新チェック

## 📝 スクリプトの詳細

### auto-start.sh
- ポートの使用状況を確認
- 必要に応じてプロセスを終了
- 依存関係のインストール
- Expo開発サーバーの起動

### auto-deploy.sh
- Git の変更状況を確認
- インタラクティブなコミット＆プッシュ
- Vercel へのデプロイ

## 💡 使用例

### 日常的な開発フロー
```bash
# 1. 開発環境を起動
make start

# 2. 開発作業...

# 3. 変更をデプロイ
make deploy
```

### 素早い修正とデプロイ
```bash
# 変更後、すぐにデプロイ
make quick
```

### アプリケーションの監視
```bash
# 稼働状況を確認
make check

# GitHub Actions でヘルスチェックを実行
gh workflow run auto-tasks.yml -f task=health-check
```

## 🔧 カスタマイズ

スクリプトは以下の場所にあります：
- `/scripts/auto-start.sh`
- `/scripts/auto-deploy.sh`
- `/.github/workflows/auto-tasks.yml`
- `/Makefile`

必要に応じて編集してください。