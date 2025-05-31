# PomoMate メールテンプレート設定ガイド

## 1. Supabaseダッシュボードでの設定

### メール送信者の設定
1. **Settings** → **Project Settings** を開く
2. **Auth** セクションで以下を設定：
   - **Site URL**: `http://localhost:8081` (開発環境)
   - **Redirect URLs**: 
     ```
     http://localhost:8081/**
     http://localhost:8081/email-confirmed
     ```

### メールテンプレートの設定
1. **Authentication** → **Email Templates** を開く
2. 各テンプレートを以下のように更新：

## 2. 確認メール（Confirm signup）テンプレート

**Subject:**
```
🍅 PomoMateへようこそ！アカウント登録を完了しましょう
```

**Email Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PomoMate - アカウント確認</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 20px 20px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 32px;">🍅 PomoMate</h1>
      <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">集中力を高める、新しい習慣</p>
    </div>
    
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">
        ようこそ、{{ .Email }}さん！🎉
      </h2>
      
      <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        PomoMateへの登録ありがとうございます！<br>
        あなたの生産性向上の旅が、今まさに始まろうとしています。
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
          アカウントを有効化する
        </a>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 30px 0;">
        <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">
          🚀 PomoMateで何ができる？
        </h3>
        <ul style="color: #666; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>🎯 ポモドーロタイマーで集中力を最大化</li>
          <li>🐣 可愛いキャラクターを育てながら楽しく継続</li>
          <li>📊 詳細な統計で自分の成長を可視化</li>
          <li>👥 友達とチームセッションで一緒に頑張る</li>
          <li>🏆 実績を解除してモチベーション維持</li>
        </ul>
      </div>
      
      <p style="color: #999; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
        このリンクは24時間有効です。<br>
        ボタンが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：
      </p>
      
      <p style="color: #999; font-size: 12px; word-break: break-all; text-align: center; margin: 10px 0;">
        {{ .ConfirmationURL }}
      </p>
    </div>
    
    <div style="text-align: center; padding: 20px;">
      <p style="color: #999; font-size: 14px; margin: 0;">
        © 2024 PomoMate. Focus. Grow. Achieve.
      </p>
    </div>
  </div>
</body>
</html>
```

## 3. パスワードリセットメール（Reset Password）

**Subject:**
```
🔐 PomoMate - パスワードリセットのご案内
```

**Email Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PomoMate - パスワードリセット</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 20px 20px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 32px;">🍅 PomoMate</h1>
    </div>
    
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">
        パスワードをリセットしましょう 🔑
      </h2>
      
      <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        パスワードリセットのリクエストを受け付けました。<br>
        下記のボタンをクリックして、新しいパスワードを設定してください。
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
          新しいパスワードを設定
        </a>
      </div>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin: 20px 0;">
        <p style="color: #856404; margin: 0; font-size: 14px;">
          <strong>⚠️ 重要：</strong> このリクエストに心当たりがない場合は、このメールを無視してください。パスワードは変更されません。
        </p>
      </div>
      
      <p style="color: #999; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
        このリンクは1時間有効です。
      </p>
    </div>
  </div>
</body>
</html>
```

## 4. Magic Link（パスワードレスログイン）

**Subject:**
```
✨ PomoMate - ワンクリックでログイン
```

**Email Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PomoMate - マジックリンク</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 20px 20px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 32px;">🍅 PomoMate</h1>
    </div>
    
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">
        おかえりなさい！✨
      </h2>
      
      <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        下のボタンをクリックするだけで、すぐにPomoMateにログインできます。
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 16px 32px; border-radius: 10px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
          ログインする
        </a>
      </div>
      
      <p style="color: #999; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
        このリンクは1時間有効です。
      </p>
    </div>
  </div>
</body>
</html>
```

## 5. 実装手順

1. Supabaseダッシュボードで上記のテンプレートを設定
2. **Authentication** → **URL Configuration** で以下を設定：
   - **Site URL**: `http://localhost:8081` (本番環境では実際のURLに変更)
   - **Redirect URLs**: 
     ```
     http://localhost:8081/**
     http://localhost:8081/email-confirmed
     ```

3. **Settings** → **Project Settings** → **SMTP Settings** で：
   - **Sender email**: `noreply@pomomate.app` に変更（カスタムドメインがある場合）
   - **Sender name**: `PomoMate` に変更

## 6. テスト方法

1. 新規登録を行う
2. メールが届くことを確認
3. メール内のリンクをクリック
4. `http://localhost:8081/email-confirmed` にリダイレクトされることを確認
5. ログイン画面から正常にログインできることを確認

## 注意事項

- 本番環境では必ず実際のドメインに変更すること
- SPF/DKIMレコードを設定してメール到達率を向上させること
- カスタムドメインメールを使用する場合は、Supabaseの有料プランが必要