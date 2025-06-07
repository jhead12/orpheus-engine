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
  // Create a temporary div to contain the element for screenshotting
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "fixed";
  tempContainer.style.top = "0";
  tempContainer.style.left = "0";
  tempContainer.style.width = "auto";
  tempContainer.style.height = "auto";
  tempContainer.style.zIndex = "9999";

  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as HTMLElement;
  tempContainer.appendChild(clonedElement);
  document.body.appendChild(tempContainer);

  try {
    // Use the extended expect with jest-image-snapshot matcher
    await imageSnapshotExpect(tempContainer).toMatchImageSnapshot({
      customSnapshotIdentifier: name,
      customSnapshotsDir: path.join(
        process.cwd(),
        "__snapshots__",
        "screenshots"
      ),
      customDiffDir: path.join(process.cwd(), "__snapshots__", "diffs"),
      failureThreshold: threshold,
      failureThresholdType: "percent",
    });
  } finally {
    // Clean up
    document.body.removeChild(tempContainer);
  }
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
