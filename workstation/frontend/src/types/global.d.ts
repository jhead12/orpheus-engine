declare global {
  interface Window {
    electronAPI?: {
      getVersion?: () => Promise<string>;
      getAppVersion?: () => Promise<string>;
    };
    orpheusAPI?: {
      platform?: string;
    };
  }
}

// Module declarations for missing modules
declare module './components' {
  export * from '../components';
}

declare module '../../components' {
  export * from '../components';
}

declare module '../../contexts' {
  export * from '../contexts';
}

declare module '../../shared/types/audio' {
  export interface WaveformLevelsOfDetail {
    ultraLow: Float32Array[];
    low: Float32Array[];
    medium: Float32Array[];
    high: Float32Array[];
  }
}

declare module '.' {
  export const ClipComponent: React.ComponentType<any>;
  export const Waveform: React.ComponentType<any>;
}

declare module '../../services/utils/utils' {
  export const TimelinePosition: any;
}

declare namespace vi {
  export function fn(): any;
  export function mock(path: string, factory: () => any): void;
}

export {};
