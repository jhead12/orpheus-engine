import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Mock environment variables
process.env.PORT = '5175';
process.env.NODE_ENV = 'test';

// Clean up mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Global test setup/teardown if needed
beforeAll(() => {
  // Add any global setup (e.g., database connections)
});

afterAll(() => {
  // Add any global cleanup
});
