# デモアカウント作成手順

## 方法1: Supabase Dashboard から作成（推奨）

1. **Supabaseダッシュボードにログイン**
   - https://app.supabase.com

2. **Authentication → Users タブに移動**

3. **「Invite user」ボタンをクリック**

4. **以下の情報を入力:**
   - Email: `demo@example.com`
   - Password: `demo123456`
   - ✅ Auto Confirm User（チェックを入れる）

5. **「Send invitation」をクリック**

## 方法2: Supabase SQL Editor から作成

1. **Supabaseダッシュボード → SQL Editor**

2. **新しいクエリで以下を実行:**

```sql
-- デモユーザーの存在確認
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'demo@example.com';
```

3. **ユーザーが存在しない場合、手動で作成が必要**

## 方法3: Node.jsスクリプトで作成

以下のスクリプトを使用してデモアカウントを作成できます。