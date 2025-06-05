# Supabase カスタムSMTP設定ガイド

## 独自ドメインからメールを送信する設定

### 1. SMTP設定の準備

#### 必要な情報
- SMTPホスト名
- SMTPポート番号（通常: 587 または 465）
- SMTPユーザー名
- SMTPパスワード
- 送信元メールアドレス（例: noreply@yourdomain.com）

### 2. 主要なメールサービスの設定例

#### SendGrid（推奨）
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [SendGrid APIキー]
```

#### Gmail（Google Workspace）
```
Host: smtp.gmail.com
Port: 587
Username: your-email@yourdomain.com
Password: [アプリパスワード]
```

#### Amazon SES
```
Host: email-smtp.[region].amazonaws.com
Port: 587
Username: [SMTP認証情報のユーザー名]
Password: [SMTP認証情報のパスワード]
```

### 3. Supabaseでの設定手順

1. **Supabaseダッシュボード** → **Settings** → **Auth**

2. **SMTP Settings** セクションを開く

3. **Enable Custom SMTP** をONにする

4. 以下の情報を入力：
   - **Host**: SMTPサーバーのホスト名
   - **Port**: ポート番号（587推奨）
   - **User**: SMTPユーザー名
   - **Password**: SMTPパスワード
   - **Sender email**: 送信元メールアドレス
   - **Sender name**: 送信者名（例: PomoMate）

5. **Save** をクリック

### 4. ドメイン認証の設定

#### SPFレコード
```
TXT @ "v=spf1 include:sendgrid.net ~all"
```

#### DKIMレコード
メールサービスプロバイダーから提供される値を設定

#### DMARCレコード
```
TXT _dmarc "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com"
```

### 5. トラブルシューティング

#### メールが送信されない場合

1. **SMTP設定の確認**
   - ホスト名、ポート、認証情報が正しいか
   - ファイアウォールでポートがブロックされていないか

2. **送信元アドレスの確認**
   - ドメインの所有権が確認されているか
   - SPF/DKIM/DMARCが正しく設定されているか

3. **Supabaseログの確認**
   - Dashboard → Logs → Auth logs でエラーを確認

4. **テストメールの送信**
   ```javascript
   // テスト用コード
   const { error } = await supabase.auth.resetPasswordForEmail(
     'test@example.com',
     { redirectTo: 'https://yourdomain.com/reset-password' }
   );
   ```

### 6. 無料の代替案

#### Resend（新しいサービス）
```
Host: smtp.resend.com
Port: 587
Username: resend
Password: [Resend APIキー]
```
- 月間3,000通まで無料
- 簡単なセットアップ

#### Mailgun
```
Host: smtp.mailgun.org
Port: 587
Username: postmaster@yourdomain.com
Password: [Mailgun パスワード]
```
- 月間5,000通まで無料（3ヶ月間）

### 7. 設定後の確認事項

- [ ] テストメールが正常に送信される
- [ ] メールが迷惑メールフォルダに入らない
- [ ] リンクが正しく機能する
- [ ] 送信者名とアドレスが正しく表示される

### 8. よくある問題

**Q: Connection refused エラー**
A: ポート番号を465（SSL）または2525に変更してみてください

**Q: Authentication failed エラー**
A: APIキーまたはパスワードが正しいか確認してください

**Q: メールが迷惑メールに入る**
A: SPF/DKIM設定を確認し、送信者評価を改善してください