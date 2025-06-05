# Vercel × Supabase リダイレクトURL設定ガイド

## 🎯 設定場所

**注意**: この設定は **Supabaseダッシュボード** で行います（Vercelではありません）

## 📍 Supabaseダッシュボードでの設定手順

### 1. Supabaseダッシュボードにアクセス
1. [https://supabase.com/dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクト `xjxgapahcookarqiwjww` を選択

### 2. Authentication → URL Configuration に移動
左メニュー: `Authentication` → `URL Configuration`

### 3. 以下のURLを設定

#### A. Site URL
```
https://pomomate-p0iya2bod-ivygains-projects.vercel.app
```

#### B. Redirect URLs（以下をすべて追加）
```
https://pomomate-p0iya2bod-ivygains-projects.vercel.app/**
https://pomomate-p0iya2bod-ivygains-projects.vercel.app/email-confirmed
https://pomomate-p0iya2bod-ivygains-projects.vercel.app/reset-password
http://localhost:8081/**
http://localhost:8081/email-confirmed
http://localhost:8081/reset-password
```

## 🖼️ 設定画面の例

```
┌─ URL Configuration ─────────────────────┐
│                                         │
│ Site URL                                │
│ https://pomomate-p0iya2bod-ivygains-... │
│                                         │
│ Redirect URLs                           │
│ https://pomomate-p0iya2bod-ivygains-... │
│ https://pomomate-p0iya2bod-ivygains-... │
│ http://localhost:8081/**                │
│ http://localhost:8081/email-confirmed   │
│                                         │
│ [Save] ボタンをクリック                    │
└─────────────────────────────────────────┘
```

## 📝 各URLの説明

### Site URL
- **用途**: Supabaseがデフォルトで使用するベースURL
- **設定値**: `https://pomomate-p0iya2bod-ivygains-projects.vercel.app`

### Redirect URLs
- **`/**`**: すべてのページを許可（ワイルドカード）
- **`/email-confirmed`**: メール確認後のリダイレクト先
- **`/reset-password`**: パスワードリセット後のリダイレクト先
- **localhost**: 開発環境用

## ⚠️ 重要な注意点

1. **必ずすべてのURLを追加**
   - 一つでも漏れるとエラーになります
   
2. **HTTPSを使用**
   - 本番環境では必ずHTTPS（`https://`）

3. **大文字小文字を正確に**
   - URLは完全一致である必要があります

4. **保存を忘れずに**
   - 設定後、必ず「Save」ボタンをクリック

## 🔧 現在のエラーを解決する設定

あなたの場合、以下を **Supabaseダッシュボード** に設定してください：

### Site URL
```
https://pomomate-p0iya2bod-ivygains-projects.vercel.app
```

### Redirect URLs
```
https://pomomate-p0iya2bod-ivygains-projects.vercel.app/**
https://pomomate-p0iya2bod-ivygains-projects.vercel.app/email-confirmed
```

## 🚀 設定後の確認方法

### 1. 新しい確認メールをテスト
1. 新規ユーザーを登録
2. 届いたメールのリンクをクリック
3. 正常にリダイレクトされることを確認

### 2. 既存ユーザーの手動確認
```sql
-- Supabase SQL Editorで実行
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'romancemorio+test@gmail.com';
```

## 📞 Vercel設定は不要

**Vercel側では特別な設定は必要ありません。**
- Vercelは自動的にすべてのルートを処理
- Next.js/Expo Routerが適切にページをレンダリング

## 🔍 設定確認チェックリスト

- [ ] Supabaseダッシュボードにログイン済み
- [ ] プロジェクト `xjxgapahcookarqiwjww` を選択済み
- [ ] Authentication → URL Configuration に移動済み
- [ ] Site URL を設定済み
- [ ] Redirect URLs をすべて追加済み
- [ ] 「Save」ボタンをクリック済み

この設定により、メール確認リンクのエラーが解決されるはずです。