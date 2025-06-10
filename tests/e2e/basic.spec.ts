import { test, expect } from '@playwright/test';

// Basic test that doesn't rely on the app running
test('basic test', async ({ page }) => {
  // Create a basic HTML page
  await page.setContent(`
    <html>
      <head>
        <title>Playwright Test</title>
      </head>
      <body>
        <h1>Orpheus Engine Test Page</h1>
        <button id="test-button">Click Me</button>
        <div id="result"></div>
        <script>
          document.getElementById('test-button').addEventListener('click', () => {
            document.getElementById('result').textContent = 'Button clicked!';
          });
        </script>
      </body>
    </html>
  `);
  
  // Check the title
  await expect(page).toHaveTitle('Playwright Test');
  
  // Interact with elements
  await page.click('#test-button');
  
  // Verify changes
  const resultText = await page.textContent('#result');
  expect(resultText).toBe('Button clicked!');
  
  // Take a screenshot
  await page.screenshot({ path: 'test-results/basic-test.png' });
});
