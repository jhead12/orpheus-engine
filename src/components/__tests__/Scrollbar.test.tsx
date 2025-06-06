import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import Scrollbar from "../Scrollbar";

describe("Scrollbar", () => {
  beforeEach(() => {
    // Create target element with specific dimensions for testing
    const targetEl = document.createElement("div");
    targetEl.style.width = "200px";
    targetEl.style.height = "200px";
    targetEl.style.overflow = "auto";
    targetEl.style.position = "relative";

    // Create content that's twice the size to ensure scrolling
    const content = document.createElement("div");
    content.style.width = "400px";
    content.style.height = "400px";
    content.style.background = "#eee";

    targetEl.appendChild(content);
    document.body.appendChild(targetEl);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders without crashing", () => {
    const targetEl = document.querySelector("div") as HTMLDivElement;
    const { container } = render(<Scrollbar axis="y" targetEl={targetEl} />);
    const scrollbar = container.querySelector(".scrollbar");
    expect(scrollbar).toBeInTheDocument();
  });

  it("handles vertical scrolling", async () => {
    const targetEl = document.querySelector("div") as HTMLDivElement;
    const { container } = render(
      <Scrollbar axis="y" targetEl={targetEl} style={{ height: "100px" }} />
    );

    // Calculate drag ratio based on content and viewport sizes
    const contentSize = targetEl.scrollHeight;
    const viewportSize = targetEl.clientHeight;
    const dragRatio = (contentSize - viewportSize) / 100; // 100px scrollbar height

    const thumb = container.querySelector(".scrollbar-thumb") as HTMLElement;
    expect(thumb).toBeTruthy();

    const initialScrollTop = targetEl.scrollTop;

    // Simulate mouse events with more accurate positions
    fireEvent.mouseDown(thumb, { clientY: 0 });

    // Move mouse by 50px, which should translate to 50 * dragRatio scroll distance
    fireEvent.mouseMove(document, {
      clientY: 50,
      buttons: 1, // Indicate primary button is still pressed
    });

    // Wait for scroll to be applied
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Verify scroll position change
    const expectedScroll = 50 * dragRatio;
    expect(targetEl.scrollTop).toBeGreaterThanOrEqual(expectedScroll * 0.9);
    expect(targetEl.scrollTop).toBeLessThanOrEqual(expectedScroll * 1.1);

    // Clean up
    fireEvent.mouseUp(document);
  });

  it("handles horizontal scrolling", async () => {
    const targetEl = document.querySelector("div") as HTMLDivElement;
    const { container } = render(
      <Scrollbar axis="x" targetEl={targetEl} style={{ width: "100px" }} />
    );

    // Calculate drag ratio based on content and viewport sizes
    const contentSize = targetEl.scrollWidth;
    const viewportSize = targetEl.clientWidth;
    const dragRatio = (contentSize - viewportSize) / 100; // 100px scrollbar width

    const thumb = container.querySelector(".scrollbar-thumb") as HTMLElement;
    expect(thumb).toBeTruthy();

    // Store initial position
    const initialScrollLeft = targetEl.scrollLeft;

    // Simulate mouse events with more accurate positions
    fireEvent.mouseDown(thumb, { clientX: 0 });

    // Move mouse by 50px, which should translate to 50 * dragRatio scroll distance
    fireEvent.mouseMove(document, {
      clientX: 50,
      buttons: 1, // Indicate primary button is still pressed
    });

    // Wait for scroll to be applied
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Verify scroll position change
    const expectedScroll = 50 * dragRatio;
    expect(targetEl.scrollLeft).toBeGreaterThan(initialScrollLeft);
    expect(targetEl.scrollLeft).toBeGreaterThanOrEqual(expectedScroll * 0.9);
    expect(targetEl.scrollLeft).toBeLessThanOrEqual(expectedScroll * 1.1);

    // Clean up
    fireEvent.mouseUp(document);
  });

  it("updates thumb position on target scroll", async () => {
    const targetEl = document.querySelector("div") as HTMLDivElement;
    const { container } = render(<Scrollbar axis="y" targetEl={targetEl} />);

    const thumb = container.querySelector(".scrollbar-thumb") as HTMLDivElement;
    expect(thumb).toBeTruthy();

    // Wait for initial render and position calculation
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Get initial thumb position
    const initialTop = parseInt(thumb.style.top, 10) || 0;

    // Calculate expected thumb movement
    const scrollableHeight = targetEl.scrollHeight - targetEl.clientHeight;
    const scrollbarHeight = 100; // Default height from style
    const scrollDistance = scrollableHeight * 0.25;
    const expectedThumbMove =
      (scrollDistance / scrollableHeight) * scrollbarHeight;

    // Scroll target element 25% of the way
    targetEl.scrollTop = scrollDistance;
    fireEvent.scroll(targetEl);

    // Wait for scroll handler and next render
    await new Promise((resolve) => setTimeout(resolve, 50));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Get new thumb position
    const newTop = parseInt(thumb.style.top, 10);

    // Verify thumb moved by expected amount (with some tolerance)
    const actualMove = newTop - initialTop;
    expect(actualMove).toBeGreaterThan(0); // Thumb should move down
    expect(Math.abs(actualMove - expectedThumbMove)).toBeLessThan(5); // Allow 5px tolerance
  });

  it("applies custom styles", () => {
    const targetEl = document.querySelector("div") as HTMLDivElement;
    render(
      <Scrollbar
        axis="y"
        targetEl={targetEl}
        style={{ backgroundColor: "red" }}
        thumbStyle={{ backgroundColor: "blue" }}
      />
    );

    // Get scrollbar element
    const scrollbar = document.querySelector(".scrollbar") as HTMLDivElement;
    if (!scrollbar) throw new Error("Scrollbar element not found");

    // Get thumb element
    const thumb = scrollbar.querySelector(".scrollbar-thumb") as HTMLDivElement;
    if (!thumb) throw new Error("Thumb element not found");

    // Use getComputedStyle since colors are converted to RGB format
    const scrollbarStyle = window.getComputedStyle(scrollbar);
    const thumbStyle = window.getComputedStyle(thumb);

    expect(scrollbarStyle.backgroundColor).toBe("rgb(255, 0, 0)");
    expect(thumbStyle.backgroundColor).toBe("rgb(0, 0, 255)");
  });
});
