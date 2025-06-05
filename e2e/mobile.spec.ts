import { test, expect, devices } from '@playwright/test';

// モバイルデバイスでのテスト
test.use({ ...devices['iPhone 12'] });

test.describe('モバイルレスポンシブテスト', () => {
  test('モバイルでのナビゲーション', async ({ page }) => {
    await page.goto('/');
    
    // ハンバーガーメニューが表示される
    await expect(page.locator('[aria-label="メニュー"]')).toBeVisible();
    
    // デスクトップメニューは非表示
    await expect(page.locator('.desktop-nav')).not.toBeVisible();
  });

  test('タッチ操作', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.tap('button:has-text("ログイン")');
    await page.waitForURL(/.*dashboard/);
    
    // スワイプでタブ切り替え
    await page.locator('[data-testid="tab-container"]').swipe({
      direction: 'left',
      distance: 100,
    });
    
    // タブが切り替わったことを確認
    await expect(page.locator('.active-tab')).toHaveText('統計');
  });

  test('仮想キーボードでの入力', async ({ page }) => {
    await page.goto('/');
    
    // 入力フィールドにフォーカス
    await page.tap('input[type="email"]');
    
    // 仮想キーボードのためのスペースがあることを確認
    const viewportSize = page.viewportSize();
    if (viewportSize) {
      const inputPosition = await page.locator('input[type="email"]').boundingBox();
      if (inputPosition) {
        // 入力フィールドが画面の上半分にあることを確認
        expect(inputPosition.y).toBeLessThan(viewportSize.height / 2);
      }
    }
  });

  test('オフライン時の表示', async ({ page, context }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL(/.*dashboard/);
    
    // オフラインモードに切り替え
    await context.setOffline(true);
    
    // オフラインバナーが表示される
    await expect(page.locator('text=オフラインモード')).toBeVisible();
    
    // タイマーは動作可能
    await page.click('button:has-text("スタート")');
    await page.waitForTimeout(1000);
    
    // オンラインに戻す
    await context.setOffline(false);
    
    // 同期メッセージが表示される
    await expect(page.locator('text=オンラインに復帰しました')).toBeVisible();
  });
});