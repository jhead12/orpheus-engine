import React, { memo, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Check, FiberManualRecord } from "@mui/icons-material";
import { DialogContent, IconButton } from "@mui/material";
import { WorkstationContext } from "../../../contexts/WorkstationContext";
import { MixerContext } from "../../../contexts/MixerContext";
import {
  AutomationLaneEnvelope,
  AutomationMode,
  ContextMenuType,
  Track,
  AutomatableParameter,
} from "../../../types/core";
import { FXComponent, TrackVolumeSlider } from "./index";
import { Dialog, HueInput, SelectSpinBox, Knob, Meter, SortableList, SortableListItem } from "../../../components/widgets";
import { openContextMenu } from "../editor-utils";
import { 
  formatPanning, 
  getVolumeGradient, 
  hslToHex, 
  volumeToNormalized 
} from "../../../services/utils/utils";
import { SortData } from "../editor-utils";
import TrackIcon from "../../../components/icons/TrackIcon";

// Simple hueFromHex function replacement
const hueFromHex = (hex: string): number => {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return 0;

  let hue = 0;
  if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }

  return Math.round(hue * 60);
};

const MixerTrack = memo(
  ({ order, track }: { order?: number; track: Track }) => {
    const {
      deleteTrack,
      duplicateTrack,
      getTrackCurrentValue,
      masterTrack,
      playheadPos,
      selectedTrackId,
      setSelectedTrackId,
      setTrack,
      timelineSettings,
    } = useContext(WorkstationContext)!;

    const mixerContext = useContext(MixerContext);

    const [hue, setHue] = useState(hueFromHex(track.color || "#808080"));
    const [name, setName] = useState(track.name);
    const [showChangeHueDialog, setShowChangeHueDialog] = useState(false);

    const pan = useMemo(() => {
      const lane = track.automationLanes?.find(
        (lane) => lane.envelope === AutomationLaneEnvelope.Pan
      );
      return getTrackCurrentValue(track, lane);
    }, [track, getTrackCurrentValue]);

    useEffect(() => setName(track.name), [track.name]);

    // Keyboard shortcuts handler
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (!mixerContext) return;
      
      const key = e.key.toLowerCase();
      switch (key) {
        case 'm':
          e.preventDefault();
          mixerContext.setTrackMute(track.id, !track.mute);
          break;
        case 's':
          e.preventDefault();
          mixerContext.setTrackSolo(track.id, !track.solo);
          break;
        case 'r':
          e.preventDefault();
          mixerContext.setTrackArmed(track.id, !track.armed);
          break;
        default:
          break;
      }
    }, [mixerContext, track.id, track.mute, track.solo, track.armed]);

    // Handle volume control+click reset
    const handleVolumeClick = useCallback((e: React.MouseEvent) => {
      if (e.ctrlKey && mixerContext) {
        e.preventDefault();
        mixerContext.setTrackVolume(track.id, 0.8); // Default volume
      }
    }, [mixerContext, track.id]);

    function changeTrackColor(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setTrack({ ...track, color: hslToHex(hue, 80, 70) });
      setShowChangeHueDialog(false);
    }

    function handleContextMenu() {
      if (!isMaster && document.activeElement?.nodeName !== "INPUT") {
        openContextMenu(ContextMenuType.Track, { track }, () => {
          //
        });
      }
    }

    // Ensure track volume and pan are properly formatted as AutomatableParameter
    const ensureAutomatableParameter = (value: number | AutomatableParameter): AutomatableParameter => {
      if (typeof value === 'number') {
        return { value, isAutomated: false };
      }
      return value || { value: 0, isAutomated: false };
    };

    const isMaster = masterTrack ? track.id === masterTrack.id : false;
    const selected = selectedTrackId === track.id;
    const mutedByMaster = masterTrack?.mute && !isMaster;

    const muteButtonTitle = mutedByMaster
      ? "Master is muted"
      : `${track.mute ? "Unmute" : "Mute"}${selected ? " [M]" : ""}`;

    const style = {
      fx: {
        add: { button: { marginTop: 1, marginRight: -1 } },
        preset: {
          height: 17,
        },
        top: {
          backgroundColor: "#0000",
        },
        effect: {
          actionsContainer: { border: "none", padding: 0, marginLeft: 2 },
          container: { paddingTop: 1 },
        },
        select: {
          optionsList: {
            maxHeight: 100,
          },
        },
      },
      automationModeSpinBox: {
        icon: { color: "var(--border6)", fontSize: 12 },
        next: { icon: { fontSize: 20 } },
        prev: { icon: { fontSize: 20 } },
        spinButton: { width: 12 },
        text: { color: "var(--border6)", fontSize: 12, lineHeight: "unset" },
        top: { borderColor: "var(--border1)", height: 17, paddingRight: 2 },
      },
      select: {
        container: {
          height: 18,
        },
        select: { fontSize: 13, color: "var(--fg1)", paddingLeft: 4 },
        nextIcon: { fontSize: 20, color: "var(--fg1)" },
        option: { fontSize: 13 },
        optionsList: {
          maxHeight: 64,
        },
        prevIcon: { fontSize: 20, color: "var(--fg1)" },
      },
      volumeMeter: {
        width: 3,
      },
      panKnob: {
        knob: {
          backgroundColor: "#0000",
        },
        indicator: { backgroundColor: "var(--border6)" },
        meter: { color: "var(--border6)", sizeRatio: 1.1, width: 1.5 },
      },
      muteButton: {
        color: track.mute || masterTrack?.mute ? "#ff004c" : "var(--border6)",
      },
      armIcon: {
        fontSize: 14,
      },
      peakLevel: {
        lineHeight: 1,
      },
      masterText: {
        height: 37,
      },
      trackTextContainer: {
        border: "1px solid #0007",
      },
      nameText: {
        fontSize: 13,
      },
      orderTextContainer: { height: 18, borderTop: "1px solid #0007" },
      orderText: {
        fontSize: 12,
      },
    } as const;

    return (
      <div
        className={
          "col-auto mixer-track pr-2 pl-2 border-right border-dark-1" +
          (selected ? " overlay-1" : "")
        }
        data-testid={isMaster ? "mixer-master-channel" : `mixer-channel-${track.id}`}
        onContextMenu={handleContextMenu}
        onMouseDown={() => setSelectedTrackId(track.id)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{
          minWidth: 85,
          maxWidth: 85,
          overflow: "hidden",
          borderTop: "2px solid " + track.color,
        }}
      >
        <div className="col-12 m-0 p-0">
          <div
            data-testid={`mixer-effects-track-${track.id}`}
            style={{
              flex: 1,
              borderRight: "1px solid var(--border1)",
              position: "relative",
            }}
          >              <FXComponent
              classes={{
                next: { button: "focus-1" },
                presetButtons: "removed",
                presetNameFormButtons: "removed",
                preset: { container: "focus-1" },
                prev: { button: "focus-1" },
                top: "show-on-hover",
              }}
              track={track}
              style={style.fx}
              data-testid={`fx-component-${track.id}`}
              data-add-effect-testid={`mixer-add-effect-track-${track.id}`}
              data-effect-testid-prefix="effect"
            />
          </div>
          <div className="col-12 m-0 p-0">
            <SelectSpinBox
              onChange={(val: AutomationMode) =>
                setTrack({ ...track, automationMode: val })
              }
              options={[
                { label: "Read", value: AutomationMode.Read },
                { label: "Write", value: AutomationMode.Write },
                { label: "Touch", value: AutomationMode.Touch },
                { label: "Trim", value: AutomationMode.Trim },
                { label: "Latch", value: AutomationMode.Latch },
              ]}
              style={style.automationModeSpinBox}
              value={track.automationMode || AutomationMode.Read}
              data-testid="select-spinbox"
              title={`Automation Mode: ${track.automationMode || AutomationMode.Read}`}
            />
          </div>
          <div className="row mx-0 py-1 flex-grow-1">
            <div className="col-4 m-0 px-1">
              <div style={{ display: "flex" }}>
                <div style={{ marginRight: 1 }}>
                  <Meter
                    color={getVolumeGradient(ensureAutomatableParameter(track.volume).value)}
                    percent={volumeToNormalized(ensureAutomatableParameter(track.volume).value) * 100}
                    style={{ ...style.volumeMeter, marginRight: 2 }}
                    data-testid={`mixer-meter-track-${track.id}`}
                  />
                  <Meter
                    color={getVolumeGradient(ensureAutomatableParameter(track.volume).value)}
                    percent={volumeToNormalized(ensureAutomatableParameter(track.volume).value) * 100}
                    style={style.volumeMeter}
                    data-testid={`mixer-meter-track-${track.id}`}
                  />
                </div>
                <TrackVolumeSlider
                  track={track}
                  onClick={handleVolumeClick}
                  aria-label={`${track.name} volume`}
                  data-testid={isMaster ? "mixer-master-volume" : `mixer-volume-${track.id}`}
                />
              </div>
              <div 
                className="text-center mt-1"
                data-testid={isMaster ? "mixer-master-volume-display" : `mixer-volume-display-track-${track.id}`}
                style={{ fontSize: 10, color: "var(--border6)" }}
              >
                {Math.round(ensureAutomatableParameter(track.volume).value * 100)}%
              </div>
            </div>
            <div className="col-8 pl-0 pr-1">
              <div className="col-12 m-0 p-0">
                <div className="row m-0">
                  <div className="col-8 m-0 p-0">
                    <div style={{ textAlign: "center" }}>
                      <TrackIcon color="var(--border6)" type={track.type} />
                    </div>
                  </div>
                  <div className="col-4 m-0 p-0">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span
                        style={{ fontSize: 12, color: "var(--border6)" }}
                        data-testid={`mixer-pan-display-track-${track.id}`}
                      >
                        {formatPanning(pan.value ?? 0, true)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 m-0 p-0">
                <div className="row m-0">
                  <div className="col-8 m-0 p-0">
                    <Knob
                      disabled={pan.isAutomated}
                      onDoubleClick={() =>
                        setTrack({ ...track, pan: { value: 0, isAutomated: false } })
                      }
                      onChange={(value: number) =>
                        setTrack({ ...track, pan: { value, isAutomated: false } })
                      }
                      style={style.panKnob}
                      title={`Pan: ${formatPanning(pan.value ?? 0)}${
                        pan.isAutomated ? " (automated)" : ""
                      }`}
                      value={pan.value ?? 0}
                      valueDisplay={(value: number) =>
                        formatPanning(value, true)
                      }
                      aria-label={`${track.name} pan`}
                      data-testid={`mixer-pan-${track.id}`}
                    />
                  </div>
                  <div className="col-4 p-0 ml-0 mr-0">
                    <div title={muteButtonTitle}>
                      <IconButton
                        className={
                          mutedByMaster ? "pe-none" : "pe-auto hover-4"
                        }
                        onClick={() => {
                          if (mixerContext) {
                            mixerContext.setTrackMute(track.id, !track.mute);
                          } else {
                            setTrack({ ...track, mute: !track.mute });
                          }
                        }}
                        style={style.muteButton}
                        aria-label={`${track.mute ? 'Unmute' : 'Mute'} ${track.name}`}
                        data-testid={isMaster ? "mixer-master-mute" : `mixer-mute-${track.id}`}
                      >
                        <span style={{ opacity: mutedByMaster ? 0.5 : 1 }}>
                          M
                        </span>
                      </IconButton>
                    </div>
                    {!isMaster && (
                      <div>
                        <IconButton
                          className="hover-4"
                          onClick={() => {
                            if (mixerContext) {
                              mixerContext.setTrackSolo(track.id, !track.solo);
                            } else {
                              setTrack({ ...track, solo: !track.solo });
                            }
                          }}
                          style={{
                            color: track.solo ? "var(--fg2)" : "var(--border6)",
                          }}
                          title={"Toggle Solo" + (selected ? " [S]" : "")}
                          aria-label={`${track.solo ? 'Unsolo' : 'Solo'} ${track.name}`}
                          data-testid={`mixer-solo-${track.id}`}
                        >
                          S
                        </IconButton>
                        <IconButton
                          className="hover-4"
                          onClick={() => {
                            if (mixerContext) {
                              mixerContext.setTrackArmed(track.id, !track.armed);
                            } else {
                              setTrack({ ...track, armed: !track.armed });
                            }
                          }}
                          style={{
                            color: track.armed
                              ? "#ff004c"
                              : "var(--border6)",
                          }}
                          title={
                            (track.armed ? "Disarm" : "Arm") +
                            (selected ? " [Shift+A]" : "")
                          }
                          aria-label={`${track.armed ? 'Disarm' : 'Arm'} ${track.name}`}
                          data-testid={`mixer-arm-${track.id}`}
                        >
                          <FiberManualRecord style={style.armIcon} />
                        </IconButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={style.peakLevel} data-testid={`mixer-peak-track-${track.id}`}>
            {volumeToNormalized(track.volume || 0) > 0.95 && (
              <div style={{ color: "#ff004c", fontSize: 10 }}>PEAK</div>
            )}
          </div>
        </div>
        <div className="col-12 m-0 p-0">
          {isMaster ? (
            <div
              className="text-center py-2"
              style={style.masterText}
            >
              Master
            </div>
          ) : (
            <div className="col-12 m-0 p-0" style={style.trackTextContainer}>
              <div className="col-12 m-0 px-1 py-0">
                <input
                  className="form-control form-control-sm border-0 bg-transparent text-white"
                  maxLength={30}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTrack({ ...track, name })}
                  style={style.nameText}
                  title={name}
                  value={name}
                />
              </div>
              <div
                className="text-center"
                style={style.orderTextContainer}
              >
                <span className="m-0 py-0 px-2" style={style.orderText}>
                  {order}
                </span>
              </div>
            </div>
          )}
        </div>
        <Dialog
          onClose={() => setShowChangeHueDialog(false)}
          open={showChangeHueDialog}
          title={`Change Hue for ${track.name}`}
        >
          <DialogContent>
            <form onSubmit={changeTrackColor}>
              <HueInput onChange={(hue: number) => setHue(hue)} value={hue} />
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

function Mixer() {
  const { masterTrack, setAllowMenuAndShortcuts, setTracks, tracks } =
    useContext(WorkstationContext)!;

  useEffect(() => {
    setAllowMenuAndShortcuts(false);
    return () => setAllowMenuAndShortcuts(true);
  }, [setAllowMenuAndShortcuts]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentElement = document.activeElement as HTMLElement;
      const currentTestId = currentElement?.getAttribute('data-testid');
      
      if (currentTestId?.startsWith('mixer-channel-')) {
        const currentTrackId = currentTestId.replace('mixer-channel-', '');
        const currentIndex = tracks.findIndex(track => track.id === currentTrackId);
        
        if (currentIndex !== -1) {
          let nextIndex;
          if (e.key === 'ArrowRight') {
            nextIndex = currentIndex + 1 < tracks.length ? currentIndex + 1 : 0;
          } else {
            nextIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : tracks.length - 1;
          }
          
          const nextTrackId = tracks[nextIndex].id;
          const nextElement = document.querySelector(`[data-testid="mixer-channel-${nextTrackId}"]`) as HTMLElement;
          nextElement?.focus();
        }
      }
    }
  }, [tracks]);

  function onSortEnd(data: SortData) {
    if (data.edgeIndex !== undefined && data.edgeIndex > -1 && data.sourceIndex !== data.destIndex) {
      const destIndex =
        data.edgeIndex - (data.edgeIndex > data.sourceIndex ? 1 : 0);
      const newTracks = [...tracks];
      const [removed] = newTracks.splice(data.sourceIndex, 1);
      newTracks.splice(destIndex, 0, removed);
      setTracks(newTracks);
    }
  }

  return (
    <SortableList onSortEnd={onSortEnd} data-testid="sortable-list" onKeyDown={handleKeyDown}>
      <div className="row no-gutters">
        {tracks.map((track, idx) => (
          <SortableListItem key={track.id} index={idx} data-testid={`sortable-item-${idx}`} className="sortable-item">
            <MixerTrack order={idx + 1} track={track} />
          </SortableListItem>
        ))}
        {masterTrack && (
          <div className="col-auto">
            <MixerTrack track={masterTrack} />
          </div>
        )}
      </div>
    </SortableList>
  );
}

// Export both default and named for tests
export default Mixer;
export { Mixer };
