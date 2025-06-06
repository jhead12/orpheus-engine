import { render, act } from "@testing-library/react";
import {   it("updates track volume", () => {
    let contextValue: MixerContextValue | undefined;
    const mockSetTracks = vi.fn();

    const initialValue: MixerContextValue = {
      tracks: [testTrack],
      mixerHeight: 200,
      setMixerHeight: () => {},
      addTrack: () => {},
      removeTrack: (_id: string) => {},
      updateTrack: (_id: string, updates: Partial<Track>) => {
        mockSetTracks([{ ...testTrack, ...updates }]);
      },
    };est";
import { MixerContext, MixerContextValue } from "../MixerContext";

describe("MixerContext", () => {
  type Track = {
    id: string;
    name: string;
    volume: number;
    pan: number;
    mute: boolean;
    solo: boolean;
  };

  const testTrack: Track = {
    id: "test-track",
    name: "Test Track",
    volume: 0,
    pan: 0,
    mute: false,
    solo: false,
  };

  const createMockValue = (mockSetTracks: ReturnType<typeof vi.fn>): MixerContextValue => ({
    tracks: [testTrack],
    mixerHeight: 200,
    setMixerHeight: vi.fn(),
    addTrack: vi.fn(),
    removeTrack: (_id: string) => {
      mockSetTracks([]);
    },
    updateTrack: (_id: string, updates: Partial<typeof testTrack>) => {
      mockSetTracks([{ ...testTrack, ...updates }]);
    },
  });

  it("provides mixer context to children", () => {
    let contextValue: MixerContextValue | undefined;
    const initialValue: MixerContextValue = {
      tracks: [],
      mixerHeight: 200,
      setMixerHeight: () => {},
      addTrack: () => {},
      removeTrack: () => {},
      updateTrack: () => {},
    };

    render(
      <MixerContext.Provider value={initialValue}>
        <MixerContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </MixerContext.Consumer>
      </MixerContext.Provider>
    );

    expect(contextValue).toBeDefined();
    expect(contextValue?.tracks).toEqual([]);
    expect(typeof contextValue?.updateTrack).toBe("function");
  });

  it("updates track volume", () => {
    let contextValue: MixerContextValue | undefined;
    const mockSetTracks = vi.fn();

    const initialValue: MixerContextValue = {
      tracks: [testTrack],
      mixerHeight: 200,
      setMixerHeight: () => {},
      addTrack: () => {},
      removeTrack: () => {},
      updateTrack: (_id, updates) => {
        mockSetTracks([{ ...testTrack, ...updates }]);
      },
    };

    render(
      <MixerContext.Provider value={initialValue}>
        <MixerContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </MixerContext.Consumer>
      </MixerContext.Provider>
    );

    act(() => {
      contextValue?.updateTrack(testTrack.id, { volume: -6 });
    });

    expect(mockSetTracks).toHaveBeenCalledWith([{ ...testTrack, volume: -6 }]);
  });

  it("updates track pan", () => {
    let contextValue: MixerContextValue | undefined;
    const mockSetTracks = vi.fn();

    const initialValue: MixerContextValue = {
      tracks: [testTrack],
      mixerHeight: 200,
      setMixerHeight: () => {},
      addTrack: () => {},
      removeTrack: () => {},
      updateTrack: (_id, updates) => {
        mockSetTracks([{ ...testTrack, ...updates }]);
      },
    };

    render(
      <MixerContext.Provider value={initialValue}>
        <MixerContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </MixerContext.Consumer>
      </MixerContext.Provider>
    );

    act(() => {
      contextValue?.updateTrack(testTrack.id, { pan: 0.5 });
    });

    expect(mockSetTracks).toHaveBeenCalledWith([{ ...testTrack, pan: 0.5 }]);
  });

  it("toggles track mute state", () => {
    let contextValue: MixerContextValue | undefined;
    const mockSetTracks = vi.fn();

    const initialValue: MixerContextValue = {
      tracks: [testTrack],
      mixerHeight: 200,
      setMixerHeight: () => {},
      addTrack: () => {},
      removeTrack: () => {},
      updateTrack: (id, updates) => {
        mockSetTracks([{ ...testTrack, ...updates }]);
      },
    };

    render(
      <MixerContext.Provider value={initialValue}>
        <MixerContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </MixerContext.Consumer>
      </MixerContext.Provider>
    );

    act(() => {
      contextValue?.updateTrack(testTrack.id, { mute: true });
    });

    expect(mockSetTracks).toHaveBeenCalledWith([{ ...testTrack, mute: true }]);
  });

  it("toggles track solo state", () => {
    let contextValue: MixerContextValue | undefined;
    const mockSetTracks = vi.fn();

    const initialValue: MixerContextValue = {
      tracks: [testTrack],
      mixerHeight: 200,
      setMixerHeight: () => {},
      addTrack: () => {},
      removeTrack: () => {},
      updateTrack: (id, updates) => {
        mockSetTracks([{ ...testTrack, ...updates }]);
      },
    };

    render(
      <MixerContext.Provider value={initialValue}>
        <MixerContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </MixerContext.Consumer>
      </MixerContext.Provider>
    );

    act(() => {
      contextValue?.updateTrack(testTrack.id, { solo: true });
    });

    expect(mockSetTracks).toHaveBeenCalledWith([{ ...testTrack, solo: true }]);
  });

  it("removes tracks", () => {
    let contextValue: MixerContextValue | undefined;
    const mockSetTracks = vi.fn();

    const initialValue: MixerContextValue = {
      tracks: [testTrack],
      mixerHeight: 200,
      setMixerHeight: () => {},
      addTrack: () => {},
      // @ts-ignore - Unused parameter in test mock
      removeTrack: (id) => {
        mockSetTracks([]);
      },
      // @ts-ignore - Unused parameter in test mock
      updateTrack: (id, updates) => {
        mockSetTracks([{ ...testTrack, ...updates }]);
      },
    };

    render(
      <MixerContext.Provider value={initialValue}>
        <MixerContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </MixerContext.Consumer>
      </MixerContext.Provider>
    );

    act(() => {
      contextValue?.removeTrack(testTrack.id);
    });

    expect(mockSetTracks).toHaveBeenCalledWith([]);
  });

  it("handles multiple tracks", () => {
    let contextValue: MixerContextValue | undefined;
    const tracks = [
      { ...testTrack, id: "track-1", name: "Track 1" },
      { ...testTrack, id: "track-2", name: "Track 2" },
      { ...testTrack, id: "track-3", name: "Track 3" },
    ];

    const initialValue: MixerContextValue = {
      tracks,
      mixerHeight: 200,
      setMixerHeight: () => {},
      addTrack: () => {},
      removeTrack: () => {},
      updateTrack: () => {},
    };

    render(
      <MixerContext.Provider value={initialValue}>
        <MixerContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </MixerContext.Consumer>
      </MixerContext.Provider>
    );

    expect(contextValue?.tracks).toHaveLength(3);
    expect(contextValue?.tracks.map((t) => t.id)).toEqual([
      "track-1",
      "track-2",
      "track-3",
    ]);
  });
});
