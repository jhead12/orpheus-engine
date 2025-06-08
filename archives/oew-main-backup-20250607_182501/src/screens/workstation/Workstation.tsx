import React, { useMemo, useEffect, useState } from "react"
import Editor from "./Editor"
import { Header, Mixer } from "./components"
import { PaneResize } from "../../components";
import { useWorkstation } from "../../contexts";
import { InputPane, PaneResizeData } from "../../components/PaneResize"

/**
 * Consolidated Workstation Component - Electron & Web Compatible
 * This is the main workstation interface that ties directly to Electron
 * Features: Plugin management, audio analysis, project management, real-time collaboration
 */
export default function Workstation() {
  const { 
    mixerHeight, 
    setAllowMenuAndShortcuts, 
    setMixerHeight, 
    showMixer,
    // Enhanced workstation features
    plugins = [],
    tracks = [],
    isPlaying = false,
    electronAPI,
    registerPlugin,
    audioService
  } = useWorkstation();

  const [workstationReady, setWorkstationReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Initializing...");

  // Initialize workstation and Electron integration
  useEffect(() => {
    console.log('🎵 Initializing Orpheus Engine Workstation');
    
    if (electronAPI?.isAvailable) {
      console.log('⚡ Running in Electron mode');
      console.log(`📱 Platform: ${window.orpheusAPI?.platform}`);
      
      // Get Electron version
      electronAPI.getVersion?.().then(version => {
        console.log(`🔧 Electron version: ${version}`);
      }).catch(err => console.warn('Could not get Electron version:', err));
      
      // Initialize Electron-specific plugins
      if (registerPlugin) {
        const electronAudioPlugin = {
          id: 'electron-audio-analysis',
          name: 'Electron Audio Analysis',
          version: '1.0.0',
          metadata: {
            id: 'electron-audio-analysis',
            name: 'Electron Audio Analysis',
            author: 'Orpheus Engine',
            description: 'Native audio analysis through Electron'
          }
        };
        registerPlugin(electronAudioPlugin);
      }
    } else {
      console.log('🌐 Running in web mode');
    }
    
    setWorkstationReady(true);
    setStatusMessage("Ready");
    
    // Set document title
    document.title = electronAPI?.isAvailable 
      ? 'Orpheus Engine Workstation - Electron' 
      : 'Orpheus Engine Workstation - Web';
      
    return () => {
      console.log('🔴 Workstation cleanup');
    };
  }, [electronAPI, registerPlugin]);

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
      className={`workstation-container m-0 p-0 ${electronAPI?.isAvailable ? 'electron-mode' : 'web-mode'}`}
      style={{ 
        width: "100vw", 
        height: "100vh", 
        position: "relative", 
        outline: "none",
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
      tabIndex={0}
    >
      <Header />
      <PaneResize
        direction="vertical"
        onPaneResize={() => setAllowMenuAndShortcuts(false)}
        onPaneResizeStop={handlePaneResizeStop}
        panes={panes}
        style={{ 
          flex: 1, 
          height: "calc(100vh - 69px)", 
          display: "flex", 
          flexDirection: "column" 
        }}
      />
      
      {/* Status bar with Electron and plugin info */}
      <div className="workstation-status-bar" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '24px',
        backgroundColor: '#2d2d2d',
        borderTop: '1px solid #444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontSize: '12px',
        color: '#999',
        zIndex: 1000
      }}>
        <div className="status-left" style={{ display: 'flex', gap: '16px' }}>
          <span>Tracks: {tracks.length}</span>
          <span>Status: {isPlaying ? '▶️ Playing' : '⏸️ Stopped'}</span>
          <span>Plugins: {plugins.length}</span>
        </div>
        
        <div className="status-center">
          <span>Orpheus Engine Workstation</span>
        </div>
        
        <div className="status-right" style={{ display: 'flex', gap: '16px' }}>
          {electronAPI?.isAvailable ? (
            <>
              <span>⚡ Electron</span>
              <span>🔌 Native Audio</span>
            </>
          ) : (
            <span>🌐 Web Audio</span>
          )}
        </div>
      </div>
    </div>
  )
}