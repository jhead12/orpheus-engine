#!/usr/bin/env node

/**
 * Windows-specific permissions fixer for Orpheus Engine
 * This script handles Windows-specific permission issues
 */

import { execSync } from 'child_process';
import { homedir } from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Convert __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI colors for better output
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

function logHeader(message) {
  log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  log(`${colors.bold}${colors.cyan}${message}${colors.reset}`);
  log(`${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
}

function runCommand(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    if (!silent) log(`✅ ${command}`, colors.green);
    return { success: true, output };
  } catch (error) {
    if (!silent) log(`❌ Failed: ${command}`, colors.red);
    return { success: false, error: error.message };
  }
}

function fixWindowsPermissions() {
  logHeader('Fixing Windows Permissions');
  
  const isWindows = process.platform === 'win32';
  
  if (!isWindows) {
    log('This script is intended for Windows only. Running universal permissions script...', colors.blue);
    // Import and run the universal permissions script
    return import('./fix-permissions.js').then(module => {
      return module.fixNpmPermissions() && 
             module.fixPnpmPermissions() && 
             module.fixYarnPermissions() && 
             module.fixScriptPermissions();
    });
  }

  log('Checking Windows permissions...', colors.blue);
  
  // Check npm cache directory
  const npmCachePath = path.join(homedir(), 'AppData', 'Local', 'npm-cache');
  const npmGlobalPath = path.join(homedir(), 'AppData', 'Roaming', 'npm');
  
  const dirsToCheck = [
    npmCachePath,
    npmGlobalPath,
    path.join(homedir(), '.pnpm'),
    path.join(homedir(), '.yarn'),
    path.join(homedir(), '.cache')
  ];

  let allAccessible = true;

  for (const dir of dirsToCheck) {
    if (fs.existsSync(dir)) {
      try {
        fs.accessSync(dir, fs.constants.W_OK);
        log(`✅ ${dir} is writable`, colors.green);
      } catch (error) {
        log(`⚠️ ${dir} may have permission issues`, colors.yellow);
        allAccessible = false;
        
        // Try to create a test file to verify write access
        try {
          const testFile = path.join(dir, 'test-write-permissions.tmp');
          fs.writeFileSync(testFile, 'test');
          fs.unlinkSync(testFile);
          log(`✅ Successfully tested write access to ${dir}`, colors.green);
          allAccessible = true;
        } catch (writeError) {
          log(`❌ Cannot write to ${dir}: ${writeError.message}`, colors.red);
        }
      }
    } else {
      // Try to create the directory
      try {
        fs.mkdirSync(dir, { recursive: true });
        log(`✅ Created directory: ${dir}`, colors.green);
      } catch (error) {
        log(`❌ Failed to create directory ${dir}: ${error.message}`, colors.red);
        allAccessible = false;
      }
    }
  }

  // Windows-specific: Check if running as administrator when needed
  if (!allAccessible) {
    log('\nWindows-specific recommendations:', colors.yellow);
    log('1. Try running the command prompt as Administrator', colors.blue);
    log('2. Or run: npm config set cache C:\\temp\\npm-cache', colors.blue);
    log('3. Or run: npm config set prefix C:\\temp\\npm-global', colors.blue);
  }

  return allAccessible;
}

function testWindowsCommands() {
  logHeader('Testing Windows Commands');
  
  // Test npm
  const npmTest = runCommand('npm --version', true);
  if (npmTest.success) {
    log('✅ npm is working', colors.green);
  } else {
    log('❌ npm has issues', colors.red);
  }

  // Test pnpm
  const pnpmTest = runCommand('pnpm --version', true);
  if (pnpmTest.success) {
    log('✅ pnpm is working', colors.green);
  } else {
    log('ℹ️ pnpm not available', colors.blue);
  }

  // Test yarn
  const yarnTest = runCommand('yarn --version', true);
  if (yarnTest.success) {
    log('✅ yarn is working', colors.green);
  } else {
    log('ℹ️ yarn not available', colors.blue);
  }

  return npmTest.success;
}

async function main() {
  logHeader('Orpheus Engine Windows Permissions Fixer');
  
  const permissionsFixed = await fixWindowsPermissions();
  const commandsWorking = testWindowsCommands();
  
  logHeader('Summary');
  
  if (permissionsFixed && commandsWorking) {
    log('🎉 Windows permissions are properly configured!', colors.green);
  } else {
    log('⚠️ Some permission issues may remain on Windows', colors.yellow);
    log('\nTroubleshooting tips:', colors.blue);
    log('- Run PowerShell or Command Prompt as Administrator', colors.cyan);
    log('- Check Windows Defender or antivirus software settings', colors.cyan);
    log('- Ensure Node.js was installed with proper permissions', colors.cyan);
  }

  return permissionsFixed && commandsWorking;
}

// Export for use by other scripts
export { fixWindowsPermissions, testWindowsCommands };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      log(`❌ Windows permissions check failed: ${err.message}`, colors.red);
      process.exit(1);
    });
}
