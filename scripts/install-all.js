const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if yarn is available
function isYarnAvailable() {
  try {
    execSync('yarn --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Helper to run commands safely
function runCommand(command, cwd = process.cwd()) {
  console.log(`Running: ${command} in ${cwd}`);
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env }
    });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`, error.message);
    return false;
  }
}

// Fix permissions for package manager caches
function fixPackageManagerPermissions() {
  console.log('Fixing package manager cache permissions...');
  const userInfo = execSync('id -u').toString().trim();
  const groupInfo = execSync('id -g').toString().trim();
  const homedir = process.env.HOME || '/tmp';
  
  // Fix npm cache permissions
  const npmCachePath = `${homedir}/.npm`;
  runCommand(`sudo chown -R ${userInfo}:${groupInfo} "${npmCachePath}" || true`);

  // Fix yarn cache permissions if yarn exists
  if (isYarnAvailable()) {
    const yarnCachePath = `${homedir}/.yarn`;
    const yarnConfigPath = `${homedir}/.yarnrc`;
    const yarnCachePath2 = `${homedir}/.cache/yarn`;
    
    runCommand(`sudo chown -R ${userInfo}:${groupInfo} "${yarnCachePath}" || true`);
    runCommand(`sudo chown -R ${userInfo}:${groupInfo} "${yarnConfigPath}" || true`);
    runCommand(`sudo chown -R ${userInfo}:${groupInfo} "${yarnCachePath2}" || true`);
  }

  console.log('Fixed package manager cache permissions.');
}

// Main installation function
async function installAll() {
  // Fix permissions first
  fixPackageManagerPermissions();
  
  // Use yarn if available, otherwise fallback to npm
  const hasYarn = isYarnAvailable();
  const installCmd = hasYarn ? 'yarn install' : 'npm install';
  
  // Root project
  console.log('Installing root project dependencies...');
  runCommand(installCmd);
  
  // We no longer use OEW-main directly, focusing on the workstation structure

  // Install frontend dependencies
  const frontendPath = path.join(process.cwd(), 'workstation/frontend');
  if (fs.existsSync(frontendPath)) {
    console.log('Installing frontend dependencies...');
    runCommand('yarn install', frontendPath);
  } else {
    console.warn('Frontend directory not found, skipping...');
  }

  // Install backend dependencies
  const backendPath = path.join(process.cwd(), 'workstation/backend');
  if (fs.existsSync(backendPath)) {
    console.log('Installing backend dependencies...');
    runCommand('yarn install', backendPath);
    
    // Install Python dependencies if requirements.txt exists
    const ragPath = path.join(backendPath, 'agentic_rag');
    if (fs.existsSync(path.join(ragPath, 'requirements.txt'))) {
      console.log('Installing Python RAG dependencies...');
      runCommand('pip install -r requirements.txt', ragPath);
    }
  } else {
    console.warn('Backend directory not found, skipping...');
  }

  console.log('Installation completed successfully!');
}

// Provide a summary of what was installed
function showSummary(hasYarn) {
  console.log('\n' + '='.repeat(60));
  console.log('🎵 Orpheus Engine Dependencies Installed!');
  console.log('='.repeat(60));
  
  console.log(`\nPackage manager used: ${hasYarn ? 'Yarn' : 'npm'}`);
  console.log('\nTo start the application:');
  if (hasYarn) {
    console.log('  yarn start                # Start the integrated application');
    console.log('  yarn system-check         # Verify all components are working');
  } else {
    console.log('  npm run start             # Start the integrated application');
    console.log('  npm run system-check      # Verify all components are working');
  }
  
  console.log('\nFor more commands, check the scripts section in package.json');
}

// Run the installation
installAll()
  .then(() => {
    showSummary(isYarnAvailable());
  })
  .catch(err => {
    console.error('Installation failed:', err);
    process.exit(1);
  });
