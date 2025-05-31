#!/usr/bin/env node

/**
 * Script to update all submodules automatically
 * This script will:
 * 1. Initialize all submodules if not already initialized
 * 2. Update all submodules to their latest remote versions
 * 3. Commit the updates if there are changes
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const AUTO_COMMIT = true; // Set to false to disable auto-commit

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  bold: '\x1b[1m'
};

// Get current GitHub username from git config
function getCurrentGitUser() {
  try {
    const gitUser = execSync('git config --get user.name', { encoding: 'utf8' }).trim();
    const gitEmail = execSync('git config --get user.email', { encoding: 'utf8' }).trim();
    return { name: gitUser, email: gitEmail };
  } catch (error) {
    console.error(`${colors.red}Error getting git user:${colors.reset}`, error.message);
    return null;
  }
}

// Run a command and return its output or null if it fails
function execCommand(command, options = {}) {
  const defaultOptions = {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large outputs
  };

  try {
    return execSync(command, { ...defaultOptions, ...options });
  } catch (error) {
    console.error(`${colors.red}Error executing command:${colors.reset} ${command}`);
    if (error.stdout) console.error(`${colors.yellow}stdout:${colors.reset} ${error.stdout}`);
    if (error.stderr) console.error(`${colors.yellow}stderr:${colors.reset} ${error.stderr}`);
    return null;
  }
}

// Get all submodules in the repository
function getAllSubmodules() {
  console.log(`${colors.cyan}${colors.bold}Finding all submodules...${colors.reset}`);
  
  // First check for .gitmodules file
  const rootGitmodules = path.join(ROOT_DIR, '.gitmodules');
  const workstationGitmodules = path.join(ROOT_DIR, 'workstation', '.gitmodules');
  
  let gitmodulesPath = null;
  if (fs.existsSync(rootGitmodules)) {
    gitmodulesPath = rootGitmodules;
    console.log(`${colors.green}Found .gitmodules in root directory${colors.reset}`);
  } else if (fs.existsSync(workstationGitmodules)) {
    gitmodulesPath = workstationGitmodules;
    console.log(`${colors.green}Found .gitmodules in workstation directory${colors.reset}`);
  } else {
    console.log(`${colors.yellow}No .gitmodules file found - checking submodule status directly${colors.reset}`);
  }
  
  // Get status from git submodule command
  const submoduleStatus = execCommand('git submodule status', { stdio: 'pipe' });
  if (!submoduleStatus) {
    console.log(`${colors.yellow}No submodules found or error getting submodule status${colors.reset}`);
    return [];
  }
  
  const submoduleLines = submoduleStatus.trim().split('\n');
  const submodules = [];
  
  for (const line of submoduleLines) {
    if (line.trim()) {
      // Line format: [<status char>]<commit hash> <path> [(<branch>)]
      const parts = line.trim().substring(1).trim().split(' ');
      if (parts.length >= 2) {
        const path = parts[1];
        submodules.push(path);
      }
    }
  }

  console.log(`${colors.green}Found ${submodules.length} submodules:${colors.reset}`);
  submodules.forEach(sub => console.log(`  - ${sub}`));
  
  return submodules;
}

// Initialize all submodules
function initializeSubmodules() {
  console.log(`\n${colors.cyan}${colors.bold}Initializing all submodules...${colors.reset}`);
  const result = execCommand('git submodule update --init --recursive', { stdio: 'inherit' });
  if (result !== null) {
    console.log(`${colors.green}Submodules initialized successfully${colors.reset}`);
    return true;
  }
  return false;
}

// Update a single submodule to latest remote version
function updateSubmodule(submodulePath) {
  console.log(`\n${colors.cyan}Updating submodule: ${submodulePath}${colors.reset}`);
  
  // Full path to submodule
  const fullPath = path.join(ROOT_DIR, submodulePath);
  
  // Check if the directory exists
  if (!fs.existsSync(fullPath)) {
    console.log(`${colors.yellow}Submodule directory not found: ${fullPath}${colors.reset}`);
    return false;
  }
  
  // Store original directory
  const originalDir = process.cwd();
  
  try {
    // Change to submodule directory
    process.chdir(fullPath);
    
    // Get current branch or default to 'main'
    let branch = 'main';
    try {
      const remoteBranches = execCommand('git branch -r', { stdio: 'pipe' });
      if (remoteBranches) {
        // Try to find default branch priority: main > master > develop
        if (remoteBranches.includes('origin/main')) {
          branch = 'main';
        } else if (remoteBranches.includes('origin/master')) {
          branch = 'master';
        } else if (remoteBranches.includes('origin/develop')) {
          branch = 'develop';
        }
      }
    } catch (error) {
      // Stick with 'main' as default
    }
    
    // Fetch latest changes
    console.log(`Fetching latest changes...`);
    execCommand('git fetch origin', { stdio: 'pipe' });
    
    // Get current commit hash before update
    const oldCommit = execCommand('git rev-parse HEAD', { stdio: 'pipe' })?.trim();
    
    // Checkout the primary branch
    console.log(`Checking out ${branch} branch...`);
    execCommand(`git checkout ${branch}`, { stdio: 'pipe' });
    
    // Pull latest changes
    console.log(`Pulling latest changes...`);
    execCommand(`git pull origin ${branch}`, { stdio: 'pipe' });
    
    // Get new commit hash
    const newCommit = execCommand('git rev-parse HEAD', { stdio: 'pipe' })?.trim();
    
    // Check if the commit changed
    const updated = oldCommit !== newCommit;
    if (updated) {
      console.log(`${colors.green}Updated from ${oldCommit.substring(0, 7)} to ${newCommit.substring(0, 7)}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.blue}Already up-to-date at ${oldCommit.substring(0, 7)}${colors.reset}`);
      return false;
    }
    
  } catch (error) {
    console.error(`${colors.red}Error updating submodule ${submodulePath}:${colors.reset}`, error.message);
    return false;
  } finally {
    // Restore original directory
    process.chdir(originalDir);
  }
}

// Main function
async function main() {
  console.log(`${colors.bold}${colors.cyan}🔍 Orpheus Engine Submodule Updater${colors.reset}\n`);
  
  // Store original directory
  const originalDir = process.cwd();
  
  try {
    // Change to root directory
    process.chdir(ROOT_DIR);
    
    // Initialize all submodules first
    initializeSubmodules();
    
    // Get all submodules
    const submodules = getAllSubmodules();
    
    if (submodules.length === 0) {
      console.log(`${colors.yellow}No submodules found to update${colors.reset}`);
      return;
    }
    
    // Update each submodule
    console.log(`\n${colors.cyan}${colors.bold}Updating all submodules to latest versions...${colors.reset}`);
    let updatedCount = 0;
    
    for (const submodule of submodules) {
      const updated = updateSubmodule(submodule);
      if (updated) {
        // Stage the changes
        process.chdir(ROOT_DIR);
        execCommand(`git add ${submodule}`);
        updatedCount++;
      }
    }
    
    // Check if there are changes to commit
    if (updatedCount > 0) {
      process.chdir(ROOT_DIR);
      console.log(`\n${colors.green}Updated ${updatedCount} submodules successfully${colors.reset}`);
      
      if (AUTO_COMMIT) {
        // Commit the changes with a descriptive message
        const user = getCurrentGitUser();
        const commitMessage = `Update ${updatedCount} submodules to latest versions`;
        console.log(`\n${colors.cyan}Committing submodule updates...${colors.reset}`);
        execCommand(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
        console.log(`${colors.green}Submodule updates committed successfully${colors.reset}`);
      } else {
        console.log(`\n${colors.yellow}Changes are staged but not committed. Run 'git commit' to commit the changes.${colors.reset}`);
      }
    } else {
      console.log(`\n${colors.blue}All submodules are already up to date${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}Error updating submodules:${colors.reset}`, error.message);
    process.exit(1);
  } finally {
    // Restore original directory
    process.chdir(originalDir);
  }
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
  process.exit(1);
});
