import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ログイン画面が表示される', async ({ page }) => {
    await expect(page.locator('text=ログイン')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('正常なログインフロー', async ({ page }) => {
    // メールアドレスとパスワードを入力
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // ログインボタンをクリック
    await page.click('button:has-text("ログイン")');
    
    // ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=ポモドーロタイマー')).toBeVisible();
  });

  test('無効な認証情報でのエラー表示', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("ログイン")');
    
    // エラーメッセージが表示される
    await expect(page.locator('text=メールアドレスまたはパスワードが正しくありません')).toBeVisible();
  });

  test('新規登録フロー', async ({ page }) => {
    await page.click('text=新規登録');
    
    // 登録フォームが表示される
    await expect(page.locator('text=アカウント作成')).toBeVisible();
    
    // フォームに入力
    const timestamp = Date.now();
    await page.fill('input[name="name"]', `Test User ${timestamp}`);
    await page.fill('input[name="email"]', `test${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    
    // 登録ボタンをクリック
    await page.click('button:has-text("登録")');
    
    // 成功メッセージまたはダッシュボードへのリダイレクト
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('ログアウト機能', async ({ page }) => {
    // まずログイン
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL(/.*dashboard/);
    
    // ログアウト
    await page.click('button[aria-label="メニュー"]');
    await page.click('text=ログアウト');
    
    // ログイン画面に戻る
    await expect(page).toHaveURL(/.*login/);
  });
});