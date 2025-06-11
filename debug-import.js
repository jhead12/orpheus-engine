// Debug import to check what's being exported
try {
  const mixerUtils = require('./src/test/utils/mixer-test-utils.tsx');
  console.log('Mixer utils exports:', Object.keys(mixerUtils));
  console.log('setupGlobalMocks type:', typeof mixerUtils.setupGlobalMocks);
  console.log('setupGlobalMocks value:', mixerUtils.setupGlobalMocks);
} catch (error) {
  console.error('Import error:', error.message);
}
