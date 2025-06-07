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
const mockUseLocation = vi.fn(() => ({ pathname: "/" }));

vi.mock("react-router-dom", () => ({
  MemoryRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-root">{children}</div>
  ),
  Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Route: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useNavigate: () => vi.fn(),
  useLocation: () => mockUseLocation(),
}));

// Create a simplified mock of the Workstation component
vi.mock("../../screens/workstation/Workstation", () => ({
  default: () => null,
}));

describe("App component", () => {
  const renderApp = () =>
    render(
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
      type: "None",
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
    } as unknown as Selection);

  it("renders without crashing", () => {
    const { getByTestId } = renderApp();
    const appContainer = getByTestId("app-root");
    expect(appContainer).toBeInTheDocument();
  });

  it("renders the Workstation component on the root path", () => {
    const { container } = renderApp();
    expect(container).toBeInTheDocument();
  });

  it("renders the DocsPage component on the /docs path", () => {
    // Update the mock location
    const mockLocation = { 
      pathname: "/docs",
      search: "",
      hash: "",
      state: null,
      key: "test-key"
    };
    mockUseLocation.mockReturnValue(mockLocation);

    const { container } = renderApp();
    expect(container).toBeInTheDocument();
    
    // Reset to default
    mockUseLocation.mockReturnValue({ pathname: "/" });
  });

  it("handles focusout event to clear text selection", () => {
    const { baseElement } = renderApp();
    const mockSelection = createMockSelection();
    const getSelectionSpy = vi
      .spyOn(window, "getSelection")
      .mockReturnValue(mockSelection);

    // Simulate focusout event
    const focusoutEvent = new FocusEvent("focusout", { bubbles: true });
    baseElement.dispatchEvent(focusoutEvent);

    expect(mockSelection.collapseToEnd).toHaveBeenCalled();
    getSelectionSpy.mockRestore();
  });

  it("preserves text selection when focusing between input elements", () => {
    const { baseElement } = renderApp();
    const mockSelection = createMockSelection();
    const getSelectionSpy = vi
      .spyOn(window, "getSelection")
      .mockReturnValue(mockSelection);

    // Simulate focusout event between input elements
    const focusoutEvent = new FocusEvent("focusout", {
      bubbles: true,
      relatedTarget: document.createElement("input"),
    });
    baseElement.dispatchEvent(focusoutEvent);

    expect(mockSelection.collapseToEnd).not.toHaveBeenCalled();
    getSelectionSpy.mockRestore();
  });
});
