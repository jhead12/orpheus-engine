import { VisualTestConfig } from "../types";

/**
 * Test configuration for the TrackComponent
 */
export const TrackComponentConfig: VisualTestConfig = {
  componentName: "TrackComponent",
  importPath: "../../screens/workstation/components/TrackComponent",
  props: {
    track: {
      id: "test-track",
      name: "Test Track",
      type: "audio",
      mute: false,
      solo: false,
      armed: false,
      volume: 0,
      pan: 0,
      automation: false,
      automationMode: "off",
      automationLanes: [],
      clips: [],
      color: "#ff6b6b",
      effects: []
    }
  },
  states: [
    {
      name: "normal-track",
      props: {}
    },
    {
      name: "muted-track",
      props: {
        track: {
          id: "test-track",
          name: "Test Track",
          mute: true,
          color: "#666666"
        }
      }
    },
    {
      name: "armed-track",
      props: {
        track: {
          id: "test-track", 
          name: "Test Track",
          armed: true,
          color: "#ff4444"
        }
      }
    },
    {
      name: "solo-track",
      props: {
        track: {
          id: "test-track",
          name: "Test Track", 
          solo: true,
          color: "#ffaa00"
        }
      }
    },
    {
      name: "midi-track",
      props: {
        track: {
          id: "midi-track",
          name: "MIDI Track",
          type: "midi",
          color: "#4ecdc4",
          clips: [
            {
              id: "midi-clip-1",
              name: "MIDI Clip",
              start: { bar: 0, beat: 0, tick: 0 },
              end: { bar: 4, beat: 0, tick: 0 },
              notes: []
            }
          ]
        }
      }
    },
    {
      name: "track-with-automation",
      props: {
        track: {
          id: "auto-track",
          name: "Automation Track",
          automation: true,
          automationMode: "write",
          automationLanes: [
            {
              id: "volume-lane",
              envelope: "volume",
              enabled: true,
              expanded: true,
              points: [
                { position: { bar: 0, beat: 0, tick: 0 }, value: 0.8 },
                { position: { bar: 2, beat: 0, tick: 0 }, value: 0.4 },
                { position: { bar: 4, beat: 0, tick: 0 }, value: 1.0 }
              ]
            }
          ]
        }
      }
    },
    {
      name: "track-with-effects",
      props: {
        track: {
          id: "fx-track",
          name: "FX Track",
          effects: [
            {
              id: "reverb-1",
              name: "Reverb",
              type: "juce",
              enabled: true,
              parameters: { mix: 0.5, roomSize: 0.7 }
            },
            {
              id: "eq-1", 
              name: "EQ",
              type: "juce",
              enabled: false,
              parameters: { lowGain: 0, midGain: 2, highGain: -1 }
            }
          ]
        }
      }
    },
    {
      name: "button-interactions",
      captureGif: true,
      interactions: [
        {
          type: "click",
          target: "[data-testid='mute-button']",
          delay: 600
        },
        {
          type: "click",
          target: "[data-testid='solo-button']", 
          delay: 1200
        },
        {
          type: "click",
          target: "[data-testid='arm-button']",
          delay: 1800
        }
      ]
    },
    {
      name: "volume-fader-interaction",
      captureGif: true,
      interactions: [
        {
          type: "drag",
          target: "[data-testid='volume-fader']",
          value: { startY: 100, endY: 50 },
          delay: 800
        },
        {
          type: "drag",
          target: "[data-testid='volume-fader']",
          value: { startY: 50, endY: 150 },
          delay: 1600
        }
      ]
    }
  ],
  containerStyle: "width: 800px; height: 200px; background: #1e1e1e; position: relative; padding: 16px;",
  animationDuration: 4000,
  additionalImports: [
    "import { WorkstationContext } from '@orpheus/contexts';"
  ],
  contextProviders: [
    {
      import: "WorkstationContext", 
      props: {
        tracks: "[]",
        setTrack: "() => {}",
        setTracks: "() => {}",
        getTrackCurrentValue: "() => ({ value: 0.8, isAutomated: false })"
      }
    }
  ]
};
