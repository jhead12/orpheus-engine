import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { DAWProvider } from '../contexts/DAWContext';
import { MixerProvider } from '../contexts/MixerContext';

// Note: Commenting out WorkstationProvider for now since it's in the main src, not workstation/frontend/src
// import { WorkstationProvider } from '../../../src/contexts/WorkstationContext';

// Mock electron utils if not already mocked
vi.mock('../services/electron/utils', () => ({
  electronAPI: {
    showSaveDialog: vi.fn().mockResolvedValue({ canceled: false, filePath: '/path/to/save/project.json' }),
    showOpenDialog: vi.fn().mockResolvedValue({ canceled: false, filePaths: ['/path/to/file.wav'] }),
    writeFile: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue('{"name": "Test Project", "tracks": []}'),
    getAppVersion: vi.fn().mockResolvedValue('1.0.0'),
    getPlatform: vi.fn().mockReturnValue('darwin'),
    openFile: vi.fn().mockResolvedValue({ filePath: '/path/to/file.wav' }),
    openDirectory: vi.fn().mockResolvedValue({ dirPath: '/path/to/directory' }),
    saveFile: vi.fn().mockResolvedValue({ filePath: '/path/to/saved/file.wav' }),
    quitApp: vi.fn(),
  },
  openContextMenu: vi.fn(),
  isElectron: vi.fn().mockReturnValue(false),
}));

// Mock storage clients
vi.mock('../services/storage/ipfsClient', () => ({
  IPFSClient: {
    uploadBuffer: vi.fn().mockResolvedValue({
      cid: 'Qm123456789abcdef',
      url: 'https://ipfs.io/ipfs/Qm123456789abcdef',
    }),
    uploadFile: vi.fn().mockResolvedValue({
      cid: 'Qm123456789abcdef',
      url: 'https://ipfs.io/ipfs/Qm123456789abcdef',
    }),
  },
}));

vi.mock('../services/storage/cloudStorageClient', () => ({
  CloudStorageClient: {
    uploadBuffer: vi.fn().mockResolvedValue({
      id: 'clip-123',
      url: 'https://storage.example.com/audio/file.wav',
      size: 12345,
    }),
    uploadFile: vi.fn().mockResolvedValue({
      id: 'clip-123',
      url: 'https://storage.example.com/audio/file.wav',
      size: 12345,
    }),
  },
}));

// Mock audio context utils
vi.mock('../services/utils/audio', () => ({
  audioContext: {
    createGain: vi.fn().mockReturnValue({
      connect: vi.fn(),
      gain: { value: 1 },
    }),
    createStereoPanner: vi.fn().mockReturnValue({
      connect: vi.fn(),
      pan: { value: 0 },
    }),
    destination: { connect: vi.fn() },
    sampleRate: 44100,
    currentTime: 0,
  },
}));

// Comprehensive test wrapper with essential providers
interface TestWrapperProps {
  children: React.ReactNode;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => (
  <MixerProvider>
    <DAWProvider>
      {children}
    </DAWProvider>
  </MixerProvider>
);

// Custom render function that includes all providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: TestWrapper, ...options });
};

// Export everything from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };
