import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

// Simple component with the elements we're trying to test
const SimpleComponent = () => (
  <div>
    <div data-testid="meter" className="meter-container">
      <div className="peak-display">-∞</div>
    </div>
    <input data-testid="knob" type="range" title="Pan: 0" />
  </div>
);

describe('DOM Element Testing', () => {
  it('should find peak display by class name', () => {
    const { container } = render(<SimpleComponent />);
    
    console.log('Container HTML:', container.innerHTML);
    
    // Find peak display by class name
    const peakDisplays = container.querySelectorAll('.peak-display');
    console.log('Peak displays count:', peakDisplays.length);
    expect(peakDisplays.length).toBe(1);
  });
  
  it('should find knob by test id', () => {
    const { container } = render(<SimpleComponent />);
    
    // Find knobs using querySelector with data-testid
    const knobs = container.querySelectorAll('[data-testid="knob"]');
    console.log('Knobs count:', knobs.length);
    expect(knobs.length).toBe(1);
  });
});
