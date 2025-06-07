import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { SidePanel } from "@orpheus/workstation/components/SidePanel";
import { expectScreenshot } from "@orpheus/test/helpers";

describe("SidePanel", () => {
  const mockAudioFiles = [
    { id: "1", name: "Test Audio 1", duration: 180 },
    { id: "2", name: "Test Audio 2", duration: 240 },
  ];

  it("renders in collapsed state by default", () => {
    render(<SidePanel audioFiles={mockAudioFiles} />);
    const panel = screen.getByTestId("side-panel");
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveStyle({ width: "50px" });
  });

  it("expands on hover", () => {
    render(<SidePanel audioFiles={mockAudioFiles} />);
    const panel = screen.getByTestId("side-panel");

    fireEvent.mouseEnter(panel);
    expect(panel).toHaveStyle({ width: "250px" });

    fireEvent.mouseLeave(panel);
    expect(panel).toHaveStyle({ width: "50px" });
  });

  it("displays audio files correctly", () => {
    render(<SidePanel audioFiles={mockAudioFiles} />);

    const audio1 = screen.getByText("Test Audio 1");
    const audio2 = screen.getByText("Test Audio 2");

    expect(audio1).toBeInTheDocument();
    expect(audio2).toBeInTheDocument();

    expect(screen.getByText("3:00")).toBeInTheDocument();
    expect(screen.getByText("4:00")).toBeInTheDocument();
  });

  it("calls onAudioSelect when clicking an audio item", () => {
    const mockOnAudioSelect = vi.fn();
    render(
      <SidePanel
        audioFiles={mockAudioFiles}
        onAudioSelect={mockOnAudioSelect}
      />
    );

    const audio1 = screen.getByTestId("audio-item-1");
    fireEvent.click(audio1);

    expect(mockOnAudioSelect).toHaveBeenCalledWith(mockAudioFiles[0]);
  });

  it("visual test: renders panel in expanded state @visual", async () => {
    const container = document.createElement("div");
    container.style.cssText = `
      width: 300px;
      height: 600px;
      position: relative;
      overflow: hidden;
      background: #1e1e1e;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    document.body.appendChild(container);

    // Ensure container is ready
    await new Promise((resolve) => setTimeout(resolve, 100));

    render(<SidePanel audioFiles={mockAudioFiles} />, { container });
    const panel = screen.getByTestId("side-panel");

    // Ensure initial render is complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Trigger expand
    fireEvent.mouseEnter(panel);

    // Wait for styled-components to apply styles and transitions to complete
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Take screenshot with the proper container
    await expectScreenshot(container, "sidepanel-expanded");

    document.body.removeChild(container);
  });

  it("visual test: renders panel in collapsed state @visual", async () => {
    // Create a dark theme container that matches the app's theme
    const container = document.createElement("div");
    container.style.cssText = `
      width: 300px;
      height: 600px;
      position: relative;
      overflow: hidden;
      background: #1e1e1e;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    document.body.appendChild(container);

    render(<SidePanel audioFiles={mockAudioFiles} />, { container });

    // Wait for initial render and styled-components to apply styles
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Take screenshot of collapsed state
    await expectScreenshot(container, "sidepanel-collapsed");

    document.body.removeChild(container);
  });
});
