import React, { useEffect } from "react";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { ClipboardProvider } from "./contexts/ClipboardProvider";
import PreferencesProvider from "./contexts/PreferencesProvider";
import { WorkstationProvider } from "./contexts/WorkstationProvider";
import Preferences from "./components/Preferences";
import Workstation from "./screens/workstation/Workstation";
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

  return React.createElement(
    SettingsProvider,
    null,
    React.createElement(
      PreferencesProvider,
      null,
      React.createElement(
        Router,
        null,
        React.createElement(
          Routes,
          null,
          React.createElement(
            Route,
            {
              path: "/",
              element: React.createElement(
                ClipboardProvider,
                null,
                React.createElement(
                  WorkstationProvider,
                  null,
                  React.createElement(Workstation)
                )
              )
            }
          )
        ),
        React.createElement(Preferences)
      )
    )
  );
}

export default App;
