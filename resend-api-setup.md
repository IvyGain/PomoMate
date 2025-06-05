# Resend APIキー作成とSupabase設定

## ✅ 完了：DNS認証 Verified！

## 🔑 APIキーの作成

### 1. Resendダッシュボードで作成

1. **API Keys** タブをクリック
2. **「+ Create API Key」** ボタンをクリック
3. 以下を設定：
   ```
   Key name: Supabase Production
   Permission: Full access
   Domain: pomomate.app (ドロップダウンから選択)
   ```
4. **「Create」** をクリック
5. **⚠️ 重要：表示されたAPIキーを必ずコピー！**
   - `re_xxxxxxxxxx` という形式
   - 一度しか表示されません

## 🔧 Supabaseに設定

### 1. Supabaseダッシュボードを開く

1. **Settings** → **Auth**
2. **SMTP Settings** セクションまでスクロール

### 2. 以下の値を入力

```
Enable Custom SMTP: ON（オンに切り替え）

Host: smtp.resend.com
Port: 587
Username: resend
Password: [コピーしたAPIキー（re_で始まる）]
Sender email: info@pomomate.app
Sender name: PomoMate
```

### 3. 保存

**「Save」** ボタンをクリック

## ✅ 設定確認チェックリスト

- [ ] APIキーを作成してコピーした
- [ ] Supabase SMTP設定を有効化した
- [ ] すべての項目を正しく入力した
- [ ] 保存ボタンをクリックした

## 🧪 最終テスト

ブラウザのコンソールで実行：

```javascript
// テストメール送信
const sendTestEmail = async () => {
  console.log('📧 テストメール送信中...');
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    'あなたのメールアドレス@gmail.com' // ← ここを変更
  );
  
  if (error) {
    console.error('❌ エラー:', error);
    console.log('エラー詳細:', error.message);
  } else {
    console.log('✅ 送信成功！メールボックスを確認してください');
    console.log('📮 送信先を確認してください');
  }
};

// 実行
sendTestEmail();
```

## 📊 送信確認

1. **メールボックスを確認**
   - 件名：「Reset Your Password」または日本語テンプレート
   - 送信元：info@pomomate.app

2. **Resendダッシュボードで確認**
   - Emails タブで送信履歴を確認
   - ステータスが「Delivered」になっているか

## 🎯 現在の状況

どこまで完了していますか？
- [ ] APIキー作成済み
- [ ] Supabase設定済み
- [ ] テストメール送信済み
- [ ] メール受信確認済み

状況を教えてください！