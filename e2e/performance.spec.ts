import { test, expect } from '@playwright/test';

test.describe('パフォーマンステスト', () => {
  test('初期ロード時間', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    console.log(`初期ロード時間: ${loadTime}ms`);
    
    // 3秒以内にロードされることを期待
    expect(loadTime).toBeLessThan(3000);
  });

  test('大量データでのレンダリング', async ({ page }) => {
    // ログイン
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL(/.*dashboard/);
    
    // 統計ページへ
    await page.click('text=統計');
    
    // レンダリング時間を計測
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="stats-chart"]');
    const renderTime = Date.now() - startTime;
    
    console.log(`統計チャートレンダリング時間: ${renderTime}ms`);
    expect(renderTime).toBeLessThan(1000);
  });

  test('メモリリーク検証', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL(/.*dashboard/);
    
    // 初期メモリ使用量
    const initialMetrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize
        };
      }
      return null;
    });
    
    // タイマーの開始と停止を10回繰り返す
    for (let i = 0; i < 10; i++) {
      await page.click('button:has-text("スタート")');
      await page.waitForTimeout(500);
      await page.click('button:has-text("一時停止")');
      await page.waitForTimeout(500);
    }
    
    // 最終メモリ使用量
    const finalMetrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize
        };
      }
      return null;
    });
    
    if (initialMetrics && finalMetrics) {
      const memoryIncrease = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;
      console.log(`メモリ増加量: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      // 50MB以上の増加はメモリリークの可能性
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('API レスポンス時間', async ({ page }) => {
    await page.goto('/');
    
    // APIレスポンスを監視
    const apiResponses: number[] = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const timing = response.timing();
        if (timing) {
          apiResponses.push(timing.responseEnd);
        }
      }
    });
    
    // ログイン（API呼び出し）
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("ログイン")');
    await page.waitForURL(/.*dashboard/);
    
    // APIレスポンス時間をチェック
    apiResponses.forEach((time, index) => {
      console.log(`API Response ${index + 1}: ${time}ms`);
      expect(time).toBeLessThan(1000); // 1秒以内
    });
  });
});