interface SerializedAudioData {
  sampleRate: number;
  length: number;
  numberOfChannels: number;
  channelData: number[][];
}

interface ElectronAPI {
  invoke(channel: 'mcp:analyze', args: {
    data: SerializedAudioData;
    type: string;
    params: {
      resolution: number;
      windowSize: number;
    };
  }): Promise<any>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
