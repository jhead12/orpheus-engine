/**
 * Helper script to launch Electron with the proper flags for local development
 */

const { spawn } = require('child_process');
const path = require('path');
const electronPath = require('electron');

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
  process.exit(code);
});
