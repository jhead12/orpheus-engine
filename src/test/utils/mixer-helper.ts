/**
 * Test Utilities for WorkstationMixer Tests
 * Helps attaching necessary data-testid attributes to mixer components
 */

/**
 * Attaches data-testid attributes to track name inputs and text nodes
 * This function should be called after the component mounts but before
 * assertions that rely on these attributes
 * 
 * @param containerElement The container element containing the mixer component
 * @param trackNames Array of expected track names (e.g., ['Vocals', 'Guitar', 'Master'])
 */
export function attachTestIds(containerElement: HTMLElement, trackNames: string[] = ['Vocals', 'Guitar', 'Master']): void {
  if (!containerElement) return;
  
  // Find all input elements that could be track names
  const nameInputs = containerElement.querySelectorAll('input.form-control');
  nameInputs.forEach((input) => {
    const inputElement = input as HTMLInputElement;
    if (trackNames.includes(inputElement.value)) {
      inputElement.setAttribute('data-testid', `track-name-input-${inputElement.value}`);
    }
  });
  
  // Find text nodes that could be track names (for Master track)
  const textElements = containerElement.querySelectorAll('div.text-center');
  textElements.forEach((element) => {
    const text = element.textContent?.trim();
    if (text && trackNames.includes(text)) {
      element.setAttribute('data-testid', `track-name-text-${text}`);
    }
  });
  
  // Find peak displays and attach testid
  const peakDisplays = containerElement.querySelectorAll('.peak-display');
  peakDisplays.forEach((peak, index) => {
    peak.setAttribute('data-testid', `peak-display-${index}`);
  });
  
  // Find knobs and attach testid
  const knobElements = containerElement.querySelectorAll('div[title^="Pan"]');
  knobElements.forEach((knob, index) => {
    const trackName = trackNames[index] || `track-${index}`;
    knob.setAttribute('data-testid', `knob-${trackName}`);
  });
}

/**
 * Logs the HTML structure of an element for debugging
 * @param containerElement Container element to log
 */
export function debugHTML(containerElement: HTMLElement): void {
  if (!containerElement) return;
  console.log('HTML STRUCTURE:', containerElement.outerHTML);
}
