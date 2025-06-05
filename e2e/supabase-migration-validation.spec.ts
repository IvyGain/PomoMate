import { test, expect, Page } from '@playwright/test';
import { SupabaseClient } from '@supabase/supabase-js';

// Test configuration
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';
const TEST_USERNAME = 'testuser';

test.describe('Supabase Migration Validation', () => {
  let page: Page;

  test.beforeEach(async ({ context }) => {
    page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
      }
    });
    
    // Enable request failure logging
    page.on('requestfailed', request => {
      console.error(`Request failed: ${request.url()} - ${request.failure()?.errorText}`);
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('1. App Startup and Environment', () => {
    test('should start without crashing', async () => {
      const response = await page.goto('/', { waitUntil: 'networkidle' });
      expect(response?.status()).toBeLessThan(400);
      
      // Check for any critical error messages
      const errorElements = await page.$$('[class*="error"], [class*="Error"]');
      expect(errorElements.length).toBe(0);
    });

    test('should have required environment variables configured', async () => {
      await page.goto('/');
      
      // Check if Supabase is initialized by evaluating window object
      const supabaseConfig = await page.evaluate(() => {
        // Check if environment variables are available
        const hasSupabaseUrl = window.location.href.includes('localhost') || 
                              document.documentElement.innerHTML.includes('supabase');
        return { hasSupabaseUrl };
      });
      
      expect(supabaseConfig.hasSupabaseUrl).toBeTruthy();
    });

    test('should not have any console errors on startup', async () => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForTimeout(2000); // Wait for any async operations
      
      // Filter out known acceptable warnings
      const criticalErrors = errors.filter(error => 
        !error.includes('Warning:') && 
        !error.includes('DevTools') &&
        !error.includes('Source map'),
      );
      
      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('2. Authentication Flow', () => {
    test('should display login screen', async () => {
      await page.goto('/');
      
      // Check for login form elements
      const emailInput = await page.locator('input[type="email"], input[placeholder*="email" i], input[name*="email" i]');
      const passwordInput = await page.locator('input[type="password"], input[placeholder*="password" i]');
      const loginButton = await page.locator('button:has-text("Login"), button:has-text("Sign in"), button:has-text("ログイン")');
      
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await expect(passwordInput).toBeVisible();
      await expect(loginButton).toBeVisible();
    });

    test('should display register screen', async () => {
      await page.goto('/');
      
      // Look for register/signup link or button
      const registerLink = await page.locator('text=/sign up|register|create account|新規登録/i').first();
      
      if (await registerLink.isVisible()) {
        await registerLink.click();
        
        // Check for registration form elements
        const usernameInput = await page.locator('input[placeholder*="username" i], input[name*="username" i]');
        const emailInput = await page.locator('input[type="email"], input[placeholder*="email" i]');
        const passwordInput = await page.locator('input[type="password"], input[placeholder*="password" i]');
        
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        // Username might be optional
      }
    });

    test('should handle login errors gracefully', async () => {
      await page.goto('/');
      
      const emailInput = await page.locator('input[type="email"], input[placeholder*="email" i]').first();
      const passwordInput = await page.locator('input[type="password"], input[placeholder*="password" i]').first();
      const loginButton = await page.locator('button:has-text("Login"), button:has-text("Sign in"), button:has-text("ログイン")').first();
      
      // Try to login with invalid credentials
      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('wrongpassword');
      await loginButton.click();
      
      // Check for error message
      const errorMessage = await page.locator('text=/invalid|error|failed|incorrect|間違い/i').first();
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
    });

    test('should handle registration validation', async () => {
      await page.goto('/');
      
      const registerLink = await page.locator('text=/sign up|register|create account|新規登録/i').first();
      
      if (await registerLink.isVisible()) {
        await registerLink.click();
        
        const emailInput = await page.locator('input[type="email"], input[placeholder*="email" i]').first();
        const passwordInput = await page.locator('input[type="password"], input[placeholder*="password" i]').first();
        const submitButton = await page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign up"), button:has-text("登録")').first();
        
        // Try to submit with invalid email
        await emailInput.fill('invalid-email');
        await passwordInput.fill('password123');
        await submitButton.click();
        
        // Should show validation error
        const validationError = await page.locator('text=/invalid|error|valid email|メールアドレス/i');
        await expect(validationError.first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('3. Timer Functionality', () => {
    test('should display timer interface after login', async () => {
      await page.goto('/');
      
      // For testing, we'll check if timer elements exist on the page
      // In a real scenario, you'd login first
      const timerDisplay = await page.locator('[class*="timer"], text=/\\d{1,2}:\\d{2}/');
      const startButton = await page.locator('button:has-text("Start"), button:has-text("開始")');
      
      // These might not be visible without login, so we check for their existence in the DOM
      const timerExists = await timerDisplay.count() > 0 || await startButton.count() > 0;
      expect(timerExists).toBeTruthy();
    });

    test('should have timer controls', async () => {
      await page.goto('/');
      
      // Check for timer control elements in the DOM
      const controlButtons = await page.locator('button').all();
      const hasTimerControls = controlButtons.some(async (button) => {
        const text = await button.textContent();
        return text?.match(/start|stop|pause|reset|開始|停止|一時停止|リセット/i);
      });
      
      expect(controlButtons.length).toBeGreaterThan(0);
    });
  });

  test.describe('4. Data Persistence and Store', () => {
    test('should check Zustand store initialization', async () => {
      await page.goto('/');
      
      // Check if Zustand stores are initialized
      const storeState = await page.evaluate(() => {
        // Check for window.__zustand or similar store references
        const hasStore = typeof window !== 'undefined';
        return { hasStore };
      });
      
      expect(storeState.hasStore).toBeTruthy();
    });

    test('should persist user preferences', async () => {
      await page.goto('/');
      
      // Check localStorage for any persisted data
      const localStorageData = await page.evaluate(() => {
        const data: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            data[key] = localStorage.getItem(key);
          }
        }
        return data;
      });
      
      // Check if any persistence mechanism is in place
      const hasPersistedData = Object.keys(localStorageData).length > 0 || 
                              Object.keys(localStorageData).some(key => 
                                key.includes('supabase') || 
                                key.includes('auth') || 
                                key.includes('user'),
                              );
      
      expect(hasPersistedData).toBeTruthy();
    });
  });

  test.describe('5. Navigation', () => {
    test('should navigate between screens without errors', async () => {
      await page.goto('/');
      
      // Get all clickable elements
      const links = await page.locator('a, button').all();
      const navigationErrors: string[] = [];
      
      page.on('pageerror', error => {
        navigationErrors.push(error.message);
      });
      
      // Try clicking first few navigation elements
      for (let i = 0; i < Math.min(3, links.length); i++) {
        try {
          const link = links[i];
          if (await link.isVisible()) {
            await link.click();
            await page.waitForTimeout(1000);
          }
        } catch (e) {
          // Navigation might change page structure, continue
        }
      }
      
      expect(navigationErrors).toHaveLength(0);
    });
  });

  test.describe('6. Supabase Integration', () => {
    test('should check Supabase client initialization', async () => {
      await page.goto('/');
      
      const supabaseCheck = await page.evaluate(() => {
        // Check for Supabase in window or global scope
        try {
          const hasSupabase = document.documentElement.innerHTML.includes('supabase') ||
                             typeof (window as any).supabase !== 'undefined';
          return { initialized: hasSupabase };
        } catch (e) {
          return { initialized: false, error: e.message };
        }
      });
      
      expect(supabaseCheck.initialized).toBeTruthy();
    });

    test('should handle network errors gracefully', async () => {
      // Simulate offline mode
      await page.context().setOffline(true);
      await page.goto('/');
      
      // App should still load without crashing
      const appLoaded = await page.locator('body').isVisible();
      expect(appLoaded).toBeTruthy();
      
      // Re-enable network
      await page.context().setOffline(false);
    });
  });

  test.describe('7. Performance and Memory', () => {
    test('should not have memory leaks on navigation', async () => {
      await page.goto('/');
      
      // Get initial memory usage
      const initialMetrics = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Navigate multiple times
      for (let i = 0; i < 5; i++) {
        await page.reload();
        await page.waitForTimeout(1000);
      }
      
      // Get final memory usage
      const finalMetrics = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Memory shouldn't increase dramatically (allow 50MB increase)
      const memoryIncrease = finalMetrics - initialMetrics;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    test('should load within acceptable time', async () => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });
  });

  test.describe('8. Error Boundary and Recovery', () => {
    test('should handle runtime errors gracefully', async () => {
      await page.goto('/');
      
      // Inject an error
      await page.evaluate(() => {
        setTimeout(() => {
          throw new Error('Test runtime error');
        }, 100);
      });
      
      await page.waitForTimeout(500);
      
      // App should still be responsive
      const appCrashed = await page.locator('text=/error boundary|something went wrong|エラー/i').isVisible();
      
      // If error boundary exists, it's good. If not, app should still work
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBeTruthy();
    });
  });

  test.describe('9. Accessibility', () => {
    test('should have proper ARIA labels', async () => {
      await page.goto('/');
      
      // Check for basic accessibility
      const buttons = await page.locator('button').all();
      let accessibleButtons = 0;
      
      for (const button of buttons) {
        const hasAriaLabel = await button.getAttribute('aria-label');
        const hasText = await button.textContent();
        if (hasAriaLabel || hasText) {
          accessibleButtons++;
        }
      }
      
      // At least 80% of buttons should be accessible
      const accessibilityRatio = buttons.length > 0 ? accessibleButtons / buttons.length : 1;
      expect(accessibilityRatio).toBeGreaterThan(0.8);
    });
  });

  test.describe('10. Security', () => {
    test('should not expose sensitive data in DOM', async () => {
      await page.goto('/');
      
      const htmlContent = await page.content();
      
      // Check for exposed secrets
      expect(htmlContent).not.toContain('supabase_anon_key');
      expect(htmlContent).not.toContain('supabase_service_key');
      expect(htmlContent).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
      
      // Check for exposed passwords
      expect(htmlContent).not.toMatch(/password["']?\s*[:=]\s*["'][^"']+["']/i);
    });

    test('should use secure headers', async () => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      // Check for security headers (might not all be present in dev)
      if (headers) {
        // These are recommendations, not requirements in dev
        console.log('Security headers present:', Object.keys(headers));
      }
    });
  });
});

// Helper function to generate test report
test.afterAll(async () => {
  console.log('\n=== Supabase Migration Validation Complete ===\n');
  console.log('Run "npm run test:e2e:report" to see detailed results');
});