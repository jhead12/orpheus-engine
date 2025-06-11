// Debug script to run a single test with full output
import { run } from 'vitest/node';

run({
  include: ['src/screens/workstation/components/__tests__/WorkstationMixer.test.tsx'],
  testNamePattern: 'should display peak level indicators',
  reporters: ['verbose'],
  silent: false,
  onConsoleLog(log) {
    console.log('TEST LOG:', log);
  },
}).catch(e => {
  console.error('TEST ERROR:', e);
  process.exit(1);
});
