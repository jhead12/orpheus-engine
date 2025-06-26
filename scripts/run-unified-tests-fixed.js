#!/usr/bin/env node
/**
 * This script creates a temporary test setup with proper module resolution for React
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temporary test setup
const setupReactTest = async () => {
  console.log("Setting up unified test environment...");
  
  // Create a temporary React hook synchronization file
  const setupPath = path.resolve(__dirname, '../temp-setup-test.js');
  const content = `// @ts-nocheck
// Ensure React is properly resolved from a single location
import React from 'react';
import ReactDOM from 'react-dom';

// Make React available globally for tests
window.React = React;
window.ReactDOM = ReactDOM;

// Log the React version for debugging
console.log('React version:', React.version);
`;
  
  fs.writeFileSync(setupPath, content);
  console.log(`Created temporary setup file at ${setupPath}`);

  // Create a temporary config file with our setup additions
  const originalConfigPath = path.resolve(__dirname, '../vitest.root.config.ts');
  const tempConfigPath = path.resolve(__dirname, '../vitest.temp.config.ts');
  
  let configContent = fs.readFileSync(originalConfigPath, 'utf8');
  
  // Modify setupFiles to include our temporary setup file
  const setupFilesPattern = /setupFiles:\s*\[([\s\S]*?)\]/;
  const setupFilesMatch = configContent.match(setupFilesPattern);
  
  if (setupFilesMatch) {
    // Add our setup file to the existing setupFiles array
    const newSetupFiles = `setupFiles: [
      "./temp-setup-test.js",${setupFilesMatch[1]}
    ]`;
    configContent = configContent.replace(setupFilesPattern, newSetupFiles);
  }
  
  // Add React deduplication
  const resolvePattern = /resolve:\s*{/;
  if (!configContent.includes('dedupe:')) {
    configContent = configContent.replace(
      resolvePattern, 
      'resolve: {\n    dedupe: ["react", "react-dom"],\n'
    );
  }
  
  fs.writeFileSync(tempConfigPath, configContent);
  console.log(`Created temporary config at ${tempConfigPath}`);

  // Run the test with the temporary config
  try {
    console.log("Running tests with unified React resolution...");
    const vitestUI = spawn('pnpm', ['vitest', '--ui', '--config', 'vitest.temp.config.ts'], {
      stdio: 'inherit',
      shell: true
    });

    vitestUI.on('error', (error) => {
      console.error('Error running vitest UI:', error);
      cleanup();
      process.exit(1);
    });

    vitestUI.on('close', (code) => {
      cleanup();
      process.exit(code);
    });
  } catch (error) {
    console.error("Failed to run tests:", error);
    cleanup();
    process.exit(1);
  }
};

// Cleanup function
const cleanup = () => {
  const filesToCleanup = [
    path.resolve(__dirname, '../temp-setup-test.js'),
    path.resolve(__dirname, '../vitest.temp.config.ts')
  ];
  
  filesToCleanup.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`Cleaned up temporary file ${file}`);
    }
  });
};

// Handle process signals for cleanup
process.on('SIGINT', () => {
  console.log('Interrupted, cleaning up...');
  cleanup();
  process.exit(2);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  cleanup();
  process.exit(1);
});

// Start the setup
setupReactTest().catch(err => {
  console.error("Failed in setup:", err);
  cleanup();
  process.exit(1);
});
