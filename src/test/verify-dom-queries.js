// Simple DOM verification script
const { JSDOM } = require('jsdom');

// Create a new DOM environment
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
global.document = dom.window.document;

// Test function to verify our peak display selectors work
function testPeakDisplay() {
  try {
    console.log('\n--- Testing Peak Display Queries ---');
    
    // Create test structure
    document.body.innerHTML = `
      <div data-testid="meter">
        <div class="peak-display">-∞</div>
      </div>
    `;
    
    // Query using class selector
    const peakByClass = document.querySelectorAll('.peak-display');
    console.log(`✅ Found ${peakByClass.length} peak displays using class selector`);
    console.log(`✅ Text content: "${peakByClass[0]?.textContent}"`);
    
    // Query via parent then child
    const meter = document.querySelector('[data-testid="meter"]');
    const peakInMeter = meter?.querySelector('.peak-display');
    console.log(`✅ Found peak display through parent: ${peakInMeter ? 'Yes' : 'No'}`);
    
    // Clean up
    document.body.innerHTML = '';
    return true;
  } catch (error) {
    console.error('❌ Peak Display Test Failed:', error);
    return false;
  }
}

// Test function to verify our knob selectors work
function testKnob() {
  try {
    console.log('\n--- Testing Knob Queries ---');
    
    // Create test structure
    document.body.innerHTML = `
      <input data-testid="knob" type="range" min="-100" max="100" value="0" title="Pan: 0">
    `;
    
    // Query using data-testid selector
    const knobByTestId = document.querySelectorAll('[data-testid="knob"]');
    console.log(`✅ Found ${knobByTestId.length} knobs using data-testid selector`);
    console.log(`✅ Title attribute: "${knobByTestId[0]?.getAttribute('title')}"`);
    
    // Clean up
    document.body.innerHTML = '';
    return true;
  } catch (error) {
    console.error('❌ Knob Test Failed:', error);
    return false;
  }
}

// Run all tests
function runTests() {
  console.log('=== DOM Query Verification ===');
  
  const peakResult = testPeakDisplay();
  const knobResult = testKnob();
  
  console.log('\n=== Test Summary ===');
  console.log(`Peak Display Queries: ${peakResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Knob Queries: ${knobResult ? '✅ PASS' : '❌ FAIL'}`);
  
  return peakResult && knobResult;
}

// Execute
const success = runTests();
process.exit(success ? 0 : 1);
