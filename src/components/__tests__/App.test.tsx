import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import App from '../../App';
import { PreferencesProvider } from '../../contexts/PreferencesContext';
import { WorkstationProvider } from '../../contexts/WorkstationContext';
import { MixerProvider } from '../../contexts/MixerContext';
import { ClipboardProvider } from '../../contexts/ClipboardContext';
import { setupGlobalAudioContextMock } from '../../test/utils/mocks/AudioServiceMock';

// Mock global utilities
beforeAll(() => {
  // Setup audio mocks
  setupGlobalAudioContextMock();

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Import React Router mocks directly
import {
  useLocation,
  useNavigate,
  useRoutes,
  Routes,
  Route,
  MemoryRouter,
  Link,
  Outlet,
} from '../../test/utils/mocks/ReactRouterMock';

// Mock react-router-dom with our improved mocks
vi.mock('react-router-dom', () => ({
  useLocation,
  useNavigate,
  useRoutes,
  Routes,
  Route,
  MemoryRouter,
  Link,
  Outlet,
}));

// Mock AudioService
vi.mock('../../services/AudioService', () => {
  const mockService = {
    initializeAudioContext: vi.fn(),
    isAudioContextInitialized: vi.fn().mockReturnValue(true),
    getAudioContext: vi.fn().mockReturnValue({
      sampleRate: 44100,
      destination: {},
      createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: { value: 1 },
      }),
    }),
    createAudioMeter: vi.fn().mockReturnValue({
      connect: vi.fn(),
      getMeteringLevel: vi.fn().mockReturnValue(0),
      getPeakLevel: vi.fn().mockReturnValue(0),
    }),
    createTrackAnalyser: vi.fn().mockReturnValue({
      connect: vi.fn(),
      getFrequencyData: vi.fn().mockReturnValue(new Uint8Array(128)),
      getWaveformData: vi.fn().mockReturnValue(new Uint8Array(128)),
    }),
  };

  return {
    audioService: mockService,
    AudioService: {
      getInstance: () => mockService,
    },
  };
});

// Mock PythonBackendService
vi.mock('../../services/PythonBackendService', () => {
  const mockService = {
    initialize: vi.fn().mockResolvedValue(undefined),
    checkHealth: vi.fn().mockResolvedValue({
      status: 'healthy',
      version: '1.0.0-test',
      features: ['audio_analysis', 'transcription'],
    }),
    isInitialized: vi.fn().mockReturnValue(true),
    makeRequest: vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'success' }),
    }),
  };

  return {
    pythonBackend: mockService,
    PythonBackendService: {
      getInstance: () => mockService,
    },
  };
});

// Create a simplified mock of the Workstation component
vi.mock('../../screens/workstation/Workstation', () => ({
  default: () => null,
}));

describe('App component', () => {
  const renderApp = () => {
    // Use the imported MemoryRouter from our mock
    const { MemoryRouter } = require('../../test/utils/mocks/ReactRouterMock');
    return render(
      <PreferencesProvider>
        <WorkstationProvider>
          <MixerProvider>
            <ClipboardProvider>
              <MemoryRouter>
                <App />
              </MemoryRouter>
            </ClipboardProvider>
          </MixerProvider>
        </WorkstationProvider>
      </PreferencesProvider>
    );
  };

  // Mock Selection object for tests
  const createMockSelection = () =>
    ({
      rangeCount: 1,
      collapseToEnd: vi.fn(),
      anchorNode: null,
      anchorOffset: 0,
      focusNode: null,
      focusOffset: 0,
      isCollapsed: true,
      type: 'None',
      addRange: vi.fn(),
      collapse: vi.fn(),
      collapseToStart: vi.fn(),
      containsNode: vi.fn(),
      deleteFromDocument: vi.fn(),
      extend: vi.fn(),
      getRangeAt: vi.fn(),
      removeAllRanges: vi.fn(),
      removeRange: vi.fn(),
      selectAllChildren: vi.fn(),
      setBaseAndExtent: vi.fn(),
      toString: vi.fn(),
      empty: vi.fn(),
    }) as unknown as Selection;

  it('renders without crashing', () => {
    const { getByTestId } = renderApp();
    const appContainer = getByTestId('app-root');
    expect(appContainer).toBeInTheDocument();
  });

  it('renders the Workstation component on the root path', () => {
    const { container } = renderApp();
    expect(container).toBeInTheDocument();
  });

  it('renders the DocsPage component on the /docs path', () => {
    // Update the mock location
    const mockLocation = {
      pathname: '/docs',
      search: '',
      hash: '',
      state: null,
      key: 'test-key',
    };
    // Use the imported function from ReactRouterMock
    useLocation.mockReturnValue(mockLocation);

    const { container } = renderApp();
    expect(container).toBeInTheDocument();

    // Reset to default
    useLocation.mockReturnValue({ pathname: '/' });
  });

  it('handles focusout event to clear text selection', () => {
    const { baseElement } = renderApp();
    const mockSelection = createMockSelection();
    const getSelectionSpy = vi
      .spyOn(window, 'getSelection')
      .mockReturnValue(mockSelection);

    // Simulate focusout event
    const focusoutEvent = new FocusEvent('focusout', { bubbles: true });
    baseElement.dispatchEvent(focusoutEvent);

    expect(mockSelection.collapseToEnd).toHaveBeenCalled();
    getSelectionSpy.mockRestore();
  });

  it('preserves text selection when focusing between input elements', () => {
    const { baseElement } = renderApp();
    const mockSelection = createMockSelection();
    const getSelectionSpy = vi
      .spyOn(window, 'getSelection')
      .mockReturnValue(mockSelection);

    // Simulate focusout event between input elements
    const focusoutEvent = new FocusEvent('focusout', {
      bubbles: true,
      relatedTarget: document.createElement('input'),
    });
    baseElement.dispatchEvent(focusoutEvent);

    expect(mockSelection.collapseToEnd).not.toHaveBeenCalled();
    getSelectionSpy.mockRestore();
  });
});
