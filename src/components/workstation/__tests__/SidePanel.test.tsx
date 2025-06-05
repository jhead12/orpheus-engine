import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { SidePanel } from "../../../screens/workstation/components/SidePanel";

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
});
