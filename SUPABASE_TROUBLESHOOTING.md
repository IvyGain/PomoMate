# Supabase認証トラブルシューティングガイド

## 現在の問題

**デモユーザー**: `romancemorio+test@gmail.com`  
**パスワード**: `Po8silba8`  
**エラー**: `Invalid login credentials`

## 解決手順

### 1. Supabaseダッシュボードでの確認

#### A. ユーザーの存在確認
1. [Supabaseダッシュボード](https://supabase.com/dashboard) にアクセス
2. プロジェクト `xjxgapahcookarqiwjww` を選択
3. 左メニュー「Authentication」→「Users」をクリック
4. `romancemorio+test@gmail.com` を検索

#### B. ユーザーが存在しない場合
1. 「Add user」ボタンをクリック
2. 以下の情報を入力：
   - Email: `romancemorio+test@gmail.com`
   - Password: `Po8silba8`
   - Email confirm: **チェックを入れる**（重要）
3. 「Create user」をクリック

#### C. ユーザーが存在する場合
1. ユーザー詳細をクリック
2. 以下を確認：
   - **Email Confirmed**: `true` になっているか
   - **Is Banned**: `false` になっているか
   - **Last Sign In**: 最近のログイン記録があるか

3. 必要に応じて修正：
   - Email Confirmedが `false` → 手動で `true` に変更
   - パスワードリセットが必要 → 「Reset password」をクリック

### 2. Authentication設定の確認

#### A. メール確認設定
1. Authentication → Settings → Auth
2. 「Enable email confirmations」がOFFになっているか確認
3. 開発中はOFFに設定することを推奨

#### B. リダイレクトURL設定
1. Authentication → URL Configuration
2. 以下のURLが設定されているか確認：
   - Site URL: `https://pomomate-p0iya2bod-ivygains-projects.vercel.app`
   - Redirect URLs に以下を追加:
     - `https://pomomate-p0iya2bod-ivygains-projects.vercel.app/**`
     - `https://pomomate-p0iya2bod-ivygains-projects.vercel.app/email-confirmed`
     - `http://localhost:8081/**` (開発用)
     - `http://localhost:8081/email-confirmed` (開発用)

### 3. 代替解決策

#### A. 新しいテストユーザーを作成
もし既存ユーザーで問題が解決しない場合：

1. Supabaseダッシュボードで新しいユーザーを作成
2. 以下の情報を使用：
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Email confirm: **チェックを入れる**

3. アプリのコードを更新：
```javascript
// app/login.tsx と src/services/authService.unified.ts
const demoEmail = 'test@example.com';
const demoPassword = 'TestPassword123!';
```

#### B. メール確認をスキップ
1. Authentication → Settings → Auth
2. 「Enable email confirmations」をOFFに設定
3. 新規登録時にメール確認が不要になります

### 4. デバッグ用SQLクエリ

Supabaseダッシュボードの SQL Editor で以下のクエリを実行して確認：

```sql
-- 認証ユーザー一覧
SELECT 
  id, 
  email, 
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  is_banned
FROM auth.users 
WHERE email LIKE '%romancemorio%' OR email LIKE '%test%';

-- ユーザーの詳細情報
SELECT * FROM auth.users WHERE email = 'romancemorio+test@gmail.com';
```

### 5. 完了後の確認

設定完了後、以下のコマンドで動作確認：

```bash
node test-demo-auth.js
```

✅ ログイン成功メッセージが表示されれば完了です。

## 緊急時の対応

### 即座に動作確認したい場合

1. **一時的にメール確認を無効化**：
   - Authentication → Settings → Auth
   - 「Enable email confirmations」→ OFF

2. **新規テストユーザーを作成**：
   - Email: `demo@pomomate.local`
   - Password: `DemoPass123!`
   - Email confirm: ON

3. **アプリコードを一時変更**：
```javascript
const demoEmail = 'demo@pomomate.local';
const demoPassword = 'DemoPass123!';
```

### 本格運用時の推奨設定

- メール確認: ON
- リダイレクトURL: 本番ドメインに設定
- パスワードポリシー: 強化設定
- MFA: 必要に応じて有効化