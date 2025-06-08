import { VisualTestConfig } from "../types";

/**
 * Test configuration for the Timeline component
 */
export const TimelineConfig: VisualTestConfig = {
  componentName: "Timeline",
  importPath: "../../screens/workstation/components/Timeline",
  props: {
    tracks: [
      {
        id: "track-1",
        name: "Audio Track",
        type: "audio",
        mute: false,
        solo: false,
        armed: false,
        volume: 0,
        pan: 0,
        clips: []
      }
    ],
    currentTime: { bar: 0, beat: 0, tick: 0 },
    onTimeChange: () => {},
    onTrackSelect: () => {},
    zoom: 1.0
  },
  states: [
    {
      name: "default",
      props: {}
    },
    {
      name: "with-multiple-tracks",
      props: {
        tracks: [
          {
            id: "track-1",
            name: "Audio Track",
            type: "audio",
            mute: false,
            solo: false,
            volume: -6
          },
          {
            id: "track-2", 
            name: "MIDI Track",
            type: "midi",
            mute: false,
            solo: true,
            volume: 0
          }
        ]
      }
    },
    {
      name: "playhead-interaction",
      captureGif: true,
      interactions: [
        {
          type: "click",
          target: "[data-testid='timeline-grid']",
          value: { clientX: 200, clientY: 100 },
          delay: 500
        },
        {
          type: "click", 
          target: "[data-testid='timeline-grid']",
          value: { clientX: 400, clientY: 100 },
          delay: 1000
        }
      ]
    }
  ],
  containerStyle: "width: 1000px; height: 600px; background: #1e1e1e; overflow: hidden;",
  animationDuration: 3000,
  additionalImports: [
    "import { WorkstationContext } from '@orpheus/contexts';"
  ],
  contextProviders: [
    {
      import: "WorkstationContext",
      props: {
        tracks: [],
        setTracks: "() => {}",
        playheadPos: "{ bar: 0, beat: 0, tick: 0 }",
        setPlayheadPos: "() => {}"
      }
    }
  ]
};
