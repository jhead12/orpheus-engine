import { describe, it, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { expectScreenshot    // Find the DNR container instead of content since the string HTML was repla    // Find the resize handle that DNR generates
    const resizeHandle = container.querySelector(".dnr-resize-handle");
    if (!resizeHandle) throw new Error("Could not find resize handle");

    // mousedown interaction
    fireEvent.mouseDown(resizeHandle, { clientX: 300, clientY: 200 });
    await new Promise((resolve) => setTimeout(resolve, 300));

    // mousemove interaction
    fireEvent.mouseMove(document, { clientX: 320, clientY: 220 });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // mousemove interaction
    fireEvent.mouseMove(document, { clientX: 350, clientY: 250 });
    await new Promise((resolve) => setTimeout(resolve, 500));st dnrContainer = container.querySelector(".test-dnr");
    if (!dnrContainer) throw new Error("Could not find DNR container");

    // mousedown interaction
    fireEvent.mouseDown(dnrContainer, { clientX: 150, clientY: 150 });
    await new Promise((resolve) => setTimeout(resolve, 300));

    // mousemove interaction
    fireEvent.mouseMove(document, { clientX: 200, clientY: 150 });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // mousemove interaction
    fireEvent.mouseMove(document, { clientX: 250, clientY: 180 });
    await new Promise((resolve) => setTimeout(resolve, 500)); } from "../../test/helpers/screenshot";
import DNR from "../DNR";

describe("DNR Visual Tests", () => {
  beforeEach(() => {
    // Mock element positioning and computed style
    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockImplementation(function (this: Element) {
        // Check if this is the DNR container
        if (
          this &&
          this.classList &&
          this.classList.contains("dnr-container")
        ) {
          // Use the coords from props for DNR components
          return {
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            top: 100,
            right: 300,
            bottom: 250,
            left: 100,
            toJSON: () => {},
          };
        }
        // Default values for other elements
        return {
          x: 0,
          y: 0,
          width: 300,
          height: 300,
          top: 0,
          right: 300,
          bottom: 300,
          left: 0,
          toJSON: () => {},
        };
      });

    // Mock getComputedStyle
    window.getComputedStyle = vi.fn().mockImplementation(() => ({
      transform: "matrix(1, 0, 0, 1, 0, 0)",
      getPropertyValue: () => "",
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("visual test: renders DNR in default state @visual", async () => {
    const container = document.createElement("div");
    container.style.cssText = `
      width: 600px;
      height: 400px;
      background: #1e1e1e;
      padding: 50px;
      position: relative;
    `;
    document.body.appendChild(container);

    const baseProps = {
      coords: {
        startX: 100,
        startY: 100,
        endX: 300,
        endY: 200,
      },
      className: "test-dnr",
      drag: true,
      dragAxis: "both" as const, // Type assertion to match enum type
    };

    render(
      <DNR {...baseProps}>
        <div
          data-testid="dnr-content"
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(45deg, #ff0000, #0000ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          Drag Me
        </div>
      </DNR>,
      { container }
    );

    // Wait for any animations to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expectScreenshot(container, "dnr-default");

    document.body.removeChild(container);
  });

  it("visual test: renders DNR in dragging state @visual-gif", async () => {
    const container = document.createElement("div");
    container.style.cssText = `
      width: 600px;
      height: 400px;
      background: #1e1e1e;
      padding: 50px;
      position: relative;
    `;
    document.body.appendChild(container);

    const baseProps = {
      coords: {
        startX: 100,
        startY: 100,
        endX: 300,
        endY: 200,
      },
      className: "test-dnr",
      drag: true,
      dragAxis: "both" as const,
    };

    render(
      <DNR {...baseProps}>
        <div
          data-testid="dnr-content"
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(45deg, #ff0000, #0000ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          Drag Me
        </div>
      </DNR>,
      { container }
    );

    // Find the DNR container instead of content since the string HTML was replaced
    const dnrContainer = container.querySelector(".test-dnr");
    if (!dnrContainer) throw new Error("Could not find DNR container");

    // mousedown interaction
    fireEvent.mouseDown(dnrContainer, { clientX: 150, clientY: 150 });
    await new Promise((resolve) => setTimeout(resolve, 300));

    // mousemove interaction
    fireEvent.mouseMove(document, { clientX: 200, clientY: 150 });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // mousemove interaction
    fireEvent.mouseMove(document, { clientX: 250, clientY: 180 });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Record a GIF of any animations or state changes
    await recordGif(container, "dnr-dragging", 3000);

    document.body.removeChild(container);
  });

  it("visual test: renders DNR in resizing state @visual-gif", async () => {
    const container = document.createElement("div");
    container.style.cssText = `
      width: 600px;
      height: 400px;
      background: #1e1e1e;
      padding: 50px;
      position: relative;
    `;
    document.body.appendChild(container);

    const baseProps = {
      coords: {
        startX: 100,
        startY: 100,
        endX: 300,
        endY: 200,
      },
      className: "test-dnr",
      drag: true,
      dragAxis: "both" as const,
      resize: true,
    };

    render(
      <DNR {...baseProps}>
        <div
          data-testid="dnr-content"
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(45deg, #ff0000, #0000ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          Resize Me
        </div>
      </DNR>,
      { container }
    );

    // Find the resize handle that DNR generates
    const resizeHandle = container.querySelector(".dnr-resize-handle");
    if (!resizeHandle) throw new Error("Could not find resize handle");

    // mousedown interaction
    fireEvent.mouseDown(resizeHandle, { clientX: 300, clientY: 200 });
    await new Promise((resolve) => setTimeout(resolve, 300));

    // mousemove interaction
    fireEvent.mouseMove(document, { clientX: 320, clientY: 220 });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // mousemove interaction
    fireEvent.mouseMove(document, { clientX: 350, clientY: 250 });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Record a GIF of any animations or state changes
    await recordGif(container, "dnr-resizing", 3000);

    document.body.removeChild(container);
  });
});
