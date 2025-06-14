// This is a wrapper script that calls the original install-all.js
// after performing recursion checks
import { fileURLToPath } from 'url';
import path from 'path';
import { checkForRecursion, removeLockFile } from './prevent-recursion.js';

// Convert __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function safeInstallAll() {
  // Check for recursion
  if (checkForRecursion()) {
    log('Skipping installation to prevent infinite loop', colors.yellow);
    return false;
  }
  
  try {
    // Import the original install-all script
    const { installAll } = await import('./install-all.js');
    
    // Run the installation
    return await installAll();
  } catch (error) {
    log(`❌ Installation failed: ${error.message}`, colors.red);
    return false;
  } finally {
    // Always clean up the lock file
    removeLockFile();
  }
}

// Run the safe installation
if (import.meta.url === `file://${process.argv[1]}`) {
  safeInstallAll()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      log(`❌ Installation wrapper failed: ${err.message}`, colors.red);
      removeLockFile();
      process.exit(1);
    });
}

export { safeInstallAll };
