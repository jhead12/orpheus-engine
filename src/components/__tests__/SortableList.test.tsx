import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { SortableList, SortableListItem } from "../SortableList";

describe("SortableList Component", () => {
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

  it("renders basic list items", () => {
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

  it("calls sort callbacks with correct indices", () => {
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

    const item = screen.getByText("Item 1");

    // Test drag sequence
    fireEvent.mouseDown(item);
    fireEvent.mouseMove(document, { clientY: 150 });
    fireEvent.mouseUp(document);

    // Verify callback sequence
    expect(mockOnStart).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ sourceIndex: 0 })
    );
    expect(mockOnEnd).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ sourceIndex: 0 })
    );
  });
});
