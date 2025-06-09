/**
 * TypeScript client for Orpheus Engine Python Backend
 * Provides WebSocket and HTTP API communication
 */

export interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;
  isPaused: boolean;
  playheadPosition: number;
  tempo: number;
  timeSignature: [number, number];
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
}

export interface Track {
  id: string;
  name: string;
  type: "audio" | "midi" | "instrument" | "bus" | "return";
  volume: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
  armed: boolean;
  color: string;
  clips: AudioClip[];
  effects: EffectInstance[];
  automationMode: "read" | "write" | "touch" | "latch";
  inputGain: number;
  outputGain: number;
}

export interface AudioClip {
  id: string;
  name: string;
  trackId: string;
  startTime: number;
  duration: number;
  offset: number;
  gain: number;
  fadeIn: number;
  fadeOut: number;
  audioFileId: string;
  waveformData?: number[];
}

export interface EffectInstance {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  parameters: Record<string, any>;
  wetDryMix: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  modifiedAt: string;
  sampleRate: number;
  tempo: number;
  timeSignature: [number, number];
  duration: number;
  tracks: Track[];
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  audioLatency: number;
  bufferUnderruns: number;
  activeTracks: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  id?: string;
}

export class OrpheusBackendClient {
  private baseUrl: string;
  private wsUrl: string;
  private websocket: WebSocket | null = null;
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  private reconnectInterval: number = 5000;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  constructor(baseUrl: string = "http://localhost:8000") {
    this.baseUrl = baseUrl;
    this.wsUrl = baseUrl.replace("http", "ws") + "/ws";
  }

  // WebSocket Connection Management

  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.websocket = new WebSocket(this.wsUrl);

        this.websocket.onopen = () => {
          console.log("🔌 Connected to Orpheus Backend");
          this.reconnectAttempts = 0;
          this.notifyConnectionListeners(true);
          resolve(true);
        };

        this.websocket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        this.websocket.onclose = () => {
          console.log("🔌 Disconnected from Orpheus Backend");
          this.notifyConnectionListeners(false);
          this.scheduleReconnect();
        };

        this.websocket.onerror = (error) => {
          console.error("WebSocket error:", error);
          resolve(false);
        };
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        resolve(false);
      }
    });
  }

  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`🔄 Reconnecting... (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, this.reconnectInterval);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message.data));
    }
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach((listener) => listener(connected));
  }

  // Event Subscription

  on(eventType: string, handler: (data: any) => void): void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, new Set());
    }
    this.messageHandlers.get(eventType)!.add(handler);

    // Subscribe to events on the server
    this.sendMessage({
      type: "subscribe",
      data: { subscriptions: [eventType] },
    });
  }

  off(eventType: string, handler: (data: any) => void): void {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(eventType);

        // Unsubscribe from events on the server
        this.sendMessage({
          type: "unsubscribe",
          data: { subscriptions: [eventType] },
        });
      }
    }
  }

  onConnection(listener: (connected: boolean) => void): void {
    this.connectionListeners.add(listener);
  }

  offConnection(listener: (connected: boolean) => void): void {
    this.connectionListeners.delete(listener);
  }

  private sendMessage(message: Partial<WebSocketMessage>): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  // HTTP API Methods

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Transport Control API

  async getTransportState(): Promise<TransportState> {
    return this.request("/api/audio/transport/state");
  }

  async play(): Promise<void> {
    await this.request("/api/audio/transport/play", { method: "POST" });
  }

  async pause(): Promise<void> {
    await this.request("/api/audio/transport/pause", { method: "POST" });
  }

  async stop(): Promise<void> {
    await this.request("/api/audio/transport/stop", { method: "POST" });
  }

  async record(): Promise<void> {
    await this.request("/api/audio/transport/record", { method: "POST" });
  }

  async seek(position: number): Promise<void> {
    await this.request(`/api/audio/transport/seek?position=${position}`, {
      method: "POST",
    });
  }

  // Track Management API

  async getTracks(): Promise<Track[]> {
    return this.request("/api/audio/tracks");
  }

  async createTrack(track: Partial<Track>): Promise<Track> {
    return this.request("/api/audio/tracks", {
      method: "POST",
      body: JSON.stringify(track),
    });
  }

  async updateTrack(trackId: string, track: Partial<Track>): Promise<Track> {
    return this.request(`/api/audio/tracks/${trackId}`, {
      method: "PUT",
      body: JSON.stringify(track),
    });
  }

  async deleteTrack(trackId: string): Promise<void> {
    await this.request(`/api/audio/tracks/${trackId}`, { method: "DELETE" });
  }

  async addEffect(trackId: string, effect: EffectInstance): Promise<Track> {
    return this.request(`/api/audio/tracks/${trackId}/effects`, {
      method: "POST",
      body: JSON.stringify(effect),
    });
  }

  async removeEffect(trackId: string, effectId: string): Promise<Track> {
    return this.request(`/api/audio/tracks/${trackId}/effects/${effectId}`, {
      method: "DELETE",
    });
  }

  // Audio File Management

  async loadAudioFile(file: File): Promise<AudioClip> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseUrl}/api/audio/load`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to load audio file: ${response.statusText}`);
    }

    const result = await response.json();
    return result.clip;
  }

  async analyzeAudio(fileId: string): Promise<any> {
    return this.request(`/api/audio/analyze/${fileId}`);
  }

  // Project Management API

  async getProjects(): Promise<Project[]> {
    return this.request("/api/projects");
  }

  async getProject(projectId: string): Promise<Project> {
    return this.request(`/api/projects/${projectId}`);
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    return this.request("/api/projects", {
      method: "POST",
      body: JSON.stringify(project),
    });
  }

  async updateProject(
    projectId: string,
    project: Partial<Project>
  ): Promise<Project> {
    return this.request(`/api/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(project),
    });
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.request(`/api/projects/${projectId}`, { method: "DELETE" });
  }

  async loadProject(projectId: string): Promise<Project> {
    return this.request(`/api/projects/${projectId}/load`, { method: "POST" });
  }

  async saveProject(projectId: string): Promise<void> {
    await this.request(`/api/projects/${projectId}/save`, { method: "POST" });
  }

  async exportProject(
    projectId: string,
    format: string = "wav"
  ): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/api/projects/${projectId}/export?format=${format}`
    );

    if (!response.ok) {
      throw new Error(`Failed to export project: ${response.statusText}`);
    }

    return response.blob();
  }

  // System Integration API

  async getSystemInfo(): Promise<any> {
    return this.request("/api/system/info");
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return this.request("/api/audio/performance");
  }

  async showOpenFileDialog(
    options: {
      title?: string;
      fileTypes?: Array<{ name: string; extensions: string[] }>;
      multiple?: boolean;
    } = {}
  ): Promise<string[]> {
    const result = await this.request("/api/system/file-dialog/open", {
      method: "POST",
      body: JSON.stringify(options),
    });
    return result.file_paths;
  }

  async showSaveFileDialog(
    options: {
      title?: string;
      defaultName?: string;
      fileTypes?: Array<{ name: string; extensions: string[] }>;
    } = {}
  ): Promise<string | null> {
    const result = await this.request("/api/system/file-dialog/save", {
      method: "POST",
      body: JSON.stringify(options),
    });
    return result.file_path;
  }

  async showFolderDialog(
    options: { title?: string } = {}
  ): Promise<string | null> {
    const result = await this.request("/api/system/folder-dialog", {
      method: "POST",
      body: JSON.stringify(options),
    });
    return result.folder_path;
  }

  async showNotification(
    title: string,
    message: string,
    type: string = "info"
  ): Promise<void> {
    await this.request("/api/system/notifications/show", {
      method: "POST",
      body: JSON.stringify({ title, message, type }),
    });
  }

  // Audio Device Management

  async getAudioDevices(): Promise<any> {
    return this.request("/api/system/audio-devices");
  }

  async setInputDevice(deviceId: string): Promise<void> {
    await this.request("/api/system/audio-devices/set-input", {
      method: "POST",
      body: JSON.stringify({ device_id: deviceId }),
    });
  }

  async setOutputDevice(deviceId: string): Promise<void> {
    await this.request("/api/system/audio-devices/set-output", {
      method: "POST",
      body: JSON.stringify({ device_id: deviceId }),
    });
  }

  // Preferences

  async getPreferences(): Promise<any> {
    return this.request("/api/system/preferences");
  }

  async setPreferences(preferences: any): Promise<void> {
    await this.request("/api/system/preferences", {
      method: "POST",
      body: JSON.stringify(preferences),
    });
  }
}

// Export a default instance
export const orpheusBackend = new OrpheusBackendClient();

// React Hook for easy integration
export function useOrpheusBackend() {
  return orpheusBackend;
}
