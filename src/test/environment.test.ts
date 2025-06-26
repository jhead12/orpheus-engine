// Simple test to verify test environment works
import { describe, it, expect } from 'vitest';

describe('Test Environment', () => {
  it('should be able to run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to global expect', () => {
    expect(expect).toBeDefined();
  });

  it('should be able to handle async tests', async () => {
    const promise = Promise.resolve(42);
    const result = await promise;
    expect(result).toBe(42);
  });
});
