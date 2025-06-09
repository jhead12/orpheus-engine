import { VisualTestConfig } from "../types";

/**
 * Test configuration for the Mixer component
 */
export const MixerConfig: VisualTestConfig = {
  componentName: "Mixer",
  importPath: "../../screens/workstation/components/Mixer",
  props: {
    tracks: [
      {
        id: "track-1",
        name: "Vocals",
        type: "audio",
        mute: false,
        solo: false,
        armed: false,
        volume: -6,
        pan: 0,
        color: "#ff6b6b",
        effects: []
      },
      {
        id: "track-2",
        name: "Guitar", 
        type: "audio",
        mute: false,
        solo: false,
        armed: true,
        volume: -3,
        pan: 0.2,
        color: "#4ecdc4",
        effects: []
      }
    ],
    masterVolume: -2,
    onVolumeChange: () => {},
    onPanChange: () => {},
    onMuteToggle: () => {},
    onSoloToggle: () => {},
    onEffectChange: () => {}
  },
  states: [
    {
      name: "default-layout",
      props: {}
    },
    {
      name: "with-master-section",
      props: {
        showMaster: true,
        masterVolume: 0
      }
    },
    {
      name: "fader-interaction",
      captureGif: true,
      interactions: [
        {
          type: "drag",
          target: "[data-testid='volume-fader-track-1']",
          value: { startY: 200, endY: 100 },
          delay: 800
        },
        {
          type: "drag",
          target: "[data-testid='volume-fader-track-2']", 
          value: { startY: 180, endY: 120 },
          delay: 1200
        }
      ]
    },
    {
      name: "mute-solo-interactions",
      captureGif: true,
      interactions: [
        {
          type: "click",
          target: "[data-testid='mute-button-track-1']",
          delay: 600
        },
        {
          type: "click",
          target: "[data-testid='solo-button-track-2']",
          delay: 1200
        }
      ]
    }
  ],
  containerStyle: "width: 1200px; height: 800px; background: #1e1e1e; padding: 20px;",
  animationDuration: 4000,
  additionalImports: [
    "import { WorkstationContext } from '@orpheus/contexts';"
  ],
  contextProviders: [
    {
      import: "WorkstationContext",
      props: {
        tracks: [],
        setTracks: "() => {}",
        setTrack: "() => {}"
      }
    }
  ]
};
