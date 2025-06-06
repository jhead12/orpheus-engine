import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Preferences from '../Preferences';
import { usePreferences } from '../../context/PreferencesContext';

// Mock the usePreferences hook
jest.mock('../../context/PreferencesContext', () => ({
  usePreferences: jest.fn()
}));

describe('Preferences Component', () => {
  // Default mock values
  const mockPreferences = {
    theme: 'dark',
    color: 'rose',
    audio: {},
    midi: {},
    interface: {},
    recording: {},
    plugins: {}
  };
  
  const mockSetShowPreferences = jest.fn();
  const mockUpdatePreferences = jest.fn();
  const mockSavePreferences = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementation
    (usePreferences as jest.Mock).mockReturnValue({
      darkMode: false,
      preferences: mockPreferences,
      savedPreferences: mockPreferences,
      showPreferences: true,
      setShowPreferences: mockSetShowPreferences,
      updatePreferences: mockUpdatePreferences,
      savePreferences: mockSavePreferences,
    });
  });

  test('renders Preferences dialog when showPreferences is true', () => {
    render(<Preferences />);
    expect(screen.getByText('Preferences')).toBeInTheDocument();
  });

  test('does not render Preferences dialog when showPreferences is false', () => {
    // Override the mock for this test
    (usePreferences as jest.Mock).mockReturnValue({
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

  test('calls setShowPreferences(false) when Cancel button is clicked', () => {
    render(<Preferences />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockSetShowPreferences).toHaveBeenCalledWith(false);
  });

  test('calls savePreferences when Apply button is clicked', () => {
    render(<Preferences />);
    fireEvent.click(screen.getByText('Apply'));
    expect(mockSavePreferences).toHaveBeenCalled();
  });

  test('calls both savePreferences and setShowPreferences when OK button is clicked', () => {
    render(<Preferences />);
    
    // The OK button submits the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(mockSavePreferences).toHaveBeenCalled();
    expect(mockSetShowPreferences).toHaveBeenCalledWith(false);
  });

  test('shows tabs for different settings categories', () => {
    render(<Preferences />);
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
  });

  test('updates theme preference when a theme option is selected', () => {
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

  test('shows a snackbar notification when preferences are saved', () => {
    (usePreferences as jest.Mock).mockReturnValue({
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
    (usePreferences as jest.Mock).mockReturnValue({
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