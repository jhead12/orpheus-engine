import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import '@testing-library/jest-dom';
import Meter from '../Meter';

describe('Debug Meter DOM Structure', () => {
  it('should log DOM structure for 75% horizontal meter', () => {
    const { container } = render(<Meter percent={75} color="#ff0000" />);
    
    console.log('=== DOM Structure ===');
    console.log(container.innerHTML);
    
    // Test all possible selectors to understand the structure
    const selectors = [
      'div',
      'div > div',  
      'div > div > div',
      'div > div > div:first-child',
      'div > div > div:first-child > div'
    ];
    
    selectors.forEach(selector => {
      const elements = container.querySelectorAll(selector);
      console.log(`\n=== Selector: ${selector} (${elements.length} matches) ===`);
      elements.forEach((el, i) => {
        const element = el as HTMLElement;
        console.log(`Element ${i}:`, element.outerHTML);
        if (element.style.cssText) {
          console.log(`  Styles: ${element.style.cssText}`);
        }
      });
    });
  });
});