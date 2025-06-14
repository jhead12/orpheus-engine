// Simple utility to prevent recursive installations
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

// Lock file path
const LOCK_FILE = path.join(projectRoot, '.install_lock');

export function checkForRecursion() {
  // If lock file exists, we're in a recursive call
  if (fs.existsSync(LOCK_FILE)) {
    const lockTime = parseInt(fs.readFileSync(LOCK_FILE, 'utf-8') || '0', 10);
    const currentTime = Date.now();
    
    // If lock is older than 5 minutes, assume it's stale
    if (currentTime - lockTime < 5 * 60 * 1000) {
      console.log('\x1b[33mRECURSION DETECTED: Avoiding infinite loop in dependency installation\x1b[0m');
      console.log('\x1b[33mIf this is unexpected, delete the .install_lock file and try again\x1b[0m');
      return true;
    } else {
      console.log('\x1b[33mStale lock file found, removing it\x1b[0m');
      fs.unlinkSync(LOCK_FILE);
    }
  }
  
  // Create lock file
  fs.writeFileSync(LOCK_FILE, Date.now().toString());
  return false;
}

export function removeLockFile() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (err) {
    console.log(`\x1b[33mWarning: Could not remove lock file: ${err.message}\x1b[0m`);
  }
}
