import React, { useMemo } from "react"
// Import local placeholder components instead
import Editor from "./placeholders/Editor"
import Header from "./placeholders/Header"
import Mixer from "./placeholders/Mixer"
import PaneResize, { InputPane, PaneResizeData } from "./PaneResize";
import { useWorkstation } from "../contexts/WorkstationProvider"

export default function Workstation() {
  // Use the custom hook instead of direct context usage
  const { mixerHeight, setAllowMenuAndShortcuts, setMixerHeight, showMixer } = useWorkstation();

  const panes = useMemo(() => {
    const panes: InputPane[] = [
      {
        key: "0",
        handle: { style: { height: 2, bottom: -2 } },
        children: <Editor />
      }
    ];

    if (showMixer)
      panes.push({
        key: "1", 
        max: 450, 
        min: 229, 
        children: <Mixer />, 
        fixed: true, 
        size: mixerHeight 
      });

    return panes;
  }, [showMixer, mixerHeight])

  function handlePaneResizeStop(data: PaneResizeData) {
    if (data.activeNext)
      setMixerHeight(data.activeNext.size);
    setAllowMenuAndShortcuts(true);
  }

  return (
    <div 
      className="m-0 p-0"
      style={{ width: "100vw", height: "100vh", position: "relative", outline: "none" }}
      tabIndex={0}
    >
      <Header />
      <PaneResize
        direction="vertical"
        onPaneResize={() => setAllowMenuAndShortcuts(false)}
        onPaneResizeStop={handlePaneResizeStop}
        panes={panes}
        style={{ flex: 1, height: "calc(100vh - 69px)", display: "flex", flexDirection: "column" }}
      />
    </div>
  )
}