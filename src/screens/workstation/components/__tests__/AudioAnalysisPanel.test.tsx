import { describe, it, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import AudioAnalysisPanel from '../AudioAnalysisPanel';

// Mock the hooks and contexts that AudioAnalysisPanel uses
vi.mock('../../../hooks/useMCPAnalysis', () => ({
  useMCPAnalysis: vi.fn(() => ({
    results: null,
    error: null,
    isLoading: false,
  })),
}));

vi.mock('@orpheus/contexts/AIContext', () => ({
  useAI: vi.fn(() => ({
    analyzeAudioFeatures: vi.fn().mockResolvedValue({}),
    suggestArrangement: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock('../../../services/pythonBridge', () => ({
  invokePythonAnalysis: vi.fn().mockResolvedValue({}),
}));

describe('AudioAnalysisPanel Visual Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

    const { container: renderContainer } = render(
      <AudioAnalysisPanel
        type="waveform"
        clip={{
          id: 'clip-1',
          audio: { buffer: audioBuffer },
          name: 'Test Clip',
          color: '#ff0000'
        }}
        results={null}
      />,
      { container }
    );

    // Wait for the component to render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add a test id to the root element for screenshot testing
    const analysisPanel = renderContainer.querySelector('.analysis-panel');
    if (analysisPanel) {
      analysisPanel.setAttribute('data-testid', 'side-panel');
    }
    
    // Wait a bit more for any canvas rendering
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For now, just verify the component renders without crashing
    expect(renderContainer.querySelector('canvas')).toBeInTheDocument();
    expect(renderContainer.querySelector('h3')).toBeInTheDocument();
    
    document.body.removeChild(container);
  });
});
