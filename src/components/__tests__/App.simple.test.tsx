/**
 * Simple App Test
 * Simplified test without Router dependencies
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../../App';

// Mock the entire router module
vi.mock('react-router-dom', () => ({
  Routes: ({ children }: { children?: React.ReactNode }) => <div data-testid="mock-routes">{children}</div>,
  Route: () => <div data-testid="mock-route" />,
  MemoryRouter: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="mock-memory-router">{children}</div>
  ),
}));

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
  };

  return {
    pythonBackend: mockService,
    PythonBackendService: {
      getInstance: () => mockService,
    },
  };
});

// Mock the plugin system
vi.mock('../../plugins', () => ({
  pluginSystem: {
    initialize: vi.fn().mockResolvedValue(undefined),
    activatePlugin: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Simple App Test', () => {
  // Set up any global mocks before tests
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders with mock router', () => {
    render(<App />);

    // Check for mock router components
    expect(screen.getByTestId('mock-memory-router')).toBeInTheDocument();
    expect(screen.getByTestId('mock-routes')).toBeInTheDocument();
  });
});
