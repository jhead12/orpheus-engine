import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { AudioAnalysisPanel } from '../AudioAnalysisPanel';
import { expectScreenshot } from '@orpheus/test/helpers';

describe('AudioAnalysisPanel Visual Tests', () => {
  it('visual test: renders waveform analysis @visual', async () => {
    const container = document.createElement('div');
    container.style.cssText = `
      width: 600px;
      height: 400px;
      background: #1e1e1e;
      position: relative;
    `;
    document.body.appendChild(container);

    // Create a mock audio buffer with a simple waveform
    const audioBuffer = new AudioBuffer({
      length: 44100,
      numberOfChannels: 2,
      sampleRate: 44100
    });

    // Generate a simple sine wave for visualization
    const channel1 = audioBuffer.getChannelData(0);
    const channel2 = audioBuffer.getChannelData(1);
    for (let i = 0; i < 44100; i++) {
      const value = Math.sin(2 * Math.PI * 440 * i / 44100);
      channel1[i] = value;
      channel2[i] = value;
    }

    render(
      <AudioAnalysisPanel
        type="waveform"
        clip={{
          id: 'clip-1',
          audioBuffer,
          name: 'Test Clip',
          color: '#ff0000'
        }}
      />,
      { container }
    );

    // Wait for the waveform to render
    await new Promise(resolve => setTimeout(resolve, 2000));
    await expectScreenshot(container, 'audio-analysis-waveform');
    document.body.removeChild(container);
  });
});
