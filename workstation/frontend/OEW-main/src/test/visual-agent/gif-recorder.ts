import { chromium } from "playwright";
import { promises as fs } from "fs";
import path from "path";
import nodeHtmlToImage from "node-html-to-image";

/**
 * Records a GIF of the element's state changes
 * @param element The element to record
 * @param name The name of the gif file (without extension)
 * @param duration Duration in ms to record
 * @param fps Frames per second (default: 10)
 */
export async function recordGif(
  element: HTMLElement,
  name: string,
  duration = 2000,
  fps = 10
): Promise<void> {
  console.log(`Recording GIF for ${name}...`);

  // Create directory if it doesn't exist
  const gifDir = path.join(process.cwd(), "__snapshots__", "gifs");
  await fs.mkdir(gifDir, { recursive: true });

  // Calculate number of frames to capture
  const frames = Math.ceil((duration * fps) / 1000);
  const frameInterval = duration / frames;

  // Launch browser with specific viewport
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 800, height: 600 },
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

  // Create base HTML template
  const baseHtml = `
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
            width: 800px;
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
  await page.setContent(baseHtml);
  await page.waitForTimeout(500); // Wait for initial render

  // Capture each frame
  const framePaths: string[] = [];
  for (let i = 0; i < frames; i++) {
    // Capture frame
    const framePath = path.join(
      gifDir,
      `${name}-frame-${i.toString().padStart(3, "0")}.png`
    );
    await page.screenshot({
      path: framePath,
      type: "png",
      animations: "disabled",
      scale: "css",
    });
    framePaths.push(framePath);

    // Wait for next frame interval
    await page.waitForTimeout(frameInterval);

    // Execute any interactions for this frame if needed
    // This could be extended to accept an array of interactions to perform at specific times
    if (i === 1) {
      // Example: simulate mouse events for the second frame - adjust as needed
      await page.mouse.move(200, 200);
    } else if (i === 3) {
      await page.mouse.down();
    } else if (i === 5) {
      await page.mouse.move(300, 250);
    } else if (i === 7) {
      await page.mouse.up();
    }
  }

  // Close the browser
  await browser.close();

  // Create a GIF from the captured frames
  const outputPath = path.join(gifDir, `${name}.gif`);

  try {
    // Use node-html-to-image to create a GIF
    await nodeHtmlToImage({
      output: outputPath,
      type: "gif",
      html: "<html><body></body></html>", // Dummy HTML
      puppeteerArgs: {
        args: ["--no-sandbox"],
      },
      // @ts-expect-error - Type definition is missing this option
      animations: [
        {
          frames: framePaths,
          frameDuration: frameInterval,
        },
      ],
    });

    console.log(`GIF created: ${outputPath}`);

    // Clean up individual frame images
    for (const framePath of framePaths) {
      await fs.unlink(framePath);
    }
  } catch (error) {
    console.error("Error creating GIF:", error);
    throw error;
  }
}
