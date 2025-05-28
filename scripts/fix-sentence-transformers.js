#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Fixing sentence-transformers compatibility with huggingface_hub...');

try {
  // Uninstall current versions
  console.log('Uninstalling current packages...');
  execSync('pip uninstall -y sentence-transformers huggingface-hub', { stdio: 'inherit' });
  
  // Install compatible versions
  console.log('Installing compatible versions...');
  execSync('pip install huggingface-hub==0.12.0 sentence-transformers==2.2.2', { stdio: 'inherit' });
  
  console.log('Fix completed successfully! You should now be able to import sentence_transformers.');
} catch (error) {
  console.error('Error fixing dependencies:', error.message);
  process.exit(1);
}
