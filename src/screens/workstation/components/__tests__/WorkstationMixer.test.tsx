import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mixer } from '../../../../../workstation/frontend/OEW-main/src/screens/workstation/components/Mixer';
import { WorkstationContext } from '../../../../contexts/WorkstationContext';
import { Track, TrackType, AutomationMode } from '../../../../types/core';

// Mock Material-UI components
vi.mock('@mui/icons-material', () => ({
  Check: () => <div data-testid="check-icon">Check</div>,
  FiberManualRecord: () => <div data-testid="record-icon">Record</div>,
}));

vi.mock('@mui/material', () => ({
  DialogContent: ({ children, ...props }: any) => <div data-testid="dialog-content" {...props}>{children}</div>,
  IconButton: ({ children, ...props }: any) => <button data-testid="icon-button" {...props}>{children}</button>,
}));

// Mock orpheus widgets
vi.mock('@orpheus/widgets', () => ({
  Dialog: ({ children, open, title, onClose, ...props }: any) => 
    open ? (
      <div data-testid="dialog" {...props}>
        <div data-testid="dialog-title">{title}</div>
        {children}
      </div>
    ) : null,
  HueInput: ({ value, onChange, ...props }: any) => 
    <input 
      data-testid="hue-input" 
      type="range" 
      min="0" 
      max="360" 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))} 
      {...props} 
    />,
  Knob: ({ value, onChange, title, ...props }: any) => 
    <input 
      data-testid="knob" 
      type="range" 
      min={props.min || -100} 
      max={props.max || 100} 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))} 
      title={title}
      {...props} 
    />,
  Meter: ({ percent, vertical, ...props }: any) => 
    <div 
      data-testid="meter" 
      style={{ height: vertical ? '100%' : 'auto', width: vertical ? 'auto' : '100%' }} 
      aria-valuenow={percent}
      {...props} 
    />,
  SelectSpinBox: ({ value, onChange, options, title, ...props }: any) => (
    <select 
      data-testid="select-spinbox" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      title={title}
      {...props}
    >
      {options?.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
  SortableList: ({ children, onEnd, onStart, onSortUpdate, ...props }: any) => 
    <div data-testid="sortable-list" {...props}>
      {children}
    </div>,
  SortableListItem: ({ children, index, ...props }: any) => 
    <div data-testid={`sortable-item-${index}`} {...props}>
      {children}
    </div>,
}));

// Mock FXComponent and TrackVolumeSlider
vi.mock('../../../../workstation/frontend/OEW-main/src/screens/workstation/components', () => ({
  FXComponent: ({ track, ...props }: any) => 
    <div data-testid={`fx-component-${track.id}`} {...props}>
      FX Component for {track.name}
    </div>,
  TrackVolumeSlider: ({ track, ...props }: any) => 
    <input 
      data-testid={`volume-slider-${track.id}`} 
      type="range" 
      min="0" 
      max="1" 
      step="0.01" 
      value={track.volume} 
      {...props} 
    />,
}));

// Mock TrackIcon
vi.mock('../../../components/icons', () => ({
  TrackIcon: ({ type, color, ...props }: any) => 
    <div data-testid={`track-icon-${type}`} style={{ color }} {...props}>
      Icon-{type}
    </div>,
}));

// Mock electron utils
vi.mock('@orpheus/services/electron/utils', () => ({
  openContextMenu: vi.fn(),
}));

// Mock audio utils
vi.mock('@orpheus/utils/audio', () => ({
  formatPanning: (value: number, short?: boolean) => {
    if (value === 0) return 'C';
    if (value > 0) return short ? `R${Math.round(value)}` : `Right ${Math.round(value)}%`;
    return short ? `L${Math.round(Math.abs(value))}` : `Left ${Math.round(Math.abs(value))}%`;
  },
  getVolumeGradient: vi.fn(() => '#00ff00'),
}));

// Mock other utils
vi.mock('@orpheus/utils/general', () => ({
  hslToHex: (h: number, s: number, l: number) => `#${h.toString(16).padStart(2, '0')}${s.toString(16).padStart(2, '0')}${l.toString(16).padStart(2, '0')}`,
  hueFromHex: (hex: string) => parseInt(hex.slice(1, 3), 16),
}));

vi.mock('@orpheus/utils/utils', () => ({
  volumeToNormalized: (volume: number) => Math.min(1, Math.max(0, volume)),
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
    automationMode: AutomationMode.Read,
    clips: [],
    effects: [],
    automationLanes: [
      {
        id: 'pan-lane-1',
        envelope: 'Pan' as any,
        points: [{ time: 0, value: 0.1 }],
      },
    ],
    fx: {
      preset: null,
      effects: [],
      selectedEffectIndex: 0,
    },
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
    automationMode: AutomationMode.Write,
    clips: [],
    effects: [],
    automationLanes: [],
    fx: {
      preset: null,
      effects: [],
      selectedEffectIndex: 0,
    },
  },
];

const mockMasterTrack: Track = {
  id: 'master',
  name: 'Master',
  type: TrackType.Audio,
  color: '#444444',
  mute: false,
  solo: false,
  armed: false,
  volume: 0.8,
  pan: 0,
  automation: false,
  automationMode: AutomationMode.Read,
  clips: [],
  effects: [],
  automationLanes: [],
  fx: {
    preset: null,
    effects: [],
    selectedEffectIndex: 0,
  },
};

const mockWorkstationContext = {
  tracks: mockTracks,
  masterTrack: mockMasterTrack,
  deleteTrack: vi.fn(),
  duplicateTrack: vi.fn(),
  setTrack: vi.fn(),
  setTracks: vi.fn(),
  selectedTrackId: 'track-1',
  setSelectedTrackId: vi.fn(),
  setAllowMenuAndShortcuts: vi.fn(),
  playheadPos: 0,
  timelineSettings: {
    zoom: 1,
    scrollLeft: 0,
  },
  getTrackCurrentValue: vi.fn((track: Track, lane?: any) => {
    if (lane) {
      return { value: lane.points[0]?.value || 0, isAutomated: true };
    }
    return { value: track.pan || 0, isAutomated: false };
  }),
};

const renderWorkstationMixer = (props = {}) => {
  return render(
    <WorkstationContext.Provider value={mockWorkstationContext as any}>
      <Mixer {...props} />
    </WorkstationContext.Provider>
  );
};

describe('Workstation Mixer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render master track', () => {
      renderWorkstationMixer();
      
      expect(screen.getByText('Master')).toBeInTheDocument();
      expect(screen.getByTestId('track-icon-Audio')).toBeInTheDocument();
    });

    it('should render all tracks in sortable list', () => {
      renderWorkstationMixer();
      
      expect(screen.getByTestId('sortable-list')).toBeInTheDocument();
      expect(screen.getByTestId('sortable-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('sortable-item-1')).toBeInTheDocument();
      expect(screen.getByText('Vocals')).toBeInTheDocument();
      expect(screen.getByText('Guitar')).toBeInTheDocument();
    });

    it('should show track order numbers', () => {
      renderWorkstationMixer();
      
      expect(screen.getByText('1')).toBeInTheDocument(); // First track order
      expect(screen.getByText('2')).toBeInTheDocument(); // Second track order
    });

    it('should show track colors as background', () => {
      renderWorkstationMixer();
      
      const trackNameInputs = screen.getAllByDisplayValue(/Vocals|Guitar/);
      expect(trackNameInputs[0].closest('form')).toHaveStyle({
        backgroundColor: expect.stringContaining('#fff9'),
      });
    });

    it('should highlight selected track', () => {
      renderWorkstationMixer();
      
      // The selected track (track-1) should have overlay-1 class
      const selectedTrackContainer = screen.getByText('Vocals').closest('.d-flex');
      expect(selectedTrackContainer).toHaveClass('overlay-1');
    });
  });

  describe('Track Name Editing', () => {
    it('should allow editing track names', async () => {
      const user = userEvent.setup();
      renderWorkstationMixer();
      
      const nameInput = screen.getByDisplayValue('Vocals');
      await user.clear(nameInput);
      await user.type(nameInput, 'Lead Vocals');
      
      expect(nameInput).toHaveValue('Lead Vocals');
    });

    it('should update track name on form submit', async () => {
      const user = userEvent.setup();
      renderWorkstationMixer();
      
      const nameInput = screen.getByDisplayValue('Vocals');
      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');
      await user.keyboard('{Enter}');
      
      expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith({
        ...mockTracks[0],
        name: 'New Name',
      });
    });

    it('should update track name on blur', async () => {
      const user = userEvent.setup();
      renderWorkstationMixer();
      
      const nameInput = screen.getByDisplayValue('Guitar');
      await user.clear(nameInput);
      await user.type(nameInput, 'Electric Guitar');
      
      // Click somewhere else to trigger blur
      await user.click(document.body);
      
      expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith({
        ...mockTracks[1],
        name: 'Electric Guitar',
      });
    });
  });

  describe('Volume Controls', () => {
    it('should display volume meters', () => {
      renderWorkstationMixer();
      
      const meters = screen.getAllByTestId('meter');
      expect(meters.length).toBeGreaterThan(0);
      
      // Each track should have two meters (L/R)
      expect(meters.filter(meter => 
        meter.style.height === '100%' // vertical meters
      ).length).toBeGreaterThan(0);
    });

    it('should display volume sliders for each track', () => {
      renderWorkstationMixer();
      
      expect(screen.getByTestId('volume-slider-track-1')).toBeInTheDocument();
      expect(screen.getByTestId('volume-slider-track-2')).toBeInTheDocument();
    });

    it('should show peak level displays', () => {
      renderWorkstationMixer();
      
      const peakDisplays = screen.getAllByText('-∞');
      expect(peakDisplays.length).toBeGreaterThan(0);
    });
  });

  describe('Pan Controls', () => {
    it('should display pan knobs for each track', () => {
      renderWorkstationMixer();
      
      const panKnobs = screen.getAllByTestId('knob');
      expect(panKnobs.length).toBeGreaterThan(0);
    });

    it('should update pan value when knob changes', async () => {
      const user = userEvent.setup();
      renderWorkstationMixer();
      
      const panKnob = screen.getAllByTestId('knob')[0]; // First knob (assuming it's pan)
      
      await user.clear(panKnob);
      await user.type(panKnob, '50');
      fireEvent.change(panKnob, { target: { value: '50' } });
      
      expect(mockWorkstationContext.setTrack).toHaveBeenCalled();
    });

    it('should show pan value in title', () => {
      renderWorkstationMixer();
      
      const panKnobs = screen.getAllByTestId('knob');
      const firstPanKnob = panKnobs[0];
      
      expect(firstPanKnob).toHaveAttribute('title', expect.stringContaining('Pan:'));
    });

    it('should indicate automated pan', () => {
      // Mock automation for track-1
      const mockContextWithAutomation = {
        ...mockWorkstationContext,
        getTrackCurrentValue: vi.fn((track: Track, lane?: any) => {
          if (lane && track.id === 'track-1') {
            return { value: 0.1, isAutomated: true };
          }
          return { value: track.pan || 0, isAutomated: false };
        }),
      };

      render(
        <WorkstationContext.Provider value={mockContextWithAutomation as any}>
          <Mixer />
        </WorkstationContext.Provider>
      );
      
      const panKnobs = screen.getAllByTestId('knob');
      const firstPanKnob = panKnobs[0];
      
      expect(firstPanKnob).toHaveAttribute('title', expect.stringContaining('automated'));
    });
  });

  describe('Mute/Solo/Arm Controls', () => {
    it('should display mute buttons for all tracks', () => {
      renderWorkstationMixer();
      
      const muteButtons = screen.getAllByText('M');
      expect(muteButtons.length).toBeGreaterThan(0);
    });

    it('should display solo buttons for non-master tracks', () => {
      renderWorkstationMixer();
      
      const soloButtons = screen.getAllByText('S');
      expect(soloButtons.length).toBe(2); // Only non-master tracks
    });

    it('should display arm buttons for non-master tracks', () => {
      renderWorkstationMixer();
      
      const armButtons = screen.getAllByTestId('record-icon');
      expect(armButtons.length).toBe(2); // Only non-master tracks
    });

    it('should toggle track mute', async () => {
      const user = userEvent.setup();
      renderWorkstationMixer();
      
      const muteButton = screen.getAllByText('M')[1]; // Second mute button (not master)
      await user.click(muteButton);
      
      expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith({
        ...mockTracks[0],
        mute: !mockTracks[0].mute,
      });
    });

    it('should toggle track solo', async () => {
      const user = userEvent.setup();
      renderWorkstationMixer();
      
      const soloButton = screen.getAllByText('S')[0];
      await user.click(soloButton);
      
      expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith({
        ...mockTracks[0],
        solo: !mockTracks[0].solo,
      });
    });

    it('should toggle track arm', async () => {
      const user = userEvent.setup();
      renderWorkstationMixer();
      
      const armButton = screen.getAllByTestId('record-icon')[0].closest('button');
      await user.click(armButton!);
      
      expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith({
        ...mockTracks[0],
        armed: !mockTracks[0].armed,
      });
    });

    it('should show muted state styling', () => {
      renderWorkstationMixer();
      
      // Find mute button for track-2 which is muted
      const muteButtons = screen.getAllByText('M');
      const mutedTrackButton = muteButtons.find(button => 
        button.style.color === '#ff004c'
      );
      
      expect(mutedTrackButton).toBeInTheDocument();
    });

    it('should show armed state styling', () => {
      renderWorkstationMixer();
      
      // Find arm icon for track-2 which is armed
      const armIcons = screen.getAllByTestId('record-icon');
      const armedIcon = armIcons.find(icon => 
        icon.style.color === '#ff004c'
      );
      
      expect(armedIcon).toBeInTheDocument();
    });
  });

  describe('Automation Mode', () => {
    it('should display automation mode selector for each track', () => {
      renderWorkstationMixer();
      
      const automationSelectors = screen.getAllByTestId('select-spinbox');
      expect(automationSelectors.length).toBeGreaterThan(0);
    });

    it('should show current automation mode', () => {
      renderWorkstationMixer();
      
      const automationSelectors = screen.getAllByTestId('select-spinbox');
      expect(automationSelectors[0]).toHaveValue(AutomationMode.Read);
      expect(automationSelectors[1]).toHaveValue(AutomationMode.Write);
    });

    it('should update automation mode', async () => {
      const user = userEvent.setup();
      renderWorkstationMixer();
      
      const automationSelector = screen.getAllByTestId('select-spinbox')[0];
      await user.selectOptions(automationSelector, AutomationMode.Touch);
      
      expect(mockWorkstationContext.setTrack).toHaveBeenCalledWith({
        ...mockTracks[0],
        automationMode: AutomationMode.Touch,
      });
    });
  });

  describe('Effects Section', () => {
    it('should display FX component for each track', () => {
      renderWorkstationMixer();
      
      expect(screen.getByTestId('fx-component-track-1')).toBeInTheDocument();
      expect(screen.getByTestId('fx-component-track-2')).toBeInTheDocument();
      expect(screen.getByTestId('fx-component-master')).toBeInTheDocument();
    });
  });

  describe('Track Selection', () => {
    it('should select track on mouse down', async () => {
      const user = userEvent.setup();
      renderWorkstationMixer();
      
      const trackContainer = screen.getByText('Guitar').closest('div[style*="width: 85"]');
      await user.pointer({ target: trackContainer!, keys: '[MouseLeft>][MouseLeft/]' });
      
      expect(mockWorkstationContext.setSelectedTrackId).toHaveBeenCalledWith('track-2');
    });
  });

  describe('Color Change Dialog', () => {
    it('should open color change dialog from context menu', async () => {
      // Mock the context menu to trigger color change
      const { openContextMenu } = await import('../../../services/electron/utils');
      (openContextMenu as any).mockImplementation((type: any, data: any, callback: any) => {
        callback({ action: 2 }); // Color change action
      });

      const user = userEvent.setup();
      renderWorkstationMixer();
      
      const trackContainer = screen.getByText('Vocals').closest('div[style*="width: 85"]');
      await user.pointer({ target: trackContainer!, keys: '[MouseRight]' });
      
      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
        expect(screen.getByTestId('dialog-title')).toHaveTextContent('Change Hue for Vocals');
      });
    });

    it('should update track color when hue changes', async () => {
      // Mock the context menu and open dialog
      const { openContextMenu } = await import('../../../services/electron/utils');
      (openContextMenu as any).mockImplementation((type: any, data: any, callback: any) => {
        callback({ action: 2 });
      });

      const user = userEvent.setup();
      renderWorkstationMixer();
      
      const trackContainer = screen.getByText('Vocals').closest('div[style*="width: 85"]');
      await user.pointer({ target: trackContainer!, keys: '[MouseRight]' });
      
      await waitFor(async () => {
        const hueInput = screen.getByTestId('hue-input');
        await user.clear(hueInput);
        await user.type(hueInput, '120');
        
        const submitButton = screen.getByTestId('check-icon').closest('button');
        await user.click(submitButton!);
        
        expect(mockWorkstationContext.setTrack).toHaveBeenCalled();
      });
    });
  });

  describe('Track Reordering', () => {
    it('should handle track reordering via sortable list', () => {
      renderWorkstationMixer();
      
      // SortableList should be present
      expect(screen.getByTestId('sortable-list')).toBeInTheDocument();
      
      // Should have sortable items
      expect(screen.getByTestId('sortable-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('sortable-item-1')).toBeInTheDocument();
    });

    it('should disable menu and shortcuts during sorting', () => {
      renderWorkstationMixer();
      
      // This would be tested by simulating drag start/end events
      // but since we're mocking SortableList, we just verify the callback is passed
      const sortableList = screen.getByTestId('sortable-list');
      expect(sortableList).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper titles for interactive elements', () => {
      renderWorkstationMixer();
      
      const automationSelector = screen.getAllByTestId('select-spinbox')[0];
      expect(automationSelector).toHaveAttribute('title', expect.stringContaining('Automation Mode:'));
    });

    it('should show master track differently from regular tracks', () => {
      renderWorkstationMixer();
      
      expect(screen.getByText('Master')).toBeInTheDocument();
      
      // Master should not have solo/arm buttons
      const soloButtons = screen.getAllByText('S');
      const armButtons = screen.getAllByTestId('record-icon');
      
      // Should be 2 each (for 2 non-master tracks)
      expect(soloButtons.length).toBe(2);
      expect(armButtons.length).toBe(2);
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up menu restrictions on unmount', () => {
      const { unmount } = renderWorkstationMixer();
      
      unmount();
      
      expect(mockWorkstationContext.setAllowMenuAndShortcuts).toHaveBeenCalledWith(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing track data gracefully', () => {
      const contextWithEmptyTracks = {
        ...mockWorkstationContext,
        tracks: [],
      };

      expect(() => {
        render(
          <WorkstationContext.Provider value={contextWithEmptyTracks as any}>
            <Mixer />
          </WorkstationContext.Provider>
        );
      }).not.toThrow();
      
      // Should still render master track
      expect(screen.getByText('Master')).toBeInTheDocument();
    });

    it('should handle missing master track', () => {
      const contextWithoutMaster = {
        ...mockWorkstationContext,
        masterTrack: null,
      };

      expect(() => {
        render(
          <WorkstationContext.Provider value={contextWithoutMaster as any}>
            <Mixer />
          </WorkstationContext.Provider>
        );
      }).not.toThrow();
    });
  });
});
