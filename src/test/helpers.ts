import { expect } from "vitest";
import { chromium } from "playwright";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });

export async function takeScreenshot(element: HTMLElement, name: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Convert element to HTML string and inject necessary styles
  const html = `
    <html>
      <head>
        <style>
          ${Array.from(document.styleSheets)
            .map((sheet) => {
              try {
                return Array.from(sheet.cssRules)
                  .map((rule) => rule.cssText)
                  .join("\n");
              } catch (e) {
                return "";
              }
            })
            .join("\n")}
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `;

  await page.setContent(html);
  const screenshot = await page.screenshot();
  await browser.close();

  return screenshot;
}

export async function expectScreenshot(element: HTMLElement, name: string) {
  const screenshot = await takeScreenshot(element, name);
  expect(screenshot).toMatchImageSnapshot({
    customSnapshotsDir: "__snapshots__/screenshots",
    customDiffDir: "__snapshots__/diffs",
    customSnapshotIdentifier: name,
  });
}
