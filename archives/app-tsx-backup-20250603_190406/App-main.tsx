import React, { useEffect, useState } from "react";
import { BrowserRouter, MemoryRouter, Routes, Route } from "react-router-dom";
import { ClipboardProvider } from "./contexts/ClipboardContext";
import WorkstationProvider from "./contexts/WorkstationProvider";
import { MixerProvider } from "./contexts/MixerContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { DAWProvider } from "./contexts/DAWContext";
import Workstation from "./components/Workstation";
import Preferences from "./components/Preferences";
import SettingsProvider from "./components/settings/SettingsManager";
import { ApolloWrapper } from "./apollo/ApolloWrapper";
import { AudioLibrary } from "./components/AudioLibrary";
import "./styles/App.css";

// Import DAW components
import AudioRecorderComponent from './components/daw/AudioRecorderComponent';
import AudioAnalyzer from './components/daw/AudioAnalyzer';
import Timeline from './components/daw/Timeline';
import MixerControls from './components/daw/MixerControls';
import Transport from './components/daw/Transport';
import { isElectron } from './utils/electron';
import { TimelinePosition } from './services/types/types';

interface AppProps {
  onReady?: () => void;
}

function App({ onReady }: AppProps): React.ReactElement {
  const [isLoaded, setIsLoaded] = useState(false);
  const isDesktopMode = isElectron();

  useEffect(() => {
    // Initialize Electron integration if available
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      console.log('🚀 Orpheus Engine Workstation - Electron Mode');
      console.log('Platform:', (window as any).orpheusAPI?.platform);
      
      // Try to get version safely
      const electronAPI = (window as any).electronAPI;
      if (electronAPI.getAppVersion) {
        electronAPI.getAppVersion().then((version: string) => {
          console.log('Version:', version);
        }).catch((err: any) => console.warn('Could not get version:', err));
      }
    }

    // Workaround for Electron bug with input focus and text selection
    function handleFocusOut(e: FocusEvent) {
      const relatedTarget = e.relatedTarget as HTMLElement;

      if (!relatedTarget || (relatedTarget.tagName !== "INPUT" && relatedTarget.tagName !== "TEXTAREA")) {
        const selection = window.getSelection();
        if (selection) {
          if (selection.rangeCount > 0) {
            selection.collapseToEnd();
          } else {
            selection.removeAllRanges();
          }
        }
      }
    }

    document.addEventListener("focusout", handleFocusOut, { capture: true });
    return () => document.removeEventListener("focusout", handleFocusOut, { capture: true });
  }, []);

  useEffect(() => {
    // Signal that the app is ready once mounted
    setIsLoaded(true);
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  // Electron/Desktop Mode Render
  const renderElectronMode = () => (
    <MemoryRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ClipboardProvider>
              <div className="app-container electron-workstation">
                <div className="daw-container">
                  <Transport 
                    isPlaying={false}
                    isRecording={false}
                    position={new TimelinePosition(0, 0, 0)}
                    tempo={120}
                    onTempoChange={(tempo) => console.log("Tempo changed:", tempo)}
                  />
                  <Timeline
                    width={window.innerWidth}
                    height={100}
                    position={new TimelinePosition(0, 0, 0)}
                    zoom={1}
                    onPositionChange={(pos) => {
                      console.log("Position changed:", pos);
                    }}
                  />
                  <div className="main-content">
                    <Workstation isDesktopMode={true} />
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
    </MemoryRouter>
  );

  // Web Mode Render
  const renderWebMode = () => (
    <BrowserRouter>
      <ClipboardProvider>
        <div className="app-container">
          <header className="app-header">
            <h1>Orpheus Engine Workstation</h1>
          </header>
          <main className="app-main">
            <div className="welcome-message">
              <h2>Digital Audio Workstation</h2>
              <p>Welcome to Orpheus Engine! Your audio production hub is {isLoaded ? "ready" : "loading..."}</p>
            </div>

            <section className="main-controls">
              <AudioRecorderComponent />
            </section>
            
            <section className="workstation-container">
              <Workstation />
            </section>
            
            {/* Audio Library Section */}
            <section className="audio-library-container">
              <h2>Audio Library</h2>
              <AudioLibrary />
            </section>
          </main>
          <footer className="app-footer">
            <p>Orpheus Engine v1.0.9</p>
          </footer>
        </div>
      </ClipboardProvider>
    </BrowserRouter>
  );

  return (
    <ApolloWrapper>
      <PreferencesProvider>
        <MixerProvider>
          <DAWProvider>
            {isDesktopMode ? (
              <section className="workstation-container">
                <Workstation isDesktopMode={true} />
              </section>
            ) : (
              <ClipboardProvider>
                <WorkstationProvider>
                  <SettingsProvider>
                    <div className="app-container">
                      <header className="app-header">
                        <h1>Orpheus Engine Workstation</h1>
                      </header>
                      <main className="app-main">
                        <div className="welcome-message">
                          <h2>Digital Audio Workstation</h2>
                          <p>Welcome to Orpheus Engine! Your audio production hub is {isLoaded ? "ready" : "loading..."}</p>
                        </div>

                        <section className="main-controls">
                          <AudioRecorderComponent />
                        </section>
                        
                        <section className="workstation-container">
                          <Workstation />
                        </section>
                        
                        {/* Audio Library Section */}
                        <section className="audio-library-container">
                          <h2>Audio Library</h2>
                          <AudioLibrary />
                        </section>
                      </main>
                      <footer className="app-footer">
                        <p>Orpheus Engine v1.0.9</p>
                      </footer>
                    </div>
                  </SettingsProvider>
                </WorkstationProvider>
              </ClipboardProvider>
            )}
          </DAWProvider>
        </MixerProvider>
      </PreferencesProvider>
    </ApolloWrapper>
  );
}

export default App;
