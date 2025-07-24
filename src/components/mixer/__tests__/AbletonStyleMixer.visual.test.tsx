import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AbletonStyleMixer } from '../AbletonStyleMixer';
import { Track, TrackType, AutomationMode } from '../../../types/core';

describe('AbletonStyleMixer Visual Tests', () => {
  const mockTracks: Track[] = [
    {
      id: 'track-1',
      name: 'Audio Track',
      type: TrackType.Audio,
      color: '#ff6b35',
      volume: { value: 0.8, isAutomated: false },
      pan: { value: 0, isAutomated: false },
      mute: false,
      solo: false,
      armed: false,
      automation: false,
      automationMode: AutomationMode.Read,
      fx: {
        preset: null,
        selectedEffectIndex: 0,
        effects: [],
      },
      automationLanes: [],
      clips: [],
    },
    {
      id: 'track-2',
      name: 'MIDI Track',
      type: TrackType.Midi,
      color: '#4caf50',
      volume: { value: 0.6, isAutomated: false },
      pan: { value: -0.3, isAutomated: false },
      mute: false,
      solo: true,
      armed: true,
      automation: false,
      automationMode: AutomationMode.Read,
      fx: {
        preset: null,
        selectedEffectIndex: 0,
        effects: [],
      },
      automationLanes: [],
      clips: [],
    },
  ];

  const mockHandlers = {
    onVolumeChange: vi.fn(),
    onPanChange: vi.fn(),
    onMuteToggle: vi.fn(),
    onSoloToggle: vi.fn(),
    onArmToggle: vi.fn(),
  };

  it('visual test: renders clean Ableton-style mixer without text below buttons @visual', () => {
    const { container } = render(
      <div style={{ width: '400px', height: '500px', backgroundColor: '#1a1a1a', padding: '20px' }}>
        <AbletonStyleMixer
          tracks={mockTracks}
          {...mockHandlers}
        />
      </div>
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('visual test: renders single track mixer strip @visual', () => {
    const { container } = render(
      <div style={{ width: '100px', height: '500px', backgroundColor: '#1a1a1a', padding: '20px' }}>
        <AbletonStyleMixer
          tracks={[mockTracks[0]]}
          {...mockHandlers}
        />
      </div>
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('visual test: renders mixer with active states @visual', () => {
    const activeTrack: Track = {
      ...mockTracks[0],
      mute: true,
      solo: true,
      armed: true,
      volume: { value: 1.0, isAutomated: false },
      pan: { value: 0.5, isAutomated: false },
    };

    const { container } = render(
      <div style={{ width: '100px', height: '500px', backgroundColor: '#1a1a1a', padding: '20px' }}>
        <AbletonStyleMixer
          tracks={[activeTrack]}
          {...mockHandlers}
        />
      </div>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
