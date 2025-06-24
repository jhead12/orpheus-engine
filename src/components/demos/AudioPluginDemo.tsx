/**
 * Audio Plugin Demo Component
 * Demonstrates the plugin system and audio backend integration
 */

import React, { useState, useEffect, useRef } from 'react';
import { audioService, type AudioFile } from '@orpheus/services/AudioService';
import { pluginSystem } from '@orpheus/plugins';

interface PluginManifest {
  id: string;
  name: string;
  category: string;
}

interface Plugin {
  processAudio?: (data: any) => Promise<void>;
  createUI?: () => HTMLElement;
  context?: {
    pythonBackend?: {
      isBackendConnected: () => boolean;
    };
  };
}

interface ActivePlugin {
  manifest: PluginManifest;
  plugin: Plugin;
  status: string;
}
          const backend = pluginSystem
            .getRegistry()
            .getPlugin('orpheus.audio.analysis')?.plugin as Plugin;
          if (backend?.context?.pythonBackend) {
            const isConnected =
              backend.context.pythonBackend.isBackendConnected();
            setBackendStatus(isConnected ? 'connected' : 'disconnected');
          }
        } catch (_) {
          setBackendStatus('disconnected');
        }
    // Initialize plugin system
    const initializeSystem = async () => {
      try {
        if (!pluginSystem.isInitialized()) {
          await pluginSystem.initialize();
        }
        setPluginSystemReady(true);
        setActivePlugins(pluginSystem.getActivePlugins());

        // Check backend status
        try {
          const backend = pluginSystem
            .getRegistry()
            .getPlugin('orpheus.audio.analysis')?.plugin as any;
          if (backend?.context?.pythonBackend) {
            const isConnected =
              backend.context.pythonBackend.isBackendConnected();
            setBackendStatus(isConnected ? 'connected' : 'disconnected');
          }
        } catch (error) {
          setBackendStatus('disconnected');
        }
      } catch (error) {
        console.error('Failed to initialize plugin system:', error);
        // Loading audio file
    };

    initializeSystem();

    // Set up audio service event listeners
    const updateFiles = () => setLoadedFiles(audioService.getLoadedFiles());
    audioService.on('audio:loaded', updateFiles);

    return () => {
      audioService.off('audio:loaded', updateFiles);
    };
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
        // Error handling would be better with a UI component
        console.error(`Failed to load ${file.name}: ${error}`);
    if (!files || files.length === 0) return;

    for (const file of files) {
      try {
        console.log(`Loading audio file: ${file.name}`);
        const audioFile = await audioService.loadAudioFile(file);

        // Trigger analysis with plugins
        const analysisData = audioService.getAudioAnalysisData(audioFile.id);
        if (analysisData) {
          // Get audio analysis plugin
          const analysisPlugin = pluginSystem
            .getActivePlugins()
            .find((p) => p.manifest.id === 'orpheus.audio.analysis');

          if (analysisPlugin?.plugin.processAudio) {
            await analysisPlugin.plugin.processAudio(analysisData);
          }
      console.error(`Failed to play ${audioFile.name}: ${error}`);
      } catch (error) {
        console.error('Failed to load audio file:', error);
        alert(`Failed to load ${file.name}: ${error}`);
      }
    }

    // Clear input
  const renderPluginUI = (plugin: ActivePlugin) => {
      fileInputRef.current.value = '';
    }
  };

  const handlePlayFile = async (audioFile: AudioFile) => {
    try {
      const clip = audioService.createClip(audioFile.id, {
        trackId: 'demo-track',
        position: 0,
      });

      await audioService.playClip(clip.id);
    } catch (error) {
      console.error('Failed to play audio:', error);
      alert(`Failed to play ${audioFile.name}: ${error}`);
    }
  };

  const handleStopPlayback = () => {
    audioService.stopPlayback();
  };

  const renderPluginUI = (plugin: any) => {
    if (
      plugin.manifest.id === 'orpheus.audio.analysis' &&
      plugin.plugin.createUI
    ) {
      const ui = plugin.plugin.createUI();
      return (
        <div key={plugin.manifest.id} className="plugin-ui-container">
          <div
            ref={(el) => {
              if (el && !el.hasChildNodes()) {
                el.appendChild(ui);
              }
            }}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="audio-plugin-demo">
      <div className="demo-header">
        <h2>🎵 Audio Plugin Demo</h2>
        <div className="status-indicators">
          <div
            className={`status-indicator ${pluginSystemReady ? 'connected' : 'disconnected'}`}
          >
            Plugin System: {pluginSystemReady ? 'Ready' : 'Loading...'}
          </div>
          <div className={`status-indicator ${backendStatus}`}>
            Python Backend: {backendStatus}
          </div>
        </div>
      </div>

      <div className="demo-content">
        <div className="audio-section">
          <div className="section-header">
            <h3>Audio Files</h3>
            <div className="section-controls">
                <p>
                  No audio files loaded. Click &quot;Load Audio Files&quot; to get
                  started.
                </p>
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="load-button"
              >
                Load Audio Files
              </button>
              <button onClick={handleStopPlayback} className="stop-button">
                Stop All
              </button>
            </div>
          </div>

          <div className="audio-files-list">
            {loadedFiles.length === 0 ? (
              <div className="empty-state">
                <p>
                  No audio files loaded. Click "Load Audio Files" to get
                  started.
                </p>
                <p>Supported formats: WAV, MP3, OGG, M4A</p>
              </div>
            ) : (
              loadedFiles.map((file) => (
                <div key={file.id} className="audio-file-item">
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-details">
                      {file.duration.toFixed(2)}s • {file.sampleRate}Hz •{' '}
                      {file.channels} ch
                    </div>
                  </div>
                  <div className="file-actions">
                    <button
                      onClick={() => handlePlayFile(file)}
                      className="play-button"
                    >
                      ▶ Play
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="plugins-section">
          <div className="section-header">
            <h3>Active Plugins ({activePlugins.length})</h3>
          </div>

          <div className="plugins-list">
            {activePlugins.length === 0 ? (
              <div className="empty-state">
                <p>
                  No plugins active. Enable plugins to see analysis results.
                </p>
              </div>
            ) : (
              activePlugins.map((plugin) => (
                <div key={plugin.manifest.id} className="plugin-item">
                  <div className="plugin-header">
                    <div className="plugin-info">
                      <div className="plugin-name">{plugin.manifest.name}</div>
                      <div className="plugin-category">
                        {plugin.manifest.category}
                      </div>
                    </div>
                    <div className="plugin-status">{plugin.status}</div>
                  </div>
                  {renderPluginUI(plugin)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="demo-footer">
        <p>
          This demo showcases the Orpheus Engine plugin architecture with
          real-time audio analysis. Load audio files to see automatic analysis
          results from AI-powered plugins.
        </p>
      </div>
    </div>
  );
};

export default AudioPluginDemo;
