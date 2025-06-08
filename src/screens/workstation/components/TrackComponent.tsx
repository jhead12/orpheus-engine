//This test suite contains visual tests for the TrackComponent component.

import React, { useContext, useState, useRef } from "react";
import {
  ContextMenuType,
  AutomationMode,
  TrackType,
  Track as CoreTrack,
} from "../../../types/core";
import type { AutomationLane, Effect } from "../../../types/core";
import { WorkstationContext } from '@orpheus/contexts';
import { DialogContent } from "@mui/material";
import { Dialog, HueInput } from '@orpheus/widgets';
import { hueFromHex, hslToHex } from '@orpheus/utils/general';
import { openContextMenu } from "../../../services/electron/utils";
import AutomationLaneTrack from "./AutomationLaneTrack";

interface Track {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  mute: boolean;
  solo: boolean;
  armed: boolean;
  volume: number;
  pan: number;
  automation: boolean;
  automationMode: AutomationMode;
  automationLanes: AutomationLane[];
  effects: Effect[];
  clips: unknown[];
  fx: {
    effects: Effect[];
    selectedEffectIndex: number;
    preset: unknown | null;
  };
}

interface ExtendedWorkstationContextType {
  deleteTrack: (track: Track) => void;
  duplicateTrack: (track: Track) => void;
  setTrack: (track: Track) => void;
  masterTrack: Track;
}

// Props interface for the component
interface IProps {
  className?: string;
  track: Track;
  style?: React.CSSProperties;
}

function TrackComponent({ className, track, style }: IProps) {
  const context = useContext(
    WorkstationContext
  ) as unknown as ExtendedWorkstationContextType;

  const { deleteTrack, duplicateTrack, setTrack, masterTrack } = context;

  const [hue, setHue] = useState(hueFromHex(track.color || "#808080"));
  const [showChangeHueDialog, setShowChangeHueDialog] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const onContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    openContextMenu(
      ContextMenuType.Track,
      { trackId: track.id },
      (params: Record<string, unknown>) => {
        const action = params.action as number;
        switch (action) {
          case 0:
            duplicateTrack(track);
            break;
          case 1:
            deleteTrack(track);
            break;
          case 2:
            setShowChangeHueDialog(true);
            break;
          case 3:
            setHue(hueFromHex(track.color || "#808080"));
            break;
        }
      }
    );
  };

  const onHueChange = (value: number) => {
    setHue(value);
    const color = hslToHex(value, 50, 50);
    setTrack({ ...track, color });
  };

  const handleMuteClick = () => {
    const updates = { mute: !track.mute };
    setTrack({ ...track, ...updates });
  };

  const handleSoloClick = () => {
    const updates = { solo: !track.solo };
    setTrack({ ...track, ...updates });
  };

  return (
    <div
      ref={ref}
      className={`track ${className || ""}`}
      style={{
        ...style,
        borderColor:
          track.mute || masterTrack?.mute ? "#ff0000" : "var(--border6)",
        border: track.mute || masterTrack?.mute ? "1px solid #ff0000" : "none",
        background: track.color || "var(--bg5)", // Use track color as background
        padding: "4px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
      onContextMenu={onContextMenu}
    >
      <div
        className="track-header"
        style={{ display: "flex", alignItems: "center", gap: "4px" }}
      >
        {/* Track controls - buttons on left side per 2022 design */}
        <div
          className="track-controls"
          style={{ display: "flex", alignItems: "center", gap: "2px" }}
        >
          <button
            data-testid="mute-button"
            className={`track-btn ${track.mute ? "active" : ""}`}
            onClick={handleMuteClick}
            style={{
              background: track.mute ? "#ff0000" : "transparent", // Brighter red color for muted state
              color: track.mute ? "#ffffff" : "var(--fg1)",
              fontWeight: track.mute ? "bold" : "normal",
            }}
          >
            M
          </button>
          <button
            data-testid="solo-button"
            className={`track-btn ${track.solo ? "active" : ""}`}
            onClick={handleSoloClick}
            style={{
              background: track.solo ? "#ffcc00" : "transparent",
              color: track.solo ? "#000" : "var(--fg1)",
            }}
          >
            S
          </button>
          <button
            data-testid="automation-mode-button"
            className={`track-btn ${track.automation ? "active" : ""}`}
            onClick={() =>
              setTrack({ ...track, automation: !track.automation })
            }
            style={{
              background: track.automation ? "#00cc00" : "transparent",
              color: track.automation ? "#fff" : "var(--fg1)",
            }}
          >
            OFF
          </button>
        </div>

        {/* Track name */}
        <input
          type="text"
          value={track.name}
          onChange={(e) => setTrack({ ...track, name: e.target.value })}
          onBlur={(e) => {
            if (e.target.value !== track.name) {
              setTrack({ ...track, name: e.target.value.trim() });
            }
          }}
          className="track-name"
          style={{
            background: "var(--bg7)",
            border: "1px solid var(--border4)",
            color: "var(--fg1)",
            padding: "2px 4px",
            flex: 1,
          }}
        />
      </div>

      {/* Automation lanes */}
      {track.automationLanes.map((lane: AutomationLane) => (
        <AutomationLaneTrack
          key={lane.id}
          lane={lane}
          track={track as CoreTrack}
          color={track.color}
        />
      ))}

      {/* Color picker dialog */}
      <Dialog
        open={showChangeHueDialog}
        onClose={() => setShowChangeHueDialog(false)}
      >
        <DialogContent>
          <HueInput value={hue} onChange={onHueChange} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TrackComponent;
