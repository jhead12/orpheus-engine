import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { ClipComponent } from '../ClipComponent';
import { expectScreenshot } from '@orpheus/test/helpers';

describe('ClipComponent Visual Tests', () => {
  const mockClip = {
    id: 'clip-1',
    name: 'Test Clip',
    color: '#ff0000',
    start: 0,
    duration: 4,
    automationLanes: [{
      id: 'lane-1',
      show: true,
      nodes: [
        { time: 0, value: 0.5 },
        { time: 2, value: 0.8 }
      ]
    }]
  };

  it('visual test: renders clip with automation @visual', async () => {
    const container = document.createElement('div');
    container.style.cssText = `
      width: 800px;
      height: 200px;
      background: #1e1e1e;
      position: relative;
    `;
    document.body.appendChild(container);

    render(
      <ClipComponent
        clip={mockClip}
        track={{
          id: 'track-1',
          name: 'Test Track',
          color: '#ff0000',
          automation: true
        }}
      />,
      { container }
    );

    await new Promise(resolve => setTimeout(resolve, 1000));
    await expectScreenshot(container, 'clip-with-automation');
    document.body.removeChild(container);
  });
});
