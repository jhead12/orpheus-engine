import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkForRecursion, removeLockFile } from './prevent-recursion.js';

// Convert __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

// Colors for output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m"
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Main postinstall function - much simpler and safer
async function safePostinstall() {
  // Check for recursion
  if (checkForRecursion()) {
    log('Skipping postinstall to prevent infinite loop', colors.yellow);
    return;
  }
  
  try {
    log('Running safe postinstall operations...', colors.cyan);
    
    // Only fix permissions - other operations can be done manually
    try {
      log('Fixing script permissions...', colors.blue);
      const { execSync } = await import('child_process');
      execSync('node scripts/fix-permissions.js', { 
        cwd: projectRoot,
        stdio: 'inherit',
      });
    } catch (error) {
      log(`Warning: Could not fix permissions: ${error.message}`, colors.yellow);
    }
    
    log('✅ Safe postinstall completed successfully', colors.green);
    log('For full dependency installation, run: npm run install:all', colors.green);
  } catch (error) {
    log(`❌ Postinstall error: ${error.message}`, colors.red);
  } finally {
    // Always remove lock file to prevent blocking future runs
    removeLockFile();
  }
}

// Run the postinstall
if (import.meta.url === `file://${process.argv[1]}`) {
  safePostinstall()
    .catch(err => {
      log(`❌ Postinstall failed: ${err.message}`, colors.red);
      // Don't exit with error to allow npm to continue
    });
}
