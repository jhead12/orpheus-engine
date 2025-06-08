import { describe, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { expectScreenshot } from '../../../test/helpers/screenshot';
{{#if captureGif}}
import { recordGif } from '../../../test/helpers/gif-recorder';
{{/if}}
import { {{ComponentName}} } from '../{{ComponentPath}}';

describe('{{ComponentName}} Visual Tests', () => {
  {{#each states}}
  it('{{name}} {{../testNamePattern}}', async () => {
    const container = document.createElement('div');
    container.style.cssText = `{{../containerStyle}}`;
    document.body.appendChild(container);

    {{#if props}}
    const props = {{stringify props}};
    {{else}}
    const props = {{stringify ../props}};
    {{/if}}

    const { rerender } = render(<{{../ComponentName}} {...props} data-testid="{{../componentName}}" />, { container });

    {{#each interactions}}
    // {{type}} interaction
    fireEvent.{{type}}(screen.getByTestId('{{target}}'){{#if value}}, {{value}}{{/if}});
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for updates
    {{/each}}

    ${
      captureGif
        ? `// Record a GIF of any animations or state changes
    await recordGif(container, '${componentName.toLowerCase()}-${stateName}', ${
            animationDuration || 2000
          });`
        : `// Wait for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    await expectScreenshot(container, '${componentName.toLowerCase()}-${stateName}.png');`
    }

    document.body.removeChild(container);
  });
  {{/each}}
});
