import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { SortableList, SortableListItem } from "../SortableList";

describe("SortableList Widget", () => {
  const mockAutoScroll = {
    thresholds: {
      top: { slow: 5, medium: 10, fast: 20 },
      right: { slow: 5, medium: 10, fast: 20 },
      bottom: { slow: 5, medium: 10, fast: 20 },
      left: { slow: 5, medium: 10, fast: 20 },
    },
  };

  const mockOnSortUpdate = vi.fn();
  const mockOnStart = vi.fn();
  const mockOnEnd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders list items correctly", () => {
    render(
      <SortableList
        autoScroll={mockAutoScroll}
        onSortUpdate={mockOnSortUpdate}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      >
        <SortableListItem index={0}>Item 1</SortableListItem>
        <SortableListItem index={1}>Item 2</SortableListItem>
      </SortableList>
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("handles drag start correctly", () => {
    render(
      <SortableList
        autoScroll={mockAutoScroll}
        onSortUpdate={mockOnSortUpdate}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      >
        <SortableListItem index={0}>Item 1</SortableListItem>
        <SortableListItem index={1}>Item 2</SortableListItem>
      </SortableList>
    );

    const item1 = screen.getByText("Item 1");
    fireEvent.mouseDown(item1);

    expect(mockOnStart).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        sourceIndex: 0,
        edgeIndex: 0,
      })
    );
  });

  it("respects cancel selector", () => {
    render(
      <SortableList
        autoScroll={mockAutoScroll}
        cancel=".no-drag"
        onSortUpdate={mockOnSortUpdate}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      >
        <SortableListItem index={0}>
          <div className="no-drag">No Drag</div>
        </SortableListItem>
      </SortableList>
    );

    const noDragElement = screen.getByText("No Drag");
    fireEvent.mouseDown(noDragElement);

    expect(mockOnStart).not.toHaveBeenCalled();
  });

  it("handles drag movement and updates", () => {
    const { container } = render(
      <SortableList
        autoScroll={mockAutoScroll}
        onSortUpdate={mockOnSortUpdate}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      >
        <SortableListItem index={0}>Item 1</SortableListItem>
        <SortableListItem index={1}>Item 2</SortableListItem>
      </SortableList>
    );

    const item1 = screen.getByText("Item 1");

    // Start drag
    fireEvent.mouseDown(item1);

    // Move drag
    fireEvent.mouseMove(document, {
      clientY: 100,
      bubbles: true,
    });

    expect(mockOnSortUpdate).toHaveBeenCalled();
  });

  it("handles drag end correctly", () => {
    render(
      <SortableList
        autoScroll={mockAutoScroll}
        onSortUpdate={mockOnSortUpdate}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      >
        <SortableListItem index={0}>Item 1</SortableListItem>
        <SortableListItem index={1}>Item 2</SortableListItem>
      </SortableList>
    );

    const item1 = screen.getByText("Item 1");

    // Complete drag sequence
    fireEvent.mouseDown(item1);
    fireEvent.mouseMove(document, { clientY: 100 });
    fireEvent.mouseUp(document);

    expect(mockOnEnd).toHaveBeenCalled();
  });
});
