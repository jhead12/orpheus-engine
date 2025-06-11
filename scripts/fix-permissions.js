#!/usr/bin/env node

/**
 * Cross-platform permissions fixer for Orpheus Engine
 * This script fixes common permission issues with npm, pnpm, yarn, and project files
 */

import { execSync } from 'child_process';
import { homedir, platform } from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Convert __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

// Cache file to track when permissions were last fixed
const PERMISSIONS_CACHE_FILE = path.join(projectRoot, '.permissions-cache');
const CACHE_VALIDITY_MS = 30 * 60 * 1000; // 30 minutes

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

function getCurrentUserInfo() {
  const isWindows = platform() === 'win32';
  
  if (isWindows) {
    try {
      const username = process.env.USERNAME || process.env.USER;
      return { userId: username, groupId: username, isWindows: true };
    } catch (error) {
      return { userId: 'user', groupId: 'user', isWindows: true };
    }
  } else {
    try {
      const userId = process.getuid ? process.getuid() : runCommand('id -u', true).output.trim();
      const groupId = process.getgid ? process.getgid() : runCommand('id -g', true).output.trim();
      return { userId, groupId, isWindows: false };
    } catch (error) {
      return { userId: '1000', groupId: '1000', isWindows: false };
    }
  }
}

// Cache management functions
function isPermissionsCacheValid() {
  try {
    if (!fs.existsSync(PERMISSIONS_CACHE_FILE)) {
      return false;
    }
    const cacheStats = fs.statSync(PERMISSIONS_CACHE_FILE);
    const cacheAge = Date.now() - cacheStats.mtime.getTime();
    return cacheAge < CACHE_VALIDITY_MS;
  } catch (error) {
    return false;
  }
}

function updatePermissionsCache() {
  try {
    fs.writeFileSync(PERMISSIONS_CACHE_FILE, JSON.stringify({
      timestamp: Date.now(),
      platform: platform(),
      user: getCurrentUserInfo()
    }));
  } catch (error) {
    // Silently fail if we can't write cache
  }
}

function skipIfCached(operation, operationName) {
  if (isPermissionsCacheValid()) {
    log(`⚡ Skipping ${operationName} (recently completed)`, colors.yellow);
    return true;
  }
  return operation();
}

function fixNpmPermissions() {
  logHeader('Fixing NPM Permissions');
  
  const { userId, groupId, isWindows } = getCurrentUserInfo();
  const npmCachePath = path.join(homedir(), '.npm');
  
  // Create npm cache directory if it doesn't exist
  if (!fs.existsSync(npmCachePath)) {
    try {
      fs.mkdirSync(npmCachePath, { recursive: true });
      log(`Created npm cache directory: ${npmCachePath}`, colors.green);
    } catch (error) {
      log(`Failed to create npm cache directory: ${error.message}`, colors.red);
      return false;
    }
  }

  if (isWindows) {
    // On Windows, just ensure the directory exists and is writable
    try {
      fs.accessSync(npmCachePath, fs.constants.W_OK);
      log('✅ npm cache directory is writable', colors.green);
      return true;
    } catch (error) {
      log('⚠️ npm cache directory may have permission issues on Windows', colors.yellow);
      return false;
    }
  } else {
    // On Unix-like systems, fix ownership
    const fixCommand = `chown -R ${userId}:${groupId} "${npmCachePath}"`;
    log(`Executing: ${fixCommand}`, colors.blue);
    
    const result = runCommand(fixCommand);
    if (result.success) {
      log('✅ npm cache permissions fixed', colors.green);
      return true;
    } else {
      log('❌ Failed to fix npm cache permissions', colors.red);
      log(`Manual fix: sudo ${fixCommand}`, colors.yellow);
      return false;
    }
  }
}

function fixPnpmPermissions() {
  logHeader('Fixing PNPM Permissions');
  
  const { userId, groupId, isWindows } = getCurrentUserInfo();
  const pnpmPaths = [
    path.join(homedir(), '.pnpm'),
    path.join(homedir(), '.pnpm-state'),
    path.join(homedir(), '.cache', 'pnpm'),
    path.join(homedir(), 'Library', 'pnpm'), // macOS specific
  ];

  let allFixed = true;

  for (const pnpmPath of pnpmPaths) {
    if (fs.existsSync(pnpmPath)) {
      if (isWindows) {
        try {
          fs.accessSync(pnpmPath, fs.constants.W_OK);
          log(`✅ ${pnpmPath} is writable`, colors.green);
        } catch (error) {
          log(`⚠️ ${pnpmPath} may have permission issues`, colors.yellow);
          allFixed = false;
        }
      } else {
        const fixCommand = `chown -R ${userId}:${groupId} "${pnpmPath}"`;
        const result = runCommand(fixCommand);
        if (!result.success) {
          allFixed = false;
        }
      }
    }
  }

  return allFixed;
}

function fixYarnPermissions() {
  logHeader('Fixing Yarn Permissions');
  
  const { userId, groupId, isWindows } = getCurrentUserInfo();
  const yarnPaths = [
    path.join(homedir(), '.yarn'),
    path.join(homedir(), '.cache', 'yarn'),
    path.join(homedir(), '.yarnrc'),
    path.join(homedir(), '.yarnrc.yml')
  ];

  let allFixed = true;

  for (const yarnPath of yarnPaths) {
    if (fs.existsSync(yarnPath)) {
      if (isWindows) {
        try {
          fs.accessSync(yarnPath, fs.constants.W_OK);
          log(`✅ ${yarnPath} is writable`, colors.green);
        } catch (error) {
          log(`⚠️ ${yarnPath} may have permission issues`, colors.yellow);
          allFixed = false;
        }
      } else {
        const fixCommand = `chown -R ${userId}:${groupId} "${yarnPath}"`;
        const result = runCommand(fixCommand);
        if (!result.success) {
          allFixed = false;
        }
      }
    }
  }

  return allFixed;
}

function fixScriptPermissions() {
  logHeader('Fixing Script Permissions');
  
  const { isWindows } = getCurrentUserInfo();
  
  if (isWindows) {
    log('On Windows - script permissions are handled differently', colors.blue);
    return true;
  }

  // Make all shell scripts executable
  const projectRoot = path.dirname(__dirname);
  const scriptDirs = [
    path.join(projectRoot, 'scripts'),
    path.join(projectRoot, 'workstation', 'frontend', 'OEW-main', 'scripts'),
    path.join(projectRoot, 'workstation', 'backend', 'scripts')
  ];

  let allFixed = true;

  for (const dir of scriptDirs) {
    if (fs.existsSync(dir)) {
      const result = runCommand(`find "${dir}" -name "*.sh" -type f -exec chmod +x {} \\;`);
      if (result.success) {
        log(`✅ Made scripts executable in ${dir}`, colors.green);
      } else {
        log(`❌ Failed to fix script permissions in ${dir}`, colors.red);
        allFixed = false;
      }
    }
  }

  return allFixed;
}

function fixProjectPermissions() {
  logHeader('Fixing Project File Permissions');
  
  const { userId, groupId, isWindows } = getCurrentUserInfo();
  const projectRoot = path.dirname(__dirname);
  
  if (isWindows) {
    log('On Windows - checking write access to project directories', colors.blue);
    const dirs = ['workstation', 'scripts', 'node_modules'];
    
    for (const dir of dirs) {
      const fullPath = path.join(projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        try {
          fs.accessSync(fullPath, fs.constants.W_OK);
          log(`✅ ${dir} is writable`, colors.green);
        } catch (error) {
          log(`⚠️ ${dir} may have permission issues`, colors.yellow);
        }
      }
    }
    return true;
  }

  // Fix ownership of key directories
  const dirs = ['workstation', 'scripts', 'node_modules'];
  let allFixed = true;

  for (const dir of dirs) {
    const fullPath = path.join(projectRoot, dir);
    if (fs.existsSync(fullPath)) {
      const result = runCommand(`chown -R ${userId}:${groupId} "${fullPath}"`);
      if (result.success) {
        log(`✅ Fixed ownership of ${dir}`, colors.green);
      } else {
        log(`❌ Failed to fix ownership of ${dir}`, colors.red);
        allFixed = false;
      }
    }
  }

  return allFixed;
}

function testPermissions() {
  logHeader('Testing Permissions');
  
  // Test npm
  log('Testing npm...', colors.blue);
  const npmTest = runCommand('npm config get cache', true);
  if (npmTest.success) {
    log('✅ npm is working', colors.green);
  } else {
    log('❌ npm has issues', colors.red);
  }

  // Test pnpm if available
  const pnpmTest = runCommand('pnpm --version', true);
  if (pnpmTest.success) {
    log('✅ pnpm is working', colors.green);
  } else {
    log('ℹ️ pnpm not available or has issues', colors.blue);
  }

  // Test yarn if available
  const yarnTest = runCommand('yarn --version', true);
  if (yarnTest.success) {
    log('✅ yarn is working', colors.green);
  } else {
    log('ℹ️ yarn not available or has issues', colors.blue);
  }

  return npmTest.success;
}

function main() {
  logHeader('Orpheus Engine Permissions Fixer');
  log('This script will fix common permission issues', colors.blue);
  
  // Check if permissions were recently fixed
  if (isPermissionsCacheValid()) {
    log('⚡ Permissions were recently fixed, skipping...', colors.yellow);
    return true;
  }
  
  const results = {
    npm: fixNpmPermissions(),
    pnpm: fixPnpmPermissions(),
    yarn: fixYarnPermissions(),
    scripts: fixScriptPermissions(),
    project: fixProjectPermissions()
  };

  // Test if everything is working
  const testResult = testPermissions();

  // Summary
  logHeader('Summary');
  
  const allFixed = Object.values(results).every(Boolean) && testResult;
  
  if (allFixed) {
    log('🎉 All permissions have been fixed!', colors.green);
    log('You can now run npm/pnpm/yarn commands without permission issues', colors.green);
    updatePermissionsCache(); // Update cache after successful fix
  } else {
    log('⚠️ Some permission issues remain:', colors.yellow);
    
    Object.entries(results).forEach(([key, success]) => {
      if (!success) {
        log(`  - ${key} permissions need manual fixing`, colors.red);
      }
    });
    
    if (platform() !== 'win32') {
      log('\nTry running the following commands manually:', colors.yellow);
      log('  sudo chown -R $(id -u):$(id -g) ~/.npm', colors.blue);
      log('  sudo chown -R $(id -u):$(id -g) ~/.pnpm', colors.blue);
      log('  sudo chown -R $(id -u):$(id -g) ~/.yarn', colors.blue);
      log('  sudo chown -R $(id -u):$(id -g) ~/.cache', colors.blue);
    }
  }

  return allFixed;
}

// Export for use by other scripts
export {
  fixNpmPermissions,
  fixPnpmPermissions,
  fixYarnPermissions,
  fixScriptPermissions,
  fixProjectPermissions,
  testPermissions,
  isPermissionsCacheValid,
  updatePermissionsCache
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = main();
  process.exit(success ? 0 : 1);
}