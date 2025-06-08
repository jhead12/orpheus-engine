import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import Meter from '../Meter';

describe('Debug Meter Structure', () => {
  it('logs DOM structure for debugging', () => {
    const { container } = render(<Meter percent={75} color="#ff0000" />);
    
    console.log('=== Full DOM Structure ===');
    console.log(container.innerHTML);
    
    console.log('\n=== All Divs ===');
    const allDivs = container.querySelectorAll('div');
    allDivs.forEach((div, i) => {
      console.log(`Div ${i}:`, div.outerHTML);
      console.log(`  Computed style width:`, div.style.width || 'none');
      console.log(`  Computed style background:`, div.style.background || 'none');
    });
    
    console.log('\n=== Different Selectors ===');
    const selectors = [
      'div',                           // Root
      'div > div',                     // Container
      'div > div > div',               // All children of container
      'div > div > div:first-child',   // First child (percentage container)
      'div > div > div:nth-child(1)',  // Same as above
      'div > div > div:first-child > div', // Fill element
    ];
    
    selectors.forEach(selector => {
      const elements = container.querySelectorAll(selector);
      console.log(`\n${selector}: ${elements.length} matches`);
      elements.forEach((el, i) => {
        console.log(`  [${i}] width: ${el.style.width || 'none'}, background: ${el.style.background || 'none'}`);
      });
    });
    
    // This test always passes - we're just debugging
    expect(true).toBe(true);
  });
});
