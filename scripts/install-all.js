import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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

function logHeader(message) {
  log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  log(`${colors.bold}${colors.cyan}${message}${colors.reset}`);
  log(`${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
}

// Check if pnpm is available
function isPnpmAvailable() {
  try {
    execSync('pnpm --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if yarn is available
function isYarnAvailable() {
  try {
    execSync('yarn --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Helper to run commands safely
function runCommand(command, cwd = process.cwd(), description = '') {
  const displayCmd = description || command;
  log(`Running: ${displayCmd} in ${path.relative(projectRoot, cwd)}`, colors.blue);
  
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { 
        ...process.env,
        // Prevent npm postinstall recursion
        SKIP_POSTINSTALL: '1'
      }
    });
    log(`✅ ${displayCmd} completed successfully`, colors.green);
    return true;
  } catch (error) {
    log(`❌ ${displayCmd} failed: ${error.message}`, colors.red);
    return false;
  }
}

// Fix permissions using the permissions script
async function fixPermissions() {
  logHeader('Fixing Permissions');
  
  try {
    // Import and check cache first
    const permissionsFixer = await import('./fix-permissions.js');
    
    // Check if permissions were recently fixed
    const { isPermissionsCacheValid } = permissionsFixer;
    if (typeof isPermissionsCacheValid === 'function' && isPermissionsCacheValid()) {
      log('⚡ Permissions were recently fixed, skipping...', colors.green);
      return true;
    }
    
    // Run permission fixes
    const results = {
      npm: permissionsFixer.fixNpmPermissions(),
      pnpm: permissionsFixer.fixPnpmPermissions(), 
      yarn: permissionsFixer.fixYarnPermissions(),
      scripts: permissionsFixer.fixScriptPermissions()
    };
    
    const allFixed = Object.values(results).every(Boolean);
    
    // Update cache if all fixes succeeded
    if (allFixed && typeof permissionsFixer.updatePermissionsCache === 'function') {
      permissionsFixer.updatePermissionsCache();
    }
    
    return allFixed;
  } catch (error) {
    log('⚠️ Could not run permissions fixer automatically', colors.yellow);
    log('You may need to fix permissions manually', colors.yellow);
    return false;
  }
}

// Install dependencies for a specific directory
function installDependencies(targetDir, packageManager = 'npm') {
  if (!fs.existsSync(targetDir)) {
    log(`Directory ${targetDir} does not exist, skipping...`, colors.yellow);
    return false;
  }

  const packageJsonPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log(`No package.json found in ${targetDir}, skipping...`, colors.yellow);
    return false;
  }

  log(`Installing dependencies in ${path.relative(projectRoot, targetDir)}...`, colors.blue);

  let installCmd;
  switch (packageManager) {
    case 'pnpm':
      installCmd = 'pnpm install';
      break;
    case 'yarn':
      installCmd = 'yarn install';
      break;
    case 'npm':
    default:
      installCmd = 'npm install --legacy-peer-deps';
      break;
  }

  return runCommand(installCmd, targetDir, `${packageManager} install`);
}

// Install Python dependencies
function installPythonDependencies() {
  logHeader('Installing Python Dependencies');
  
  const backendPath = path.join(projectRoot, 'workstation', 'backend');
  const pythonDirs = [
    backendPath,
    path.join(backendPath, 'agentic_rag'),
    projectRoot // Root requirements.txt
  ];

  let success = true;

  for (const dir of pythonDirs) {
    const requirementsPath = path.join(dir, 'requirements.txt');
    
    if (fs.existsSync(requirementsPath)) {
      log(`Installing Python requirements from ${path.relative(projectRoot, dir)}...`, colors.blue);
      
      // Try with pip3 first, then pip
      const pipCommands = [
        'pip3 install -r requirements.txt',
        'pip install -r requirements.txt',
        'python3 -m pip install -r requirements.txt',
        'python -m pip install -r requirements.txt'
      ];

      let installed = false;
      for (const cmd of pipCommands) {
        if (runCommand(cmd, dir, 'Python requirements install')) {
          installed = true;
          break;
        }
      }

      if (!installed) {
        log(`❌ Failed to install Python requirements in ${dir}`, colors.red);
        success = false;
      }
    }
  }

  return success;
}

// Detect if we're running in a recursive postinstall
function isRunningFromPostinstall() {
  return process.env.npm_lifecycle_event === 'postinstall';
}

// Create a lock file to prevent recursive installations
function createLockFile() {
  const lockFile = path.join(projectRoot, '.install_lock');
  fs.writeFileSync(lockFile, Date.now().toString());
  return lockFile;
}

function removeLockFile(lockFile) {
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
  }
}

// Main installation function
async function installAll() {
  // Prevent recursive calls
  const lockFile = createLockFile();
  
  try {
    logHeader('Orpheus Engine Installation');
    
    // Step 1: Fix permissions
    log('Step 1: Fixing permissions...', colors.cyan);
    await fixPermissions();

  // Step 2: Determine package manager
  let packageManager = 'npm';
  if (isPnpmAvailable()) {
    packageManager = 'pnpm';
    log('Using pnpm as package manager', colors.green);
  } else if (isYarnAvailable()) {
    packageManager = 'yarn';
    log('Using yarn as package manager', colors.green);
  } else {
    log('Using npm as package manager', colors.green);
  }

  // Step 3: Install root dependencies
  log('Step 2: Installing root dependencies...', colors.cyan);
  const rootSuccess = installDependencies(projectRoot, packageManager);

  // Step 4: Install workstation dependencies
  log('Step 3: Installing workstation dependencies...', colors.cyan);
  const workstationDirs = [
    'workstation/frontend',
    'workstation/backend',
    'workstation/frontend/OEW-main'
  ];

  let workstationSuccess = true;
  for (const dir of workstationDirs) {
    const fullPath = path.join(projectRoot, dir);
    if (!installDependencies(fullPath, packageManager)) {
      workstationSuccess = false;
    }
  }

  // Step 5: Install Python dependencies
  log('Step 4: Installing Python dependencies...', colors.cyan);
  const pythonSuccess = installPythonDependencies();

  // Step 6: Summary
  logHeader('Installation Summary');
  
  const allSuccess = rootSuccess && workstationSuccess && pythonSuccess;
  
  if (allSuccess) {
    log('🎉 All installations completed successfully!', colors.green);
    showSummary(packageManager);
  } else {
    log('⚠️ Some installations failed. Check the output above for details.', colors.yellow);
    
    if (!rootSuccess) log('  - Root dependencies failed', colors.red);
    if (!workstationSuccess) log('  - Workstation dependencies failed', colors.red);
    if (!pythonSuccess) log('  - Python dependencies failed', colors.red);
  }
  
  // Clean up lock file
  removeLockFile(lockFile);
  
  return allSuccess;
}

// Provide a summary of what was installed
function showSummary(packageManager) {
  log('\n' + '='.repeat(60), colors.green);
  log('🎵 Orpheus Engine Dependencies Installed!', colors.green);
  log('='.repeat(60), colors.green);
  
  log(`\nPackage manager used: ${packageManager}`, colors.blue);
  log('\nTo start the application:', colors.blue);
  
  switch (packageManager) {
    case 'pnpm':
      log('  pnpm dev                  # Start development mode', colors.cyan);
      log('  pnpm start                # Start the application', colors.cyan);
      log('  pnpm run setup            # Run full setup process', colors.cyan);
      break;
    case 'yarn':
      log('  yarn dev                  # Start development mode', colors.cyan);
      log('  yarn start                # Start the application', colors.cyan);
      log('  yarn setup                # Run full setup process', colors.cyan);
      break;
    default:
      log('  npm run dev               # Start development mode', colors.cyan);
      log('  npm run start             # Start the application', colors.cyan);
      log('  npm run setup             # Run full setup process', colors.cyan);
      break;
  }
  
  log('\nFor more commands, check the scripts section in package.json', colors.blue);
}

// Export for use by other scripts
export { installAll, fixPermissions, installDependencies };

// Run the installation
if (import.meta.url === `file://${process.argv[1]}`) {
  installAll()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      log(`❌ Installation failed: ${err.message}`, colors.red);
      // Make sure to clean up the lock file even on error
      const lockFile = path.join(projectRoot, '.install_lock');
      removeLockFile(lockFile);
      process.exit(1);
    });
}
