import { MLflowExperiment } from '../types/audio';

export class MLflowService {
  private baseUrl: string;
  private experimentName: string;
  private connected: boolean = false;

  constructor(baseUrl: string = 'http://localhost:5000', experimentName: string = 'orpheus-audio-analysis') {
    this.baseUrl = baseUrl;
    this.experimentName = experimentName;
  }

  get isConnected(): boolean {
    return this.connected;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async initialize(): Promise<void> {
    const isHealthy = await this.checkHealth();
    this.connected = isHealthy;
    if (!isHealthy) {
      throw new Error('Failed to connect to MLflow server');
    }
  }

  async createExperiment(name?: string): Promise<string> {
    const experimentName = name || this.experimentName;
    try {
      const response = await fetch(`${this.baseUrl}/api/2.0/mlflow/experiments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: experimentName
        }),
      });

      if (!response.ok) {
        // If experiment already exists, get its ID
        const experiments = await this.listExperiments();
        const existing = experiments.find(exp => exp.name === experimentName);
        if (existing) {
          return existing.experiment_id;
        }
        throw new Error('Failed to create or find experiment');
      }

      const data = await response.json();
      return data.experiment_id;
    } catch (error) {
      console.error('MLflow experiment creation failed:', error);
      // Return a mock experiment ID for demo purposes
      return `demo-experiment-${Date.now()}`;
    }
  }

  async startRun(experimentId: string, runName?: string): Promise<MLflowExperiment> {
    try {
      const response = await fetch(`${this.baseUrl}/api/2.0/mlflow/runs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experiment_id: experimentId,
          run_name: runName || `audio-analysis-${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start MLflow run');
      }

      const data = await response.json();
      return {
        experimentId,
        runId: data.run.info.run_id,
        artifactUri: data.run.info.artifact_uri,
        metrics: {},
        parameters: {},
        tags: {},
      };
    } catch (error) {
      console.error('MLflow run creation failed:', error);
      // Return a mock run for demo purposes
      return {
        experimentId,
        runId: `demo-run-${Date.now()}`,
        artifactUri: `file:///tmp/mlflow-artifacts/${Date.now()}`,
        metrics: {},
        parameters: {},
        tags: {},
      };
    }
  }

  async logMetric(runId: string, key: string, value: number, timestamp?: number): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/2.0/mlflow/runs/log-metric`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          run_id: runId,
          key,
          value,
          timestamp: timestamp || Date.now(),
        }),
      });
    } catch (error) {
      console.warn(`Failed to log metric ${key}:`, error);
    }
  }

  async logParameter(runId: string, key: string, value: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/2.0/mlflow/runs/log-parameter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          run_id: runId,
          key,
          value,
        }),
      });
    } catch (error) {
      console.warn(`Failed to log parameter ${key}:`, error);
    }
  }

  async logArtifact(runId: string, artifactPath: string, content: string | Blob): Promise<void> {
    try {
      const formData = new FormData();
      
      if (typeof content === 'string') {
        formData.append('file', new Blob([content], { type: 'text/plain' }), artifactPath);
      } else {
        formData.append('file', content, artifactPath);
      }
      
      await fetch(`${this.baseUrl}/api/2.0/mlflow/artifacts`, {
        method: 'POST',
        body: formData,
        headers: {
          'run-id': runId,
        },
      });
    } catch (error) {
      console.warn(`Failed to log artifact ${artifactPath}:`, error);
    }
  }

  private async listExperiments(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/2.0/mlflow/experiments/list`);
      if (!response.ok) throw new Error('Failed to list experiments');
      const data = await response.json();
      return data.experiments || [];
    } catch (error) {
      console.error('Failed to list experiments:', error);
      return [];
    }
  }

  async getExperimentByName(name: string): Promise<MLflowExperiment | null> {
    try {
      const experiments = await this.listExperiments();
      return experiments.find(exp => exp.name === name) || null;
    } catch (error) {
      console.error('Failed to get experiment by name:', error);
      return null;
    }
  }

  async endRun(runId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/2.0/mlflow/runs/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          run_id: runId,
          status: 'FINISHED',
          end_time: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to end run: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to end run:', error);
      throw error;
    }
  }

  async logMetrics(runId: string, metrics: Record<string, number>): Promise<void> {
    try {
      const metricsList = Object.entries(metrics).map(([key, value]) => ({
        key,
        value,
        timestamp: Date.now(),
      }));

      const response = await fetch(`${this.baseUrl}/api/2.0/mlflow/runs/log-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          run_id: runId,
          metrics: metricsList,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to log metrics: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to log metrics:', error);
      throw error;
    }
  }

  async logParams(runId: string, params: Record<string, string>): Promise<void> {
    try {
      const paramsList = Object.entries(params).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      const response = await fetch(`${this.baseUrl}/api/2.0/mlflow/runs/log-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          run_id: runId,
          params: paramsList,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to log params: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to log params:', error);
      throw error;
    }
  }

  async logTags(runId: string, tags: Record<string, string>): Promise<void> {
    try {
      const tagsList = Object.entries(tags).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      const response = await fetch(`${this.baseUrl}/api/2.0/mlflow/runs/log-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          run_id: runId,
          tags: tagsList,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to log tags: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to log tags:', error);
      throw error;
    }
  }

  async logAudioArtifact(runId: string, audioBlob: Blob, filename: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, filename);
      formData.append('path', 'audio');

      const response = await fetch(`${this.baseUrl}/api/2.0/mlflow/runs/${runId}/artifacts`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to log audio artifact: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to log audio artifact:', error);
      throw error;
    }
  }

  async logAnalysisResults(runId: string, results: any): Promise<void> {
    try {
      const resultsJson = JSON.stringify(results, null, 2);
      const blob = new Blob([resultsJson], { type: 'application/json' });
      
      const formData = new FormData();
      formData.append('file', blob, 'analysis_results.json');
      formData.append('path', 'results');

      const response = await fetch(`${this.baseUrl}/api/2.0/mlflow/runs/${runId}/artifacts`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to log analysis results: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to log analysis results:', error);
      throw error;
    }
  }

  async logVisualization(runId: string, canvas: HTMLCanvasElement, filename: string): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert canvas to blob'));
            return;
          }

          try {
            const formData = new FormData();
            formData.append('file', blob, filename);
            formData.append('path', 'visualizations');

            const response = await fetch(`${this.baseUrl}/api/2.0/mlflow/runs/${runId}/artifacts`, {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error(`Failed to log visualization: ${response.statusText}`);
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        }, 'image/png');
      });
    } catch (error) {
      console.error('Failed to log visualization:', error);
      throw error;
    }
  }

  async logCompleteAnalysis(
    runId: string,
    audioBlob: Blob,
    analysisResults: any,
    canvas: HTMLCanvasElement,
    recordingDuration: number
  ): Promise<void> {
    try {
      // Log metrics
      const metrics = {
        duration: recordingDuration,
        tempo: analysisResults.features?.tempo || 0,
        energy: analysisResults.features?.energy || 0,
        danceability: analysisResults.features?.danceability || 0,
        spectralCentroid: analysisResults.features?.spectralCentroid || 0,
        qualityScore: analysisResults.quality?.score || 0,
        peakLevel: analysisResults.quality?.peakLevel || 0,
        dynamicRange: analysisResults.quality?.dynamicRange || 0,
      };
      await this.logMetrics(runId, metrics);

      // Log parameters
      const params = {
        sampleRate: String(analysisResults.characteristics?.sampleRate || 48000),
        channels: String(analysisResults.characteristics?.channels || 2),
        genre: analysisResults.features?.genre || 'unknown',
        clipping: String(analysisResults.quality?.clipping || false),
      };
      await this.logParams(runId, params);

      // Log tags
      const tags = {
        audioType: 'recording',
        analysisEngine: 'orpheus-demo',
        timestamp: new Date().toISOString(),
      };
      await this.logTags(runId, tags);

      // Log artifacts
      await Promise.all([
        this.logAudioArtifact(runId, audioBlob, 'recording.webm'),
        this.logAnalysisResults(runId, analysisResults),
        this.logVisualization(runId, canvas, 'waveform.png'),
      ]);
    } catch (error) {
      console.error('Failed to log complete analysis:', error);
      throw error;
    }
  }

  generateAnalysisReport(analysisResults: any, recordingDuration: number): string {
    return `# Audio Analysis Report

## Recording Information
- **Duration**: ${recordingDuration.toFixed(2)} seconds
- **Sample Rate**: ${analysisResults.characteristics?.sampleRate || 'Unknown'} Hz
- **Channels**: ${analysisResults.characteristics?.channels || 'Unknown'}

## Audio Features
- **Tempo**: ${analysisResults.features?.tempo || 'Unknown'} BPM
- **Genre**: ${analysisResults.features?.genre || 'Unknown'}
- **Energy**: ${(analysisResults.features?.energy * 100 || 0).toFixed(1)}%
- **Danceability**: ${(analysisResults.features?.danceability * 100 || 0).toFixed(1)}%
- **Spectral Centroid**: ${analysisResults.features?.spectralCentroid?.toFixed(2) || 'Unknown'} Hz

## Quality Metrics
- **Overall Score**: ${analysisResults.quality?.score || 0}/100
- **Peak Level**: ${analysisResults.quality?.peakLevel?.toFixed(2) || 'Unknown'} dB
- **Dynamic Range**: ${analysisResults.quality?.dynamicRange?.toFixed(2) || 'Unknown'} dB
- **Clipping Detected**: ${analysisResults.quality?.clipping ? 'Yes' : 'No'}

## Analysis Timestamp
Generated on: ${new Date().toISOString()}

---
*Generated by Orpheus Engine Audio Analysis Demo for HP AI Studio Competition*
`;
  }
}
