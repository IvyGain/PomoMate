# Supabase メールテンプレート（日本語版）

## 1. 確認メール (Confirm signup)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #6366f1;
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background-color: #f8f9fa;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      background-color: #6366f1;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🍅 PomoMate</h1>
    <p>集中力を高め、生産性を向上させる</p>
  </div>
  
  <div class="content">
    <h2>ようこそ、PomoMateへ！</h2>
    
    <p>ご登録ありがとうございます。アカウントを有効化するには、以下のボタンをクリックしてメールアドレスを確認してください。</p>
    
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">メールアドレスを確認</a>
    </div>
    
    <p>ボタンが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：</p>
    <p style="background-color: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
      {{ .ConfirmationURL }}
    </p>
    
    <h3>PomoMateでできること：</h3>
    <ul>
      <li>🎯 ポモドーロ・テクニックで集中力アップ</li>
      <li>🎮 休憩中の楽しいミニゲーム</li>
      <li>📊 進捗の可視化と統計</li>
      <li>🏆 アチーブメントとキャラクター進化</li>
      <li>👥 友達とのチームセッション</li>
    </ul>
  </div>
  
  <div class="footer">
    <p>このメールに心当たりがない場合は、無視していただいて構いません。</p>
    <p>© 2024 PomoMate. All rights reserved.</p>
  </div>
</body>
</html>
```

## 2. パスワードリセット (Reset Password)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #6366f1;
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background-color: #f8f9fa;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      background-color: #ef4444;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .warning {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔐 パスワードリセット</h1>
    <p>PomoMate アカウントのパスワードをリセット</p>
  </div>
  
  <div class="content">
    <h2>パスワードリセットのリクエスト</h2>
    
    <p>パスワードリセットのリクエストを受け付けました。新しいパスワードを設定するには、以下のボタンをクリックしてください。</p>
    
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">パスワードをリセット</a>
    </div>
    
    <p>ボタンが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：</p>
    <p style="background-color: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
      {{ .ConfirmationURL }}
    </p>
    
    <div class="warning">
      <strong>⚠️ 重要：</strong>
      <ul style="margin: 10px 0;">
        <li>このリンクは1時間で有効期限が切れます</li>
        <li>セキュリティのため、リンクは1回のみ使用可能です</li>
        <li>パスワードは8文字以上で設定してください</li>
      </ul>
    </div>
    
    <h3>セキュリティのヒント：</h3>
    <ul>
      <li>🔒 大文字・小文字・数字を組み合わせた強力なパスワードを使用</li>
      <li>🚫 他のサービスと同じパスワードは避ける</li>
      <li>📝 パスワードマネージャーの使用を推奨</li>
    </ul>
  </div>
  
  <div class="footer">
    <p>このメールに心当たりがない場合は、お客様のアカウントは安全です。何も行う必要はありません。</p>
    <p>© 2024 PomoMate. All rights reserved.</p>
  </div>
</body>
</html>
```

## 3. 招待メール (Invite user)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #6366f1;
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background-color: #f8f9fa;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .feature-list {
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 PomoMateへご招待！</h1>
    <p>一緒に生産性を高めましょう</p>
  </div>
  
  <div class="content">
    <h2>PomoMateコミュニティへようこそ！</h2>
    
    <p>友達からPomoMateに招待されました。今すぐ参加して、一緒にポモドーロ・セッションを楽しみましょう！</p>
    
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">招待を受けてアカウント作成</a>
    </div>
    
    <p>ボタンが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：</p>
    <p style="background-color: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
      {{ .ConfirmationURL }}
    </p>
    
    <div class="feature-list">
      <h3>🚀 PomoMateの特徴：</h3>
      <ul>
        <li><strong>ポモドーロ・テクニック</strong> - 25分集中 + 5分休憩のサイクル</li>
        <li><strong>ゲーミフィケーション</strong> - レベルアップ、アチーブメント、キャラクター進化</li>
        <li><strong>チームセッション</strong> - 友達と一緒に集中タイムを共有</li>
        <li><strong>休憩ゲーム</strong> - 楽しいミニゲームでリフレッシュ</li>
        <li><strong>統計とインサイト</strong> - あなたの生産性を可視化</li>
      </ul>
    </div>
    
    <p style="text-align: center; font-style: italic; color: #666;">
      「一緒に頑張ると、もっと楽しい！」
    </p>
  </div>
  
  <div class="footer">
    <p>招待リンクは7日間有効です。</p>
    <p>© 2024 PomoMate. All rights reserved.</p>
  </div>
</body>
</html>
```

## 4. マジックリンク (Magic Link)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #6366f1;
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background-color: #f8f9fa;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .button {
      display: inline-block;
      background-color: #6366f1;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .security-notice {
      background-color: #e3f2fd;
      border: 1px solid #90caf9;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✨ マジックリンク</h1>
    <p>パスワード不要でログイン</p>
  </div>
  
  <div class="content">
    <h2>ワンクリックでログイン</h2>
    
    <p>以下のボタンをクリックして、PomoMateにログインしてください。</p>
    
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">ログイン</a>
    </div>
    
    <p>ボタンが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：</p>
    <p style="background-color: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
      {{ .ConfirmationURL }}
    </p>
    
    <div class="security-notice">
      <strong>🔒 セキュリティ情報：</strong>
      <ul style="margin: 10px 0;">
        <li>このリンクは15分間有効です</li>
        <li>1回のみ使用可能です</li>
        <li>リクエストしたデバイスでのみ使用してください</li>
      </ul>
    </div>
  </div>
  
  <div class="footer">
    <p>このメールに心当たりがない場合は、無視していただいて構いません。</p>
    <p>© 2024 PomoMate. All rights reserved.</p>
  </div>
</body>
</html>
```

## テンプレート設定方法

1. Supabaseダッシュボード → Authentication → Email Templates
2. 各テンプレートタイプを選択
3. 上記のHTMLコードをコピー＆ペースト
4. 「Save」をクリック

## カスタマイズのポイント

- **ブランドカラー**: `#6366f1` を変更
- **フォント**: font-familyを調整
- **ロゴ**: 画像URLを追加可能
- **文言**: ビジネスに合わせて調整