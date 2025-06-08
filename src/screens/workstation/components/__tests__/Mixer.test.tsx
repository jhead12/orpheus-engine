import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Mixer from '../Mixer';
import { MixerContext } from '@orpheus/contexts/MixerContext';
import { WorkstationContext } from '@orpheus/contexts/WorkstationContext';
import { Track, TrackType } from '@orpheus/types/core';

// Mock audio-related APIs
global.AudioContext = vi.fn().mockImplementation(() => ({
  createGain: vi.fn(() => ({
    gain: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  createAnalyser: vi.fn(() => ({
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  destination: {},
  state: 'running',
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

const mockTracks: Track[] = [
  {
    id: 'track-1',
    name: 'Vocals',
    type: TrackType.Audio,
    color: '#ff6b6b',
    mute: false,
    solo: false,
    armed: false,
    volume: 0.8,
    pan: 0.1,
    automation: false,
    clips: [],
    effects: [
      {
        id: 'reverb-1',
        name: 'Hall Reverb',
        type: 'native',
        enabled: true,
        parameters: { wetness: 0.3, roomSize: 0.7 },
      },
    ],
    automationLanes: [],
  },
  {
    id: 'track-2',
    name: 'Guitar',
    type: TrackType.Audio,
    color: '#4ecdc4',
    mute: true,
    solo: false,
    armed: true,
    volume: 0.6,
    pan: -0.2,
    automation: false,
    clips: [],
    effects: [],
    automationLanes: [],
  },
];

const mockMixerContext = {
  tracks: mockTracks,
  masterVolume: 0.8,
  masterPan: 0,
  masterMute: false,
  setMasterVolume: vi.fn(),
  setMasterPan: vi.fn(),
  setMasterMute: vi.fn(),
  setTrackVolume: vi.fn(),
  setTrackPan: vi.fn(),
  setTrackMute: vi.fn(),
  setTrackSolo: vi.fn(),
  setTrackArmed: vi.fn(),
  addEffect: vi.fn(),
  removeEffect: vi.fn(),
  updateEffect: vi.fn(),
  reorderEffects: vi.fn(),
  meters: {
    master: { left: 0.5, right: 0.6, peak: 0.8 },
    'track-1': { left: 0.3, right: 0.4, peak: 0.5 },
    'track-2': { left: 0.0, right: 0.0, peak: 0.0 },
  },
  isVisible: true,
  setIsVisible: vi.fn(),
  soloedTracks: [],
  muteAllTracks: vi.fn(),
  unmuteAllTracks: vi.fn(),
  resetAllLevels: vi.fn(),
};

const mockWorkstationContext = {
  tracks: mockTracks,
  updateTrack: vi.fn(),
  removeTrack: vi.fn(),
  duplicateTrack: vi.fn(),
  selection: { tracks: [], clips: [], region: null },
  setSelection: vi.fn(),
};

const renderMixer = (props = {}) => {
  return render(
    <WorkstationContext.Provider value={mockWorkstationContext as any}>
      <MixerContext.Provider value={mockMixerContext}>
        <Mixer {...props} />
      </MixerContext.Provider>
    </WorkstationContext.Provider>
  );
};

describe('Mixer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render all track channels', () => {
      renderMixer();
      
      expect(screen.getByTestId('mixer-channel-track-1')).toBeInTheDocument();
      expect(screen.getByTestId('mixer-channel-track-2')).toBeInTheDocument();
      expect(screen.getByText('Vocals')).toBeInTheDocument();
      expect(screen.getByText('Guitar')).toBeInTheDocument();
    });

    it('should render master channel', () => {
      renderMixer();
      
      const masterChannel = screen.getByTestId('mixer-master-channel');
      expect(masterChannel).toBeInTheDocument();
      expect(screen.getByText('Master')).toBeInTheDocument();
    });

    it('should show track colors', () => {
      renderMixer();
      
      const channel1 = screen.getByTestId('mixer-channel-track-1');
      const channel2 = screen.getByTestId('mixer-channel-track-2');
      
      expect(channel1).toHaveStyle({ borderColor: '#ff6b6b' });
      expect(channel2).toHaveStyle({ borderColor: '#4ecdc4' });
    });

    it('should show mute/solo/arm states', () => {
      renderMixer();
      
      const muteButton1 = screen.getByTestId('mixer-mute-track-1');
      const muteButton2 = screen.getByTestId('mixer-mute-track-2');
      const soloButton1 = screen.getByTestId('mixer-solo-track-1');
      const armButton2 = screen.getByTestId('mixer-arm-track-2');
      
      expect(muteButton1).not.toHaveClass('active');
      expect(muteButton2).toHaveClass('active'); // track-2 is muted
      expect(soloButton1).not.toHaveClass('active');
      expect(armButton2).toHaveClass('active'); // track-2 is armed
    });
  });

  describe('Volume Controls', () => {
    it('should update track volume on fader change', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const volumeFader = screen.getByTestId('mixer-volume-track-1');
      
      // Simulate dragging fader
      fireEvent.change(volumeFader, { target: { value: '0.5' } });
      
      expect(mockMixerContext.setTrackVolume).toHaveBeenCalledWith('track-1', 0.5);
    });

    it('should update master volume on master fader change', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const masterVolumeFader = screen.getByTestId('mixer-master-volume');
      
      fireEvent.change(masterVolumeFader, { target: { value: '0.9' } });
      
      expect(mockMixerContext.setMasterVolume).toHaveBeenCalledWith(0.9);
    });

    it('should show volume values', () => {
      renderMixer();
      
      const volumeDisplay1 = screen.getByTestId('mixer-volume-display-track-1');
      const volumeDisplay2 = screen.getByTestId('mixer-volume-display-track-2');
      const masterVolumeDisplay = screen.getByTestId('mixer-master-volume-display');
      
      expect(volumeDisplay1).toHaveTextContent('80'); // 0.8 * 100
      expect(volumeDisplay2).toHaveTextContent('60'); // 0.6 * 100
      expect(masterVolumeDisplay).toHaveTextContent('80');
    });

    it('should allow fine volume adjustment with Shift+drag', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const volumeFader = screen.getByTestId('mixer-volume-track-1');
      
      await user.keyboard('{Shift>}');
      fireEvent.change(volumeFader, { target: { value: '0.81' } });
      await user.keyboard('{/Shift}');
      
      expect(mockMixerContext.setTrackVolume).toHaveBeenCalledWith('track-1', 0.81);
    });
  });

  describe('Pan Controls', () => {
    it('should update track pan on knob change', () => {
      renderMixer();
      
      const panKnob = screen.getByTestId('mixer-pan-track-1');
      
      fireEvent.change(panKnob, { target: { value: '0.5' } });
      
      expect(mockMixerContext.setTrackPan).toHaveBeenCalledWith('track-1', 0.5);
    });

    it('should reset pan to center on double-click', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const panKnob = screen.getByTestId('mixer-pan-track-1');
      
      await user.dblClick(panKnob);
      
      expect(mockMixerContext.setTrackPan).toHaveBeenCalledWith('track-1', 0);
    });

    it('should show pan values', () => {
      renderMixer();
      
      const panDisplay1 = screen.getByTestId('mixer-pan-display-track-1');
      const panDisplay2 = screen.getByTestId('mixer-pan-display-track-2');
      
      expect(panDisplay1).toHaveTextContent('R10'); // 0.1 -> R10 (10% right)
      expect(panDisplay2).toHaveTextContent('L20'); // -0.2 -> L20 (20% left)
    });
  });

  describe('Mute/Solo/Arm Controls', () => {
    it('should toggle track mute', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const muteButton = screen.getByTestId('mixer-mute-track-1');
      await user.click(muteButton);
      
      expect(mockMixerContext.setTrackMute).toHaveBeenCalledWith('track-1', true);
    });

    it('should toggle track solo', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const soloButton = screen.getByTestId('mixer-solo-track-1');
      await user.click(soloButton);
      
      expect(mockMixerContext.setTrackSolo).toHaveBeenCalledWith('track-1', true);
    });

    it('should toggle track arm', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const armButton = screen.getByTestId('mixer-arm-track-1');
      await user.click(armButton);
      
      expect(mockMixerContext.setTrackArmed).toHaveBeenCalledWith('track-1', true);
    });

    it('should toggle master mute', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const masterMuteButton = screen.getByTestId('mixer-master-mute');
      await user.click(masterMuteButton);
      
      expect(mockMixerContext.setMasterMute).toHaveBeenCalledWith(true);
    });

    it('should show solo isolation', () => {
      const contextWithSolo = {
        ...mockMixerContext,
        soloedTracks: ['track-1'],
      };

      render(
        <WorkstationContext.Provider value={mockWorkstationContext as any}>
          <MixerContext.Provider value={contextWithSolo}>
            <Mixer />
          </MixerContext.Provider>
        </WorkstationContext.Provider>
      );
      
      const channel2 = screen.getByTestId('mixer-channel-track-2');
      expect(channel2).toHaveClass('solo-dimmed');
    });
  });

  describe('Level Meters', () => {
    it('should display track level meters', () => {
      renderMixer();
      
      const meter1 = screen.getByTestId('mixer-meter-track-1');
      const meter2 = screen.getByTestId('mixer-meter-track-2');
      
      expect(meter1).toBeInTheDocument();
      expect(meter2).toBeInTheDocument();
    });

    it('should show peak indicators', () => {
      renderMixer();
      
      const peakIndicator1 = screen.getByTestId('mixer-peak-track-1');
      expect(peakIndicator1).toBeInTheDocument();
      
      // Check peak level display
      expect(peakIndicator1).toHaveAttribute('aria-label', expect.stringContaining('Peak: 0.8'));
    });

    it('should show clipping warning for high levels', () => {
      const contextWithClipping = {
        ...mockMixerContext,
        meters: {
          ...mockMixerContext.meters,
          'track-1': { left: 0.95, right: 0.98, peak: 1.0 },
        },
      };

      render(
        <WorkstationContext.Provider value={mockWorkstationContext as any}>
          <MixerContext.Provider value={contextWithClipping}>
            <Mixer />
          </MixerContext.Provider>
        </WorkstationContext.Provider>
      );
      
      const clippingIndicator = screen.getByTestId('mixer-clipping-track-1');
      expect(clippingIndicator).toHaveClass('clipping');
    });

    it('should reset peak on peak indicator click', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const peakIndicator = screen.getByTestId('mixer-peak-track-1');
      await user.click(peakIndicator);
      
      // Should reset the peak value (implementation dependent)
      expect(peakIndicator).toHaveAttribute('data-peak', '0');
    });
  });

  describe('Effects Chain', () => {
    it('should display track effects', () => {
      renderMixer();
      
      const effectsSection = screen.getByTestId('mixer-effects-track-1');
      expect(effectsSection).toBeInTheDocument();
      expect(screen.getByText('Hall Reverb')).toBeInTheDocument();
    });

    it('should toggle effect bypass', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const effectBypass = screen.getByTestId('effect-bypass-reverb-1');
      await user.click(effectBypass);
      
      expect(mockMixerContext.updateEffect).toHaveBeenCalledWith('track-1', 'reverb-1', {
        enabled: false,
      });
    });

    it('should open effect editor on effect click', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const effect = screen.getByTestId('effect-reverb-1');
      await user.click(effect);
      
      await waitFor(() => {
        expect(screen.getByTestId('effect-editor-reverb-1')).toBeInTheDocument();
      });
    });

    it('should add new effect via dropdown', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const addEffectButton = screen.getByTestId('mixer-add-effect-track-1');
      await user.click(addEffectButton);
      
      const effectOption = screen.getByText('Compressor');
      await user.click(effectOption);
      
      expect(mockMixerContext.addEffect).toHaveBeenCalledWith('track-1', 'compressor');
    });

    it('should reorder effects via drag and drop', async () => {
      const user = userEvent.setup();
      
      // Add another effect for testing
      const contextWithMultipleEffects = {
        ...mockMixerContext,
        tracks: [
          {
            ...mockTracks[0],
            effects: [
              ...mockTracks[0].effects,
              {
                id: 'compressor-1',
                name: 'Compressor',
                type: 'native' as const,
                enabled: true,
                parameters: { ratio: 4, threshold: -12 },
              },
            ],
          },
          mockTracks[1],
        ],
      };

      render(
        <WorkstationContext.Provider value={mockWorkstationContext as any}>
          <MixerContext.Provider value={contextWithMultipleEffects}>
            <Mixer />
          </MixerContext.Provider>
        </WorkstationContext.Provider>
      );
      
      const effect1 = screen.getByTestId('effect-reverb-1');
      const effect2 = screen.getByTestId('effect-compressor-1');
      
      // Simulate drag and drop
      await user.pointer([
        { keys: '[MouseLeft>]', target: effect1 },
        { target: effect2 },
        { keys: '[/MouseLeft]' },
      ]);
      
      expect(mockMixerContext.reorderEffects).toHaveBeenCalledWith('track-1', ['compressor-1', 'reverb-1']);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should toggle mute with M key', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const channel = screen.getByTestId('mixer-channel-track-1');
      channel.focus();
      
      await user.keyboard('m');
      
      expect(mockMixerContext.setTrackMute).toHaveBeenCalledWith('track-1', true);
    });

    it('should toggle solo with S key', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const channel = screen.getByTestId('mixer-channel-track-1');
      channel.focus();
      
      await user.keyboard('s');
      
      expect(mockMixerContext.setTrackSolo).toHaveBeenCalledWith('track-1', true);
    });

    it('should toggle arm with R key', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const channel = screen.getByTestId('mixer-channel-track-1');
      channel.focus();
      
      await user.keyboard('r');
      
      expect(mockMixerContext.setTrackArmed).toHaveBeenCalledWith('track-1', true);
    });

    it('should reset level on Ctrl+click', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const volumeFader = screen.getByTestId('mixer-volume-track-1');
      
      await user.keyboard('{Control>}');
      await user.click(volumeFader);
      await user.keyboard('{/Control}');
      
      expect(mockMixerContext.setTrackVolume).toHaveBeenCalledWith('track-1', 0.8); // Default volume
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderMixer();
      
      const volumeFader = screen.getByTestId('mixer-volume-track-1');
      const panKnob = screen.getByTestId('mixer-pan-track-1');
      const muteButton = screen.getByTestId('mixer-mute-track-1');
      
      expect(volumeFader).toHaveAttribute('aria-label', 'Vocals volume');
      expect(panKnob).toHaveAttribute('aria-label', 'Vocals pan');
      expect(muteButton).toHaveAttribute('aria-label', 'Mute Vocals');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const firstChannel = screen.getByTestId('mixer-channel-track-1');
      firstChannel.focus();
      
      // Navigate between channels
      await user.keyboard('{ArrowRight}');
      expect(screen.getByTestId('mixer-channel-track-2')).toHaveFocus();
      
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByTestId('mixer-channel-track-1')).toHaveFocus();
    });

    it('should announce level changes', async () => {
      const user = userEvent.setup();
      renderMixer();
      
      const volumeFader = screen.getByTestId('mixer-volume-track-1');
      
      fireEvent.change(volumeFader, { target: { value: '0.5' } });
      
      const announcement = screen.getByTestId('mixer-announcement');
      expect(announcement).toHaveTextContent('Vocals volume set to 50%');
    });
  });

  describe('Performance', () => {
    it('should handle many tracks efficiently', () => {
      const manyTracks = Array.from({ length: 64 }, (_, i) => ({
        id: `track-${i}`,
        name: `Track ${i}`,
        type: TrackType.Audio,
        color: '#ff6b6b',
        mute: false,
        solo: false,
        armed: false,
        volume: 0.8,
        pan: 0,
        automation: false,
        clips: [],
        effects: [],
        automationLanes: [],
      }));

      const contextWithManyTracks = {
        ...mockMixerContext,
        tracks: manyTracks,
      };

      const startTime = performance.now();
      
      render(
        <WorkstationContext.Provider value={mockWorkstationContext as any}>
          <MixerContext.Provider value={contextWithManyTracks}>
            <Mixer />
          </MixerContext.Provider>
        </WorkstationContext.Provider>
      );
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should virtualize channels for large track counts', () => {
      const manyTracks = Array.from({ length: 200 }, (_, i) => ({
        id: `track-${i}`,
        name: `Track ${i}`,
        type: TrackType.Audio,
        color: '#ff6b6b',
        mute: false,
        solo: false,
        armed: false,
        volume: 0.8,
        pan: 0,
        automation: false,
        clips: [],
        effects: [],
        automationLanes: [],
      }));

      const contextWithManyTracks = {
        ...mockMixerContext,
        tracks: manyTracks,
      };

      render(
        <WorkstationContext.Provider value={mockWorkstationContext as any}>
          <MixerContext.Provider value={contextWithManyTracks}>
            <Mixer />
          </MixerContext.Provider>
        </WorkstationContext.Provider>
      );
      
      // Should only render visible channels
      const channelElements = screen.getAllByTestId(/^mixer-channel-track-/);
      expect(channelElements.length).toBeLessThan(20); // Only visible channels
    });
  });

  describe('Error Handling', () => {
    it('should handle missing meter data gracefully', () => {
      const contextWithoutMeters = {
        ...mockMixerContext,
        meters: {},
      };

      render(
        <WorkstationContext.Provider value={mockWorkstationContext as any}>
          <MixerContext.Provider value={contextWithoutMeters}>
            <Mixer />
          </MixerContext.Provider>
        </WorkstationContext.Provider>
      );
      
      // Should render without errors
      expect(screen.getByTestId('mixer-channel-track-1')).toBeInTheDocument();
    });

    it('should handle invalid effect parameters', () => {
      const contextWithInvalidEffect = {
        ...mockMixerContext,
        tracks: [
          {
            ...mockTracks[0],
            effects: [
              {
                id: 'invalid-effect',
                name: 'Invalid Effect',
                type: 'native' as const,
                enabled: true,
                parameters: null as any,
              },
            ],
          },
          mockTracks[1],
        ],
      };

      expect(() => {
        render(
          <WorkstationContext.Provider value={mockWorkstationContext as any}>
            <MixerContext.Provider value={contextWithInvalidEffect}>
              <Mixer />
            </MixerContext.Provider>
          </WorkstationContext.Provider>
        );
      }).not.toThrow();
    });
  });
});
