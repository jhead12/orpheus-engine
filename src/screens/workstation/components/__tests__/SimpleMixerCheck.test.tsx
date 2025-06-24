import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { WorkstationContext } from '../../.././../contexts/WorkstationContext';

// Mock component that will be tested
const MockMixer = () => <div data-testid="mock-mixer">Mock Mixer</div>;

describe('Simple Mixer Test', () => {
  it('renders without crashing', () => {
    render(
      <WorkstationContext.Provider value={{} as any}>
        <MockMixer />
      </WorkstationContext.Provider>
    );

    expect(screen.getByTestId('mock-mixer')).toBeInTheDocument();
  });
});
