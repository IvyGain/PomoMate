# ログイン問題 完全解決ガイド

## 🚨 現在の状況

- ✅ メール認証は完了
- ❌ ログインができない (`Invalid login credentials`)
- ❌ デモユーザーもログインできない
- ❌ データベーステーブルが作成されていない

## 🔍 問題の原因と解決手順

### 1. 【最優先】Supabaseユーザーの確認

**Supabaseダッシュボードで確認:**

1. [Supabaseダッシュボード](https://supabase.com/dashboard) にログイン
2. プロジェクト `xjxgapahcookarqiwjww` を選択
3. 左メニュー「**Authentication**」→「**Users**」をクリック
4. 登録されているユーザーを確認

**期待される表示:**
```
Email                           | Confirmed | Created
romancemorio+test@gmail.com     | ✅ Yes    | 2024-XX-XX
your-email@example.com          | ✅ Yes    | 2024-XX-XX
```

### 2. 【重要】ユーザーが存在しない場合

#### A. デモユーザーを手動作成
1. Authentication → Users → 「Add user」
2. 以下を入力:
   - **Email**: `romancemorio+test@gmail.com`
   - **Password**: `Po8silba8`
   - **Confirm Email**: ✅ チェックを入れる
3. 「Create user」をクリック

#### B. テスト用ユーザーを作成
1. Authentication → Users → 「Add user」
2. 以下を入力:
   - **Email**: `test@pomomate.local`
   - **Password**: `TestPassword123!`
   - **Confirm Email**: ✅ チェックを入れる
3. 「Create user」をクリック

### 3. 【重要】メール確認が未完了の場合

**SQL Editorで手動確認:**
```sql
-- 全ユーザーの状態確認
SELECT 
  email,
  email_confirmed_at IS NOT NULL as is_confirmed,
  created_at,
  last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC;

-- 手動でメール確認を完了
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

### 4. 【データベース】テーブル作成

**マイグレーションSQL実行:**

Supabase SQL Editorで以下のファイルを順番に実行：
1. `supabase-migration-step1.sql`
2. `supabase-migration-step2.sql`
3. `supabase-migration-step3.sql`
4. `supabase-migration-step4.sql`
5. `supabase-migration-step5.sql`
6. `supabase-migration-step6.sql`
7. `supabase-migration-step7.sql`

### 5. 【アプリ設定】ログイン情報の更新

#### A. 作成したテストユーザーでログイン
`app/login.tsx` の `handleDemoLogin` を更新:

```javascript
const handleDemoLogin = async () => {
  // 実際に作成したユーザー情報に変更
  const demoEmail = 'test@pomomate.local'; // または作成したメール
  const demoPassword = 'TestPassword123!'; // または設定したパスワード
  
  try {
    await login(demoEmail, demoPassword);
  } catch (error) {
    Alert.alert('ログインエラー', error.message);
  }
};
```

#### B. 認証サービスも更新
`src/services/authService.unified.ts`:

```javascript
static async loginAsDemo(): Promise<AuthResult> {
  return this.login('test@pomomate.local', 'TestPassword123!');
}
```

## 🧪 テスト手順

### 1. 手動ユーザー作成後のテスト

```bash
# テストファイルを更新
# test-demo-auth.js の7-8行目を実際のメール/パスワードに変更
node test-demo-auth.js
```

### 2. アプリでのテスト

1. アプリを起動
2. 「デモユーザーでログイン」ボタンをクリック
3. 成功すればダッシュボードに移動

### 3. 新規登録のテスト

1. 新しいメールアドレスで登録
2. メール確認リンクをクリック
3. ログインを試行

## 🎯 即座に解決する方法

**最も確実な方法:**

### Step 1: Supabaseでユーザー作成
```
Authentication → Users → Add user
Email: demo@pomomate.app
Password: DemoPassword123!
Email Confirm: ✅
```

### Step 2: アプリのコードを更新
```javascript
// app/login.tsx
const demoEmail = 'demo@pomomate.app';
const demoPassword = 'DemoPassword123!';
```

### Step 3: テスト実行
```bash
# 認証テスト
node test-demo-auth.js

# アプリでログインテスト
npm start
```

## 🔧 よくある問題と解決法

### 問題1: "Invalid login credentials"
**原因**: ユーザーが存在しない、またはパスワードが間違っている
**解決**: 上記の手動ユーザー作成を実行

### 問題2: "Email not confirmed"
**原因**: メール確認が未完了
**解決**: SQLでemail_confirmed_atを手動設定

### 問題3: "User not found"
**原因**: 間違ったメールアドレス
**解決**: Supabaseダッシュボードでメールアドレスを確認

### 問題4: "relation does not exist"
**原因**: データベーステーブルが未作成
**解決**: マイグレーションSQLを実行

## ✅ 成功確認チェックリスト

- [ ] Supabaseダッシュボードでユーザーが表示される
- [ ] ユーザーの「Confirmed」が✅になっている  
- [ ] `node test-demo-auth.js`が成功する
- [ ] アプリでデモログインが成功する
- [ ] ダッシュボード画面に移動する

この手順により、ログイン問題が解決されるはずです。