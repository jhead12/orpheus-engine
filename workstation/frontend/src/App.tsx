import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { ClipboardProvider } from "./contexts/ClipboardContext";
import WorkstationProvider from "./contexts/WorkstationProvider";
import { MixerProvider } from "./contexts/MixerContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import Workstation from "./components/Workstation";
import Preferences from "./components/Preferences";
import SettingsProvider from "./components/settings/SettingsManager";
import "./styles/App.css";

// Import components once they're ready
// import AudioRecorderComponent from './components/daw/AudioRecorderComponent'

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

  return (
    <BrowserRouter>
      <PreferencesProvider>
        <ClipboardProvider>
          <WorkstationProvider>
            <MixerProvider>
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

                    {/* Uncomment when components are ready */}
                    {/* <section className="main-controls">
                      <AudioRecorderComponent />
                    </section> */}
                  </main>
                  <footer className="app-footer">
                    <p>Orpheus Engine v1.0.9</p>
                  </footer>
                </div>
              </SettingsProvider>
            </MixerProvider>
          </WorkstationProvider>
        </ClipboardProvider>
      </PreferencesProvider>
    </BrowserRouter>
  );
}

export default App;
