/**
 * AudioRecorder class for handling audio recording from single sources
 */
export class AudioRecorder {
  isRecording: boolean = false;
  audioContext: AudioContext | null = null;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  currentDeviceId: string | null = null;
  
  constructor() {
    // Initialize any properties needed
  }
  
  /**
   * Start recording audio
   * @param options Options for recording
   * @returns Promise that resolves when recording has started
   */
  async startRecording(options: { deviceId?: string } = {}): Promise<void> {
    if (this.isRecording) {
      return;
    }
    
    try {
      // Create audio context if it doesn't exist
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }
      
      // Get user media stream
      const constraints = {
        audio: options.deviceId ? { deviceId: { exact: options.deviceId } } : true,
        video: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Store the device ID
      this.currentDeviceId = options.deviceId || null;
      
      // Create media recorder
      this.mediaRecorder = new MediaRecorder(mediaStream);
      this.audioChunks = [];
      
      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event: any) => {
        this.audioChunks.push(event.data);
      };
      
      // Start recording
      this.mediaRecorder.start();
      this.isRecording = true;
      
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }
  
  /**
   * Stop recording audio
   * @returns Promise that resolves with the recorded audio data
   */
  async stopRecording(): Promise<Blob> {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('Not currently recording');
    }
    
    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.isRecording = false;
          resolve(audioBlob);
        } catch (error) {
          reject(error);
        }
      };
      
      this.mediaRecorder!.stop();
    });
  }
  
  /**
   * Get a list of available audio input devices
   * @returns Promise that resolves with the list of devices
   */
  async getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Error getting audio input devices:', error);
      throw error;
    }
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.mediaRecorder = null;
    this.isRecording = false;
    this.audioChunks = [];
  }
}
