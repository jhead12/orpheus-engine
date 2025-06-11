// Basic verification script to confirm our DOM queries will work
const { JSDOM } = require('jsdom');

// Set up a simple DOM
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div data-testid="meter">
        <div class="peak-display">-∞</div>
      </div>
      <input data-testid="knob" type="range" value="0" title="Pan: 0">
    </body>
  </html>
`);

// Get the document
const document = dom.window.document;

// Test for peak display
const peakDisplays = document.querySelectorAll('.peak-display');
console.log('PEAK DISPLAY TEST:');
console.log(`Found ${peakDisplays.length} peak displays`);
if (peakDisplays.length > 0) {
  console.log(`Text content: "${peakDisplays[0].textContent}"`);
  console.log('PASS ✅');
} else {
  console.log('FAIL ❌');
}

// Test for knobs
const knobs = document.querySelectorAll('[data-testid="knob"]');
console.log('\nKNOB TEST:');
console.log(`Found ${knobs.length} knobs`);
if (knobs.length > 0) {
  console.log(`Title attribute: "${knobs[0].getAttribute('title')}"`);
  console.log('PASS ✅');
} else {
  console.log('FAIL ❌');
}

// Overall result
if (peakDisplays.length > 0 && knobs.length > 0) {
  console.log('\nAll tests PASSED ✅');
} else {
  console.log('\nSome tests FAILED ❌');
  process.exit(1);
}
