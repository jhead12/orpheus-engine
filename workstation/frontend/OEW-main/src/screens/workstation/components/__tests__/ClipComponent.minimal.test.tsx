import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

// Simple test to check if the test infrastructure works
describe('ClipComponent Minimal Test', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should render a simple div', () => {
    const { container } = render(<div data-testid="test-div">Hello World</div>);
    expect(container.querySelector('[data-testid="test-div"]')).toBeTruthy();
  });
});
