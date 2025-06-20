import { test, expect } from '@playwright/test';

test.describe('Orpheus Engine App', () => {
  test('basic app load test', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Wait for the app to load
    await expect(page).toHaveTitle(/Orpheus/);
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: 'test-results/app-load.png' });
    
    // Basic UI elements that should be present
    await expect(page.locator('div[role="main"]')).toBeTruthy();
    
    // Log the current URL to help with debugging
    console.log('Loaded URL:', page.url());
  });

  test('app responsiveness', async ({ page }) => {
    await page.goto('/');
    
    // Test different viewport sizes
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ path: 'test-results/desktop-view.png' });
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'test-results/tablet-view.png' });
  });
});
