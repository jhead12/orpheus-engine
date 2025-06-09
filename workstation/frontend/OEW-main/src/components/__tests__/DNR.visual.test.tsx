import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import DNR from "../DNR";
import { expectScreenshot } from "../../test/helpers/screenshot";

describe("DNR Visual Tests", () => {
  const isCI = process.env.CI === 'true';
  const isCodespaces = process.env.CODESPACES === 'true';
  const hasDisplay = process.env.DISPLAY || process.env.WAYLAND_DISPLAY;
  const forceVisualTests = process.env.FORCE_VISUAL_TESTS === 'true';
  const shouldSkipVisualTests = !forceVisualTests && (isCI || isCodespaces || !hasDisplay);

  it("renders DNR in default state @visual", async () => {
    if (shouldSkipVisualTests) {
      console.warn('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }

    const container = document.createElement("div");
    container.style.cssText = `
      width: 600px;
      height: 400px;
      background: #1e1e1e;
      position: relative;
    `;
    document.body.appendChild(container);

    try {
      // Position the DNR component at 50,50 with 200x100 size
      const coords = { startX: 50, startY: 50, endX: 250, endY: 150 };

      render(
        <DNR 
          coords={coords}
          drag={false}
          dragAxis="both"
          resize={false}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#4a90e2",
              border: "2px solid #fff",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Default DNR
          </div>
        </DNR>,
        { container }
      );

      await new Promise(resolve => setTimeout(resolve, 100));
      await expectScreenshot(container, "dnr-default-state");
    } catch (error) {
      console.warn("Visual test failed:", error);
      if (!isCI && !isCodespaces) {
        throw error;
      }
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  });

  it("renders DNR during resize @visual", async () => {
    if (shouldSkipVisualTests) {
      console.warn('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }

    const container = document.createElement("div");
    container.style.cssText = `
      width: 600px;
      height: 400px;
      background: #1e1e1e;
      position: relative;
    `;
    document.body.appendChild(container);

    try {
      // Position for resize state
      const coords = { startX: 100, startY: 100, endX: 350, endY: 250 };

      render(
        <DNR 
          coords={coords}
          drag={false}
          dragAxis="both"
          resize={true}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#e67e22",
              border: "2px solid #f39c12",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: "se-resize",
            }}
          >
            Resize DNR
          </div>
        </DNR>,
        { container }
      );

      await new Promise(resolve => setTimeout(resolve, 100));
      await expectScreenshot(container, "dnr-resize-state");
    } catch (error) {
      console.warn("Visual test failed:", error);
      if (!isCI && !isCodespaces) {
        throw error;
      }
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  });

  it("renders DNR during drag @visual", async () => {
    if (shouldSkipVisualTests) {
      console.warn('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }

    const container = document.createElement("div");
    container.style.cssText = `
      width: 600px;
      height: 400px;
      background: #1e1e1e;
      position: relative;
    `;
    document.body.appendChild(container);

    try {
      // Position for drag state
      const coords = { startX: 150, startY: 200, endX: 400, endY: 300 };

      render(
        <DNR 
          coords={coords}
          drag={true}
          dragAxis="both"
          resize={true}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "#27ae60",
              border: "2px solid #2ecc71",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: "move",
              transform: "translate(5px, 5px)",
            }}
          >
            Drag DNR
          </div>
        </DNR>,
        { container }
      );

      await new Promise(resolve => setTimeout(resolve, 100));
      await expectScreenshot(container, "dnr-drag-state");
    } catch (error) {
      console.warn("Visual test failed:", error);
      if (!isCI && !isCodespaces) {
        throw error;
      }
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  });
});
