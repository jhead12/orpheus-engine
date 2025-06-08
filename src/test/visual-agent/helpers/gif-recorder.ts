/**
 * GIF Recorder Helper
 *
 * This module provides utilities for capturing GIFs of component animations
 * using Playwright for frame captures and node-html-to-image for GIF generation
 */

import fs from "fs/promises";
import path from "path";
import { chromium } from "playwright";
import nodeHtmlToImage from "node-html-to-image";

/**
 * Records a GIF of the component with the given interactions
 *
 * @param element The component HTML to capture
 * @param name Name of the output GIF file
 * @param duration Duration of the recording in ms
 * @param fps Frames per second (default: 10)
 */
export async function recordComponentGif(
  htmlContent: string,
  name: string,
  duration = 2000,
  fps = 10
): Promise<string> {
  // Create GIF directory if it doesn't exist
  const gifDir = path.join(process.cwd(), "__snapshots__", "gifs");
  await fs.mkdir(gifDir, { recursive: true });

  // Output path for the GIF
  const outputPath = path.join(gifDir, `${name}.gif`);

  // Setup and launch browser
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Set page content
    await page.setContent(htmlContent, { waitUntil: "networkidle" });

    // Calculate frames and intervals
    const frameCount = Math.ceil((duration * fps) / 1000);
    const frameInterval = duration / frameCount;

    // Capture frames
    const frames: Buffer[] = [];

    for (let i = 0; i < frameCount; i++) {
      // Wait for the next frame
      if (i > 0) {
        await page.waitForTimeout(frameInterval);
      }

      // Capture screenshot
      const screenshot = await page.screenshot({ type: "png" });
      frames.push(screenshot as Buffer);
    }

    // Generate GIF from frames
    await nodeHtmlToImage({
      output: outputPath,
      type: "gif",
      quality: 80,
      content: {
        frames,
        delay: frameInterval,
      },
      puppeteerArgs: {
        headless: true,
      },
    });

    console.log(`GIF created at: ${outputPath}`);
    return outputPath;
  } finally {
    // Clean up
    await browser.close();
  }
}

/**
 * Helper to create HTML content for a component
 *
 * @param componentHtml Component HTML string
 * @param styles Additional styles to apply
 */
export function createComponentHtml(
  componentHtml: string,
  styles?: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: transparent;
          }
          #container {
            ${styles || ""}
          }
        </style>
      </head>
      <body>
        <div id="container">
          ${componentHtml}
        </div>
      </body>
    </html>
  `;
}
