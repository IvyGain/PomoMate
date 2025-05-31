import { test, expect } from '@playwright/test';

test.describe('ポモドーロタイマー機能', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL(/.*dashboard/);
  });

  test('タイマーの基本動作', async ({ page }) => {
    // タイマーが表示される
    await expect(page.locator('text=25:00')).toBeVisible();
    
    // スタートボタンをクリック
    await page.click('button:has-text("スタート")');
    
    // タイマーが動作していることを確認（1秒後）
    await page.waitForTimeout(1000);
    await expect(page.locator('text=24:59')).toBeVisible();
    
    // 一時停止
    await page.click('button:has-text("一時停止")');
    await page.waitForTimeout(1000);
    
    // タイマーが停止していることを確認
    const timerText = await page.locator('[data-testid="timer-display"]').textContent();
    await page.waitForTimeout(1000);
    const timerTextAfter = await page.locator('[data-testid="timer-display"]').textContent();
    expect(timerText).toBe(timerTextAfter);
  });

  test('モード切り替え', async ({ page }) => {
    // 休憩モードに切り替え
    await page.click('button:has-text("休憩")');
    await expect(page.locator('text=5:00')).toBeVisible();
    
    // 長い休憩モードに切り替え
    await page.click('button:has-text("長い休憩")');
    await expect(page.locator('text=15:00')).toBeVisible();
    
    // フォーカスモードに戻る
    await page.click('button:has-text("フォーカス")');
    await expect(page.locator('text=25:00')).toBeVisible();
  });

  test('設定変更', async ({ page }) => {
    // 設定を開く
    await page.click('button[aria-label="設定"]');
    
    // フォーカス時間を変更
    await page.fill('input[name="focusDuration"]', '30');
    await page.click('button:has-text("保存")');
    
    // タイマーに反映されることを確認
    await expect(page.locator('text=30:00')).toBeVisible();
  });

  test('セッション完了フロー', async ({ page }) => {
    // テスト用に短い時間に設定
    await page.click('button[aria-label="設定"]');
    await page.fill('input[name="focusDuration"]', '0.1'); // 6秒
    await page.click('button:has-text("保存")');
    
    // タイマースタート
    await page.click('button:has-text("スタート")');
    
    // 完了を待つ
    await page.waitForTimeout(7000);
    
    // 完了通知が表示される
    await expect(page.locator('text=セッション完了')).toBeVisible();
    
    // 統計が更新される
    const stats = page.locator('[data-testid="session-stats"]');
    await expect(stats).toContainText('1');
  });
});