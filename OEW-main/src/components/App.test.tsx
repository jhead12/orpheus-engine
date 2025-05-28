import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock the Workstation component since we don't need its full functionality in this test
vi.mock('../screens/workstation/Workstation', () => ({
  default: () => <div>Workstation</div>
}));

// Mock all the providers that wrap the App component
vi.mock('../contexts/ClipboardProvider', () => ({
  ClipboardProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../contexts/WorkstationProvider', () => ({
  WorkstationProvider: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../components/settings/SettingsManager', () => ({
  default: ({ children }: { children: React.ReactNode }) => children
}));

vi.mock('../contexts/PreferencesProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => children
}));

describe('App component', () => {
  it('renders correctly', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Workstation/i)).toBeInTheDocument();
  });
});
