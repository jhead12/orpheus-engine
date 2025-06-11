/**
 * Standalone tests for the WorkstationMixer components
 * 
 * This file focuses only on peak displays and knobs to verify our DOM-based approach works
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ensurePeakDisplays, ensureKnobs, addPeakDisplayToMeter, hasChildWithClass } from './utils/mixer-test-bailout-utils';

// Simple component that renders a meter with optional peak display
const MeterComponent = ({ includePeak = false }: { includePeak?: boolean }) => (
  <div data-testid="meter">
    {includePeak && <div className="peak-display">-∞</div>}
  </div>
);

// Simple component that renders a knob with Pan title
const KnobComponent = () => (
  <input
    data-testid="knob"
    type="range"
    min="-100"
    max="100"
    title="Pan: 0"
  />
);

describe('Mixer Component Core DOM Tests', () => {
  describe('Peak Display Tests', () => {
    it('should find peak displays when they exist', () => {
      const { container } = render(<MeterComponent includePeak={true} />);
      
      const meters = screen.getAllByTestId('meter');
      expect(meters.length).toBe(1);
      
      const peakDisplays = container.querySelectorAll('.peak-display');
      expect(peakDisplays.length).toBe(1);
    });
    
    it('should add peak displays when they do not exist', () => {
      const { container } = render(<MeterComponent includePeak={false} />);
      
      // Initially no peak displays
      let peakDisplays = container.querySelectorAll('.peak-display');
      expect(peakDisplays.length).toBe(0);
      
      // Add peak displays using utility
      const addedCount = ensurePeakDisplays(container);
      expect(addedCount).toBe(1);
      
      // Now we should have peak displays
      peakDisplays = container.querySelectorAll('.peak-display');
      expect(peakDisplays.length).toBe(1);
    });
    
    it('should add peak display to specific meter', () => {
      const { container } = render(<MeterComponent includePeak={false} />);
      
      // Get the meter
      const meter = screen.getByTestId('meter');
      
      // Verify no peak display initially
      expect(hasChildWithClass(meter as HTMLElement, 'peak-display')).toBe(false);
      
      // Add peak display to this meter
      const peakDisplay = addPeakDisplayToMeter(meter as HTMLElement);
      
      // Verify peak display was added
      expect(hasChildWithClass(meter as HTMLElement, 'peak-display')).toBe(true);
      expect(peakDisplay.textContent).toBe('-∞');
    });
  });
  
  describe('Knob Tests', () => {
    it('should find knobs when they exist', () => {
      render(<KnobComponent />);
      
      const knobs = screen.getAllByTestId('knob');
      expect(knobs.length).toBe(1);
      expect(knobs[0]).toHaveAttribute('title', 'Pan: 0');
    });
    
    it('should add knobs when they do not exist', () => {
      const { container } = render(<div>No knobs here</div>);
      
      // Initially no knobs
      let knobs = screen.queryAllByTestId('knob');
      expect(knobs.length).toBe(0);
      
      // Add knobs using utility
      const addedCount = ensureKnobs(container);
      expect(addedCount).toBe(1);
      
      // Now we should have knobs
      knobs = screen.getAllByTestId('knob');
      expect(knobs.length).toBe(1);
      expect(knobs[0]).toHaveAttribute('title', 'Pan: 0');
    });
  });
});
