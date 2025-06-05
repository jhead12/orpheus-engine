import { describe, it, expect } from "vitest";
import {
  formatDuration,
  parseDuration,
  hslToHex,
  hueFromHex,
  shadeColor,
  measureSeconds,
} from "../general";

describe("General Utilities", () => {
  describe("formatDuration", () => {
    it("formats seconds to MM:SS", () => {
      expect(formatDuration(65)).toBe("1:05");
      expect(formatDuration(3600)).toBe("60:00");
      expect(formatDuration(45)).toBe("0:45");
    });
  });

  describe("parseDuration", () => {
    it("parses MM:SS to seconds", () => {
      expect(parseDuration("1:05")).toBe(65);
      expect(parseDuration("60:00")).toBe(3600);
      expect(parseDuration("0:45")).toBe(45);
    });
  });

  describe("hslToHex", () => {
    it("converts HSL values to hex color", () => {
      expect(hslToHex(0, 100, 50)).toBe("#ff0000"); // Red
      expect(hslToHex(120, 100, 50)).toBe("#00ff00"); // Green
      expect(hslToHex(240, 100, 50)).toBe("#0000ff"); // Blue
    });
  });

  describe("hueFromHex", () => {
    it("extracts hue from hex color", () => {
      expect(hueFromHex("#ff0000")).toBe(0); // Red
      expect(hueFromHex("#00ff00")).toBe(120); // Green
      expect(hueFromHex("#0000ff")).toBe(240); // Blue
    });
  });

  describe("shadeColor", () => {
    it("adjusts color brightness", () => {
      expect(shadeColor("#ff0000", 50)).toBe("#ff0000"); // Red at max stays max
      expect(shadeColor("#808080", 50)).toBe("#c0c0c0"); // Grey gets lighter
      expect(shadeColor("#ffffff", -50)).toBe("#808080"); // White gets darker
    });
  });

  describe("measureSeconds", () => {
    it("calculates seconds for given measures", () => {
      // At 60 BPM, one measure (4/4) = 4 seconds
      expect(measureSeconds(1, 60)).toBe(4);
      expect(measureSeconds(2, 120)).toBe(4); // Double tempo = half time
      expect(measureSeconds(1, 60, { beats: 3, value: 4 })).toBe(3); // 3/4 time
    });
  });
});
