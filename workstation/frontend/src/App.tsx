import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ClipboardProvider } from "./contexts/ClipboardContext";
import WorkstationProvider from "./contexts/WorkstationProvider";
import { MixerProvider } from "./contexts/MixerContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import Workstation from "./components/Workstation";
import Preferences from "./components/Preferences";
import SettingsProvider from "./components/settings/SettingsManager";
import "./styles/App.css";

function App(): React.ReactElement {
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

  return (
    <BrowserRouter>
      <PreferencesProvider>
        <ClipboardProvider>
          <WorkstationProvider>
            <MixerProvider>
              <SettingsProvider>
                <div className="app">
                  {window.location.pathname === "/" && <Workstation />}
                  {window.location.pathname === "/preferences" && <Preferences />}
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
