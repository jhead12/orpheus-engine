import { test, expect, Page } from '@playwright/test';

/**
 * Visual tests for the Mixer component
 * Tests various mixer states and interactions with visual regression testing
 */

// Helper function to set up mixer test environment
async function setupMixerTest(page: Page) {
  await page.goto('/mixer-test');
  await page.waitForSelector('[data-testid="mixer-channel-track-1"]');
}

test.describe('Mixer Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up consistent viewport for visual tests
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test('should render default mixer layout', async ({ page }) => {
    await setupMixerTest(page);
    
    // Take a screenshot of the default mixer state
    await expect(page.locator('[data-testid="main-mixer"]')).toHaveScreenshot('mixer-default-layout.png');
  });

  test('should show mute/solo/arm states visually', async ({ page }) => {
    await setupMixerTest(page);
    
    // Click mute on track 1
    await page.click('[data-testid="mixer-mute-track-1"]');
    await page.waitForTimeout(100); // Allow for animation
    
    // Click solo on track 2
    await page.click('[data-testid="mixer-solo-track-2"]');
    await page.waitForTimeout(100);
    
    // Take screenshot with mute/solo states
    await expect(page.locator('[data-testid="main-mixer"]')).toHaveScreenshot('mixer-mute-solo-states.png');
  });

  test('should show volume fader movement with animation', async ({ page }) => {
    await setupMixerTest(page);
    
    const volumeFader = page.locator('[data-testid="mixer-volume-track-1"]');
    
    // Start recording the volume fader movement
    await page.video()?.saveAs('test-results/mixer-volume-fader-movement.webm');
    
    // Move the volume fader from top to bottom
    const faderBounds = await volumeFader.boundingBox();
    if (faderBounds) {
      // Click and drag the fader down
      await page.mouse.move(faderBounds.x + faderBounds.width / 2, faderBounds.y + 10);
      await page.mouse.down();
      await page.mouse.move(faderBounds.x + faderBounds.width / 2, faderBounds.y + faderBounds.height - 10, { steps: 20 });
      await page.mouse.up();
    }
    
    // Take screenshot of the final state
    await expect(page.locator('[data-testid="main-mixer"]')).toHaveScreenshot('mixer-volume-moved.png');
  });

  test('should show pan knob rotation animation', async ({ page }) => {
    await setupMixerTest(page);
    
    const panKnob = page.locator('[data-testid="mixer-pan-track-1"]');
    
    // Create animated GIF of pan knob rotation
    const frames: Buffer[] = [];
    
    for (let i = 0; i <= 10; i++) {
      // Set pan value from -1 to 1
      const panValue = -1 + (i / 5);
      await page.evaluate((value) => {
        const knob = document.querySelector('[data-testid="mixer-pan-track-1"]') as HTMLInputElement;
        if (knob) {
          knob.value = value.toString();
          knob.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, panValue);
      
      await page.waitForTimeout(50);
      const screenshot = await panKnob.screenshot();
      frames.push(screenshot);
    }
    
    // Save the animation frames for GIF creation
    await page.evaluate((frameData) => {
      // Store frame data for GIF creation in post-processing
      (window as any).panKnobFrames = frameData;
    }, frames.map(f => f.toString('base64')));
  });

  test('should show meter level animations', async ({ page }) => {
    await setupMixerTest(page);
    
    // Simulate meter level changes
    await page.evaluate(() => {
      // Mock changing meter levels
      const meterUpdate = setInterval(() => {
        const meters = document.querySelectorAll('[data-testid^="mixer-meter-"]');
        meters.forEach((meter, index) => {
          const level = Math.random() * 100;
          meter.setAttribute('aria-valuenow', level.toString());
          (meter as HTMLElement).style.setProperty('--meter-level', `${level}%`);
        });
      }, 50);
      
      // Stop after 2 seconds
      setTimeout(() => clearInterval(meterUpdate), 2000);
    });
    
    await page.waitForTimeout(2100);
    await expect(page.locator('[data-testid="main-mixer"]')).toHaveScreenshot('mixer-meter-levels.png');
  });

  test('should show effects chain visual updates', async ({ page }) => {
    await setupMixerTest(page);
    
    // Add an effect
    await page.click('[data-testid="mixer-add-effect-track-1"]');
    await page.click('text=Reverb');
    await page.waitForTimeout(200);
    
    // Take screenshot with new effect
    await expect(page.locator('[data-testid="mixer-effects-track-1"]')).toHaveScreenshot('mixer-effects-added.png');
    
    // Toggle effect bypass
    await page.click('[data-testid="effect-bypass-reverb-1"]');
    await page.waitForTimeout(100);
    
    // Take screenshot with effect bypassed
    await expect(page.locator('[data-testid="mixer-effects-track-1"]')).toHaveScreenshot('mixer-effects-bypassed.png');
  });

  test('should show track color indicators', async ({ page }) => {
    await setupMixerTest(page);
    
    // Verify track colors are visible
    await expect(page.locator('[data-testid="mixer-channel-track-1"]')).toHaveCSS('border-top-color', 'rgb(255, 107, 107)');
    await expect(page.locator('[data-testid="mixer-channel-track-2"]')).toHaveCSS('border-top-color', 'rgb(78, 205, 196)');
    
    // Take screenshot showing track colors
    await expect(page.locator('[data-testid="main-mixer"]')).toHaveScreenshot('mixer-track-colors.png');
  });

  test('should show responsive layout changes', async ({ page }) => {
    await setupMixerTest(page);
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-large' },
      { width: 1200, height: 800, name: 'desktop-medium' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(300); // Allow for layout changes
      
      await expect(page.locator('[data-testid="main-mixer"]')).toHaveScreenshot(`mixer-${viewport.name}.png`);
    }
  });

  test('should show drag and drop visual feedback', async ({ page }) => {
    await setupMixerTest(page);
    
    // Test dragging an effect within the effects chain
    const effect = page.locator('[data-testid="effect-reverb-1"]');
    const effectBounds = await effect.boundingBox();
    
    if (effectBounds) {
      // Start drag
      await page.mouse.move(effectBounds.x + effectBounds.width / 2, effectBounds.y + effectBounds.height / 2);
      await page.mouse.down();
      
      // Take screenshot during drag
      await expect(page.locator('[data-testid="mixer-effects-track-1"]')).toHaveScreenshot('mixer-effect-dragging.png');
      
      // Move to new position
      await page.mouse.move(effectBounds.x + effectBounds.width / 2, effectBounds.y + effectBounds.height + 50);
      
      // Take screenshot of drop target
      await expect(page.locator('[data-testid="mixer-effects-track-1"]')).toHaveScreenshot('mixer-effect-drop-target.png');
      
      await page.mouse.up();
    }
  });

  test('should show keyboard focus indicators', async ({ page }) => {
    await setupMixerTest(page);
    
    // Navigate with keyboard
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    // Take screenshot showing focus on first control
    await expect(page.locator('[data-testid="main-mixer"]')).toHaveScreenshot('mixer-keyboard-focus-1.png');
    
    // Navigate to next control
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    await expect(page.locator('[data-testid="main-mixer"]')).toHaveScreenshot('mixer-keyboard-focus-2.png');
  });

  test('should show accessibility states', async ({ page }) => {
    await setupMixerTest(page);
    
    // Enable high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(200);
    
    await expect(page.locator('[data-testid="main-mixer"]')).toHaveScreenshot('mixer-dark-mode.png');
    
    // Test reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(200);
    
    await expect(page.locator('[data-testid="main-mixer"]')).toHaveScreenshot('mixer-reduced-motion.png');
  });
});

test.describe('Mixer Performance Tests', () => {
  test('should handle many tracks without visual glitches', async ({ page }) => {
    await page.goto('/mixer-stress-test'); // Page with many tracks
    await page.waitForSelector('[data-testid="mixer-channel-track-50"]', { timeout: 10000 });
    
    // Scroll through all tracks
    await page.locator('[data-testid="main-mixer"]').scrollIntoView();
    
    // Take screenshot of many tracks
    await expect(page.locator('[data-testid="main-mixer"]')).toHaveScreenshot('mixer-many-tracks.png');
  });

  test('should maintain smooth animations under load', async ({ page }) => {
    await setupMixerTest(page);
    
    // Start multiple animations simultaneously
    await page.evaluate(() => {
      // Simulate multiple fader movements
      const faders = document.querySelectorAll('[data-testid^="mixer-volume-"]');
      faders.forEach((fader, index) => {
        const element = fader as HTMLInputElement;
        let direction = 1;
        let value = 0.5;
        
        const animate = () => {
          value += direction * 0.01;
          if (value >= 1) direction = -1;
          if (value <= 0) direction = 1;
          
          element.value = value.toString();
          element.dispatchEvent(new Event('change', { bubbles: true }));
          
          requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
      });
    });
    
    await page.waitForTimeout(3000);
    
    // Take screenshot after stress test
    await expect(page.locator('[data-testid="main-mixer"]')).toHaveScreenshot('mixer-animation-stress.png');
  });
});
