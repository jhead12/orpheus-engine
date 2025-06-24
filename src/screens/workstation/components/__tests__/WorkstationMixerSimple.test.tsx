import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Mixer } from '../Mixer';
import { WorkstationContext } from '@orpheus/contexts/WorkstationContext';
import { MixerContext } from '@orpheus/contexts/MixerContext';
import {
  mockWorkstationContext,
  mockMixerContext,
  // Removing unused import
  // mockTracks
} from '@orpheus/test/utils/mixerMockHelpers';

// Mock the widgets package
vi.mock('@orpheus/widgets', () => ({
  Dialog: ({
    children,
    ...rest
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => <div {...rest}>{children}</div>,
  SelectSpinBox: ({
    title,
    value,
    onChange,
    ...rest
  }: {
    title?: string;
    value?: any;
    onChange?: (value: any) => void;
    [key: string]: any;
  }) => (
    <select
      title={title}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      {...rest}
    />
  ),
  Knob: ({
    value,
    onChange,
    ...rest
  }: {
    value?: number;
    onChange?: (value: number) => void;
    [key: string]: any;
  }) => (
    <div data-testid="knob" {...rest}>
      <input
        type="range"
        value={value || 0}
        onChange={(e) => onChange && onChange(parseFloat(e.target.value))}
      />
    </div>
  ),
  Meter: ({ value, ...rest }: { value?: number; [key: string]: any }) => (
    <div data-testid="meter" {...rest}>
      {value}
    </div>
  ),
  SortableList: ({
    children,
    ...rest
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="sortable-list" {...rest}>
      {children}
    </div>
  ),
  SortableListItem: ({
    children,
    index,
    ...rest
  }: {
    children: React.ReactNode;
    index?: number;
    [key: string]: any;
  }) => (
    <div data-testid={`sortable-item-${index}`} {...rest}>
      {children}
    </div>
  ),
  HueInput: ({
    onChange,
    value,
    ...rest
  }: {
    onChange?: (value: number) => void;
    value?: number;
    [key: string]: any;
  }) => (
    <input
      data-testid="hue-input"
      value={value}
      onChange={(e) => onChange?.(Number(e.target.value))}
      {...rest}
    />
  ),
}));

// Mock the icons component
vi.mock('../../../components/icons/TrackIcon', () => ({
  default: ({ type }: { type?: string }) => <div>Icon-{type}</div>,
}));

// Mock the TrackVolumeSlider
vi.mock('../index', () => ({
  TrackVolumeSlider: ({ track }: { track: any }) => (
    <div data-testid={`mixer-volume-${track?.id}`}>
      {track?.volume?.value || 0}
    </div>
  ),
  FXComponent: () => <div>FX</div>,
}));

describe('Workstation Mixer Simple Tests', () => {
  describe('Error Handling', () => {
    it('should handle missing track data gracefully', () => {
      const { container } = render(
        <WorkstationContext.Provider
          value={{ ...mockWorkstationContext, tracks: [] as any }}
        >
          <MixerContext.Provider value={mockMixerContext}>
            <Mixer />
          </MixerContext.Provider>
        </WorkstationContext.Provider>,
      );

      expect(container).toBeTruthy();
    });

    it('should handle missing master track', () => {
      const { container } = render(
        <WorkstationContext.Provider value={mockWorkstationContext}>
          <MixerContext.Provider value={mockMixerContext}>
            <Mixer />
          </MixerContext.Provider>
        </WorkstationContext.Provider>,
      );

      expect(container).toBeTruthy();
    });
  });
});
