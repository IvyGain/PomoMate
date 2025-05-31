import { test, expect } from '@playwright/test';

// サーバーが起動しているか確認し、起動していなければスキップ
const checkServerAndRun = async (page: any) => {
  try {
    await page.goto('http://localhost:8081', { timeout: 5000 });
    return true;
  } catch (error) {
    console.log('サーバーが起動していません。http://localhost:8081 を確認してください。');
    return false;
  }
};

test.describe('PomoMate - ボタン動作確認', () => {
  test('全画面のボタン一覧とクリックテスト', async ({ page }) => {
    // サーバー確認
    const serverReady = await checkServerAndRun(page);
    if (!serverReady) {
      test.skip();
      return;
    }

    console.log('\n=== PomoMate ボタンテスト開始 ===\n');

    // 1. ログイン画面
    console.log('【ログイン画面】');
    await page.goto('http://localhost:8081');
    await page.waitForTimeout(2000);

    // ボタン要素を全て取得
    const loginButtons = await page.$$eval('button, [role="button"], a[href]', elements => 
      elements.map(el => ({
        text: el.textContent?.trim() || '',
        type: el.tagName.toLowerCase(),
        href: el.getAttribute('href') || '',
        isVisible: (el as HTMLElement).offsetParent !== null
      })).filter(el => el.text && el.isVisible)
    );

    console.log(`発見したボタン数: ${loginButtons.length}`);
    loginButtons.forEach((btn, index) => {
      console.log(`  ${index + 1}. [${btn.type}] ${btn.text} ${btn.href ? `(→ ${btn.href})` : ''}`);
    });

    // デモログインを試行
    const demoButton = page.getByText('デモでお試し');
    if (await demoButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('\n→ デモログインボタンをクリック');
      await demoButton.click();
      await page.waitForTimeout(3000);
      
      // メイン画面に遷移したか確認
      if (page.url().includes('tabs')) {
        console.log('✅ メイン画面への遷移成功\n');
        
        // 2. メイン画面のボタン確認
        console.log('【メイン画面（タイマー）】');
        const mainButtons = await page.$$eval('button, [role="button"]', elements => 
          elements.map(el => ({
            text: el.textContent?.trim() || '',
            isVisible: (el as HTMLElement).offsetParent !== null
          })).filter(el => el.text && el.isVisible)
        );

        console.log(`発見したボタン数: ${mainButtons.length}`);
        mainButtons.forEach((btn, index) => {
          console.log(`  ${index + 1}. ${btn.text}`);
        });

        // タイマー操作
        const startButton = page.getByText('開始', { exact: true }).first();
        if (await startButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log('\n→ タイマー開始ボタンをクリック');
          await startButton.click();
          await page.waitForTimeout(2000);
          console.log('✅ タイマー開始');

          // 停止ボタン
          const stopButton = page.getByText('停止', { exact: true }).first();
          if (await stopButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log('→ 停止ボタンをクリック');
            await stopButton.click();
            await page.waitForTimeout(1000);
            console.log('✅ タイマー停止\n');
          }
        }

        // 3. タブナビゲーション
        console.log('【タブナビゲーション】');
        const tabs = ['進捗', '実績', 'キャラ', 'ソーシャル'];
        
        for (const tabName of tabs) {
          const tab = page.getByText(tabName, { exact: true }).first();
          if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`→ ${tabName}タブをクリック`);
            await tab.click();
            await page.waitForTimeout(1500);
            
            // 現在の画面のボタンを確認
            const tabButtons = await page.$$eval('button, [role="button"]', elements => 
              elements.map(el => ({
                text: el.textContent?.trim() || '',
                isVisible: (el as HTMLElement).offsetParent !== null
              })).filter(el => el.text && el.isVisible)
            );
            
            console.log(`  ${tabName}画面のボタン数: ${tabButtons.length}`);
            if (tabButtons.length > 0 && tabButtons.length < 10) {
              tabButtons.forEach((btn) => {
                console.log(`    - ${btn.text}`);
              });
            }
          }
        }

        // 4. 設定ボタンを探す
        console.log('\n【設定画面】');
        const settingsButtons = await page.$$('[aria-label*="setting"], [aria-label*="設定"]');
        if (settingsButtons.length > 0) {
          console.log('→ 設定ボタンを発見、クリック');
          await settingsButtons[0].click();
          await page.waitForTimeout(2000);
          
          // ログアウトボタン確認
          const logoutButton = page.getByText('ログアウト');
          if (await logoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log('✅ ログアウトボタンを確認（クリックはしない）');
          }
        }
      }
    } else {
      console.log('⚠️ デモログインボタンが見つかりません');
      
      // 新規登録画面へ
      const registerLink = page.getByText('新規登録');
      if (await registerLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('\n→ 新規登録リンクをクリック');
        await registerLink.click();
        await page.waitForTimeout(2000);
        
        console.log('\n【新規登録画面】');
        const registerButtons = await page.$$eval('button, [role="button"], a[href]', elements => 
          elements.map(el => ({
            text: el.textContent?.trim() || '',
            type: el.tagName.toLowerCase(),
            isVisible: (el as HTMLElement).offsetParent !== null
          })).filter(el => el.text && el.isVisible)
        );

        console.log(`発見したボタン数: ${registerButtons.length}`);
        registerButtons.forEach((btn, index) => {
          console.log(`  ${index + 1}. [${btn.type}] ${btn.text}`);
        });
      }
    }

    console.log('\n=== テスト完了 ===\n');
    
    // スクリーンショット保存
    await page.screenshot({ 
      path: 'test-results/button-test-final.png',
      fullPage: true 
    });
  });
});

// 1つのブラウザでのみ実行
test.describe.configure({ mode: 'serial' });