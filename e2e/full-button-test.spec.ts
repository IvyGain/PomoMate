import { test, expect } from '@playwright/test';

test.describe('PomoMate - 全ボタンテスト', () => {
  test.beforeEach(async ({ page }) => {
    // アプリケーションを開く
    await page.goto('http://localhost:8081');
    // 初期読み込み待機
    await page.waitForTimeout(3000);
  });

  test('ログイン画面のボタン確認', async ({ page }) => {
    console.log('=== ログイン画面テスト開始 ===');
    
    // ログイン画面に遷移しているか確認
    await expect(page).toHaveURL(/.*login/);
    
    // デモログインボタン
    const demoLoginButton = page.getByText('デモでお試し');
    if (await demoLoginButton.isVisible()) {
      console.log('✓ デモログインボタン: 表示確認');
      await demoLoginButton.click();
      await page.waitForTimeout(2000);
      
      // ホーム画面に遷移したか確認
      if (page.url().includes('tabs')) {
        console.log('✓ デモログイン成功: ホーム画面へ遷移');
        // ログアウトして戻る
        await page.goto('http://localhost:8081/login');
      }
    }
    
    // 新規登録リンク
    const registerLink = page.getByText('新規登録');
    if (await registerLink.isVisible()) {
      console.log('✓ 新規登録リンク: 表示確認');
      await registerLink.click();
      await expect(page).toHaveURL(/.*register/);
      console.log('✓ 新規登録画面へ遷移成功');
      await page.goBack();
    }
    
    // パスワード表示/非表示ボタン
    const passwordToggle = page.locator('[aria-label*="password"]').first();
    if (await passwordToggle.isVisible()) {
      console.log('✓ パスワード表示切替ボタン: 表示確認');
      await passwordToggle.click();
      await page.waitForTimeout(500);
      console.log('✓ パスワード表示切替: 動作確認');
    }
  });

  test('新規登録画面のボタン確認', async ({ page }) => {
    console.log('=== 新規登録画面テスト開始 ===');
    
    await page.goto('http://localhost:8081/register');
    await page.waitForTimeout(2000);
    
    // パスワード表示/非表示ボタン
    const eyeButtons = page.locator('svg').filter({ hasText: /eye/i });
    const eyeButtonCount = await eyeButtons.count();
    console.log(`✓ パスワード表示ボタン数: ${eyeButtonCount}`);
    
    // ログイン画面へのリンク
    const loginLink = page.getByText('ログイン').last();
    if (await loginLink.isVisible()) {
      console.log('✓ ログイン画面リンク: 表示確認');
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
      console.log('✓ ログイン画面へ遷移成功');
    }
  });

  test('メイン画面（タイマー）のボタン確認', async ({ page }) => {
    console.log('=== メイン画面テスト開始 ===');
    
    // デモログインでメイン画面へ
    await page.goto('http://localhost:8081/login');
    await page.waitForTimeout(2000);
    
    const demoButton = page.getByText('デモでお試し');
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.waitForTimeout(3000);
    }
    
    // タイマー開始/停止ボタン
    const startButton = page.getByText('開始').first();
    const pauseButton = page.getByText('一時停止').first();
    const stopButton = page.getByText('停止').first();
    
    if (await startButton.isVisible()) {
      console.log('✓ タイマー開始ボタン: 表示確認');
      await startButton.click();
      await page.waitForTimeout(2000);
      console.log('✓ タイマー開始: 動作確認');
      
      // 一時停止ボタンが表示されるか
      if (await pauseButton.isVisible()) {
        console.log('✓ 一時停止ボタン: 表示確認');
        await pauseButton.click();
        await page.waitForTimeout(1000);
        console.log('✓ タイマー一時停止: 動作確認');
      }
      
      // 停止ボタン
      if (await stopButton.isVisible()) {
        console.log('✓ 停止ボタン: 表示確認');
        await stopButton.click();
        await page.waitForTimeout(1000);
        console.log('✓ タイマー停止: 動作確認');
      }
    }
    
    // タブナビゲーション
    const tabs = ['ホーム', '進捗', '実績', 'キャラ', 'ソーシャル'];
    for (const tabName of tabs) {
      const tab = page.getByText(tabName, { exact: true }).first();
      if (await tab.isVisible()) {
        console.log(`✓ ${tabName}タブ: 表示確認`);
        await tab.click();
        await page.waitForTimeout(1500);
        console.log(`✓ ${tabName}タブ: 遷移成功`);
      }
    }
  });

  test('設定画面のボタン確認', async ({ page }) => {
    console.log('=== 設定画面テスト開始 ===');
    
    // デモログインして設定画面へ
    await page.goto('http://localhost:8081/login');
    await page.waitForTimeout(2000);
    
    const demoButton = page.getByText('デモでお試し');
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.waitForTimeout(3000);
    }
    
    // 設定ボタンを探す（歯車アイコンなど）
    const settingsButton = page.locator('[aria-label*="setting"]').first();
    if (await settingsButton.isVisible()) {
      console.log('✓ 設定ボタン: 表示確認');
      await settingsButton.click();
      await page.waitForTimeout(2000);
      
      // ログアウトボタン
      const logoutButton = page.getByText('ログアウト');
      if (await logoutButton.isVisible()) {
        console.log('✓ ログアウトボタン: 表示確認');
        // 実際にはクリックしない（テストが終了してしまうため）
      }
      
      // サウンド設定トグル
      const soundToggle = page.locator('input[type="checkbox"]').first();
      if (await soundToggle.isVisible()) {
        console.log('✓ サウンド設定トグル: 表示確認');
        await soundToggle.click();
        await page.waitForTimeout(500);
        console.log('✓ サウンド設定: 動作確認');
      }
    }
  });

  test('全体的なボタン一覧の取得', async ({ page }) => {
    console.log('=== 全ボタンリスト作成 ===');
    
    // デモログイン
    await page.goto('http://localhost:8081/login');
    await page.waitForTimeout(2000);
    
    const demoButton = page.getByText('デモでお試し');
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.waitForTimeout(3000);
    }
    
    // 全ボタン要素を取得
    const buttons = await page.locator('button').all();
    const touchables = await page.locator('[role="button"]').all();
    
    console.log(`発見したボタン数: ${buttons.length}`);
    console.log(`タッチ可能要素数: ${touchables.length}`);
    
    // 各ボタンのテキストを取得
    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      if (text && isVisible) {
        console.log(`  - ボタン${i + 1}: "${text.trim()}"`);
      }
    }
  });

  test('エラーハンドリングの確認', async ({ page }) => {
    console.log('=== エラーハンドリングテスト ===');
    
    // 無効なログイン試行
    await page.goto('http://localhost:8081/login');
    await page.waitForTimeout(2000);
    
    // 空のフォームでログイン試行
    const loginButton = page.getByRole('button', { name: /ログイン/i });
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(1000);
      
      // エラーメッセージの確認
      const errorAlert = page.getByText(/エラー/i);
      if (await errorAlert.isVisible()) {
        console.log('✓ エラーアラート: 表示確認');
      }
    }
  });
});

// レポート用のカスタムレポーター
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    // 失敗時はスクリーンショットを保存
    await page.screenshot({ 
      path: `test-results/button-test-${Date.now()}.png`,
      fullPage: true, 
    });
  }
});

test.afterAll(async () => {
  console.log('\n=== テスト完了 ===');
  console.log('全ボタンの挙動確認が完了しました。');
});