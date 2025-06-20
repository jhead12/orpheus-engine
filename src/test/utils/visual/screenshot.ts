import { promises as fs } from 'fs';
import { expect } from 'vitest';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import * as playwright from '@playwright/test';

// Extend expect with image snapshot matcher
expect.extend({ toMatchImageSnapshot });

/**
 * Take a screenshot of an element and compare it to a reference image
 */
export async function expectScreenshot(
  element: HTMLElement,
  name: string,
  options: {
    threshold?: number;
    snapshotsDir?: string;
    diffsDir?: string;
  } = {}
): Promise<void> {
  const {
    threshold = 0.01,
    snapshotsDir = '__snapshots__/screenshots',
    diffsDir = '__snapshots__/diffs'
  } = options;

  // Create directories if they don't exist
  await fs.mkdir(snapshotsDir, { recursive: true });
  await fs.mkdir(diffsDir, { recursive: true });

  // Take screenshot
  const screenshot = await takeScreenshot(element);

  // Compare to reference image
  expect(screenshot).toMatchImageSnapshot({
    customSnapshotsDir: snapshotsDir,
    customDiffDir: diffsDir,
    customSnapshotIdentifier: name,
    failureThreshold: threshold
  });
}

/**
 * Takes a screenshot of an element using Playwright
 */
export async function takeScreenshot(element: HTMLElement): Promise<Buffer> {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Inject the element HTML into the page
  await page.setContent(element.outerHTML);

  // Take screenshot
  const screenshot = await page.screenshot({
    clip: {
      x: 0,
      y: 0,
      width: element.clientWidth,
      height: element.clientHeight
    }
  });

  await browser.close();
  return screenshot;
}
