const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const nodeModulesPath = path.join(__dirname, '..', 'workstation', 'frontend', 'node_modules');

// Create symlinks for workstation modules
const createSymlink = () => {
  try {
    // Ensure node_modules exists
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('Creating node_modules directory...');
      fs.mkdirSync(nodeModulesPath, { recursive: true });
    }

    // Setup shared modules path
    const symlinkPath = path.join(nodeModulesPath, '@orpheus-engine');
    const symlinkTargetPath = path.join(symlinkPath, 'shared');
    
    // Create @orpheus-engine directory if it doesn't exist
    if (!fs.existsSync(symlinkPath)) {
      fs.mkdirSync(symlinkPath, { recursive: true });
    }
    
    // Remove the symlink if it already exists
    if (fs.existsSync(symlinkTargetPath)) {
      if (process.platform === 'win32') {
        // Windows requires a different command to remove symlinks
        execSync(`rmdir "${symlinkTargetPath}"`, { stdio: 'inherit' });
      } else {
        fs.unlinkSync(symlinkTargetPath);
      }
      console.log('Removed existing symlink.');
    }
    
    // Create the symlink
    const oewPath = path.join(__dirname, '..', 'workstation', 'frontend', 'src');
    fs.symlinkSync(oewPath, symlinkTargetPath, 'junction');
    console.log(`Created symlink: ${symlinkTargetPath} -> ${oewPath}`);
  } catch (error) {
    console.error('Error creating symlink:', error);
  }
};

createSymlink();
