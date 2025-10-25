# コントリビューションガイド

PomoMate MVP へのコントリビューションに興味を持っていただき、ありがとうございます！

## 開発環境のセットアップ

1. リポジトリをフォーク
2. ローカルにクローン
```bash
git clone https://github.com/[your-username]/PomoMateMVP.git
cd PomoMateMVP
```

3. 依存関係をインストール
```bash
bun install
# または
npm install
```

4. 開発サーバーを起動
```bash
bun start
# または
npm start
```

## コーディング規約

- TypeScript を使用
- ESLint と Prettier に従う
- コンポーネントは関数コンポーネントで作成
- 型安全性を確保

## プルリクエストのプロセス

1. 新しいブランチを作成
```bash
git checkout -b feature/your-feature-name
```

2. 変更を実装
3. コミット
```bash
git add .
git commit -m "Add: your feature description"
```

4. プッシュ
```bash
git push origin feature/your-feature-name
```

5. GitHub で Pull Request を作成

## バグレポート

バグを発見した場合:
1. GitHub Issues で新しい Issue を作成
2. バグの詳細な説明を記載
3. 再現手順を記載
4. 期待される動作と実際の動作を記載

## 機能リクエスト

新機能のアイデアがある場合:
1. GitHub Issues で新しい Issue を作成
2. 機能の詳細な説明を記載
3. ユースケースを記載
4. 可能であればモックアップを添付

## コミットメッセージの規約

- `Add:` 新機能追加
- `Fix:` バグ修正
- `Update:` 機能更新
- `Remove:` 機能削除
- `Refactor:` リファクタリング
- `Docs:` ドキュメント更新

## テスト

新しい機能を追加する際は、テストも追加してください。

## ライセンス

このプロジェクトに貢献することで、あなたの貢献が MIT ライセンスの下でライセンスされることに同意したことになります。
