# PWA セットアップガイド

PomoMateをPWA（Progressive Web App）としてデプロイするための手順です。

## 📋 完了済みの設定

以下のファイルは既に設定済みです：

- ✅ `public/manifest.json` - PWAマニフェストファイル
- ✅ `public/service-worker.js` - Service Worker（オフライン対応）
- ✅ `app/+html.tsx` - PWA用のメタタグとスタイル
- ✅ `hooks/usePWA.ts` - PWA初期化フック
- ✅ `app/_layout.tsx` - PWAフックの統合

## 🚀 デプロイ手順

### 1. アイコンの準備

`public/` ディレクトリに以下のアイコンファイルを配置してください：

```bash
public/
  ├── icon-192.png      # 192x192px PNG
  ├── icon-512.png      # 512x512px PNG
  ├── icon.png          # 任意のサイズ (Apple Touch Icon用)
  └── favicon.png       # 32x32px または 16x16px
```

既存の `assets/images/icon.png` を使用する場合：

```bash
# publicディレクトリを作成
mkdir -p public

# アイコンをコピー（手動またはスクリプト使用）
cp assets/images/icon.png public/icon.png
cp assets/images/icon.png public/icon-192.png
cp assets/images/icon.png public/icon-512.png
cp assets/images/favicon.png public/favicon.png
```

または、スクリプトを実行：

```bash
bash scripts/copy-assets.sh
```

**注意**: 本番環境では、各サイズに最適化されたアイコンを使用することを推奨します。

### 2. manifest.jsonのカスタマイズ（オプション）

`public/manifest.json` を編集して���アプリ情報をカスタマイズ：

```json
{
  "name": "あなたのアプリ名",
  "short_name": "短い名前",
  "theme_color": "#カラーコード",
  "start_url": "/"
}
```

### 3. Webビルドの実行

```bash
npx expo export -p web
```

これにより `dist/` ディレクトリにビルド済みファイルが生成されます。

### 4. Vercelへデプロイ

#### 方法A: Vercel CLIを使用

```bash
# Vercel CLIをインストール（未インストールの場合）
npm i -g vercel

# デプロイ
vercel
```

#### 方法B: GitHubからデプロイ

1. GitHubにプッシュ
2. Vercelダッシュボードで「New Project」
3. リポジトリをインポート
4. ビルド設定：
   - **Framework Preset**: `Other`
   - **Build Command**: `npx expo export -p web`
   - **Output Directory**: `dist`
5. デプロイ

既存の `vercel.json` が適切なルーティング設定を含んでいます。

### 5. 他のホスティングサービス

#### Netlify

```bash
# netlify.tomlを作成
[build]
  command = "npx expo export -p web"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Firebase Hosting

```bash
# Firebase CLIをインストール
npm install -g firebase-tools

# 初期化
firebase init hosting

# firebase.jsonを編集
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

# デプロイ
firebase deploy
```

## 🧪 PWAのテスト

### 1. Lighthouse監査

Chrome DevToolsを開いて：

1. `Lighthouse` タブを選択
2. `Progressive Web App` にチェック
3. `Analyze page load` をクリック

目標スコア: 90以上

### 2. インストール可能性の確認

- **デスクトップ**: Chromeのアドレスバーにインストールアイコンが表示される
- **モバイル**: ブラウザメニューから「ホーム画面に追加」が表示される

### 3. Service Workerの確認

Chrome DevToolsで：

1. `Application` タブを開く
2. `Service Workers` を選択
3. Service Workerが登録されていることを確認

### 4. オフライン動作の確認

1. DevToolsの `Network` タブを開く
2. `Offline` にチェック
3. ページを更新
4. キャッシュされたページが表示されることを確認

### 5. マニフェストの確認

Chrome DevToolsで：

1. `Application` タブを開く
2. `Manifest` を選択
3. アプリ情報とアイコンが正しく表示されることを確認

## 📱 PWA機能

デプロイ後、ユーザーは以下の機能を利用できます：

- 📲 **ホーム画面に追加**: アプリのように起動
- 🚀 **高速起動**: Service Workerによるキャッシング
- 📵 **オフライン対応**: キャッシュされたページの表示
- 🔔 **通知**: ブラウザ通知によるタイマー完了通知
- 🎨 **ネイティブUI**: フルスクリーン表示

## 🔧 トラブルシューティング

### Service Workerが登録されない

1. HTTPSで配信されていることを確認（localhostは例外）
2. `public/service-worker.js` が正しく配置されているか確認
3. ブラウザのキャッシュをクリア

### マニフェストが読み込まれない

1. `public/manifest.json` のパスが正しいか確認
2. JSONの構文エラーがないか確認
3. Content-Typeが `application/json` であることを確認

### アイコンが表示されない

1. アイコンファイルのパスが正しいか確認
2. アイコンファイルが存在するか確認
3. アイコンのサイズが適切か確認（192x192, 512x512）

### インストールボタンが表示されない

Lighthouseで確認：
- マニフェストが有効
- Service Workerが登録済み
- HTTPSで配信
- start_urlが有効
- 適切なサイズのアイコンがある

## 📚 参考リンク

- [PWA ドキュメント (MDN)](https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps)
- [Service Worker API](https://developer.mozilla.org/ja/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/ja/docs/Web/Manifest)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Expo Web ドキュメント](https://docs.expo.dev/workflow/web/)

## 🎯 次のステップ

1. ✅ アイコンを適切なサイズで作成
2. ✅ Webビルドを実行
3. ✅ Vercelまたは他のホスティングサービスにデプロイ
4. ✅ Lighthouseでスコアを確認
5. ✅ 実機でインストールとオフライン動作をテスト

PWA設定は完了しています！あとはアイコンを準備してデプロイするだけです 🚀
