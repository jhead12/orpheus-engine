#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Find the frontend directory
const basePath = process.cwd();
const frontendPath = path.join(basePath, 'workstation/frontend');

console.log('Installing missing Vite dependencies...');

try {
  // Check if the frontend directory exists
  if (!fs.existsSync(frontendPath)) {
    console.error(`Error: Frontend directory not found at ${frontendPath}`);
    console.log('Searching for the correct frontend directory...');
    
    // Try to find the directory containing vite.config.ts
    const result = execSync('find /workspaces/orpheus-engine -name "vite.config.ts" -type f', { encoding: 'utf8' });
    const configPaths = result.trim().split('\n');
    
    if (configPaths.length > 0) {
      const correctFrontendPath = path.dirname(configPaths[0]);
      console.log(`Found Vite config at: ${correctFrontendPath}`);
      
      // Install dependencies in the correct location
      console.log('Installing @vitejs/plugin-react...');
      execSync('npm install --save-dev @vitejs/plugin-react', { 
        cwd: correctFrontendPath,
        stdio: 'inherit'
      });
      
      console.log('Dependency installed successfully!');
      
      // Update the path in start-electron.sh
      updateElectronScript(correctFrontendPath);
    } else {
      console.error('Could not find vite.config.ts in the project.');
      process.exit(1);
    }
  } else {
    // Install in the expected location
    console.log('Installing @vitejs/plugin-react...');
    execSync('npm install --save-dev @vitejs/plugin-react', { 
      cwd: frontendPath,
      stdio: 'inherit'
    });
    
    console.log('Dependency installed successfully!');
  }
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}

function updateElectronScript(correctFrontendPath) {
  const scriptPath = path.join(basePath, 'scripts/start-electron.sh');
  
  if (fs.existsSync(scriptPath)) {
    try {
      let scriptContent = fs.readFileSync(scriptPath, 'utf8');
      
      // Get the relative path from basePath to correctFrontendPath
      const relativePath = path.relative(basePath, correctFrontendPath);
      
      // Replace the incorrect path in the script
      const updatedContent = scriptContent.replace(
        /(cd orpheus-engine-workstation\/frontend|cd OEW-main)/g,
        `cd ${relativePath}`
      );
      
      fs.writeFileSync(scriptPath, updatedContent);
      console.log(`Updated path in start-electron.sh to: ${relativePath}`);
    } catch (err) {
      console.error('Error updating electron script:', err.message);
    }
  } else {
    console.log(`Electron script not found at ${scriptPath}`);
  }
}
