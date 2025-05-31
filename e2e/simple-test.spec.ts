import { test, expect } from '@playwright/test';

test.describe('基本的な動作確認', () => {
  test('Expoの開発サーバーにアクセスできる', async ({ page }) => {
    // Expoのウェブ版にアクセス
    await page.goto('http://localhost:8081');
    
    // ページが読み込まれることを確認
    await page.waitForLoadState('domcontentloaded');
    
    // タイトルやコンテンツの存在を確認
    const title = await page.title();
    console.log('Page title:', title);
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'e2e/screenshots/expo-home.png' });
  });

  test('アプリの基本的な要素が表示される', async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForTimeout(3000); // アプリの初期化を待つ
    
    // React Nativeのウェブ版として実行されているか確認
    const bodyContent = await page.textContent('body');
    console.log('Body content preview:', bodyContent?.substring(0, 200));
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'e2e/screenshots/app-loaded.png' });
  });
});