import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Preferences from '../Preferences';

// Create a mock function for usePreferences
const mockUsePreferences = vi.fn();

// Mock the module
vi.mock('../../context/PreferencesContext', () => ({
  usePreferences: () => mockUsePreferences()
}));

describe('Preferences Component', () => {
  const mockPreferences = {
    theme: 'dark',
    color: 'rose',
    audio: {},
    midi: {},
    interface: {},
    recording: {},
    plugins: {}
  };

  const mockSetShowPreferences = vi.fn();
  const mockUpdatePreferences = vi.fn();
  const mockSavePreferences = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation for each test
    mockUsePreferences.mockReturnValue({
      darkMode: false,
      preferences: mockPreferences,
      savedPreferences: mockPreferences,
      showPreferences: true,
      setShowPreferences: mockSetShowPreferences,
      updatePreferences: mockUpdatePreferences,
      savePreferences: mockSavePreferences
    });
    
    // Reset the mock implementation for each test
    mockUsePreferences.mockReturnValue({
      darkMode: false,
      preferences: mockPreferences,
      savedPreferences: mockPreferences,
      showPreferences: true,
      setShowPreferences: mockSetShowPreferences,
      updatePreferences: mockUpdatePreferences,
      savePreferences: mockSavePreferences,
    });
  });

  it('renders Preferences dialog when showPreferences is true', () => {
    render(<Preferences />);
    expect(screen.getByText('Preferences')).toBeInTheDocument();
  });

  it('does not render Preferences dialog when showPreferences is false', () => {
    // Override the mock for this test
    mockUsePreferences.mockReturnValue({
      darkMode: false,
      preferences: mockPreferences,
      savedPreferences: mockPreferences,
      showPreferences: false,
      setShowPreferences: mockSetShowPreferences,
      updatePreferences: mockUpdatePreferences,
      savePreferences: mockSavePreferences,
    });
    
    render(<Preferences />);
    expect(screen.queryByText('Preferences')).not.toBeInTheDocument();
  });

  it('calls setShowPreferences(false) when Cancel button is clicked', () => {
    render(<Preferences />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockSetShowPreferences).toHaveBeenCalledWith(false);
  });

  it('calls savePreferences when Apply button is clicked', () => {
    render(<Preferences />);
    fireEvent.click(screen.getByText('Apply'));
    expect(mockSavePreferences).toHaveBeenCalled();
  });

  it('calls both savePreferences and setShowPreferences when OK button is clicked', () => {
    render(<Preferences />);
    
    // Click the OK button directly instead of submitting the form
    const okButton = screen.getByText('OK');
    fireEvent.click(okButton);
    
    expect(mockSavePreferences).toHaveBeenCalled();
    expect(mockSetShowPreferences).toHaveBeenCalledWith(false);
  });

  it('shows tabs for different settings categories', () => {
    render(<Preferences />);
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
  });

  it('updates theme preference when a theme option is selected', () => {
    render(<Preferences />);
    
    // Assuming the radio buttons have value attributes matching the theme names
    const lightThemeOption = screen.getByLabelText('Light');
    
    fireEvent.click(lightThemeOption);
    
    expect(mockUpdatePreferences).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'light'
      })
    );
  });

  it('shows a snackbar notification when preferences are saved', () => {
    mockUsePreferences.mockReturnValue({
      darkMode: false,
      preferences: mockPreferences,
      savedPreferences: mockPreferences,
      showPreferences: true,
      setShowPreferences: mockSetShowPreferences,
      updatePreferences: mockUpdatePreferences,
      savePreferences: mockSavePreferences,
    });
    
    const { rerender } = render(<Preferences />);
    
    fireEvent.click(screen.getByText('Apply'));
    
    // Update the component with the saved state
    mockUsePreferences.mockReturnValue({
      darkMode: false,
      preferences: mockPreferences,
      savedPreferences: mockPreferences,
      showPreferences: true,
      setShowPreferences: mockSetShowPreferences,
      updatePreferences: mockUpdatePreferences,
      savePreferences: mockSavePreferences,
    });
    
    rerender(<Preferences />);
    
    expect(screen.getByText('Changes saved')).toBeInTheDocument();
  });
});