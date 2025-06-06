import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { SortableList, SortableListItem } from "../widgets/SortableList";

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
    
    // Mock element getBoundingClientRect for position calculations
    Element.prototype.getBoundingClientRect = vi.fn().mockImplementation(function() {
      const dataIndex = this.getAttribute('data-index');
      return {
        top: dataIndex === '0' ? 0 : 50,
        height: 50,
        left: 0,
        right: 100,
        bottom: dataIndex === '0' ? 50 : 100,
        width: 100,
      };
    });
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

    const item = screen.getByText("Item 1").closest('[data-index]');
    expect(item).not.toBeNull();

    // Test drag sequence
    fireEvent.mouseDown(item!);
    
    expect(mockOnStart).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ 
        sourceIndex: 0,
        edgeIndex: 0
      })
    );
    
    // Move to a position that would be item 2 (between items 1 and 2)
    const moveY = 45; // Just below midpoint of first item
    fireEvent.mouseMove(document, { clientY: moveY });
    
    expect(mockOnSortUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ 
        sourceIndex: 0,
        edgeIndex: 1 
      })
    );

    // Complete the drag at the same position
    fireEvent.mouseUp(document, { clientY: moveY });
    
    expect(mockOnEnd).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ 
        sourceIndex: 0,
        edgeIndex: 1,
        destIndex: 1
      })
    );
  });
  
  it("respects cancel prop when clicking on cancel elements", () => {
    render(
      <SortableList
        autoScroll={mockAutoScroll}
        cancel=".cancel-element"
        onSortUpdate={mockOnSortUpdate}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      >
        <SortableListItem index={0}>
          <span>Item 1</span>
          <span className="cancel-element">Cancel</span>
        </SortableListItem>
      </SortableList>
    );

    const cancelElement = screen.getByText("Cancel");
    fireEvent.mouseDown(cancelElement);
    
    expect(mockOnStart).not.toHaveBeenCalled();
  });
  
  it("handles dragging past end of list", () => {
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

    const item = screen.getByText("Item 1").closest('[data-index]');
    
    // Start dragging
    fireEvent.mouseDown(item!);
    
    // Drag past the bottom of the list
    fireEvent.mouseMove(document, { clientY: 150 });
    
    expect(mockOnSortUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ 
        sourceIndex: 0,
        edgeIndex: 2  // Beyond the end of the list
      })
    );
  });
});
