/**
 * Canvas Mock Utilities for Testing
 * 
 * This module provides comprehensive mocking utilities for HTML5 Canvas elements
 * in test environments. Canvas operations are not available in Node.js/JSDOM,
 * so these mocks allow components to render and interact with canvas elements
 * during testing without actual rendering.
 * 
 * The Timeline component and other DAW components rely heavily on canvas for:
 * - Audio waveform visualization
 * - Timeline rendering and interaction
 * - Track visualization
 * - Real-time audio meters
 * 
 * @fileoverview Canvas mocking utilities for component testing
 * @author Orpheus Engine Team
 * @since 2024
 */

import { vi } from 'vitest';

/**
 * Canvas Mock for Testing
 * Provides proper mocking for HTMLCanvasElement and CanvasRenderingContext2D
 */

/**
 * Creates a comprehensive mock of CanvasRenderingContext2D
 * 
 * This function creates a mock object that implements all the essential
 * methods and properties of the Canvas 2D rendering context. All methods
 * are mocked with Vitest spies for easy testing and verification.
 * 
 * Used extensively by Timeline component for:
 * - Drawing track lanes and markers
 * - Rendering playhead position
 * - Drawing audio waveforms
 * - Creating visual feedback for user interactions
 * 
 * @returns Complete mock implementation of CanvasRenderingContext2D with all methods stubbed
 */
export const createMockCanvasContext = () => ({
  // Rectangle drawing methods - used for backgrounds and track lanes
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  
  // Path drawing methods - used for waveforms and complex shapes
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  closePath: vi.fn(),
  
  // Text rendering methods - used for labels and timestamps
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })), // Returns mock text measurement
  
  // State management - used for complex rendering operations
  save: vi.fn(),
  restore: vi.fn(),
  
  // Transformation methods - used for scaling and positioning
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  setTransform: vi.fn(),
  getTransform: vi.fn(),
  resetTransform: vi.fn(),
  
  // Gradient creation - used for visual effects
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  
  // Advanced path methods - used for curves and complex shapes
  arc: vi.fn(),
  arcTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  
  // Hit testing methods - used for user interaction
  isPointInPath: vi.fn(() => false),
  isPointInStroke: vi.fn(() => false),
  
  // Image data methods - used for pixel manipulation
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
  })),
  drawImage: vi.fn(),
  
    // Canvas reference
  canvas: null,
  
  // Drawing style properties with DAW-appropriate defaults
  globalAlpha: 1,
  strokeStyle: '#000000',
  fillStyle: '#000000',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  setLineDash: vi.fn(),
  getLineDash: vi.fn(() => []),
  lineDashOffset: 0,
  font: '10px Arial',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  globalCompositeOperation: 'source-over',
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
});

/**
 * Creates a mock canvas element with proper DOM properties
 * 
 * This function creates a real canvas element and then enhances it with
 * mock functionality. This approach ensures DOM compatibility while
 * providing predictable behavior for testing.
 * 
 * @returns Object containing the mock canvas element and its context
 */
export const createMockCanvas = (originalCreateElement?: Document['createElement']) => {
  const createElement = originalCreateElement || document.createElement.bind(document);
  const canvas = createElement('canvas') as HTMLCanvasElement;
  const mockContext = createMockCanvasContext();
  
  // Override getContext to return our mock context
  canvas.getContext = vi.fn((contextType: string) => {
    if (contextType === '2d') {
      return mockContext as any;
    }
    return null;
  }) as any;

  // Set default dimensions for DAW timeline (wide format)
  Object.defineProperty(canvas, 'width', {
    value: 800,
    writable: true,
  });
  
  Object.defineProperty(canvas, 'height', {
    value: 400,
    writable: true,
  });

  return { canvas, mockContext };
};

/**
 * Sets up global canvas mocking for test environment
 * 
 * This function provides a minimal canvas mock that works with React and JSDOM.
 * Instead of overriding createElement, we mock the HTMLCanvasElement prototype.
 * 
 * @returns Cleanup function to restore original behavior
 */
// Global canvas mock setup function
export const setupCanvasMock = () => {
  // Store original getContext method
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  
  // Override getContext to return our mock context
  HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
    if (contextType === '2d') {
      return createMockCanvasContext();
    }
    return null;
  }) as any;

  // Return cleanup function to restore original behavior
  return () => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  };
};

/**
 * Mock Canvas Class for JSDOM Compatibility
 * 
 * This class provides a complete HTMLCanvasElement replacement that can be
 * used in environments where the real HTMLCanvasElement is not available
 * or needs to be completely mocked.
 * 
 * Used primarily for:
 * - Timeline component canvas operations
 * - Audio visualization components
 * - Meter and VU display components
 */
// Global MockCanvas class for use in tests
export class MockCanvas {
  /** Canvas width in pixels - DAW timeline default */
  width = 800;
  /** Canvas height in pixels - DAW timeline default */
  height = 400;
  
  /** Mock getContext method that returns our mock 2D context */
  getContext = vi.fn(() => createMockCanvasContext());
  
  /** Mock data URL export - returns placeholder data */
  toDataURL = vi.fn(() => 'data:image/png;base64,mock');
  /** Mock blob export for image downloads */
  toBlob = vi.fn();
  
  /** Mock event handling for canvas interactions */
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
}

/**
 * Sets up global canvas environment for testing
 * 
 * This function configures the global environment to support canvas
 * operations in test mode. It replaces the HTMLCanvasElement constructor
 * with our mock version globally.
 * 
 * Call this in test setup to ensure all canvas creation throughout
 * the test suite uses our mock implementation.
 */
// Setup for Vitest environment
export const setupCanvasEnvironment = () => {
  // Replace global HTMLCanvasElement with our mock
  global.HTMLCanvasElement = MockCanvas as any;
  
  // Also set it on window object for browser-like behavior
  Object.defineProperty(window, 'HTMLCanvasElement', {
    value: MockCanvas,
    writable: true,
  });
};