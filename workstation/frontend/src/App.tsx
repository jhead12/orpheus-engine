import React, { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { ClipboardProvider } from "./contexts/ClipboardContext";
import WorkstationProvider from "./contexts/WorkstationProvider";
import { MixerProvider } from "./contexts/MixerContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { DAWProvider } from "./contexts/DAWContext";
import Workstation from "./screens/workstation/Workstation";
import Preferences from "./components/Preferences";
import SettingsProvider from "./components/settings/SettingsManager";
import { ApolloWrapper } from "./apollo/ApolloWrapper";
import { isElectron } from './utils/electron';
import "./styles/App.css";

interface AppProps {
  onReady?: () => void;
}

function App({ onReady }: AppProps = {}): ReactElement {
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

  return (
    <ApolloWrapper>
      <SettingsProvider>
        <PreferencesProvider>
          <MixerProvider>
            <DAWProvider>
              <WorkstationProvider>
                <ClipboardProvider>
                  <div className={`app-container ${isDesktopMode ? 'electron-workstation' : 'web-workstation'}`}>
                    <Workstation isDesktopMode={isDesktopMode} />
                  </div>
                </ClipboardProvider>
                <Preferences />
              </WorkstationProvider>
            </DAWProvider>
          </MixerProvider>
        </PreferencesProvider>
      </SettingsProvider>
    </ApolloWrapper>
  );
}

export default App;
