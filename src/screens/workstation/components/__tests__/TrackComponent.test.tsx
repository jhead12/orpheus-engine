import { describe, it, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { TrackComponent } from '../TrackComponent';
import { expectScreenshot } from '@orpheus/test/helpers';
import { WorkstationContext } from '@orpheus/contexts';
import type { Track } from '@orpheus/types/types';

describe('TrackComponent Visual Tests', () => {
  const defaultContext = {
    masterTrack: { id: 'master-1', name: 'Master' },
    selectedTrackId: null,
    playheadPos: { bar: 0, beat: 0, ticks: 0 },
    timelineSettings: {
      timeSignature: { beats: 4, noteValue: 4 }
    },
    showMaster: true,
    setTrack: () => {},
    setSelectedTrackId: () => {},
    getTrackCurrentValue: () => ({ value: 0.8, isAutomated: false }),
    deleteTrack: () => {},
    duplicateTrack: () => {},
    scrollToItem: null,
    setScrollToItem: () => {},
    verticalScale: 1,
  };

  const createContainer = () => {
    const container = document.createElement('div');
    container.style.cssText = `
      width: 800px;
      height: 200px;
      background: #1e1e1e;
      position: relative;
      overflow: hidden;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      padding: 16px;
      box-sizing: border-box;
    `;
    // Add some global styles that might be needed
    const style = document.createElement('style');
    style.textContent = `
      .MuiSvgIcon-root { font-size: 24px; }
      .MuiIconButton-root { padding: 8px; }
    `;
    document.head.appendChild(style);
    document.body.appendChild(container);
    return container;
  };

  const renderWithContext = (ui: React.ReactNode, container: HTMLElement) => {
    return render(
      <WorkstationContext.Provider value={defaultContext as any}>
        {ui}
      </WorkstationContext.Provider>,
      { container }
    );
  };

  it('visual test: renders normal track @visual', async () => {
    const container = createContainer();
    const track = {
      id: 'track-1',
      name: 'Test Track',
      color: '#ff0000',
      volume: 0.8,
      pan: 0,
      automation: false,
      mute: false,
      solo: false,
      automationLanes: []
    };

    renderWithContext(
      <TrackComponent track={track} />,
      container
    );

    // Wait for initial render and any animations
    await new Promise(resolve => setTimeout(resolve, 500));
    // Wait for any styled-components to be applied
    await new Promise(resolve => setTimeout(resolve, 500));
    // Wait for any dynamic content (meters, etc)
    await new Promise(resolve => setTimeout(resolve, 500));

    await expectScreenshot(container, 'track-normal');
    document.body.removeChild(container);
  });

  it('visual test: renders track with automation @visual', async () => {
    const container = createContainer();
    const track = {
      id: 'track-1',
      name: 'Test Track',
      color: '#ff0000',
      volume: 0.8,
      pan: 0,
      automation: true,
      automationLanes: [{
        id: 'lane-1',
        show: true,
        envelope: 'volume',
        nodes: [
          { id: 'node-1', pos: { bar: 0, beat: 0, ticks: 0 }, value: 0.5 },
          { id: 'node-2', pos: { bar: 1, beat: 0, ticks: 0 }, value: 0.8 }
        ]
      }],
      mute: false,
      solo: false
    };

    renderWithContext(
      <TrackComponent track={track} />,
      container
    );

    // Wait for initial render
    await new Promise(resolve => setTimeout(resolve, 500));
    // Wait for styled-components
    await new Promise(resolve => setTimeout(resolve, 500));
    // Wait for automation lanes to render
    await new Promise(resolve => setTimeout(resolve, 500));

    await expectScreenshot(container, 'track-with-automation');
    document.body.removeChild(container);
  });

  it('visual test: renders muted track @visual', async () => {
    const container = createContainer();
    renderWithContext(
      <TrackComponent
        track={{
          id: 'track-1',
          name: 'Test Track',
          color: '#ff0000',
          volume: 0.8,
          pan: 0,
          automation: false,
          mute: true,
          solo: false
        }}
      />,
      container
    );

    await new Promise(resolve => setTimeout(resolve, 1000));
    await expectScreenshot(container, 'track-muted');
    document.body.removeChild(container);
  });

  it('visual test: renders soloed track @visual', async () => {
    const container = createContainer();
    renderWithContext(
      <TrackComponent
        track={{
          id: 'track-1',
          name: 'Test Track',
          color: '#ff0000',
          volume: 0.8,
          pan: 0,
          automation: false,
          mute: false,
          solo: true
        }}
      />,
      container
    );

    await new Promise(resolve => setTimeout(resolve, 1000));
    await expectScreenshot(container, 'track-soloed');
    document.body.removeChild(container);
  });

  it('visual test: renders master track @visual', async () => {
    const container = createContainer();
    renderWithContext(
      <TrackComponent
        track={{
          id: 'master-1',
          name: 'Master',
          color: '#808080',
          volume: 1.0,
          pan: 0,
          automation: false,
          mute: false,
          solo: false
        }}
      />,
      container
    );

    await new Promise(resolve => setTimeout(resolve, 1000));
    await expectScreenshot(container, 'track-master');
    document.body.removeChild(container);
  });
});
