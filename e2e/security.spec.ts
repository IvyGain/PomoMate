import { test, expect } from '@playwright/test';

test.describe('セキュリティテスト', () => {
  test('XSS攻撃の防御', async ({ page }) => {
    await page.goto('/');
    
    // 悪意のあるスクリプトを含む入力
    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('input[type="email"]', `test${xssPayload}@example.com`);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("ログイン")');
    
    // スクリプトが実行されないことを確認
    const alerts = [];
    page.on('dialog', dialog => alerts.push(dialog));
    await page.waitForTimeout(1000);
    expect(alerts).toHaveLength(0);
  });

  test('SQLインジェクション防御', async ({ page }) => {
    await page.goto('/');
    
    // SQLインジェクション試行
    await page.fill('input[type="email"]', "admin' OR '1'='1");
    await page.fill('input[type="password"]', "password' OR '1'='1");
    await page.click('button:has-text("ログイン")');
    
    // エラーメッセージが表示され、ログインできない
    await expect(page.locator('text=メールアドレスまたはパスワードが正しくありません')).toBeVisible();
    await expect(page).not.toHaveURL(/.*dashboard/);
  });

  test('CSRF対策', async ({ page }) => {
    // ログイン
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL(/.*dashboard/);
    
    // CSRFトークンが含まれているか確認
    const csrfToken = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta?.getAttribute('content');
    });
    
    expect(csrfToken).toBeTruthy();
  });

  test('認証なしでの保護されたルートへのアクセス', async ({ page }) => {
    // 直接ダッシュボードにアクセス
    await page.goto('/dashboard');
    
    // ログインページにリダイレクトされる
    await expect(page).toHaveURL(/.*login/);
  });

  test('セッションタイムアウト', async ({ page }) => {
    // ログイン
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL(/.*dashboard/);
    
    // セッションを無効化（開発環境でのテスト）
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      sessionStorage.clear();
    });
    
    // ページをリロード
    await page.reload();
    
    // ログインページにリダイレクトされる
    await expect(page).toHaveURL(/.*login/);
  });

  test('パスワード強度の検証', async ({ page }) => {
    await page.goto('/');
    await page.click('text=新規登録');
    
    // 弱いパスワード
    await page.fill('input[name="password"]', '123456');
    
    // パスワード強度インジケーター
    await expect(page.locator('text=弱い')).toBeVisible();
    
    // 強いパスワード
    await page.fill('input[name="password"]', 'StrongP@ssw0rd123!');
    await expect(page.locator('text=強い')).toBeVisible();
  });
});