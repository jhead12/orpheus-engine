// Helper file to fix the peak display test in WorkstationMixer tests
import { screen, waitFor } from '@testing-library/react';

/**
 * Helper function to find peak display elements in various ways
 */
export async function findPeakDisplays() {
  // Try multiple ways to find peak display elements
  try {
    // First try by direct text content
    const byText = screen.getAllByText('-∞');
    if (byText.length > 0) {
      return byText;
    }
  } catch (e) {
    // Element not found by text
  }
  
  try {
    // Try by className if the first method fails
    return Array.from(document.querySelectorAll('.peak-display'));
  } catch (e) {
    // Element not found by class
  }
  
  // Last resort - look for any elements that might be peak displays
  const meters = screen.queryAllByTestId('meter');
  const peakElements = [];
  
  meters.forEach(meter => {
    // Look for children that might be peak displays
    const children = Array.from(meter.children);
    children.forEach(child => {
      if (
        child.textContent && 
        (child.textContent === '-∞' || 
         child.textContent.includes('-∞') ||
         child.textContent.includes('Inf'))
      ) {
        peakElements.push(child);
      }
    });
  });
  
  return peakElements;
}

/**
 * Helper function to find knob elements in various ways
 */
export async function findKnobs() {
  try {
    // First try by testid
    const byTestId = screen.getAllByTestId('knob');
    if (byTestId.length > 0) {
      return byTestId;
    }
  } catch (e) {
    // Element not found by testid
  }
  
  try {
    // Try by role and label text containing pan
    return screen.getAllByRole('slider', { name: /pan/i });
  } catch (e) {
    // Not found by role+name
  }
  
  // Last resort - look for any inputs that might be knobs
  const inputs = Array.from(document.querySelectorAll('input[type="range"]'));
  return inputs.filter(input => {
    const title = input.getAttribute('title');
    return title && (title.includes('Pan') || title.toLowerCase().includes('pan'));
  });
}
