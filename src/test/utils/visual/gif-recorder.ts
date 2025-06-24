/**
 * GIF recording utility for visual testing
 */
export async function recordGif(
  element: HTMLElement,
  name: string,
  duration: number = 2000,
  options: {
    fps?: number;
    quality?: number;
    width?: number;
    height?: number;
  } = {},
): Promise<void> {
  const {
    fps = 30,
    quality = 10,
    width = element.clientWidth,
    height = element.clientHeight,
  } = options;

  // Create output directory if it doesn't exist
  const outputDir = '__snapshots__/gifs';
  await fs.mkdir(outputDir, { recursive: true });

  // Record frames
  const frames: Buffer[] = [];
  const startTime = Date.now();
  const interval = 1000 / fps;

  while (Date.now() - startTime < duration) {
    frames.push(await takeScreenshot(element));
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  // Create GIF from frames
  const encoder = new GIFEncoder(width, height);
  const outputPath = path.join(outputDir, `${name}.gif`);

  encoder.start();
  encoder.setDelay(interval);
  encoder.setQuality(quality);

  for (const frame of frames) {
    encoder.addFrame(frame);
  }

  encoder.finish();
  await fs.writeFile(outputPath, encoder.out.getData());
}

import GIFEncoder from 'gif-encoder-2';
import { promises as fs } from 'fs';
import path from 'path';
import { takeScreenshot } from './screenshot';

// Re-export screenshot helper for convenience
export { takeScreenshot };
