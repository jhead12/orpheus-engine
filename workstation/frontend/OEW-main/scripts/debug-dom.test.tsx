import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import '@testing-library/jest-dom';
import Meter from '../src/components/widgets/Meter';

describe('Debug DOM Structure', () => {
  it('logs DOM structure', () => {
    const { container } = render(<Meter percent={75} />);

    console.log('=== FULL DOM STRUCTURE ===');
    console.log(container.innerHTML);

    console.log('\n=== SELECTOR TESTS ===');
    const selectors = [
      'div',
      'div > div',
      'div > div > div',
      'div > div > div:first-child',
      'div > div > div:first-child > div'
    ];

    selectors.forEach(selector => {
      const elements = container.querySelectorAll(selector);
      console.log(`\n${selector}: ${elements.length} elements`);
      elements.forEach((el, i) => {
        console.log(`  [${i}]: ${el.outerHTML.substring(0, 100)}...`);
        if (el.style.cssText) {
          console.log(`       Styles: ${el.style.cssText}`);
        }
      });
    });
  });
});
