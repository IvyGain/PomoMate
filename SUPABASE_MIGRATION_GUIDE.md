# Supabase データベースマイグレーションガイド

## 手順

Supabaseダッシュボードの SQL Editor で以下のファイルを順番に実行してください：

### 1. Step 1: 基本テーブルの作成
ファイル: `supabase-migration-step1.sql`
- UUID拡張機能の有効化
- users, user_settings, sessions, characters テーブルの作成

### 2. Step 2: 関連テーブルの作成
ファイル: `supabase-migration-step2.sql`
- user_characters, achievements, user_achievements, friends, teams テーブルの作成

### 3. Step 3: チームとショップテーブルの作成
ファイル: `supabase-migration-step3.sql`
- team_members, team_sessions, team_session_participants, shop_items, user_purchases テーブルの作成

### 4. Step 4: インデックスとトリガーの作成
ファイル: `supabase-migration-step4.sql`
- パフォーマンス向上のためのインデックス作成
- updated_at自動更新トリガーの作成

### 5. Step 5: Row Level Security (RLS) の設定
ファイル: `supabase-migration-step5.sql`
- 全テーブルでRLSを有効化
- ユーザー、設定、セッション、キャラクター、実績のポリシー作成

### 6. Step 6: 残りのRLSポリシー作成
ファイル: `supabase-migration-step6.sql`
- 友達、チーム、購入関連のセキュリティポリシー作成

### 7. Step 7: 初期データの投入
ファイル: `supabase-migration-step7.sql`
- デフォルトキャラクターの作成
- サンプル実績の作成
- 権限設定

## 実行方法

1. Supabaseダッシュボードにログイン
2. プロジェクト `xjxgapahcookarqiwjww` を選択
3. 左メニューから「SQL Editor」を選択
4. 上記のステップファイルを順番にコピー＆ペーストして実行

## 確認方法

全ステップ完了後、以下で確認：

```sql
-- テーブル一覧確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- RLS有効確認
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## トラブルシューティング

- エラーが発生した場合は、そのステップをスキップして次に進む
- 既存テーブルエラーは正常（重複実行による）
- 権限エラーが発生した場合は、Service Role権限で実行しているか確認

## 完了後の次のステップ

1. デモユーザーの作成
2. 認証フローのテスト
3. アプリケーションからの接続テスト