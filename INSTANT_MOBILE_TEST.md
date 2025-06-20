# 📱 今すぐスマホでテスト！

## 🚀 手順（5分でできます）

### 1. Expo Go をインストール
- **iPhone**: App Store で「Expo Go」
- **Android**: Google Play で「Expo Go」

### 2. 開発サーバーを起動
ターミナルで以下を実行：
```bash
cd "/Users/mashimaro/Documents/Workspace/PomoMate"
npx expo start --tunnel
```

### 3. QRコードをスキャン
- Expo Goアプリでターミナルに表示されるQRコードをスキャン

## 🎮 すぐに試せる機能

### ログイン
- Email: `demo@pomodoroplay.com`
- Password: `demo123`
（または任意のメール・パスワード）

### ポモドーロタイマー
1. **Timer** タブでタイマー開始
2. 25分集中 → 5分休憩のサイクル
3. セッション完了でキャラクター成長

### キャラクター育成
1. **Character** タブでキャラクター確認
2. セッション完了で経験値獲得
3. レベルアップとキャラクター進化

### アチーブメント
1. **Achievements** タブで目標確認
2. 条件達成で解除
3. コインと経験値の報酬

### 統計確認
1. **Stats** タブで進捗表示
2. 日/週/月の集中時間グラフ
3. 連続記録の確認

## 🔧 デバッグ情報

### Expo Goで確認できること
- Console ログ（Developer Tools）
- パフォーマンス情報
- エラーメッセージ

### 期待される動作
- ✅ スムーズな画面遷移
- ✅ タイマーの正確な動作
- ✅ キャラクターアニメーション
- ✅ サウンド再生（設定で有効時）

## 🎯 テスト重点項目

1. **基本操作**: タップ、スワイプ、スクロール
2. **タイマー機能**: 開始/停止/リセット
3. **データ永続化**: アプリ再起動後もデータ保持
4. **レスポンシブ**: 各画面サイズでの表示

---

**準備完了！楽しいテストを！🎉**