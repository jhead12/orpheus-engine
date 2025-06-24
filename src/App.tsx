import React, { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ClipboardProvider } from './contexts/ClipboardContext';
import { WorkstationProvider } from './contexts/WorkstationContext';
import { MixerProvider } from './contexts/MixerContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import Workstation from './screens/workstation/Workstation';
import Preferences from './components/Preferences';
import SettingsProvider from './components/settings/SettingsManager';
import { DocsPage, DocsNavigation } from './components/docs';
import './styles/App.css';

// Import plugin system
import { pluginSystem } from './plugins';

function App(): React.ReactElement {
  useEffect(() => {
    // Initialize plugin system
    const initializePlugins = async () => {
      try {
        await pluginSystem.initialize();
        console.log('Plugin system initialized successfully');

        // Activate audio analysis plugin by default
        await pluginSystem.activatePlugin('orpheus.audio.analysis');
        console.log('Audio analysis plugin activated');
      } catch (error) {
        console.error('Failed to initialize plugins:', error);
      }
    };

    initializePlugins();

    // Cleanup on unmount
    return () => {
      pluginSystem.shutdown().catch(console.error);
    };
  }, []);

  useEffect(() => {
    // Workaround to the dumb electron bug where blurring inputs with selected text does not make
    // the Electron > Services submenu go back to showing only the 'Development' section
    function handleFocusOut(e: FocusEvent) {
      const relatedTarget = e.relatedTarget as HTMLElement;

      if (
        !relatedTarget ||
        (relatedTarget.tagName !== 'INPUT' &&
          relatedTarget.tagName !== 'TEXTAREA')
      ) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          selection.collapseToEnd();
        }
      }
    }

    document.addEventListener('focusout', handleFocusOut, { capture: true });
    return () =>
      document.removeEventListener('focusout', handleFocusOut, {
        capture: true,
      });
  }, []);

  return (
    <SettingsProvider>
      <PreferencesProvider>
        <MixerProvider>
          <Router>
            <DocsNavigation show={true} />
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
              <Route path="/docs" element={<DocsPage />} />
            </Routes>
            <DocsNavigation />
            <Preferences />
          </Router>
        </MixerProvider>
      </PreferencesProvider>
    </SettingsProvider>
  );
}

export default App;
