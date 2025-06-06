#!/usr/bin/env node

/**
 * This script helps fix common npm permission issues by:
 * 1. Detecting ownership problems in the npm cache
 * 2. Suggesting or automatically running the proper fix command
 * 3. Testing if the fix worked
 */

const { execSync } = require('child_process');
const { homedir } = require('os');
const path = require('path');
const fs = require('fs');

// ANSI colors for better output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  bold: "\x1b[1m"
};

/**
 * Log with color
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Run a command and return its output
 */
function runCommand(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    if (!silent) log(`✅ ${command} executed successfully`, colors.green);
    return { success: true, output };
  } catch (error) {
    if (!silent) log(`❌ Error running command: ${command}`, colors.red);
    if (!silent) log(error.message, colors.red);
    return { success: false, error: error.message };
  }
}

/**
 * Get current user ID and group ID
 */
function getCurrentUserInfo() {
  const userId = process.getuid ? process.getuid() : runCommand('id -u', true).output.trim();
  const groupId = process.getgid ? process.getgid() : runCommand('id -g', true).output.trim();
  return { userId, groupId };
}

/**
 * Check npm cache permissions
 */
function checkNpmPermissions() {
  const npmCachePath = path.join(homedir(), '.npm');
  
  log(`\n${colors.bold}Checking npm cache permissions...${colors.reset}`);
  
  // Check if npm cache directory exists
  if (!fs.existsSync(npmCachePath)) {
    log(`npm cache directory does not exist, creating...`, colors.yellow);
    try {
      fs.mkdirSync(npmCachePath, { recursive: true });
      log(`Created npm cache directory: ${npmCachePath}`, colors.green);
    } catch (error) {
      log(`❌ Failed to create npm cache directory: ${error.message}`, colors.red);
      return false;
    }
  }

  // Check owner of npm cache directory
  try {
    const stats = fs.statSync(npmCachePath);
    const { userId, groupId } = getCurrentUserInfo();
    
    if (stats.uid.toString() !== userId.toString()) {
      log(`❌ npm cache is owned by user ID ${stats.uid}, but current user is ${userId}`, colors.red);
      return false;
    }
    
    log(`✅ npm cache directory has correct ownership`, colors.green);
    return true;
  } catch (error) {
    log(`❌ Error checking npm cache permissions: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Fix npm permissions
 */
function fixNpmPermissions(autoFix = false) {
  const npmCachePath = path.join(homedir(), '.npm');
  const { userId, groupId } = getCurrentUserInfo();
  const fixCommand = `sudo chown -R ${userId}:${groupId} "${npmCachePath}"`;
  
  if (autoFix) {
    log(`\n${colors.bold}Fixing npm cache permissions...${colors.reset}`);
    log(`Executing: ${fixCommand}`, colors.blue);
    
    const result = runCommand(fixCommand);
    if (result.success) {
      log(`✅ Successfully fixed npm cache permissions!`, colors.green);
      return true;
    } else {
      log(`❌ Failed to fix npm cache permissions. Please try running the command manually:`, colors.red);
      log(`   ${fixCommand}`, colors.blue);
      return false;
    }
  } else {
    log(`\n${colors.yellow}${colors.bold}To fix npm permissions, run:${colors.reset}`);
    log(`   ${fixCommand}`, colors.blue);
    log(`\nThen try running your npm command again.`, colors.yellow);
    return false;
  }
}

/**
 * Test npm installation after permissions are fixed
 */
function testNpmInstall() {
  log(`\n${colors.bold}Testing npm installation...${colors.reset}`);
  
  const testCommand = `npm install -g npm-cache-test --no-save`;
  const result = runCommand(testCommand);
  
  if (result.success) {
    log(`✅ npm is working correctly now!`, colors.green);
    // Clean up the test package
    runCommand(`npm uninstall -g npm-cache-test`, true);
    return true;
  } else {
    log(`❌ npm still has issues. Please try the manual fix command above.`, colors.red);
    return false;
  }
}

/**
 * The main function that orchestrates the fix
 */
function main() {
  log(`\n${colors.bold}NPM Permissions Fixer${colors.reset}`);
  log(`This script helps fix common npm cache permission issues`);
  
  const permissionsOk = checkNpmPermissions();
  
  if (!permissionsOk) {
    // Check for -y flag to auto-fix
    const autoFix = process.argv.includes('-y') || process.argv.includes('--yes');
    
    if (autoFix) {
      const fixed = fixNpmPermissions(true);
      if (fixed) {
        testNpmInstall();
      }
    } else {
      log(`\n${colors.yellow}Run this script with -y or --yes flag to automatically fix permissions:${colors.reset}`);
      log(`   node scripts/fix-npm-permissions.js --yes`, colors.blue);
      fixNpmPermissions(false);
    }
  } else {
    log(`\n${colors.green}${colors.bold}npm permissions look good!${colors.reset}`);
    log(`If you're still experiencing issues, try clearing the npm cache:`);
    log(`   npm cache clean --force`, colors.blue);
  }
}

// Run the script
main();
