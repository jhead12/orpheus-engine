/**
 * GIF recorder wrapper for visual tests
 */

import {
  recordComponentGif,
  createComponentHtml,
} from "../visual-agent/helpers/gif-recorder";

/**
 * Records a GIF of an element with animation
 *
 * @param element The element to record
 * @param name Filename for the GIF (without extension)
 * @param duration Duration of the recording in ms
 * @param fps Frames per second
 */
export async function recordGif(
  element: HTMLElement,
  name: string,
  duration = 2000,
  fps = 10
): Promise<string> {
  const elementHtml = element.outerHTML;
  const computedStyle = getComputedStyle(element);

  // Get relevant styles for the container
  const containerStyle = `
    width: ${computedStyle.width};
    height: ${computedStyle.height};
    background-color: ${computedStyle.backgroundColor};
    position: ${computedStyle.position};
    display: ${computedStyle.display};
    padding: ${computedStyle.padding};
    margin: ${computedStyle.margin};
    color: ${computedStyle.color};
    font-family: ${computedStyle.fontFamily};
    font-size: ${computedStyle.fontSize};
  `;

  const html = createComponentHtml(elementHtml, containerStyle);

  // Record the GIF
  return recordComponentGif(html, name, duration, fps);
}
