const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

console.log('Installing required Python packages...');

try {
  // Check if pip is installed
  execSync('pip --version', { stdio: 'inherit' });
  
  // Install required packages
  const packages = [
    'librosa',
    'numpy',
    'matplotlib',
    'pyloudnorm'
  ];
  
  execSync(`pip install ${packages.join(' ')}`, { stdio: 'inherit' });
  
  console.log('Python packages installed successfully!');
} catch (error) {
  console.error('Error installing Python packages:', error.message);
  process.exit(1);
}