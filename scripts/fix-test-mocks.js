/**
 * fix-test-mocks.js
 * 
 * This script creates and updates mock implementations for tests.
 * It addresses issues with missing mocks for WorkstationContext, audio processing,
 * and other commonly used components in tests.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const OEW_MAIN_SRC = path.join(projectRoot, 'workstation/frontend/OEW-main/src');
const MOCK_HELPERS_PATH = path.join(OEW_MAIN_SRC, 'test/mockHelpers.ts');
const SETUP_TESTS_PATH = path.join(OEW_MAIN_SRC, 'setupTests.ts');

// Ensure the test directory exists
const ensureTestDirectory = async () => {
  const testDir = path.join(OEW_MAIN_SRC, 'test');
  try {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    console.log('✅ Test directory structure verified');
  } catch (err) {
    // Directory already exists or another error
    if (err.code !== 'EEXIST') {
      console.error('Error creating test directory:', err);
    }
  }
};

// Create or update the mockHelpers.ts file
const createMockHelpers = async () => {
  const helperContent = `/**
 * Mock Helpers for Tests
 * 
 * This file provides common mock implementations for various
 * components, contexts, and services used throughout the tests.
 */

import React from 'react';

/**
 * Creates a mock for the WorkstationContext with all necessary functions.
 */
export const createMockWorkstationContext = (overrides = {}) => ({
  isLoading: false,
  loadedProject: null,
  reloadProject: jest.fn(),
  saveProject: jest.fn().mockResolvedValue(true),
  openProject: jest.fn().mockResolvedValue(true),
  createProject: jest.fn().mockResolvedValue(true),
  exportProject: jest.fn().mockResolvedValue(true),
  closeProject: jest.fn(),
  hasUnsavedChanges: false,
  setHasUnsavedChanges: jest.fn(),
  addTrack: jest.fn(),
  removeTrack: jest.fn(),
  setProjectName: jest.fn(),
  renameTrack: jest.fn(),
  updateTrackSettings: jest.fn(),
  projectInfo: {
    name: 'Test Project',
    tracks: [],
    tempo: 120,
    timeSignature: '4/4',
  },
  ...overrides,
});

/**
 * Creates a mock AudioContext with all necessary audio processing functionality.
 */
export const createMockAudioContext = () => ({
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { value: 1, setValueAtTime: jest.fn() },
  }),
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 440, setValueAtTime: jest.fn() },
    type: 'sine',
  }),
  createAnalyser: jest.fn().mockReturnValue({
    connect: jest.fn(),
    fftSize: 2048,
    getByteTimeDomainData: jest.fn(),
    getByteFrequencyData: jest.fn(),
  }),
  currentTime: 0,
  destination: { connect: jest.fn() },
});

/**
 * Creates mocked hooks for various contexts
 */
export const createMockUseContext = (contextValue) => () => contextValue;

/**
 * Context wrapper components for testing
 */
export const MockWorkstationContextProvider = ({ children, contextValue = {} }) => {
  const mockContext = createMockWorkstationContext(contextValue);
  // Mock the context using React.createContext().Provider
  const WorkstationContext = React.createContext(mockContext);
  return (
    <WorkstationContext.Provider value={mockContext}>
      {children}
    </WorkstationContext.Provider>
  );
};

/**
 * Create a mock for WindowSizeContext
 */
export const createMockWindowSizeContext = (overrides = {}) => ({
  windowWidth: 1920,
  windowHeight: 1080,
  isSmallScreen: false,
  isMediumScreen: false,
  isLargeScreen: true,
  ...overrides,
});

/**
 * Mock for IntersectionObserver
 */
export class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.observables = new Map();
  }

  observe(element) {
    this.observables.set(element, {
      isIntersecting: false,
      intersectionRatio: 0,
    });
  }

  unobserve(element) {
    this.observables.delete(element);
  }

  disconnect() {
    this.observables.clear();
  }

  // Helper method to simulate intersection
  simulateIntersection(element, isIntersecting = true, ratio = 1) {
    if (this.observables.has(element)) {
      const entry = {
        isIntersecting,
        intersectionRatio: ratio,
        target: element,
        time: Date.now(),
        boundingClientRect: element.getBoundingClientRect(),
        intersectionRect: element.getBoundingClientRect(),
        rootBounds: null,
      };
      this.callback([entry]);
    }
  }
}

/**
 * Mock for ResizeObserver
 */
export class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
    this.observables = new Map();
  }

  observe(element) {
    this.observables.set(element, {
      contentRect: element.getBoundingClientRect(),
    });
  }

  unobserve(element) {
    this.observables.delete(element);
  }

  disconnect() {
    this.observables.clear();
  }

  // Helper to simulate resize
  simulateResize(element, width, height) {
    if (this.observables.has(element)) {
      const contentRect = {
        width,
        height,
        top: 0,
        left: 0,
        right: width,
        bottom: height,
        x: 0,
        y: 0,
      };
      
      this.callback([
        {
          target: element,
          contentRect,
        },
      ]);
    }
  }
}
`;

  try {
    fs.writeFileSync(MOCK_HELPERS_PATH, helperContent);
    console.log(`✅ Created mock helpers at ${MOCK_HELPERS_PATH}`);
  } catch (err) {
    console.error(`Error creating mock helpers file:`, err);
    return false;
  }
  return true;
};

// Update setupTests.ts to include our mocks
const updateSetupTests = async () => {
  let setupContent = '';
  try {
    if (fs.existsSync(SETUP_TESTS_PATH)) {
      setupContent = fs.readFileSync(SETUP_TESTS_PATH, 'utf8');
    }
  } catch (err) {
    console.error(`Error reading setupTests.ts:`, err);
    return false;
  }

  // Add our mock setup to the file if it's not already there
  const mockImports = `// Mock implementations for tests
import { MockIntersectionObserver, MockResizeObserver } from './test/mockHelpers';
import { vi } from 'vitest';

// Mock IntersectionObserver
window.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
window.ResizeObserver = MockResizeObserver;

// Mock Audio Context
Object.defineProperty(window, 'AudioContext', {
  value: vi.fn().mockImplementation(() => ({
    createGain: vi.fn().mockReturnValue({
      connect: vi.fn(),
      gain: { value: 1, setValueAtTime: vi.fn() },
    }),
    createOscillator: vi.fn().mockReturnValue({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 440, setValueAtTime: vi.fn() },
      type: 'sine',
    }),
    createAnalyser: vi.fn().mockReturnValue({
      connect: vi.fn(),
      fftSize: 2048,
      getByteTimeDomainData: vi.fn(),
      getByteFrequencyData: vi.fn(),
    }),
    currentTime: 0,
    destination: { connect: vi.fn() },
  })),
  writable: false,
});

// Mock WebAudio API as needed
Object.defineProperty(window, 'AudioBuffer', {
  value: vi.fn().mockImplementation(() => ({
    length: 0,
    duration: 0,
    sampleRate: 44100,
    numberOfChannels: 2,
    getChannelData: vi.fn().mockReturnValue(new Float32Array(0)),
  })),
  writable: false,
});`;

  // Check if we need to add the mocks
  if (!setupContent.includes('MockIntersectionObserver') && !setupContent.includes('MockResizeObserver')) {
    // Determine where to insert our mocks
    if (setupContent.trim() === '') {
      // Empty file, just use our content
      setupContent = mockImports;
    } else {
      // Add our mocks after existing imports
      setupContent += '\n\n' + mockImports;
    }

    try {
      fs.writeFileSync(SETUP_TESTS_PATH, setupContent);
      console.log(`✅ Updated setup tests at ${SETUP_TESTS_PATH}`);
    } catch (err) {
      console.error(`Error updating setupTests.ts:`, err);
      return false;
    }
  } else {
    console.log('⚠️ Mock setup already exists in setupTests.ts');
  }

  return true;
};

async function fixTestMocks() {
  try {
    console.log('🔧 Setting up test mocks...');
    
    await ensureTestDirectory();
    const mockHelpersCreated = await createMockHelpers();
    const setupTestsUpdated = await updateSetupTests();
    
    if (mockHelpersCreated && setupTestsUpdated) {
      console.log('\n🎉 Test mock fixes complete!');
    } else {
      console.log('\n⚠️ Some mock fixes could not be applied. Check the logs above for details.');
    }
  } catch (err) {
    console.error('Error fixing test mocks:', err);
    process.exit(1);
  }
}

// Run the script
fixTestMocks();
