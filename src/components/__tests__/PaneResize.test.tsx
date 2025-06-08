import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import PaneResize from "../PaneResize";

describe("PaneResize", () => {
  it("renders without crashing", () => {
    const mockOnResize = vi.fn();
    const testPanes = [
      {
        key: "test-pane",
        children: <div>Test Content</div>,
      },
    ];

    render(<PaneResize panes={testPanes} onResize={mockOnResize} />);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
