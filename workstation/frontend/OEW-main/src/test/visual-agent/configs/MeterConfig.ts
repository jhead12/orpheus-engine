import { VisualTestConfig } from "../types";

/**
 * Test configuration for the Meter widget component
 */
export const MeterConfig: VisualTestConfig = {
  componentName: "Meter",
  importPath: "../../components/widgets/Meter",
  props: {
    percent: 65,
    color: "#00ff00",
    vertical: false,
    marks: [
      { value: 25 },
      { value: 50 },
      { value: 75 }
    ]
  },
  states: [
    {
      name: "horizontal-default",
      props: {}
    },
    {
      name: "horizontal-empty",
      props: {
        percent: 0,
        color: "#666666"
      }
    },
    {
      name: "horizontal-full",
      props: {
        percent: 100,
        color: "#ff4444"
      }
    },
    {
      name: "horizontal-with-marks",
      props: {
        percent: 45,
        color: "#0099ff",
        marks: [
          { value: 10, style: { backgroundColor: "#ff0000", width: "2px" } },
          { value: 30, style: { backgroundColor: "#ffff00" } },
          { value: 50, style: { backgroundColor: "#00ff00" } },
          { value: 80, style: { backgroundColor: "#ff00ff", width: "3px" } }
        ]
      }
    },
    {
      name: "vertical-default",
      props: {
        vertical: true,
        percent: 70
      }
    },
    {
      name: "vertical-with-marks",
      props: {
        vertical: true,
        percent: 80,
        color: "#ff6600",
        marks: [
          { value: 20 },
          { value: 40 },
          { value: 60 },
          { value: 80 }
        ]
      }
    },
    {
      name: "level-animation",
      captureGif: true,
      props: {
        percent: 0
      },
      interactions: [
        {
          type: "input",
          target: "[data-testid='meter-level']",
          value: 25,
          delay: 300
        },
        {
          type: "input",
          target: "[data-testid='meter-level']", 
          value: 50,
          delay: 600
        },
        {
          type: "input",
          target: "[data-testid='meter-level']",
          value: 85,
          delay: 900
        },
        {
          type: "input",
          target: "[data-testid='meter-level']",
          value: 10,
          delay: 1200
        }
      ]
    },
    {
      name: "peak-indicators",
      captureGif: true,
      props: {
        percent: 90,
        showPeaks: true,
        color: "#ff0000"
      },
      interactions: [
        {
          type: "input",
          target: "[data-testid='meter-level']",
          value: 95,
          delay: 400
        },
        {
          type: "input",
          target: "[data-testid='meter-level']",
          value: 100,
          delay: 800
        },
        {
          type: "input",
          target: "[data-testid='meter-level']", 
          value: 75,
          delay: 1200
        }
      ]
    }
  ],
  containerStyle: "width: 250px; height: 200px; background: #1a1a1a; padding: 15px; display: flex; align-items: center; justify-content: center;",
  animationDuration: 2500
};
