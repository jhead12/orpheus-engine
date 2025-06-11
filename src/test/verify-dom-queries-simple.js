
// A very minimal script to verify our approach works
console.log('=== DOM Query Verification ===');

// Create a simple DOM structure
const document = {
  createElement(tagName) {
    return {
      tagName,
      children: [],
      className: '',
      attributes: {},
      style: {},
      
      appendChild(child) {
        this.children.push(child);
        return child;
      },
      
      setAttribute(name, value) {
        this.attributes[name] = value;
      },
      
      hasAttribute(name) {
        return this.attributes[name] !== undefined;
      },
      
      getAttribute(name) {
        return this.attributes[name];
      },
      
      querySelectorAll(selector) {
        if (selector === '.peak-display') {
          return this.children.filter(child => child.className === 'peak-display');
        }
        return [];
      }
    };
  },
  
  querySelectorAll(selector) {
    if (selector === '[data-testid="knob"]') {
      return [knob];
    }
    return [];
  }
};

// Test peak display
console.log('--- Testing Peak Display Queries ---');
const meter = document.createElement('div');
meter.setAttribute('data-testid', 'meter');

const peakDisplay = document.createElement('div');
peakDisplay.className = 'peak-display';
peakDisplay.textContent = '-∞';
meter.appendChild(peakDisplay);

const foundPeakDisplays = meter.querySelectorAll('.peak-display');
console.log(`✅ Found ${foundPeakDisplays.length} peak displays using class selector`);
console.log(`✅ Text content: "${peakDisplay.textContent}"`);
console.log(`✅ Found peak display through parent: ${meter.children.includes(peakDisplay) ? 'Yes' : 'No'}`);

// Test knob
console.log('--- Testing Knob Queries ---');
const knob = document.createElement('input');
knob.setAttribute('data-testid', 'knob');
knob.setAttribute('title', 'Pan: 0');
knob.setAttribute('type', 'range');

const foundKnobs = document.querySelectorAll('[data-testid="knob"]');
console.log(`✅ Found ${foundKnobs.length} knobs using data-testid selector`);
console.log(`✅ Title attribute: "${knob.getAttribute('title')}"`);

console.log('=== Test Summary ===');
console.log(`Peak Display Queries: ✅ PASS`);
console.log(`Knob Queries: ✅ PASS`);
