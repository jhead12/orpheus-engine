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
describe("SortableList handleMouseUp", () => {
  it("should call onEnd with correct indices when drag completes", () => {
    render(
      <SortableList
        autoScroll={mockAutoScroll}
        onSortUpdate={mockOnSortUpdate}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      >
        <SortableListItem index={0}>Item 1</SortableListItem>
        <SortableListItem index={1}>Item 2</SortableListItem>
        <SortableListItem index={2}>Item 3</SortableListItem>
      </SortableList>
    );

    const item = screen.getByText("Item 1").closest('[data-index]');
    
    // Start drag
    fireEvent.mouseDown(item!);
    
    // Move to position between item 2 and 3
    fireEvent.mouseMove(document, { clientY: 75 });
    
    // Complete drag
    fireEvent.mouseUp(document, { clientY: 75 });
    
    expect(mockOnEnd).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        sourceIndex: 0,
        edgeIndex: 2,
        destIndex: 2
      })
    );
  });

  it("should handle mouse up when dragging to end of list", () => {
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
    
    // Start drag
    fireEvent.mouseDown(item!);
    
    // Drag past the end (y position beyond all items)
    fireEvent.mouseUp(document, { clientY: 200 });
    
    expect(mockOnEnd).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        sourceIndex: 0,
        edgeIndex: 2, // Should be length of items array
        destIndex: 2
      })
    );
  });

  it("should handle mouse up at beginning of list", () => {
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

    const item = screen.getByText("Item 2").closest('[data-index]');
    
    // Start drag from second item
    fireEvent.mouseDown(item!);
    
    // Drag to beginning (y position before first item)
    fireEvent.mouseUp(document, { clientY: -10 });
    
    expect(mockOnEnd).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        sourceIndex: 1,
        edgeIndex: 0,
        destIndex: 0
      })
    );
  });

  it("should reset drag state after mouse up", () => {
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
    
    // Start drag
    fireEvent.mouseDown(item!);
    
    // Complete drag
    fireEvent.mouseUp(document, { clientY: 50 });
    
    // Try to move mouse after drag completed - should not trigger onSortUpdate
    vi.clearAllMocks();
    fireEvent.mouseMove(document, { clientY: 100 });
    
    expect(mockOnSortUpdate).not.toHaveBeenCalled();
  });

  it("should not call onEnd if no drag was in progress", () => {
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

    // Mouse up without starting drag
    fireEvent.mouseUp(document, { clientY: 50 });
    
    expect(mockOnEnd).not.toHaveBeenCalled();
  });

  it("should handle mouse up when dragItemRef is null", () => {
    render(
      <SortableList
        autoScroll={mockAutoScroll}
        onSortUpdate={mockOnSortUpdate}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      >
        <SortableListItem index={0}>Item 1</SortableListItem>
      </SortableList>
    );

    // Simulate mouse up without valid drag item
    fireEvent.mouseUp(document, { clientY: 50 });
    
    expect(mockOnEnd).not.toHaveBeenCalled();
  });

  it("should calculate correct destination index based on mouse position", () => {
    // Mock getBoundingClientRect to return specific positions
    Element.prototype.getBoundingClientRect = vi.fn().mockImplementation(function() {
      const dataIndex = this.getAttribute('data-index');
      const indexNum = parseInt(dataIndex || '0');
      return {
        top: indexNum * 60, // Each item is 60px tall
        height: 60,
        left: 0,
        right: 100,
        bottom: (indexNum + 1) * 60,
        width: 100,
      };
    });

    render(
      <SortableList
        autoScroll={mockAutoScroll}
        onSortUpdate={mockOnSortUpdate}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      >
        <SortableListItem index={0}>Item 1</SortableListItem>
        <SortableListItem index={1}>Item 2</SortableListItem>
        <SortableListItem index={2}>Item 3</SortableListItem>
      </SortableList>
    );

    const item = screen.getByText("Item 1").closest('[data-index]');
    
    // Start drag
    fireEvent.mouseDown(item!);
    
    // Mouse up at y=90 (middle of second item, index 1)
    fireEvent.mouseUp(document, { clientY: 90 });
    
    expect(mockOnEnd).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        sourceIndex: 0,
        edgeIndex: 2, // Should place after item at index 1
        destIndex: 2
      })
    );
  });

  it("should handle edge case where mouse up occurs on item midpoint", () => {
    Element.prototype.getBoundingClientRect = vi.fn().mockImplementation(function() {
      const dataIndex = this.getAttribute('data-index');
      const indexNum = parseInt(dataIndex || '0');
      return {
        top: indexNum * 50,
        height: 50,
        left: 0,
        right: 100,
        bottom: (indexNum + 1) * 50,
        width: 100,
      };
    });

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

    const item = screen.getByText("Item 2").closest('[data-index]');
    
    // Start drag from second item
    fireEvent.mouseDown(item!);
    
    // Mouse up exactly at midpoint of first item (y=25)
    fireEvent.mouseUp(document, { clientY: 25 });
    
    expect(mockOnEnd).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        sourceIndex: 1,
        edgeIndex: 1, // Should place after the midpoint
        destIndex: 1
      })
    );
  });

  it("should handle mouse up with invalid source index gracefully", () => {
    render(
      <SortableList
        autoScroll={mockAutoScroll}
        onSortUpdate={mockOnSortUpdate}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      >
        <SortableListItem index={0}>Item 1</SortableListItem>
      </SortableList>
    );

    const item = screen.getByText("Item 1").closest('[data-index]');
    
    // Remove data-index to simulate invalid state
    item?.removeAttribute('data-index');
    
    fireEvent.mouseDown(item!);
    fireEvent.mouseUp(document, { clientY: 50 });
    
    expect(mockOnEnd).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        sourceIndex: -1, // Invalid index
        edgeIndex: expect.any(Number),
        destIndex: expect.any(Number)
      })
    );
  });

  it("should pass correct event object to onEnd callback", () => {
    render(
      <SortableList
        autoScroll={mockAutoScroll}
        onSortUpdate={mockOnSortUpdate}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      >
        <SortableListItem index={0}>Item 1</SortableListItem>
      </SortableList>
    );

    const item = screen.getByText("Item 1").closest('[data-index]');
    
    fireEvent.mouseDown(item!);
    fireEvent.mouseUp(document, { clientY: 50 });
    
    expect(mockOnEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'mouseup',
        clientY: 50
      }),
      expect.any(Object)
    );
  });
});

describe("SortableList drag state management", () => {
  it("should properly clean up drag state on component unmount", () => {
    const { unmount } = render(
      <SortableList
        autoScroll={mockAutoScroll}
        onSortUpdate={mockOnSortUpdate}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      >
        <SortableListItem index={0}>Item 1</SortableListItem>
      </SortableList>
    );

    const item = screen.getByText("Item 1").closest('[data-index]');
    
    // Start drag
    fireEvent.mouseDown(item!);
    
    // Unmount component while drag is in progress
    unmount();
    
    // Mouse up should not cause errors
    expect(() => {
      fireEvent.mouseUp(document, { clientY: 50 });
    }).not.toThrow();
  });

  it("should handle multiple rapid mouse up events", () => {
    render(
      <SortableList
        autoScroll={mockAutoScroll}
        onSortUpdate={mockOnSortUpdate}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      >
        <SortableListItem index={0}>Item 1</SortableListItem>
      </SortableList>
    );

    const item = screen.getByText("Item 1").closest('[data-index]');
    
    fireEvent.mouseDown(item!);
    
    // Multiple rapid mouse up events
    fireEvent.mouseUp(document, { clientY: 50 });
    fireEvent.mouseUp(document, { clientY: 60 });
    fireEvent.mouseUp(document, { clientY: 70 });
    
    // onEnd should only be called once
    expect(mockOnEnd).toHaveBeenCalledTimes(1);
  });

  it("should handle mouse up after successful drag sequence", () => {
    render(
      <SortableList
        autoScroll={mockAutoScroll}
        onSortUpdate={mockOnSortUpdate}
        onStart={mockOnStart}
        onEnd={mockOnEnd}
      >
        <SortableListItem index={0}>Item 1</SortableListItem>
        <SortableListItem index={1}>Item 2</SortableListItem>
        <SortableListItem index={2}>Item 3</SortableListItem>
      </SortableList>
    );

    const item = screen.getByText("Item 1").closest('[data-index]');
    
    // Complete drag sequence
    fireEvent.mouseDown(item!);
    expect(mockOnStart).toHaveBeenCalledTimes(1);
    
    fireEvent.mouseMove(document, { clientY: 75 });
    expect(mockOnSortUpdate).toHaveBeenCalled();
    
    fireEvent.mouseUp(document, { clientY: 75 });
    expect(mockOnEnd).toHaveBeenCalledTimes(1);
    
    // Verify the complete sort data
    expect(mockOnEnd).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        sourceIndex: 0,
        edgeIndex: expect.any(Number),
        destIndex: expect.any(Number)
      })
    );
  });
});
