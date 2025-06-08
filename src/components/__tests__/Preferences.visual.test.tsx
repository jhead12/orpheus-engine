import { describe, it, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import Preferences from "../Preferences";
import { expectScreenshot } from "@orpheus/test/helpers/screenshot";
import { PreferencesProvider } from "../../contexts/PreferencesContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Create a theme for visual testing
const visualTestTheme = createTheme({
  palette: {
    mode: "light",
  },
});

describe("Preferences Visual Tests", () => {
  const isCI = process.env.CI === 'true';
  const isCodespaces = process.env.CODESPACES === 'true';
  const hasDisplay = process.env.DISPLAY || process.env.WAYLAND_DISPLAY;
  const shouldSkipVisualTests = isCI || isCodespaces || !hasDisplay;

  // Mock preferences context values
  const mockPreferences = {
    theme: "dark" as const,
    color: "rose" as const,
    audio: {
      inputDevice: "default",
      outputDevice: "default",
      sampleRate: 44100,
      bufferSize: 1024,
      bitDepth: 24,
      monitorInput: false,
    },
    midi: {
      inputDevice: "default",
      outputDevice: "default",
      clockSync: false,
      midiThru: false,
    },
    interface: {
      timeDisplayFormat: "measures" as const,
      showMasterTrack: true,
      showAutomationLanes: true,
      snapToGrid: true,
      autoScroll: true,
    },
    recording: {
      countIn: false,
      countInBars: 2,
      preRoll: false,
      preRollTime: 1000,
      autoArm: false,
    },
    plugins: {
      vstPath: "",
      auPath: "",
      scanOnStartup: true,
      enableBridging: true,
    },
  };

  const TestWrapper = ({ children, showPreferences = true }: { children: React.ReactNode; showPreferences?: boolean }) => {
    const mockUsePreferences = vi.fn(() => ({
      preferences: mockPreferences,
      savedPreferences: mockPreferences,
      showPreferences,
      setShowPreferences: vi.fn(),
      updatePreferences: vi.fn(),
      savePreferences: vi.fn(),
    }));

    // Mock the usePreferences hook
    vi.doMock("../../contexts/PreferencesContext", () => ({
      usePreferences: mockUsePreferences,
      PreferencesProvider: ({ children }: { children: React.ReactNode }) => children,
    }));

    return (
      <ThemeProvider theme={visualTestTheme}>
        <PreferencesProvider>
          {children}
        </PreferencesProvider>
      </ThemeProvider>
    );
  };

  const createVisualTestContainer = (theme: "light" | "dark" = "light", color = "rose") => {
    const container = document.createElement("div");
    container.style.cssText = `
      width: 800px;
      height: 700px;
      background: ${theme === "dark" ? "#111" : "#f7f7f7"};
      position: relative;
      font-family: 'Manrope', 'Roboto', sans-serif;
    `;
    
    // Apply theme and color attributes
    container.setAttribute("data-theme", theme);
    container.setAttribute("data-color", color);
    
    document.body.appendChild(container);
    return container;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Preferences dialog in light theme @visual", async () => {
    if (shouldSkipVisualTests) {
      console.warn('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }

    const container = createVisualTestContainer("light", "rose");

    try {
      render(
        <TestWrapper>
          <Preferences />
        </TestWrapper>,
        { container }
      );

      // Wait for dialog to render
      await new Promise(resolve => setTimeout(resolve, 200));
      await expectScreenshot(container, "preferences-light-theme");
    } catch (error) {
      console.warn("Visual test failed:", error);
      if (!isCI && !isCodespaces) {
        throw error;
      }
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  });

  it("renders Preferences dialog in dark theme @visual", async () => {
    if (shouldSkipVisualTests) {
      console.warn('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }

    const container = createVisualTestContainer("dark", "rose");

    try {
      render(
        <TestWrapper>
          <Preferences />
        </TestWrapper>,
        { container }
      );

      // Wait for dialog to render
      await new Promise(resolve => setTimeout(resolve, 200));
      await expectScreenshot(container, "preferences-dark-theme");
    } catch (error) {
      console.warn("Visual test failed:", error);
      if (!isCI && !isCodespaces) {
        throw error;
      }
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  });

  it("renders Preferences dialog with different color schemes @visual", async () => {
    if (shouldSkipVisualTests) {
      console.warn('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }

    const colorSchemes = ["azure", "aqua", "crimson", "olive", "violet", "citrus"];

    for (const color of colorSchemes) {
      const container = createVisualTestContainer("light", color);

      try {
        render(
          <TestWrapper>
            <Preferences />
          </TestWrapper>,
          { container }
        );

        // Wait for dialog to render
        await new Promise(resolve => setTimeout(resolve, 200));
        await expectScreenshot(container, `preferences-${color}-color-scheme`);
      } catch (error) {
        console.warn(`Visual test failed for ${color} color scheme:`, error);
        if (!isCI && !isCodespaces) {
          throw error;
        }
      } finally {
        if (container.parentNode) {
          document.body.removeChild(container);
        }
      }
    }
  });

  it("renders Preferences dialog with Audio tab selected @visual", async () => {
    if (shouldSkipVisualTests) {
      console.warn('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }

    const container = createVisualTestContainer("light", "rose");

    try {
      const { container: renderContainer } = render(
        <TestWrapper>
          <Preferences />
        </TestWrapper>,
        { container }
      );

      // Wait for dialog to render
      await new Promise(resolve => setTimeout(resolve, 200));

      // Click on Audio tab
      const audioTab = renderContainer.querySelector('li:contains("Audio")') || 
                      Array.from(renderContainer.querySelectorAll('li')).find(el => el.textContent === 'Audio');
      if (audioTab) {
        fireEvent.click(audioTab);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await expectScreenshot(container, "preferences-audio-tab");
    } catch (error) {
      console.warn("Visual test failed:", error);
      if (!isCI && !isCodespaces) {
        throw error;
      }
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  });

  it("renders Preferences dialog with General tab selected @visual", async () => {
    if (shouldSkipVisualTests) {
      console.warn('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }

    const container = createVisualTestContainer("light", "rose");

    try {
      const { container: renderContainer } = render(
        <TestWrapper>
          <Preferences />
        </TestWrapper>,
        { container }
      );

      // Wait for dialog to render
      await new Promise(resolve => setTimeout(resolve, 200));

      // Click on General tab
      const generalTab = renderContainer.querySelector('li:contains("General")') || 
                        Array.from(renderContainer.querySelectorAll('li')).find(el => el.textContent === 'General');
      if (generalTab) {
        fireEvent.click(generalTab);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await expectScreenshot(container, "preferences-general-tab");
    } catch (error) {
      console.warn("Visual test failed:", error);
      if (!isCI && !isCodespaces) {
        throw error;
      }
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  });

  it("renders Preferences dialog with MIDI tab selected @visual", async () => {
    if (shouldSkipVisualTests) {
      console.warn('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }

    const container = createVisualTestContainer("dark", "azure");

    try {
      const { container: renderContainer } = render(
        <TestWrapper>
          <Preferences />
        </TestWrapper>,
        { container }
      );

      // Wait for dialog to render
      await new Promise(resolve => setTimeout(resolve, 200));

      // Click on MIDI tab
      const midiTab = renderContainer.querySelector('li:contains("MIDI")') || 
                     Array.from(renderContainer.querySelectorAll('li')).find(el => el.textContent === 'MIDI');
      if (midiTab) {
        fireEvent.click(midiTab);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await expectScreenshot(container, "preferences-midi-tab-dark");
    } catch (error) {
      console.warn("Visual test failed:", error);
      if (!isCI && !isCodespaces) {
        throw error;
      }
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  });

  it("renders Preferences dialog with theme selection highlighted @visual", async () => {
    if (shouldSkipVisualTests) {
      console.warn('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }

    const container = createVisualTestContainer("light", "violet");

    try {
      const { container: renderContainer } = render(
        <TestWrapper>
          <Preferences />
        </TestWrapper>,
        { container }
      );

      // Wait for dialog to render
      await new Promise(resolve => setTimeout(resolve, 200));

      // Click on the Light theme radio button to highlight it
      const lightThemeRadio = renderContainer.querySelector('input[value="light"]');
      if (lightThemeRadio) {
        fireEvent.click(lightThemeRadio);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await expectScreenshot(container, "preferences-theme-selection");
    } catch (error) {
      console.warn("Visual test failed:", error);
      if (!isCI && !isCodespaces) {
        throw error;
      }
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  });

  it("renders Preferences dialog with save notification @visual", async () => {
    if (shouldSkipVisualTests) {
      console.warn('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }

    const container = createVisualTestContainer("light", "crimson");

    try {
      // Mock the preferences to show the saved state
      const mockUsePrefWithSaved = vi.fn(() => ({
        preferences: mockPreferences,
        savedPreferences: mockPreferences,
        showPreferences: true,
        setShowPreferences: vi.fn(),
        updatePreferences: vi.fn(),
        savePreferences: vi.fn(),
      }));

      vi.doMock("../../contexts/PreferencesContext", () => ({
        usePreferences: mockUsePrefWithSaved,
        PreferencesProvider: ({ children }: { children: React.ReactNode }) => children,
      }));

      const { container: renderContainer } = render(
        <TestWrapper>
          <Preferences />
        </TestWrapper>,
        { container }
      );

      // Wait for dialog to render
      await new Promise(resolve => setTimeout(resolve, 200));

      // Click Apply button to trigger save notification
      const applyButton = renderContainer.querySelector('button:contains("Apply")') || 
                         Array.from(renderContainer.querySelectorAll('button')).find(el => el.textContent === 'Apply');
      if (applyButton) {
        fireEvent.click(applyButton);
        await new Promise(resolve => setTimeout(resolve, 300)); // Wait for snackbar animation
      }

      await expectScreenshot(container, "preferences-save-notification");
    } catch (error) {
      console.warn("Visual test failed:", error);
      if (!isCI && !isCodespaces) {
        throw error;
      }
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  });

  it("renders closed Preferences dialog state @visual", async () => {
    if (shouldSkipVisualTests) {
      console.warn('Skipping visual test in CI/Codespaces/headless environment');
      return;
    }

    const container = createVisualTestContainer("light", "rose");

    try {
      render(
        <TestWrapper showPreferences={false}>
          <Preferences />
        </TestWrapper>,
        { container }
      );

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));
      await expectScreenshot(container, "preferences-closed-state");
    } catch (error) {
      console.warn("Visual test failed:", error);
      if (!isCI && !isCodespaces) {
        throw error;
      }
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  });
});
