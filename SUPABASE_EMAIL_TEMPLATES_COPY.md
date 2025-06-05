# Supabase メールテンプレート（コピペ用）

## 1. Confirm signup（サインアップ確認）

**Subject（件名）:**
```
PomoMateへようこそ - メールアドレスの確認
```

**Body（本文）:**
```html
<h2>PomoMateへようこそ！</h2>
<p>ご登録ありがとうございます。以下のボタンをクリックしてメールアドレスを確認してください。</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">メールアドレスを確認</a></p>
<p>リンクが機能しない場合は、以下のURLをブラウザにコピー＆ペーストしてください：</p>
<p style="background-color: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">{{ .ConfirmationURL }}</p>
<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">このメールに心当たりがない場合は、無視していただいて構いません。</p>
```

---

## 2. Reset Password（パスワードリセット）

**Subject（件名）:**
```
PomoMate - パスワードリセットのご案内
```

**Body（本文）:**
```html
<h2>パスワードリセット</h2>
<p>パスワードをリセットするには、以下のボタンをクリックしてください。</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">パスワードをリセット</a></p>
<p>リンクが機能しない場合は、以下のURLをブラウザにコピー＆ペーストしてください：</p>
<p style="background-color: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">{{ .ConfirmationURL }}</p>
<p style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
<strong>⚠️ 重要：</strong>このリンクは1時間で有効期限が切れます。
</p>
<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">このメールに心当たりがない場合は、無視していただいて構いません。</p>
```

---

## 3. Magic Link（マジックリンク）

**Subject（件名）:**
```
PomoMate - ログインリンク
```

**Body（本文）:**
```html
<h2>ワンクリックでログイン</h2>
<p>以下のボタンをクリックして、PomoMateにログインしてください。</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">ログイン</a></p>
<p>リンクが機能しない場合は、以下のURLをブラウザにコピー＆ペーストしてください：</p>
<p style="background-color: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">{{ .ConfirmationURL }}</p>
<p style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">
<strong>🔒 セキュリティ情報：</strong>このリンクは15分間有効で、1回のみ使用可能です。
</p>
<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">このメールに心当たりがない場合は、無視していただいて構いません。</p>
```

---

## 4. Invite User（ユーザー招待）

**Subject（件名）:**
```
PomoMateへご招待！
```

**Body（本文）:**
```html
<h2>PomoMateへご招待！</h2>
<p>友達からPomoMateに招待されました。今すぐ参加して、一緒にポモドーロ・セッションを楽しみましょう！</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">招待を受けてアカウント作成</a></p>
<p>リンクが機能しない場合は、以下のURLをブラウザにコピー＆ペーストしてください：</p>
<p style="background-color: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">{{ .ConfirmationURL }}</p>
<div style="background-color: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0;">
<h3>🚀 PomoMateの特徴：</h3>
<ul>
<li>25分集中 + 5分休憩のポモドーロ・テクニック</li>
<li>レベルアップ、アチーブメント、キャラクター進化</li>
<li>友達と一緒に集中タイムを共有</li>
<li>楽しいミニゲームでリフレッシュ</li>
</ul>
</div>
<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">招待リンクは7日間有効です。</p>
```

---

## 5. Change Email Address（メールアドレス変更）

**Subject（件名）:**
```
PomoMate - メールアドレス変更の確認
```

**Body（本文）:**
```html
<h2>メールアドレス変更の確認</h2>
<p>メールアドレスの変更をリクエストされました。変更を確定するには、以下のボタンをクリックしてください。</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">メールアドレス変更を確認</a></p>
<p>リンクが機能しない場合は、以下のURLをブラウザにコピー＆ペーストしてください：</p>
<p style="background-color: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">{{ .ConfirmationURL }}</p>
<p style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
<strong>⚠️ 注意：</strong>このリンクをクリックすると、メールアドレスが変更されます。
</p>
<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">このメールに心当たりがない場合は、アカウントが不正にアクセスされている可能性があります。すぐにパスワードを変更してください。</p>
```

---

## 設定手順

1. **Supabaseダッシュボードにログイン**
2. **Authentication → Email Templates** に移動
3. 各テンプレートタイプを選択
4. **Subject** フィールドに件名をペースト
5. **Message** フィールドに本文（HTML）をペースト
6. **Save** をクリック

## 重要な注意事項

- `{{ .ConfirmationURL }}` は変更しないでください（Supabaseが自動的にURLを挿入します）
- HTMLタグは必要最小限にしています（Supabaseのメールクライアント互換性のため）
- スタイルはインラインで記述しています（多くのメールクライアントで正しく表示されるため）

## カスタマイズのヒント

- **色の変更**: `#6366f1`（インディゴ）を好みの色に変更
- **パディング/マージン**: 必要に応じて調整
- **フォントサイズ**: 読みやすさを考慮して調整