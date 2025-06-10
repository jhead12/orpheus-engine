#!/usr/bin/env node

// Quick test verification script
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 Running quick test verification...\n');

try {
  // Test 1: Check if vitest can parse our test files
  console.log('1. Checking test file parsing...');
  const listOutput = execSync('npx vitest list --run', { 
    cwd: projectRoot, 
    encoding: 'utf8',
    timeout: 10000 
  });
  
  const testCount = (listOutput.match(/\.test\./g) || []).length;
  console.log(`   ✅ Found ${testCount} test files`);
  
  // Test 2: Run a single simple test
  console.log('\n2. Running AudioRecorderComponent test...');
  const testOutput = execSync('timeout 20 npx vitest run workstation/frontend/src/components/daw/__tests__/AudioRecorderComponent.test.tsx --reporter=basic --no-coverage', { 
    cwd: projectRoot, 
    encoding: 'utf8'
  });
  
  if (testOutput.includes('PASSED') || testOutput.includes('✓')) {
    console.log('   ✅ AudioRecorderComponent test passed!');
  } else if (testOutput.includes('FAILED') || testOutput.includes('✗')) {
    console.log('   ❌ AudioRecorderComponent test failed');
    console.log('   Output:', testOutput.slice(-500)); // Last 500 chars
  } else {
    console.log('   ⚠️  Test result unclear');
    console.log('   Output:', testOutput.slice(-300));
  }
  
} catch (error) {
  console.error('❌ Test verification failed:', error.message);
  if (error.stdout) {
    console.log('STDOUT:', error.stdout.slice(-500));
  }
  if (error.stderr) {
    console.log('STDERR:', error.stderr.slice(-500));
  }
}

console.log('\n✅ Test verification complete!');
