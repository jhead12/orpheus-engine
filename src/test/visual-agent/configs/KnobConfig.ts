import { VisualTestConfig } from "../types";

/**
 * Test configuration for the Knob widget component
 */
export const KnobConfig: VisualTestConfig = {
  componentName: "Knob",
  importPath: "../../components/widgets/Knob",
  props: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    onChange: () => {},
    label: "Test Knob",
    size: 60,
    color: "#4ecdc4"
  },
  states: [
    {
      name: "default",
      props: {}
    },
    {
      name: "minimum-value",
      props: {
        value: 0,
        label: "Min Value"
      }
    },
    {
      name: "maximum-value", 
      props: {
        value: 100,
        label: "Max Value"
      }
    },
    {
      name: "custom-color",
      props: {
        value: 75,
        color: "#ff6b6b",
        label: "Custom Color"
      }
    },
    {
      name: "large-knob",
      props: {
        value: 60,
        size: 100,
        label: "Large Knob"
      }
    },
    {
      name: "small-knob",
      props: {
        value: 40,
        size: 40,
        label: "Small Knob"
      }
    },
    {
      name: "rotation-animation",
      captureGif: true,
      interactions: [
        {
          type: "mousedown",
          target: "[data-testid='knob-control']",
          value: { clientX: 100, clientY: 100 },
          delay: 300
        },
        {
          type: "mousemove",
          target: "document",
          value: { clientX: 100, clientY: 80 },
          delay: 500
        },
        {
          type: "mousemove",
          target: "document",
          value: { clientX: 100, clientY: 60 },
          delay: 800
        },
        {
          type: "mousemove",
          target: "document", 
          value: { clientX: 100, clientY: 120 },
          delay: 1200
        },
        {
          type: "mouseup",
          target: "document",
          delay: 1500
        }
      ]
    },
    {
      name: "value-sweep",
      captureGif: true,
      interactions: [
        {
          type: "mousedown",
          target: "[data-testid='knob-control']",
          value: { clientX: 100, clientY: 100 },
          delay: 200
        },
        {
          type: "mousemove",
          target: "document",
          value: { clientX: 100, clientY: 50 },
          delay: 600
        },
        {
          type: "mousemove",
          target: "document",
          value: { clientX: 100, clientY: 150 },
          delay: 1200
        },
        {
          type: "mouseup",
          target: "document",
          delay: 1800
        }
      ]
    }
  ],
  containerStyle: "width: 200px; height: 200px; background: #2a2a2a; display: flex; align-items: center; justify-content: center; padding: 20px;",
  animationDuration: 3000
};
