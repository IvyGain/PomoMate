# PomoMate MVP - デプロイメントガイド

このガイドでは、PomoMate MVPをGitHubとVercelにデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント
- Git がインストールされていること
- Node.js 18+ がインストールされていること

## ステップ 1: GitHubリポジトリの作成

### 1.1 GitHubで新しいリポジトリを作成

1. [GitHub](https://github.com) にログイン
2. 右上の「+」アイコンをクリックし、「New repository」を選択
3. リポジトリ名: `PomoMateMVP`
4. 説明: `ポモドーロテクニックをゲーミフィケーション化した集中力向上アプリ`
5. Public または Private を選択
6. 「Create repository」をクリック

### 1.2 ローカルリポジトリをプッシュ

プロジェクトのルートディレクトリで以下のコマンドを実行:

```bash
# Gitを初期化 (まだの場合)
git init

# すべてのファイルをステージング
git add .

# 初期コミット
git commit -m "Initial commit: PomoMate MVP with all features"

# GitHubリポジトリをリモートとして追加
# [your-username] を自分のGitHubユーザー名に置き換えてください
git remote add origin https://github.com/[your-username]/PomoMateMVP.git

# メインブランチに変更
git branch -M main

# プッシュ
git push -u origin main
```

## ステップ 2: Vercelへのデプロイ

### 2.1 Vercel Dashboard からデプロイ

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. 「Add New」→「Project」をクリック
3. 「Import Git Repository」セクションで GitHubアカウントを接続
4. 「PomoMateMVP」リポジトリを検索して選択
5. 「Import」をクリック

### 2.2 プロジェクト設定

#### Build & Development Settings:
- **Framework Preset**: Other
- **Build Command**: (空欄のまま、またはbuild コマンドがある場合は`bun run build`)
- **Output Directory**: (空欄のまま)
- **Install Command**: `bun install` (または `npm install`)

#### Environment Variables:
必要に応じて環境変数を追加（後で追加可能）

6. 「Deploy」をクリック

### 2.3 デプロイ完了の確認

デプロイが完了すると、VercelがアプリのURLを生成します。
例: `https://pomomate-mvp.vercel.app`

## ステップ 3: 環境変数の設定

### 3.1 Vercel の環境変数を設定

1. Vercel Dashboard → プロジェクトを選択
2. 「Settings」タブをクリック
3. 左側のメニューから「Environment Variables」を選択
4. 以下の環境変数を追加:

```
Name: EXPO_PUBLIC_RORK_API_BASE_URL
Value: https://[your-app-name].vercel.app
Environment: Production, Preview, Development
```

5. 「Save」をクリック

### 3.2 再デプロイ

環境変数を追加した後、再デプロイが必要です:

1. 「Deployments」タブに移動
2. 最新のデプロイメントの右側にある「...」メニューをクリック
3. 「Redeploy」を選択

## ステップ 4: Google OAuth の設定 (オプション)

Google OAuth を使用する場合:

### 4.1 Google Cloud Console で設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択または新規作成
3. 左側のメニュー → 「APIとサービス」 → 「認証情報」
4. 既存の OAuth 2.0 クライアント ID を選択または新規作成
5. 「承認済みのリダイレクト URI」に以下を追加:
   - `https://[your-app-name].vercel.app/login`
   - `exp://[your-ip]:8081` (Expo Go でテストする場合)
6. 「保存」をクリック

### 4.2 Vercel に OAuth 認証情報を追加

必要に応じて、クライアントIDをVercelの環境変数に追加できます。

## ステップ 5: カスタムドメイン (オプション)

カスタムドメインを使用する場合:

1. Vercel Dashboard → プロジェクト → 「Settings」
2. 「Domains」タブを選択
3. 「Add」ボタンをクリック
4. ドメイン名を入力 (例: `pomomate.com`)
5. DNS設定の指示に従ってドメインプロバイダーで設定
6. 「Verify」をクリック

## トラブルシューティング

### デプロイが失敗する場合

1. **ビルドエラー**:
   - Vercel の「Deployments」タブでログを確認
   - TypeScript エラーやパッケージの依存関係を確認

2. **API が動作しない**:
   - 環境変数が正しく設定されているか確認
   - `backend/hono.ts` のCORS設定を確認

3. **認証が動作しない**:
   - Google OAuth の設定が正しいか確認
   - リダイレクトURIが正しく設定されているか確認

### ログの確認

Vercel Dashboard → プロジェクト → 「Deployments」→ 任意のデプロイメント → 「View Function Logs」

## 継続的デプロイ

GitHubにプッシュすると自動的にVercelがデプロイします:

```bash
# 変更をコミット
git add .
git commit -m "Update: your changes"

# プッシュ
git push origin main
```

Vercelが自動的に新しいデプロイメントを作成します。

## 本番環境の推奨事項

### データベース

現在はメモリベースのデータベースを使用していますが、本番環境では以下を推奨:

- **Supabase** (Postgres): 簡単に統合可能
- **PlanetScale** (MySQL): スケーラブル
- **MongoDB Atlas**: NoSQL データベース
- **Vercel Postgres**: Vercel 統合

### リアルタイム機能

チームセッションのリアルタイム同期を改善:

- **Pusher**: リアルタイム通信
- **Ably**: リアルタイムメッセージング
- **WebSocket**: カスタム実装

### 認証

より強固な認証システム:

- **Clerk**: 完全な認証ソリューション
- **Auth0**: エンタープライズグレード
- **Supabase Auth**: オープンソース

## サポート

問題が発生した場合:

1. GitHub Issues で報告
2. Vercel のドキュメントを確認: https://vercel.com/docs
3. Expo のドキュメントを確認: https://docs.expo.dev

## まとめ

これで PomoMate MVP が GitHub と Vercel にデプロイされました！

- **GitHub リポジトリ**: `https://github.com/[your-username]/PomoMateMVP`
- **本番URL**: `https://[your-app-name].vercel.app`
- **自動デプロイ**: main ブランチへのプッシュで自動更新

Happy Deploying! 🚀
