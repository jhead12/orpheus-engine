import { memo, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useWorkstation } from "../contexts/WorkstationContext";
import { BaseClipComponentProps, TimelinePosition, TrackType, WaveformLODLevel } from "../services/types/types";
import { ClipComponent, Waveform } from ".";
import { audioBufferToBuffer, audioContext, reverseAudio } from "../services/utils/audio";
import type { WaveformLevelsOfDetail } from '../../shared/types/audio';

export const WAVEFORM_CHUNK_SIZE = 2048;

interface AudioClipWaveformProps {
  copyFrom?: { canvas: HTMLCanvasElement };
  data?: Float32Array[];
  height: number;
  offset: number;
  width: number;
  onDraw?: (canvas: HTMLCanvasElement | null) => void;
  offscreenDrawing?: boolean;
}

function AudioClipWaveform({ copyFrom, data, height, offset, width, onDraw, offscreenDrawing }: AudioClipWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    if (copyFrom && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(copyFrom.canvas, 0, 0, width, height);
      }
    }
  }, [copyFrom, width, height]);

  const handleDraw = (canvas: HTMLCanvasElement | null) => {
    if (onDraw) onDraw(canvas);
  };

  return (
    <div className="position-relative d-flex pe-none flex-column overflow-hidden" style={{ height }}>
      {copyFrom ? (
        <canvas 
          height={height} 
          ref={canvasRef} 
          style={{ position: "absolute", top: 0, left: offset, opacity: 0.5 }} 
          width={width} 
        />
      ) : (
        data && <Waveform 
          data={data} 
          height={height} 
          offset={offset} 
          width={width} 
          offscreenDrawing={offscreenDrawing}
          onDraw={handleDraw}
        />
      )}
      {data && (
        <div style={{ width: "100%", flex: 1, display: "flex" }}>
          <div style={{ width: "100%", borderBottom: "1px solid #0002", margin: "auto" }} />
        </div>
      )}
    </div>
  );
}

function AudioClipComponent({ clip, height, onChangeLane, onSetClip, track }: BaseClipComponentProps) {
  const { timelineSettings } = useContext(WorkstationContext)!;

  const [copyFrom, setCopyFrom] = useState<{ canvas: HTMLCanvasElement }>();
  const [spriteOffset, setSpriteOffset] = useState(0);
  const [waveformLevelsOfDetail, setWaveformLevelsOfDetail] = useState<WaveformLevelsOfDetail | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const clipAudio = clip.audio!;
  const audioWidth = clipAudio.end.diffInMargin(clipAudio.start);

  const url = useMemo(() => (
    URL.createObjectURL(new Blob([clipAudio.buffer], { type: clipAudio.type }))
  ), [clipAudio.buffer]);

  useEffect(() => {
    if (audioWidth > WAVEFORM_CHUNK_SIZE) {
      setCopyFrom(undefined);
    }
  }, [audioWidth]);

  const waveformData = useMemo(() => {
    if (waveformLevelsOfDetail) {
      const samplesPerPixel = waveformLevelsOfDetail.high[0].length / audioWidth;

      if (samplesPerPixel > 250) return waveformLevelsOfDetail.ultraLow;
      if (samplesPerPixel > 100) return waveformLevelsOfDetail.low;
      if (samplesPerPixel > 20) return waveformLevelsOfDetail.medium;
      return waveformLevelsOfDetail.high;
    }
    return null;
  }, [audioWidth, waveformLevelsOfDetail]);

  useEffect(() => {
    loadAudioData();
  }, [clipAudio.audioBuffer]);

  useEffect(() => {
    updateSpriteOffset(clip.start);
  }, [timelineSettings, clip.start]);

  useEffect(() => {
    if (audioRef.current) {
      const duration = TimelinePosition.fromSpan(clipAudio.end.diff(clipAudio.start)).toSeconds();
      let playbackRate = clipAudio.sourceDuration / duration;

      if (playbackRate > 16) playbackRate = 16;
      if (playbackRate < 0.0625) playbackRate = 0.0625;

      audioRef.current.playbackRate = playbackRate;
    }
  }, [clipAudio, timelineSettings]);

  function downsampleWaveformData(audioBuffer: AudioBuffer, targetLength: number) {
    const newWaveformData: Float32Array[] = [];

    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      const data = audioBuffer.getChannelData(i);
      const samplesPerPixel = Math.ceil(data.length / targetLength);
      const channelData = new Float32Array(targetLength * 2);

      for (let j = 0; j < targetLength; j++) {
        let min = 0, max = 0;

        for (let k = 0; k < samplesPerPixel; k++) {
          if (j * samplesPerPixel + k < data.length) {
            const datum = data[j * samplesPerPixel + k];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
          }
        }
        
        channelData[j * 2] = max;
        channelData[j * 2 + 1] = min;
      }

      newWaveformData.push(channelData);
    }

    return newWaveformData;
  }

  function handleDraw(canvas: HTMLCanvasElement | null) {
    if (canvas && audioWidth < WAVEFORM_CHUNK_SIZE) {
      setCopyFrom({ canvas });
    }
  }

  async function loadAudioData() {
    if (!clipAudio.audioBuffer) {
      const ab = new ArrayBuffer(clipAudio.buffer.length);
      const view = new Uint8Array(ab);
      
      for (let i = 0; i < clipAudio.buffer.length; i++) {
        view[i] = clipAudio.buffer[i];
      }

      try {
        const audioBuffer = await audioContext.decodeAudioData(ab);
        onSetClip({ ...clip, audio: { ...clipAudio, audioBuffer } });
      } catch (error) {
        console.error('Failed to decode audio data:', error);
      }
    } else {
      const data = clipAudio.audioBuffer.getChannelData(0);
      setWaveformLevelsOfDetail({
        ultraLow: downsampleWaveformData(clipAudio.audioBuffer, Math.floor(data.length / 25000)),
        low: downsampleWaveformData(clipAudio.audioBuffer, Math.floor(data.length / 12500)),
        medium: downsampleWaveformData(clipAudio.audioBuffer, Math.floor(data.length / 2500)),
        high: downsampleWaveformData(clipAudio.audioBuffer, Math.floor(data.length / 200))
      });
    }
  }

  function onResize(data: { edge: { x: string }, coords: { startX: number } }) {
    if (data.edge.x === "left") {
      updateSpriteOffset(TimelinePosition.fromMargin(data.coords.startX));
    }
  }

  function updateSpriteOffset(pos: TimelinePosition) {
    setSpriteOffset(-pos.diffInMargin(clipAudio.start));
  }

  const waveformProps = (height: number, isCopy: boolean) => ({ 
    copyFrom: isCopy ? copyFrom : undefined,
    data: waveformData, 
    height, 
    offscreenDrawing: isCopy ? false : audioWidth < WAVEFORM_CHUNK_SIZE,
    offset: spriteOffset, 
    onDraw: isCopy ? undefined : handleDraw,
    width: audioWidth
  });
  
  return (
    <>
      <ClipComponent
        automationSprite={height => <AudioClipWaveform {...waveformProps(height, true)} />}
        clip={clip}
        height={height}
        onChangeLane={onChangeLane}
        onResize={onResize}
        onSetClip={onSetClip}
        sprite={height => <AudioClipWaveform {...waveformProps(height, false)} />}
        track={track}
      />
      <audio ref={audioRef} src={url} />
    </>
  );
}

export default memo(AudioClipComponent);
