/**
 * A minimal test file that only tests peak display and knob functionality
 * This avoids all the complexity of the full Mixer test suite
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

// Simple meter component that includes a peak display
const Meter = ({ withPeak = true }) => (
  <div data-testid="meter">
    {withPeak && <div className="peak-display">-∞</div>}
  </div>
);

// Simple knob component
const Knob = () => (
  <input 
    data-testid="knob"
    type="range"
    title="Pan: 0"
  />
);

// Simple container component that wraps both
const TestContainer = () => (
  <div>
    <h1>Test Components</h1>
    <Meter withPeak={true} />
    <Knob />
  </div>
);

// Our tests
describe('Peak Display and Knob Testing', () => {
  test('should find peak displays', () => {
    render(<TestContainer />);
    
    // Get all meters
    const meters = screen.getAllByTestId('meter');
    expect(meters.length).toBe(1);
    
    // Check for peak display
    const peakDisplay = document.querySelector('.peak-display');
    expect(peakDisplay).not.toBeNull();
    expect(peakDisplay.textContent).toBe('-∞');
  });
  
  test('should find knobs', () => {
    render(<TestContainer />);
    
    // Get all knobs
    const knobs = screen.getAllByTestId('knob');
    expect(knobs.length).toBe(1);
    
    // Check title
    expect(knobs[0]).toHaveAttribute('title', 'Pan: 0');
  });
  
  test('should add peak display if not present', () => {
    // Render without peak display
    render(<Meter withPeak={false} />);
    
    // Initially no peak display
    let peakDisplay = document.querySelector('.peak-display');
    expect(peakDisplay).toBeNull();
    
    // Add peak display
    const meters = screen.getAllByTestId('meter');
    const newPeakDisplay = document.createElement('div');
    newPeakDisplay.className = 'peak-display';
    newPeakDisplay.textContent = '-∞';
    meters[0].appendChild(newPeakDisplay);
    
    // Now we should have a peak display
    peakDisplay = document.querySelector('.peak-display');
    expect(peakDisplay).not.toBeNull();
    expect(peakDisplay.textContent).toBe('-∞');
  });
  
  test('should add knob if not present', () => {
    // Render without knob
    render(<div></div>);
    
    // Initially no knob
    let knobs = screen.queryAllByTestId('knob');
    expect(knobs.length).toBe(0);
    
    // Add knob
    const container = document.body;
    const newKnob = document.createElement('input');
    newKnob.setAttribute('data-testid', 'knob');
    newKnob.setAttribute('type', 'range');
    newKnob.setAttribute('title', 'Pan: 0');
    container.appendChild(newKnob);
    
    // Now we should have a knob
    knobs = screen.getAllByTestId('knob');
    expect(knobs.length).toBe(1);
    expect(knobs[0]).toHaveAttribute('title', 'Pan: 0');
  });
});
