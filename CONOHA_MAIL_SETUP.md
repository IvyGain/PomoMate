# ConoHaメールサーバーでSupabaseメール送信設定

## なぜResendを勧めたのか？

### 外部サービスのメリット
1. **到達率が高い** - 大手サービスは信頼性が高く、迷惑メール判定されにくい
2. **設定が簡単** - APIキーだけで設定完了
3. **監視機能** - 送信状況、開封率などの統計が見られる
4. **スケーラビリティ** - 大量送信時も安定

### ConoHaメールサーバーのメリット
1. **追加費用なし** - すでに契約済みなら無料
2. **完全な制御** - 自分のサーバーで管理
3. **プライバシー** - データが外部サービスを経由しない

## ConoHaメールサーバーの設定方法

### 1. ConoHaでメールアドレスの確認

ConoHaコントロールパネルで以下を確認：
- メールアドレス: info@pomomate.app
- SMTPサーバー: mail.pomomate.app （または提供されたホスト名）
- SMTPポート: 587（STARTTLS）または 465（SSL）
- 認証方式: SMTP AUTH

### 2. Supabaseでの設定

```
Host: mail.pomomate.app （ConoHaで提供されたSMTPサーバー）
Port: 587
Username: info@pomomate.app
Password: [メールアドレスのパスワード]
Sender email: info@pomomate.app
Sender name: PomoMate
```

### 3. 重要な設定確認

#### SPFレコードの設定
DNSに以下を追加（ConoHaのDNS管理画面）：
```
TXT @ "v=spf1 a mx include:conoha.jp ~all"
```

#### ポート25ブロック（OP25B）対策
多くのISPはポート25をブロックしているため、587または465を使用

### 4. トラブルシューティング

#### ❌ Connection refused
```
# 別のポートを試す
Port: 465 (SSL/TLS)
Port: 587 (STARTTLS)
Port: 2525 (代替SMTP)
```

#### ❌ Authentication failed
```
# 認証情報の確認
- メールアドレス全体をユーザー名に使用
- パスワードは大文字小文字を区別
- 特殊文字のエスケープに注意
```

#### ❌ メールが届かない/迷惑メールになる
```
# DNSレコードの追加
SPF: "v=spf1 a mx ~all"
DKIM: ConoHaで提供される場合は設定
PTR: 逆引きDNSの設定確認
```

### 5. テスト方法

```javascript
// 1. まずSMTP接続をテスト（Node.js）
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.pomomate.app',
  port: 587,
  secure: false,
  auth: {
    user: 'info@pomomate.app',
    pass: 'your-password'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('接続エラー:', error);
  } else {
    console.log('SMTP接続成功！');
  }
});
```

### 6. ConoHaメールサーバーを使う際の注意点

#### メリット ✅
- 追加費用なし
- データの完全な制御
- 独自ドメインの信頼性

#### デメリット ⚠️
- 送信制限がある場合がある（時間あたりの送信数）
- IPレピュテーション管理が必要
- 迷惑メール対策を自分で行う必要がある
- 大量送信時のパフォーマンス

### 7. ハイブリッド運用の提案

開発・テスト環境：ConoHaメールサーバー
本番環境：Resend/SendGrid（到達率重視）

### 8. 設定手順まとめ

1. ConoHaコントロールパネルでSMTP情報を確認
2. SupabaseにSMTP設定を入力
3. SPFレコードを設定
4. テストメールを送信
5. 問題があればポートや認証方式を調整

## 結論

ConoHaメールサーバーで十分運用可能です！まずはConoHaの設定を試してみて、問題があれば外部サービスを検討するのが良いでしょう。