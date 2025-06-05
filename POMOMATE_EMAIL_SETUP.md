# PomoMate.app メール設定ガイド

## info@pomomate.app からメールを送信する設定

### 1. おすすめのメールサービス（簡単な順）

#### 🥇 Resend（最も簡単・推奨）

1. **アカウント作成**
   - https://resend.com にアクセス
   - 無料アカウント作成（月3,000通まで無料）

2. **ドメイン追加**
   - Dashboard → Domains → Add Domain
   - `pomomate.app` を入力

3. **DNS設定**
   - Resendが表示するDNSレコードをドメインに追加：
   ```
   TXT  _resend  "resend-verification=xxxxx"
   TXT  @        "v=spf1 include:amazonses.com ~all"
   CNAME resend._domainkey  resend.domainkey.xxxxx.amazonses.com
   ```

4. **APIキー取得**
   - API Keys → Create API Key
   - 権限: `Send emails` を選択

5. **Supabase設定**
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [取得したAPIキー]
   Sender email: info@pomomate.app
   Sender name: PomoMate
   ```

#### 🥈 SendGrid（安定性重視）

1. **アカウント作成**
   - https://sendgrid.com
   - 無料プラン（日100通まで）

2. **Sender Authentication**
   - Settings → Sender Authentication → Domain Authentication
   - `pomomate.app` を追加

3. **DNS設定**
   ```
   CNAME em1234  u1234567.wl123.sendgrid.net
   CNAME s1._domainkey  s1.domainkey.u1234567.wl123.sendgrid.net
   CNAME s2._domainkey  s2.domainkey.u1234567.wl123.sendgrid.net
   ```

4. **APIキー作成**
   - Settings → API Keys → Create API Key
   - Full Access を選択

5. **Supabase設定**
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [SendGrid APIキー]
   Sender email: info@pomomate.app
   Sender name: PomoMate
   ```

### 2. ドメインプロバイダーでのDNS設定

#### お名前.com の場合
1. DNS設定 → DNS設定/転送設定
2. 「DNSレコード設定を利用する」を選択
3. 各レコードを追加

#### Cloudflare の場合
1. DNS → Records
2. 各レコードを追加（Proxyはオフに）

### 3. Supabaseでの設定手順

```bash
# 1. Supabaseダッシュボードにログイン
# 2. Settings → Auth → SMTP Settings

# 3. 以下を設定：
Enable Custom SMTP: ON
Host: [上記の値]
Port: 587
User: [上記の値]
Pass: [APIキー]
Sender email: info@pomomate.app
Sender name: PomoMate

# 4. Save をクリック
```

### 4. メール送信テスト

```javascript
// テスト用スクリプト
const testEmail = async () => {
  const { error } = await supabase.auth.resetPasswordForEmail(
    'your-test-email@example.com',
    { 
      redirectTo: 'https://pomomate-lt8dny1oh-ivygains-projects.vercel.app/reset-password' 
    }
  );
  
  if (error) {
    console.error('メール送信エラー:', error);
  } else {
    console.log('テストメール送信成功！');
  }
};
```

### 5. よくあるエラーと解決方法

#### ❌ "Invalid sender email"
→ Sender emailが `info@pomomate.app` になっているか確認

#### ❌ "SMTP authentication failed"
→ APIキーが正しくコピーされているか確認

#### ❌ "Connection refused"
→ ポートを 465（SSL）または 2525 に変更

#### ❌ メールが届かない
→ DNS設定が反映されるまで最大48時間かかる場合があります

### 6. 推奨設定

```
✅ Resend を使用（最も簡単）
✅ info@pomomate.app を送信元に設定
✅ SPFレコードを必ず設定
✅ テストは個人のメールアドレスで実施
```

### 7. 設定完了チェックリスト

- [ ] メールサービスのアカウント作成
- [ ] ドメイン認証の設定
- [ ] DNS レコードの追加
- [ ] Supabase SMTP設定
- [ ] テストメールの送信成功
- [ ] 本番環境での動作確認

何か不明な点があれば教えてください！