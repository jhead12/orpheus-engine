import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { ClipboardProvider } from "./contexts/ClipboardContext";
import WorkstationProvider from "./contexts/WorkstationProvider"; // Moved from OEW-main
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
import { isElectron } from './utils/electron';

interface AppProps {
  onReady?: () => void;
}

function App({ onReady }: AppProps): React.ReactElement {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    // Workaround to the dumb electron bug where blurring inputs with selected text does not make
    // the Electron > Services submenu go back to showing only the 'Development' section
    function handleFocusOut(e: FocusEvent) {
      const relatedTarget = e.relatedTarget as HTMLElement;

      if (!relatedTarget || (relatedTarget.tagName !== "INPUT" && relatedTarget.tagName !== "TEXTAREA")) {
        const selection = window.getSelection();
        if (selection) selection.removeAllRanges();
      }
    }

    document.addEventListener("focusout", handleFocusOut);
    return () => document.removeEventListener("focusout", handleFocusOut);
  }, []);

  useEffect(() => {
    // Signal that the app is ready once mounted
    setIsLoaded(true);
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  // Check if we're running in desktop mode
  useEffect(() => {
    // Signal that the app is ready once mounted
    setIsLoaded(true);
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  // Check if we're running in desktop mode
  const isDesktopMode = isElectron();

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
