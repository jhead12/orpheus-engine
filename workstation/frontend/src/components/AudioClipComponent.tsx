import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useWorkstation } from "../contexts/WorkstationContext";
import { TimelinePosition, TrackType, WaveformLODLevel, Clip, Track } from "../services/types/types";
import Waveform from "../../OEW-main/src/screens/workstation/components/Waveform";
import { audioBufferToBuffer, audioContext, reverseAudio } from "../services/utils/audio";
import { AudioExportPluginManager } from "../services/plugins/PluginManager";
import { ExportPluginOptions } from "../services/plugins/types";

export const WAVEFORM_CHUNK_SIZE = 2048;

// Define WaveformLevelsOfDetail interface locally
interface WaveformLevelsOfDetail {
  ultraLow: Float32Array[];
  low: Float32Array[];
  medium: Float32Array[];
  high: Float32Array[];
}

// Define AudioClipComponentProps interface
interface AudioClipComponentProps {
  clip: Clip;
  height: number;
  onChangeLane: (clip: Clip, track: Track) => void;
  onSetClip: (clip: Clip) => void;
  track: Track;
}

interface AudioClipWaveformProps {
  copyFrom?: { canvas: HTMLCanvasElement };
  data?: Float32Array[] | null;
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

function AudioClipComponent({ clip, height, onChangeLane, onSetClip, track }: AudioClipComponentProps) {
  const { timelineSettings } = useWorkstation();

  const [copyFrom, setCopyFrom] = useState<{ canvas: HTMLCanvasElement }>();
  const [spriteOffset, setSpriteOffset] = useState(0);
  const [waveformLevelsOfDetail, setWaveformLevelsOfDetail] = useState<WaveformLevelsOfDetail | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [pluginManager] = useState(() => new AudioExportPluginManager());

  const audioRef = useRef<HTMLAudioElement>(null);
  const clipAudio = clip.audio!;
  const audioWidth = clipAudio.end.diffInMargin(clipAudio.start);

  const url = useMemo(() => {
    if (clipAudio.buffer) {
      return URL.createObjectURL(new Blob([clipAudio.buffer], { type: clipAudio.type }));
    }
    return '';
  }, [clipAudio.buffer, clipAudio.type]);

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
    // Initialize export plugins on component mount
    pluginManager.loadPlugins().catch(console.error);
  }, []);

  useEffect(() => {
    if (audioRef.current && clipAudio.sourceDuration) {
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
    if (!clipAudio.audioBuffer && clipAudio.buffer) {
      let arrayBuffer: ArrayBuffer;
      
      if (clipAudio.buffer instanceof ArrayBuffer) {
        arrayBuffer = clipAudio.buffer;
      } else if (clipAudio.buffer instanceof Uint8Array) {
        const buffer = clipAudio.buffer.buffer;
        arrayBuffer = buffer instanceof ArrayBuffer 
          ? buffer.slice(clipAudio.buffer.byteOffset, clipAudio.buffer.byteOffset + clipAudio.buffer.byteLength)
          : new ArrayBuffer(0);
      } else {
        console.error('Unsupported buffer type');
        return;
      }

      try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        onSetClip({ ...clip, audio: { ...clipAudio, audioBuffer } });
      } catch (error) {
        console.error('Failed to decode audio data:', error);
      }
    } else if (clipAudio.audioBuffer) {
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

  // Export functionality
  const handleExportToLocal = async () => {
    if (!clipAudio.audioBuffer) return;
    
    setIsExporting(true);
    try {
      const result = await pluginManager.export(clip, {
        storage: { provider: 'local' },
        audioFormat: 'wav',
        quality: 'high',
        metadata: {
          title: `Clip_${clip.id}`,
          artist: 'Orpheus Engine',
          album: track.name
        }
      });
      console.log('Local export completed:', result);
      alert(`Export successful! File saved locally.`);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error}`);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportToCloud = async () => {
    if (!clipAudio.audioBuffer) return;
    
    setIsExporting(true);
    try {
      const result = await pluginManager.export(clip, {
        storage: { 
          provider: 'aws-s3',
          bucket: 'orpheus-audio-exports',
          path: 'clips'
        },
        audioFormat: 'wav',
        quality: 'high',
        metadata: {
          title: `Clip_${clip.id}`,
          artist: 'Orpheus Engine',
          album: track.name
        }
      });
      console.log('Cloud export completed:', result);
      alert(`Export successful! File uploaded to cloud: ${result.url}`);
    } catch (error) {
      console.error('Cloud export failed:', error);
      alert(`Cloud export failed: ${error}`);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportToIPFS = async () => {
    if (!clipAudio.audioBuffer) return;
    
    setIsExporting(true);
    try {
      const result = await pluginManager.export(clip, {
        storage: { provider: 'ipfs' },
        audioFormat: 'wav',
        quality: 'high',
        metadata: {
          title: `Clip_${clip.id}`,
          artist: 'Orpheus Engine',
          album: track.name
        }
      });
      console.log('IPFS export completed:', result);
      alert(`Export successful! IPFS Hash: ${result.ipfsHash}`);
    } catch (error) {
      console.error('IPFS export failed:', error);
      alert(`IPFS export failed: ${error}`);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportWithStoryProtocol = async () => {
    if (!clipAudio.audioBuffer) return;
    
    setIsExporting(true);
    try {
      const result = await pluginManager.export(clip, {
        storage: { provider: 'ipfs' },
        blockchain: {
          storyProtocol: {
            enabled: true,
            registerIP: true,
            licenseTerms: 'CC BY-SA 4.0',
            metadata: {
              title: `Audio Clip ${clip.id}`,
              creator: 'Orpheus Engine User',
              license: 'Creative Commons Attribution-ShareAlike 4.0'
            }
          }
        },
        audioFormat: 'wav',
        quality: 'lossless',
        metadata: {
          title: `Clip_${clip.id}`,
          artist: 'Orpheus Engine',
          album: track.name
        }
      });
      console.log('Story Protocol export completed:', result);
      alert(`Export successful! IP registered on Story Protocol. ID: ${result.storyProtocolId}`);
    } catch (error) {
      console.error('Story Protocol export failed:', error);
      alert(`Story Protocol export failed: ${error}`);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const waveformProps = (height: number, isCopy: boolean) => ({ 
    copyFrom: isCopy ? copyFrom : undefined,
    data: waveformData, 
    height, 
    offscreenDrawing: isCopy ? false : audioWidth < WAVEFORM_CHUNK_SIZE,
    offset: spriteOffset, 
    onDraw: isCopy ? undefined : handleDraw,
    width: audioWidth
  });
  
  // Simple wrapper component that implements the expected interface
  const SimpleClipComponent = ({ 
    automationSprite, 
    clip, 
    height, 
    onChangeLane, 
    onResize, 
    onSetClip, 
    sprite, 
    track 
  }: {
    automationSprite?: (height: number) => React.ReactNode;
    clip: Clip;
    height: number;
    onChangeLane: (clip: Clip, track: Track) => void;
    onResize: (data: { edge: { x: string }, coords: { startX: number } }) => void;
    onSetClip: (clip: Clip) => void;
    sprite?: (height: number) => React.ReactNode;
    track: Track;
  }) => {
    return (
      <div 
        style={{ 
          height, 
          position: 'relative', 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}
        onDoubleClick={() => setShowExportMenu(!showExportMenu)}
      >
        {sprite && sprite(height)}
        {automationSprite && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5 }}>
            {automationSprite(height)}
          </div>
        )}
        
        {/* Export Menu */}
        {showExportMenu && (
          <div 
            style={{
              position: 'absolute',
              top: height + 5,
              left: 0,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1000,
              minWidth: '200px'
            }}
          >
            <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '12px' }}>
              Export Audio Clip
            </div>
            
            <button 
              onClick={handleExportToLocal}
              disabled={isExporting || !clipAudio.audioBuffer}
              style={{
                display: 'block',
                width: '100%',
                margin: '4px 0',
                padding: '6px 12px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                background: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              📁 Export Locally
            </button>
            
            <button 
              onClick={handleExportToCloud}
              disabled={isExporting || !clipAudio.audioBuffer}
              style={{
                display: 'block',
                width: '100%',
                margin: '4px 0',
                padding: '6px 12px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                background: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              ☁️ Export to Cloud
            </button>
            
            <button 
              onClick={handleExportToIPFS}
              disabled={isExporting || !clipAudio.audioBuffer}
              style={{
                display: 'block',
                width: '100%',
                margin: '4px 0',
                padding: '6px 12px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                background: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              🌐 Export to IPFS
            </button>
            
            <button 
              onClick={handleExportWithStoryProtocol}
              disabled={isExporting || !clipAudio.audioBuffer}
              style={{
                display: 'block',
                width: '100%',
                margin: '4px 0',
                padding: '6px 12px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                background: '#f5f5f5',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              🔗 Register IP (Story Protocol)
            </button>
            
            <button 
              onClick={() => setShowExportMenu(false)}
              style={{
                display: 'block',
                width: '100%',
                margin: '8px 0 4px 0',
                padding: '6px 12px',
                border: '1px solid #999',
                borderRadius: '3px',
                background: '#e0e0e0',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Cancel
            </button>
            
            {isExporting && (
              <div style={{ 
                textAlign: 'center', 
                fontSize: '11px', 
                color: '#666',
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                Exporting...
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <SimpleClipComponent
        automationSprite={(height: number) => <AudioClipWaveform {...waveformProps(height, true)} />}
        clip={clip}
        height={height}
        onChangeLane={onChangeLane}
        onResize={onResize}
        onSetClip={onSetClip}
        sprite={(height: number) => <AudioClipWaveform {...waveformProps(height, false)} />}
        track={track}
      />
      <audio ref={audioRef} src={url} />
    </>
  );
}

export default memo(AudioClipComponent);
