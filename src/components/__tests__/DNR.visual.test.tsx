import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import DNR from "../DNR";
import { expectScreenshot } from "@orpheus/test/helpers/screenshot";

describe("DNR Visual Tests", () => {
  const setupVisualTestContainer = () => {
    const container = document.createElement("div");
    container.style.cssText = `
      width: 700px;
      height: 500px;
      background: #1e1e1e;
      position: relative;
      overflow: hidden;
    `;
    
    // Add required CSS custom properties for DNR component
    container.style.setProperty("--border-primary", "#333");
    container.style.setProperty("--bg-secondary", "#2a2a2a");
    container.style.setProperty("--text-primary", "#ffffff");
    
    document.body.appendChild(container);
    return container;
  };

  it("renders DNR in default state @visual", async () => {
    const container = setupVisualTestContainer();

    // Position the DNR component at 50,50 with 200x100 size
    const coords = { startX: 50, startY: 50, endX: 250, endY: 150 };

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
            background: "#4a90e2",
            border: "2px solid #fff",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        >
          Default DNR
        </div>
      </DNR>,
      { container }
    );

    await new Promise((resolve) => setTimeout(resolve, 200));
    await expectScreenshot(container, "dnr-default");
    document.body.removeChild(container);
  });

  it("renders DNR with resize content @visual", async () => {
    const container = setupVisualTestContainer();

    // Position the DNR component at 100,100 with 200x120 size
    const coords = { startX: 100, startY: 100, endX: 300, endY: 220 };

    render(
      <DNR 
        coords={coords}
        drag={true}
        dragAxis="both"
        resize={true}
      >
        <div
          data-testid="dnr-content"
          style={{
            width: "100%",
            height: "100%",
            background: "#7b68ee",
            border: "2px solid #fff",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
            position: "relative",
            boxSizing: "border-box",
          }}
        >
          Resize Me
          <div
            style={{
              position: "absolute",
              bottom: "4px",
              right: "4px",
              width: "12px",
              height: "12px",
              background: "#fff",
              borderRadius: "2px",
              cursor: "se-resize",
            }}
          />
        </div>
      </DNR>,
      { container }
    );

    await new Promise((resolve) => setTimeout(resolve, 200));
    await expectScreenshot(container, "dnr-resize");
    document.body.removeChild(container);
  });

  it("renders DNR with drag content @visual", async () => {
    const container = setupVisualTestContainer();

    // Position the DNR component at 150,150 with 180x100 size
    const coords = { startX: 150, startY: 150, endX: 330, endY: 250 };

    render(
      <DNR 
        coords={coords}
        drag={true}
        dragAxis="both"
        resize={true}
      >
        <div
          data-testid="dnr-content"
          style={{
            width: "100%",
            height: "100%",
            background: "#ff6b6b",
            border: "2px solid #fff",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: "move",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            boxSizing: "border-box",
          }}
        >
          🔄 Drag Me
        </div>
      </DNR>,
      { container }
    );

    await new Promise((resolve) => setTimeout(resolve, 200));
    await expectScreenshot(container, "dnr-drag");
    document.body.removeChild(container);
  });
});
