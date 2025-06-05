# Resend メール送信トラブルシューティング

## 🔍 確認手順

### 1. Resendダッシュボードで確認

1. **https://resend.com/emails** にアクセス
2. 送信履歴を確認してください

**質問：**
- [ ] メールの送信履歴は表示されていますか？
- [ ] ステータスは何になっていますか？（Delivered/Failed/Bounced）
- [ ] エラーメッセージは表示されていますか？

### 2. Supabase設定の再確認

Supabaseダッシュボード → Settings → Auth → SMTP Settings

現在の設定を確認：
```
Enable Custom SMTP: ON
Host: smtp.resend.com
Port: 587
Username: resend
Password: re_xxxxxxxxxx (APIキー)
Sender email: info@pomomate.app
Sender name: PomoMate
```

**確認ポイント：**
- [ ] APIキーの前後に余分なスペースがない
- [ ] APIキーは `re_` で始まっている
- [ ] Sender emailは正確に `info@pomomate.app`

### 3. APIキーの権限確認

Resendダッシュボード → API Keys

**確認事項：**
- [ ] APIキーのPermissionは「Full access」になっているか
- [ ] Domainは「pomomate.app」が選択されているか
- [ ] APIキーは有効（Active）になっているか

### 4. ドメイン認証の確認

Resendダッシュボード → Domains

**pomomate.app のステータス：**
- [ ] Status: Verified ✅ になっているか
- [ ] 3つのDNSレコードすべてに ✅ マークがついているか

### 5. ブラウザコンソールでのエラー確認

テストページでF12を押してコンソールを開き、エラーメッセージを確認してください。

## 🛠️ 解決策

### もしResendダッシュボードにメールが表示されない場合

**Supabase側の問題の可能性：**

1. **Supabaseで一度SMTP設定を無効化して再度有効化**
   - Enable Custom SMTP を OFF → Save
   - もう一度 ON にして設定を入れ直す → Save

2. **APIキーを再作成**
   - Resendで新しいAPIキーを作成
   - Supabaseに新しいキーを設定

### もしResendダッシュボードでFailedになっている場合

エラーメッセージを教えてください。よくあるエラー：

1. **"Invalid sender email"**
   → Sender emailの設定を確認

2. **"Domain not verified"**
   → DNSレコードの再確認

3. **"Rate limit exceeded"**
   → 少し時間をおいて再試行

## 📝 デバッグ情報収集

以下の情報を教えてください：

1. **Resendダッシュボードの状況**
   - メール送信履歴の有無
   - エラーメッセージ

2. **ブラウザコンソールのエラー**
   - 赤いエラーメッセージ

3. **Supabase Logs**
   - Supabaseダッシュボード → Logs → Auth
   - 最近のエラーログ

この情報があれば、問題を特定して解決できます！