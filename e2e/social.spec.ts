import { test, expect } from '@playwright/test';

test.describe('ソーシャル機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL(/.*dashboard/);
  });

  test('フレンドコード生成', async ({ page }) => {
    // ソーシャルタブを開く
    await page.click('text=ソーシャル');
    
    // フレンドコード生成ボタン
    await page.click('button:has-text("フレンドコード生成")');
    
    // コードが表示される
    const friendCode = await page.locator('[data-testid="friend-code"]').textContent();
    expect(friendCode).toMatch(/^[A-Z0-9]{8}$/);
  });

  test('フレンドリクエスト送信', async ({ page }) => {
    await page.click('text=ソーシャル');
    
    // フレンドコード入力
    await page.fill('input[placeholder="フレンドコード"]', 'TESTCODE');
    await page.click('button:has-text("リクエスト送信")');
    
    // 確認メッセージ
    await expect(page.locator('text=フレンドリクエストを送信しました')).toBeVisible();
  });

  test('通知の表示と既読', async ({ page }) => {
    await page.click('text=ソーシャル');
    await page.click('text=通知');
    
    // 通知リストが表示される
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    
    // 未読通知をクリック
    const unreadNotification = page.locator('.notification.unread').first();
    if (await unreadNotification.isVisible()) {
      await unreadNotification.click();
      
      // 既読になる
      await expect(unreadNotification).not.toHaveClass(/unread/);
    }
  });

  test('チームセッション作成', async ({ page }) => {
    await page.click('text=チーム');
    
    // セッション作成
    await page.click('button:has-text("セッション作成")');
    await page.fill('input[name="sessionName"]', 'テストセッション');
    await page.click('button:has-text("作成")');
    
    // セッションコードが表示される
    const sessionCode = await page.locator('[data-testid="session-code"]').textContent();
    expect(sessionCode).toMatch(/^[A-Z0-9]{8}$/);
    
    // 参加者リストに自分が表示される
    await expect(page.locator('text=test@example.com')).toBeVisible();
  });
});