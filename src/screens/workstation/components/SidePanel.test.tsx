import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { render } from "../../../test/test-utils";
import { SidePanel, AudioFile } from "./SidePanel";

describe("SidePanel component", () => {
  const mockAudioFiles: AudioFile[] = [
    { id: "1", name: "Test Audio 1", duration: 180 },
    { id: "2", name: "Test Audio 2", duration: 240 },
  ];

  it("renders in collapsed state by default", () => {
    render(<SidePanel audioFiles={mockAudioFiles} />);
    const panel = screen.getByTestId("side-panel");
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveStyle("width: 50px");
  });

  it("shows audio files when expanded", () => {
    render(<SidePanel audioFiles={mockAudioFiles} />);

    const panel = screen.getByTestId("side-panel");
    fireEvent.mouseEnter(panel);

    expect(screen.getByText("Test Audio 1")).toBeInTheDocument();
    expect(screen.getByText("3:00")).toBeInTheDocument();
    expect(screen.getByText("Test Audio 2")).toBeInTheDocument();
    expect(screen.getByText("4:00")).toBeInTheDocument();
  });

  it("calls onAudioSelect when an audio item is clicked", () => {
    const mockOnAudioSelect = vi.fn();
    render(
      <SidePanel
        audioFiles={mockAudioFiles}
        onAudioSelect={mockOnAudioSelect}
      />
    );

    const panel = screen.getByTestId("side-panel");
    fireEvent.mouseEnter(panel);

    fireEvent.click(screen.getByTestId("audio-item-1"));
    expect(mockOnAudioSelect).toHaveBeenCalledWith(mockAudioFiles[0]);
  });

  it("renders empty state when no audio files are provided", () => {
    render(<SidePanel audioFiles={[]} />);

    expect(screen.getByTestId("side-panel")).toBeInTheDocument();
    expect(screen.queryByTestId(/audio-item/)).not.toBeInTheDocument();
  });
});
