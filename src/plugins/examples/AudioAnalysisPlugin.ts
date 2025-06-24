/**
 * Example Audio Analysis Plugin for Orpheus Engine
 * Demonstrates plugin architecture with Python backend integration
 */

import { BasePlugin, PluginManifest, PluginContext } from '../core/IPlugin';

export class AudioAnalysisPlugin extends BasePlugin {
  private analysisResults: any[] = [];

  constructor() {
    const manifest: PluginManifest = {
      id: 'orpheus.audio.analysis',
      name: 'Audio Analysis Plugin',
      version: '1.0.0',
      description: 'Provides AI-powered audio analysis using Python backend',
      author: 'Orpheus Engine Team',
      category: 'analysis',
      engineVersion: '1.0.10',
      platform: 'universal',
      capabilities: {
        audio: true,
        python: true,
        ui: true,
      },
      main: 'AudioAnalysisPlugin.js',
      ui: 'AudioAnalysisUI.js',
      python: 'audio_analysis.py',
      permissions: ['python_backend'],
    };

    super(manifest);
  }

  async initialize(context: PluginContext): Promise<void> {
    await super.initialize(context);

    // Check if Python backend is available
    if (!context.capabilities.pythonBackend) {
      throw new Error('Python backend is required for audio analysis');
    }

    context.log.info('Audio Analysis Plugin initialized');
  }

  async activate(): Promise<void> {
    await super.activate();

    if (this.context) {
      // Register for audio events
      this.context.on('audio:loaded', this.handleAudioLoaded.bind(this));
      this.context.on('audio:playing', this.handleAudioPlaying.bind(this));

      this.context.log.info('Audio Analysis Plugin activated');
    }
  }

  async deactivate(): Promise<void> {
    if (this.context) {
      // Unregister event listeners
      this.context.off('audio:loaded', this.handleAudioLoaded.bind(this));
      this.context.off('audio:playing', this.handleAudioPlaying.bind(this));
    }

    await super.deactivate();
  }

  /**
   * Process audio data for analysis
   */
  async processAudio(audioData: Float32Array[]): Promise<Float32Array[]> {
    if (!this.isActive || !this.context) {
      return audioData;
    }

    try {
      // Send audio data to Python backend for analysis
      const analysisResult = await this.analyzeWithPython(audioData);

      // Store results for UI display
      this.analysisResults.push({
        timestamp: Date.now(),
        analysis: analysisResult,
      });

      // Emit analysis results
      this.context.emit('analysis:complete', {
        pluginId: this.manifest.id,
        data: analysisResult,
      });

      this.context.log.debug('Audio analysis complete', analysisResult);
    } catch (error) {
      this.context.log.error('Audio analysis failed', error);
    }

    // Return original audio data (non-destructive analysis)
    return audioData;
  }

  /**
   * Create UI component for displaying analysis results
   */
  createUI(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'audio-analysis-plugin';
    container.innerHTML = `
      <div class="plugin-header">
        <h3>Audio Analysis</h3>
        <div class="plugin-controls">
          <button id="clear-analysis">Clear</button>
          <button id="export-analysis">Export</button>
        </div>
      </div>
      <div class="analysis-display">
        <div id="frequency-analysis">
          <h4>Frequency Analysis</h4>
          <canvas id="frequency-canvas" width="300" height="100"></canvas>
        </div>
        <div id="tempo-analysis">
          <h4>Tempo Analysis</h4>
          <div id="tempo-display">-- BPM</div>
        </div>
        <div id="key-analysis">
          <h4>Key Detection</h4>
          <div id="key-display">--</div>
        </div>
      </div>
    `;

    // Add event listeners
    const clearBtn = container.querySelector(
      '#clear-analysis'
    ) as HTMLButtonElement;
    const exportBtn = container.querySelector(
      '#export-analysis'
    ) as HTMLButtonElement;

    clearBtn?.addEventListener('click', () => {
      this.analysisResults = [];
      this.updateUI(container);
    });

    exportBtn?.addEventListener('click', () => {
      this.exportAnalysis();
    });

    // Initial UI update
    this.updateUI(container);

    return container;
  }

  /**
   * Handle audio loaded event
   */
  private async handleAudioLoaded(data: any): Promise<void> {
    if (!this.context) return;

    this.context.log.info('Audio loaded, starting analysis...', data);

    // Trigger initial analysis
    if (data.audioBuffer) {
      await this.processAudio(data.audioBuffer);
    }
  }

  /**
   * Handle audio playing event
   */
  private async handleAudioPlaying(data: any): Promise<void> {
    if (!this.context) return;

    // Real-time analysis during playback
    if (data.audioData) {
      await this.processAudio(data.audioData);
    }
  }

  /**
   * Send audio data to Python backend for analysis
   */
  private async analyzeWithPython(audioData: Float32Array[]): Promise<any> {
    if (!this.context?.pythonBackend) {
      throw new Error('Python backend not available');
    }

    // Convert audio data to format suitable for Python
    const audioArray = Array.from(audioData[0]); // Use first channel for mono analysis

    try {
      // Use actual Python backend service
      const response = await this.context.pythonBackend.analyzeAudio({
        audio_data: audioArray,
        sample_rate: 44100, // Default sample rate
        analysis_type: 'full', // frequency, tempo, key, etc.
        metadata: {
          track_name: 'Unknown',
          duration: audioArray.length / 44100,
        },
      });

      if (!response.success) {
        throw new Error(`Python backend error: ${response.error}`);
      }

      return response.analysis;
    } catch (error) {
      // Fallback to mock analysis for development
      this.context?.log.warn('Using mock analysis data', error);
      return this.generateMockAnalysis(audioData);
    }
  }

  /**
   * Generate mock analysis data for development
   */
  private generateMockAnalysis(audioData: Float32Array[]): any {
    return {
      frequency: {
        fundamental: 440 + Math.random() * 100,
        harmonics: [880, 1320, 1760],
        spectrum: Array.from({ length: 50 }, () => Math.random()),
      },
      tempo: {
        bpm: 120 + Math.random() * 60,
        confidence: 0.8 + Math.random() * 0.2,
      },
      key: {
        note: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][
          Math.floor(Math.random() * 12)
        ],
        mode: Math.random() > 0.5 ? 'major' : 'minor',
        confidence: 0.7 + Math.random() * 0.3,
      },
      loudness: {
        rms: Math.random(),
        peak: Math.random(),
        lufs: -23 + Math.random() * 20,
      },
    };
  }

  /**
   * Update UI with latest analysis results
   */
  private updateUI(container: HTMLElement): void {
    if (this.analysisResults.length === 0) return;

    const latest = this.analysisResults[this.analysisResults.length - 1];
    const analysis = latest.analysis;

    // Update tempo display
    const tempoDisplay = container.querySelector('#tempo-display');
    if (tempoDisplay && analysis.tempo) {
      tempoDisplay.textContent = `${Math.round(analysis.tempo.bpm)} BPM`;
    }

    // Update key display
    const keyDisplay = container.querySelector('#key-display');
    if (keyDisplay && analysis.key) {
      keyDisplay.textContent = `${analysis.key.note} ${analysis.key.mode}`;
    }

    // Update frequency canvas
    const canvas = container.querySelector(
      '#frequency-canvas'
    ) as HTMLCanvasElement;
    if (canvas && analysis.frequency) {
      this.drawFrequencySpectrum(canvas, analysis.frequency.spectrum);
    }
  }

  /**
   * Draw frequency spectrum on canvas
   */
  private drawFrequencySpectrum(
    canvas: HTMLCanvasElement,
    spectrum: number[]
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / spectrum.length;

    ctx.fillStyle = '#4CAF50';
    spectrum.forEach((value, index) => {
      const barHeight = value * canvas.height;
      ctx.fillRect(
        index * barWidth,
        canvas.height - barHeight,
        barWidth - 1,
        barHeight
      );
    });
  }

  /**
   * Export analysis results
   */
  private exportAnalysis(): void {
    if (!this.context) return;

    const data = {
      plugin: this.manifest.name,
      version: this.manifest.version,
      timestamp: new Date().toISOString(),
      results: this.analysisResults,
    };

    // Create downloadable file
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `audio-analysis-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);

    this.context.log.info('Analysis results exported');
  }

  /**
   * Get current analysis results
   */
  public getAnalysisResults(): any[] {
    return [...this.analysisResults];
  }

  /**
   * Clear analysis history
   */
  public clearAnalysisResults(): void {
    this.analysisResults = [];
    this.context?.emit('analysis:cleared', { pluginId: this.manifest.id });
  }
}
