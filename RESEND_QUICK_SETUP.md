# Resend クイックセットアップガイド

## 🚀 15分でResendを設定

### 1. Resendアカウント作成（3分）

1. **https://resend.com** にアクセス
2. **Sign up** をクリック
3. メールアドレスとパスワードで登録
4. メール認証を完了

### 2. ドメイン追加（5分）

1. **Resendダッシュボード** にログイン
2. **Domains** → **Add Domain** をクリック
3. `pomomate.app` を入力して **Add** をクリック

### 3. DNS設定（5分）

Resendが表示する3つのDNSレコードをConoHaのDNS設定に追加：

#### ConoHaコントロールパネルでの設定
1. **DNS** → **ドメイン管理**
2. `pomomate.app` を選択
3. 以下のレコードを追加：

```
# 1. ドメイン認証用
タイプ: TXT
名前: _resend
値: resend-verification=xxxxxxxxx

# 2. SPFレコード（既存のSPFと統合）
タイプ: TXT
名前: @
値: v=spf1 include:amazonses.com include:conoha.jp ~all

# 3. DKIM認証
タイプ: CNAME
名前: resend._domainkey
値: resend.domainkey.xxxxxx.amazonses.com
```

⚠️ **重要**: SPFレコードは1つだけにする必要があるので、ConoHaとResendの両方を含める

### 4. ドメイン認証の確認（2分）

1. Resendダッシュボードに戻る
2. **Verify DNS Records** をクリック
3. ✅ マークが表示されるまで待つ（通常数分）

### 5. APIキーの作成（1分）

1. **API Keys** → **Create API Key**
2. 名前: `Supabase Production`
3. Permission: `Full access`
4. **Create** をクリック
5. **APIキーをコピー**（一度しか表示されません！）

### 6. Supabaseに設定（2分）

1. **Supabaseダッシュボード** → **Settings** → **Auth**
2. **SMTP Settings** を開く
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

4. **Save** をクリック

### 7. テスト送信（2分）

```javascript
// ブラウザのコンソールで実行
const testResend = async () => {
  const { error } = await supabase.auth.resetPasswordForEmail(
    'あなたのメールアドレス@example.com'
  );
  
  if (error) {
    console.error('エラー:', error);
  } else {
    console.log('✅ テストメール送信成功！');
  }
};

testResend();
```

## 🎯 使い分け戦略

### Resendを使う場面
- ✉️ **認証メール**（登録確認、パスワードリセット）
- 📊 **重要な通知**（セキュリティアラート）
- 🎯 **大量送信**（ニュースレター）

### ConoHaメールを使う場面
- 💬 **個別対応**（サポートメール）
- 📝 **内部通知**（管理者向け）
- 🔒 **機密情報**（請求書など）

## 📊 Resendダッシュボード活用

### メール統計の確認
- 送信数
- 配信成功率
- エラー分析

### Webhook設定（オプション）
```javascript
// メールイベントを受信
POST https://yourdomain.com/api/resend-webhook
{
  "type": "email.sent",
  "data": {
    "email_id": "xxx",
    "to": "user@example.com"
  }
}
```

## ⚡ トラブルシューティング

### DNS認証が失敗する
→ DNSの反映に最大48時間かかる場合があります

### APIキーエラー
→ キーに余分なスペースが入っていないか確認

### メールが届かない
→ Resendダッシュボードでエラーログを確認

## 🎉 設定完了チェックリスト

- [ ] Resendアカウント作成
- [ ] ドメイン追加（pomomate.app）
- [ ] DNS設定（3つのレコード）
- [ ] ドメイン認証確認
- [ ] APIキー作成
- [ ] Supabase SMTP設定
- [ ] テストメール送信成功

これで月3,000通まで無料で、高い到達率のメール送信が可能になります！