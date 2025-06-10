import { describe, test, expect } from 'vitest';

describe('Test Setup Validation', () => {
  test('basic test infrastructure works', () => {
    expect(1 + 1).toBe(2);
  });

  test('vitest globals are available', () => {
    expect(describe).toBeDefined();
    expect(test).toBeDefined();
    expect(expect).toBeDefined();
  });

  test('jsdom environment is available', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});
