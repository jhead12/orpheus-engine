import { expectScreenshot } from "../../helpers/screenshot";
import { recordComponentGif } from "./gif-recorder";
import { VisualTestConfig } from "../types";

/**
 * Renders a visual test for a specific component state
 */
export async function renderVisualTest(
  config: VisualTestConfig,
  stateName: string
): Promise<void> {
  const state = config.states.find((s) => s.name === stateName);
  if (!state) {
    throw new Error(
      `State "${stateName}" not found in config for ${config.componentName}`
    );
  }

  // Create container
  const container = document.createElement("div");
  container.style.cssText =
    config.containerStyle ||
    `
    width: 400px;
    height: 300px;
    background: #1e1e1e;
    position: relative;
  `;
  document.body.appendChild(container);

  try {
    // Create a div element with innerHTML for the component
    const componentElement = document.createElement("div");
    componentElement.innerHTML = `<div data-component="${config.componentName}" data-testid="${config.componentName}">Component Placeholder</div>`;
    container.appendChild(componentElement);

    // Execute interactions
    if (state.interactions) {
      for (const interaction of state.interactions) {
        const target = container.querySelector(interaction.target);
        if (!target) {
          throw new Error(`Target "${interaction.target}" not found`);
        }

        // Wait for specified delay or default to 100ms
        await new Promise((resolve) =>
          setTimeout(resolve, interaction.delay || 100)
        );

        // Fire the interaction event
        const event = new MouseEvent(interaction.type, {
          ...interaction.value,
          bubbles: true,
        });
        target.dispatchEvent(event);
      }
    }

    // Wait for animations to settle
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Capture screenshot or GIF
    const filename = `${config.componentName.toLowerCase()}-${stateName}`;
    // Use type assertion to access captureGif property
    const stateWithCapture = state as { captureGif?: boolean; };
    const shouldCaptureGif = stateWithCapture.captureGif || config.captureGif;
    
    if (shouldCaptureGif) {
      const animationDuration = config.animationDuration || 2000;
      const htmlContent = container.outerHTML;
      await recordComponentGif(htmlContent, filename, animationDuration);
    } else {
      await expectScreenshot(container, filename);
    }
  } finally {
    document.body.removeChild(container);
  }
}
