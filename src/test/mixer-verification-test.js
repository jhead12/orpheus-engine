import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Meter, Knob } from '@orpheus/components/widgets';
import React from 'react';

// Simple component to test meter and knob behavior
const TestComponent = () => (
  <div>
    <Meter data-testid="test-meter" percent={50} vertical={true} peak={0} />
    <Knob data-testid="test-knob" value={0} onChange={() => {}} parameter={0} min={-100} max={100} />
  </div>
);

describe('Widget Components Verification', () => {
  it('should render meter with peak display', () => {
    const { container } = render(<TestComponent />);
    
    // Check that we can find the meter
    const meter = screen.getByTestId('test-meter');
    expect(meter).toBeInTheDocument();
    
    // Check that the meter has a peak display
    const peakDisplay = container.querySelector('.peak-display');
    console.log('Peak display found:', peakDisplay?.outerHTML);
    expect(peakDisplay).not.toBeNull();
  });
  
  it('should render knob with proper attributes', () => {
    render(<TestComponent />);
    
    // Check that we can find the knob
    const knob = screen.getByTestId('test-knob');
    console.log('Knob found:', knob?.outerHTML);
    expect(knob).toBeInTheDocument();
    expect(knob).toHaveAttribute('title', expect.stringContaining('Pan:'));
  });
});
