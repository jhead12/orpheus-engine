/**
 * Helper script to launch Electron with the proper flags in Codespaces
 */

const { spawn } = require('child_process');
const { createServer } = require('vite');
const electron = require('electron');
const path = require('path');
const waitOn = require('wait-on');
const { execSync } = require('child_process');

async function startViteAndElectron() {
  try {
    // Create Vite server
    const server = await createServer({
      configFile: path.resolve(__dirname, 'vite.config.ts'),
      mode: 'development',
    });
    
    // Start the server
    await server.listen(5173);
    console.log('Vite server started on port 5173');
    
    // Wait for the server to be available
    await waitOn({ resources: ['http-get://localhost:5173'] });
    console.log('Vite server ready');
    
    // Set up environment variables for X11
    const env = { 
      ...process.env,
      NODE_ENV: 'development',
      ELECTRON_ENABLE_LOGGING: '1',
    };

    // Check for X11 display
    const hasDisplay = !!process.env.DISPLAY;
    
    if (!hasDisplay) {
      console.log('No X display detected. Setting up virtual framebuffer...');
      try {
        // Check if Xvfb is available
        execSync('which Xvfb', { stdio: 'ignore' });
        
        // Try to start Xvfb on display :99
        execSync('Xvfb :99 -screen 0 1024x768x24 -ac &', { stdio: 'ignore' });
        env.DISPLAY = ':99';
        console.log('Xvfb started on display :99');
      } catch (e) {
        // Fallback to headless mode if Xvfb is not available
        console.log('Xvfb not available, falling back to headless mode');
        env.ELECTRON_DISABLE_GPU = '1';
        env.ELECTRON_NO_ATTACH_CONSOLE = '1';
        env.ELECTRON_HEADLESS = '1';
        env.DISABLE_GPU = '1';
      }
    }
    
    const electronArgs = [
      '.',
      ...process.argv.slice(2),
      ...(env.ELECTRON_HEADLESS ? ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage'] : [])
    ];
    
    // Start Electron
    console.log(`Starting Electron with display: ${env.DISPLAY || 'headless'}`);
    const electronProcess = spawn(electron, electronArgs, { 
      stdio: 'inherit',
      env
    });
    
    // Handle Electron exit
    electronProcess.on('close', (code) => {
      console.log(`Electron exited with code ${code}`);
      server.close();
      // Kill Xvfb if we started it
      if (env.DISPLAY === ':99') {
        try {
          execSync('pkill Xvfb', { stdio: 'ignore' });
        } catch (e) {
          // Ignore errors if Xvfb is already gone
        }
      }
      process.exit(code);
    });
  } catch (e) {
    console.error('Error starting application:', e);
    process.exit(1);
  }
}

startViteAndElectron();
