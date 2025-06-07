import { describe, it } from "vitest";
import { renderVisualTest } from "../../test/visual-agent/helpers/render";
import { DNRConfig } from "../../test/visual-agent/configs/DNRConfig";

describe("DNR Visual Tests", () => {
  it("renders DNR in default state @visual", async () => {
    await renderVisualTest(DNRConfig, "default");
  });

  it("renders DNR in dragging state @visual-gif", async () => {
    await renderVisualTest(DNRConfig, "dragging");
  });

  it("renders DNR in resizing state @visual-gif", async () => {
    await renderVisualTest(DNRConfig, "resizing");
  });
});
