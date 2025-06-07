import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import DNR from "../DNR";
import { expectScreenshot } from "@orpheus/test/helpers/screenshot";

describe("DNR Visual Tests", () => {
  const baseProps = {
    coords: { startX: 100, startY: 100, endX: 300, endY: 200 },
    drag: true,
    dragAxis: "both" as const,
    resize: true,
  };

  const containerStyle = `
    width: 600px;
    height: 400px;
    background: #1e1e1e;
    padding: 50px;
    position: relative;
  `;

  it("renders DNR in default state @visual", async () => {
    const container = document.createElement("div");
    container.style.cssText = containerStyle;
    document.body.appendChild(container);

    // Empty DNR render to match first screenshot
    render(<DNR {...baseProps} />, { container });

    await new Promise((resolve) => setTimeout(resolve, 500));
    await expectScreenshot(container, "dnr-default");
    document.body.removeChild(container);
  });

  it("renders DNR with resize content @visual", async () => {
    const container = document.createElement("div");
    container.style.cssText = containerStyle;
    document.body.appendChild(container);

    render(
      <DNR {...baseProps}>
        <div
          data-testid="dnr-content"
          style={{
            width: "100%",
            height: "100%",
            background: "#2a2a2a",
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

    await new Promise((resolve) => setTimeout(resolve, 500));
    await expectScreenshot(container, "dnr-resize");
    document.body.removeChild(container);
  });

  it("renders DNR with drag content @visual", async () => {
    const container = document.createElement("div");
    container.style.cssText = containerStyle;
    document.body.appendChild(container);

    render(
      <DNR {...baseProps}>
        <div
          data-testid="dnr-content"
          style={{
            width: "100%",
            height: "100%",
            background: "#2a2a2a",
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

    await new Promise((resolve) => setTimeout(resolve, 500));
    await expectScreenshot(container, "dnr-drag");
    document.body.removeChild(container);
  });
});
