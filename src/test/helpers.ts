import { expect } from "vitest";
import { chromium } from "playwright";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });

export async function takeScreenshot(element: HTMLElement, name: string) {
  // Launch browser with specific viewport
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 300, height: 600 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Collect all styles
  const allStyles = new Set<string>();

  // 1. Styled-components styles
  document.querySelectorAll("style[data-styled]").forEach((style) => {
    if (style.textContent) allStyles.add(style.textContent);
  });

  // 2. Regular stylesheet contents
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (link instanceof HTMLLinkElement && link.sheet) {
      try {
        Array.from(link.sheet.cssRules).forEach((rule) => {
          allStyles.add(rule.cssText);
        });
      } catch (e) {
        console.warn("Could not access stylesheet rules");
      }
    }
  });

  // 3. Inline styles and other style tags
  document.querySelectorAll("style:not([data-styled])").forEach((style) => {
    if (style.textContent) allStyles.add(style.textContent);
  });

  // Create HTML with all styles and proper viewport
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          /* Reset default styles */
          * { margin: 0; padding: 0; box-sizing: border-box; }

          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #1e1e1e;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
          }

          #root {
            width: 300px;
            height: 600px;
            position: relative;
            overflow: hidden;
            background: #1e1e1e;
          }

          /* Component styles */
          ${Array.from(allStyles).join("\n")}
        </style>
      </head>
      <body>
        <div id="root">
          ${element.outerHTML}
        </div>
      </body>
    </html>
  `;

  // Set content and wait for styles to load
  await page.setContent(html);

  // Wait for fonts to load
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(() => document.fonts.ready);

  // Wait for styles to be applied and any dynamic content
  await page.waitForTimeout(2000);

  // Wait for the side panel element to be visible and any transitions to complete
  await page.waitForSelector('[data-testid="side-panel"]', {
    timeout: 5000,
    state: "visible",
  });

  // Additional wait for any CSS transitions to complete
  await page.waitForTimeout(500);

  // Ensure the element is stable (no animations/transitions running)
  await page.evaluate(() => {
    return new Promise((resolve) => {
      const element = document.querySelector('[data-testid="side-panel"]');
      if (!element) {
        resolve(null);
        return;
      }

      // Wait for any ongoing transitions
      element.addEventListener("transitionend", () => resolve(null), {
        once: true,
      });
      // Fallback if no transition is running
      setTimeout(resolve, 100);
    });
  });

  // Take the screenshot with consistent settings
  const screenshot = await page.screenshot({
    type: "png",
    animations: "disabled",
    scale: "css",
    timeout: 5000,
  });

  await browser.close();
  return screenshot;
}

export async function expectScreenshot(element: HTMLElement, name: string) {
  const screenshot = await takeScreenshot(element, name);
  expect(screenshot).toMatchImageSnapshot({
    customSnapshotsDir: "__snapshots__/screenshots",
    customDiffDir: "__snapshots__/diffs",
    customSnapshotIdentifier: name,
    failureThreshold: 0.02, // Allow 2% difference for more stability
    failureThresholdType: "percent",
    blur: 0.5, // Apply slight blur to reduce impact of anti-aliasing differences
    comparisonMethod: "ssim", // Use structural similarity comparison
    allowSizeMismatch: true, // Allow slight size mismatches
  });
}
