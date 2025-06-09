// Simple test to verify browser capabilities for audio analysis
console.log('Testing browser audio capabilities...');

// Test AudioContext support
try {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (AudioContextClass) {
    const audioContext = new AudioContextClass();
    console.log('✓ AudioContext supported');
    console.log('  Sample rate:', audioContext.sampleRate);
    console.log('  State:', audioContext.state);
    audioContext.close();
  } else {
    console.log('✗ AudioContext not supported');
  }
} catch (error) {
  console.log('✗ AudioContext error:', error.message);
}

// Test File API support
if (window.File && window.FileReader && window.FileList && window.Blob) {
  console.log('✓ File API supported');
} else {
  console.log('✗ File API not supported');
}

// Test basic fetch support
if (window.fetch) {
  console.log('✓ Fetch API supported');
} else {
  console.log('✗ Fetch API not supported');
}

console.log('Browser capabilities test complete!');
