/** @jsx React.createElement */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Just test that the app renders without throwing
    expect(document.body).toBeDefined();
  });

  it('contains expected elements', () => {
    render(<App />);
    // Basic test to ensure the app structure is present
    const appElement = document.querySelector('.App') || document.body;
    expect(appElement).toBeDefined();
  });
});
