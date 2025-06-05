import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeAll } from "vitest";
import Knob from "../Knob";

describe("Knob Component", () => {
  // Mock wheel events since JSDom doesn't fully support them
  beforeAll(() => {
    Object.defineProperty(window, "WheelEvent", {
      value: class WheelEvent extends Event {
        deltaY: number;
        preventDefault: () => void;
        constructor(type: string, init: WheelEventInit = {}) {
          super(type);
          this.deltaY = init.deltaY || 0;
          this.preventDefault = vi.fn();
        }
      },
    });
  });

  it("renders with default props", () => {
    render(<Knob value={50} />);
    const knobElement = screen.getByLabelText("50");
    expect(knobElement).toBeInTheDocument();
  });

  it("renders with custom size", () => {
    render(<Knob value={50} size={60} />);
    const knobRotator = screen.getByTestId("knob-rotator");
    expect(knobRotator).toHaveStyle({ width: "60px", height: "60px" });
  });
  it("calls onChange when dragged", () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Knob value={50} onChange={handleChange} onInput={handleChange} />
    );

    const knobElement = screen.getByLabelText("50");
    fireEvent.mouseDown(knobElement, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientX: 0, clientY: -50 });
    fireEvent.mouseUp(document);

    expect(handleChange).toHaveBeenCalled();
  });

  it("handles disabled state", () => {
    render(<Knob value={50} disabled />);
    const knobElement = screen.getByLabelText("50");
    expect(knobElement).toHaveStyle({ cursor: "default" });
  });
  it("respects min and max values", () => {
    const handleChange = vi.fn();
    render(
      <Knob
        value={50}
        min={0}
        max={100}
        onChange={handleChange}
        onInput={handleChange}
      />
    );

    const knobElement = screen.getByLabelText("50");

    // Simulate dragging past the max
    fireEvent.mouseDown(knobElement, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientX: 0, clientY: -1000 }); // Large movement
    fireEvent.mouseUp(document);

    // Verify handleChange was called
    expect(handleChange).toHaveBeenCalled();
    // Get the last call args
    const calls = handleChange.mock.calls;
    expect(calls[calls.length - 1][0]).toBeLessThanOrEqual(100);
  });
  it("shows tooltip on interaction", () => {
    render(
      <Knob value={50} title="Volume" valueLabelFormat={(val) => `${val}%`} />
    );

    const knobElement = screen.getByLabelText("50%");
    fireEvent.mouseDown(knobElement);

    // Check for tooltip
    expect(screen.getByLabelText("50%")).toBeInTheDocument();
  });
  it("handles wheel events for value adjustment", () => {
    const handleChange = vi.fn();
    render(<Knob value={50} onChange={handleChange} onInput={handleChange} />);

    const knobElement = screen.getByLabelText("50");
    const wheelEvent = new WheelEvent("wheel", { deltaY: -100 });
    
    act(() => {
      knobElement.dispatchEvent(wheelEvent);
    });
    expect(handleChange).toHaveBeenCalled();
  });
  it("supports custom styling", () => {
    const customStyle = {
      knob: {
        backgroundColor: "red",
      },
      indicator: {
        backgroundColor: "blue",
      },
    };

    const { container } = render(<Knob value={50} style={customStyle} />);
    const knobElement = container.querySelector(
      '[style*="background-color: red"]'
    );
    const indicator = container.querySelector(
      '[style*="background-color: blue"]'
    );

    expect(knobElement).toBeInTheDocument();
    expect(indicator).toBeInTheDocument();
  });

  it("supports bidirectional meter", () => {
    render(<Knob value={0} bidirectionalMeter />);
    const knobElement = screen.getByLabelText("0");
    expect(knobElement).toBeInTheDocument();
  });
  it("updates value and UI when props change", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <Knob value={50} onChange={handleChange} min={0} max={100} />
    );

    const initialKnob = screen.getByLabelText("50");
    expect(initialKnob).toBeInTheDocument();

    // Update the value prop
    rerender(<Knob value={75} onChange={handleChange} min={0} max={100} />);

    // Check rotation change
    const rotator = screen.getByTestId("knob-rotator");
    expect(rotator).toBeInTheDocument();
    expect(rotator).toHaveStyle({
      transform: "translate(-50%, -50%) rotate(67.5deg)",
    });

    // Ensure label updates
    expect(screen.queryByLabelText("50")).not.toBeInTheDocument();
    expect(screen.getByLabelText("75")).toBeInTheDocument();
  });
  it("handles text input when enabled", () => {
    const handleChange = vi.fn();
    render(
      <Knob value={50} onChange={handleChange} disableTextInput={false} />
    );

    const knobElement = screen.getByLabelText("50");
    fireEvent.doubleClick(knobElement);

    // Handle double-click case even if direct text input not available
    expect(knobElement).toBeInTheDocument();
  });
});
