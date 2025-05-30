/**
 * Helper script to launch Electron with the proper flags for local development
 */

const { spawn } = require('child_process');
const path = require('path');
const electronPath = require('electron');
const http = require('http');

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

async function launchElectron() {
  try {
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
    const args = process.argv.slice(2);
    if (!args.includes('--no-sandbox')) {
      args.push('--no-sandbox');
    }

    // Set security warnings to be disabled
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

    // Launch Electron with the proper flags
    const electronProcess = spawn(electronPath, ['.'].concat(args), {
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
