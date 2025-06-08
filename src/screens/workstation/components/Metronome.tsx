import React, { useContext, useEffect, useRef, useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { WorkstationContext } from '@orpheus/contexts';
import { MusicNote as MetronomeIcon, ArrowDropDown } from "@mui/icons-material";
import metronomeTick from "../../../assets/audio/metronome-tick.wav";
import metronomeTickAccentuated from "../../../assets/audio/metronome-tick-accentuated.wav";

// Define different metronome sound options
const METRONOME_SOUNDS = {
  default: {
    normal: metronomeTick,
    accented: metronomeTickAccentuated,
  },
  // Add more sound options as needed
};

// Create audio instances for each sound
const audioInstances = Object.entries(METRONOME_SOUNDS).reduce(
  (acc, [key, sounds]) => {
    acc[key] = {
      normal: new Audio(sounds.normal),
      accented: new Audio(sounds.accented),
    };
    return acc;
  },
  {} as Record<string, { normal: HTMLAudioElement; accented: HTMLAudioElement }>
);

export function triggerMetronomeTick(
  isAccentuated: boolean,
  soundType = "default"
) {
  const sounds = audioInstances[soundType] || audioInstances.default;
  if (isAccentuated) {
    sounds.accented.currentTime = 0;
    sounds.accented.play();
  } else {
    sounds.normal.currentTime = 0;
    sounds.normal.play();
  }
}

export default function Metronome() {
  const { isPlaying, metronome, setMetronome, timelineSettings } =
    useContext(WorkstationContext)!;

  const [soundType, setSoundType] = useState("default");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const playStartTime = useRef(-1);
  const speed = useRef(-1);
  const tickCount = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (metronome && isPlaying) {
      if (playStartTime.current === -1) {
        playStartTime.current = new Date().getTime();
        playTick(0);
      }
    } else if (playStartTime.current > -1) {
      stopTick();
      tickCount.current = 0;
      playStartTime.current = -1;
    }
  }, [metronome, isPlaying]);

  useEffect(() => {
    const { timeSignature, tempo } = timelineSettings;
    speed.current = (60 / tempo) * (4 / timeSignature.noteValue) * 1000;

    if (metronome && isPlaying) {
      stopTick();

      const elapsed = new Date().getTime() - playStartTime.current;
      const nextTickTime = Math.ceil(elapsed / speed.current) * speed.current;

      playTick(nextTickTime - elapsed);
    }
  }, [timelineSettings.timeSignature, timelineSettings.tempo]);

  function playTick(delay: number) {
    timeout.current = setTimeout(() => {
      if (tickCount.current++ % timelineSettings.timeSignature.beats === 0) {
        audioInstances[soundType].accented.currentTime = 0;
        audioInstances[soundType].accented.play();
      } else {
        audioInstances[soundType].normal.currentTime = 0;
        audioInstances[soundType].normal.play();
      }

      if (timeout.current !== null) playTick(speed.current);
    }, delay);
  }

  function stopTick() {
    if (timeout.current !== null) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSoundChange = (type: string) => {
    setSoundType(type);
    handleClose();
  };

  return (
    <div className="d-flex align-items-center">
      <IconButton
        className={`p-0 btn-1 mx-1 ${metronome ? "no-borders" : "hover-1"}`}
        onClick={() => setMetronome(!metronome)}
        style={{
          backgroundColor: metronome ? "var(--color1)" : "#0000",
          width: 24,
          height: 24,
        }}
        title="Toggle Metronome [T]"
      >
        <MetronomeIcon
          fontSize="small"
          sx={{ color: metronome ? "var(--bg6)" : "var(--border6)" }}
        />
      </IconButton>

      {metronome && (
        <>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            title="Change Metronome Sound"
          >
            <ArrowDropDown
              fontSize="small"
              sx={{ color: "var(--border6)" }}
            />
          </IconButton>

          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem
              onClick={() => handleSoundChange("default")}
              selected={soundType === "default"}
            >
              Default
            </MenuItem>
            {/* Add additional sound options here */}
          </Menu>
        </>
      )}
    </div>
  );
}
