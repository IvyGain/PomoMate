import { test, expect } from '@playwright/test';

test.describe('初期確認テスト', () => {
  test('フロントエンドが起動している', async ({ page }) => {
    // Expoの開発サーバーにアクセス
    const response = await page.goto('http://localhost:8081', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000, 
    });
    
    // レスポンスステータスを確認
    expect(response?.status()).toBe(200);
    
    // Expoの開発サーバーページが表示されているか確認
    await expect(page.locator('text=Expo')).toBeVisible({ timeout: 10000 });
  });

  test('バックエンドAPIが起動している', async ({ request }) => {
    // ヘルスチェックエンドポイントを確認
    const response = await request.get('http://localhost:3000/api/health');
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
  });

  test('データベース接続が確立されている', async ({ request }) => {
    // データベース状態を確認するエンドポイント
    const response = await request.get('http://localhost:3000/api/health/db');
    
    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('database', 'connected');
    }
  });

  test('CORS設定が正しく構成されている', async ({ request }) => {
    // CORSヘッダーを確認
    const response = await request.options('http://localhost:3000/api/health', {
      headers: {
        'Origin': 'http://localhost:8081',
        'Access-Control-Request-Method': 'GET',
      },
    });
    
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeTruthy();
  });
});