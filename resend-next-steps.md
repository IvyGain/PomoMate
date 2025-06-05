# Resend 次のステップ

## ✅ 完了：アカウント作成

## 🎯 次の手順：ドメイン追加

### 1. Resendダッシュボードでドメイン追加

1. **Resendダッシュボード**にログイン
   - https://resend.com/domains

2. **「Add Domain」**ボタンをクリック

3. **ドメイン入力**
   ```
   pomomate.app
   ```
   
4. **「Add」**をクリック

### 2. 表示されるDNSレコードをメモ

Resendが3つのDNSレコードを表示します：

```
1. TXT レコード（ドメイン認証用）
   Name: _resend
   Value: resend-verification=xxxxxxxxx

2. TXT レコード（SPF）
   Name: @ (または空欄)
   Value: v=spf1 include:amazonses.com ~all

3. CNAME レコード（DKIM）
   Name: resend._domainkey
   Value: resend.domainkey.xxxxxx.amazonses.com
```

## 📝 重要な確認事項

表示されたDNSレコードの値を教えていただければ、ConoHaでの正確な設定方法をご案内します。特に：

1. **resend-verification** の値（xxxxxxx部分）
2. **DKIM CNAMEの値**（resend.domainkey.以降の部分）

これらの値は各アカウント固有なので、正確に設定する必要があります。

## 🚀 準備できたら

DNSレコードの値を共有していただければ：
1. ConoHaでの具体的な設定手順を作成
2. SPFレコードの統合方法を説明
3. 設定完了後のテスト方法を案内

画面に表示されているDNSレコードの情報を教えてください！