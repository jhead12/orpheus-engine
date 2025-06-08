import { describe, it, expect } from "vitest";
import { TimelinePosition } from "../../../../types/core";

describe("TimelinePosition toSeconds() fix", () => {
  it("should have toSeconds method available", () => {
    const position = new TimelinePosition(1, 2, 240);

    // This should not throw "toSeconds is not a function" error
    expect(typeof position.toSeconds).toBe("function");

    // Should return a number
    const result = position.toSeconds();
    expect(typeof result).toBe("number");
  });

  it("should calculate seconds correctly", () => {
    const position = new TimelinePosition(2, 1, 480);
    const seconds = position.toSeconds();

    // Should return calculated value: (2*4+1)*0.5 + 480*0.001 = 4.5 + 0.48 = 4.98
    expect(seconds).toBe(4.98);
  });
});
