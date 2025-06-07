import { VisualTestConfig } from "../types";

/**
 * Test configuration for the Scrollbar component
 */
export const ScrollbarConfig: VisualTestConfig = {
  componentName: "Scrollbar",
  importPath: "../../components/Scrollbar",
  props: {
    axis: "y",
    targetEl: null, // Will be set at runtime
    thumbSize: 100,
    trackSize: 400,
    onScroll: () => {},
  },
  states: [
    {
      name: "vertical",
      props: { axis: "y" },
    },
    {
      name: "horizontal",
      props: { axis: "x" },
    },
    {
      name: "scrolling",
      props: { axis: "y" },
      interactions: [
        {
          type: "mousedown",
          target: "scrollbar-thumb",
          delay: 300,
        },
        {
          type: "mousemove",
          target: "document",
          value: { clientY: 150 },
          delay: 500,
        },
        {
          type: "mousemove",
          target: "document",
          value: { clientY: 200 },
          delay: 500,
        },
      ],
    },
  ],
  containerStyle: `
    width: 400px;
    height: 400px;
    background: #1e1e1e;
    padding: 20px;
    position: relative;
  `,
  captureGif: true,
  animationDuration: 2000,
  additionalImports: [
    "import { useRef, useEffect } from 'react';",
    "// Scrollbar test wrapper that creates the necessary DOM elements",
    "const ScrollbarWrapper = (props) => {",
    "  const containerRef = useRef(null);",
    "  const targetRef = useRef(null);",
    "  ",
    "  useEffect(() => {",
    "    if (targetRef.current) {",
    "      // Set scroll dimensions",
    "      Object.defineProperties(targetRef.current, {",
    "        scrollWidth: { value: 1000, configurable: true },",
    "        clientWidth: { value: 400, configurable: true },",
    "        scrollHeight: { value: 1000, configurable: true },",
    "        clientHeight: { value: 400, configurable: true },",
    "        scrollLeft: { value: 0, writable: true },",
    "        scrollTop: { value: 0, writable: true }",
    "      });",
    "    }",
    "  }, []);",
    "  ",
    "  return (",
    "    <div ref={containerRef} style={{ position: 'relative', width: '400px', height: '400px', overflow: 'hidden' }}>",
    "      <div ref={targetRef} data-testid=\"scroll-target\" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>",
    "        <div style={{ width: '1000px', height: '1000px' }}>Scrollable Content</div>",
    "      </div>",
    "      <Scrollbar {...props} targetEl={targetRef.current} />",
    "    </div>",
    "  );",
    "};",
  ],
};
