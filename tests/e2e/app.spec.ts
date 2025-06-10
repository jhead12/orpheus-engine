import { test, expect } from '@playwright/test';

// Basic test to ensure the app loads
test('homepage loads successfully', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');
  
  // Make sure the page loaded
  await expect(page).toHaveTitle(/Orpheus/);
});

// Test to check for basic DAW interface elements
test('DAW interface shows key components', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');
  
  // Wait for the app to initialize
  await page.waitForLoadState('networkidle');
  
  // Check for main interface elements - adjust selectors based on your actual UI
  const trackArea = await page.getByTestId('track-area').isVisible();
  expect(trackArea).toBeTruthy();
  
  // Check for mixer presence
  const mixer = await page.getByTestId('mixer').isVisible();
  expect(mixer).toBeTruthy();
  
  // Verify transport controls
  const playButton = await page.getByTestId('play-button').isVisible();
  expect(playButton).toBeTruthy();
  
  // Ensure we can interact with the UI
  await page.getByTestId('play-button').click();
  
  // Verify the play state changed
  const isPlaying = await page.getByTestId('transport-controls').getAttribute('data-playing');
  expect(isPlaying).toBe('true');
});

// Test track creation functionality
test('can add a new track', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');
  
  // Wait for the app to initialize
  await page.waitForLoadState('networkidle');
  
  // Count initial number of tracks
  const initialTrackCount = await page.getByTestId('track-item').count();
  
  // Click the "Add Track" button
  await page.getByTestId('add-track-button').click();
  
  // Select audio track from the menu
  await page.getByTestId('audio-track-option').click();
  
  // Verify a new track was added
  const newTrackCount = await page.getByTestId('track-item').count();
  expect(newTrackCount).toBe(initialTrackCount + 1);
});
