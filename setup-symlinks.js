const fs = require('fs');
const path = require('path');

// Path to the frontend project
const frontendPath = path.join(__dirname, 'workstation', 'frontend');
const nodeModulesPath = path.join(frontendPath, 'node_modules', '@orpheus-engine');

// Create directory if it doesn't exist
if (!fs.existsSync(nodeModulesPath)) {
  fs.mkdirSync(nodeModulesPath, { recursive: true });
}

// Create the symlink
const targetPath = path.join(nodeModulesPath, 'frontend');
const sourcePath = path.join(__dirname, 'workstation/frontend/src');

// Remove existing symlink if it exists
if (fs.existsSync(targetPath)) {
  fs.unlinkSync(targetPath);
}

// Create new symlink
fs.symlinkSync(sourcePath, targetPath, 'dir');
console.log(`Symlink created: ${targetPath} -> ${sourcePath}`);
