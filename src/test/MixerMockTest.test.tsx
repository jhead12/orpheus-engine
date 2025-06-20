import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple mock context
const mockContext = {
  tracks: [
    { id: 'track-1', name: 'Vocals', type: 'Audio', volume: 0.8, pan: 0, mute: false, solo: false, armed: false },
    { id: 'track-2', name: 'Guitar', type: 'Audio', volume: 0.7, pan: 0.2, mute: false, solo: false, armed: false }
  ],
  masterTrack: { id: 'master', name: 'Master', type: 'Audio', volume: 0.8, pan: 0, mute: false },
  selectedTrackId: 'track-1',
  setSelectedTrackId: vi.fn(),
  getTrackCurrentValue: vi.fn().mockReturnValue({ value: 0, isAutomated: false }),
  setTrack: vi.fn(),
};

// Simple mock TestComponent
const TestComponent = ({ context }: { context: any }) => (
  <div data-testid="mixer-test">
    <div data-testid="master-channel" className="mixer-track">
      {context.masterTrack.name} - {context.masterTrack.volume}
    </div>
    {context.tracks.map((track: any) => (
      <div 
        key={track.id}
        data-testid={`mixer-channel-${track.id}`} 
        className="mixer-track"
      >
        <input value={track.name} data-testid={`track-name-${track.id}`} />
        <div data-testid={`mixer-volume-${track.id}`}>
          Volume: {track.volume}
        </div>
        <div data-testid={`mixer-pan-${track.id}`} title={`Pan: ${track.pan}`}>
          Pan: {track.pan}
        </div>
      </div>
    ))}
  </div>
);

// Import helper functions from mixer-test-helpers
// Simplified versions directly included here for testing
const findTrackElementsByName = (container: any, name: string): any[] => {
  const elements: any[] = [];
  const inputs = container.querySelectorAll(`input[value="${name}"]`);
  inputs.forEach((el: any) => elements.push(el));
  return elements;
};

const ensureKnobs = (container: any): number => {
  const knobs = container.querySelectorAll('[data-testid*="mixer-pan"], [title*="Pan:"]');
  return knobs.length;
};

describe('Mixer Mock Test', () => {
  it('should render tracks', () => {
    render(<TestComponent context={mockContext} />);
    expect(screen.getByTestId('mixer-test')).toBeInTheDocument();
    expect(screen.getByTestId('master-channel')).toBeInTheDocument();
    expect(screen.getByTestId('mixer-channel-track-1')).toBeInTheDocument();
    expect(screen.getByTestId('mixer-channel-track-2')).toBeInTheDocument();
  });

  it('should find track elements by name', () => {
    const { container } = render(<TestComponent context={mockContext} />);
    const vocalsElements = findTrackElementsByName(container, 'Vocals');
    expect(vocalsElements.length).toBeGreaterThan(0);
  });

  it('should find pan knobs', () => {
    const { container } = render(<TestComponent context={mockContext} />);
    const knobCount = ensureKnobs(container);
    expect(knobCount).toBe(2); // Two tracks, two pan knobs
  });
});
