/**
 * Mock implementation for PythonBackendService
 * Used to prevent URL undefined errors during tests
 */

export class PythonBackendServiceMock {
  private static instance: PythonBackendServiceMock;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): PythonBackendServiceMock {
    if (!PythonBackendServiceMock.instance) {
      PythonBackendServiceMock.instance = new PythonBackendServiceMock();
    }
    return PythonBackendServiceMock.instance;
  }

  public async initialize(): Promise<void> {
    console.log('Mock Python Backend Service initialized');
    this.isConnected = true;
    return Promise.resolve();
  }

  public async checkHealth(): Promise<any> {
    return Promise.resolve({
      status: 'healthy',
      version: '1.0.0-test',
      features: ['audio_analysis', 'transcription'],
    });
  }

  public async makeRequest(_endpoint: string, _options: any): Promise<any> {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ status: 'success' }),
    });
  }

  public isInitialized(): boolean {
    return this.isConnected;
  }

  // Add other methods as needed to mock functionality
}

export const pythonBackend = PythonBackendServiceMock.getInstance();
