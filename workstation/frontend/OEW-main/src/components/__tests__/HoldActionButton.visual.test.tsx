/**
 * HoldActionButton Visual Tests
 * 
 * This file contains visual regression tests for the HoldActionButton component.
 * These tests generate snapshots to visually verify the component's appearance.
 * 
 * @fileoverview Visual tests for HoldActionButton component
 * @since 2024
 */

import { render } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import HoldActionButton from '../HoldActionButton';
import { expectScreenshot } from '../../test/helpers/screenshot';

describe('HoldActionButton @visual', () => {
  const isCI = process.env.CI === 'true';
  const isCodespaces = process.env.CODESPACES === 'true';
  const hasDisplay = process.env.DISPLAY || process.env.WAYLAND_DISPLAY;
  const forceVisualTests = process.env.FORCE_VISUAL_TESTS === 'true';
  const shouldSkipVisualTests = !forceVisualTests && (isCI || isCodespaces || !hasDisplay);

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders default hold action button @visual', async () => {
    if (shouldSkipVisualTests) {
      console.log('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }
    const onHoldAction = vi.fn();
    
    const { container } = render(
      <div style={{ padding: '20px', background: '#f0f0f0' }}>
        <HoldActionButton 
          interval={100}
          onHoldAction={onHoldAction}
          data-testid="default-hold-button"
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Click and Hold
        </HoldActionButton>
      </div>
    );

    await expectScreenshot(container.firstElementChild as HTMLElement, 'hold-action-button-default');
  }, 30000); // Increase timeout to 30 seconds

  it('renders styled hold action button @visual', async () => {
    if (shouldSkipVisualTests) {
      console.log('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }
    const onHoldAction = vi.fn();
    
    const { container } = render(
      <div style={{ padding: '20px', background: '#1a1a1a' }}>
        <HoldActionButton 
          interval={50}
          delay={200}
          onHoldAction={onHoldAction}
          data-testid="styled-hold-button"
          style={{
            padding: '15px 30px',
            background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
            color: 'white',
            border: '2px solid #ff5252',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(255, 107, 107, 0.3)'
          }}
        >
          🎵 Record Track
        </HoldActionButton>
      </div>
    );

    await expectScreenshot(container.firstElementChild as HTMLElement, 'hold-action-button-styled');
  }, 30000);

  it('renders disabled-style hold action button @visual', async () => {
    if (shouldSkipVisualTests) {
      console.log('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }
    const onHoldAction = vi.fn();
    
    const { container } = render(
      <div style={{ padding: '20px', background: '#f8f9fa' }}>
        <HoldActionButton 
          interval={100}
          onHoldAction={onHoldAction}
          data-testid="disabled-hold-button"
          style={{
            padding: '12px 24px',
            background: '#6c757d',
            color: '#ffffff',
            border: '1px solid #5a6268',
            borderRadius: '4px',
            cursor: 'not-allowed',
            opacity: 0.6
          }}
        >
          Unavailable
        </HoldActionButton>
      </div>
    );

    await expectScreenshot(container.firstElementChild as HTMLElement, 'hold-action-button-disabled');
  }, 30000);

  it('renders hold action button with custom content @visual', async () => {
    if (shouldSkipVisualTests) {
      console.log('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }
    const onHoldAction = vi.fn();
    
    const { container } = render(
      <div style={{ padding: '20px', background: '#2d3748' }}>
        <HoldActionButton 
          interval={75}
          holdActionOnMouseDown={false}
          onHoldAction={onHoldAction}
          data-testid="custom-hold-button"
          style={{
            padding: '10px',
            background: '#4a5568',
            color: '#e2e8f0',
            border: '1px solid #718096',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '18px' }}>▶️</span>
          <span>Play/Hold</span>
          <span style={{ fontSize: '12px', opacity: 0.7 }}>(Hold for repeat)</span>
        </HoldActionButton>
      </div>
    );

    await expectScreenshot(container.firstElementChild as HTMLElement, 'hold-action-button-custom');
  }, 30000);
});
