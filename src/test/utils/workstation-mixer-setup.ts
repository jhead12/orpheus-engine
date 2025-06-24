/**
 * Workstation Mixer Test Setup
 * This file provides all the constants and mock definitions needed for mixer tests
 * Import this file before any other imports to avoid hoisting issues
 */

import { vi } from 'vitest';

// Constants that are needed by component imports
// These avoid the "Cannot access before initialization" errors
export const TrackType = {
  Audio: 'audio',
  Midi: 'midi',
  Sequencer: 'sequencer',
};

export const AutomationMode = {
  Read: 'read',
  Write: 'write',
  Touch: 'touch',
  Latch: 'latch',
  Trim: 'trim',
  Off: 'off',
};

export const AutomationLaneEnvelope = {
  Volume: 'volume',
  Pan: 'pan',
  Send: 'send',
  Filter: 'filter',
  Tempo: 'tempo',
  Effect: 'effect',
};

export const ContextMenuType = {
  Track: 'track',
  Mixer: 'mixer',
  Timeline: 'timeline',
  Clip: 'clip',
  Node: 'node',
  Region: 'region',
  Lane: 'lane',
  Automation: 'automation',
  AddAutomationLane: 'add-automation-lane',
  FXChainPreset: 'fx-chain-preset',
};

// Add TimelinePosition class for tests
export class TimelinePosition {
  bars: number;
  beats: number;
  sixteenths: number;
  ticks: number;
  totalBeats: number;

  constructor(bars = 1, beats = 1, sixteenths = 1, ticks = 0) {
    this.bars = bars;
    this.beats = beats;
    this.sixteenths = sixteenths;
    this.ticks = ticks;
    this.totalBeats = this.calculateTotalBeats();
  }

  calculateTotalBeats() {
    return (
      (this.bars - 1) * 4 +
      (this.beats - 1) +
      (this.sixteenths - 1) / 4 +
      this.ticks / 960
    );
  }
}

// Setup audio and DOM mocks needed for Mixer tests
export const setupWorkstationMixerTest = () => {
  // Mock DOM APIs

  // Setup global AudioContext mock
  if (typeof window !== 'undefined') {
    // @ts-ignore: Mock implementation
    window.AudioContext =
      window.AudioContext ||
      (() => {
        return {
          createGain: () => ({
            connect: () => {},
            gain: { value: 1 },
          }),
          createAnalyser: () => ({
            connect: () => {},
            fftSize: 2048,
            getByteFrequencyData: () => {},
          }),
          destination: {},
          sampleRate: 44100,
        };
      });

    // @ts-ignore: Mock implementation
    window.webkitAudioContext = window.AudioContext;
  }

  // Set up global AudioContext for Node.js environment
  global.AudioContext =
    global.AudioContext ||
    (() => {
      return {
        createGain: () => ({
          connect: () => {},
          gain: { value: 1 },
        }),
        createAnalyser: () => ({
          connect: () => {},
          fftSize: 2048,
          getByteFrequencyData: () => {},
        }),
        destination: {},
        sampleRate: 44100,
        state: 'running',
        resume: () => Promise.resolve(),
        suspend: () => Promise.resolve(),
      };
    });

  global.webkitAudioContext = global.AudioContext;

  // Additional window-specific mocks
  if (typeof window !== 'undefined') {
    // Mock AudioContext
    window.AudioContext =
      window.AudioContext ||
      (() => {
        return {
          createGain: vi.fn().mockReturnValue({
            connect: vi.fn(),
            gain: { value: 1 },
          }),
          createAnalyser: vi.fn().mockReturnValue({
            connect: vi.fn(),
            fftSize: 2048,
            getByteFrequencyData: vi.fn(),
          }),
          destination: {},
          sampleRate: 44100,
        };
      });
    window.webkitAudioContext = window.AudioContext;
  }

  // Setup global test mocks
  vi.mock('@orpheus/types/core', () => ({
    TrackType,
    AutomationMode,
    AutomationLaneEnvelope,
    ContextMenuType,
    TimelinePosition,
  }));
};
