import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import PaneResize from "../PaneResize";

describe("PaneResize", () => {
  it("renders without crashing", () => {
    const mockOnPaneResize = vi.fn();
    const testPanes = [
      {
        key: "test-pane",
        children: <div>Test Content</div>,
      },
    ];

    render(<PaneResize panes={testPanes} onPaneResize={mockOnPaneResize} />);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
