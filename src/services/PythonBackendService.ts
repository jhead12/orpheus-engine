/**
 * Python Backend Service for Orpheus Engine
 * Handles communication with the Python RAG backend for AI-powered audio analysis
 */

export interface AudioAnalysisRequest {
  audio_data: number[];
  sample_rate: number;
  analysis_type: 'frequency' | 'tempo' | 'key' | 'loudness' | 'full';
  metadata?: {
    track_name?: string;
    artist?: string;
    duration?: number;
  };
}

export interface AudioAnalysisResponse {
  success: boolean;
  analysis?: {
    frequency?: {
      fundamental: number;
      harmonics: number[];
      spectrum: number[];
    };
    tempo?: {
      bpm: number;
      confidence: number;
      beats: number[];
    };
    key?: {
      note: string;
      mode: 'major' | 'minor';
      confidence: number;
    };
    loudness?: {
      rms: number;
      peak: number;
      lufs: number;
    };
    features?: {
      mfcc: number[];
      spectral_centroid: number;
      zero_crossing_rate: number;
    };
  };
  error?: string;
  processing_time?: number;
}

export interface BackendHealth {
  status: 'healthy' | 'unhealthy';
  version: string;
  uptime: number;
  features: string[];
  gpu_available: boolean;
  python_version: string;
}

export class PythonBackendService {
  private static instance: PythonBackendService;
  private baseUrl: string;
  private isConnected = false;
  private retryAttempts = 3;
  private retryDelay = 1000; // ms

  private constructor() {
    // Get backend URL from environment or use default
    this.baseUrl = this.getBackendUrl();
  }

  public static getInstance(): PythonBackendService {
    if (!PythonBackendService.instance) {
      PythonBackendService.instance = new PythonBackendService();
    }
    return PythonBackendService.instance;
  }

  /**
   * Get backend URL based on environment
   */
  private getBackendUrl(): string {
    // Check environment variables
    if (typeof process !== 'undefined' && process.env.VITE_BACKEND_URL) {
      return process.env.VITE_BACKEND_URL;
    }

    // Check if running in Electron
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return 'http://localhost:5001';
    }

    // Default for web environment
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  }

  /**
   * Initialize connection to Python backend
   */
  public async initialize(): Promise<void> {
    try {
      console.log(`Connecting to Python backend at ${this.baseUrl}...`);

      const health = await this.checkHealth();
      if (health.status === 'healthy') {
        this.isConnected = true;
        console.log(`Connected to Python backend v${health.version}`);
        console.log(`Available features: ${health.features.join(', ')}`);
      } else {
        throw new Error('Backend is not healthy');
      }
    } catch (error) {
      console.error('Failed to connect to Python backend:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Check backend health status
   */
  public async checkHealth(): Promise<BackendHealth> {
    try {
      const response = await this.makeRequest('/health', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        status: 'healthy',
        version: data.version || '1.0.0',
        uptime: data.uptime || 0,
        features: data.features || ['audio_analysis'],
        gpu_available: data.gpu_available || false,
        python_version: data.python_version || '3.8',
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        version: 'unknown',
        uptime: 0,
        features: [],
        gpu_available: false,
        python_version: 'unknown',
      };
    }
  }

  /**
   * Analyze audio data using Python backend
   */
  public async analyzeAudio(
    request: AudioAnalysisRequest,
  ): Promise<AudioAnalysisResponse> {
    if (!this.isConnected) {
      throw new Error('Backend not connected. Call initialize() first.');
    }

    try {
      const startTime = performance.now();

      const response = await this.makeRequest('/api/audio/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Analysis failed: ${response.statusText} - ${errorData.detail || errorData.error || 'Unknown error'}`,
        );
      }

      const data = await response.json();
      const processingTime = performance.now() - startTime;

      return {
        success: true,
        analysis: data.analysis,
        processing_time: processingTime,
      };
    } catch (error) {
      console.error('Audio analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process batch audio analysis
   */
  public async batchAnalyzeAudio(
    requests: AudioAnalysisRequest[],
  ): Promise<AudioAnalysisResponse[]> {
    if (!this.isConnected) {
      throw new Error('Backend not connected. Call initialize() first.');
    }

    try {
      const response = await this.makeRequest('/api/audio/batch-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      });

      if (!response.ok) {
        throw new Error(`Batch analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Batch audio analysis failed:', error);
      return requests.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }

  /**
   * Get available analysis models
   */
  public async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.makeRequest('/api/models', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to get models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to get models:', error);
      return [];
    }
  }

  /**
   * Upload audio file for analysis
   */
  public async uploadAudioFile(
    file: File,
    analysisType: string = 'full',
  ): Promise<AudioAnalysisResponse> {
    if (!this.isConnected) {
      throw new Error('Backend not connected. Call initialize() first.');
    }

    try {
      const formData = new FormData();
      formData.append('audio_file', file);
      formData.append('analysis_type', analysisType);

      const response = await this.makeRequest('/api/audio/upload-analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`File upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        analysis: data.analysis,
      };
    } catch (error) {
      console.error('File upload analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit,
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          timeout: 30000, // 30 second timeout
          ...options,
        });

        return response;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Request attempt ${attempt} failed:`, error);

        if (attempt < this.retryAttempts) {
          console.log(`Retrying in ${this.retryDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        }
      }
    }

    throw lastError || new Error('Request failed after all retry attempts');
  }

  /**
   * Check if backend is connected
   */
  public isBackendConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get backend URL
   */
  public getBackendUrl(): string {
    return this.baseUrl;
  }

  /**
   * Disconnect from backend
   */
  public disconnect(): void {
    this.isConnected = false;
    console.log('Disconnected from Python backend');
  }

  /**
   * Subscribe to real-time analysis events (WebSocket)
   */
  public subscribeToRealTimeAnalysis(
    callback: (analysis: any) => void,
  ): WebSocket | null {
    try {
      const wsUrl = `${this.baseUrl.replace(/^http/, 'ws')}/ws/analysis`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to real-time analysis WebSocket');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Real-time analysis WebSocket closed');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return null;
    }
  }
}

// Export singleton instance
export const pythonBackend = PythonBackendService.getInstance();
