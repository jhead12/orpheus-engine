import { AudioRecorder } from './audioRecorder';

/**
 * Represents a recording source
 */
interface RecordingSource {
  deviceId: string;
  recorder: AudioRecorder;
  isRecording: boolean;
  label?: string;
}

/**
 * MultiSourceRecorder class for handling recording from multiple audio sources simultaneously
 */
export class MultiSourceRecorder {
  activeSources: RecordingSource[] = [];
  isRecording: boolean = false;
  syncEnabled: boolean = false;
  masterClock: number | null = null;
  
  constructor() {
    // Initialize any properties needed
  }
  
  /**
   * Add a recording source
   * @param deviceId The device ID to add
   * @param label Optional label for the source
   * @returns Promise that resolves when the source has been added
   */
  async addSource(deviceId: string, label?: string): Promise<void> {
    // Check if source already exists
    if (this.activeSources.some(source => source.deviceId === deviceId)) {
      return;
    }
    
    const recorder = new AudioRecorder();
    
    // Get device info to populate label if not provided
    if (!label) {
      const devices = await recorder.getAudioInputDevices();
      const device = devices.find(d => d.deviceId === deviceId);
      label = device?.label || deviceId;
    }
    
    this.activeSources.push({
      deviceId,
      recorder,
      isRecording: false,
      label
    });
  }
  
  /**
   * Remove a recording source
   * @param deviceId The device ID to remove
   */
  removeSource(deviceId: string): void {
    const sourceIndex = this.activeSources.findIndex(source => source.deviceId === deviceId);
    
    if (sourceIndex === -1) {
      return;
    }
    
    // Clean up the recorder if it's recording
    const source = this.activeSources[sourceIndex];
    if (source.isRecording) {
      source.recorder.stopRecording().catch(console.error);
    }
    source.recorder.dispose();
    
    // Remove from active sources
    this.activeSources.splice(sourceIndex, 1);
  }
  
  /**
   * Enable or disable synchronization between sources
   * @param enabled Whether synchronization should be enabled
   */
  enableSynchronization(enabled: boolean): void {
    this.syncEnabled = enabled;
  }
  
  /**
   * Start recording from all sources
   * @returns Promise that resolves when all recorders have started
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      return;
    }
    
    if (this.activeSources.length === 0) {
      throw new Error('No recording sources added');
    }
    
    // Set the master clock if synchronization is enabled
    if (this.syncEnabled) {
      this.masterClock = Date.now();
    }
    
    // Start all recorders
    await Promise.all(
      this.activeSources.map(async (source) => {
        await source.recorder.startRecording({ deviceId: source.deviceId });
        source.isRecording = true;
      })
    );
    
    this.isRecording = true;
  }
  
  /**
   * Stop recording from all sources
   * @returns Promise that resolves with an array of recorded audio blobs
   */
  async stopRecording(): Promise<Blob[]> {
    if (!this.isRecording) {
      throw new Error('Not currently recording');
    }
    
    // Stop all recorders
    const recordings = await Promise.all(
      this.activeSources.map(async (source) => {
        const blob = await source.recorder.stopRecording();
        source.isRecording = false;
        return blob;
      })
    );
    
    this.isRecording = false;
    this.masterClock = null;
    
    return recordings;
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    // Stop recording if active
    if (this.isRecording) {
      this.stopRecording().catch(console.error);
    }
    
    // Clean up all recorders
    this.activeSources.forEach(source => {
      source.recorder.dispose();
    });
    
    this.activeSources = [];
    this.isRecording = false;
    this.masterClock = null;
  }
}
