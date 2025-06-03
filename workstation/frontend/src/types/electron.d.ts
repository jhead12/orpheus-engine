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

  send: (channel: string, ...args: any[]) => void;
  receive: (channel: string, func: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
