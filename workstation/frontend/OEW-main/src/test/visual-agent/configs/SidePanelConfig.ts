import { VisualTestConfig } from "../types";

/**
 * Test configuration for the SidePanel component
 */
export const SidePanelConfig: VisualTestConfig = {
  componentName: "SidePanel",
  importPath: "../../screens/workstation/components/SidePanel",
  props: {
    audioFiles: [
      { id: "1", name: "Track 1.wav", duration: 180 },
      { id: "2", name: "Track 2.wav", duration: 240 },
      { id: "3", name: "Bass Line.wav", duration: 320 },
      { id: "4", name: "Drums.wav", duration: 150 },
      { id: "5", name: "Synth Lead.wav", duration: 200 }
    ],
    collapsed: true,
    onFileSelect: () => {},
    onFileImport: () => {}
  },
  states: [
    {
      name: "collapsed-state",
      props: {}
    },
    {
      name: "expanded-state",
      props: {
        collapsed: false
      }
    },
    {
      name: "empty-panel",
      props: {
        audioFiles: [],
        collapsed: false
      }
    },
    {
      name: "single-file",
      props: {
        audioFiles: [
          { id: "1", name: "Single Track.wav", duration: 300 }
        ],
        collapsed: false
      }
    },
    {
      name: "long-filenames",
      props: {
        audioFiles: [
          { id: "1", name: "Very Long Filename That Should Be Truncated.wav", duration: 180 },
          { id: "2", name: "Another Extremely Long Audio File Name.wav", duration: 240 }
        ],
        collapsed: false
      }
    },
    {
      name: "expand-collapse-animation",
      captureGif: true,
      interactions: [
        {
          type: "mouseenter",
          target: "[data-testid='side-panel']",
          delay: 500
        },
        {
          type: "mouseleave",
          target: "[data-testid='side-panel']",
          delay: 2000
        },
        {
          type: "mouseenter",
          target: "[data-testid='side-panel']",
          delay: 3000
        }
      ]
    },
    {
      name: "file-selection",
      captureGif: true,
      props: {
        collapsed: false
      },
      interactions: [
        {
          type: "click",
          target: "[data-testid='audio-file-1']",
          delay: 600
        },
        {
          type: "click",
          target: "[data-testid='audio-file-2']",
          delay: 1200
        },
        {
          type: "click",
          target: "[data-testid='audio-file-3']",
          delay: 1800
        }
      ]
    },
    {
      name: "hover-interactions",
      captureGif: true,
      props: {
        collapsed: false
      },
      interactions: [
        {
          type: "hover",
          target: "[data-testid='audio-file-1']",
          delay: 400
        },
        {
          type: "hover",
          target: "[data-testid='audio-file-2']",
          delay: 800
        },
        {
          type: "hover",
          target: "[data-testid='audio-file-3']",
          delay: 1200
        },
        {
          type: "hover",
          target: "[data-testid='side-panel']",
          delay: 1600
        }
      ]
    }
  ],
  containerStyle: "width: 400px; height: 600px; background: #1e1e1e; position: relative;",
  animationDuration: 4000
};
