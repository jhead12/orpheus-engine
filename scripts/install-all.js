const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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

// Fix permissions for npm cache
function fixNpmPermissions() {
  console.log('Fixing npm cache permissions...');
  const userInfo = execSync('id -u').toString().trim();
  const groupInfo = execSync('id -g').toString().trim();
  
  // Replace Codespaces-specific path with local user npm cache path
  const npmCachePath = process.env.HOME ? `${process.env.HOME}/.npm` : '/tmp/.npm';
  runCommand(`sudo chown -R ${userInfo}:${groupInfo} "${npmCachePath}" || true`);

  console.log('Fixed npm cache permissions.');
}

// Main installation function
async function installAll() {
  // Fix permissions first
  fixNpmPermissions();
  
  // Root project
  console.log('Installing root project dependencies...');
  runCommand('yarn install');
  
  // Install OEW-main dependencies
  const oewMainPath = path.join(process.cwd(), 'OEW-main');
  if (fs.existsSync(oewMainPath)) {
    console.log('Installing OEW-main dependencies...');
    runCommand('yarn install --legacy-peer-deps', oewMainPath);
  } else {
    console.warn('OEW-main directory not found, skipping...');
  }

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

// Run the installation
installAll().catch(err => {
  console.error('Installation failed:', err);
  process.exit(1);
});
