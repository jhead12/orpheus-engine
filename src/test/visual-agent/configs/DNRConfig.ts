import { VisualTestConfig } from "../types";

/**
 * Test configuration for the DNR (Drag and Resize) component
 */
export const DNRConfig: VisualTestConfig = {
  componentName: "DNR",
  importPath: "../../components/DNR",
  props: {
    coords: {
      startX: 100,
      startY: 100,
      endX: 300,
      endY: 200,
    },
    className: "test-dnr",
    drag: true,
    dragAxis: "both",
    children:
      '<div data-testid="dnr-content" style="width: 100%; height: 100%; background: linear-gradient(45deg, #ff0000, #0000ff); display: flex; align-items: center; justify-content: center; color: white;">Drag Me</div>',
  },
  states: [
    {
      name: "default",
      props: {},
    },
    {
      name: "dragging",
      interactions: [
        {
          type: "mousedown",
          target: "dnr-content",
          delay: 300,
        },
        {
          type: "mousemove",
          target: "document",
          value: { clientX: 200, clientY: 150 },
          delay: 500,
        },
        {
          type: "mousemove",
          target: "document",
          value: { clientX: 250, clientY: 180 },
          delay: 500,
        },
      ],
    },
    {
      name: "resizing",
      props: {
        // Add resize handles
        children:
          '<div data-testid="dnr-content" style="width: 100%; height: 100%; background: linear-gradient(45deg, #ff0000, #0000ff); display: flex; align-items: center; justify-content: center; color: white;">Resize Me</div><div data-testid="resize-handle" style="position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; background: white; cursor: nwse-resize;"></div>',
      },
      interactions: [
        {
          type: "mousedown",
          target: "resize-handle",
          delay: 300,
        },
        {
          type: "mousemove",
          target: "document",
          value: { clientX: 320, clientY: 220 },
          delay: 500,
        },
        {
          type: "mousemove",
          target: "document",
          value: { clientX: 350, clientY: 250 },
          delay: 500,
        },
      ],
    },
  ],
  containerStyle: `
    width: 600px;
    height: 400px;
    background: #1e1e1e;
    padding: 50px;
    position: relative;
  `,
  captureGif: true,
  animationDuration: 3000,
};
