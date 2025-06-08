import { VisualTestConfig } from "../types";

/**
 * Test configuration for the AudioAnalysisPanel component
 */
export const AudioAnalysisPanelConfig: VisualTestConfig = {
  componentName: "AudioAnalysisPanel",
  importPath: "../../screens/workstation/components/AudioAnalysisPanel",
  props: {
    audioFile: {
      id: "test-audio",
      name: "Test Audio.wav",
      path: "/path/to/test.wav",
      duration: 240,
      sampleRate: 44100,
      channels: 2
    },
    analysisData: {
      waveform: new Array(1000).fill(0).map(() => Math.random() * 2 - 1),
      spectral: {
        frequencies: new Array(512).fill(0).map((_, i) => i * 44100 / 1024),
        magnitudes: new Array(512).fill(0).map(() => Math.random() * -60)
      },
      peaks: [
        { time: 12.5, magnitude: -3.2 },
        { time: 45.8, magnitude: -2.1 },
        { time: 89.2, magnitude: -4.5 }
      ]
    },
    onAnalysisUpdate: () => {},
    onRegionSelect: () => {}
  },
  states: [
    {
      name: "waveform-view",
      props: {}
    },
    {
      name: "spectral-view",
      props: {
        viewMode: "spectral"
      }
    },
    {
      name: "peak-analysis",
      props: {
        viewMode: "peaks",
        showPeaks: true
      }
    },
    {
      name: "stereo-analysis",
      props: {
        viewMode: "stereo",
        audioFile: {
          id: "stereo-audio",
          name: "Stereo Track.wav",
          channels: 2
        }
      }
    },
    {
      name: "real-time-analysis",
      captureGif: true,
      interactions: [
        {
          type: "click",
          target: "[data-testid='analysis-play-button']",
          delay: 500
        }
      ]
    },
    {
      name: "region-selection",
      captureGif: true,
      interactions: [
        {
          type: "mousedown",
          target: "[data-testid='waveform-display']",
          value: { clientX: 100, clientY: 150 },
          delay: 300
        },
        {
          type: "mousemove",
          target: "[data-testid='waveform-display']",
          value: { clientX: 300, clientY: 150 },
          delay: 800
        },
        {
          type: "mouseup",
          target: "[data-testid='waveform-display']",
          delay: 1200
        }
      ]
    }
  ],
  containerStyle: "width: 800px; height: 500px; background: #1e1e1e; padding: 20px;",
  animationDuration: 3000
};
