import React, { useEffect } from "react";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
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
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <ClipboardProvider>
                    <WorkstationProvider>
                      <Workstation />
                    </WorkstationProvider>
                  </ClipboardProvider>
                }
              />
            </Routes>
            <Preferences />
          </Router>
        </MixerProvider>
      </PreferencesProvider>
    </SettingsProvider>
  );
}

export default App;
