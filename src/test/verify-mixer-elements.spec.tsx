// Simple test file to verify DOM queries for mixer components
import { describe, it, expect } from 'vitest';

describe('DOM Queries for Mixer Components', () => {
  it('can find peak display elements', () => {
    // Create the DOM structure directly
    document.body.innerHTML = `
      <div data-testid="meter">
        <div class="peak-display">-∞</div>
      </div>
    `;
    
    // Query for the elements
    const peakElements = document.querySelectorAll('.peak-display');
    console.log(`Found ${peakElements.length} peak display elements`);
    console.log('Peak display text:', peakElements[0]?.textContent);
    
    // Assertions
    expect(peakElements.length).toBeGreaterThan(0);
    expect(peakElements[0].textContent).toBe('-∞');
    
    // Clean up
    document.body.innerHTML = '';
  });
  
  it('can find knob elements', () => {
    // Create the DOM structure directly
    document.body.innerHTML = `
      <input data-testid="knob" type="range" min="-100" max="100" value="0" title="Pan: 0">
    `;
    
    // Query for the elements
    const knobElements = document.querySelectorAll('[data-testid="knob"]');
    console.log(`Found ${knobElements.length} knob elements`);
    console.log('Knob title:', knobElements[0]?.getAttribute('title'));
    
    // Assertions
    expect(knobElements.length).toBeGreaterThan(0);
    expect(knobElements[0].getAttribute('title')).toBe('Pan: 0');
    
    // Clean up
    document.body.innerHTML = '';
  });
});
