# 🚨 Supabase緊急修復ガイド

## 現在の問題
- **エラー**: `"http: Server closed"` - APIサーバーが停止
- **原因**: 独自ドメインメール設定変更時の設定ミス
- **影響**: 認証メールが送信できない、アプリが動作しない可能性

## 🔧 即座に実行すべき修復手順

### ステップ1: Supabaseプロジェクトの状態確認
1. **Supabaseダッシュボードにアクセス**
   - https://app.supabase.com/project/xjxgapahcookarqiwjww

2. **Health Checkの確認**
   - 左サイドバー → Settings → General
   - "Service health" セクションを確認

### ステップ2: メール設定を安全な状態に戻す

#### 🚨 緊急対応：デフォルトメール設定に戻す
1. **Authentication → Settings → SMTP Settings**
2. **"Use Supabase SMTP"にチェック**（一時的に戻す）
3. **Custom SMTP設定をすべて削除**
4. **Save**をクリック

### ステップ3: プロジェクトの再起動
1. **Settings → General → Restart Project**
2. 数分待つ（完全に復旧するまで5-10分）

### ステップ4: 動作確認
```bash
# 接続テスト
curl -I https://xjxgapahcookarqiwjww.supabase.co/rest/v1/
```

## 📧 info@pomomate.app メール設定（修復後）

### 推奨：Resend.comを使用

1. **Resend アカウント作成**
   - https://resend.com（無料：月3,000通）

2. **DNS設定（クラウドフレアの場合）**
   ```
   TXT pomomate.app "resend._domainkey" "YOUR_DKIM_KEY"
   ```

3. **Supabase設定（修復後に設定）**
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Resend APIキー]
   Sender Email: info@pomomate.app
   Sender Name: PomoMate
   ```

## ⚠️ 重要な注意事項

### 設定変更時のベストプラクティス
- **段階的変更**: 一度に一つの設定のみ変更
- **バックアップ**: 変更前の設定をメモ
- **テスト**: 各変更後に動作確認

### 今後の予防策
1. **ステージング環境**で先にテスト
2. **本番環境**では慎重に変更
3. **ピーク時間外**に設定変更

## 🆘 緊急連絡先
- Supabase Support: https://supabase.com/support
- Supabase Status: https://status.supabase.com

**最優先**: まずSupabaseプロジェクトを復旧させることです！ 