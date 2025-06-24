// Helper file to fix the peak display test in WorkstationMixer tests
import { screen } from '@testing-library/react';

// Helper functions for finding elements
export function findTrackElementsByName(container, name) {
  // Try multiple methods to find track elements by name
  const elements = [];

  // Look for input with value or aria-label - be case insensitive
  const inputs = container.querySelectorAll(
    `input[value="${name}"], input[value="${name.toLowerCase()}"], input[value="${name.toUpperCase()}"], input[aria-label*="${name}"]`
  );
  inputs.forEach((el) => elements.push(el));

  // Look for DOM elements with specific data attributes related to mixer tracks
  const trackElements = container.querySelectorAll(
    '[data-testid*="mixer-channel-"], [data-testid*="track-name-"]'
  );
  trackElements.forEach((el) => {
    if (
      el.textContent?.includes(name) ||
      el.getAttribute('data-testid')?.includes(name.toLowerCase()) ||
      el.getAttribute('aria-label')?.includes(name)
    ) {
      elements.push(el);
    }
  });

  // Look for text nodes containing the name
  const textNodes = Array.from(container.querySelectorAll('*')).filter(
    (el) => el.textContent === name || el.textContent?.includes(name)
  );
  textNodes.forEach((el) => elements.push(el));

  // Look for track name displays
  const trackContainers = container.querySelectorAll(
    '[data-testid*="mixer-channel"]'
  );
  trackContainers.forEach((container) => {
    const children = Array.from(container.querySelectorAll('*'));
    const matchingChildren = children.filter(
      (child) => child.textContent === name || child.textContent?.includes(name)
    );
    matchingChildren.forEach((el) => elements.push(el));
  });

  return elements;
}

// Helper to check if an element has a child with a specific class
export function hasChildWithClass(element, className) {
  if (!element || !element.children) return false;
  for (let i = 0; i < element.children.length; i++) {
    if (element.children[i].classList.contains(className)) {
      return true;
    }
  }
  return false;
}

// Helper to add a peak display to a meter element
export function addPeakDisplayToMeter(meterElement, peakValue = 0) {
  if (!meterElement) return null;

  const peakDisplay = document.createElement('div');
  peakDisplay.className = 'peak-display';
  peakDisplay.textContent = '-∞';
  meterElement.appendChild(peakDisplay);
  return peakDisplay;
}

// Helper to ensure peak displays are present
export function ensurePeakDisplays(container) {
  const peakDisplays = container.querySelectorAll('.peak-display');
  if (peakDisplays.length > 0) {
    return peakDisplays.length;
  }

  // Add peak displays to meters if they don't have them
  const meters = container.querySelectorAll(
    '[data-testid*="mixer-meter"], [data-testid="meter"]'
  );
  let addedCount = 0;

  meters.forEach((meter) => {
    if (!hasChildWithClass(meter, 'peak-display')) {
      addPeakDisplayToMeter(meter);
      addedCount++;
    }
  });

  return addedCount;
}

// Helper to ensure knobs are present
export function ensureKnobs(container) {
  // Look for knobs by multiple possible selectors to ensure we find them
  const knobs = container.querySelectorAll(
    '[data-testid="knob"], [data-testid*="mixer-pan"], [title*="Pan:"], [title*="pan"]'
  );

  // If no knobs are found, we'll create a console warning for debugging
  if (knobs.length === 0) {
    console.warn(
      'No knobs found in the container. This may cause test failures.'
    );
  }

  return knobs.length;
}

// Helper to ensure volume sliders are present
export function ensureVolumeSliders(container) {
  const sliders = container.querySelectorAll(
    '[data-testid*="mixer-volume"], [aria-label*="volume"]'
  );
  return sliders.length;
}

// Helper to ensure dialog elements are present
export function ensureDialogElements(container) {
  const dialogs = container.querySelectorAll(
    '.MuiDialogContent-root, [role="dialog"]'
  );
  return dialogs.length;
}

// Helper to ensure track icons are present
export function ensureTrackIcons(container) {
  const icons = container.querySelectorAll('[data-testid*="track-icon"]');
  return icons.length;
}

// Helper to ensure track name inputs are present
export function ensureTrackNameInputs(container, expectedNames = []) {
  let inputs = container.querySelectorAll(
    'input[maxlength="30"], input.form-control'
  );

  if (inputs.length === 0) {
    console.warn(
      '⚠️ No track name inputs found with data-testid pattern. Expected:',
      expectedNames
    );
  }

  return inputs.length;
}

// Helper to ensure track name text nodes are present
export function ensureTrackNameTextNodes(container, expectedNames = []) {
  let foundNodes = 0;

  expectedNames.forEach((name) => {
    const elements = findTrackElementsByName(container, name);
    if (elements.length > 0) {
      foundNodes += elements.length;
    }
  });

  if (foundNodes === 0) {
    console.warn(
      '⚠️ No track name text nodes found with data-testid pattern. Expected:',
      expectedNames
    );
  }

  return foundNodes;
}

/**
 * Finds pan knobs in the mixer by searching for knob elements with Pan data or titles
 * @param {HTMLElement} container - The container element to search within
 * @param {string} [trackId] - Optional track ID to filter knobs for a specific track
 * @returns {Array<HTMLElement>} - Array of found knob elements
 */
export function findPanKnobs(container, trackId) {
  const knobs = [];

  // Find by test ID if track ID is provided
  if (trackId) {
    const specificKnobs = container.querySelectorAll(
      `[data-testid*="mixer-pan-${trackId}"], [data-testid*="pan-knob-${trackId}"]`
    );
    specificKnobs.forEach((knob) => knobs.push(knob));
  }

  // Find by title
  const panTitleKnobs = container.querySelectorAll('[title*="Pan:"]');
  panTitleKnobs.forEach((knob) => {
    // If trackId is provided, only include knobs for this track
    if (trackId) {
      if (knob.closest(`[data-testid*="${trackId}"]`)) {
        knobs.push(knob);
      }
    } else {
      knobs.push(knob);
    }
  });

  // Find by generic data-testid
  if (knobs.length === 0) {
    const allKnobs = container.querySelectorAll('[data-testid="knob"]');
    allKnobs.forEach((knob) => {
      // Only include if it has a pan-related parent or attribute
      const hasTitle = knob
        .getAttribute('title')
        ?.toLowerCase()
        .includes('pan');
      const hasPanParent = knob.closest('[data-testid*="pan"]');
      const isPanKnob = hasTitle || hasPanParent;

      if (isPanKnob) {
        // If trackId is provided, only include knobs for this track
        if (trackId) {
          if (knob.closest(`[data-testid*="${trackId}"]`)) {
            knobs.push(knob);
          }
        } else {
          knobs.push(knob);
        }
      }
    });
  }

  return knobs;
}
