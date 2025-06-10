playwright.config.ts:
{
  "testDir": "tests",
  "use": {
    "browserName": "chromium",
    "headless": true
  }
}

tests/example.spec.ts:
import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const title = await page.title();
  expect(title).toBe('Expected Title');
});

package.json:
{
  "dependencies": {
    "playwright": "^1.0.0"
  },
  "scripts": {
    "test": "playwright test"
  }
}