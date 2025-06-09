// Quick debug script to see the actual DOM structure
import React from "react";
import { render } from "@testing-library/react";
import { JSDOM } from "jsdom";

// Set up DOM environment
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
global.window = dom.window;
global.document = dom.window.document;

// Import the Meter component
const Meter = (await import("../src/components/widgets/Meter.tsx")).default;

// Render and inspect
const { container } = render(
  React.createElement(Meter, { percent: 75, color: "#ff0000" })
);

console.log("=== DOM Structure ===");
console.log(container.innerHTML);

// Try different selectors
const selectors = [
  "div",
  "div > div",
  "div > div > div",
  "div > div > div:first-child",
  "div > div > div:first-child > div",
];

selectors.forEach((selector) => {
  const elements = container.querySelectorAll(selector);
  console.log(`\n=== Selector: ${selector} (${elements.length} matches) ===`);
  elements.forEach((el, i) => {
    console.log(`Element ${i}:`, el.outerHTML);
    if (el.style.cssText) {
      console.log(`  Styles: ${el.style.cssText}`);
    }
  });
});
