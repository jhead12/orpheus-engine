import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { PreferencesProvider } from '../contexts/PreferencesContext';

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

describe('App component', () => {
  it('renders correctly', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <PreferencesProvider>
          <App />
        </PreferencesProvider>
      </MemoryRouter>
    );
    const workstationElement = container.querySelector('div');
    expect(workstationElement).toHaveTextContent(/Workstation/i);
  });
});
