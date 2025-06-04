import React, { useContext, useEffect, useRef, useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { MusicNote as MetronomeIcon, ArrowDropDown } from "@mui/icons-material";

// Create simple metronome sounds using Web Audio API
const createMetronomeSound = (frequency: number, isAccented: boolean = false) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  return () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(isAccented ? 0.3 : 0.15, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };
};

// Define different metronome sound options
const METRONOME_SOUNDS = {
  default: {
    normal: createMetronomeSound(800, false),
    accented: createMetronomeSound(1200, true),
  },
  wood: {
    normal: createMetronomeSound(400, false),
    accented: createMetronomeSound(600, true),
  },
};

export function triggerMetronomeTick(
  isAccentuated: boolean,
  soundType = "default"
) {
  const sounds = METRONOME_SOUNDS[soundType as keyof typeof METRONOME_SOUNDS] || METRONOME_SOUNDS.default;
  if (isAccentuated) {
    sounds.accented();
  } else {
    sounds.normal();
  }
}

interface MetronomeProps {
  isPlaying?: boolean;
  metronome?: boolean;
  setMetronome?: (enabled: boolean) => void;
  timelineSettings?: {
    timeSignature: {
      beats: number;
      noteValue: number;
    };
    tempo: number;
  };
}

export default function Metronome({
  isPlaying = false,
  metronome = false,
  setMetronome,
  timelineSettings = {
    timeSignature: { beats: 4, noteValue: 4 },
    tempo: 120
  }
}: MetronomeProps) {
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
  }, [timelineSettings.timeSignature, timelineSettings.tempo, metronome, isPlaying]);

  function playTick(delay: number) {
    timeout.current = setTimeout(() => {
      if (tickCount.current++ % timelineSettings.timeSignature.beats === 0) {
        triggerMetronomeTick(true, soundType);
      } else {
        triggerMetronomeTick(false, soundType);
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
        className={`p-0 mx-1`}
        onClick={() => setMetronome?.(!metronome)}
        style={{
          backgroundColor: metronome ? "var(--color1)" : "transparent",
          width: 24,
          height: 24,
          border: `1px solid ${metronome ? "var(--color1)" : "var(--border1)"}`,
          borderRadius: 4,
        }}
        title="Toggle Metronome [T]"
      >
        <MetronomeIcon
          fontSize="small"
          sx={{ color: metronome ? "white" : "var(--border6)" }}
        />
      </IconButton>

      {metronome && (
        <>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            title="Change Metronome Sound"
            style={{ marginLeft: 4 }}
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
            <MenuItem
              onClick={() => handleSoundChange("wood")}
              selected={soundType === "wood"}
            >
              Wood Block
            </MenuItem>
          </Menu>
        </>
      )}
    </div>
  );
}
