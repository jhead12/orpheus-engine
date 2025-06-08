import { VisualTestConfig } from "../types";

/**
 * Test configuration for the ClipComponent
 */
export const ClipComponentConfig: VisualTestConfig = {
  componentName: "ClipComponent",
  importPath: "../../screens/workstation/components/ClipComponent", 
  props: {
    clip: {
      id: "clip-1",
      name: "Audio Clip",
      start: { bar: 0, beat: 0, tick: 0 },
      end: { bar: 4, beat: 0, tick: 0 },
      position: { bar: 0, beat: 0, tick: 0 },
      audioFile: { path: "test.wav", duration: 4.0 },
      muted: false,
      selected: false
    },
    track: {
      id: "track-1",
      name: "Audio Track",
      type: "audio",
      volume: 0,
      color: "#4ecdc4"
    },
    height: 100,
    onChangeLane: () => {},
    onSetClip: () => {}
  },
  states: [
    {
      name: "default",
      props: {}
    },
    {
      name: "selected-state",
      props: {
        clip: {
          id: "clip-1",
          name: "Audio Clip",
          selected: true,
          muted: false
        }
      }
    },
    {
      name: "muted-state", 
      props: {
        clip: {
          id: "clip-1",
          name: "Audio Clip",
          muted: true,
          selected: false
        }
      }
    },
    {
      name: "with-automation",
      props: {
        clip: {
          id: "clip-1",
          name: "Audio Clip",
          automation: {
            volume: [
              { position: { bar: 0, beat: 0, tick: 0 }, value: 0.8 },
              { position: { bar: 2, beat: 0, tick: 0 }, value: 0.4 },
              { position: { bar: 4, beat: 0, tick: 0 }, value: 1.0 }
            ]
          }
        }
      }
    },
    {
      name: "drag-operation",
      captureGif: true,
      interactions: [
        {
          type: "mousedown",
          target: "[data-testid='clip-component']",
          value: { clientX: 150, clientY: 50 },
          delay: 300
        },
        {
          type: "mousemove",
          target: "document",
          value: { clientX: 300, clientY: 50 },
          delay: 800
        },
        {
          type: "mouseup",
          target: "document",
          delay: 1000
        }
      ]
    },
    {
      name: "resize-operation",
      captureGif: true,
      interactions: [
        {
          type: "mousedown",
          target: "[data-testid='clip-resize-handle']",
          value: { clientX: 400, clientY: 50 },
          delay: 300
        },
        {
          type: "mousemove",
          target: "document", 
          value: { clientX: 500, clientY: 50 },
          delay: 800
        },
        {
          type: "mouseup",
          target: "document",
          delay: 1000
        }
      ]
    }
  ],
  containerStyle: "width: 800px; height: 200px; background: #1e1e1e; position: relative;",
  animationDuration: 3000,
  additionalImports: [
    "import { WorkstationContext } from '@orpheus/contexts';"
  ],
  contextProviders: [
    {
      import: "WorkstationContext",
      props: {
        selectedClipId: "null",
        setSelectedClipId: "() => {}",
        setClip: "() => {}",
        tracks: "[]"
      }
    }
  ]
};
