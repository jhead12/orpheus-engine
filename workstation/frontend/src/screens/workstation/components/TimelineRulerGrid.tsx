import { useContext, useLayoutEffect, useRef, useState } from "react";
import WorkstationContext from "../../../contexts/WorkstationContext";
import { TimelinePosition, SnapGridSizeOption } from "../../../services/types/types";
import { formatDuration, measureSeconds } from "../../../services/utils/general";
import { BASE_BEAT_WIDTH, GRID_MIN_INTERVAL_WIDTH } from "../../../services/utils/utils";

const TIME_MIN_INTERVAL_WIDTH = 68;
const POS_MIN_INTERVAL_WIDTH = 34;
const POS_MIN_SUBBEAT_INTERVAL_WIDTH = 68;

const unitIntervals = [
  { major: 1, minor: 0.5 },
  { major: 2, minor: 1 },
  { major: 4, minor: 2 },
  { major: 10, minor: 2 },
  { major: 15, minor: 5 },
  { major: 30, minor: 10 },
  { major: 60, minor: 15 }
];

const secondIntervals = [ 
  ...unitIntervals, 
  ...unitIntervals.map(unit => ({ major: unit.major * 60, minor: unit.minor * 60 })) 
];

export default function TimelineRulerGrid() {
  const workstation = useContext(WorkstationContext);
  
  // Fallback values for missing context properties
  const darkMode = false; // TODO: Get from preferences context when available
  const autoGridSize = true;
  const showTimeRuler = false;
  const snapGridSize = 1;
  const snapGridSizeOption = SnapGridSizeOption.Beat;
  const timelineSettings = workstation?.timelineSettings || {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    snap: true,
    snapUnit: 'beat',
    horizontalScale: 1
  };

  const [devicePixelRatio, setDevicePixelRatio] = useState(window.devicePixelRatio);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const gridRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLCanvasElement>(null);
  const windowRef = useRef<HTMLElement | null>(null);

  const { width, height } = windowSize;

  useLayoutEffect(() => {
    function handleWindowResize() {
      if (windowRef.current)
        setWindowSize({ width: windowRef.current.clientWidth, height: windowRef.current.clientHeight - 33 });
    }

    windowRef.current = document.getElementById("timeline-editor-window");
    if (!windowRef.current) {
      // Fallback if timeline-editor-window doesn't exist
      windowRef.current = document.querySelector(".timeline-container") || document.body;
    }

    const resizeObserver = new ResizeObserver(handleWindowResize);
    resizeObserver.observe(windowRef.current);

    return () => resizeObserver.disconnect();
  }, [])

  useLayoutEffect(() => {
    function handleDevicePixelRatioChange() {
      setDevicePixelRatio(window.devicePixelRatio);
    }

    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mediaQuery.addEventListener('change', handleDevicePixelRatioChange);

    return () => mediaQuery.removeEventListener('change', handleDevicePixelRatioChange);
  }, []);

  useLayoutEffect(() => {
    drawGrid();
    drawRuler();
  }, [devicePixelRatio, width, height, autoGridSize, snapGridSize, snapGridSizeOption, timelineSettings, darkMode]);

  function drawGrid() {
    const majorColor = window.getComputedStyle(document.body).getPropertyValue("--border7") || "#555";
    const minorColor = window.getComputedStyle(document.body).getPropertyValue("--border3") || "#333";

    const canvas = gridRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx && windowRef.current) {
      // High-DPI support
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { horizontalScale, timeSignature } = timelineSettings;
      const beatWidth = BASE_BEAT_WIDTH * horizontalScale * (4 / timeSignature.noteValue);

      let minorGridInterval, majorGridInterval, snapGridSizeInterval;

      if (snapGridSizeOption > SnapGridSizeOption.Auto) {
        snapGridSizeInterval = autoGridSize ? snapGridSize : {
          [SnapGridSizeOption.Beat]: 1,
          [SnapGridSizeOption.HalfBeat]: 0.5,
          [SnapGridSizeOption.QuarterBeat]: 0.25,
          [SnapGridSizeOption.EighthBeat]: 0.125,
          [SnapGridSizeOption.SixteenthBeat]: 0.0625,
          [SnapGridSizeOption.ThirtySecondBeat]: 0.03125,
          [SnapGridSizeOption.Bar]: timeSignature.beats,
          [SnapGridSizeOption.HalfBar]: timeSignature.beats / 2
        }[snapGridSizeOption];
      }

      if (autoGridSize) {
        minorGridInterval = 2 ** Math.ceil(Math.log2(GRID_MIN_INTERVAL_WIDTH / beatWidth));

        if (minorGridInterval <= 0.25 || minorGridInterval >= timeSignature.beats) {
          majorGridInterval = minorGridInterval * 4;
        } else {
          majorGridInterval = timeSignature.beats;
          let factor = 0;

          for (let i = 1; i <= timeSignature.beats; i++) {
            if (timeSignature.beats % i === 0 && i % minorGridInterval === 0 && i > minorGridInterval) {
              majorGridInterval = i;
              if (++factor === 2)
                break;
            }
          }
        }

        const intervalWidth = beatWidth * minorGridInterval;
        let interval = Math.floor((windowRef.current.scrollLeft || 0) / intervalWidth);

        while (true) {
          const x = interval * intervalWidth - (windowRef.current.scrollLeft || 0);
          
          if (x > (windowRef.current.clientWidth || width))
            break;
          
          const major = interval % (majorGridInterval / minorGridInterval) === 0;
          let draw = true;

          if (!major && intervalWidth < GRID_MIN_INTERVAL_WIDTH) {
            draw = false;
          } else if (snapGridSizeOption > SnapGridSizeOption.Auto && snapGridSizeInterval && snapGridSizeInterval > minorGridInterval) {
            if (interval % (snapGridSizeInterval / minorGridInterval) !== 0)
              draw = false;
          }

          if (draw) {
            ctx.strokeStyle = major ? majorColor : minorColor;
  
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height / devicePixelRatio);
            ctx.stroke();
          }

          interval++;
        }
      }
    }
  }
  
  function drawRuler() {
    const textColor1 = window.getComputedStyle(document.body).getPropertyValue("--border7") || "#888";
    const textColor2 = window.getComputedStyle(document.body).getPropertyValue("--border6") || "#666";
    const intervalMarkColor = window.getComputedStyle(document.body).getPropertyValue("--border4") || "#444";

    const canvas = timelineRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx && windowRef.current) {
      // High-DPI support
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (showTimeRuler) {
        const secondWidth = TimelinePosition.fromSpan(TimelinePosition.durationToSpan(1)).toMargin();
        let majorSecondInterval = 2 ** Math.ceil(Math.log2(TIME_MIN_INTERVAL_WIDTH / secondWidth));
        let minorSecondInterval = 2 ** (Math.ceil(Math.log2(TIME_MIN_INTERVAL_WIDTH / secondWidth)) - 1);
        
        if (majorSecondInterval >= 1) {
          for (const interval of secondIntervals) {
            majorSecondInterval = interval.major;
            minorSecondInterval = interval.minor;

            if (majorSecondInterval * secondWidth >= TIME_MIN_INTERVAL_WIDTH)
              break;
          }
        }

        const intervalWidth = secondWidth * minorSecondInterval;
        let interval = Math.floor((windowRef.current.scrollLeft || 0) / intervalWidth);
        
        while (true) {
          const x = interval * intervalWidth - (windowRef.current.scrollLeft || 0);
          
          if (x > (windowRef.current.clientWidth || width))
            break;
          
          const major = interval % (majorSecondInterval / minorSecondInterval) === 0;
          const seconds = interval * minorSecondInterval;
          const isSecond = seconds % 1 === 0;

          ctx.strokeStyle = intervalMarkColor;
          ctx.fillStyle = isSecond ? textColor1 : textColor2;

          ctx.beginPath();
          ctx.moveTo(x, major && isSecond ? 0 : 17);
          ctx.lineTo(x, canvas.height / devicePixelRatio);
          ctx.stroke();

          if (major) {
            const text = formatDuration(measureSeconds(seconds));
            ctx.font = `${isSecond ? 12 : 10.5}px Abel, Roboto, sans-serif`;
            ctx.fillText(text, isSecond ? x + 3 : x - 1, isSecond ? 14.5 : 15);
          }

          interval++;
        }
      } else {
        const { horizontalScale, timeSignature } = timelineSettings;
        const beatWidth = BASE_BEAT_WIDTH * horizontalScale * (4 / timeSignature.noteValue);
        const measureWidth = beatWidth * timeSignature.beats;

        let majorBeatInterval, minorBeatInterval;

        if (measureWidth < POS_MIN_INTERVAL_WIDTH) {
          const measures = 2 ** Math.ceil(Math.log2(POS_MIN_INTERVAL_WIDTH / measureWidth));
          majorBeatInterval = measures * timeSignature.beats;
          minorBeatInterval = (measures / 2) * timeSignature.beats;
        } else if (beatWidth < POS_MIN_SUBBEAT_INTERVAL_WIDTH) {
          majorBeatInterval = timeSignature.beats;
          minorBeatInterval = 2 ** Math.ceil(Math.log2(POS_MIN_INTERVAL_WIDTH / beatWidth));

          if (Math.log2(timeSignature.beats) % 1 !== 0) {
            for (let i = 1; i < timeSignature.beats; i++) {
              if (timeSignature.beats % i === 0) {
                minorBeatInterval = i;
                if (beatWidth * minorBeatInterval >= POS_MIN_INTERVAL_WIDTH)
                  break;
              }
            }
          }
        } else {
          majorBeatInterval = 2 ** Math.ceil(Math.log2(POS_MIN_SUBBEAT_INTERVAL_WIDTH / beatWidth));
          minorBeatInterval = 2 ** (Math.ceil(Math.log2(POS_MIN_SUBBEAT_INTERVAL_WIDTH / beatWidth)) - 1);
        }

        const intervalWidth = beatWidth * minorBeatInterval;
        let interval = Math.floor((windowRef.current.scrollLeft || 0) / intervalWidth);
        
        while (true) {
          const x = interval * intervalWidth - (windowRef.current.scrollLeft || 0);
          
          if (x > (windowRef.current.clientWidth || width))
            break;
          
          const major = interval % (majorBeatInterval / minorBeatInterval) === 0;
          const beats = interval * minorBeatInterval;
          const isMeasure = beats % timeSignature.beats === 0;
          const isBeat = beats % 1 == 0;

          ctx.strokeStyle = intervalMarkColor;
          ctx.fillStyle = isMeasure ? textColor1 : textColor2;

          if (major || intervalWidth > 3) {
            let y = 17;

            if (major) {
              if (isMeasure) {
                y = 0;
              } else if (isBeat) {
                y = 10;
              }
            }

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, canvas.height / devicePixelRatio);
            ctx.stroke();
          }

          if (major) {
            let text = "";
            let fontSize = 12;
            let yOffset = 14.5;

            if (isMeasure) {
              text = Math.floor(beats / timeSignature.beats + 1).toString();
            } else if (isBeat) {
              text = (beats % timeSignature.beats + 1).toString();
              fontSize = 10.5;
              yOffset = 12;
            } else {
              const beatNum = Math.floor(beats % timeSignature.beats) + 1;
              const fraction = beats % 1;
              if (fraction === 0.5) text = `${beatNum}.5`;
              else if (fraction === 0.25) text = `${beatNum}.25`;
              else if (fraction === 0.75) text = `${beatNum}.75`;
              fontSize = 9;
              yOffset = 11;
            }

            if (text) {
              ctx.font = `${fontSize}px Abel, Roboto, sans-serif`;
              ctx.fillText(text, x + (isMeasure ? 3 : 1), yOffset);
            }
          }

          interval++;
        }
      }
    }
  }

  return (
    <>
      <canvas 
        ref={gridRef} 
        className="timeline-grid"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1
        }}
      />
      <canvas 
        ref={timelineRef} 
        className="timeline-ruler" 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "33px",
          pointerEvents: "none",
          zIndex: 2
        }}
      />
    </>
  );
}