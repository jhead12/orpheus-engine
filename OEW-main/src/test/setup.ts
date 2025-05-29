import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock electron APIs if they exist
global.window = global.window || {};
(global.window as any).electronAPI = {
  openFile: vi.fn(),
  saveFile: vi.fn(),
  // Add other electron API mocks as needed
};

// Setup any global test utilities
beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
});
