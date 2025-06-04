/**
 * Helper script to launch Electron with the proper flags for local development
 */

const { spawn } = require('child_process');
const path = require('path');
const electronPath = require('electron');
const http = require('http');
const fs = require('fs');

// Function to check if Vite server is running
function waitForVite(port = 5174, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function checkVite() {
      const req = http.get(`http://localhost:${port}`, (res) => {
        console.log(`✅ Vite server is ready on port ${port}`);
        resolve();
      });
      
      req.on('error', (err) => {
        const elapsed = Date.now() - startTime;
        if (elapsed > timeout) {
          console.error(`❌ Timed out waiting for Vite server after ${timeout}ms`);
          reject(new Error(`Vite server not ready after ${timeout}ms`));
        } else {
          console.log(`⏳ Waiting for Vite server... (${Math.round(elapsed/1000)}s)`);
          setTimeout(checkVite, 1000);
        }
      });
    }
    
    checkVite();
  });
}

// Function to start Vite development server
function startVite() {
  console.log('🚀 Starting Vite development server...');
  
  const viteProcess = spawn('npm', ['run', 'dev:vite'], {
    stdio: 'pipe',
    env: process.env,
    cwd: process.cwd()
  });
  
  viteProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:') || output.includes('ready')) {
      console.log('Vite:', output.trim());
    }
  });
  
  viteProcess.stderr.on('data', (data) => {
    console.error('Vite Error:', data.toString());
  });
  
  return viteProcess;
}

// Ensure electron directory exists
function ensureDirectoryStructure() {
  const electronDir = path.join(process.cwd(), 'electron');
  
  if (!fs.existsSync(electronDir)) {
    console.log('Creating electron directory...');
    fs.mkdirSync(electronDir, { recursive: true });
  }
  
  // Check for main.js file and create if it doesn't exist
  const mainJsPath = path.join(electronDir, 'main.js');
  if (!fs.existsSync(mainJsPath)) {
    console.log('Creating basic main.js file...');
    const mainJsContent = `
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadURL('http://localhost:5174');
  
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
`;
    fs.writeFileSync(mainJsPath, mainJsContent);
  }
}

async function launchElectron() {
  try {
    // Ensure the directory structure exists
    ensureDirectoryStructure();
    
    // Start Vite if not running in packaged mode
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      const viteProcess = startVite();
      
      // Wait for Vite to be ready
      await waitForVite();
      
      // Store vite process for cleanup
      process.viteProcess = viteProcess;
    }
    
    console.log('🚀 Starting Electron...');
    
    // Add necessary flags for running Electron locally
    const args = ['.'].concat(process.argv.slice(2));
    if (!args.includes('--no-sandbox')) {
      args.push('--no-sandbox');
    }

    // Set security warnings to be disabled
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

    // Launch Electron with the proper flags
    const electronProcess = spawn(electronPath, args, {
      stdio: 'inherit',
      env: process.env
    });

    electronProcess.on('close', (code) => {
      console.log('🔴 Electron process closed');
      if (process.viteProcess) {
        console.log('🔴 Stopping Vite server...');
        process.viteProcess.kill();
      }
      process.exit(code);
    });
    
  } catch (error) {
    console.error('❌ Failed to launch Electron:', error.message);
    if (process.viteProcess) {
      process.viteProcess.kill();
    }
    process.exit(1);
  }
}

// Handle cleanup on process termination
process.on('SIGINT', () => {
  console.log('🔴 Received SIGINT, cleaning up...');
  if (process.viteProcess) {
    process.viteProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🔴 Received SIGTERM, cleaning up...');
  if (process.viteProcess) {
    process.viteProcess.kill();
  }
  process.exit(0);
});

launchElectron();
