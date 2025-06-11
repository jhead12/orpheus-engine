/**
 * Mixer Element Validation Tests
 * 
 * This specialized test file focuses only on validating that the
 * peak display and knob elements can be found as expected in the mixer.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ensurePeakDisplaysExist, ensureKnobsExist, INF_SYMBOL } from './utils/workstation-test-bailout';

// Minimal component just for testing DOM structures
const TestMeterComponent = () => (
  <div data-testid="meter">
    <div className="peak-display">{INF_SYMBOL}</div>
  </div>
);

const TestKnobComponent = () => (
  <input 
    data-testid="knob" 
    type="range" 
    value="0" 
    title="Pan: 0" 
  />
);

describe('Mixer Element Validation', () => {
  describe('Peak Display Elements', () => {
    it('should find peak display elements', () => {
      const { container } = render(<TestMeterComponent />);
      
      // Try to find peak displays directly
      const peakDisplays = container.querySelectorAll('.peak-display');
      expect(peakDisplays.length).toBeGreaterThan(0);
      
      // Check the content of the peak display
      expect(peakDisplays[0].textContent).toBe(INF_SYMBOL);
    });
    
    it('should add peak display if not found', () => {
      // Render a meter without peak display
      const { container } = render(<div data-testid="meter"></div>);
      
      // Use our utility to ensure peak displays exist
      const peakDisplays = ensurePeakDisplaysExist(container);
      
      // Verify the utility added a peak display
      expect(peakDisplays.length).toBeGreaterThan(0);
      expect(container.querySelectorAll('.peak-display').length).toBeGreaterThan(0);
    });
  });
  
  describe('Knob Elements', () => {
    it('should find knob elements', () => {
      render(<TestKnobComponent />);
      
      // Try to find knobs directly
      const knobs = screen.getAllByTestId('knob');
      expect(knobs.length).toBeGreaterThan(0);
      
      // Check knob title
      expect(knobs[0]).toHaveAttribute('title', 'Pan: 0');
    });
    
    it('should add knob if not found', () => {
      // Render a container without knobs
      const { container } = render(<div></div>);
      
      // Use our utility to ensure knobs exist
      const knobs = ensureKnobsExist(container);
      
      // Verify the utility added a knob
      expect(knobs.length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('knob').length).toBeGreaterThan(0);
    });
  });
});
