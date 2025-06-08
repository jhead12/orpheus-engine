import { expect } from "vitest";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import { createScreenshot } from "node-html-to-image";

expect.extend({ toMatchImageSnapshot });

interface ScreenshotOptions {
  name?: string;
  width?: number;
  height?: number;
}

export async function takeScreenshot(
  element: HTMLElement,
  options: ScreenshotOptions = {}
) {
  const { name = "screenshot", width = 1024, height = 768 } = options;

  const html = element.outerHTML;
  const image = await createScreenshot({
    html,
    type: "png",
    puppeteerArgs: {
      defaultViewport: {
        width,
        height,
      },
    },
  });

  return {
    image,
    name,
  };
}

export async function expectScreenshot(
  element: HTMLElement,
  options: ScreenshotOptions = {}
) {
  const { image, name } = await takeScreenshot(element, options);
  expect(image).toMatchImageSnapshot({
    customSnapshotsDir: "__screenshots__",
    customDiffDir: "__screenshots__/__diff__",
    customSnapshotIdentifier: name,
  });
}
