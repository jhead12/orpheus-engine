/**
 * Helper script to launch Electron with the proper flags in Codespaces
 */

import { spawn } from 'child_process';
import { createServer } from 'vite';
import electron from 'electron';
import path from 'path';
import waitOn from 'wait-on';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startViteAndElectron() {
  try {
    // Create Vite server
    const server = await createServer({
      configFile: path.resolve(__dirname, 'vite.config.ts'),
      mode: 'development',
    });
    
    // Start the server
    await server.listen(5173);

    // Wait for the server to be ready
    await waitOn({
      resources: ['http://localhost:5173'],
      timeout: 30000,
    });

    // Start Electron with appropriate flags for Codespaces
    const electronPath = electron;
    const args = ['.'];
    
    // Add Codespaces-specific flags if needed
    if (process.env.CODESPACES) {
      args.push('--no-sandbox');
      args.push('--disable-gpu');
    }

    // Start Electron
    const electronProcess = spawn(electronPath, args, {
      stdio: 'inherit',
    });

    electronProcess.on('error', (err) => {
      console.error('Failed to start Electron:', err);
      process.exit(1);
    });

    electronProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Electron exited with code ${code}`);
      }
      server.close();
      process.exit(code);
    });

    // Handle process termination
    const cleanup = () => {
      electronProcess.kill();
      server.close();
      process.exit();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

startViteAndElectron();
