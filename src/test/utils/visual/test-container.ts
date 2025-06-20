import { afterEach, beforeEach } from 'vitest';

let testContainer: HTMLElement | null = null;

export function setupVisualTestContainer(style?: string): HTMLElement {
  testContainer = document.createElement('div');
  if (style) {
    testContainer.style.cssText = style;
  }
  document.body.appendChild(testContainer);
  return testContainer;
}

export function cleanupVisualTestContainer(): void {
  if (testContainer && document.body.contains(testContainer)) {
    document.body.removeChild(testContainer);
  }
  testContainer = null;
}

export function useVisualTestContainer(style?: string): void {
  beforeEach(() => {
    setupVisualTestContainer(style);
  });

  afterEach(() => {
    cleanupVisualTestContainer();
  });
}
