import React, { useEffect } from "react";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { ClipboardProvider } from "./contexts/ClipboardContext";
import { WorkstationProvider } from "./contexts/WorkstationContext";
import { MixerProvider } from "./contexts/MixerContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import Workstation from "./components/Workstation";
import Preferences from "./components/Preferences";
import SettingsProvider from "./components/settings/SettingsManager";
import "./styles/App.css";
import "./styles/daw.css";

// Import DAW components
import { DAWProvider } from "./contexts/DAWContext";
import AudioAnalyzer from "./components/daw/AudioAnalyzer";
import Timeline from "./components/daw/Timeline";
import MixerControls from "./components/daw/MixerControls";
import TransportControls from "./components/daw/TransportControls";

function App(): React.ReactElement {
  useEffect(() => {
    // Initialize Electron integration
    if (window.electronAPI) {
      console.log('🚀 Orpheus Engine Workstation - Electron Mode');
      console.log('Platform:', window.orpheusAPI?.platform);
      console.log('Version:', window.electronAPI.getVersion?.());
    }

    // Workaround to the dumb electron bug where blurring inputs with selected text does not make
    // the Electron > Services submenu go back to showing only the 'Development' section
    function handleFocusOut(e: FocusEvent) {
      const relatedTarget = e.relatedTarget as HTMLElement;

      if (!relatedTarget || (relatedTarget.tagName !== "INPUT" && relatedTarget.tagName !== "TEXTAREA")) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          selection.collapseToEnd();
        }
      }
    }

    document.addEventListener("focusout", handleFocusOut, { capture: true });
    return () => document.removeEventListener("focusout", handleFocusOut, { capture: true });
  }, []);

  return (
    <SettingsProvider>
      <PreferencesProvider>
        <MixerProvider>
          <DAWProvider>
            <WorkstationProvider>
              <Router>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ClipboardProvider>
                        <div className="app-container electron-workstation">
                          <div className="daw-container">
                            <TransportControls />
                            <Timeline
                              width={window.innerWidth}
                              height={100}
                              position={{ bar: 0, beat: 0, fraction: 0 }}
                              zoom={1}
                              onPositionChange={(pos) => {
                                console.log("Position changed:", pos);
                              }}
                            />
                            <div className="main-content">
                              <Workstation />
                              <AudioAnalyzer width={300} height={200} visualizerType="frequency" />
                            </div>
                            <MixerControls />
                          </div>
                        </div>
                      </ClipboardProvider>
                    }
                  />
                </Routes>
                <Preferences />
              </Router>
            </WorkstationProvider>
          </DAWProvider>
        </MixerProvider>
      </PreferencesProvider>
    </SettingsProvider>
  );
}

export default App;
