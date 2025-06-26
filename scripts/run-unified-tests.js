#!/usr/bin/env node
/**
 * This script runs the tests with a unified configuration
 * that includes tests from both the root project and submodules.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the custom config
const configPath = path.resolve(__dirname, '../vitest.root.config.ts');

// Run vitest UI with the custom config
const vitestUI = spawn('pnpm', ['vitest', '--ui', '--config', configPath], {
  stdio: 'inherit',
  shell: true
});

vitestUI.on('error', (error) => {
  console.error('Error running vitest UI:', error);
  process.exit(1);
});

vitestUI.on('close', (code) => {
  process.exit(code);
});
