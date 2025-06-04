import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Add, Remove } from "@mui/icons-material";
import { IconButton, Slider } from "@mui/material";
import { clamp, inverseLerp, lerp } from "../services/utils/general";

interface ZoomControlsProps {
  onZoom?: (vertical: boolean) => void;
  vertical?: boolean;
  timelineSettings?: any;
  updateTimelineSettings?: (settings: any) => void;
  verticalScale?: number;
  setVerticalScale?: (scale: number) => void;
}

// HoldActionButton component for zoom controls
interface HoldActionButtonProps {
  interval: number;
  onHoldAction: () => void;
  style?: React.CSSProperties;
  title?: string;
  children: React.ReactNode;
}

function HoldActionButton({ interval, onHoldAction, style, title, children }: HoldActionButtonProps) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

  const handleMouseDown = () => {
    onHoldAction(); // Execute immediately
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(onHoldAction, interval);
    }, 500); // Start repeating after 500ms
  };

  const handleMouseUp = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <IconButton
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={style}
      title={title}
      size="small"
    >
      {children}
    </IconButton>
  );
}

export default function ZoomControls({ 
  onZoom, 
  vertical,
  timelineSettings,
  updateTimelineSettings,
  verticalScale,
  setVerticalScale
}: ZoomControlsProps) {
  const [value, setValue] = useState(vertical ? (verticalScale || 1) : (timelineSettings?.horizontalScale || 1));
  const [zoomValueChanged, setZoomValueChanged] = useState(false);

  const timeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const newValue = vertical ? (verticalScale || 1) : (timelineSettings?.horizontalScale || 1);

    if (value !== newValue) {
      clearTimeout(timeout.current);

      setValue(newValue);
      setZoomValueChanged(true);
      
      timeout.current = setTimeout(() => setZoomValueChanged(false), 1000);
    }
  }, [timelineSettings?.horizontalScale, verticalScale, vertical]);

  function horizontalScaleToSliderPos(horizontalScale: number) {
    return 0.128144 * Math.log(90.9244 * horizontalScale + 0.946923) - 0.0792586;
  }

  function handleChange(_: Event, value: number | number[]) {
    if (vertical)
      setValue(+lerp((value as number) / 1000, 0.75, 5).toFixed(2));
    else
      setValue(+sliderPosToHorizontalScale((value as number) / 1000).toFixed(2));
  }

  function handleChangeCommitted() {
    onZoom?.(Boolean(vertical));

    if (vertical && setVerticalScale) {
      setVerticalScale(value);
    } else if (!vertical && updateTimelineSettings && timelineSettings) {
      updateTimelineSettings({ ...timelineSettings, horizontalScale: value });
    }
  }

  function sliderPosToHorizontalScale(sliderPos: number) {
    return (Math.exp((sliderPos + 0.0792586) / 0.128144) - 0.946923) / 90.9244;
  }

  function zoom(amount: number) {
    onZoom?.(Boolean(vertical));

    if (vertical && setVerticalScale && verticalScale) {
      setVerticalScale(clamp(+(verticalScale + amount).toPrecision(4), 0.75, 5));
    } else if (!vertical && updateTimelineSettings && timelineSettings) {
      const horizontalScale = clamp(timelineSettings.horizontalScale + amount, 0.01, 50);
      updateTimelineSettings({ ...timelineSettings, horizontalScale });
    }
  }

  const sliderValue = useMemo(() => {
    if (vertical)
      return inverseLerp(value, 0.75, 5) * 1000;
    else
      return horizontalScaleToSliderPos(value) * 1000;
  }, [vertical, value]);

  const increment = vertical ? 0.25 : 0.1 * value;

  const styles = {
    container: {
      backgroundColor: "var(--bg1)",
      flexDirection: vertical ? "column-reverse" : "row",
      borderWidth: vertical ? "1px 0 0" : "0 1px",
      border: "1px solid var(--border1)",
      borderRadius: 4,
      overflow: "hidden"
    },
    zoomButton: {
      padding: 0,
      border: "1px solid var(--border1)", 
      borderWidth: vertical ? "1px 0" : "0 1px", 
      borderRadius: 0,
      minWidth: vertical ? "auto" : 24,
      minHeight: vertical ? 24 : "auto"
    },
    slider: {
      width: vertical ? 11 : 52, 
      height: vertical ? 48 : 11,
      margin: vertical ? "8px 0" : "0 8px",
    }
  } as const;

  return (
    <div className="d-flex align-items-center overflow-hidden" style={styles.container}>
      <HoldActionButton
        interval={175} 
        onHoldAction={() => zoom(-increment)}
        style={styles.zoomButton}
        title={`Zoom Out ${vertical ? "Vertically" : "Horizontally"}`}
      >
        <Remove style={{fontSize: 15, color: "var(--border6)"}} />
      </HoldActionButton>
      
      <Slider
        className="p-0"
        max={1000}
        min={0}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        orientation={vertical ? "vertical" : "horizontal"}
        slotProps={{
          thumb: { 
            style: { 
              backgroundColor: "var(--border6)", 
              width: 8, 
              height: 8,
              boxShadow: "none"
            } 
          },
          rail: { style: { visibility: "hidden" } },
          track: { style: { visibility: "hidden" } }
        }}
        step={vertical ? 1000 / 17 : 1}
        style={styles.slider}
        value={sliderValue}
        valueLabelDisplay={zoomValueChanged ? "on" : "auto"}
        valueLabelFormat={`${+(value).toFixed(2)}x`}
      />
      
      <HoldActionButton
        interval={175} 
        onHoldAction={() => zoom(increment)}
        style={styles.zoomButton}
        title={`Zoom In ${vertical ? "Vertically" : "Horizontally"}`}
      >
        <Add style={{fontSize: 15, color: "var(--border6)"}} />
      </HoldActionButton>
    </div>
  );
}
