import React from 'react';
import { usePreferences } from '../contexts/PreferencesContext';

const Preferences: React.FC = () => {
  const { preferences, updatePreference, resetPreferences } = usePreferences();

  return (
    <div className="preferences">
      <h1>Preferences</h1>

      <div className="preferences-section">
        <h2>Appearance</h2>
        <div className="settings-group">
          <label>Theme</label>
          <select
            value={preferences.theme}
            onChange={(e) => updatePreference('theme', e.target.value as 'light' | 'dark' | 'system')}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="preferences-section">
        <h2>Audio</h2>
        <div className="settings-group">
          <label>Input Device</label>
          <select
            value={preferences.audioInputDevice}
            onChange={(e) => updatePreference('audioInputDevice', e.target.value)}
          >
            <option value="default">Default Input</option>
          </select>
        </div>

        <div className="settings-group">
          <label>Output Device</label>
          <select
            value={preferences.audioOutputDevice}
            onChange={(e) => updatePreference('audioOutputDevice', e.target.value)}
          >
            <option value="default">Default Output</option>
          </select>
        </div>

        <div className="settings-group">
          <label>Sample Rate</label>
          <select
            value={preferences.sampleRate}
            onChange={(e) => updatePreference('sampleRate', parseInt(e.target.value))}
          >
            <option value="44100">44.1 kHz</option>
            <option value="48000">48 kHz</option>
            <option value="96000">96 kHz</option>
          </select>
        </div>

        <div className="settings-group">
          <label>Buffer Size</label>
          <select
            value={preferences.bufferSize}
            onChange={(e) => updatePreference('bufferSize', parseInt(e.target.value))}
          >
            <option value="256">256 samples</option>
            <option value="512">512 samples</option>
            <option value="1024">1024 samples</option>
            <option value="2048">2048 samples</option>
          </select>
        </div>
      </div>

      <div className="preferences-section">
        <h2>Editor</h2>
        <div className="settings-group">
          <label>
            <input
              type="checkbox"
              checked={preferences.snapToGrid}
              onChange={(e) => updatePreference('snapToGrid', e.target.checked)}
            />
            Snap to Grid
          </label>
        </div>

        <div className="settings-group">
          <label>
            <input
              type="checkbox"
              checked={preferences.showWaveforms}
              onChange={(e) => updatePreference('showWaveforms', e.target.checked)}
            />
            Show Waveforms
          </label>
        </div>

        <div className="settings-group">
          <label>
            <input
              type="checkbox"
              checked={preferences.showMIDINotes}
              onChange={(e) => updatePreference('showMIDINotes', e.target.checked)}
            />
            Show MIDI Notes
          </label>
        </div>

        <div className="settings-group">
          <label>Autosave Interval (minutes)</label>
          <input
            type="number"
            min="1"
            max="60"
            value={preferences.autosaveInterval}
            onChange={(e) => updatePreference('autosaveInterval', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="preferences-section">
        <button onClick={resetPreferences}>Reset to Defaults</button>
      </div>
    </div>
  );
};

export default Preferences;
