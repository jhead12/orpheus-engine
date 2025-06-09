#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Fixing sentence-transformers compatibility with huggingface_hub...');

try {
  // Uninstall current versions
  console.log('Uninstalling current packages...');
  execSync('pip uninstall -y sentence-transformers huggingface-hub transformers tokenizers', { stdio: 'inherit' });
  
  // Install compatible versions for Python 3.12
  console.log('Installing compatible versions...');
  execSync('pip install --only-binary=:all: transformers==4.40.0 tokenizers==0.19.1', { stdio: 'inherit' });
  execSync('pip install --only-binary=:all: sentence-transformers==2.6.1', { stdio: 'inherit' });
  
  console.log('Fix completed successfully! You should now be able to import sentence_transformers.');
} catch (error) {
  console.error('Error fixing dependencies:', error.message);
  process.exit(1);
}
