/**
 * Screenshot test helper for visual regression testing
 */

import path from "path";
import fs from "fs/promises";
import { imageSnapshotExpect } from "./vitest-image-snapshot";

/**
 * Take a screenshot of an element and compare it to a reference image
 *
 * @param element The element to screenshot
 * @param name Snapshot name for the screenshot
 * @param threshold Threshold for pixel differences (0-1)
 */
export async function expectScreenshot(
  element: HTMLElement,
  name: string,
  threshold = 0.01
): Promise<void> {
  const screenshot = await takeScreenshot(element, name);
  expect(screenshot).toMatchImageSnapshot({
    customSnapshotsDir: "__snapshots__/screenshots",
    customDiffDir: "__snapshots__/diffs",
    customSnapshotIdentifier: `${name}.png`, // Explicitly add .png extension
    failureThreshold: threshold,
    failureThresholdType: "percent",
    storeReceivedOnFailure: true, // Store failed screenshots for debugging
    comparisonMethod: "ssim", // Use structural similarity for better comparison
    customSnapshotIdentifierProviders: [
      () => `${name}.png`, // Ensure consistent PNG extension
    ],
  });
}

/**
 * Create a GIF recorder helper for animated screenshots
 * This is a placeholder function that will be replaced by the actual implementation
 * in src/test/visual-agent/helpers/gif-recorder.ts
 */
export async function recordGif(
  element: HTMLElement,
  name: string,
  // duration is kept but unused in this fallback implementation
  _duration = 2000
): Promise<string> {
  console.warn(
    "Default recordGif used - this is just a placeholder. Use the implementation from visual-agent/helpers/gif-recorder.ts"
  );

  // For now, just take a static screenshot
  await expectScreenshot(element, name);

  // Create an empty GIF file as a placeholder
  const outputPath = path.join(
    process.cwd(),
    "__snapshots__",
    "gifs",
    `${name}.gif`
  );
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  return outputPath;
}

/**
 * Take a screenshot of an element
 * @param element The element to screenshot
 * @param name Name of the screenshot
 * @returns Promise<Buffer> Screenshot data
 */
async function takeScreenshot(
  element: HTMLElement,
  name: string
): Promise<Buffer> {
  const htmlToImage = (await import("node-html-to-image")).default;

  const html = element.outerHTML;
  const css = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
      } catch (e) {
        return "";
      }
    })
    .join("\n");

  return htmlToImage({
    html: `<div>${html}</div>`,
    css: css,
    transparent: true,
    type: "png",
  }) as Promise<Buffer>;
}
