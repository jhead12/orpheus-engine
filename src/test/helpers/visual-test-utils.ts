/**
 * Visual Test Utilities with Processing Monitor Integration
 * Handles CPU-intensive audio processing and timing issues in browser environments
 */

import { waitForAudioComponentReady, getProcessingMonitor } from './processing-monitor';
import { expectScreenshot } from './screenshot';

export interface VisualTestOptions {
  /**
   * Maximum time to wait for component stability (milliseconds)
   */
  timeout?: number;
  
  /**
   * Duration to wait for DOM stability after initial processing (milliseconds)
   */
  stabilityDuration?: number;
  
  /**
   * Whether to include audio processing monitoring
   */
  includeAudioProcessing?: boolean;
  
  /**
   * Additional wait time after stability check (milliseconds)
   */
  additionalWait?: number;
  
  /**
   * Screenshot comparison threshold (0-1)
   */
  threshold?: number;
  
  /**
   * Container setup function
   */
  setupContainer?: () => HTMLElement;
  
  /**
   * Cleanup function to call after test
   */
  cleanup?: () => void;
}

/**
 * Enhanced screenshot testing with processing monitor integration
 * Handles CPU-intensive audio workstation components
 */
export async function expectVisualSnapshot(
  element: HTMLElement,
  name: string,
  options: VisualTestOptions = {}
): Promise<void> {
  const {
    timeout = 15000,
    stabilityDuration = 1000,
    includeAudioProcessing = true,
    additionalWait = 200,
    threshold = 0.01
  } = options;

  console.log(`📸 Starting visual snapshot for "${name}"...`);
  
  try {
    // Wait for audio component to be ready if needed
    if (includeAudioProcessing) {
      await waitForAudioComponentReady(element, {
        timeout,
        stabilityDuration,
        includeAudioProcessing: true
      });
    } else {
      // Basic stability check without audio processing
      const monitor = getProcessingMonitor();
      await monitor.waitForProcessingComplete(timeout);
      await monitor.waitForElementStable(element, stabilityDuration);
    }

    // Additional wait for final rendering
    if (additionalWait > 0) {
      await new Promise(resolve => setTimeout(resolve, additionalWait));
    }

    console.log(`📷 Taking screenshot for "${name}"...`);
    
    // Take the actual screenshot
    await expectScreenshot(element, name, threshold);
    
    console.log(`✅ Visual snapshot "${name}" completed successfully`);
    
  } catch (error) {
    console.error(`❌ Visual snapshot "${name}" failed:`, error);
    throw error;
  }
}

/**
 * Setup a standardized visual test container with proper CSS properties
 */
export function setupVisualTestContainer(options: {
  width?: number;
  height?: number;
  background?: string;
  customProps?: Record<string, string>;
} = {}): HTMLElement {
  const {
    width = 784,
    height = 600,
    background = "#1e1e1e",
    customProps = {}
  } = options;

  const container = document.createElement("div");
  container.style.cssText = `
    width: ${width}px;
    height: ${height}px;
    background: ${background};
    position: relative;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Add standard CSS custom properties that audio components might need
  const standardProps = {
    "--bg1": "#ffffff",
    "--bg2": "#f5f5f5", 
    "--bg7": "#e0e0e0",
    "--fg1": "#000000",
    "--border4": "#cccccc",
    "--color1": "#2196f3",
    "--border-primary": "#333",
    "--bg-secondary": "#2a2a2a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#cccccc",
    "--accent-color": "#4a90e2",
    "--danger-color": "#ff4444",
    "--success-color": "#44ff44",
    "--warning-color": "#ffaa44",
    ...customProps
  };

  Object.entries(standardProps).forEach(([prop, value]) => {
    container.style.setProperty(prop, value);
  });

  document.body.appendChild(container);
  return container;
}

/**
 * Cleanup visual test container
 */
export function cleanupVisualTestContainer(container: HTMLElement): void {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
  
  // Clean up any style tags that might have been added
  const styleTags = document.head.querySelectorAll("style[data-test]");
  styleTags.forEach(tag => tag.remove());
}

/**
 * Enhanced visual test wrapper that handles the complete test lifecycle
 */
export async function runVisualTest(
  name: string,
  testFn: (container: HTMLElement) => Promise<HTMLElement>,
  options: VisualTestOptions = {}
): Promise<void> {
  console.log(`🎬 Starting visual test: "${name}"`);
  
  const container = options.setupContainer?.() || setupVisualTestContainer();
  let testElement: HTMLElement | null = null;
  
  try {
    // Run the test function to get the element to screenshot
    testElement = await testFn(container);
    
    // Take the visual snapshot with processing monitoring
    await expectVisualSnapshot(testElement, name, options);
    
  } catch (error) {
    console.error(`❌ Visual test "${name}" failed:`, error);
    throw error;
  } finally {
    // Cleanup
    if (options.cleanup) {
      options.cleanup();
    } else {
      cleanupVisualTestContainer(container);
    }
    
    console.log(`🧹 Cleaned up visual test: "${name}"`);
  }
}

/**
 * Audio-specific visual test helper for workstation components
 */
export async function runAudioVisualTest(
  name: string,
  testFn: (container: HTMLElement) => Promise<HTMLElement>,
  options: Omit<VisualTestOptions, 'includeAudioProcessing'> = {}
): Promise<void> {
  return runVisualTest(name, testFn, {
    ...options,
    includeAudioProcessing: true,
    timeout: options.timeout || 20000, // Longer timeout for audio components
    stabilityDuration: options.stabilityDuration || 1500, // Longer stability check
    additionalWait: options.additionalWait || 500 // Extra wait for audio rendering
  });
}

/**
 * Quick visual test for simple components (non-audio)
 */
export async function runSimpleVisualTest(
  name: string,
  testFn: (container: HTMLElement) => Promise<HTMLElement>,
  options: Omit<VisualTestOptions, 'includeAudioProcessing'> = {}
): Promise<void> {
  return runVisualTest(name, testFn, {
    ...options,
    includeAudioProcessing: false,
    timeout: options.timeout || 10000, // Shorter timeout
    stabilityDuration: options.stabilityDuration || 500, // Shorter stability check
    additionalWait: options.additionalWait || 100 // Minimal additional wait
  });
}
