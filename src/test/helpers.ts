import { expect } from "vitest";
import { chromium } from "playwright";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });

export async function takeScreenshot(element: HTMLElement, name: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 300, height: 600 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Get styled-components styles
  const styledComponentsStyles = Array.from(
    document.querySelectorAll("style[data-styled]")
  )
    .map((style) => style.textContent)
    .join("\n");

  // Get regular styles
  const regularStyles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        if (sheet.href) {
          return `@import url(${sheet.href});`;
        }
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
      } catch (e) {
        return "";
      }
    })
    .join("\n");

  // Get runtime styles from styled-components and emotion
  const runtimeStyles = Array.from(document.querySelectorAll("style"))
    .map((style) => style.textContent)
    .join("\n");

  // Get computed styles for the specific component
  const computedStyles = Array.from(element.querySelectorAll("*"))
    .map((el) => {
      const computed = window.getComputedStyle(el);
      const important = [
        "position",
        "display",
        "width",
        "height",
        "margin",
        "padding",
        "background",
        "color",
        "border",
      ];
      return `[data-testid="${el.getAttribute("data-testid") || ""}"] {
        ${important
          .map((prop) => `${prop}: ${computed.getPropertyValue(prop)};`)
          .join("\n        ")}
      }`;
    })
    .join("\n");

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
          .side-panel {
            position: absolute;
            right: 0;
            height: 100%;
            background-color: #2a2a2a;
            border-left: 1px solid #3a3a3a;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            transition: width 0.3s ease;
          }

          /* Global styles from index.css */
          ${regularStyles}

          /* Styled-components styles */
          ${styledComponentsStyles}

          /* Runtime styles */
          ${runtimeStyles}

          /* Computed styles */
          ${computedStyles}
        </style>
      </head>
      <body>
        <div id="root">
          ${element.outerHTML}
        </div>
      </body>
    </html>
  `;

  // Set content and wait for everything to load
  await page.setContent(html);

  // Wait for any dynamic content and animations
  await page.waitForTimeout(500);
  await page
    .waitForSelector("[data-testid]", { timeout: 1000 })
    .catch(() => {});

  // Take the screenshot with specific settings
  const screenshot = await page.screenshot({
    type: "png",
    animations: "disabled",
    scale: "css",
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
    failureThreshold: 0.01, // Allow 1% difference
    failureThresholdType: "percent",
  });
}
