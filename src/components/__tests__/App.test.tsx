import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeAll } from "vitest";
import App from "../../App";
import { PreferencesProvider } from "../../context/PreferencesContext";
import { WorkstationProvider } from "../../context/WorkstationContext";
import { MixerProvider } from "../../context/MixerContext";
import { ClipboardProvider } from "../../context/ClipboardContext";

// Mock matchMedia
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
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

// Create a simplified mock of the router
vi.mock("react-router-dom", () => ({
  MemoryRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-root">{children}</div>
  ),
  Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Route: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Create a simplified mock of the Workstation component
vi.mock("../../screens/workstation/Workstation", () => ({
  default: () => null,
}));

describe("App component", () => {
  it("renders without crashing", () => {
    const { getByTestId } = render(
      <PreferencesProvider>
        <WorkstationProvider>
          <MixerProvider>
            <ClipboardProvider>
              <App />
            </ClipboardProvider>
          </MixerProvider>
        </WorkstationProvider>
      </PreferencesProvider>
    );

    // Just verify that the app container renders
    const appContainer = getByTestId("app-root");
    expect(appContainer).toBeInTheDocument();
  });
});
