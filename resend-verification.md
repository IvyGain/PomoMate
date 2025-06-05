# Resend ドメイン認証の確認

## ✅ DNSレコード追加完了！

## 🔍 次のステップ：ドメイン認証

### 1. Resendでドメイン認証を確認

1. **Resendダッシュボード** → **Domains**
2. `pomomate.app` の横にある **「Verify DNS records」** ボタンをクリック
3. 認証状態を確認：
   - ⏳ **Pending**: DNSが反映中（最大48時間）
   - ✅ **Verified**: 認証完了！

### 2. 認証が完了したら

#### APIキーを作成

1. **API Keys** → **「+ Create API Key」**
2. 設定：
   ```
   Name: Supabase Production
   Permission: Full access
   Domain: pomomate.app (選択)
   ```
3. **「Create」** をクリック
4. **⚠️ APIキーをコピー（一度しか表示されません！）**

### 3. SupabaseにSMTP設定

1. **Supabaseダッシュボード** → **Settings** → **Auth**
2. **SMTP Settings** セクション
3. 以下を入力：

```
Enable Custom SMTP: ON
Host: smtp.resend.com
Port: 587
Username: resend
Password: [コピーしたAPIキー]
Sender email: info@pomomate.app
Sender name: PomoMate
```

4. **「Save」** をクリック

## 🧪 動作テスト

```javascript
// ブラウザコンソールで実行
const testEmail = async () => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    'your-email@example.com', // あなたのメールアドレスに変更
    {
      redirectTo: 'https://pomomate-lt8dny1oh-ivygains-projects.vercel.app/reset-password'
    }
  );
  
  if (error) {
    console.error('❌ エラー:', error);
  } else {
    console.log('✅ メール送信リクエスト成功！');
    console.log('📧 メールボックスを確認してください');
  }
};

// 実行
testEmail();
```

## 📊 送信状況の確認

1. **Resendダッシュボード** → **Emails**
2. 送信履歴を確認：
   - **Delivered**: 配信成功
   - **Failed**: 配信失敗（エラー詳細を確認）

## ⏰ タイミング

- **DNS反映**: 通常5-30分（最大48時間）
- **すぐに確認**: 「Verify DNS records」を何度でもクリック可能

## 🎯 現在の状況

Resendダッシュボードで現在のステータスを教えてください：
- [ ] DNS認証が「Verified」になっている
- [ ] APIキーを作成済み
- [ ] Supabaseに設定済み

どの段階にいるか教えていただければ、次のステップをサポートします！