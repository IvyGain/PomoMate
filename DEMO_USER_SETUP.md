# デモユーザー設定ガイド

## 現在の設定

**デモユーザーメールアドレス**: `romancemorio+test@gmail.com`

## 必要な作業

### 1. Supabaseダッシュボードでの確認

1. [Supabaseダッシュボード](https://supabase.com/dashboard) にアクセス
2. プロジェクト `xjxgapahcookarqiwjww` を選択
3. 左メニュー「Authentication」→「Users」をクリック
4. `romancemorio+test@gmail.com` ユーザーを確認

### 2. パスワードの確認・設定

もしユーザーが存在しない場合：
1. 「Add user」ボタンをクリック
2. Email: `romancemorio+test@gmail.com`
3. Password: 任意のパスワード（例：`TestPassword123!`）
4. 「Create user」をクリック

もしユーザーが存在する場合：
1. ユーザーをクリックして詳細を表示
2. 「Reset password」でパスワードをリセット
3. または既存のパスワードを使用

### 3. アプリケーションコードの更新

パスワードが確認できたら、以下のファイルで実際のパスワードに更新：

**app/login.tsx** (64行目):
```typescript
const demoPassword = 'ここに実際のパスワード';
```

**src/services/authService.unified.ts** (350行目):
```typescript
return this.login('romancemorio+test@gmail.com', 'ここに実際のパスワード');
```

### 4. データベーステーブルの準備

マイグレーションSQLファイルを実行してusersテーブルを作成：

1. Supabaseダッシュボード → SQL Editor
2. `supabase-migration-step1.sql` から `step7.sql` を順番に実行

### 5. デモユーザープロファイルの作成

テーブル作成後、以下のSQLを実行してプロファイルを作成：

```sql
-- デモユーザーのSupabase Auth IDを取得
SELECT id, email FROM auth.users WHERE email = 'romancemorio+test@gmail.com';

-- そのIDを使ってプロファイルを作成（IDを実際の値に置き換え）
INSERT INTO users (id, email, username, display_name) 
VALUES ('ここにauth.usersのID', 'romancemorio+test@gmail.com', 'demo_user', 'デモユーザー')
ON CONFLICT (id) DO NOTHING;

-- デフォルト設定を作成
INSERT INTO user_settings (user_id) 
VALUES ('ここにauth.usersのID')
ON CONFLICT (user_id) DO NOTHING;

-- デフォルトキャラクターを割り当て
INSERT INTO user_characters (user_id, character_id, is_active) 
VALUES ('ここにauth.usersのID', 'balanced_1', true)
ON CONFLICT (user_id, character_id) DO NOTHING;
```

### 6. 動作確認

1. アプリケーションを起動
2. 「デモユーザーでログイン」ボタンをクリック
3. ログインが成功することを確認

## トラブルシューティング

### ログインエラーが発生する場合

1. **Invalid login credentials**: 
   - パスワードが間違っている
   - Supabaseでパスワードを確認・リセット

2. **User not found**:
   - メールアドレスが間違っている
   - Supabaseでユーザーを新規作成

3. **Email not confirmed**:
   - Supabaseダッシュボードでユーザーの「Email Confirmed」を手動でtrueに設定

### プロファイルエラーが発生する場合

1. **Table 'users' doesn't exist**:
   - マイグレーションSQLを実行してテーブルを作成

2. **Profile not found**:
   - 上記のプロファイル作成SQLを実行

## メール確認機能の無効化（オプション）

開発中はメール確認を無効化できます：

1. Supabaseダッシュボード → Authentication → Settings
2. 「Email Confirmations」をOFFに設定
3. これにより新規登録時にメール確認が不要になります